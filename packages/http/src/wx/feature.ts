import { HttpFeatureKind } from '../feature';
import { HttpWxBackend } from './backend';

export function withWx() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpWxBackend()
  } as const;
}
