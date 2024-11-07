import { HttpBackend } from './backend';
import { HttpFetchBackend } from './fetch';
import { HttpInterceptor, HttpInterceptorFn } from './interceptor';
import { HttpXhrBackend } from './xhr';
import { xsrfInterceptor } from './xsrf';

export enum HttpFeatureKind {
  Backend,
  Interceptors,
  LegacyInterceptors,
  Xsrf
}

export type HttpFeature =
  | { kind: HttpFeatureKind.Backend, value: HttpBackend }
  | { kind: HttpFeatureKind.Interceptors, value: HttpInterceptorFn[] }
  | { kind: HttpFeatureKind.LegacyInterceptors, value: HttpInterceptor[] }
  | { kind: HttpFeatureKind.Xsrf, value: HttpInterceptorFn };

export function withXhr(factory?: () => XMLHttpRequest) {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpXhrBackend(factory)
  } as const;
}

export function withFetch(fetchImpl?: typeof fetch) {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpFetchBackend(fetchImpl)
  } as const;
}

export function withInterceptors(interceptorFns: HttpInterceptorFn[]) {
  return {
    kind: HttpFeatureKind.Interceptors,
    value: interceptorFns
  } as const;
}

export function withLegacyInterceptors(interceptors: HttpInterceptor[]) {
  return {
    kind: HttpFeatureKind.LegacyInterceptors,
    value: interceptors
  } as const;
}

export function withXsrf(options?: { cookieName?: string; headerName?: string, tokenExtractor?: () => string | null }) {
  return {
    kind: HttpFeatureKind.Xsrf,
    value: xsrfInterceptor(options)
  } as const;
}
