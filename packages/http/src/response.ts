import { HttpHeader } from './header';

export class HttpResponse<T> {
  constructor(
    public readonly url: string,
    public readonly data: T,
    public readonly statusCode: number,
    public readonly header: HttpHeader,
    public readonly cookies: string[]
  ) { }
}