import { Property } from '@ngify/types';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';

export class HttpRequest<T> {
  readonly body: T;
  readonly params: HttpParams;
  readonly headers: HttpHeaders;
  readonly context: HttpContext;
  readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
  readonly urlWithParams: string;

  constructor(
    public readonly method: 'DELETE' | 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT' | 'PATCH',
    public readonly url: string,
    options?: {
      body?: T,
      params?: HttpParams | ConstructorParameters<typeof HttpParams>[0],
      headers?: HttpHeaders | ConstructorParameters<typeof HttpHeaders>[0],
      context?: HttpContext,
      responseType?: HttpRequest<unknown>['responseType'],
    }
  ) {
    const { body, params, headers, context, responseType } = options || {};

    this.body = body !== undefined ? body : null;
    this.params = params instanceof HttpParams ? params : new HttpParams(params);
    this.headers = headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);
    this.context = context || new HttpContext();
    this.responseType = responseType || 'json';

    const query = this.params.toString();
    if (query.length === 0) {
      this.urlWithParams = url;
    } else {
      // 这里需要处理三种情况：
      // 1. url 中没有 ?，则需要添加 ?
      // 2. url 中有 ?，则需要添加 &
      // 3. url 末尾是 ?，则什么都不需要添加
      const index = url.indexOf('?');
      const sep = index === -1 ? '?' : (index < url.length - 1 ? '&' : '');
      this.urlWithParams = url + sep + query;
    }
  }

  clone<D = T>(update: Partial<Property<HttpRequest<unknown>>> = {}): HttpRequest<D> {
    return new HttpRequest<D>(
      update.method || this.method,
      update.url || this.url,
      {
        body: (update.body !== undefined ? update.body : this.body) as D,
        params: update.params || this.params,
        headers: update.headers || this.headers,
        context: update.context || this.context,
        responseType: update.responseType || this.responseType,
      }
    );
  }
}
