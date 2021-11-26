import { Observable } from 'rxjs';
import { HttpBackend } from '../src/backend';
import { HttpClient } from '../src/client';
import { setupConfig } from '../src/config';
import { HttpRequest } from '../src/request';
import { HttpEvent, HttpEventType, HttpResponse } from '../src/response';

describe('HttpConfig', () => {
  let client: HttpClient = null!;
  let backend: HttpBackend = null!;

  beforeEach(() => {
    backend = new class implements HttpBackend {
      handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
        return new Observable(observer => {
          const response = new HttpResponse({
            url: request.url,
            body: { code: 0, msg: 'success', data: {} },
            status: 200,
          });

          observer.next({ type: HttpEventType.Sent });
          observer.next(response);
        });
      }
    };

    setupConfig({ backend });

    client = new HttpClient();
  });

  describe('makes a basic request', () => {
    it('get request', done => {
      client.get('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });
  });
});
