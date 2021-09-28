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
}