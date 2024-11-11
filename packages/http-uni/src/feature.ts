import { HttpFeatureKind } from '@ngify/http';
import { HttpUniBackend } from './backend';

export function withUni() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpUniBackend()
  } as const;
}
