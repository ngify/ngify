import { HttpClient, HttpEvent, HttpFeatureKind, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, withInterceptors, withLegacyInterceptors, withXsrf } from '@ngify/http';
import { HttpClientTestingBackend } from '@ngify/http/testing';
import { Observable } from 'rxjs';

describe('provideHttpClient', () => {
  let controller: HttpClientTestingBackend

  beforeEach(() => {
    controller = new HttpClientTestingBackend();
    setCookie('');
  });

  afterEach(() => {
    controller.verify();
  });

  it('should configure HttpClient', () => {
    const client = new HttpClient({ kind: HttpFeatureKind.Backend, value: controller });
    client.get('/test', null, { responseType: 'text' }).subscribe();
    controller.expectOne('/test').flush('');
  });

  it('should enable legacy interceptors', () => {
    const client = new HttpClient(
      { kind: HttpFeatureKind.Backend, value: controller },
      withLegacyInterceptors([
        makeLegacyTagInterceptor('alpha'),
        makeLegacyTagInterceptor('beta'),
      ])
    );
    client.get('/test', null, { responseType: 'text' }).subscribe();
    const req = controller.expectOne('/test');
    expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
    req.flush('');
  });

  describe('interceptor functions', () => {
    it('should allow configuring interceptors', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withInterceptors([
          makeLiteralTagInterceptorFn('alpha'),
          makeLiteralTagInterceptorFn('beta'),
        ]),
      );
      client.get('/test', null, { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });

    it('should accept multiple separate interceptor configs', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withInterceptors([makeLiteralTagInterceptorFn('alpha')]),
        withInterceptors([makeLiteralTagInterceptorFn('beta')]),
      );
      client.get('/test', null, { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });

    it('should allow combination with legacy interceptors, before the legacy stack', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withInterceptors([makeLiteralTagInterceptorFn('functional')]),
        withLegacyInterceptors([makeLegacyTagInterceptor('legacy')]),
      );
      client.get('/test', null, { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('functional,legacy');
      req.flush('');
    });

    it('should allow combination with legacy interceptors, after the legacy stack', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withLegacyInterceptors([makeLegacyTagInterceptor('legacy')]),
        withInterceptors([makeLiteralTagInterceptorFn('functional')]),
      );
      client.get('/test', null, { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('legacy,functional');
      req.flush('');
    });
  });

  describe('xsrf protection', () => {
    it('should enable xsrf protection', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withXsrf()
      );

      setXsrfToken('abcdefg');

      client.post('/test', '', { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('abcdefg');
      req.flush('');
    });

    it('should allow customization of xsrf config', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller },
        withXsrf({
          cookieName: 'XSRF-CUSTOM-COOKIE',
          headerName: 'X-Custom-Xsrf-Header',
        })
      );

      setCookie('XSRF-CUSTOM-COOKIE=abcdefg');
      client.post('/test', '', { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.get('X-Custom-Xsrf-Header')).toEqual('abcdefg');
      req.flush('');
    });

    it('should disable xsrf protection by default', () => {
      const client = new HttpClient(
        { kind: HttpFeatureKind.Backend, value: controller }
      );

      setXsrfToken('abcdefg');

      client.post('/test', '', { responseType: 'text' }).subscribe();
      const req = controller.expectOne('/test');
      expect(req.request.headers.has('X-Custom-Xsrf-Header')).toBe(false);
      req.flush('');
    });
  });
});

function setXsrfToken(token: string): void {
  setCookie(`XSRF-TOKEN=${token}`);
}

function setCookie(cookie: string): void {
  Object.defineProperty(globalThis.document ??= {} as any, 'cookie', {
    get: () => cookie,
    configurable: true,
  });
}

function makeLegacyTagInterceptor(tag: string): HttpInterceptor {
  return {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(addTagToRequest(req, tag));
    }
  }
}

function makeLiteralTagInterceptorFn(tag: string): HttpInterceptorFn {
  return (req, next) => next(addTagToRequest(req, tag));
}

function addTagToRequest(req: HttpRequest<unknown>, tag: string): HttpRequest<unknown> {
  const prevTagHeader = req.headers.get('X-Tag') ?? '';
  const tagHeader = prevTagHeader.length > 0 ? prevTagHeader + ',' + tag : tag;

  return req.clone({
    headers: req.headers.set('X-Tag', tagHeader)
  });
}
