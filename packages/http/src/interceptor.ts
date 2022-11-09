import type { SafeAny } from '@ngify/types';
import type { Observable } from 'rxjs';
import type { HttpHandler } from './backend';
import type { HttpRequest } from './request';
import type { HttpEvent } from './response';

export interface HttpInterceptor {
  intercept(request: HttpRequest<SafeAny>, next: HttpHandler): Observable<HttpEvent<SafeAny>>;
}

export class HttpInterceptorHandler implements HttpHandler {
  constructor(private interceptor: HttpInterceptor, private next: HttpHandler) { }

  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    return this.interceptor.intercept(request, this.next);
  }
}