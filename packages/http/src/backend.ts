import { Observable } from 'rxjs';
import { HttpRequest } from './request';
import { HttpEvent } from './response';

export interface HttpHandler {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>>;
}

export interface HttpBackend extends HttpHandler {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>>;
}
