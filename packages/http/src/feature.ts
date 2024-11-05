import { HttpBackend } from './backend';
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

export function withXhr() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpXhrBackend()
  };
}

export function withFetch() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpXhrBackend() // TODO: Implement fetch backend
  };
}

export function withInterceptors(interceptorFns: HttpInterceptorFn[]) {
  return {
    kind: HttpFeatureKind.Interceptors,
    value: interceptorFns
  };
}

export function withLegacyInterceptors(interceptors: HttpInterceptor[]) {
  return {
    kind: HttpFeatureKind.LegacyInterceptors,
    value: interceptors
  };
}
