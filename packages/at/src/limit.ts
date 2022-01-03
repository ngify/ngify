/**
 * Limit decorator for class methods
 * @param limit
 */
export function Limit(limit: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const fn = descriptor.value as (...args: any[]) => void;

    descriptor.value = function (...args: any[]) {
      limit-- > 0 && fn.apply(this, args);
    };
  }
}

/**
 * Once decorator for class methods
 * @param limit
 */
export function Once(): MethodDecorator {
  return Limit(1);
}
