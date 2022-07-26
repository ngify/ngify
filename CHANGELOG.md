## [1.2.1](https://github.com/ngify/ngify/compare/v1.2.0...v1.2.1) (2022-05-06)


### Bug Fixes

* **deps:** update dependency tslib to v2.4.0 ([b67b218](https://github.com/ngify/ngify/commit/b67b218ed7d64e1cd3188f6208e76938af9f320c))
* **http:** encode + signs in query params as %2B ([#11058](https://github.com/ngify/ngify/issues/11058)) ([ee7c8fb](https://github.com/ngify/ngify/commit/ee7c8fb9efffcd57446d55a762d671f0280984fc))


### Features

* **http:** add HttpUrlEncodingCodec ([52a9abd](https://github.com/ngify/ngify/commit/52a9abd578e6cd886dc034f840e7898f1fa00838))


### Performance Improvements

* **http:** remove IE compatible code ([1b91a90](https://github.com/ngify/ngify/commit/1b91a9039847ef80edd44828775032835c9e6094))



# [1.2.0](https://github.com/ngify/ngify/compare/v1.1.2...v1.2.0) (2022-01-26)


### Bug Fixes

* **at:** fix bug ([7cebd08](https://github.com/ngify/ngify/commit/7cebd08ee5a27c7064b81c189fd687b88f48e22f))
* **at:** fix bug ([2436fa4](https://github.com/ngify/ngify/commit/2436fa41c2832778d52014483ccdfd14ccb64bfa))


### Features

* **at:** add `at` package ([c1bed80](https://github.com/ngify/ngify/commit/c1bed8093c01ca437242e7859cfc0443abf99dd6))
* **at:** add retryable decorator ([5d76528](https://github.com/ngify/ngify/commit/5d76528d51810b03771833d3c6883f42cd1a8813))
* **http:** 默认使用 XMLHttpRequest 进行 HTTP 请求 ([bebd545](https://github.com/ngify/ngify/commit/bebd5454aad417ed63a3a7b28b8737e07e3835c5))
* **http:** 中英文文档 ([3147c97](https://github.com/ngify/ngify/commit/3147c970f87daffe78c17ed7f276912b6cb73c29))
* **http:** add more overloads ([a04124b](https://github.com/ngify/ngify/commit/a04124b2a175aa299d1444a7ff0ce4b6e2479571))
* **http:** change README.md ([285d144](https://github.com/ngify/ngify/commit/285d14401962154e8b406f9b49a9f1c442cd3cc7))
* **http:** support HTTP requests using `Fetch API` ([0728eff](https://github.com/ngify/ngify/commit/0728eff7c54c31890686f6caa3fb5c3879817e68))
* **store:** 中英文文档 ([3913540](https://github.com/ngify/ngify/commit/3913540e05a72c59bdee8e5f9c4a2cc0f2d849c1))
* **store:** 中英文文档 ([ab97dab](https://github.com/ngify/ngify/commit/ab97dab599b5099b9544a44a14f79aa50aa27456))
* **store:** export Store class ([493537a](https://github.com/ngify/ngify/commit/493537a98cdd521d6087896af2df035b2c521e8c))



## [1.1.2](https://github.com/ngify/ngify/compare/v1.1.1...v1.1.2) (2021-12-01)



## [1.1.1](https://github.com/ngify/ngify/compare/v1.1.0...v1.1.1) (2021-11-30)



# [1.1.0](https://github.com/ngify/ngify/compare/v1.0.9...v1.1.0) (2021-11-29)


### Bug Fixes

* 修正依赖关系 ([8202c77](https://github.com/ngify/ngify/commit/8202c773887b2b0d932698124bf622b42e23ff11))
* **http:** allow passing `null` to params ([ea15808](https://github.com/ngify/ngify/commit/ea15808a418ed357057c78833cde8bdc01ad6a28))
* **http:** allow passing null to interceptors ([a7af4d6](https://github.com/ngify/ngify/commit/a7af4d68e17c902a12bd186d15feac6278004545))
* **http:** bug fixed ([1ce00e6](https://github.com/ngify/ngify/commit/1ce00e66e1628fcb665e42068e4ad8c1e6009b22))
* **http:** bug fixed ([485611b](https://github.com/ngify/ngify/commit/485611bc4606ddc4a6faf71605b08e1d73e3df0b))


### Features

* **http:** support global configuration ([fe99e2c](https://github.com/ngify/ngify/commit/fe99e2cc2af86a3f6495b5f8a886ba07ee5d924a))
* **http:** support XMLHttpRequest ([4b8b000](https://github.com/ngify/ngify/commit/4b8b000aadcaab4fc0f90f58981f79b97fbf5077))



## [1.0.9](https://github.com/ngify/ngify/compare/v1.0.8...v1.0.9) (2021-11-01)


### Bug Fixes

* **http:** bug fixed ([d2d920e](https://github.com/ngify/ngify/commit/d2d920ef555c9248a544cbef8e28ee1da7bf27fd))
* **http:** bug fixed ([a4d824a](https://github.com/ngify/ngify/commit/a4d824a14a9ad95eabdd993366fdd701dc79c75d))
* **http:** export WX_DOWNLOAD_FILE_TOKEN from backends ([053169b](https://github.com/ngify/ngify/commit/053169b9fa54e5c60b54cf191471011561e46f27))
* **http:** fix circular dependency ([94fca07](https://github.com/ngify/ngify/commit/94fca07283e3c64a9d1dfb993fb6a58225e6b70a))
* **store:** bug fixed ([2c27591](https://github.com/ngify/ngify/commit/2c27591206f423542dd028aedf684fa8c15ae144))


### Features

* **http:** 完善请求体与响应体的定义 ([e70032d](https://github.com/ngify/ngify/commit/e70032deaf60074094fb3e56c8e0b1a344afbc57))
* **http:** 支持上传/下载的进度侦听 ([c133a91](https://github.com/ngify/ngify/commit/c133a91b71e57626376bec8b5cd7973fafb82882))
* **http:** support abort the request ([e3db7d3](https://github.com/ngify/ngify/commit/e3db7d3486c51d738fc66e85ffadf9ba4f0a8d7b))
* **http:** support observation response and response body ([1c41892](https://github.com/ngify/ngify/commit/1c418922eddca7f1145029d618f9adece17b91e8))
* **http:** support wx download file ([e235543](https://github.com/ngify/ngify/commit/e2355437cde92978945a76666c18168068671b8b))



## [1.0.8](https://github.com/ngify/ngify/compare/v1.0.7...v1.0.8) (2021-10-18)


### Bug Fixes

* **deps:** pin dependency tslib to 2.3.1 ([8513cba](https://github.com/ngify/ngify/commit/8513cbaf3e4461614ac3eb39a22f47aaf9abe0d9))
* **http:** `HttpParams` 将把 `null` 与 `undefined` 转为空字符串 ([970ea18](https://github.com/ngify/ngify/commit/970ea18c97f529351fd1ef4fb76ef1eb0b2664fe))
* **http:** 修正 `HttpHeaders` 的克隆用法 ([92a7eba](https://github.com/ngify/ngify/commit/92a7eba3399a8ada91631ff0b5e91d4d805ecb35))
* **http:** 修正 HttpParams 克隆用法 ([ed13f34](https://github.com/ngify/ngify/commit/ed13f34258ce179463326c0299b61853c6da8b39))
* **http:** bug fixed ([b90c333](https://github.com/ngify/ngify/commit/b90c333b26c40c5177a9382bab42aae5359a3af3))
* **http:** bug fixed ([ed9e97f](https://github.com/ngify/ngify/commit/ed9e97f4c596d33533906eb29e62351963a05411))
* **http:** export `WX_UPLOAD_FILE_TOKEN` from `wx-backend` ([549e5c9](https://github.com/ngify/ngify/commit/549e5c9a1f4ada01decaa24941e2a3b105684483))
* **http:** fix the parameter type of the `has` method of the `HttpContext` class ([d9e5248](https://github.com/ngify/ngify/commit/d9e5248ad44df3b7e9d2339fd71a404c46794f19))
* **http:** support the use of strings to construct instances & bug fixed ([e75fead](https://github.com/ngify/ngify/commit/e75feade6fba8d870a3a17a5445140452df14247))


### Features

* **http:** `HttpRequest` 现在区分 `params` 和 `body` ([a18df60](https://github.com/ngify/ngify/commit/a18df601fd77ea2ca4c6982a5b29f72ba9746611))
* **http:** 调整 `HttpClient` 方法函数签名 & 移除 `upload` 方法 ([3f59837](https://github.com/ngify/ngify/commit/3f59837c748b8d96ebdeca489bc383454aacd7af))
* **http:** 调整 `HttpClient` 方法签名 ([33f051f](https://github.com/ngify/ngify/commit/33f051fd040a54408622cd70b99f5a0e86300710))
* **http:** 调整 `HttpRequest` 构造函数签名 ([3160ae9](https://github.com/ngify/ngify/commit/3160ae91626a8a33c70bfc6f8d76f7be1736a95b))
* **http:** add `HttpParams` class ([001c39b](https://github.com/ngify/ngify/commit/001c39b829600fb61bf7480d543b8a840c8136c2))
* **http:** adjust the return value of the key methods of the HttpParams class as an array ([5b25ad8](https://github.com/ngify/ngify/commit/5b25ad825da1f7b69aaaa2fefb6caa4992a2ed30))
* **http:** export the WX_UPLOAD_FILE_TOKEN from wx-backend ([a7c0cde](https://github.com/ngify/ngify/commit/a7c0cdee4523bcb26f429819105353c950386cb2))
* **http:** rename the `statusCode` property of class `HttpResponse` to `status` ([40bea92](https://github.com/ngify/ngify/commit/40bea92b1915b5cd628cfbe283ef22f4cfc0535b))
* **http:** simplify code ([1cb43db](https://github.com/ngify/ngify/commit/1cb43db75cb6ad72067807b2e0f8ef42d187eaf0))
* **http:** simplify some code ([d06fb5b](https://github.com/ngify/ngify/commit/d06fb5bef5309f34136523c68f9ef530f2452326))



## [1.0.7](https://github.com/ngify/ngify/compare/v1.0.5...v1.0.7) (2021-10-11)


### Features

* **http:** 支持小程序上传文件 ([e216419](https://github.com/ngify/ngify/commit/e216419438e0911a9edd29b70f88e5cad7a442a1))



## [1.0.5](https://github.com/ngify/ngify/compare/v1.0.4...v1.0.5) (2021-10-01)


### Bug Fixes

* **http:** fix `HttpRequestOptions` type definition ([0bf8b89](https://github.com/ngify/ngify/commit/0bf8b890befbbad591e16c40889ce70c7d2cc216))
* **http:** fix the `append` method of http-headers ([e39729f](https://github.com/ngify/ngify/commit/e39729fb10bd6b552ce17825806be3e624e1be5b))


### Features

* **http:** add `has` method for http-context ([690b48b](https://github.com/ngify/ngify/commit/690b48bef3d9a2eb03be9ed3cabc811197d516d6))



## [1.0.4](https://github.com/ngify/ngify/compare/v1.0.3...v1.0.4) (2021-09-29)


### Bug Fixes

* **build:** fix build errors ([f500344](https://github.com/ngify/ngify/commit/f5003441cb3ac3ada6af70f3ad62bbb93ae55f41))
* **http:** bug fixed ([417e7b9](https://github.com/ngify/ngify/commit/417e7b921e9cef37624456bc893ca40ccd25e9b3))
* **store:** fix to use observable to update async ([587a473](https://github.com/ngify/ngify/commit/587a473c6b6bb29802cd9f3d34dfe426e34afea1))


### Features

* **http:** add forEach method for http-context ([3a60297](https://github.com/ngify/ngify/commit/3a60297e966d06e12e25ec13f837b4d085e42282))
* **store:** 使用 State 装饰状态类不再需要填写状态名 ([f362b2c](https://github.com/ngify/ngify/commit/f362b2cf676ebfccdc6324863071d7993af417c8))



## [1.0.3](https://github.com/ngify/ngify/compare/c9d0ace055fcec91351852a727547a222d4036f5...v1.0.3) (2021-09-28)


### Bug Fixes

* **http:** bug fixed ([dc86182](https://github.com/ngify/ngify/commit/dc86182adaa292a418c8d359cee571e7e406f5c7))
* **http:** bug fixed ([e7601cf](https://github.com/ngify/ngify/commit/e7601cf545e0b64a8657101a2e68a11d52ed44ec))
* **store:** bug fixed ([c32b2c0](https://github.com/ngify/ngify/commit/c32b2c00d7ed9c6ec8ba9b85e82a0ee4a82e047f))
* **store:** fix export issues ([a6032c9](https://github.com/ngify/ngify/commit/a6032c9277258660bb49c274d0862b19ae551df8))


### Features

* 构建的同时自动输出类型声明文件 ([b0e42fd](https://github.com/ngify/ngify/commit/b0e42fde2f0dd02b572fb3330d3c064518085e79))
* add http package ([46c6387](https://github.com/ngify/ngify/commit/46c6387a990a9d947525ac61e4c5380856c223c7))
* **http:** 维护一份原始的 header names map ([2df79a3](https://github.com/ngify/ngify/commit/2df79a3db3ef7e86c72094e28d369dd269b1b6c0))
* **http:** add clone method for http-request and http-response ([b4e0dde](https://github.com/ngify/ngify/commit/b4e0dde0fb3ef24f880b8ae4bf2b021722425d14))
* **http:** add http-context feature to pass metadata ([1a6b385](https://github.com/ngify/ngify/commit/1a6b38537c871bb383411ce1766acbb54647d422))
* initialize the project ([c9d0ace](https://github.com/ngify/ngify/commit/c9d0ace055fcec91351852a727547a222d4036f5))
* remove wepy support & add a utils ([4754261](https://github.com/ngify/ngify/commit/47542612cc392878df8dca27f00af56ad545a997))
* **store:** 支持返回 Observable 进行异步更新 ([8a06e5c](https://github.com/ngify/ngify/commit/8a06e5cde8f508201e97e3916e9a14d68ae69037))
* **types:** add type Property and Method ([4c3feb6](https://github.com/ngify/ngify/commit/4c3feb6dc3191bcb9fdc0e0f562745d477d3964f))



