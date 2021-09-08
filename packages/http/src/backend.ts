import { Observable } from 'rxjs';
import { HttpRequest } from './request';
import { HttpResponse } from './response';

export interface HttpHandler {
  handle(request: HttpRequest): Observable<HttpResponse>;
}

export interface HttpBackend extends HttpHandler {
  handle(request: HttpRequest): Observable<HttpResponse>;
}
