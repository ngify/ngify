import { SafeAny } from '@ngify/types';
import { concatMap, filter, map, Observable, of } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { HttpXhrBackend } from './backends';
import { config } from './config';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { HttpParams } from './params';
import { HttpRequest } from './request';
import { HttpEvent, HttpResponse } from './response';

type Body = HttpRequest<SafeAny>['body'];
type Params = ConstructorParameters<typeof HttpParams>[0] | HttpParams | null;
type Headers = ConstructorParameters<typeof HttpHeaders>[0] | HttpHeaders;
type ResponseType = HttpRequest<SafeAny>['responseType'];

interface RequestOptions<T extends ResponseType = ResponseType> {
  body?: Body;
  params?: Params;
  headers?: Headers;
  context?: HttpContext;
  responseType?: T;
  reportProgress?: boolean;
  withCredentials?: boolean;
}

export class HttpClient {
  private handler: HttpHandler;

  constructor(interceptors?: ReadonlyArray<HttpInterceptor> | null, backend?: HttpBackend) {
    if (!backend) {
      backend = config.backend ?? new HttpXhrBackend();
    }

    if (interceptors) {
      this.handler = interceptors.reduceRight((next, interceptor) => (
        new HttpInterceptorHandler(interceptor, next)
      ), backend);
    } else {
      this.handler = backend;
    }
  }

  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'body' }): Observable<R>
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'events' }): Observable<HttpEvent<R>>
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'response' }): Observable<HttpResponse<R>>
  request<R>(request: HttpRequest<SafeAny>, options?: { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  request(request: HttpRequest<SafeAny>, options: { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const events$ = of(request).pipe(concatMap((req: HttpRequest<SafeAny>) => this.handler.handle(req)));
    const res$ = events$.pipe(filter((event: HttpEvent<SafeAny>) => event instanceof HttpResponse)) as Observable<HttpResponse<SafeAny>>;

    switch (options.observe || 'body') {
      case 'body':
        return res$.pipe(map(response => response.body));
      case 'events':
        return events$;
      case 'response':
        return res$;
    }
  }

  delete(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'body' }): Observable<ArrayBuffer>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'body' }): Observable<Blob>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'body' }): Observable<string>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<SafeAny>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  delete(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<R>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  delete(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('DELETE', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  get(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'body' }): Observable<ArrayBuffer>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'body' }): Observable<Blob>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'body' }): Observable<string>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<SafeAny>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  get(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<R>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  get(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('GET', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  head(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'body' }): Observable<ArrayBuffer>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'body' }): Observable<Blob>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'body' }): Observable<string>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<SafeAny>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  head(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<R>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  head(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('HEAD', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  options(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'body' }): Observable<ArrayBuffer>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'arraybuffer'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'body' }): Observable<Blob>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'blob'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'body' }): Observable<string>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'text'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<SafeAny>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  options(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'body' }): Observable<R>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions<'json'>, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  options(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('OPTIONS', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  post(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'body' }): Observable<ArrayBuffer>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'body' }): Observable<Blob>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'body' }): Observable<string>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<SafeAny>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  post(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<R>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  post(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('POST', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  put(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'body' }): Observable<ArrayBuffer>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'body' }): Observable<Blob>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'body' }): Observable<string>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<SafeAny>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  put(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<R>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  put(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('PUT', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  patch(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'body' }): Observable<ArrayBuffer>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<ArrayBuffer>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'arraybuffer'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<ArrayBuffer>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'body' }): Observable<Blob>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<Blob>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'blob'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<Blob>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'body' }): Observable<string>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<string>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'text'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<string>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<SafeAny>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<SafeAny>>
  patch(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<SafeAny>>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'body' }): Observable<R>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions<'json'>, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  patch(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<SafeAny> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<SafeAny>(new HttpRequest('PATCH', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }
}
