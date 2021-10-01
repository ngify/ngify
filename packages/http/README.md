# @ngify/http

一个类似 `@angular/common/http` 的 HTTP 客户端，提供了以下主要功能：

- 请求类型化响应对象的能力。
- 简化的错误处理。
- 请求和响应的拦截机制。

## 用法

### 基本用法

```ts
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@ngify/http';

const http = new HttpClient();

http.get<any>('url').subscribe(res => {
  console.log(res);
});

http.post<any>('url', { k: 'v' }).subscribe(res => {
  console.log(res);
});

const HTTP_CACHE_TOKEN = new HttpContextToken(() => 1800000);

http.put<any>('url', null, {
  context: new HttpContext().set(HTTP_CACHE_TOKEN)
}).subscribe(res => {
  console.log(res);
});

http.delete<any>('url', null, {
  headers: new HttpHeaders({ Authorization: 'token' })
}).subscribe(res => {
  console.log(res);
});
```

### 添加请求/响应拦截器

```ts
import { HttpClient, HttpHandler, HttpRequest, HttpResponse, HttpInterceptor } from '@ngify/http';
import { Observable, map } from 'rxjs';

const http = new HttpClient([
  new class implements HttpInterceptor {
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpResponse<unknown>> {
      // 克隆请求以修改请求参数
      request.clone({
        headers: request.headers.set('Authorization', 'token')
      });
      return next.handle(request).pipe(map(res => res));
    }
  },
  {
    intercept(request: HttpRequest<unknown>, next: HttpHandler) {
      request.clone({
        url: request.url + '?k=v'
      });
      console.log('拦截后的请求', request);
      return next.handle(request);
    }
  }
]);
```

多个拦截器构成了请求/响应处理器的双向链表，`@ngify/http` 会按你提供拦截器的顺序应用它们。
<br>
虽然拦截器有能力改变请求和响应，但 `HttpRequest` 和 `HttpResponse` 实例的属性是只读的，因此让它们基本上是不可变的。
<br>
如果你需要修改一个请求，请先将它克隆一份，修改这个克隆体后再把它传递给 `next.handle()`。

### 替换 HTTP 请求类

默认使用 `WxHttpBackend` 来进行 HTTP 请求，可自行替换：

```ts
import { HttpBackend, HttpClient, HttpRequest, HttpResponse } from '@ngify/http';
import { Observable } from 'rxjs';

// 需要实现 HttpBackend 接口
class CustomHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpResponse<any>> {
    // ...
  }
}

const http = new HttpClient(null, new CustomHttpBackend())
```

> 更多细节可参考：[Angular Docs](https://angular.cn/guide/http#communicating-with-backend-services-using-http)
