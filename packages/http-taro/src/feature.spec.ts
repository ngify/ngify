import { HttpFeatureKind } from '@ngify/http';
import { withTaro } from './feature';

describe('HttpFeature', () => {
  it('withTaro', () => {
    expect(withTaro().kind).toBe(HttpFeatureKind.Backend);
  });
});
