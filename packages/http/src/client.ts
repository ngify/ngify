import { map } from 'rxjs';
import { HttpBackend, HttpHandler } from './backend';
import { WxHttpBackend } from './backends';
import { HttpInterceptor, HttpInterceptorHandler } from './interceptor';
import { HttpRequest } from './request';

export class HttpClient {
  private chain: HttpHandler;

  constructor(interceptors?: HttpInterceptor[], backend?: HttpBackend) {
    if (!backend) {
      backend = new WxHttpBackend();
    }

    if (interceptors?.length > 0) {
      this.chain = interceptors.reduceRight((next, interceptor) => (
        new HttpInterceptorHandler(interceptor, next)
      ), backend);
    } else {
      this.chain = backend;
    }
  }

  request(request: HttpRequest) {
    return this.chain.handle(request).pipe(
      map(response => response.data)
    );
  }
}
