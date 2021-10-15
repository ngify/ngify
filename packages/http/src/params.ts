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
function standardEncoding(value: string): string {
  return encodeURIComponent(value).replace(STANDARD_ENCODING_REGEX, (s, t) => STANDARD_ENCODING_REPLACEMENTS[t] ?? s);
}

export class HttpParams {
  private map: Map<string, string[]> = new Map<string, string[]>();

  constructor(source?: string | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }) {
    if (typeof source === 'string') {
      source.replace(/^\?/, '').split('&').forEach((param: string) => {
        const [key, value] = param.split('=').map(o => o === undefined ? '' : decodeURIComponent(o));
        const values = this.map.get(key) || [];
        values.push(value);
        this.map.set(key, values);
      });
    } else if (source) {
      Object.keys(source).forEach(key => {
        const value = source[key];
        this.map.set(key, Array.isArray(value) ? value.map(o => `${o}`) : [`${value}`]);
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
    const values = this.map.get(param) || [];

    values.push(value.toString());
    this.map.set(param, values);

    return this.clone();
  }

  appendAll(params: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): HttpParams {
    Object.keys(params).forEach(key => {
      const value = params[key];
      const values = this.map.get(key) || [];

      values.push(...(Array.isArray(value) ? value : [value]));
      this.map.set(key, values);
    });

    return this.clone();
  }

  set(param: string, value: string | number | boolean | ReadonlyArray<string | number | boolean>): HttpParams {
    this.map.set(param, Array.isArray(value) ? value : [value]);
    return this.clone();
  }

  delete(param: string, value?: string | number | boolean): HttpParams {
    if (value) {
      const values = (this.map.get(param) || []).filter(o => o !== value);
      values.length > 0 ? this.map.set(param, values) : this.map.delete(param);
    } else {
      this.map.delete(param);
    }

    return this.clone();
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