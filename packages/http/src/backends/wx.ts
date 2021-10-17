import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpContextToken } from '../context';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

const isOk = (status: number) => status >= 200 && status < 300;

/** 使用此 token 传递额外的 wx.uploadFile() 参数 */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken<{
  filePath?: string,
  fileName?: string,
  timeout?: number,
}>(() => ({}));

/** 使用此 token 传递额外的 wx.request() 参数 */
export const WX_REQUSET_TOKEN = new HttpContextToken<{
  enableCache?: boolean,
  enableHttp2?: boolean,
  enableQuic?: boolean,
  timeout?: number
}>(() => ({}));

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    return new Observable((observer: Observer<any>) => {
      if (request.method === 'PATCH') {
        throw Error('WeChat MiniProgram does not support http method as ' + request.method);
      }

      const complete = () => observer.complete();
      const error = (error: any) => observer.error(new HttpResponse(
        request.url,
        error,
        0,
        null,
        null
      ));

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
          success: ({ data, statusCode }) => {
            const response = new HttpResponse(
              request.url,
              (request.responseType === 'json' || request.responseType === undefined) ? JSON.parse(data) : data,
              statusCode,
              new HttpHeaders(),
              null
            );

            isOk(statusCode) ? observer.next(response) : observer.error(response);
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
        success: ({ data, statusCode, header, cookies }) => {
          const response = new HttpResponse(
            request.url,
            data,
            statusCode,
            new HttpHeaders(header),
            cookies
          );

          isOk(statusCode) ? observer.next(response) : observer.error(response);
        },
        fail: event => error(event),
        complete: () => complete(),
        ...request.context.get(WX_REQUSET_TOKEN)
      });
    });
  }
}