import type { SafeAny } from '@ngify/types';

/**
 * Delay decorator for class methods
 * @param delay
 */
export function Delay(delay: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    const fn = descriptor.value as (...args: SafeAny[]) => void;

    descriptor.value = function (...args: SafeAny[]) {
      setTimeout(() => fn.apply(this, args), delay);
    };
  };
}