import { Observable, Observer } from 'rxjs';
import { HttpBackend } from '../backend';
import { HttpHeaders } from '../headers';
import { HttpRequest } from '../request';
import { HttpResponse } from '../response';

const isOk = (statusCode: number) => statusCode >= 200 && statusCode < 300;

export class WxHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    return new Observable((observer: Observer<any>) => {
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

      if (request.method === 'UPLOAD') {
        const { filePath, fileName } = request.data;

        delete request.data.filePath;
        delete request.data.fileName;

        wx.uploadFile({
          url: request.url,
          filePath: filePath,
          name: fileName,
          header: headers,
          formData: request.data,
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
        url: request.url,
        method: request.method,
        data: request.data,
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