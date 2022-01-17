import { SafeAny } from '@ngify/types';
import { Observable } from 'rxjs';
import { HttpHandler } from './backend';
import { HttpRequest } from './request';
import { HttpEvent } from './response';

export interface HttpInterceptor {
  intercept(request: HttpRequest<SafeAny>, next: HttpHandler): Observable<HttpEvent<SafeAny>>;
}

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private interceptor: HttpInterceptor, private next: HttpHandler) { }

  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    return this.interceptor.intercept(request, this.next);
  }
}