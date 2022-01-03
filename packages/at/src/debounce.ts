const map = new WeakMap();

/**
 * Debounce decorator for class methods
 * @param wait
 */
export function Debounce(wait: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const fn = descriptor.value as (...args: any[]) => void;

    descriptor.value = function (...args: any[]) {
      map.has(this) || map.set(this, setTimeout(() => {
        fn.apply(this, args);
        map.delete(this);
      }, wait));
    };
  }
}