import { Debounce } from '../src/debounce';
import { Delay } from '../src/delay';
import { Throttle } from '../src/throttle';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('Timer', () => {
  class Cls {
    @Throttle(1000)
    throttle() { }

    @Throttle(1000)
    throttle2() { }

    @Debounce(2000)
    debounce(cb: () => void) { cb(); }

    @Debounce(2000)
    debounce2(cb: () => void) { cb(); }

    @Delay(3000)
    delay() { }
  }

  let obj: Cls;

  beforeEach(() => {
    obj = new Cls();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('throttle', () => {
    it('basic usage', () => {
      obj.throttle();
      obj.throttle();
      obj.throttle();

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

  });

  describe('debounce', () => {
    it('basic usage', () => {
      const cb = jest.fn();
      obj.debounce(cb);
      obj.debounce(cb);
      obj.debounce(cb);

      const cb2 = jest.fn();
      obj.debounce2(cb2);
      obj.debounce2(cb2);
      obj.debounce2(cb2);

      jest.runAllTimers();

      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(6);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
    });
  });

  describe('delay', () => {
    it('basic usage', () => {
      obj.delay();

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    });
  });
});
