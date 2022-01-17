import { SafeAny } from '@ngify/types';

const map = new WeakMap();

/**
 * Debounce decorator for class methods
 * @param wait
 */
export function Debounce(wait: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    const fn = descriptor.value as (...args: SafeAny[]) => void;

    descriptor.value = function (...args: SafeAny[]) {
      map.has(this) || map.set(this, setTimeout(() => {
        fn.apply(this, args);
        map.delete(this);
      }, wait));
    };
  }
}