import type { SafeAny } from '@ngify/core';

/**
 * Limit decorator for class methods
 * @param limit
 */
export function Limit(limit: number) {
  return function <This, Args extends SafeAny[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    let lastReturn: Return;
    return function (this: This, ...args: Args): Return {
      if (limit-- > 0) {
        return lastReturn = target.apply(this, args);
      }
      return lastReturn;
    };
  };
}

/**
 * Once decorator for class methods
 * @param limit
 */
export function Once() {
  return Limit(1);
}
