/**
 * Delay decorator for class methods
 * @param delay
 */
export function Delay(delay: number): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const fn = descriptor.value as (...args: any[]) => void;

    descriptor.value = function (...args: any[]) {
      setTimeout(() => fn.apply(this, args), delay);
    };
  }
}