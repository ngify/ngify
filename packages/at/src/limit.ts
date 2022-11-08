import { SafeAny } from '@ngify/types';

/**
 * Limit decorator for class methods
 * @param limit
 */
export function Limit(limit: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    const fn = descriptor.value as (...args: SafeAny[]) => void;

    descriptor.value = function (...args: SafeAny[]) {
      limit-- > 0 && fn.apply(this, args);
    };
  };
}

/**
 * Once decorator for class methods
 * @param limit
 */
export function Once(): MethodDecorator {
  return Limit(1);
}
