# @ngify/http

[![version](https://img.shields.io/npm/v/@ngify/http/latest.svg)](https://www.npmjs.com/package/@ngify/http)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![简体中文](https://img.shields.io/static/v1?label=简体中文&message=zh-CN&color=212121)](https://github.com/ngify/ngify/blob/main/packages/http/README.zh-CN.md)

An HTTP client in the form of `@angular/common/http`, offers the following major features:

- The ability to request [typed response objects](https://angular.io/guide/http#typed-response).
- Streamlined [error handling](https://angular.io/guide/http#error-handling).
- Request and response [interception](https://angular.io/guide/http#intercepting-requests-and-responses).
- Default support but not limited to `WeChatMiniProgram` and `XMLHttpRequest`.

## Prerequisites

Before working with the `@ngify/http`, you should have a basic understanding of the following:

- JavaScript / TypeScript programming.
- Usage of the HTTP protocol.
- [RxJS](https://rxjs.dev/guide/overview) Observable techniques and operators. See the [Observables](https://angular.io/guide/observables) guide.

## API

For the full API definition, please visit [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http.html).

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
import { HttpClient, HttpHandler, HttpRequest, HttpEvent, HttpInterceptor } from '@ngify/http';
import { Observable, map } from 'rxjs';

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
        tap(response => console.log('Response after interception', response))
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

## Replace HTTP Request Class

`HttpXhrBackend (XMLHttpRequest)` is used by default to make HTTP requests. You can switch to `WxHttpBackend (WeChatMiniProgram)` by modifying the configuration:

```ts
import { WxHttpBackend, setupConfig } from '@ngify/http';

setupConfig({
  backend: new WxHttpBackend()
});
```

If you need to use `XMLHttpRequest` in a Node.js environment, you can use [xhr2](https://www.npmjs.com/package/xhr2), which implements the [W3C XMLHttpRequest](https://www.w3.org/TR/XMLHttpRequest/) specification on the Node.js API:

```ts
import { HttpXhrBackend, setupConfig } from '@ngify/http';
import * as xhr2 from 'xhr2';

setupConfig({
  backend: new HttpXhrBackend(() => new xhr2.XMLHttpRequest())
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

If you need to configure `HttpClient` separately for a `HttpBackend`, you can pass in the second parameter of the `HttpBackend` constructor:

```ts
const http = new HttpClient(null, new CustomHttpBackend())
```

## Additional parameters of WeChatMiniProgram

In order to keep the API unified, we need to use `HttpContext` to pass additional parameters of WeChatMiniProgram.

```ts
import { HttpContext, HttpContextToken, WX_UPLOAD_FILE_TOKEN, WX_DOWNLOAD_FILE_TOKEN, WX_REQUSET_TOKEN } from '@ngify/http';

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
