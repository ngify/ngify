import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpRequest } from './request';
import { HttpResponse } from './response';

export interface HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpResponse<any>>;
}

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private interceptor: HttpInterceptor, private next: HttpHandler) { }

  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    return this.interceptor.intercept(request, this.next);
  }
}