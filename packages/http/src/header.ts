export class HttpHeader {
  private headers: Map<string, string[]> = new Map<string, string[]>();
  /** lowercase name => normalized name */
  private normalizedNames: Map<string, string> = new Map();

  constructor(headers?: { [name: string]: string | string[] }) {
    headers && Object.keys(headers).forEach(name => {
      let value = headers[name];

      if (Array.isArray(value)) {
        this.set(name, value);
      } else {
        this.set(name, value.split(/,[\s]?/));
      }
    });
  }

  append(name: string, value: string | string[]): HttpHeader {
    const key = name.toLowerCase();
    const base = this.headers.get(key) || [];

    base.push(...value);
    this.headers.set(key, base);
    this.normalizedNames.has(key) || this.normalizedNames.set(key, name);
    return this;
  }

  delete(name: string) {
    const key = name.toLowerCase();
    this.headers.delete(key);
    this.normalizedNames.delete(key);
    return this;
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

  forEach(fn: (name: string, value: string[]) => void) {
    for (const [name, value] of this.headers.entries()) {
      fn(this.normalizedNames.get(name), value);
    }
  }

  keys() {
    return this.normalizedNames.values();
  }

  values() {
    return this.headers.values();
  }

  set(name: string, value: string | string[]): HttpHeader {
    const key = name.toLowerCase();

    if (!Array.isArray(value)) {
      value = [value];
    }

    this.headers.set(key, value);
    this.normalizedNames.has(key) || this.normalizedNames.set(key, name);
    return this;
  }
}