import type { SafeAny } from '@ngify/core';
import type { Observable } from 'rxjs';
import type { HttpRequest } from './request';
import type { HttpEvent } from './response';

export interface HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}

export interface HttpBackend extends HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}
