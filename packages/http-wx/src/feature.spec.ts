import { HttpFeatureKind } from '@ngify/http';
import { withWx } from './feature';

describe('HttpFeature', () => {
  it('withWx', () => {
    expect(withWx().kind).toBe(HttpFeatureKind.Backend);
  });
});
