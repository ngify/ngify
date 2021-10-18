export class HttpHeaders {
  /** lowercase name => values */
  private headers: Map<string, string[]> = new Map<string, string[]>();
  /** 以 lowercase name => normalized name 的形式维护一份 header name */
  private normalizedNames: Map<string, string> = new Map();

  constructor(headers?: string | { [name: string]: string | string[] }) {
    if (typeof headers === 'string') {
      headers.split('\n').forEach(line => {
        if (line.includes(':')) {
          const [name, value] = line.split(/:\s/, 2);
          const key = name.toLowerCase();
          const base = this.headers.get(key) || [];

          base.push(value);

          this.headers.set(key, base);
          this.setNormalizedName(key, name);
        }
      });
    } else if (headers) {
      Object.keys(headers).forEach(name => {
        const key = name.toLowerCase();
        const value = headers[name];

        this.headers.set(key, Array.isArray(value) ? value : [value]);
        this.setNormalizedName(key, name);
      });
    }
  }

  /**
   * 向现有的值中添加新的值
   * @param name
   * @param value
   * @returns
   */
  append(name: string, value: string | string[]): HttpHeaders {
    const clone = this.clone();
    const key = name.toLowerCase();
    const base = clone.headers.get(key) || [];

    base.push(...(Array.isArray(value) ? value : [value]));
    clone.headers.set(key, base);
    clone.setNormalizedName(key, name);

    return clone;
  }

  /**
   * 设置一个值并覆盖已有值
   * @param name
   * @param value
   * @returns
   */
  set(name: string, value: string | string[]): HttpHeaders {
    const clone = this.clone();
    const key = name.toLowerCase();

    clone.headers.set(key, Array.isArray(value) ? value : [value]);
    clone.setNormalizedName(key, name);

    return clone;
  }

  /**
   * 通过给定标头从现有值中删除一个值
   * @param name
   * @returns
   */
  delete(name: string): HttpHeaders {
    const clone = this.clone();
    const key = name.toLowerCase();

    clone.headers.delete(key);
    clone.normalizedNames.delete(key);

    return clone;
  }

  /**
   * 通过给定标头获取第一个值
   * @param name
   * @returns
   */
  get(name: string): string {
    const values = this.headers.get(name.toLowerCase());
    return values?.length > 0 ? values[0] : null;
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

  forEach(fn: (name: string, value: string[]) => void): void {
    this.headers.forEach((value, name) => fn(this.normalizedNames.get(name), value));
  }

  keys(): string[] {
    return Array.from(this.normalizedNames.values());
  }

  private clone(): HttpHeaders {
    const clone = new HttpHeaders();

    this.headers.forEach((value, name) => {
      clone.headers.set(name, [...value]);
      clone.normalizedNames.set(name, this.normalizedNames.get(name));
    });

    return clone;
  }

  /**
   * @param lowercase lowercase name
   * @param normalized normalized name
   */
  private setNormalizedName(lowercase: string, normalized: string) {
    this.normalizedNames.has(lowercase) || this.normalizedNames.set(lowercase, normalized);
  }

}
