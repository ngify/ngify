import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpHeader } from '../header';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    return new Observable((observer: Observer<any>) => {
      const header = {};
      request.header.forEach((name, value) => {
        header[name] = value.join(',');
      });

      wx.request({
        url: request.url,
        method: request.method,
        data: request.data,
        header: header,
        responseType: request.responseType,
        dataType: request.dataType as 'json' | '其他',
        timeout: request.timeout,
        success: ({ data, statusCode, header, cookies }) => {
          const ok = statusCode >= 200 && statusCode < 300;
          const response = new HttpResponse(
            request.url,
            data,
            statusCode,
            new HttpHeader(header),
            cookies
          );

          ok ? observer.next(response) : observer.error(response);
        },
        fail: ({ errMsg }) => {
          observer.error(new HttpResponse(
            request.url,
            errMsg,
            0,
            null,
            null
          ));
        },
        complete: () => {
          observer.complete();
        }
      });
    });
  }
}