import { HttpClient, HttpEvent, HttpFeatureKind, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest, withInterceptors, withLegacyInterceptors } from '@ngify/http';
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

  it('withLegacyInterceptors() should enable legacy interceptors', () => {
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

  // describe('xsrf protection', () => {
  //   it('should enable xsrf protection by default', () => {
  //     TestBed.configureTestingModule({
  //       providers: [
  //         provideHttpClient(),
  //         provideHttpClientTesting(),
  //         { provide: PLATFORM_ID, useValue: 'test' },
  //       ],
  //     });

  //     setXsrfToken('abcdefg');

  //     TestBed.inject(HttpClient).post('/test', '', { responseType: 'text' }).subscribe();
  //     const req = controller.expectOne('/test');
  //     expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('abcdefg');
  //     req.flush('');
  //   });

  //   it('withXsrfConfiguration() should allow customization of xsrf config', () => {
  //     TestBed.configureTestingModule({
  //       providers: [
  //         provideHttpClient(
  //           withXsrfConfiguration({
  //             cookieName: 'XSRF-CUSTOM-COOKIE',
  //             headerName: 'X-Custom-Xsrf-Header',
  //           }),
  //         ),
  //         provideHttpClientTesting(),
  //         { provide: PLATFORM_ID, useValue: 'test' },
  //       ],
  //     });

  //     setCookie('XSRF-CUSTOM-COOKIE=abcdefg');
  //     TestBed.inject(HttpClient).post('/test', '', { responseType: 'text' }).subscribe();
  //     const req = controller.expectOne('/test');
  //     expect(req.request.headers.get('X-Custom-Xsrf-Header')).toEqual('abcdefg');
  //     req.flush('');
  //   });

  //   it('withNoXsrfProtection() should disable xsrf protection', () => {
  //     TestBed.configureTestingModule({
  //       providers: [
  //         provideHttpClient(withNoXsrfProtection()),
  //         provideHttpClientTesting(),
  //         { provide: PLATFORM_ID, useValue: 'test' },
  //       ],
  //     });
  //     setXsrfToken('abcdefg');

  //     TestBed.inject(HttpClient).post('/test', '', { responseType: 'text' }).subscribe();
  //     const req = controller.expectOne('/test');
  //     expect(req.request.headers.has('X-Custom-Xsrf-Header')).toBeFalse();
  //     req.flush('');
  //   });

  //   it('should error if withXsrfConfiguration() and withNoXsrfProtection() are combined', () => {
  //     expect(() => {
  //       TestBed.configureTestingModule({
  //         providers: [
  //           provideHttpClient(withNoXsrfProtection(), withXsrfConfiguration({})),
  //           provideHttpClientTesting(),
  //           { provide: PLATFORM_ID, useValue: 'test' },
  //         ],
  //       });
  //     }).toThrow();
  //   });
  // });
});

function setXsrfToken(token: string): void {
  setCookie(`XSRF-TOKEN=${token}`);
}

function setCookie(cookie: string): void {
  cookie
  // Object.defineProperty(TestBed.inject(DOCUMENT), 'cookie', {
  //   get: () => cookie,
  //   configurable: true,
  // });
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
