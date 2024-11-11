# @ngify/http-uni

[![version](https://img.shields.io/npm/v/@ngify/http-uni/latest.svg)](https://www.npmjs.com/package/@ngify/http-uni)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)

`@ngify/http` 的 Uni app HTTP 请求适配器。

## 安装

```bash
npm install @ngify/http-uni
```

## API

有关完整的 API 定义，请访问 [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http_uni.html).


## 基本用法

```ts
import { withUni } from '@ngify/http-uni';

const http = new HttpClient(
  withUni()
);
// or
setupHttpClient(
  withUni()
);
```

## 额外参数

Uni app 请求还支持更多额外的参数，使用 `HttpContext` 来传递它们：

```ts
import { UNI_UPLOAD_FILE_TOKEN, UNI_DOWNLOAD_FILE_TOKEN, UNI_REQUSET_TOKEN } from '@ngify/http-uni';

// 开启 HTTP2
http.get('url', params, {
  context: new HttpContext().set(UNI_REQUSET_TOKEN, {
    enableHttp2: true,
  })
});

// 文件上传
http.post('url', params, {
  context: new HttpContext().set(UNI_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName'
  })
});

// 文件下载
http.get('url', params, {
  context: new HttpContext().set(UNI_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath'
  })
});
```
