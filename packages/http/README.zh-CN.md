# @ngify/http

[![version](https://img.shields.io/npm/v/@ngify/http/latest.svg)](https://www.npmjs.com/package/@ngify/http)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)
[![English](https://img.shields.io/static/v1?label=English&message=en-US&color=212121)](https://github.com/ngify/ngify/blob/main/packages/http/README.md)

一个形如 `@angular/common/http` 的响应式 HTTP 客户端，提供了以下主要功能：

- 请求[类型化响应对象](https://angular.cn/guide/http#typed-response)的能力。
- 简化的[错误处理](https://angular.cn/guide/http#error-handling)。
- 请求和响应的[拦截机制](https://angular.cn/guide/http#intercepting-requests-and-responses)。
- 默认支持但不限于 `XMLHttpRequest` 、`Fetch API` 与 `微信小程序`。

## 先决条件

在使用 `@ngify/http` 之前，您应该对以下内容有基本的了解：

- JavaScript / TypeScript 编程。
- HTTP 协议的用法。
- [RxJS](https://rxjs.dev/guide/overview) Observable 相关技术和操作符。请参阅 [Observables](https://angular.cn/guide/observables) 指南。

## API

有关完整的 API 定义，请访问 [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http.html).

## 安装

```bash
npm i @ngify/http
```

## 基本用法

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

## 拦截请求和响应

借助拦截机制，你可以声明一些拦截器，它们可以检查并转换从应用中发给服务器的 HTTP 请求。这些拦截器还可以在返回应用的途中检查和转换来自服务器的响应。多个拦截器构成了请求/响应处理器的**双向**链表。

> `@ngify/http` 会按照您提供拦截器的顺序应用它们。

```ts
import { HttpClient, HttpHandler, HttpRequest, HttpEvent, HttpInterceptor, HttpEventType } from '@ngify/http';
import { Observable, tap } from 'rxjs';

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
        tap(response => {
          if (response.type === HttpEventType.Response) {
            console.log('拦截后的响应', response)
          }
        })
      );
    }
  }
]);
```

虽然拦截器有能力改变请求和响应，但 `HttpRequest` 和 `HttpResponse` 实例的属性是只读的，因此让它们基本上是不可变的。

> 有充足的理由把它们做成不可变对象：应用可能会重试发送很多次请求之后才能成功，这就意味着这个拦截器链表可能会多次重复处理同一个请求。
如果拦截器可以修改原始的请求对象，那么重试阶段的操作就会从修改过的请求开始，而不是原始请求。
而这种不可变性，可以确保这些拦截器在每次重试时看到的都是同样的原始请求。

如果你需要修改一个请求，请先将它克隆一份，修改这个克隆体后再把它传递给 `next.handle()`。

## 替换 HTTP 请求类

`@ngify/http` 内置了以下 HTTP 请求类：

| HTTP 请求类        | 描述                                 |
| ------------------ | ------------------------------------ |
| `HttpXhrBackend`   | 使用 `XMLHttpRequest` 进行 HTTP 请求 |
| `HttpFetchBackend` | 使用 `Fetch API` 进行 HTTP 请求      |
| `HttpWxBackend`    | 在 `微信小程序` 中进行 HTTP 请求     |

默认使用 `HttpXhrBackend`，可以通过修改配置切换到其他的 HTTP 请求类：

```ts
import { setupConfig } from '@ngify/http';
import { HttpFetchBackend } from '@ngify/http/fetch';
import { HttpWxBackend } from '@ngify/http/wx';

setupConfig({
  backend: new HttpFetchBackend()
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

setupConfig({
  backend: new CustomHttpBackend()
});
```

如果需要为某个 `HttpClient` 单独配置 `HttpBackend`，可以在 `HttpClient` 构造方法中传入：

```ts
const http = new HttpClient(new CustomHttpBackend());

// 或者

const http = new HttpClient({
  interceptors: [/* 一些拦截器 */],
  backend: new CustomHttpBackend()
});
```

## 在 Node.js 中使用

`@ngify/http` 默认使用浏览器实现的 `XMLHttpRequest`。要在 Node.js 中使用，您需要切换到 `Fetch API`：

```ts
import { setupConfig } from '@ngify/http';
import { HttpFetchBackend } from '@ngify/http/fetch';

setupConfig({
  backend: new HttpFetchBackend()
});
```

## 传递额外参数

为保持 API 的统一，需要借助 `HttpContext` 来传递一些额外参数。

### Fetch API 额外参数

```ts
import { HttpContext } from '@ngify/http';
import { FETCH_TOKEN } from '@ngify/http/fetch';

// ...

// Fetch API 允许跨域请求
http.get('url', null, {
  context: new HttpContext().set(FETCH_TOKEN, {
    mode: 'cors',
    // ...
  })
});
```

### 微信小程序额外参数

```ts
import { HttpContext, WX_UPLOAD_FILE_TOKEN, WX_DOWNLOAD_FILE_TOKEN, WX_REQUSET_TOKEN } from '@ngify/http/wx';

// ...

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

## 更多

有关更多用法，请访问 [https://angular.cn](https://angular.cn/guide/http)。
