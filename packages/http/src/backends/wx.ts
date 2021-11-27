import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpContextToken } from '../context';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaderResponse, HttpJsonParseError, HttpResponse, HttpSentEvent, HttpUploadProgressEvent } from '../response';

/** Use this token to pass additional `wx.uploadFile()` parameter */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string,
  fileName?: string,
  timeout?: number,
}>(() => ({}));

/** Use this token to pass additional `wx.downloadFile()` parameter */
export const WX_DOWNLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string,
  timeout?: number,
}>(() => ({}));

/** Use this token to pass additional `wx.request()` parameter */
export const WX_REQUSET_TOKEN = new HttpContextToken<{
  enableCache?: boolean,
  enableHttp2?: boolean,
  enableQuic?: boolean,
  timeout?: number
}>(() => ({}));

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<HttpEvent<any>>) => {
      if (request.method === 'PATCH') {
        throw Error('WeChat MiniProgram does not support http method as ' + request.method);
      }

      // The error event handler
      const onError = (error: WechatMiniprogram.GeneralCallbackResult) => {
        observer.error(new HttpErrorResponse({
          url: request.url,
          error: error
        }));
      };

      // The response header event handler
      const onHeadersReceived: WechatMiniprogram.OnHeadersReceivedCallback = ({ header }) => {
        observer.next(new HttpHeaderResponse({
          url: request.url,
          headers: new HttpHeaders(header)
        }));
      };

      // The upload progress event handler
      const onUpProgressUpdate: WechatMiniprogram.UploadTaskOnProgressUpdateCallback = ({ totalBytesSent, totalBytesExpectedToSend }) => {
        observer.next({
          type: HttpEventType.UploadProgress,
          loaded: totalBytesSent,
          total: totalBytesExpectedToSend
        } as HttpUploadProgressEvent);
      };

      // The download progress event handler
      const onDownProgressUpdate: WechatMiniprogram.DownloadTaskOnProgressUpdateCallback = ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        observer.next({
          type: HttpEventType.DownloadProgress,
          loaded: totalBytesWritten,
          total: totalBytesExpectedToWrite
        } as HttpDownloadProgressEvent);
      };

      // A http sent event
      const sent = { type: HttpEventType.Sent } as HttpSentEvent;

      const headers: { [key: string]: string } = {};
      request.headers.forEach((name, value) => {
        headers[name] = value.join(',');
      });

      // wx upload file
      if (request.method === 'POST' && request.context.has(WX_UPLOAD_FILE_TOKEN)) {
        const { filePath, fileName, timeout } = request.context.get(WX_UPLOAD_FILE_TOKEN);

        const task = wx.uploadFile({
          url: request.urlWithParams,
          filePath: filePath!,
          name: fileName!,
          header: headers,
          formData: request.body,
          timeout: timeout,
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
          fail: onError,
        });

        observer.next(sent);

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
      }

      // wx download file
      if (request.method === 'GET' && request.context.has(WX_DOWNLOAD_FILE_TOKEN)) {
        const { filePath, timeout } = request.context.get(WX_DOWNLOAD_FILE_TOKEN);

        const task = wx.downloadFile({
          url: request.urlWithParams,
          filePath: filePath,
          header: headers,
          timeout: timeout,
          success: ({ statusCode: status, errMsg: statusText, ...body }) => {
            const ok = status >= 200 && status < 300;

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
          fail: onError
        });

        observer.next(sent);

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
      }

      // wx http request
      const task = wx.request({
        url: request.urlWithParams,
        method: request.method,
        data: request.body,
        header: headers,
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
              headers
            }));
          }
        },
        fail: onError,
        ...request.context.get(WX_REQUSET_TOKEN)
      });

      observer.next(sent);

      return () => task.abort();
    });
  }
}