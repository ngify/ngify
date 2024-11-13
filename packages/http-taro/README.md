# @ngify/http-taro

[![version](https://img.shields.io/npm/v/@ngify/http-taro/latest.svg)](https://www.npmjs.com/package/@ngify/http-taro)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)

`@ngify/http` 的 Taro HTTP 请求适配器。

## 安装

```bash
npm install @ngify/http-taro
```

## API

有关完整的 API 定义，请访问 [https://ngify.github.io/ngify](https://ngify.github.io/ngify/modules/_ngify_http_taro.html).


## 基本用法

```ts
import { withTaro } from '@ngify/http-taro';

const http = new HttpClient(
  withTaro()
);
// or
setupHttpClient(
  withTaro()
);
```

## 额外参数

Taro 请求还支持更多额外的参数，使用 `HttpContext` 来传递它们：

```ts
import { TARO_UPLOAD_FILE_TOKEN, TARO_DOWNLOAD_FILE_TOKEN, TARO_REQUSET_TOKEN } from '@ngify/http-taro';

// 开启 HTTP2
http.get('/api', {
  context: new HttpContext().set(TARO_REQUSET_TOKEN, {
    enableHttp2: true,
  })
});

// 文件上传
http.post('url', null, {
  context: new HttpContext().set(TARO_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName'
  })
});

// 文件下载
http.get('/api', {
  context: new HttpContext().set(TARO_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath'
  })
});
```
