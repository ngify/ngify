# @ngify/http

[![version](https://img.shields.io/npm/v/@ngify/http/latest.svg)](https://www.npmjs.com/package/@ngify/http)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)
[![简体中文](https://img.shields.io/static/v1?label=简体中文&message=zh-CN&color=212121)](https://github.com/ngify/ngify/blob/main/packages/http/README.zh-CN.md)

A reactive HTTP client in the form of `@angular/common/http`, offers the following major features:

- The ability to request [typed response objects](https://angular.io/guide/http#typed-response).
- Streamlined [error handling](https://angular.io/guide/http#error-handling).
- Request and response [interception](https://angular.io/guide/http#intercepting-requests-and-responses).
- Default support but not limited to `XMLHttpRequest`, `Fetch API` and `WeChatMiniProgram`.

## Prerequisites

Before working with the `@ngify/http`, you should have a basic understanding of the following:

- JavaScript / TypeScript programming.
- Usage of the HTTP protocol.
- [RxJS](https://rxjs.dev/guide/overview) Observable techniques and operators. See the [Observables](https://angular.io/guide/observables) guide.

## API

For the full API definition, please visit [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http.html).

## Install

```bash
npm i @ngify/http
```

## Basic usage

```ts
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders, HttpParams } from '@ngify/http';
import { filter } from 'rxjs';

const http = new HttpClient();

http.get<{ code: number, data: any, msg: string }>('url', 'k=v').pipe(
  filter(({ code }) => code === 0)
).subscribe(res => console.log(res));

http.post('url', { k: 'v' }).subscribe(res => console.log(res));

const HTTP_CACHE_TOKEN = new HttpContextToken(() => 1800000);

http.put('url', null, {
  context: new HttpContext().set(HTTP_CACHE_TOKEN)
}).subscribe(res => console.log(res));

http.patch('url', null, {
  params: { k: 'v' }
}).subscribe(res => console.log(res));

http.delete('url', new HttpParams('k=v'), {
  headers: new HttpHeaders({ Authorization: 'token' })
}).subscribe(res => console.log(res));
```

## Intercepting requests and responses

With interception, you declare interceptors that inspect and transform HTTP requests from your application to a server. The same interceptors can also inspect and transform a server's responses on their way back to the application. Multiple interceptors form a forward-and-backward chain of request/response handlers.

> `@ngify/http` applies interceptors in the order that you provide them。

```ts
import { HttpClient, HttpHandler, HttpRequest, HttpEvent, HttpInterceptor, HttpEventType } from '@ngify/http';
import { Observable, tap } from 'rxjs';

const http = new HttpClient([
  new class implements HttpInterceptor {
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      // Clone the request to modify request parameters
      request = request.clone({
        headers: request.headers.set('Authorization', 'token')
      });

      return next.handle(request);
    }
  },
  {
    intercept(request: HttpRequest<unknown>, next: HttpHandler) {
      request = request.clone({
        params: request.params.set('k', 'v')
      });

      console.log('Request after interception', request);

      return next.handle(request).pipe(
        tap(response => {
          if (response.type === HttpEventType.Response) {
            console.log('Response after interception', response)
          }
        })
      );
    }
  }
]);
```

Although interceptors are capable of modifying requests and responses, the `HttpRequest` and `HttpResponse` instance properties are `readonly`, rendering them largely immutable.

> They are immutable for a good reason: an app might retry a request several times before it succeeds, which means that the interceptor chain can re-process the same request multiple times.
If an interceptor could modify the original request object, the re-tried operation would start from the modified request rather than the original.
Immutability ensures that interceptors see the same request for each try.

If you must alter a request, clone it first and modify the clone before passing it to `next.handle()`.

## Replace HTTP backend class

`@ngify/http` has the following HTTP backends built in:

| HTTP backend class | Description                          |
| ------------------ | ------------------------------------ |
| `HttpXhrBackend`   | HTTP requests using `XMLHttpRequest` |
| `HttpFetchBackend` | HTTP requests using `Fetch API`      |
| `HttpWxBackend`    | HTTP request in `WeChatMiniProgram`  |

By default, `HttpXhrBackend` is used, and you can switch to other HTTP backend class by modifying the configuration:

```ts
import { setupConfig } from '@ngify/http';
import { HttpFetchBackend } from '@ngify/http/fetch';
import { HttpWxBackend } from '@ngify/http/wx';

setupConfig({
  backend: new HttpFetchBackend()
});
```

You can also use a custom `HttpBackend` implementation class:

```ts
import { HttpBackend, HttpClient, HttpRequest, HttpEvent, setupConfig } from '@ngify/http';
import { Observable } from 'rxjs';

// You need to implement the HttpBackend interface
class CustomHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    // ...
  }
}

setupConfig({
  backend: new CustomHttpBackend()
});
```

If you need to configure `HttpBackend` separately for a `HttpClient`, you can pass it in the `HttpClient` constructor:

```ts
const http = new HttpClient(new CustomHttpBackend());

// Or

const http = new HttpClient({
  interceptors: [/* Some interceptors */],
  backend: new CustomHttpBackend()
});
```

## Use in Node.js

`@ngify/http` uses the browser implementation of `XMLHttpRequest` by default. To use it in Node.js, you need to switch to the `Fetch API`

```ts
import { setupConfig } from '@ngify/http';
import { HttpFetchBackend } from '@ngify/http/fetch';

setupConfig({
  backend: new HttpFetchBackend()
});
```

## Pass extra parameters

In order to keep the API uniform, some extra parameters need to be passed through `HttpContext`.

### Extra parameters for Fetch API

```ts
import { HttpContext } from '@ngify/http';
import { FETCH_TOKEN } from '@ngify/http/fetch';

// ...

// Fetch API allows cross-origin requests
http.get('url', null, {
  context: new HttpContext().set(FETCH_TOKEN, {
    mode: 'cors',
    // ...
  })
});
```

### Extra parameters for WeChatMiniProgram

```ts
import { HttpContext, WX_UPLOAD_FILE_TOKEN, WX_DOWNLOAD_FILE_TOKEN, WX_REQUSET_TOKEN } from '@ngify/http/wx';

// ...

// WeChatMiniProgram enables HTTP2
http.get('url', null, {
  context: new HttpContext().set(WX_REQUSET_TOKEN, {
    enableHttp2: true,
  })
});

// WeChatMiniProgram file upload
http.post('url', null, {
  context: new HttpContext().set(WX_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName'
  })
});

// WeChatMiniProgram file download
http.get('url', null, {
  context: new HttpContext().set(WX_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath'
  })
});
```

## More

For more usage, please visit [https://angular.io](https://angular.io/guide/http).
