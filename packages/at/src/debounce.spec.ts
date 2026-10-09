import { Debounce } from '@ngify/at';

describe('Debounce', () => {
  afterEach(() => {
    vitest.useRealTimers();
  });

  it('should call once', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Debounce(100)
      debounce() {
        cb();
      }
    }();

    obj.debounce();
    obj.debounce();

    expect(cb).toHaveBeenCalledTimes(0);
  });

  it('should not call', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Debounce(100, { edges: ['leading'] })
      debounce() {
        cb();
      }
    }();

    obj.debounce();
    obj.debounce();

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should debounce an async method with the latest arguments and context', async () => {
    vitest.useFakeTimers();
    const cb = vitest.fn();

    const obj = new class {
      value = 'value';

      @Debounce(100)
      async debounce(arg: string): Promise<void> {
        await Promise.resolve();
        cb(this.value, arg);
      }
    }();

    expect(obj.debounce('first')).toBeUndefined();
    await vitest.advanceTimersByTimeAsync(50);
    obj.debounce('last');
    await vitest.advanceTimersByTimeAsync(99);

    expect(cb).not.toHaveBeenCalled();

    await vitest.advanceTimersByTimeAsync(1);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('value', 'last');
  });

  it('should debounce a method returning Promise<void> on the leading edge', async () => {
    vitest.useFakeTimers();
    const cb = vitest.fn();

    const obj = new class {
      @Debounce(100, { edges: ['leading'] })
      debounce(): Promise<void> {
        return Promise.resolve().then(() => {
          cb();
        });
      }
    }();

    obj.debounce();
    obj.debounce();
    await vitest.advanceTimersByTimeAsync(100);

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
