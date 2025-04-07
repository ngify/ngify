import type { SafeAny } from '@ngify/core';
import { HttpBackend, HttpContextToken, HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpHeaders, HttpJsonParseError, HttpRequest, HttpResponse, HttpSentEvent, HttpUploadProgressEvent } from '@ngify/http';
import { Observable, Observer } from 'rxjs';

type CallbackName = 'success' | 'fail' | 'complete';

type UniUploadFileOption = Omit<
  UniNamespace.UploadFileOption,
  'url' | 'header' | 'name' | 'formData' | CallbackName
> & {
  /** 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容 */
  fileName: string; // 原本的 name 重命名为 fileName
};

type UniDownloadFileOption = Omit<
  UniNamespace.DownloadFileOption,
  'url' | 'header' | CallbackName
>;

type UniRequestOption = Omit<
  UniNamespace.RequestOptions,
  'url' | 'header' | 'method' | 'data' | 'dataType' | 'responseType' | CallbackName
>;

/** Use this token to pass additional `wx.uploadFile()` parameter */
export const UNI_UPLOAD_FILE_TOKEN = new HttpContextToken<UniUploadFileOption>(() => ({ fileName: '', filePath: '' }));
/** Use this token to pass additional `wx.downloadFile()` parameter */
export const UNI_DOWNLOAD_FILE_TOKEN = new HttpContextToken<UniDownloadFileOption>(() => ({}));
/** Use this token to pass additional `wx.request()` parameter */
export const UNI_REQUSET_TOKEN = new HttpContextToken<UniRequestOption>(() => ({}));

export class HttpUniBackend implements HttpBackend {
  handle(req: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    if (req.method === 'POST' && req.context.has(UNI_UPLOAD_FILE_TOKEN)) {
      return doUpload(req);
    }

    if (req.method === 'GET' && req.context.has(UNI_DOWNLOAD_FILE_TOKEN)) {
      return doDownload(req);
    }

    return doRequest(req);
  }
}

function doUpload(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    // The response header event handler
    const onHeadersReceived: (result: SafeAny) => void = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: request.url,
        headers: new HttpHeaders(header)
      }));
    };

    // The upload progress event handler
    const onUpProgressUpdate: (result: UniApp.OnProgressUpdateResult) => void = ({ totalBytesSent, totalBytesExpectedToSend }) => {
      observer.next({
        type: HttpEventType.UploadProgress,
        loaded: totalBytesSent,
        total: totalBytesExpectedToSend
      } as HttpUploadProgressEvent);
    };

    const extraOptions = request.context.get(UNI_UPLOAD_FILE_TOKEN);

    const task = uni.uploadFile({
      url: request.urlWithParams,
      name: extraOptions.fileName,
      header: buildHeaders(request.headers),
      formData: request.body,
      success: ({ data, statusCode: status, errMsg: statusText }) => {
        let ok = status >= 200 && status < 300;
        let body = null;

        if (request.responseType === 'json' && typeof data === 'string' && data !== '') {
          try {
            body = JSON.parse(data);
          } catch (error) {
            if (ok) {
              ok = false;
              body = { error, text: body } as HttpJsonParseError;
            }
          }
        }

        if (ok) {
          observer.next(new HttpResponse({
            url: request.url,
            body,
            status,
            statusText
          }));
          observer.complete();
        } else {
          observer.error(new HttpErrorResponse({
            url: request.url,
            error: body,
            status,
            statusText
          }));
        }
      },
      fail: error => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          statusText: error.errMsg,
          error
        }));
      },
      ...extraOptions
    });

    observer.next({ type: HttpEventType.Sent } as HttpSentEvent);

    if (request.reportProgress) {
      task.onHeadersReceived(onHeadersReceived);
      task.onProgressUpdate(onUpProgressUpdate);
    }

    return () => {
      if (request.reportProgress) {
        task.offHeadersReceived(onHeadersReceived);
        task.offProgressUpdate(onUpProgressUpdate);
      }

      task.abort();
    };
  });
}

function doDownload(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    // The response header event handler
    const onHeadersReceived: (result: any) => void = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: request.url,
        headers: new HttpHeaders(header)
      }));
    };

    // The download progress event handler
    const onDownProgressUpdate: (result: UniApp.OnProgressDownloadResult) => void = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      observer.next({
        type: HttpEventType.DownloadProgress,
        loaded: totalBytesWritten,
        total: totalBytesExpectedToWrite
      } as HttpDownloadProgressEvent);
    };

    const task = uni.downloadFile({
      url: request.urlWithParams,
      header: buildHeaders(request.headers),
      success: ({ statusCode: status, errMsg: statusText, ...body }) => {
        const ok = status >= 200 && status < 300;

        if (ok) {
          observer.next(new HttpResponse({
            url: request.url,
            status,
            statusText,
            body
          }));
          observer.complete();
        } else {
          observer.error(new HttpErrorResponse({
            url: request.url,
            status,
            statusText
          }));
        }
      },
      fail: error => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          statusText: error.errMsg,
          error
        }));
      },
      ...request.context.get(UNI_DOWNLOAD_FILE_TOKEN)
    });

    observer.next({ type: HttpEventType.Sent } as HttpSentEvent);

    if (request.reportProgress) {
      task.onHeadersReceived(onHeadersReceived);
      task.onProgressUpdate(onDownProgressUpdate);
    }

    return () => {
      if (request.reportProgress) {
        task.offHeadersReceived(onHeadersReceived);
        task.offProgressUpdate(onDownProgressUpdate);
      }

      task.abort();
    };
  });
}

function doRequest(req: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    if (req.method === 'PATCH') {
      throw Error(`The http ${req.method} request is not supported yet`);
    }

    // The response header event handler
    const onHeadersReceived: (result: any) => void = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: req.url,
        headers: new HttpHeaders(header)
      }));
    };

    const task = uni.request({
      url: req.urlWithParams,
      method: req.method,
      data: req.body,
      header: buildHeaders(req.headers),
      // wx 从 responseType 中拆分出 dataType，这里需要处理一下
      responseType: req.responseType === 'arraybuffer' ? req.responseType : 'text',
      dataType: req.responseType,
      success: ({ data, header, statusCode: status, errMsg: statusText }) => {
        const ok = status >= 200 && status < 300;
        const headers = new HttpHeaders(header);

        if (ok) {
          observer.next(new HttpResponse({
            url: req.url,
            body: data,
            status,
            statusText,
            headers
          }));
          observer.complete();
        } else {
          observer.error(new HttpErrorResponse({
            url: req.url,
            error: data,
            status,
            statusText,
            headers
          }));
        }
      },
      fail: error => {
        observer.error(new HttpErrorResponse({
          url: req.url,
          statusText: error.errMsg,
          error
        }));
      },
      ...req.context.get(UNI_REQUSET_TOKEN)
    });

    observer.next({ type: HttpEventType.Sent } as HttpSentEvent);

    if (req.reportProgress) {
      task.onHeadersReceived(onHeadersReceived);
    }

    return () => {
      if (req.reportProgress) {
        task.offHeadersReceived(onHeadersReceived);
      }

      task.abort();
    };
  });
}

function buildHeaders(headers: HttpHeaders): { [key: string]: string } {
  return headers.keys().reduce<{ [key: string]: string }>((obj, name) => (
    obj[name] = headers.getAll(name)!.join(','),
    obj
  ), {});
}
