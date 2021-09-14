import { HttpHeaders } from './headers';

export class HttpResponse<T> {
  constructor(
    public readonly url: string,
    public readonly data: T,
    public readonly statusCode: number,
    public readonly header: HttpHeaders,
    public readonly cookies: string[]
  ) { }
}