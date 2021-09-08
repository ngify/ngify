export * from './backend';
export * from './client';
export * from './header';
export * from './interceptor';
export * from './request';
export * from './response';

// import { map } from 'rxjs';
// import { HttpClient, HttpHandler, HttpInterceptor, HttpRequest } from './http';

// const client = new HttpClient();
// client.intercept([
//   new class implements HttpInterceptor {
//     intercept(opt: HttpRequest, next: HttpHandler) {
//       opt.a = 'a';
//       return next.handle(opt).pipe(map(res => res + '-a'));
//     }
//   },
//   new class implements HttpInterceptor {
//     intercept(opt: HttpRequest, next: HttpHandler) {
//       opt.b = 'b';
//       return next.handle(opt).pipe(map(res => res + '-b'));
//     }
//   },
//   new class implements HttpInterceptor {
//     intercept(opt: HttpRequest, next: HttpHandler) {
//       opt.c = 'c';
//       return next.handle(opt).pipe(map(res => res + '-c'));
//     }
//   },
// ]);

// client.request({ o: 'o' }).subscribe(res => console.log('被拦截后的响应', res))
