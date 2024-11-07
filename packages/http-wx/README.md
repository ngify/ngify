# @ngify/http-wx

[![version](https://img.shields.io/npm/v/@ngify/http-wx/latest.svg)](https://www.npmjs.com/package/@ngify/http-wx)
![Node.js CI](https://github.com/ngify/ngify/workflows/Node.js%20CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/ngify/ngify/badge)](https://www.codefactor.io/repository/github/ngify/ngify)

`@ngify/http` 的微信 HTTP 请求适配器。

## 安装

```bash
npm install @ngify/http-wx
```

## 基本用法

```ts
import { HttpClient } from '@ngify/http';
import { withWx } from '@ngify/http-wx';

const http = new HttpClient(
  withWx()
);
```

## 小程序参数

小程序请求还支持更多额外的参数，使用 `HttpContext` 来传递它们：

```ts
import { HttpContext, WX_UPLOAD_FILE_TOKEN, WX_DOWNLOAD_FILE_TOKEN, WX_REQUSET_TOKEN } from '@ngify/http-wx';

// 微信小程序开启 HTTP2
http.get('url', params, {
  context: new HttpContext().set(WX_REQUSET_TOKEN, {
    enableHttp2: true,
  })
});

// 微信小程序文件上传
http.post('url', params, {
  context: new HttpContext().set(WX_UPLOAD_FILE_TOKEN, {
    filePath: 'filePath',
    fileName: 'fileName'
  })
});

// 微信小程序文件下载
http.get('url', params, {
  context: new HttpContext().set(WX_DOWNLOAD_FILE_TOKEN, {
    filePath: 'filePath'
  })
});
```
