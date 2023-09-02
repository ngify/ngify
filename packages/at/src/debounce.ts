import type { SafeAny } from '@ngify/types';
import { debounce, type DebounceSettings } from 'lodash-es';

/**
 * Debounce decorator for class methods
 * @param wait
 */
export function Debounce(wait: number, options?: DebounceSettings) {
  return function <This, Args extends SafeAny[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    const fn = debounce(target, wait, options)
    return function (this: This, ...args: Args): void {
      fn.apply(this, args);
    }
  }
}
