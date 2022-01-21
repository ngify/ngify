import { SafeAny } from '@ngify/types';

const map = new WeakMap();

/**
 * Throttle decorator for class methods
 * @param wait
 */
export function Throttle(wait: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    const fn = descriptor.value as (...args: SafeAny[]) => void;

    descriptor.value = function (...args: SafeAny[]) {
      map.has(fn) || map.set(fn, setTimeout(() => {
        fn.apply(this, args);
        map.delete(fn);
      }, wait));
    };
  }
}
