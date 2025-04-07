export class HttpHeaders {
  /** lowercase name => values */
  private headers: Map<string, string[]> = new Map<string, string[]>();
  /** Maintain a copy of header name in the form of `lowercase name => normalized name` */
  private normalizedNames: Map<string, string> = new Map();

  constructor(headers?: string | { [name: string]: string | number | (string | number)[] } | Headers) {
    if (typeof headers === 'string') {
      headers.split('\n').forEach(line => {
        if (line.includes(':')) {
          const [name, value] = line.split(/:\s/, 2);
          const key = name.toLowerCase();
          this.addHeaderEntry(key, value);
          this.setNormalizedName(key, name);
        }
      });
    } else if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      this.headers = new Map<string, string[]>();
      headers.forEach((value: string, name: string) => {
        const key = name.toLowerCase();
        this.addHeaderEntry(key, value);
        this.setNormalizedName(key, name);
      });
    } else if (headers) {
      Object.entries(headers).forEach(([name, value]) => {
        const key = name.toLowerCase();
        const values = (Array.isArray(value) ? value : [value]).map(value => value?.toString() ?? '');
        this.headers.set(key, values);
        this.setNormalizedName(key, name);
      });
    }
  }

  /**
   * Add a new value to an existing values
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
   * Set a value and overwrite an existing value
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
   * Deletes a value from an existing value by a given header
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
   * Get the first value from the given header
   * @param name
   * @returns
   */
  get(name: string): string | null {
    const values = this.headers.get(name.toLowerCase());
    return values?.[0] || null;
  }

  /**
   * Get all values by given header
   * @param name
   * @returns
   */
  getAll(name: string): string[] | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  /**
   * Check if the given header is present
   * @param name
   * @returns
   */
  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  forEach(fn: (name: string, value: string[]) => void): void {
    this.headers.forEach((value, name) => fn(this.normalizedNames.get(name)!, value));
  }

  keys(): string[] {
    return Array.from(this.normalizedNames.values());
  }

  private clone(): HttpHeaders {
    const clone = new HttpHeaders();

    this.headers.forEach((value, name) => {
      clone.headers.set(name, [...value]);
      clone.normalizedNames.set(name, this.normalizedNames.get(name)!);
    });

    return clone;
  }

  /**
   * @param key lowercase name
   * @param normalized normalized name
   */
  private setNormalizedName(key: string, normalized: string) {
    if (!this.normalizedNames.has(key)) {
      this.normalizedNames.set(key, normalized);
    }
  }

  private addHeaderEntry(key: string, value: string) {
    if (this.headers.has(key)) {
      this.headers.get(key)!.push(value);
    } else {
      this.headers.set(key, [value]);
    }
  }
}
