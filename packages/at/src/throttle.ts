import type { SafeAny } from '@ngify/types';
import { throttle, type ThrottleSettings } from 'lodash-es';

/**
 * Throttle decorator for class methods
 * @param wait
 */
export function Throttle(wait: number, options?: ThrottleSettings) {
  return function <This, Args extends SafeAny[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    const fn = throttle(target, wait, options)
    return function (this: This, ...args: Args): void {
      fn.apply(this, args) as Return;
    }
  }
}
