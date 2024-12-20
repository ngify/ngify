import { Throttle } from '@ngify/at';

describe('Throttle', () => {
  it('should call once', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Throttle(100)
      throttle() {
        cb();
      }
    }();

    obj.throttle();
    obj.throttle();

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should not call', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Throttle(100, { edges: ['leading'] })
      throttle() {
        cb();
      }
    }();

    obj.throttle();
    obj.throttle();

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
