# @ngify/http

[![version](https://img.shields.io/npm/v/@ngify/http/latest.svg)](https://www.npmjs.com/package/@ngify/http)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

一个形如 `@angular/common/http` 的 HTTP 客户端，提供了以下主要功能：

- 请求类型化响应对象的能力。
- 简化的错误处理。
- 请求和响应的拦截机制。
- 默认支持但不限于 `微信小程序` 与 `XMLHttpRequest`

先决条件：

- JavaScript / TypeScript
- HTTP 协议的用法。
- [RxJS](https://rxjs.dev/guide/overview) Observable 相关技术和操作符。

## API

For the full API definition, please visit [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http.html).

## Get Started

### 基本用法

```ts
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders, HttpParams } from '@ngify/http';
import { filter } from 'rxjs';

const http = new HttpClient();

http.get<{ code: number, data: any[], msg: string }>('url', 'k=v').pipe(
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

### 添加请求/响应拦截器

```ts
import { HttpClient, HttpHandler, HttpRequest, HttpEvent, HttpInterceptor } from '@ngify/http';
import { Observable, map } from 'rxjs';

const http = new HttpClient([
  new class implements HttpInterceptor {
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      // 克隆请求以修改请求参数
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

      console.log('拦截后的请求', request);

      return next.handle(request).pipe(
        tap(response => console.log('拦截后的响应', response))
      );
    }
  }
]);
```

> 多个拦截器构成了请求/响应处理器的双向链表，`@ngify/http` 会按你提供拦截器的顺序应用它们。

虽然拦截器有能力改变请求和响应，但 `HttpRequest` 和 `HttpResponse` 实例的属性是只读的，因此让它们基本上是不可变的。
<br>
如果你需要修改一个请求，请先将它克隆一份，修改这个克隆体后再把它传递给 `next.handle()`。

### 微信小程序额外参数

为保持 API 的统一，需要借助 `HttpContext` 来传递微信小程序额外的参数。

```ts
import { HttpClient, HttpContext, HttpContextToken, WX_UPLOAD_FILE_TOKEN, WX_DOWNLOAD_FILE_TOKEN, WX_REQUSET_TOKEN } from '@ngify/http';

const http = new HttpClient();

// 微信小程序开启 HTTP2
http.get('url', null, {
  context: new HttpContext().set(WX_REQUSET_TOKEN, {
    enableHttp2: true,
  })
});

// 微信小程序文件上传
http.post('url', null, {
  context: new HttpContext().set(WX_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName'
  })
});

// 微信小程序文件下载
http.get('url', null, {
  context: new HttpContext().set(WX_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath'
  })
});
```

### 替换 HTTP 请求类

默认使用 `WxHttpBackend (微信小程序)` 来进行 HTTP 请求，可以通过修改配置切换为 `HttpXhrBackend (XMLHttpRequest)`：

```ts
import { HttpXhrBackend, setupConfig } from '@ngify/http';

setupConfig({
  backend: new HttpXhrBackend()
});
```

如果需要在 Node.js 环境下使用 `XMLHttpRequest`，可以使用 [xhr2](https://www.npmjs.com/package/xhr2)，它在 Node.js API 上实现了 [W3C XMLHttpRequest](https://www.w3.org/TR/XMLHttpRequest/) 规范：

```ts
import { HttpXhrBackend, setupConfig } from '@ngify/http';
import * as xhr2 from 'xhr2';

setupConfig({
  backend: new HttpXhrBackend(() => new xhr2.XMLHttpRequest())
});
```

你还可使用自定义的 `HttpBackend` 实现类：

```ts
import { HttpBackend, HttpClient, HttpRequest, HttpEvent, setupConfig } from '@ngify/http';
import { Observable } from 'rxjs';

// 需要实现 HttpBackend 接口
class CustomHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    // ...
  }
}

// 覆盖全局配置
setupConfig({
  backend: new CustomHttpBackend()
});
```

如果需要为某个 `HttpClient` 单独配置 `HttpBackend`，可以在 `HttpClient` 构造方法的第二个参数传入：

```ts
const http = new HttpClient(null, new CustomHttpBackend())
```

> 更多细节可参考：[Angular Docs](https://angular.io/guide/http)
