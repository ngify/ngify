import { Property } from '@ngify/types';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';

export class HttpRequest<T> {
  constructor(
    public readonly method: 'DELETE' | 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT',
    public readonly url: string,
    public readonly data: T,
    public readonly headers?: HttpHeaders,
    public readonly context?: HttpContext,
    public readonly responseType?: 'text' | 'arraybuffer',
    public readonly dataType?: 'text' | 'json',
    public readonly timeout?: number
  ) {
    this.headers ??= new HttpHeaders();
    this.context ??= new HttpContext();
  }

  clone<D = T>(update: Partial<Property<HttpRequest<unknown>>>): HttpRequest<D> {
    return new HttpRequest<D>(
      update.method || this.method,
      update.url || this.url,
      (update.data !== undefined ? update.data : this.data) as D,
      update.headers || this.headers,
      update.context || this.context,
      update.responseType || this.responseType,
      update.dataType || this.dataType,
      update.timeout || this.timeout
    );
  }
}