import { Observable, of } from 'rxjs';
import { HttpBackend } from '../src/backend';
import { HttpClient } from '../src/client';
import { HttpRequest } from '../src/request';
import { HttpResponse } from '../src/response';

describe('HttpClient', () => {
  let client: HttpClient = null!;
  let backend: HttpBackend = null!;

  beforeEach(() => {
    backend = new class implements HttpBackend {
      handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
        const response = new HttpResponse({
          url: request.url,
          body: { code: 0, msg: 'success', data: {} },
          status: 200,
        });

        return of(response);
      }
    };

    client = new HttpClient(null, backend);
  });

  describe('makes a basic request', () => {
    it('get request', done => {
      client.get('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('delete request', done => {
      client.delete('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('head request', done => {
      client.head('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('options request', done => {
      client.options('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('patch request', done => {
      client.patch('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('post request', done => {
      client.post('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('put request', done => {
      client.put('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });
  });
});
