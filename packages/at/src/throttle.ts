const map = new WeakMap();

/**
 * Throttle decorator for class methods
 * @param wait
 */
export function Throttle(wait: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const fn = descriptor.value as (...args: any[]) => void;

    descriptor.value = function (...args: any[]) {
      map.has(this) && clearTimeout(map.get(this));
      map.set(this, setTimeout(() => fn.apply(this, args), wait));
    };
  }
}
