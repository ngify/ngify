import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpContextToken } from '../context';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

const isOk = (status: number) => status >= 200 && status < 300;

/** 携带此 token 的 post 请求，将使用 wx.uploadFile() 进行文件上传 */
export const WX_UPLOAD_FILE_TOKEN = new HttpContextToken(() => ({
  filePath: '',
  fileName: ''
}));

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
        const { filePath, fileName } = request.context.get(WX_UPLOAD_FILE_TOKEN);

        wx.uploadFile({
          url: request.urlWithParams,
          filePath: filePath,
          name: fileName,
          header: headers,
          formData: request.body,
          timeout: request.timeout,
          success: ({ data, statusCode }) => {
            const response = new HttpResponse(
              request.url,
              request.dataType === 'json' ? JSON.parse(data) : data,
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
        responseType: request.responseType,
        dataType: request.dataType as 'json' | '其他',
        timeout: request.timeout,
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
        complete: () => complete()
      });
    });
  }
}