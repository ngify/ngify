import { HttpHeaders } from './headers';

export type HttpEvent<T> = HttpResponse<T>;

export abstract class HttpResponseBase {
  readonly ok: boolean;
  readonly url: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: HttpHeaders;

  constructor(options: {
    url?: string,
    status?: number,
    statusText?: string,
    headers?: HttpHeaders,
  }, defaultStatus: number = HttpStatusCode.Ok, defaultStatusText: string = 'OK') {
    this.url = options.url || null;
    this.status = options.status !== undefined ? options.status : defaultStatus;
    this.statusText = options.statusText || defaultStatusText;
    this.headers = options.headers || new HttpHeaders();
    this.ok = this.status >= 200 && this.status < 300;
  }
}

export class HttpResponse<T> extends HttpResponseBase {
  readonly body: T;

  constructor(options: {
    url?: string,
    body?: T | null,
    status?: number,
    statusText?: string;
    headers?: HttpHeaders,
  }) {
    super(options);
    this.body = options.body !== undefined ? options.body : null;
  }

  clone<D = T>(update: ConstructorParameters<typeof HttpResponse>[0] = {}): HttpResponse<D> {
    return new HttpResponse<D>({
      url: update.url || this.url,
      body: (update.body !== undefined ? update.body : this.body) as D,
      status: update.status || this.status,
      statusText: update.statusText || this.statusText,
      headers: update.headers || this.headers,
    });
  }
}

export class HttpErrorResponse extends HttpResponseBase implements Error {
  readonly name = 'HttpErrorResponse';
  readonly message: string;
  readonly error: any | null;
  override readonly ok = false;

  constructor(options: {
    error?: any;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
  }) {
    super(options, 0, 'Unknown Error');

    // 如果响应成功，那么这是一个解析错误。
    // 否则，这是某种协议级别的故障。请求在传输过程中失败或服务器返回了不成功的状态代码。
    if (this.status >= 200 && this.status < 300) {
      this.message = `Http failure during parsing for ${options.url || '(unknown url)'}`;
    } else {
      this.message = `Http failure response for ${options.url || '(unknown url)'}: ${options.status} ${options.statusText}`;
    }
    this.error = options.error || null;
  }
}

/**
 * Http status codes.
 * As per https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 * @publicApi
 */
export const enum HttpStatusCode {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,

  Ok = 200,
  Created = 201,
  Accepted = 202,
  NonAuthoritativeInformation = 203,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  MultiStatus = 207,
  AlreadyReported = 208,
  ImUsed = 226,

  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  UseProxy = 305,
  Unused = 306,
  TemporaryRedirect = 307,
  PermanentRedirect = 308,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  ProxyAuthenticationRequired = 407,
  RequestTimeout = 408,
  Conflict = 409,
  Gone = 410,
  LengthRequired = 411,
  PreconditionFailed = 412,
  PayloadTooLarge = 413,
  UriTooLong = 414,
  UnsupportedMediaType = 415,
  RangeNotSatisfiable = 416,
  ExpectationFailed = 417,
  ImATeapot = 418,
  MisdirectedRequest = 421,
  UnprocessableEntity = 422,
  Locked = 423,
  FailedDependency = 424,
  TooEarly = 425,
  UpgradeRequired = 426,
  PreconditionRequired = 428,
  TooManyRequests = 429,
  RequestHeaderFieldsTooLarge = 431,
  UnavailableForLegalReasons = 451,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511
}
