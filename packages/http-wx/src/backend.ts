import type { SafeAny } from '@ngify/core';
import { HttpBackend, HttpContextToken, HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpHeaders, HttpJsonParseError, HttpRequest, HttpResponse, HttpSentEvent, HttpUploadProgressEvent } from '@ngify/http';
import { Observable, Observer } from 'rxjs';

type WxCallbackName = 'success' | 'fail' | 'complete';

type WxUploadFileOption = Omit<
  WechatMiniprogram.UploadFileOption,
  'url' | 'header' | 'name' | 'formData' | WxCallbackName
> & {
  /** 文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容 */
  fileName: string // 原本的 name 重命名为 fileName
};

type WxDownloadFileOption = Omit<
  WechatMiniprogram.DownloadFileOption,
  'url' | 'header' | WxCallbackName
>;

type WxRequestOption = Omit<
  WechatMiniprogram.RequestOption,
  'url' | 'header' | 'method' | 'data' | 'dataType' | 'responseType' | WxCallbackName
>;

/** Use this token to pass additional `wx.uploadFile()` parameter */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken<WxUploadFileOption>(() => ({ fileName: '', filePath: '' }));
/** Use this token to pass additional `wx.downloadFile()` parameter */
export const WX_DOWNLOAD_FILE_TOKEN = new HttpContextToken<WxDownloadFileOption>(() => ({}));
/** Use this token to pass additional `wx.request()` parameter */
export const WX_REQUSET_TOKEN = new HttpContextToken<WxRequestOption>(() => ({}));

export class HttpWxBackend implements HttpBackend {
  handle(req: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    if (req.method === 'POST' && req.context.has(WX_UPLOAD_FILE_TOKEN)) {
      return upload(req);
    }

    if (req.method === 'GET' && req.context.has(WX_DOWNLOAD_FILE_TOKEN)) {
      return download(req);
    }

    return request(req);
  }
}

/**
 * wx upload file
 * @param request
 */
function upload(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    // The response header event handler
    const onHeadersReceived: WechatMiniprogram.DownloadTaskOnHeadersReceivedCallback = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: request.url,
        headers: new HttpHeaders(header),
      }));
    };

    // The upload progress event handler
    const onUpProgressUpdate: WechatMiniprogram.UploadTaskOnProgressUpdateCallback = ({ totalBytesSent, totalBytesExpectedToSend }) => {
      observer.next({
        type: HttpEventType.UploadProgress,
        loaded: totalBytesSent,
        total: totalBytesExpectedToSend,
      } as HttpUploadProgressEvent);
    };

    const extraOptions = request.context.get(WX_UPLOAD_FILE_TOKEN);

    const task = wx.uploadFile({
      url: request.urlWithParams,
      name: extraOptions.fileName,
      header: buildHeaders(request),
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
            statusText,
          }));
          observer.complete();
        } else {
          observer.error(new HttpErrorResponse({
            url: request.url,
            error: body,
            status,
            statusText,
          }));
        }
      },
      fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          statusText: errMsg
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

/**
 * wx download file
 * @param request
 */
function download(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    // The response header event handler
    const onHeadersReceived: WechatMiniprogram.DownloadTaskOnHeadersReceivedCallback = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: request.url,
        headers: new HttpHeaders(header),
      }));
    };

    // The download progress event handler
    const onDownProgressUpdate: WechatMiniprogram.DownloadTaskOnProgressUpdateCallback = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      observer.next({
        type: HttpEventType.DownloadProgress,
        loaded: totalBytesWritten,
        total: totalBytesExpectedToWrite,
      } as HttpDownloadProgressEvent);
    };

    const task = wx.downloadFile({
      url: request.urlWithParams,
      header: buildHeaders(request),
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
            statusText,
          }));
        }
      },
      fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          statusText: errMsg
        }));
      },
      ...request.context.get(WX_DOWNLOAD_FILE_TOKEN)
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

/**
 * wx http request
 * @param request
 */
function request(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
  return new Observable((observer: Observer<HttpEvent<SafeAny>>) => {
    if (request.method === 'PATCH') {
      throw Error(`The http ${request.method} request is not supported yet`);
    }

    // The response header event handler
    const onHeadersReceived: WechatMiniprogram.RequestTaskOnHeadersReceivedCallback = ({ header }) => {
      observer.next(new HttpHeaderResponse({
        url: request.url,
        headers: new HttpHeaders(header),
      }));
    };

    const task = wx.request({
      url: request.urlWithParams,
      method: request.method,
      data: request.body,
      header: buildHeaders(request),
      // wx 从 responseType 中拆分出 dataType，这里需要处理一下
      responseType: request.responseType === 'arraybuffer' ? request.responseType : 'text',
      dataType: request.responseType === 'json' ? request.responseType : '其他',
      success: ({ data, header, statusCode: status, errMsg: statusText }) => {
        const ok = status >= 200 && status < 300;
        const headers = new HttpHeaders(header);

        if (ok) {
          observer.next(new HttpResponse({
            url: request.url,
            body: data,
            status,
            statusText,
            headers
          }));
          observer.complete();
        } else {
          observer.error(new HttpErrorResponse({
            url: request.url,
            error: data,
            status,
            statusText,
            headers,
          }));
        }
      },
      fail: ({ errMsg }: WechatMiniprogram.GeneralCallbackResult) => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          statusText: errMsg,
        }));
      },
      ...request.context.get(WX_REQUSET_TOKEN),
    });

    observer.next({ type: HttpEventType.Sent } as HttpSentEvent);

    if (request.reportProgress) {
      task.onHeadersReceived(onHeadersReceived);
    }

    return () => {
      if (request.reportProgress) {
        task.offHeadersReceived(onHeadersReceived);
      }

      task.abort();
    };
  });
}

function buildHeaders(request: HttpRequest<SafeAny>): { [key: string]: string } {
  return request.headers.keys().reduce((headers, name) => (
    headers[name] = request.headers.getAll(name)!.join(','),
    headers
  ), {} as { [key: string]: string });
}
