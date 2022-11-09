import type { Property, SafeAny } from '@ngify/types';
import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';

/**
 * Safely assert whether the given value is an ArrayBuffer.
 * In some execution environments ArrayBuffer is not defined.
 */
function isArrayBuffer(value: SafeAny): value is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer;
}

/**
 * Safely assert whether the given value is a Blob.
 * In some execution environments Blob is not defined.
 */
function isBlob(value: SafeAny): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

/**
 * Safely assert whether the given value is a FormData instance.
 * In some execution environments FormData is not defined.
 */
function isFormData(value: SafeAny): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

/**
 * Safely assert whether the given value is a URLSearchParams instance.
 * In some execution environments URLSearchParams is not defined.
 */
function isUrlSearchParams(value: SafeAny): value is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams;
}

export class HttpRequest<T> {
  readonly body: T | null;
  readonly params!: HttpParams;
  readonly headers!: HttpHeaders;
  readonly context!: HttpContext;
  readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
  readonly urlWithParams: string;
  readonly reportProgress: boolean;
  readonly withCredentials: boolean;

  constructor(
    public readonly method: 'DELETE' | 'GET' | 'HEAD' | 'POST' | 'OPTIONS' | 'PUT' | 'PATCH',
    public readonly url: string,
    options?: {
      body?: T,
      params?: HttpParams | ConstructorParameters<typeof HttpParams>[0] | null,
      headers?: HttpHeaders | ConstructorParameters<typeof HttpHeaders>[0],
      context?: HttpContext,
      responseType?: HttpRequest<unknown>['responseType'],
      reportProgress?: boolean,
      withCredentials?: boolean,
    }
  ) {
    const { body, params, headers, context, responseType, reportProgress, withCredentials } = options || {};

    this.body = body !== undefined ? body : null;
    this.params = params instanceof HttpParams ? params : new HttpParams(params || undefined);
    this.headers = headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);
    this.context = context || new HttpContext();
    this.responseType = responseType || 'json';
    this.reportProgress = !!reportProgress;
    this.withCredentials = !!withCredentials;

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

  /**
   * Examine the body and attempt to infer an appropriate MIME type for it.
   * If no such type can be inferred, this method will return `null`.
   */
  detectContentTypeHeader(): string | null {
    if (this.body === null) {
      return null;
    }
    // FormData 主体依赖于浏览器的内容类型分配。
    if (isFormData(this.body)) {
      return null;
    }
    // Blob 通常有自己的内容类型。如果不是，则无法推断任何类型。
    if (isBlob(this.body)) {
      return this.body.type || null;
    }
    // 数组缓冲区的内容未知，因此无法推断类型。
    if (isArrayBuffer(this.body)) {
      return null;
    }
    // 从技术上讲，字符串可以是 JSON 数据的一种形式，但假设它们是纯字符串就足够安全了。
    if (typeof this.body === 'string') {
      return 'text/plain';
    }
    // `HttpUrlEncodedParams` 有自己的内容类型。
    if (this.body instanceof HttpParams) {
      return 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    // 数组、对象、布尔值和数字将被编码为 JSON。
    if (['object', 'number', 'boolean'].includes(typeof this.body)) {
      return 'application/json';
    }

    return null;
  }

  /**
   * Transform the free-form body into a serialized format suitable for transmission to the server.
   */
  serializeBody(): ArrayBuffer | Blob | FormData | string | null {
    if (this.body === null) {
      return null;
    }
    // 检查正文是否已经是序列化的形式。如果是，则直接返回。
    if (isArrayBuffer(this.body) || isBlob(this.body) || isFormData(this.body) || isUrlSearchParams(this.body) || typeof this.body === 'string') {
      return this.body;
    }
    // 检查 body 是否为 HttpUrlEncodedParams 的实例。
    if (this.body instanceof HttpParams) {
      return this.body.toString();
    }
    // 检查 body 是对象还是数组，如果是，则使用 JSON 进行序列化。
    if (typeof this.body === 'object' || typeof this.body === 'boolean' || Array.isArray(this.body)) {
      return JSON.stringify(this.body);
    }
    // 其他一切都可以使用 toString()。
    return (this.body as SafeAny).toString();
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
        reportProgress: update.reportProgress !== undefined ? update.reportProgress : this.reportProgress,
        withCredentials: update.withCredentials !== undefined ? update.withCredentials : this.withCredentials,
      }
    );
  }
}
