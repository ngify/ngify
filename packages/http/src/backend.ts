import { SafeAny } from '@ngify/types';
import { Observable } from 'rxjs';
import { HttpRequest } from './request';
import { HttpEvent } from './response';

export interface HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}

export interface HttpBackend extends HttpHandler {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>>;
}
