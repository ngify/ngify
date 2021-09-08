import { HttpHeader } from './header';

export class HttpResponse<T = any> {
  constructor(
    public readonly data: T,
    public readonly statusCode: number,
    public readonly header: HttpHeader,
    public readonly cookies: string[]
  ) { }
}