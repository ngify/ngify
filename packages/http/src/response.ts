import { Property } from '@ngify/types';
import { HttpHeaders } from './headers';

export class HttpResponse<T> {
  constructor(
    public readonly url: string,
    public readonly data: T,
    public readonly status: number,
    public readonly headers: HttpHeaders,
    public readonly cookies: string[]
  ) { }

  clone<D = T>(update: Partial<Property<HttpResponse<unknown>>>): HttpResponse<D> {
    return new HttpResponse<D>(
      update.url || this.url,
      (update.data !== undefined ? update.data : this.data) as D,
      update.status || this.status,
      update.headers || this.headers,
      update.cookies !== undefined ? update.cookies : this.cookies,
    );
  }
}