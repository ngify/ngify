import { Observable } from 'rxjs';
import { HttpHandlerFn, HttpInterceptorFn } from './interceptor';
import { HttpRequest } from './request';
import { HttpEvent } from './response';

export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';

function parseCookieValue(cookieStr: string, name: string): string | null {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(';')) {
    const eqIndex = cookie.indexOf('=');
    const [cookieName, cookieValue]: string[] =
      eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function xsrfTokenExtractor(options?: { cookieName?: string }): () => string | null {
  let lastCookieString: string = '';
  let lastToken: string | null = null;

  return () => {
    const cookieString = document?.cookie || '';
    if (cookieString !== lastCookieString) {
      lastToken = parseCookieValue(cookieString, options?.cookieName ?? XSRF_DEFAULT_COOKIE_NAME);
      lastCookieString = cookieString;
    }
    return lastToken;
  }
}

export function xsrfInterceptor(options?: { cookieName?: string; headerName?: string, tokenExtractor?: () => string | null }): HttpInterceptorFn {
  const tokenExtractor = options?.tokenExtractor ?? xsrfTokenExtractor(options);

  return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const lcUrl = req.url.toLowerCase();
    // Skip both non-mutating requests and absolute URLs.
    // Non-mutating requests don't require a token, and absolute URLs require special handling
    // anyway as the cookie set
    // on our origin is not the same as the token expected by another origin.
    if (
      req.method === 'GET' ||
      req.method === 'HEAD' ||
      lcUrl.startsWith('http://') ||
      lcUrl.startsWith('https://')
    ) {
      return next(req);
    }

    const token = tokenExtractor();
    const headerName = options?.headerName ?? XSRF_DEFAULT_HEADER_NAME;

    // Be careful not to overwrite an existing header of the same name.
    if (token !== null && !req.headers.has(headerName)) {
      req = req.clone({ headers: req.headers.set(headerName, token) });
    }

    return next(req);
  }
}
