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

    it('get request: observe response', done => {
      client.get('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('delete request', done => {
      client.delete('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('delete request: observe response', done => {
      client.delete('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('head request', done => {
      client.head('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('head request: observe response', done => {
      client.head('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('options request', done => {
      client.options('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('options request: observe response', done => {
      client.options('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('patch request', done => {
      client.patch('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('patch request: observe response', done => {
      client.patch('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('post request', done => {
      client.post('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('post request: observe response', done => {
      client.post('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });

    it('put request', done => {
      client.put('/test').subscribe(res => {
        expect((res as any)['msg']).toEqual('success');
        done();
      });
    });

    it('put request: observe response', done => {
      client.put('/test', null, { observe: 'response' }).subscribe(res => {
        expect(res).toBeInstanceOf(HttpResponse);
        done();
      });
    });
  });
});
