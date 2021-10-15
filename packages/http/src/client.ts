import { map, Observable } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { WxHttpBackend } from './backends';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { HttpParams } from './params';
import { HttpRequest } from './request';

type RequestOptions = {
  body?: any,
  params?: ConstructorParameters<typeof HttpParams>[0] | HttpParams,
  headers?: ConstructorParameters<typeof HttpHeaders>[0] | HttpHeaders,
  context?: HttpContext,
  responseType?: HttpRequest<any>['responseType'],
  dataType?: HttpRequest<any>['dataType'],
  timeout?: number,
};

export class HttpClient {
  private chain: HttpHandler;

  constructor(interceptors?: ReadonlyArray<HttpInterceptor>, backend?: HttpBackend) {
    if (!backend) {
      backend = new WxHttpBackend();
    }

    if (interceptors?.length > 0) {
      this.chain = interceptors.reduceRight((next, interceptor) => (
        new HttpInterceptorHandler(interceptor, next)
      ), backend);
    } else {
      this.chain = backend;
    }
  }

  request<R>(request: HttpRequest<any>): Observable<R> {
    return this.chain.handle(request).pipe(
      map(response => response.data)
    );
  }

  delete<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'DELETE',
      url,
      options.body,
      params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  get<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'GET',
      url,
      options.body,
      params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  head<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'HEAD',
      url,
      options.body,
      params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  options<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'OPTIONS',
      url,
      options.body,
      params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  post<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'POST',
      url,
      body,
      options.params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  put<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'PUT',
      url,
      body,
      options.params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  patch<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'PATCH',
      url,
      body,
      options.params,
      options.headers,
      options.context,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }
}
