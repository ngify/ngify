/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { HttpClient } from '../../src';
import { HttpClientTestingBackend } from '../src/backend';

describe('HttpClient TestRequest', () => {
  it('accepts a null body', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(null, mock);

    let resp: any;
    client.post('/some-url', { test: 'test' }).subscribe(body => {
      resp = body;
    });

    const req = mock.expectOne('/some-url');
    req.flush(null);

    expect(resp).toBeNull();
  });

  it('throws if no request matches', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(null, mock);

    let resp: any;
    client.get('/some-other-url').subscribe(body => {
      resp = body;
    });

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      fail();
    } catch (error: any) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url.');
    }
  });

  it('throws if no request matches the exact parameters', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(null, mock);

    let resp: any;
    const params = { query: 'hello' };
    client.get('/some-url', params).subscribe(body => {
      resp = body;
    });

    try {
      // expect different query parameters
      mock.expectOne('/some-url?query=world').flush(null);
      fail();
    } catch (error: any) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url?query=world", found none.' +
          ' Requests received are: GET /some-url?query=hello.');
    }
  });

  it('throws if no request matches with several requests received', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(null, mock);

    let resp: any;
    client.get('/some-other-url?query=world').subscribe(body => {
      resp = body;
    });
    client.post('/and-another-url', {}).subscribe(body => {
      resp = body;
    });

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      fail();
    } catch (error: any) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url?query=world, POST /and-another-url.');
    }
  });
});
