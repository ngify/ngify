import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    return new Observable((observer: Observer<any>) => {
      const headers = {};
      request.headers.forEach((name, value) => {
        headers[name] = value.join(',');
      });

      wx.request({
        url: request.url,
        method: request.method,
        data: request.data,
        header: headers,
        responseType: request.responseType,
        dataType: request.dataType as 'json' | '其他',
        timeout: request.timeout,
        success: ({ data, statusCode, header, cookies }) => {
          const ok = statusCode >= 200 && statusCode < 300;
          const response = new HttpResponse(
            request.url,
            data,
            statusCode,
            new HttpHeaders(header),
            cookies
          );

          ok ? observer.next(response) : observer.error(response);
        },
        fail: error => {
          observer.error(new HttpResponse(
            request.url,
            error,
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