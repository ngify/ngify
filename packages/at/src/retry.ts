import { SafeAny, Type } from '@ngify/types';

type RetryOptions = {
  include?: Type<unknown>[],
  exclude?: Type<unknown>[],
  maxAttemps?: number,
  backoff?: number | ((serial: number) => number)
}

const DEFAULT_MAX_ATTEMPS = 3;

export function Retryable(options: number | Type<unknown>[] | RetryOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    let maxAttemps: number = DEFAULT_MAX_ATTEMPS;
    let remainingAttemps: number;
    let include: RetryOptions['include'];
    let exclude: RetryOptions['exclude'];
    let backoff: RetryOptions['backoff'];

    switch (true) {
      case typeof options === 'number':
        maxAttemps = Math.round(options as number);
        break;

      case Array.isArray(options):
        include = options as Type<unknown>[];
        break;

      case typeof options === 'object':
        include = (options as RetryOptions).include;
        exclude = (options as RetryOptions).exclude;
        maxAttemps = (options as RetryOptions).maxAttemps || DEFAULT_MAX_ATTEMPS;
        backoff = (options as RetryOptions).backoff;
        break;
    }

    remainingAttemps = maxAttemps;

    const fn = descriptor.value as (...args: SafeAny[]) => void;

    descriptor.value = function (...args: SafeAny[]) {
      try {
        fn.apply(this, args);
      } catch (error) {
        if (isInlude(include, error) && !isExclude(exclude, error) && --remainingAttemps >= 0) {
          if (!backoff) {
            return descriptor.value.apply(this, args);
          }

          if (typeof backoff === 'number') {
            return setTimeout(() => {
              descriptor.value.apply(this, args);
            }, backoff);
          }

          setTimeout(() => {
            descriptor.value.apply(this, args);
          }, backoff(maxAttemps - remainingAttemps));
        }
      }
    };
  }
}

const isInlude = (include: RetryOptions['include'], error: unknown) => {
  if (!include) {
    return true;
  }

  for (const clazz of include) {
    if (error instanceof clazz) {
      return true;
    }
  }

  return false;
}

const isExclude = (exclude: RetryOptions['exclude'], error: unknown) => {
  if (!exclude) {
    return false;
  }

  for (const clazz of exclude) {
    if (error instanceof clazz) {
      return true;
    }
  }

  return false;
}