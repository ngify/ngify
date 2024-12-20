import type { SafeAny } from '@ngify/core';
import { debounce } from 'es-toolkit';

/**
 * Debounce decorator for class methods
 * @param wait
 */
export function Debounce(wait: number, options?: Parameters<typeof debounce>[2]) {
  return function <This, Args extends SafeAny[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    const fn = debounce(target, wait, options);
    return function (this: This, ...args: Args): void {
      fn.apply(this, args);
    };
  };
}
