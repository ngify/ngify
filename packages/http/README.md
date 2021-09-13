# @ngify/http

一个类似 `@angular/common/http` 的 HTTP 客户端，提供了以下主要功能：

- 请求类型化响应对象的能力。
- 简化的错误处理。
- 请求和响应的拦截机制。

## 用法

基本用法：

```ts
import { HttpClient } from '@ngify/http';

const http = new HttpClient();

http.get<any>('url').subscribe(res => {
  console.log(res);
});
```

添加请求/响应拦截器：

```ts
import { HttpClient, HttpHandler, HttpRequest, HttpInterceptor } from '@ngify/http';

// 多个拦截器构成了请求/响应处理器的双向链表；`@ngify/http` 会按你提供拦截器的顺序应用它们
const http = new HttpClient([
  new class implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler) {
      request.data.a = 'a';
      return next.handle(request).pipe(map(res => res));
    }
  },
  {
    intercept(request: HttpRequest<any>, next: HttpHandler) {
      request.data.b = 'b';
      console.log('拦截后的请求', request);
      return next.handle(request);
    }
  }
]);
```

默认使用 `WxHttpBackend` 来进行 HTTP 请求，可自行替换：

```ts
import { HttpBackend, HttpClient, HttpRequest } from '@ngify/http';

// 需要实现 HttpBackend 接口
class CustomHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    // ...
  }
}

const http = new HttpClient(null, new CustomHttpBackend())
```

更多细节可参考：[Angular Docs](https://angular.cn/guide/http#communicating-with-backend-services-using-http)
