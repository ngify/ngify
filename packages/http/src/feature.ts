import { HttpBackend } from './backend';
import { FetchBackend } from './fetch';
import { HttpInterceptor, HttpInterceptorFn } from './interceptor';
import { HttpXhrBackend } from './xhr';

export enum HttpFeatureKind {
  Backend,
  Interceptors,
  LegacyInterceptors,
}

export type HttpFeature =
  | { kind: HttpFeatureKind.Backend, value: HttpBackend }
  | { kind: HttpFeatureKind.Interceptors, value: HttpInterceptorFn[] }
  | { kind: HttpFeatureKind.LegacyInterceptors, value: HttpInterceptor[] };

export function withXhr(factory?: () => XMLHttpRequest) {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpXhrBackend(factory)
  } as const;
}

export function withFetch(fetchImpl?: typeof fetch) {
  return {
    kind: HttpFeatureKind.Backend,
    value: new FetchBackend(fetchImpl)
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
