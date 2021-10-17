const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS = {
  '40': '@',
  '3A': ':',
  '24': '$',
  '2C': ',',
  '3B': ';',
  '2B': '+',
  '3D': '=',
  '3F': '?',
  '2F': '/',
};

/**
 * 使用 encodeURIComponent 进行编码后将特殊字符还原
 * @param value
 */
const standardEncoding = (value: string) => (
  encodeURIComponent(value).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s)
);

const toString = (value: string | number | boolean) => (
  value === null || value === undefined ? '' : `${value}`
);

export class HttpParams {
  private map: Map<string, string[]> = new Map<string, string[]>();

  constructor(source?: string | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }) {
    if (typeof source === 'string') {
      source.replace(/^\?/, '').split('&').forEach((param: string) => {
        const [key, value] = param.split(/=(.*)/, 2).map(o => o === undefined ? '' : decodeURIComponent(o));
        const values = this.map.get(key) || [];
        values.push(value);
        this.map.set(key, values);
      });
    } else if (source) {
      Object.keys(source).forEach(param => {
        const value = source[param];
        this.map.set(param, Array.isArray(value) ? value.map(toString) : [toString(value as string | number | boolean)]);
      });
    }
  }

  has(param: string): boolean {
    return this.map.has(param);
  }

  get(param: string): string | null {
    const values = this.map.get(param);
    return values?.length > 0 ? values[0] : null;
  }

  getAll(param: string): string[] | null {
    return this.map.get(param) || null;
  }

  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  append(param: string, value: string | number | boolean): HttpParams {
    const clone = this.clone();
    const values = clone.map.get(param) || [];

    values.push(toString(value));
    clone.map.set(param, values);

    return clone;
  }

  appendAll(params: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): HttpParams {
    const clone = this.clone();

    Object.keys(params).forEach(key => {
      const value = params[key];
      const values = clone.map.get(key) || [];

      values.push(...(Array.isArray(value) ? value.map(toString) : [toString(value as string | number | boolean)]));
      clone.map.set(key, values);
    });

    return clone;
  }

  set(param: string, value: string | number | boolean | ReadonlyArray<string | number | boolean>): HttpParams {
    const clone = this.clone();
    clone.map.set(param, Array.isArray(value) ? value.map(toString) : [toString(value as string | number | boolean)]);
    return clone;
  }

  delete(param: string, value?: string | number | boolean): HttpParams {
    const clone = this.clone();

    if (value !== undefined) {
      const values = (clone.map.get(param) || []).filter(o => o !== toString(value));
      values.length > 0 ? clone.map.set(param, values) : clone.map.delete(param);
    } else {
      clone.map.delete(param);
    }

    return clone;
  }

  toString(): string {
    return Array.from(this.keys()).map(key => (
      this.map.get(key).map(value => standardEncoding(key) + '=' + standardEncoding(value)).join('&')
    )).filter(param => param !== '').join('&');
  }

  private clone(): HttpParams {
    const clone = new HttpParams();

    this.map.forEach((value, name) => {
      clone.map.set(name, value);
    });

    return clone;
  }
}
