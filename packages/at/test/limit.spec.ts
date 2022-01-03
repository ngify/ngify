import { Limit, Once } from '../src/limit';

describe('Limit', () => {
  class Cls {
    @Limit(2)
    limit(cb: () => void) { cb(); }

    @Once()
    once(cb: () => void) { cb(); }
  }

  let obj: Cls;

  beforeEach(() => {
    obj = new Cls();
  });

  describe('limit', () => {
    it('basic usage', () => {
      const cb = jest.fn()
      obj.limit(cb);
      obj.limit(cb);
      obj.limit(cb);

      expect(cb).toHaveBeenCalledTimes(2);
    });
  });

  describe('once', () => {
    it('basic usage', () => {
      const cb = jest.fn()
      obj.once(cb);
      obj.once(cb);

      expect(cb).toHaveBeenCalledTimes(1);
    });
  });
});
