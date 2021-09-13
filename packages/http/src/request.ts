import { HttpHeader } from './header';

export class HttpRequest<T> {
  constructor(
    public readonly method: 'DELETE' | 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT',
    public readonly url: string,
    public data: T,
    public header: HttpHeader,
    public readonly responseType?: 'text' | 'arraybuffer',
    public readonly dataType?: 'text' | 'json',
    public readonly timeout?: number
  ) { }
}