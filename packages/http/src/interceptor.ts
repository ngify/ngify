import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpRequest } from './request';

export interface HttpInterceptor {
  intercept(req: HttpRequest, next: HttpHandler): Observable<any>;
}

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private interceptor: HttpInterceptor, private next: HttpHandler) { }

  handle(request: HttpRequest): Observable<any> {
    return this.interceptor.intercept(request, this.next);
  }
}