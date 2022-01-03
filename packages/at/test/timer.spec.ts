import { Debounce } from '../src/debounce';
import { Delay } from '../src/delay';
import { Throttle } from '../src/throttle';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('Timer', () => {
  class Cls {
    @Throttle(1000)
    throttle() { }

    @Debounce(2000)
    debounce() { }

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

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('should be throttle', () => {
      obj.throttle();
      obj.throttle();
      obj.throttle();

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenCalledTimes(3);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });
  });

  describe('debounce', () => {
    it('basic usage', () => {
      obj.debounce();
      obj.debounce();
      obj.debounce();

      jest.runAllTimers();

      expect(setTimeout).toHaveBeenCalledTimes(1);
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
