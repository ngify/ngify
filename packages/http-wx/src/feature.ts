import { HttpFeatureKind } from '@ngify/http';
import { HttpWxBackend } from './backend';

export function withWx() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpWxBackend()
  } as const;
}
