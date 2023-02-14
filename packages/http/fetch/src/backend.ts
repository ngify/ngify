import type { HttpBackend, HttpRequest } from '@ngify/http';
import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@ngify/http';
import type { SafeAny } from '@ngify/types';
import { catchError, concatMap, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export const FETCH_TOKEN = new HttpContextToken<
  Omit<RequestInit, 'method' | 'headers' | 'body' | 'signal'>
>(() => ({}));

export class HttpFetchBackend implements HttpBackend {
  handle(request: HttpRequest<SafeAny>): Observable<HttpEvent<SafeAny>> {
    if (request.reportProgress) {
      throw Error('Fetch API does not currently support report progress');
    }

    let url: string;
    let status: number;
    let statusText: string;
    let headers: HttpHeaders;

    return of({ type: HttpEventType.Sent }).pipe(
      concatMap(() => fromFetch(request.urlWithParams, {
        method: request.method,
        headers: request.headers.keys().reduce((headers, name) => (
          headers[name] = request.headers.getAll(name)!.join(','),
          headers
        ), {} as { [key: string]: string }),
        body: request.serializeBody(),
        ...request.context.get(FETCH_TOKEN)
      })),
      switchMap(response => {
        url = response.url;
        status = response.status;
        statusText = response.statusText;
        headers = new HttpHeaders();

        response.headers.forEach((value, key) => headers.set(key, value));

        switch (request.responseType) {
          case 'arraybuffer':
            return from(response.arrayBuffer());

          case 'blob':
            return from(response.blob());

          case 'json':
            return from(response.json());

          case 'text':
            return from(response.text());
        }
      }),
      map(body => new HttpResponse({
        body,
        headers,
        status,
        statusText,
        url,
      })),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          return throwError(() => error);
        }

        return throwError(() => new HttpErrorResponse({
          url,
          error: error,
          status,
          statusText,
          headers,
        }));
      })
    );
  }

}
