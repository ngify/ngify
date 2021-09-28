export class HttpContextToken<T> {
  constructor(public readonly defaultValue: () => T) { }
}

export class HttpContext {
  private readonly map = new Map<HttpContextToken<unknown>, unknown>();

  set<T>(token: HttpContextToken<T>, value: T): HttpContext {
    this.map.set(token, value);
    return this;
  }

  get<T>(token: HttpContextToken<T>): T {
    if (!this.map.has(token)) {
      this.map.set(token, token.defaultValue());
    }
    return this.map.get(token) as T;
  }

  delete(token: HttpContextToken<unknown>): HttpContext {
    this.map.delete(token);
    return this;
  }

  keys(): IterableIterator<HttpContextToken<unknown>> {
    return this.map.keys();
  }
}
