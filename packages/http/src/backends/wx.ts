import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpContextToken } from '../context';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpErrorResponse, HttpEvent, HttpResponse } from '../response';

/** use this token to pass additional `wx.uploadFile()` parameter */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string,
  fileName?: string,
  timeout?: number,
}>(() => ({}));

/** use this token to pass additional `wx.downloadFile()` parameter */
export const WX_DOWNLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string,
  timeout?: number,
}>(() => ({}));

/** use this token to pass additional `wx.request()` parameter */
export const WX_REQUSET_TOKEN = new HttpContextToken<{
  enableCache?: boolean,
  enableHttp2?: boolean,
  enableQuic?: boolean,
  timeout?: number
}>(() => ({}));

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<any>) => {
      if (request.method === 'PATCH') {
        throw Error('WeChat MiniProgram does not support http method as ' + request.method);
      }

      const complete = () => observer.complete();
      const error = (error: WechatMiniprogram.GeneralCallbackResult) => observer.error(new HttpErrorResponse({
        url: request.url,
        error: error
      }));

      const headers = {};
      request.headers.forEach((name, value) => {
        headers[name] = value.join(',');
      });

      if (request.method === 'POST' && request.context.has(WX_UPLOAD_FILE_TOKEN)) {
        const { filePath, fileName, timeout } = request.context.get(WX_UPLOAD_FILE_TOKEN);

        wx.uploadFile({
          url: request.urlWithParams,
          filePath: filePath,
          name: fileName,
          header: headers,
          formData: request.body,
          timeout: timeout,
          success: ({ data, statusCode, errMsg }) => {
            const response = new HttpResponse({
              url: request.url,
              body: (request.responseType === 'json' || request.responseType === undefined) ? JSON.parse(data) : data,
              status: statusCode,
              statusText: errMsg
            });

            response.ok ? observer.next(response) : observer.error(response);
          },
          fail: event => error(event),
          complete: () => complete()
        });

        return;
      }

      if (request.method === 'GET' && request.context.has(WX_DOWNLOAD_FILE_TOKEN)) {
        const { filePath, timeout } = request.context.get(WX_DOWNLOAD_FILE_TOKEN);

        wx.downloadFile({
          url: request.urlWithParams,
          filePath: filePath,
          header: headers,
          timeout: timeout,
          success: ({ statusCode, errMsg, ...body }) => {
            const response = new HttpResponse({
              url: request.url,
              body: body,
              status: statusCode,
              statusText: errMsg
            });

            response.ok ? observer.next(response) : observer.error(response);
          },
          fail: event => error(event),
          complete: () => complete()
        });

        return;
      }

      wx.request({
        url: request.urlWithParams,
        method: request.method,
        data: request.body,
        header: headers,
        // 不懂微信为什么要从 responseType 中拆分出 dataType，这里需要处理一下
        responseType: request.responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
        dataType: request.responseType === 'json' ? 'json' : '其他',
        success: ({ data, statusCode, header, errMsg }) => {
          const response = new HttpResponse({
            url: request.url,
            body: data,
            status: statusCode,
            statusText: errMsg,
            headers: new HttpHeaders(header)
          });

          response.ok ? observer.next(response) : observer.error(response);
        },
        fail: event => error(event),
        complete: () => complete(),
        ...request.context.get(WX_REQUSET_TOKEN)
      });
    });
  }
}