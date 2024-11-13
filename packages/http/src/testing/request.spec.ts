import { SafeAny } from '@ngify/core';
import { HttpClient, HttpFeatureKind } from '@ngify/http';
import { HttpClientTestingBackend } from '@ngify/http/testing';

describe('HttpClient TestRequest', () => {
  it('accepts a null body', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient({ kind: HttpFeatureKind.Backend, value: mock });

    let resp: SafeAny;
    client.post('/some-url', { test: 'test' }).subscribe(body => {
      resp = body;
    });

    const req = mock.expectOne('/some-url');
    req.flush(null);

    expect(resp).toBeNull();
  });

  it('throws if no request matches', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient({ kind: HttpFeatureKind.Backend, value: mock });

    client.get('/some-other-url').subscribe();

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      assert.fail();
    } catch (error: SafeAny) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url.');
    }
  });

  it('throws if no request matches the exact parameters', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient({ kind: HttpFeatureKind.Backend, value: mock });

    const params = { query: 'hello' };
    client.get('/some-url', { params }).subscribe();

    try {
      // expect different query parameters
      mock.expectOne('/some-url?query=world').flush(null);
      assert.fail();
    } catch (error: SafeAny) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url?query=world", found none.' +
          ' Requests received are: GET /some-url?query=hello.');
    }
  });

  it('throws if no request matches with several requests received', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient({ kind: HttpFeatureKind.Backend, value: mock });

    client.get('/some-other-url?query=world').subscribe();
    client.post('/and-another-url', {}).subscribe();

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      assert.fail();
    } catch (error: SafeAny) {
      expect(error.message)
        .toBe(
          'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url?query=world, POST /and-another-url.');
    }
  });
});
