import type { SafeAny } from '@ngify/types';

/**
 * Delay decorator for class methods
 * @param delay
 */
export function Delay(delay: number) {
  return function <This, Args extends SafeAny[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
  ) {
    return function (this: This, ...args: Args): void {
      setTimeout(() => {
        target.apply(this, args);
      }, delay);
    }
  }
}
