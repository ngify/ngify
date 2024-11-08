import { HttpHeaders, HttpInterceptorFn, HttpRequest, xsrfInterceptor, xsrfTokenExtractor } from '@ngify/http';
import { HttpClientTestingBackend } from '@ngify/http/testing';

function sampleTokenExtractor(token: string | null) {
  return () => token
}

describe('HttpXsrfInterceptor', () => {
  let backend: HttpClientTestingBackend;
  let interceptor: HttpInterceptorFn;

  beforeEach(() => {
    interceptor = xsrfInterceptor({
      headerName: 'X-XSRF-TOKEN',
      tokenExtractor: sampleTokenExtractor('test')
    });
    backend = new HttpClientTestingBackend();
  });

  it('applies XSRF protection to outgoing requests', () => {
    interceptor(new HttpRequest('POST', '/test', {}), backend.handle.bind(backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('test');
    req.flush({});
  });

  it('does not apply XSRF protection when request is a GET', () => {
    interceptor(new HttpRequest('GET', '/test'), backend.handle.bind(backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });

  it('does not apply XSRF protection when request is a HEAD', () => {
    interceptor(new HttpRequest('HEAD', '/test'), backend.handle.bind(backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });

  it('does not overwrite existing header', () => {
    interceptor(
      new HttpRequest(
        'POST',
        '/test',
        { headers: new HttpHeaders().set('X-XSRF-TOKEN', 'blah') },
      ),
      backend.handle.bind(backend),
    ).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('blah');
    req.flush({});
  });

  it('does not set the header for a null token', () => {
    interceptor = xsrfInterceptor({
      tokenExtractor: sampleTokenExtractor(null)
    });
    interceptor(new HttpRequest('POST', '/test'), backend.handle.bind(backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });

  afterEach(() => {
    backend.verify();
  });
});

describe('xsrfTokenExtractor', () => {
  let extractor: () => string | null;

  beforeEach(() => {
    globalThis.document = { cookie: 'XSRF-TOKEN=test' } as Document;
    extractor = xsrfTokenExtractor({ cookieName: 'XSRF-TOKEN' });
  });

  it('parses the cookie from document.cookie', () => {
    expect(extractor()).toEqual('test');
  });
});
