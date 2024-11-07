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
npm install @ngify/http
```

## 基本用法

```ts
import { HttpClient } from '@ngify/http';
import { timeout, retry } from 'rxjs';

const http = new HttpClient();

http.get('url', { k: 'v' }).subscribe(console.log);

http.post<YourType>('url', 'body', {
  params: { k: 'v' }
  headers: { Authorization: 'token' }
}).pipe(
  timeout(3000),
  retry(3),
).subscribe(console.log);
```

### 发起请求

`HttpClient` 具有与用于发出请求的不同 HTTP 动词相对应的方法，这些方法既可以加载数据，也可以在服务器上应用变更。每个方法都返回一个 [RxJS Observable](https://rxjs.dev/guide/observable)，订阅后会发送请求，然后在服务器响应时发出结果。

> [!NOTE]
> 由 `HttpClient` 创建的 `Observable` 可以被订阅任意多次，并且每次订阅都会发出一个新的后端请求。

通过传递给请求方法的选项对象，可以调整请求的各种属性和返回的响应类型。

#### 获取 JSON 数据

从后端获取数据通常需要使用 `HttpClient.get()` 方法发出 GET 请求。此方法采用两个参数：要从中获取的字符串端点 URL，以及用于配置请求的可选选项对象。

例如，要使用 `HttpClient.get()` 方法从假设的 API 获取配置数据：

```ts
http.get<Config>('/api/config').subscribe(config => {
  // process the configuration.
});
```

请注意泛型类型参数，它指定服务器返回的数据的类型为 `Config` 。该参数是可选的，如果省略它，则返回的数据将具有 `any` 类型。

> [!TIP]
> 如果数据具有未知形状的类型，那么更安全的方法是使用 `unknown` 作为响应类型。

> [!CAUTION]
> 请求方法的通用类型是关于服务器返回的数据的类型断言。 `HttpClient` 不会验证实际返回数据是否与该类型匹配。

#### 获取其他类型的数据

默认情况下， `HttpClient` 假定服务器将返回 JSON 数据。与非 JSON API 交互时，您可以告诉 `HttpClient` 在发出请求时期望并返回什么响应类型。这是通过 `responseType` 选项完成的。

| Response type   | Returned response type                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `'json'` (默认) | 给定泛型类型的 JSON 数据                                                                                                   |
| `'text'`        | 字符串文本                                                                                                                 |
| `'blob'`        | [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) 实例                                                             |
| `'arraybuffer'` | 包含原始响应字节的 [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) |

例如，您可以要求 `HttpClient` 将 `.jpeg` 图像的原始字节下载到 `ArrayBuffer` 中：

```ts
http.get('/images/dog.jpg', null, { responseType: 'arraybuffer' }).subscribe(buffer => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

#### 改变服务器状态

执行修改的服务器 API 通常需要发出 POST 请求，并在请求正文中指定新状态或要进行的更改。

`HttpClient.post()` 方法的行为与 `get()` 类似，只是第二位参数变为 body 参数：

```ts
http.post<Config>('/api/config', newConfig).subscribe(config => {
  console.log('Updated config:', config);
});
```

可以提供许多不同类型的值作为请求的 `body`，并且 `HttpClient` 将相应地序列化它们：

| Body type                                                                                               | Serialization as                                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `string`                                                                                                | 纯文本                                                     |
| `number`、`boolean`、`Array` 或 `object`                                                                | JSON 字符串                                                |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | 来自 buffer 的原始数据                                     |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                               | 具有 `Blob` 内容类型的原始数据                             |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                       | `multipart/form-data` 表单数据                             |
| `HttpParams` 或 [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams)         | `application/x-www-form-urlencoded formatted` 格式化字符串 |

#### 设置 URL 参数

使用 `params` 选项指定应包含在请求 URL 中的请求参数。

传递字面量对象是配置 URL 参数的最简单方法：

```ts
http.get('/api/config', { filter: 'all' }).subscribe(config => {
  // ...
});

http.post('/api/config', body, {
  params: { filter: 'all' },
}).subscribe(config => {
  // ...
});
```

或者，如果您需要对参数的构造或序列化进行更多控制，则可以传递 `HttpParams` 的实例。

> [!IMPORTANT]
> `HttpParams` 的实例是不可变的，不能直接更改。相反，诸如 `append()` 之类的可变方法会返回应用了变更的 `HttpParams` 的新实例。

```ts
const baseParams = new HttpParams().set('filter', 'all');

http.get('/api/config', baseParams.set('details', 'enabled')).subscribe(config => {
  // ...
});

http.post('/api/config', body, {
  params: baseParams.set('details', 'enabled')
}).subscribe(config => {
  // ...
});
```

您可以使用自定义 `HttpParameterCodec` 实例化 `HttpParams`（构造方法中的第二个参数），该自定义 `HttpParameterCodec` 确定 `HttpClient` 如何将参数编码到 URL 中。

#### 设置请求标头

使用 `headers` 选项指定应包含在请求中的请求标头。

传递字面量对象是配置请求标头的最简单方法：

```ts
http.get('/api/config', params, {
  headers: {
    'X-Debug-Level': 'verbose',
  }
}).subscribe(config => {
  // ...
});
```

或者，如果您需要对标头的构造进行更多控制，请传递 `HttpHeaders` 的实例。

> [!IMPORTANT]
> `HttpHeaders` 的实例是不可变的，不能直接更改。相反，诸如 `append()` 之类的可变方法会返回应用了变更的 `HttpHeaders` 的新实例。

```ts
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http.get<Config>('/api/config', params, {
  headers: baseHeaders.set('X-Debug-Level', 'verbose'),
}).subscribe(config => {
  // ...
});
```

#### 与服务器响应事件交互

为了方便起见，`HttpClient` 默认返回服务器返回的数据的 `Observable`（body）。有时需要检查实际响应，例如检索特定的响应标头。

要访问整个响应，请将 `observe` 选项设置为 `'response'`：

```ts
http.get<Config>('/api/config', params, { observe: 'response' }).subscribe(res => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

#### 接收原始进度事件

除了响应正文或响应对象之外， `HttpClient` 还可以返回与请求生命周期中的特定时刻相对应的原始事件流。这些事件包括何时发送请求、何时返回响应标头以及何时完成正文。这些事件还可以包括报告大型请求或响应正文的上传和下载状态的进度事件。

默认情况下，进度事件处于禁用状态（因为它们会产生性能成本），但可以使用 `reportProgress` 选项来启用。

> [!NOTE]
> `HttpClient` 的 `fetch` 实现不会报告上传进度事件。

要观察事件流，请将 `observe` 选项设置为 `'events'`：

```ts
http.post('/api/upload', myData, {
  reportProgress: true,
  observe: 'events',
}).subscribe(event => {
  switch (event.type) {
    case HttpEventType.UploadProgress:
      console.log('Uploaded ' + event.loaded + ' out of ' + event.total + ' bytes');
      break;
    case HttpEventType.Response:
      console.log('Finished uploading!');
      break;
  }
});
```

事件流中报告的每个 `HttpEvent` 都有一个 `type` 来区分事件所代表的内容：

| Event type                       | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `HttpEventType.Sent`             | 请求已被发送。                                     |
| `HttpEventType.UploadProgress`   | 报告上传请求正文的进度 `HttpUploadProgressEvent`。 |
| `HttpEventType.ResponseHeader`   | 已收到响应的头部，包括状态和标头。                 |
| `HttpEventType.DownloadProgress` | 报告响应体下载进度的 `HttpDownloadProgressEvent`   |
| `HttpEventType.Response`         | 已收到整个响应，包括响应正文。                     |
| `HttpEventType.User`             | 来自 Http 拦截器的自定义事件。                     |

#### 处理请求失败

HTTP 请求失败有两种情况：
- 网络或连接错误可能会阻止请求到达后端服务器。
- 后端可以收到请求但无法处理，并返回错误响应。

`HttpClient` 在 `HttpErrorResponse` 中捕获这两种错误，并通过 `Observable` 的错误通道返回该错误。网络错误的 `status` 代码为 `0`，`error` 是 `ProgressEvent` 的实例。
后端错误具有后端返回的失败 `status` 代码，以及错误响应 `error`。检查响应以确定错误的原因以及处理错误的适当操作。

[RxJS](https://rxjs.dev/) 提供了多个可用于错误处理的运算符。

您可以使用 `catchError` 运算符将错误响应转换为 UI 的值。该值可以告诉 UI 显示错误页面或值，并在必要时捕获错误原因。

有时，诸如网络中断之类的暂时性错误可能会导致请求意外失败，只需重试请求即可使其成功。RxJS 提供了几个重试运算符，它们在某些条件下自动重新订阅失败的 `Observable`。例如，`retry()` 运算符将自动尝试重新订阅指定的次数。

#### Http Observables

`HttpClient` 上的每个请求方法都会构造并返回所请求响应类型的 `Observable`。使用 `HttpClient` 时，了解这些 `Observable` 的工作原理非常重要。

`HttpClient` 生成 RxJS 所谓的 “冷” `Observable` ，这意味着在订阅 `Observable` 之前不会发生任何实际请求。只有这样，请求才真正发送到服务器。多次订阅同一个 `Observable` 会触发多个后端请求。每个订阅都是独立的。

一旦响应返回，来自 `HttpClient` 的 `Observable` 通常会自动完成（尽管拦截器会影响这一点）。

由于自动完成，如果不清理 `HttpClient` 订阅，通常不存在内存泄漏的风险。

但是，与任何异步操作一样，我们强烈建议您在使用订阅的组件被销毁时清理订阅，因为订阅回调可能会运行，并在尝试与被销毁的组件交互时遇到错误。

### 拦截请求和响应

`HttpClient` 支持一种称为*拦截器*的中间件形式。

> [!NOTE]
> TL;DR：拦截器是中间件，允许从单个请求中抽象出有关重试、缓存、日志记录和身份验证的常见模式。

`HttpClient` 支持两种拦截器：函数式拦截器和基于 `class` 的拦截器。我们的建议是使用函数式拦截器，因为它们具有更可预测的行为，尤其是在复杂的设置中。本指南中的示例使用函数式拦截器，并且我们在最后的相应部分中介绍了基于 `class` 的拦截器。

#### 拦截器

拦截器通常是可以为每个请求运行的函数，并且具有影响请求和响应的内容和整体流程的广泛功能。

您可以安装多个拦截器，它们形成拦截器链，其中每个拦截器处理请求或响应，然后将其转发到链中的下一个拦截器。

您可以使用拦截器来实现各种常见模式，例如：
- 将身份验证标头添加到发送到特定 API 的传出请求。
- 使用指数退避重试失败的请求。
- 将响应缓存一段时间，或者直到因突变而失效。
- 自定义响应的解析。
- 测量服务器响应时间并记录它们。
- 在网络操作正在进行时驱动 UI 元素，例如加载旋转器。
- 收集并批量处理特定时间范围内发出的请求。
- 在可配置的截止日期或超时后自动失败请求。
- 定期轮询服务器并刷新结果。

#### 定义拦截器

拦截器的基本形式是接收传出 `HttpRequest` 的函数和代表拦截器链中下一个处理步骤的 `next` 函数。

例如，此 `loggingInterceptor` 将在转发请求之前将传出请求 URL 记录到 `console.log`：

```ts
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

为了让这个拦截器真正拦截请求，您必须配置 `HttpClient` 来使用它。

#### 配置拦截器

您可以使用 `withInterceptors` 函数配置 `HttpClient` 要使用的拦截器集合：

```ts
const http = new HttpClient(
  withInterceptors([loggingInterceptor, cachingInterceptor])
);
```

您配置的拦截器按照您列出的顺序链接在一起。在上面的示例中，`loggingInterceptor` 将处理请求，然后将其转发到 `cachingInterceptor`。

##### 拦截响应事件

拦截器可以转换 `next` 返回的 `HttpEvent` 的 `Observable` 流，以便访问或操作响应。由于此流包含所有响应事件，因此可能需要检查每个事件的 `.type` 以便识别最终响应对象。

```ts
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(tap(event => {
    if (event.type === HttpEventType.Response) {
      console.log(req.url, 'returned a response with status', event.status);
    }
  }));
}
```

> [!TIP]
> 拦截器自然地将响应与其传出请求相关联，因为它们在捕获请求对象的闭包中转换响应流。

#### 修改请求

`HttpRequest` 和 `HttpResponse` 实例的大多数方面都是不可变的，拦截器无法直接修改它们。相反，拦截器通过使用 `.clone()` 操作克隆这些对象并指定应在新实例中改变哪些属性来应用变更。这可能涉及对值本身执行不可变的更新（如 `HttpHeaders` 或 `HttpParams`）。

例如，要向请求添加标头：

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

如果多次将同一个 `HttpRequest` 提交到拦截器链，这种不变性允许大多数拦截器具有幂等性。发生这种情况的原因有多种，包括请求失败后重试时。

> [!CAUTION]
> 请求或响应的正文未受到深度变更的保护。如果拦截器必须改变主体，请注意处理同一请求的多次运行。

#### 请求和响应元数据

通常，在不发送到后端但专门用于拦截器的请求中包含信息很有用。 `HttpRequest` 有一个 `.context` 对象，它将此类元数据存储为 `HttpContext` 的实例。该对象充当类型映射，其键类型为 `HttpContextToken`。

为了说明该系统的工作原理，让我们使用元数据来控制是否为给定的请求启用缓存拦截器。

##### 定义上下文标记

要存储缓存拦截器是否应在该请求的 `.context` 映射中缓存特定请求，请定义一个新的 `HttpContextToken` 来充当键：

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

提供的函数为尚未显式设置值的请求创建令牌的默认值。使用函数可确保如果令牌的值是对象或数组，则每个请求都会获得自己的实例。

##### 在拦截器中读取令牌

然后，拦截器可以读取令牌并根据其值选择是否应用缓存逻辑：

```ts
export function cachingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.context.get(CACHING_ENABLED)) {
    // apply caching logic
    return ...;
  } else {
    // caching has been disabled for this request
    return next(req);
  }
}
```

##### 发出请求时设置上下文令牌

通过 `HttpClient` API 发出请求时，您可以为 `HttpContextToken` 提供值：

```ts
const data$ = http.get('/sensitive/data', {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

拦截器可以从请求的 `HttpContext` 中读取这些值。

##### 请求上下文是可变的

与 `HttpRequest` 的其他属性不同，关联的 `HttpContext` 是可变的。如果拦截器更改了稍后重试的请求的上下文，则同一拦截器在再次运行时将观察到上下文变化。如果需要，这对于在多次重试之间传递状态很有用。

#### 构造响应

大多数拦截器将在转换请求或响应时简单地调用下 `next` 处理程序，但这并不是严格的要求。本节讨论拦截器可以合并更高级行为的几种方法。

拦截器不需要调用 `next`。它们可能会选择通过其他一些机制来构造响应，例如从缓存中或通过替代机制发送请求。

可以使用 `HttpResponse` 构造函数构建响应：

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

#### 基于 class 的拦截器

`HttpClient` 还支持基于 class 的拦截器，基于 class 的拦截器与函数式拦截器的功能相同，但配置方法不同。

基于 class 的拦截器是一个实现 HttpInterceptor 接口的类：

```ts
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

基于 class 的拦截器通过 `withLegacyInterceptors` 函数进行配置：

```ts
const http = new HttpClient(
  withLegacyInterceptors([new LoggingInterceptor()])
);
```

### 测试请求

https://angular.dev/guide/http/testing

### 更换 HTTP 请求实现

`@ngify/http` 内置了以下 HTTP 请求实现：

| HTTP 请求实现 | 包               | 描述                                 |
| ------------- | ---------------- | ------------------------------------ |
| `withXhr`     | `@ngify/http`    | 使用 `XMLHttpRequest` 进行 HTTP 请求 |
| `withFetch`   | `@ngify/http`    | 使用 `Fetch API` 进行 HTTP 请求      |
| `withWx`      | `@ngify/http-wx` | 在 `微信小程序` 中进行 HTTP 请求     |

`HttpClient` 默认使用 `HttpXhrBackend`，您可以自行切换到其他实现：

```ts
import { withXhr, withFetch } from '@ngify/http';
import { HttpWxBackend } from '@ngify/http-wx';

const xhrHttp = new HttpClient(
  withXhr()
);
const fetchHttp = new HttpClient(
  withFetch()
);
const wxHttp = new HttpClient(
  withWx()
);
```

你还可使用自定义的 `HttpBackend` 实现：

```ts
// 需要实现 HttpBackend 接口
class CustomHttpBackend implements HttpBackend {
  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    // ...
  }
}

const customHttp = new HttpClient(
  {
    kind: HttpFeatureKind.Backend,
    value: new CustomHttpBackend()
  }
);
```

您还可以使用 `setupHttpClient` 进行全局配置：

```ts
setupHttpClient(
  withFetch()
)
```
