import { HttpFeatureKind } from '@ngify/http';
import { withUni } from './feature';

describe('HttpFeature', () => {
  it('withUni', () => {
    expect(withUni().kind).toBe(HttpFeatureKind.Backend);
  });
});
