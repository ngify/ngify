import { Throttle } from '@ngify/at';

describe('Throttle', () => {
  afterEach(() => {
    vitest.useRealTimers();
  });

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

  it('should throttle an async method on the leading edge', async () => {
    vitest.useFakeTimers();
    const cb = vitest.fn();

    const obj = new class {
      @Throttle(100, { edges: ['leading'] })
      async throttle(arg: string): Promise<void> {
        await Promise.resolve();
        cb(arg);
      }
    }();

    expect(obj.throttle('first')).toBeUndefined();
    obj.throttle('second');
    await vitest.advanceTimersByTimeAsync(100);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('first');

    obj.throttle('third');
    await vitest.advanceTimersByTimeAsync(100);

    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenLastCalledWith('third');
  });

  it('should throttle a method returning Promise<void> on the trailing edge', async () => {
    vitest.useFakeTimers();
    const cb = vitest.fn();

    const obj = new class {
      @Throttle(100, { edges: ['trailing'] })
      throttle(arg: string): Promise<void> {
        return Promise.resolve().then(() => {
          cb(arg);
        });
      }
    }();

    obj.throttle('first');
    obj.throttle('last');
    await vitest.advanceTimersByTimeAsync(99);

    expect(cb).not.toHaveBeenCalled();

    await vitest.advanceTimersByTimeAsync(1);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('last');
  });
});
