import { Retryable } from '../src/retry';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('Retry', () => {
  class CustomError extends Error { }

  class Cls {
    @Retryable(2)
    retryWithMaxAttemps(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      maxAttemps: 3
    })
    retryWithMaxAttempsOptions(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable([CustomError])
    retryWithIncludeThrowCustomError(cb: () => void) {
      cb(); throw new CustomError();
    }

    @Retryable([CustomError])
    retryWithIncludeThrowOtherError(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      include: [CustomError]
    })
    retryWithIncludeOptionsThrowCustomError(cb: () => void) {
      cb(); throw new CustomError();
    }

    @Retryable({
      include: [CustomError]
    })
    retryWithIncludeOptionsThrowOtherError(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      exclude: [CustomError]
    })
    retryWithExcludeOptionsThrowCustomError(cb: () => void) {
      cb(); throw new CustomError();
    }

    @Retryable({
      exclude: [CustomError]
    })
    retryWithExcludeOptionsThrowOtherError(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      maxAttemps: 1,
      backoff: 1000
    })
    retryWithBackoffOptions(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      maxAttemps: 2,
      backoff: () => 1000
    })
    retryWithBackoffFunctionOptions(cb: () => void) {
      cb(); throw Error();
    }

    @Retryable({
      maxAttemps: 3,
      backoff: (index) => index * 1000
    })
    retryWithBackoffFunction2Options(cb: () => void) {
      cb(); throw Error();
    }
  }

  let obj: Cls;

  beforeEach(() => {
    obj = new Cls();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('retryable', () => {
    it('should retry 2 times (maxAttemps)', () => {
      const cb = jest.fn()
      obj.retryWithMaxAttemps(cb);

      expect(cb).toHaveBeenCalledTimes(2 + 1);
    });

    it('should retry 3 times (options.maxAttemps)', () => {
      const cb = jest.fn()
      obj.retryWithMaxAttempsOptions(cb);

      expect(cb).toHaveBeenCalledTimes(3 + 1);
    });

    it('should retry throwing custom error method 3 times (include)', () => {
      const cb = jest.fn()
      obj.retryWithIncludeThrowCustomError(cb);

      expect(cb).toHaveBeenCalledTimes(3 + 1);
    });

    it('should not retry throw other error methods (include)', () => {
      const cb = jest.fn()
      obj.retryWithIncludeThrowOtherError(cb);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should retry throwing custom error method 3 times (options.include)', () => {
      const cb = jest.fn()
      obj.retryWithIncludeOptionsThrowCustomError(cb);

      expect(cb).toHaveBeenCalledTimes(3 + 1);
    });

    it('should not retry throw other error methods (options.include)', () => {
      const cb = jest.fn()
      obj.retryWithIncludeOptionsThrowOtherError(cb);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should not retry throw other error methods (options.exclude)', () => {
      const cb = jest.fn()
      obj.retryWithExcludeOptionsThrowCustomError(cb);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should retry throwing custom error method 3 times (options.exclude)', () => {
      const cb = jest.fn()
      obj.retryWithExcludeOptionsThrowOtherError(cb);

      expect(cb).toHaveBeenCalledTimes(3 + 1);
    });

    it('should retry after one second (options.backoff = number)', () => {
      const cb = jest.fn()
      obj.retryWithBackoffOptions(cb);

      jest.runAllTimers();

      expect(cb).toHaveBeenCalledTimes(1 + 1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('should retry after two second (options.backoff = () => number)', () => {
      const cb = jest.fn()
      obj.retryWithBackoffFunctionOptions(cb);

      jest.runAllTimers();

      expect(cb).toHaveBeenCalledTimes(2 + 1);
      expect(setTimeout).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });

    it('There should be a first retry after one second, then two seconds, then three seconds (options.backoff = () => number)', () => {
      const cb = jest.fn()
      obj.retryWithBackoffFunction2Options(cb);

      jest.runAllTimers();

      expect(cb).toHaveBeenCalledTimes(3 + 1);
      expect(setTimeout).toHaveBeenCalledTimes(3);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
    });
  });
});
