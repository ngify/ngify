import { HttpClient, HttpFeatureKind, setupHttpClient, withXsrfProtection } from '@ngify/http';
import { HttpClientTestingBackend } from '@ngify/http/testing';

describe('setupHttpClient', () => {
  let client: HttpClient = null!;
  let backend: HttpClientTestingBackend = null!;

  beforeEach(() => {
    backend = new HttpClientTestingBackend();

    setupHttpClient(
      { kind: HttpFeatureKind.Backend, value: backend },
      withXsrfProtection()
    );

    client = new HttpClient();
  });

  it('should be using global backend', () => new Promise<void>(done => {
    client.get('/test').subscribe((res) => {
      expect((res as any)['data']).toEqual('hello world');
      done();
    });
    backend.expectOne('/test').flush({ 'data': 'hello world' });
  }));

  it('should be using global xsrf protection', () => new Promise<void>(done => {
    globalThis.document = { cookie: 'XSRF-TOKEN=test' } as Document;
    client.post('/test').subscribe(() => done());
    const req = backend.expectOne('/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('test');
    req.flush({});
  }))
});
