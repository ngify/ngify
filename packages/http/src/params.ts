const STANDARD_ENCODING_REGEX = /%(\d[a-f0-9])/gi;
const STANDARD_ENCODING_REPLACEMENTS: { [x: string]: string } = {
  '40': '@',
  '3A': ':',
  '24': '$',
  '2C': ',',
  '3B': ';',
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

const stringify = (value: string | number | boolean) => (
  value === null || value === undefined ? '' : `${value}`
);

export interface HttpParameterCodec {
  encodeKey(key: string): string;
  encodeValue(value: string): string;
  decodeKey(key: string): string;
  decodeValue(value: string): string;
}

/**
 * Provides encoding and decoding of URL parameter and query-string values.
 *
 * Serializes and parses URL parameter keys and values to encode and decode them.
 * If you pass URL query parameters without encoding,
 * the query parameters can be misinterpreted at the receiving end.
 */
export class HttpUrlEncodingCodec implements HttpParameterCodec {
  /**
   * Encodes a key name for a URL parameter or query-string.
   * @param key The key name.
   * @returns The encoded key name.
   */
  encodeKey(key: string): string {
    return standardEncoding(key);
  }

  /**
   * Encodes the value of a URL parameter or query-string.
   * @param value The value.
   * @returns The encoded value.
   */
  encodeValue(value: string): string {
    return standardEncoding(value);
  }

  /**
   * Decodes an encoded URL parameter or query-string key.
   * @param key The encoded key name.
   * @returns The decoded key name.
   */
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  /**
   * Decodes an encoded URL parameter or query-string value.
   * @param value The encoded value.
   * @returns The decoded value.
   */
  decodeValue(value: string) {
    return decodeURIComponent(value);
  }
}

export class HttpParams {
  private map: Map<string, string[]> = new Map<string, string[]>();
  private encoder: HttpParameterCodec;

  constructor(
    source?: string | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> } | null,
    encoder?: HttpParameterCodec
  ) {
    this.encoder = encoder ?? new HttpUrlEncodingCodec();

    if (typeof source === 'string') {
      source.replace(/^\?/, '').split('&').forEach((param: string) => {
        const [key, value] = param.split(/=(.*)/, 2).map((o, i) => (
          o === undefined ? '' : (i === 0 ? this.encoder.decodeKey(o) : this.encoder.decodeValue(o))
        ));
        const values = this.map.get(key) || [];
        values.push(value);
        this.map.set(key, values);
      });
    } else if (source) {
      Object.keys(source).forEach(param => {
        const value = source[param];
        this.map.set(param, Array.isArray(value) ? value.map(stringify) : [stringify(value as string | number | boolean)]);
      });
    }
  }

  has(param: string): boolean {
    return this.map.has(param);
  }

  get(param: string): string | null {
    const values = this.map.get(param);
    return values?.[0] || null;
  }

  getAll(param: string): string[] | null {
    return this.map.get(param) || null;
  }

  keys(): string[] {
    return Array.from(this.map.keys());
  }

  append(param: string, value: string | number | boolean): HttpParams {
    const clone = this.clone();
    const values = clone.map.get(param) || [];

    values.push(stringify(value));
    clone.map.set(param, values);

    return clone;
  }

  appendAll(params: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): HttpParams {
    const clone = this.clone();

    Object.keys(params).forEach(key => {
      const value = params[key];
      const values = clone.map.get(key) || [];

      values.push(...(Array.isArray(value) ? value.map(stringify) : [stringify(value as string | number | boolean)]));
      clone.map.set(key, values);
    });

    return clone;
  }

  set(param: string, value: string | number | boolean | ReadonlyArray<string | number | boolean>): HttpParams {
    const clone = this.clone();
    clone.map.set(param, Array.isArray(value) ? value.map(stringify) : [stringify(value as string | number | boolean)]);
    return clone;
  }

  delete(param: string, value?: string | number | boolean): HttpParams {
    const clone = this.clone();

    if (value !== undefined) {
      const values = (clone.map.get(param) || []).filter(o => o !== stringify(value));
      values.length > 0 ? clone.map.set(param, values) : clone.map.delete(param);
    } else {
      clone.map.delete(param);
    }

    return clone;
  }

  toString(): string {
    return this.keys().map(key => (
      this.map.get(key)!.map(value => this.encoder.encodeKey(key) + '=' + this.encoder.encodeValue(value)).join('&')
    )).filter(param => param !== '').join('&');
  }

  private clone(): HttpParams {
    const clone = new HttpParams(null, this.encoder);

    this.map.forEach((value, name) => {
      clone.map.set(name, [...value]);
    });

    return clone;
  }
}
