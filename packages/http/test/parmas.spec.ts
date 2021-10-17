import { HttpParams } from '../src/params';

describe('http', () => {
  test('init', () => {
    const params = new HttpParams();
    expect(params.toString()).toEqual('');
  });
});