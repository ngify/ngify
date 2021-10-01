export class HttpHeaders {
  /** lowercase name => values */
  private headers: Map<string, string[]> = new Map<string, string[]>();
  /** 以 lowercase name => normalized name 的形式维护一份 header name */
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

  /**
   * 向现有的值中添加新的值
   * @param name
   * @param value
   * @returns
   */
  append(name: string, value: string | string[]): HttpHeaders {
    const key = name.toLowerCase();
    const base = this.headers.get(key) || [];

    if (!Array.isArray(value)) {
      value = [value];
    }

    base.push(...value);
    this.headers.set(key, base);
    this.normalizedNames.has(key) || this.normalizedNames.set(key, name);
    return this.clone();
  }

  /**
   * 通过给定标头从现有值中删除一个值
   * @param name
   * @returns
   */
  delete(name: string): HttpHeaders {
    const key = name.toLowerCase();
    this.headers.delete(key);
    this.normalizedNames.delete(key);
    return this.clone();
  }

  /**
   * 通过给定标头获取第一个值
   * @param name
   * @returns
   */
  get(name: string): string {
    const values = this.headers.get(name.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }

  /**
   * 通过给定标头获取所有值
   * @param name
   * @returns
   */
  getAll(name: string): string[] {
    return this.headers.get(name.toLowerCase()) || null;
  }

  /**
   * 检查给定标头是否存在
   * @param name
   * @returns
   */
  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  /**
   * 设置一个值并覆盖已有值
   * @param name
   * @param value
   * @returns
   */
  set(name: string, value: string | string[]): HttpHeaders {
    const key = name.toLowerCase();

    if (!Array.isArray(value)) {
      value = [value];
    }

    this.headers.set(key, value);
    this.normalizedNames.has(key) || this.normalizedNames.set(key, name);
    return this.clone();
  }

  forEach(fn: (name: string, value: string[]) => void): void {
    this.headers.forEach((value, name) => fn(this.normalizedNames.get(name), value));
  }

  keys(): IterableIterator<string> {
    return this.normalizedNames.values();
  }

  private clone(): HttpHeaders {
    const clone = new HttpHeaders();

    this.headers.forEach((value, name) => {
      clone.headers.set(name, value);
      clone.normalizedNames.set(name, this.normalizedNames.get(name));
    });

    return clone;
  }
}