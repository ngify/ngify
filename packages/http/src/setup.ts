import type { HttpBackend } from './backend';
import { HttpFeatureKind, withXhr } from './feature';
import { HttpInterceptorFn } from './interceptor';

interface HttpConfig {
  /** The default HTTP backend handler */
  backend: HttpBackend;
  interceptorFns: HttpInterceptorFn[];
}

type HttpSetupFeature =
  | { kind: HttpFeatureKind.Backend, value: HttpBackend }
  | { kind: HttpFeatureKind.XsrfProtection, value: HttpInterceptorFn };

export const config: HttpConfig = {
  backend: withXhr().value,
  interceptorFns: []
};

export function setupHttpClient(...features: HttpSetupFeature[]) {
  for (const { kind, value } of features) {
    switch (kind) {
      case HttpFeatureKind.Backend:
        config.backend = value;
        break;

      case HttpFeatureKind.XsrfProtection:
        config.interceptorFns.push(value);
        break
    }
  }
}
