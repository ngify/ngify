import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpHeader } from '../header';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest): Observable<HttpResponse> {
    return new Observable((observer: Observer<any>) => {
      const header = {};
      for (const [name, value] of request.header.entries()) {
        header[name] = value.join(',');
      }

      wx.request({
        url: request.url,
        method: request.method,
        data: request.data,
        header: header,
        responseType: request.responseType,
        dataType: request.dataType as 'json' | '其他',
        timeout: request.timeout,
        success: res => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          if (ok) {
            observer.next(new HttpResponse(
              res.data,
              res.statusCode,
              new HttpHeader(res.header),
              res.cookies
            ));
          } else {
            observer.error(new HttpResponse(
              res.data,
              res.statusCode,
              new HttpHeader(res.header),
              res.cookies
            ));
          }
        },
        fail: ({ errMsg }) => {
          observer.error(errMsg);
        },
        complete: () => {
          observer.complete();
        }
      });
    });
  }
}