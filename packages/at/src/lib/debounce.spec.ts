import { Debounce } from '@ngify/at';

describe('Debounce', () => {
  it('should call once', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Debounce(100)
      debounce() {
        cb()
      }
    }

    obj.debounce();
    obj.debounce();

    expect(cb).toHaveBeenCalledTimes(0);
  });

  it('should not call', () => {
    const cb = vitest.fn();

    const obj = new class {
      @Debounce(100, { leading: true })
      debounce() {
        cb()
      }
    }

    obj.debounce();
    obj.debounce();

    expect(cb).toHaveBeenCalledTimes(1);
  });
});
