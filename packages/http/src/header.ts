export class HttpHeader {
  private headers: Map<string, string[]> = new Map<string, string[]>();
  private normalizedNames: Map<string, string> = new Map();

  constructor(headers?: { [name: string]: string | string[] }) {
    if (headers) {
      Object.keys(headers).forEach(name => {
        let value = headers[name];

        if (Array.isArray(value)) {
          this.set(name, value);
        } else {
          this.set(name, value.split(/,\s/));
        }
      });
    }
  }

  append(name: string, value: string | string[]): HttpHeader {
    const key = name.toLowerCase();
    const base = this.headers.get(key) || [];

    base.push(...value);
    this.headers.set(key, base);
    return this;
  }

  delete(name: string) {
    this.headers.delete(name.toLowerCase());
    return this;
  }

  entries() {
    return this.headers.entries();
  }

  get(name: string) {
    const values = this.headers.get(name.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }

  getAll(name: string) {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string) {
    return this.headers.has(name.toLowerCase());
  }

  keys() {
    return this.headers.keys();
  }

  set(name: string, value: string | string[]): HttpHeader {
    if (!Array.isArray(value)) {
      value = [value];
    }

    this.headers.set(name.toLowerCase(), value);
    return this;
  }

  values() {
    return this.headers.values();
  }
}