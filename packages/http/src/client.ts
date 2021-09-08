import { map, Observable } from 'rxjs';
import { HttpResponse } from '.';
import { HttpBackend, HttpHandler } from './backend';
import { WxHttpBackend } from './backends';
import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { HttpRequest } from './request';

export class HttpClient {
  private chain: HttpHandler;

  constructor(interceptors?: HttpInterceptor[], backend?: HttpBackend) {
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

  request<R>(request: HttpRequest<any>): Observable<HttpResponse<R>> {
    return this.chain.handle(request).pipe(
      map(response => response.data)
    );
  }

  delete<R>(url: string, options: {
    data?: HttpRequest<any>['data'],
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'DELETE',
      url,
      options.data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  get<R>(url: string, options: {
    data?: HttpRequest<any>['data'],
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'GET',
      url,
      options.data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  head<R>(url: string, options: {
    data?: HttpRequest<any>['data'],
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'HEAD',
      url,
      options.data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  options<R>(url: string, options: {
    data?: HttpRequest<any>['data'],
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'OPTIONS',
      url,
      options.data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  post<R>(url: string, data?: HttpRequest<any>['data'], options: {
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'POST',
      url,
      data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }

  put<R>(url: string, data?: HttpRequest<any>['data'], options: {
    header?: HttpRequest<any>['header'],
    responseType?: HttpRequest<any>['responseType'],
    dataType?: HttpRequest<any>['dataType'],
    timeout?: HttpRequest<any>['timeout']
  } = {}) {
    return this.request<R>(new HttpRequest(
      'PUT',
      url,
      data,
      options.header,
      options.responseType,
      options.dataType,
      options.timeout,
    ));
  }
}
