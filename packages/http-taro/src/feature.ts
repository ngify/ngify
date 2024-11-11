import { HttpFeatureKind } from '@ngify/http';
import { HttpTaroBackend } from './backend';

export function withTaro() {
  return {
    kind: HttpFeatureKind.Backend,
    value: new HttpTaroBackend()
  } as const;
}
