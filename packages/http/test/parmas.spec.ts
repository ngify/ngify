/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { HttpParams } from '../src/params';

describe('HttpParams', () => {
  it('init', () => {
    const params = new HttpParams();
    expect(params.toString()).toEqual('');
  });

  it('should parse an existing url', () => {
    const params = new HttpParams('a=b&c=d&c=e');
    expect(params.getAll('a')).toEqual(['b']);
    expect(params.getAll('c')).toEqual(['d', 'e']);
  });

  it('should ignore question mark in a url', () => {
    const params = new HttpParams('?a=b&c=d&c=e');
    expect(params.getAll('a')).toEqual(['b']);
    expect(params.getAll('c')).toEqual(['d', 'e']);
  });

  it('should only remove question mark at the beginning of the params', () => {
    const params = new HttpParams('?a=b&c=d&?e=f');
    expect(params.getAll('a')).toEqual(['b']);
    expect(params.getAll('c')).toEqual(['d']);
    expect(params.getAll('?e')).toEqual(['f']);
  });

  it('should allow setting string parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.set('a', 'c');
    expect(mutated.toString()).toEqual('a=c');
  });

  it('should allow setting number parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.set('a', 1);
    expect(mutated.toString()).toEqual('a=1');
  });

  it('should allow setting boolean parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.set('a', true);
    expect(mutated.toString()).toEqual('a=true');
  });

  it('should allow appending string parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.append('a', 'c');
    expect(mutated.toString()).toEqual('a=b&a=c');
  });

  it('should allow appending number parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.append('a', 1);
    expect(mutated.toString()).toEqual('a=b&a=1');
  });

  it('should allow appending boolean parameters', () => {
    const params = new HttpParams('a=b');
    const mutated = params.append('a', true);
    expect(mutated.toString()).toEqual('a=b&a=true');
  });

  it('should allow appending all string parameters', () => {
    const params = new HttpParams('a=a1&b=b1');
    const mutated = params.appendAll({ a: ['a2', 'a3'], b: 'b2' });
    expect(mutated.toString()).toEqual('a=a1&a=a2&a=a3&b=b1&b=b2');
  });

  it('should allow appending all number parameters', () => {
    const params = new HttpParams('a=1&b=b1');
    const mutated = params.appendAll({ a: [2, 3], b: 'b2' });
    expect(mutated.toString()).toEqual('a=1&a=2&a=3&b=b1&b=b2');
  });

  it('should allow appending all boolean parameters', () => {
    const params = new HttpParams('a=true&b=b1');
    const mutated = params.appendAll({ a: [true, false], b: 'b2' });
    expect(mutated.toString()).toEqual('a=true&a=true&a=false&b=b1&b=b2');
  });

  it('should allow appending all parameters of different types', () => {
    const params = new HttpParams('a=true&b=b1');
    const mutated = params.appendAll({ a: [true, 0, 'a1'] as const, b: 'b2' });
    expect(mutated.toString()).toEqual('a=true&a=true&a=0&a=a1&b=b1&b=b2');
  });

  it('should allow deletion of parameters', () => {
    const params = new HttpParams('a=b&c=d&e=f');
    const mutated = params.delete('c');
    expect(mutated.toString()).toEqual('a=b&e=f');
  });

  it('should allow deletion of parameters with specific string value', () => {
    const params = new HttpParams('a=b&c=d&e=f');
    const notMutated = params.delete('c', 'z');
    expect(notMutated.toString()).toEqual('a=b&c=d&e=f');
    const mutated = params.delete('c', 'd');
    expect(mutated.toString()).toEqual('a=b&e=f');
  });

  it('should allow deletion of parameters with specific number value', () => {
    const params = new HttpParams('a=b&c=1&e=f');
    const notMutated = params.delete('c', 2);
    expect(notMutated.toString()).toEqual('a=b&c=1&e=f');
    const mutated = params.delete('c', 1);
    expect(mutated.toString()).toEqual('a=b&e=f');
  });

  it('should allow deletion of parameters with specific boolean value', () => {
    const params = new HttpParams('a=b&c=true&e=f');
    const notMutated = params.delete('c', false);
    expect(notMutated.toString()).toEqual('a=b&c=true&e=f');
    const mutated = params.delete('c', true);
    expect(mutated.toString()).toEqual('a=b&e=f');
  });

  it('should allow chaining of mutations', () => {
    const params = new HttpParams('a=b&c=d&e=f');
    const mutated = params.append('e', 'y').delete('c').set('a', 'x').append('e', 'z');
    expect(mutated.toString()).toEqual('a=x&e=f&e=y&e=z');
  });

  it('should allow deletion of one value of a string parameter', () => {
    const params = new HttpParams('a=1&a=2&a=3&a=4&a=5');
    const mutated = params.delete('a', '2').delete('a', '4');
    expect(mutated.getAll('a')).toEqual(['1', '3', '5']);
  });

  it('should allow deletion of one value of a number parameter', () => {
    const params = new HttpParams('a=0&a=1&a=2&a=3&a=4&a=5');
    const mutated = params.delete('a', 0).delete('a', 4);
    expect(mutated.getAll('a')).toEqual(['1', '2', '3', '5']);
  });

  it('should allow deletion of one value of a boolean parameter', () => {
    const params = new HttpParams('a=false&a=true&a=false');
    const mutated = params.delete('a', false);
    expect(mutated.getAll('a')).toEqual(['true']);
  });

  it('should lazily append values', () => {
    const src = new HttpParams();
    const a = src.append('foo', 'a');
    const b = a.append('foo', 'b');
    const c = b.append('foo', 'c');
    expect(src.getAll('foo')).toBeNull();
    expect(a.getAll('foo')).toEqual(['a']);
    expect(b.getAll('foo')).toEqual(['a', 'b']);
    expect(c.getAll('foo')).toEqual(['a', 'b', 'c']);
  });

  it('should not repeat mutations that have already been materialized', () => {
    const params = new HttpParams('a=b');
    const mutated = params.append('a', 'c');
    expect(mutated.toString()).toEqual('a=b&a=c');

    const mutated2 = mutated.append('c', 'd');
    expect(mutated.toString()).toEqual('a=b&a=c');
    expect(mutated2.toString()).toEqual('a=b&a=c&c=d');
  });

  describe('read operations', () => {
    it('should give null if parameter is not set', () => {
      const params = new HttpParams('a=b&c=d');
      expect(params.get('e')).toBeNull();
      expect(params.getAll('e')).toBeNull();
    });

    it('should give an accurate list of keys', () => {
      const params = new HttpParams('a=1&b=2&c=3&d=4');
      expect(params.keys()).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('encoding', () => {
    it('should encode parameters', () => {
      const params = new HttpParams('a=standard_chars');
      expect(params.toString()).toEqual('a=standard_chars');
      const params2 = new HttpParams('a=1 2 3&b=mail@test&c=3_^[]$&d=eq=1');
      expect(params2.toString()).toEqual('a=1%202%203&b=mail@test&c=3_%5E%5B%5D$&d=eq=1');
    });
  });

  describe('toString', () => {
    it('should stringify string params', () => {
      const params = new HttpParams({ a: '', b: '2', c: '3' });
      expect(params.toString()).toBe('a=&b=2&c=3');
    });
    it('should stringify string array params', () => {
      const params = new HttpParams({ a: '', b: ['21', '22'], c: '3' });
      expect(params.toString()).toBe('a=&b=21&b=22&c=3');
    });
    it('should stringify number params', () => {
      const params = new HttpParams({ a: '', b: 2, c: 3 });
      expect(params.toString()).toBe('a=&b=2&c=3');
    });
    it('should stringify number array params', () => {
      const params = new HttpParams({ a: '', b: [21, 22], c: 3 });
      expect(params.toString()).toBe('a=&b=21&b=22&c=3');
    });
    it('should stringify boolean params', () => {
      const params = new HttpParams({ a: '', b: true, c: 3 });
      expect(params.toString()).toBe('a=&b=true&c=3');
    });
    it('should stringify boolean array params', () => {
      const params = new HttpParams({ a: '', b: [true, false], c: 3 });
      expect(params.toString()).toBe('a=&b=true&b=false&c=3');
    });
    it('should stringify array params of different types', () => {
      const params = new HttpParams({ a: ['', false, 3] as const });
      expect(params.toString()).toBe('a=&a=false&a=3');
    });
    it('should stringify empty array params', () => {
      const params = new HttpParams({ a: '', b: [], c: '3' });
      expect(params.toString()).toBe('a=&c=3');
    });
  });
});