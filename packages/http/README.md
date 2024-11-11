# @ngify/http
[![version](https://img.shields.io/npm/v/@ngify/http/latest.svg)](https://www.npmjs.com/package/@ngify/http)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)
[![English](https://img.shields.io/static/v1?label=English&message=en-US&color=212121)](https://github.com/ngify/ngify/blob/main/packages/http/README.md)

A reactive HTTP client similar to `@angular/common/http`, offering the following main features:

- Ability to request [typed response objects](https://angular.dev/guide/http#typed-response).
- Simplified [error handling](https://angular.dev/guide/http#error-handling).
- [Interception mechanism](https://angular.dev/guide/http#intercepting-requests-and-responses) for requests and responses.
- Support for, but not limited to, `XMLHttpRequest`, `Fetch API`, and `WeChat Mini Programs`.

## Prerequisites

Before using `@ngify/http`, you should have a basic understanding of:

- JavaScript / TypeScript programming.
- Usage of the HTTP protocol.
- [RxJS](https://rxjs.dev/guide/overview) Observable-related techniques and operators. Refer to the [Observables](https://angular.dev/guide/observables) guide.

## API

For the complete API definition, visit [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http.html).

## Installation

```bash
npm install @ngify/http
```

## Basic Usage

```ts
import { HttpClient } from '@ngify/http';
import { timeout, retry } from 'rxjs';

const http = new HttpClient();

http.get('url', { k: 'v' }).subscribe();

http.post<YourType>('url', 'body', {
  params: { k: 'v' },
  headers: { Authorization: 'token' }
}).pipe(
  timeout(3000),
  retry(3),
).subscribe();
```

## Making Requests

`HttpClient` has methods corresponding to different HTTP verbs used to make requests, either to load data or to apply changes on the server. Each method returns an [RxJS Observable](https://rxjs.dev/guide/observable) that sends the request when subscribed to and emits the result when the server responds.

> [!NOTE]
> Observables created by `HttpClient` can be subscribed to multiple times, and each subscription will trigger a new backend request.

Various properties of the request and the type of the returned response can be adjusted by passing an options object to the request method.

### Fetching JSON Data

To fetch data from the backend, use the `HttpClient.get()` method to make a GET request. This method takes three arguments: the endpoint URL as a string from which to fetch, URL params, and an optional options object to configure the request.

For example, to fetch configuration data from a hypothetical API using the `HttpClient.get()` method:

```ts
http.get<Config>('/api/config').subscribe(config => {
  // process the configuration.
});
```

Note the generic type parameter, which specifies that the type of data returned by the server is `Config`. This parameter is optional, and if omitted, the returned data will have the type `any`.

> [!TIP]
> If the data has an unknown shape, it is safer to use `unknown` as the response type.

> [!CAUTION]
> The generic type of the request method is an assertion about the type of data returned by the server. `HttpClient` does not validate that the actual returned data matches this type.

### Fetching Other Types of Data

By default, `HttpClient` assumes that the server will return JSON data. When interacting with non-JSON APIs, you can tell `HttpClient` what response type to expect and return when making the request. This is done via the `responseType` option.

| Response type      | Returned response type                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `'json'` (default) | JSON data of the given generic type                                                                                                   |
| `'text'`           | String text                                                                                                                           |
| `'blob'`           | [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) instance                                                                    |
| `'arraybuffer'`    | [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) containing raw response bytes |

For example, you can ask `HttpClient` to download the raw bytes of a `.jpeg` image into an `ArrayBuffer`:

```ts
http.get('/images/dog.jpg', null, { responseType: 'arraybuffer' }).subscribe(buffer => {
  console.log('The image is ' + buffer.byteLength + ' bytes large');
});
```

### Changing Server State

To interact with server APIs that modify state, you typically need to make a POST request, specifying the new state or changes in the request body.

The `HttpClient.post()` method behaves similarly to `get()`, except that the second argument is the body parameter:

```ts
http.post<Config>('/api/config', newConfig).subscribe(config => {
  console.log('Updated config:', config);
});
```

Many different types of values can be provided as the request `body`, and `HttpClient` will serialize them accordingly:

| Body type                                                                                               | Serialization as                                     |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `string`                                                                                                | Plain text                                           |
| `number`, `boolean`, `Array`, or `object`                                                               | JSON string                                          |
| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | Raw data from the buffer                             |
| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob)                                               | Raw data with `Blob` content type                    |
| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)                                       | `multipart/form-data` form data                      |
| `HttpParams` or [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams)         | `application/x-www-form-urlencoded` formatted string |

### Setting URL Parameters

Use the `params` option to specify request parameters to be included in the request URL.

Passing a literal object is the simplest way to configure URL parameters:

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

Alternatively, if you need more control over the construction or serialization of the parameters, you can pass an instance of `HttpParams`.

> [!IMPORTANT]
> Instances of `HttpParams` are immutable and cannot be modified directly. Instead, methods like `append()` return a new instance of `HttpParams` with the changes applied.

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

You can instantiate `HttpParams` with a custom `HttpParameterCodec` (the second parameter in the constructor) that determines how `HttpClient` encodes parameters into the URL.

### Setting Request Headers

Use the `headers` option to specify request headers to be included in the request.

Passing a literal object is the simplest way to configure request headers:

```ts
http.get('/api/config', params, {
  headers: {
    'X-Debug-Level': 'verbose',
  }
}).subscribe(config => {
  // ...
});
```

Alternatively, if you need more control over the construction of the headers, pass an instance of `HttpHeaders`.

> [!IMPORTANT]
> Instances of `HttpHeaders` are immutable and cannot be modified directly. Instead, methods like `append()` return a new instance of `HttpHeaders` with the changes applied.

```ts
const baseHeaders = new HttpHeaders().set('X-Debug-Level', 'minimal');

http.get<Config>('/api/config', params, {
  headers: baseHeaders.set('X-Debug-Level', 'verbose'),
}).subscribe(config => {
  // ...
});
```

### Interacting with Server Response Events

For convenience, `HttpClient` returns an `Observable` of the server's response data (body) by default. Sometimes, you need to inspect the actual response, such as to retrieve specific response headers.

To access the full response, set the `observe` option to `'response'`:

```ts
http.get<Config>('/api/config', params, { observe: 'response' }).subscribe(res => {
  console.log('Response status:', res.status);
  console.log('Body:', res.body);
});
```

### Receiving Raw Progress Events

In addition to the response body or response object, `HttpClient` can also return a stream of raw events corresponding to specific moments in the request lifecycle. These events include when the request is sent, when the response headers are returned, and when the body is fully received. These events can also include progress events reporting the upload and download status of large request or response bodies.

By default, progress events are disabled (as they incur a performance cost), but they can be enabled using the `reportProgress` option.

> [!NOTE]
> The `fetch` implementation of `HttpClient` does not support reporting upload progress events.

To observe the event stream, set the `observe` option to `'events'`:

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

Each `HttpEvent` reported in the event stream has a `type` to distinguish what the event represents:

| Event type                       | Description                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `HttpEventType.Sent`             | The request has been sent.                                                         |
| `HttpEventType.UploadProgress`   | Reports the progress of uploading the request body `HttpUploadProgressEvent`.      |
| `HttpEventType.ResponseHeader`   | The response headers have been received, including status and headers.             |
| `HttpEventType.DownloadProgress` | Reports the progress of downloading the response body `HttpDownloadProgressEvent`. |
| `HttpEventType.Response`         | The full response has been received, including the response body.                  |
| `HttpEventType.User`             | Custom event from an Http interceptor.                                             |

### Handling Request Failures

HTTP requests can fail in two ways:
- A network or connection error may prevent the request from reaching the backend server.
- The backend can receive the request but fail to process it, returning an error response.

`HttpClient` captures both kinds of errors in an `HttpErrorResponse` and returns it via the `Observable`'s error channel. Network errors have a `status` code of `0`, and the `error` is an instance of `ProgressEvent`.
Backend errors have a failure `status` code returned by the backend and an error response `error`. Examine the response to determine the cause of the error and the appropriate action to take.

[RxJS](https://rxjs.dev/) provides several operators that can be used for error handling.

You can use the `catchError` operator to transform an error response into a value for the UI. This value can tell the UI to display an error page or value and capture the reason for the error if necessary.

Sometimes, transient errors such as network interruptions can cause a request to fail unexpectedly, and simply retrying the request can succeed. RxJS provides several retry operators that automatically resubscribe to a failed `Observable` under certain conditions. For example, the `retry()` operator will automatically attempt to resubscribe a specified number of times.

### Http Observables

Each request method on `HttpClient` constructs and returns an `Observable` of the requested response type. Understanding how these `Observables` work is crucial when using `HttpClient`.

`HttpClient` generates what RxJS calls "cold" `Observables`, meaning that no actual request is made until the `Observable` is subscribed to. Only then is the request sent to the server. Subscribing to the same `Observable` multiple times will trigger multiple backend requests. Each subscription is independent.

Once a response is returned, `Observables` from `HttpClient` typically complete automatically (though interceptors can affect this).

Due to automatic completion, there is usually no risk of memory leaks from `HttpClient` subscriptions if they are not cleaned up.

## Intercepting Requests and Responses

`HttpClient` supports a form of middleware called *interceptors*.

> [!NOTE]
> TL;DR: Interceptors are middleware that allow common patterns related to retrying, caching, logging, and authentication to be abstracted from individual requests.

`HttpClient` supports two types of interceptors: functional interceptors and class-based interceptors. We recommend using functional interceptors as they have more predictable behavior, especially in complex setups. The examples in this guide use functional interceptors, and we cover class-based interceptors in the corresponding section at the end.

### Interceptors

Interceptors are typically functions that can run for each request and have broad capabilities to affect the content and overall flow of requests and responses.

You can install multiple interceptors, which form an interceptor chain, where each interceptor processes the request or response and then forwards it to the next interceptor in the chain.

You can use interceptors to implement various common patterns, such as:
- Adding authentication headers to outgoing requests sent to specific APIs.
- Retrying failed requests with exponential backoff.
- Caching responses for a period of time or until invalidated by a mutation.
- Custom parsing of responses.
- Measuring and logging server response times.
- Driving UI elements such as loading spinners while network operations are in progress.
- Collecting and batching requests made within a specific time window.
- Automatically failing requests after a configurable deadline or timeout.
- Polling the server periodically and refreshing results.

### Defining Interceptors

The basic form of an interceptor is a function that receives the outgoing `HttpRequest` and a `next` function representing the next step in the interceptor chain.

For example, this `loggingInterceptor` logs the outgoing request URL to `console.log` before forwarding the request:

```ts
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log(req.url);
  return next(req);
}
```

To make this interceptor actually intercept requests, you must configure `HttpClient` to use it.

### Configuring Interceptors

You can configure the set of interceptors that `HttpClient` should use with the `withInterceptors` function:

```ts
const http = new HttpClient(
  withInterceptors([loggingInterceptor, cachingInterceptor])
);
```

The interceptors you configure are chained together in the order you list them. In the example above, `loggingInterceptor` will process the request and then forward it to `cachingInterceptor`.

#### Intercepting Response Events

Interceptors can transform the `Observable` stream of `HttpEvent`s returned by `next` to access or manipulate the response. Since this stream contains all response events, you may need to inspect the `.type` of each event to identify the final response object.

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
> Interceptors naturally associate responses with their outgoing requests, as they transform the response stream within the closure that captures the request object.

### Modifying Requests

Most aspects of `HttpRequest` and `HttpResponse` instances are immutable, and interceptors cannot modify them directly. Instead, interceptors apply changes by cloning these objects using the `.clone()` operation and specifying which properties should be altered in the new instance. This may involve performing immutable updates on values themselves (such as `HttpHeaders` or `HttpParams`).

For example, to add a header to a request:

```ts
const reqWithHeader = req.clone({
  headers: req.headers.set('X-New-Header', 'new header value'),
});
```

This immutability allows most interceptors to be idempotent if the same `HttpRequest` is submitted to the interceptor chain multiple times. This can happen for various reasons, including when a request is retried after a failure.

> [!CAUTION]
> The body of a request or response is not protected against deep changes. If an interceptor must alter the body, take care to handle multiple runs of the same request.

### Request and Response Metadata

Often, it is useful to include information in a request that is not sent to the backend but is used exclusively by interceptors. `HttpRequest` has a `.context` object that stores such metadata as an instance of `HttpContext`. This object acts as a type map, with key types being `HttpContextToken`.

To illustrate how this system works, let's use metadata to control whether a caching interceptor should cache a particular request.

#### Defining Context Tokens

To store whether the caching interceptor should cache a specific request in the `.context` map of the request, define a new `HttpContextToken` to act as the key:

```ts
export const CACHING_ENABLED = new HttpContextToken<boolean>(() => true);
```

The provided function creates the default value for the token if no value has been explicitly set. Using a function ensures that each request gets its own instance if the token's value is an object or array.

#### Reading Tokens in Interceptors

The interceptor can then read the token and choose whether to apply caching logic based on its value:

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

#### Setting Context Tokens When Making Requests

When making requests via the `HttpClient` API, you can provide values for `HttpContextToken`s:

```ts
const data$ = http.get('/sensitive/data', params, {
  context: new HttpContext().set(CACHING_ENABLED, false),
});
```

Interceptors can read these values from the request's `HttpContext`.

#### Request Context is Mutable

Unlike other properties of `HttpRequest`, the associated `HttpContext` is mutable. If an interceptor changes the context of a request that is later retried, the same interceptor will observe the context changes when it runs again. This is useful for passing state between multiple retries if needed.

### Constructing Responses

Most interceptors will simply call the next handler while transforming requests or responses, but this is not strictly required. This section discusses several ways interceptors can incorporate more advanced behavior.

Interceptors do not need to call `next`. They may choose to construct a response through some other mechanism, such as serving from a cache or sending the request through an alternative mechanism.

Responses can be constructed using the `HttpResponse` constructor:

```ts
const resp = new HttpResponse({
  body: 'response body',
});
```

### Class-based Interceptors

`HttpClient` also supports class-based interceptors, which function the same as functional interceptors but are configured differently.

A class-based interceptor is a class that implements the `HttpInterceptor` interface:

```ts
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + req.url);
    return handler.handle(req);
  }
}
```

Class-based interceptors are configured using the `withLegacyInterceptors` function:

```ts
const http = new HttpClient(
  withLegacyInterceptors([new LoggingInterceptor()]),
  withInterceptors([cachingInterceptor])
);
```

## Replacing HTTP Request Implementations

`@ngify/http` comes with the following HTTP request implementations:

| HTTP Request Implementation | Package                                                                           | Description                                  |
| --------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| `withXhr`                   | `@ngify/http`                                                                     | Uses `XMLHttpRequest` for HTTP requests      |
| `withFetch`                 | `@ngify/http`                                                                     | Uses `Fetch API` for HTTP requests           |
| `withWx`                    | [`@ngify/http-wx`](https://github.com/ngify/ngify/blob/main/packages/http-wx)     | Uses HTTP requests in `WeChat Mini Programs` |
| `withTaro`                  | [`@ngify/http-taro`](https://github.com/ngify/ngify/blob/main/packages/http-taro) | Uses HTTP requests in `Taro`                 |
| `withUni`                   | [`@ngify/http-uni`](https://github.com/ngify/ngify/blob/main/packages/http-uni)   | Uses HTTP requests in `Uni-app`              |

`HttpClient` uses `withXhr` by default, but you can switch to other implementations:

```ts
import { withXhr, withFetch } from '@ngify/http';
import { withWx } from '@ngify/http-wx';

const xhrHttp = new HttpClient(
  withXhr()
);
const fetchHttp = new HttpClient(
  withFetch()
);
const wxHttp = new HttpClient(
  withWx()
);
...
```

You can also use a custom `HttpBackend` implementation:

```ts
// Implement the HttpBackend interface
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

## XSRF/CSRF Protection

`HttpClient` supports a generic mechanism for preventing XSRF attacks. When making HTTP requests, an interceptor reads a token from a cookie (default is `XSRF-TOKEN`) and sets it as an HTTP header (default is `X-XSRF-TOKEN`). Since only code running on your domain can read the cookie, the backend can ensure that the HTTP request is coming from your client application and not from an attacker.

To enable XSRF protection, pass `withXsrfProtection()` when instantiating `HttpClient` or in `setupHttpClient`:

```ts
const http = new HttpClient(
  withXsrfProtection()
);
```

If your backend service uses different names for the XSRF token cookie or header, customize the cookie name and header name:

```ts
withXsrfProtection({
  cookieName: 'CUSTOM_XSRF_TOKEN',
  headerName: 'X-Custom-Xsrf-Header',
});
```

By default, the interceptor sends this header on all requests except GET/HEAD (e.g., POST) to relative URLs but does not send this header on requests with absolute URLs.

> [!NOTE]
> #### Why not protect GET requests?
> CSRF protection is only necessary for requests that can change the backend state. By nature, CSRF attacks cross domain boundaries, and the web's same-origin policy prevents an attack page from retrieving the results of an authenticated GET request.

To take advantage of this, your server needs to set a token in a cookie named `XSRF-TOKEN` when the page loads or on the first GET request. On subsequent requests, the server can verify that the cookie matches the `X-XSRF-TOKEN` HTTP header, ensuring that only code running on your domain can send requests. The token must be unique for each user and verifiable by the server; this prevents clients from creating their own tokens.

> [!NOTE]
> #### HttpClient only supports the client-side part of the XSRF protection scheme
> Your backend service must be configured to set the cookie for your pages and verify the header's presence on all eligible requests. If not, HttpClient's XSRF protection will not be effective.

## Global Configuration

You can use the `setupHttpClient` function for global configuration:

```ts
setupHttpClient(
  withFetch(),
  withXsrfProtection(),
);
```

## Testing Requests

Refer to https://angular.dev/guide/http/testing

## API Differences

Although `@ngify/http` maintains a high degree of consistency with `@angular/common/http` in terms of API, there are still some important differences:

| Difference      | @angular/common/http                         | @ngify/http                                                 |
| --------------- | -------------------------------------------- | ----------------------------------------------------------- |
| JSONP           | `http.jsonp()`                               | Not supported                                               |
| Params          | `http.get('url', { params: { k: 'v' } })`    | `http.get('url', { k: 'v' })`                               |
| fromObject      | `new HttpParams({ fromObject: { k: 'v' } })` | `new HttpParams({ k: 'v' })`                                |
| fromString      | `new HttpParams({ fromString: 'k=v' })`      | `new HttpParams('k=v')`                                     |
| setParams       | `request.clone({ setParams: { k: 'v' } })`   | `request.clone({ params: request.params.set('k', 'v') })`   |
| setHeaders      | `request.clone({ setHeaders: { k: 'v' } })`  | `request.clone({ headers: request.headers.set('k', 'v') })` |
| request()       | `http.request('GET', 'url')`                 | `http.request(new HttpRequest('GET', 'url'))`               |
| XSRF Protection | Enabled by default                           | Disabled by default                                         |

## Migration

To migrate from v1 to v2, you need to make the following changes:

1. Remove the `setupConfig` function and replace it with `setupHttpClient`:

```ts
// before
setupConfig({
  backend: new HttpFetchBackend(),
});
// after
setupHttpClient(
  withFetch()
);
```
2. The constructor signature of `HttpClient` has changed, and you now need to pass `HttpFeature` configurations:

```ts
// before
const http = new HttpClient([
  new CustomInterceptor()
]);
// after
const http = new HttpClient(
  withLegacyInterceptors([new CustomInterceptor()])
);
```

```ts
// before
const http = new HttpClient({
  backend: new HttpFetchBackend(),
  interceptors: [new CustomInterceptor()]
});
// after
const http = new HttpClient(
  withFetch(),
  withLegacyInterceptors([new CustomInterceptor()])
);
```

3. If you are using `@ngify/http/fetch`, update the import path to `@ngify/http`.
4. If you are using `@ngify/http/wx`, install the [`@ngify/http-wx`](https://github.com/ngify/ngify/blob/main/packages/http-wx) package and update the import path.
5. v2 only supports ESM and no longer supports CommonJS, if you need to use CommonJS, please continue to use v1.
