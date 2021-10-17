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
      {
        body: options.body,
        params: params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  get<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'GET',
      url,
      {
        body: options.body,
        params: params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  head<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'HEAD',
      url,
      {
        body: options.body,
        params: params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  options<R>(url: string, params?: RequestOptions['params'], options: Omit<RequestOptions, 'params'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'OPTIONS',
      url,
      {
        body: options.body,
        params: params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  post<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'POST',
      url,
      {
        body: body,
        params: options.params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  put<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'PUT',
      url,
      {
        body: body,
        params: options.params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }

  patch<R>(url: string, body?: RequestOptions['body'], options: Omit<RequestOptions, 'body'> = {}): Observable<R> {
    return this.request<R>(new HttpRequest(
      'PATCH',
      url,
      {
        body: body,
        params: options.params,
        headers: options.headers,
        context: options.context,
        responseType: options.responseType,
      }
    ));
  }
}
