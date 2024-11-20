import type { SafeAny } from '@ngify/core';
import { concatMap, filter, map, Observable, of } from 'rxjs';
import type { HttpBackend, HttpHandler } from './backend';
import type { HttpContext } from './context';
import { HttpFeature, HttpFeatureKind } from './feature';
import type { HttpHeaders } from './headers';
import { HttpInterceptorFn, HttpInterceptorHandler, legacyInterceptorFnFactory } from './interceptor';
import type { HttpParams } from './params';
import { HttpRequest, HttpResponseType } from './request';
import { HttpResponse, type HttpEvent } from './response';
import { config } from './setup';

type Body = HttpRequest<SafeAny>['body'];
type Params = ConstructorParameters<typeof HttpParams>[0] | HttpParams | null;
type Headers = ConstructorParameters<typeof HttpHeaders>[0] | HttpHeaders;

interface RequestOptions {
  params?: Params;
  headers?: Headers;
  context?: HttpContext;
  reportProgress?: boolean;
  withCredentials?: boolean;
}

export class HttpClient {
  private handler: HttpHandler;

  constructor(...features: HttpFeature[]) {
    let interceptorFns: HttpInterceptorFn[] = config.interceptorFns;
    let backend: HttpBackend = config.backend;

    for (const { kind, value } of features) {
      switch (kind) {
        case HttpFeatureKind.Backend:
          backend = value;
          break;

        case HttpFeatureKind.Interceptors:
          interceptorFns = interceptorFns.concat(value);
          break;

        case HttpFeatureKind.LegacyInterceptors:
          interceptorFns = interceptorFns.concat(legacyInterceptorFnFactory(value));
          break;

        case HttpFeatureKind.XsrfProtection:
          interceptorFns.push(value);
          break;
      }
    }

    this.handler = new HttpInterceptorHandler(backend, interceptorFns);
  }

  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'body' }): Observable<R>;
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'events' }): Observable<HttpEvent<R>>;
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'response' }): Observable<HttpResponse<R>>;
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>;
  request(request: HttpRequest<SafeAny>, options: { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const events$ = of(request).pipe(
      concatMap((req: HttpRequest<unknown>) => this.handler.handle(req))
    );
    const res$ = events$.pipe(
      filter((event: HttpEvent<unknown>) => event instanceof HttpResponse)
    ) as Observable<HttpResponse<unknown>>;

    switch (options.observe) {
      case 'events':
        return events$;
      case 'response':
        return res$;
      default:
        return res$.pipe(map(response => response.body));
    }
  }

  delete<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'body', responseType?: 'json', body?: Body }): Observable<T>;
  delete(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer', body?: Body }): Observable<ArrayBuffer>;
  delete(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'blob', body?: Body }): Observable<Blob>;
  delete(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'text', body?: Body }): Observable<string>;
  delete<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'events', responseType?: 'json', body?: Body }): Observable<HttpEvent<T>>;
  delete(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer', body?: Body }): Observable<HttpEvent<ArrayBuffer>>;
  delete(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'blob', body?: Body }): Observable<HttpEvent<Blob>>;
  delete(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'text', body?: Body }): Observable<HttpEvent<string>>;
  delete<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'response', responseType?: 'json', body?: Body }): Observable<HttpResponse<T>>;
  delete(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer', body?: Body }): Observable<HttpResponse<ArrayBuffer>>;
  delete(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'blob', body?: Body }): Observable<HttpResponse<Blob>>;
  delete(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'text', body?: Body }): Observable<HttpResponse<string>>;
  delete(url: string, options: RequestOptions & { observe?: 'body' | 'events' | 'response', responseType?: HttpResponseType, body?: Body } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('DELETE', url, requestOptions), { observe });
  }

  get<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  get(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  get(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  get(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  get<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  get(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  get(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  get(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  get<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  get(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  get(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  get(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  get(url: string, options: RequestOptions & { responseType?: HttpResponseType, observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('GET', url, requestOptions), { observe });
  }

  head<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  head(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  head(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  head(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  head<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  head(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  head(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  head(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  head<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  head(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  head(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  head(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  head(url: string, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('HEAD', url, requestOptions), { observe });
  }

  options<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  options(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  options(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  options(url: string, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  options<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  options(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  options(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  options(url: string, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  options<T = SafeAny>(url: string, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  options(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  options(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  options(url: string, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  options(url: string, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('OPTIONS', url, requestOptions), { observe });
  }

  post<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  post<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  post<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  post(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  post(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('POST', url, {
      body,
      ...requestOptions
    }), { observe });
  }

  put<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  put<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  put<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  put(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  put(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('PUT', url, {
      body,
      ...requestOptions
    }), { observe });
  }

  patch<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType?: 'json' }): Observable<T>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'arraybuffer' }): Observable<ArrayBuffer>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'blob' }): Observable<Blob>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'body', responseType: 'text' }): Observable<string>;
  patch<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType?: 'json' }): Observable<HttpEvent<T>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'arraybuffer' }): Observable<HttpEvent<ArrayBuffer>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'blob' }): Observable<HttpEvent<Blob>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'events', responseType: 'text' }): Observable<HttpEvent<string>>;
  patch<T = SafeAny>(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType?: 'json' }): Observable<HttpResponse<T>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'arraybuffer' }): Observable<HttpResponse<ArrayBuffer>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'blob' }): Observable<HttpResponse<Blob>>;
  patch(url: string, body?: Body, options?: RequestOptions & { observe?: 'response', responseType: 'text' }): Observable<HttpResponse<string>>;
  patch(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { observe, ...requestOptions } = options;
    return this.request<SafeAny>(new HttpRequest('PATCH', url, {
      body,
      ...requestOptions
    }), { observe });
  }
}
