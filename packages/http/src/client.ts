import { concatMap, filter, map, Observable, of } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { WxHttpBackend } from './backends';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { HttpParams } from './params';
import { HttpRequest } from './request';
import { HttpEvent, HttpResponse } from './response';

type Body = HttpRequest<any>['body'];
type Params = ConstructorParameters<typeof HttpParams>[0] | HttpParams;
type Headers = ConstructorParameters<typeof HttpHeaders>[0] | HttpHeaders;
type ResponseType = HttpRequest<any>['responseType'];

interface RequestOptions {
  body?: Body;
  params?: Params;
  headers?: Headers;
  context?: HttpContext;
  responseType?: ResponseType;
  reportProgress?: boolean;
  withCredentials?: boolean;
};

export class HttpClient {
  private handler: HttpHandler;

  constructor(interceptors?: ReadonlyArray<HttpInterceptor>, backend?: HttpBackend) {
    if (!backend) {
      backend = new WxHttpBackend();
    }

    if (interceptors?.length > 0) {
      this.handler = interceptors.reduceRight((next, interceptor) => (
        new HttpInterceptorHandler(interceptor, next)
      ), backend);
    } else {
      this.handler = backend;
    }
  }

  request<R>(request: HttpRequest<any>, options?: { observe?: 'body' }): Observable<R>
  request<R>(request: HttpRequest<any>, options?: { observe?: 'events' }): Observable<HttpEvent<R>>
  request<R>(request: HttpRequest<any>, options?: { observe?: 'response' }): Observable<HttpResponse<R>>
  request<R>(request: HttpRequest<any>, options?: { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  request<R>(request: HttpRequest<any>, options: { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const events$ = of(request).pipe(concatMap((req: HttpRequest<any>) => this.handler.handle(req)));
    const res$ = events$.pipe(filter((event: HttpEvent<any>) => event instanceof HttpResponse)) as Observable<HttpResponse<any>>;

    switch (options.observe || 'body') {
      case 'body':
        return res$.pipe(map(response => response.body));
      case 'events':
        return events$;
      case 'response':
        return res$;
    }
  }

  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' }): Observable<R>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  delete<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  delete<R>(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('DELETE', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  get<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' }): Observable<R>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  get<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  get<R>(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('GET', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  head<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' }): Observable<R>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  head<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  head<R>(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('HEAD', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  options<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' }): Observable<R>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  options<R>(url: string, params?: Params, options?: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  options<R>(url: string, params?: Params, options: Omit<RequestOptions, 'params'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { body, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('OPTIONS', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  post<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' }): Observable<R>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  post<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  post<R>(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('POST', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  put<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' }): Observable<R>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  put<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  put<R>(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('PUT', url, {
      body,
      params,
      headers,
      context,
      responseType,
      reportProgress,
      withCredentials
    }), { observe });
  }

  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' }): Observable<R>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'events' }): Observable<HttpEvent<R>>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'response' }): Observable<HttpResponse<R>>
  patch<R>(url: string, body?: Body, options?: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' }): Observable<R | HttpEvent<R> | HttpResponse<R>>
  patch<R>(url: string, body?: Body, options: Omit<RequestOptions, 'body'> & { observe?: 'body' | 'events' | 'response' } = {}): Observable<R | HttpEvent<R> | HttpResponse<R>> {
    const { params, headers, context, responseType, reportProgress, withCredentials, observe } = options;
    return this.request<R>(new HttpRequest('PATCH', url, {
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
