import { Property } from '@ngify/types';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';

export class HttpRequest<T> {
  readonly urlWithParams: string;

  constructor(
    public readonly method: 'DELETE' | 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT' | 'PATCH',
    public readonly url: string,
    public readonly body?: T,
    public readonly params?: HttpParams,
    public readonly headers?: HttpHeaders,
    public readonly context?: HttpContext,
    public readonly responseType?: 'text' | 'arraybuffer',
    public readonly dataType: 'text' | 'json' = 'json',
    public readonly timeout?: number
  ) {
    this.params ??= new HttpParams();
    this.headers ??= new HttpHeaders();
    this.context ??= new HttpContext();

    const query = this.params.toString();
    if (query.length === 0) {
      this.urlWithParams = url;
    } else {
      const index = url.indexOf('?');
      // 这里需要处理三种情况：
      // 1. url 中没有 ?，则需要添加 ?
      // 2. url 中有 ?，则需要添加 &
      // 3. url 末尾是 ?，则什么都不需要添加
      const sep = index === -1 ? '?' : (index < url.length - 1 ? '&' : '');
      this.urlWithParams = url + sep + query;
    }
  }

  clone<D = T>(update: Partial<Property<HttpRequest<unknown>>>): HttpRequest<D> {
    return new HttpRequest<D>(
      update.method || this.method,
      update.url || this.url,
      (update.body !== undefined ? update.body : this.body) as D,
      update.params || this.params,
      update.headers || this.headers,
      update.context || this.context,
      update.responseType || this.responseType,
      update.dataType || this.dataType,
      update.timeout || this.timeout
    );
  }
}
