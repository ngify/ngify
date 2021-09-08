import { Observable } from 'rxjs';
import { HttpRequest } from './request';
import { HttpResponse } from './response';

export interface HttpHandler {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>>;
}

export interface HttpBackend extends HttpHandler {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>>;
}
