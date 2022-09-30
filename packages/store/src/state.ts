import { SafeAny } from '@ngify/types';
import { Observable, tap } from 'rxjs';
import { store } from './store';

export function State(): ClassDecorator {
  return (target: SafeAny) => class extends target {
    constructor(...args: SafeAny[]) {
      super(...args);
      store.put(this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<SafeAny>) => {
    const fn = descriptor.value;

    descriptor.value = function (...args: SafeAny[]) {
      const returnValue = fn.apply(this, args);

      if (returnValue instanceof Promise) {
        return returnValue.then(o => (store.dispatch(this, action || propertyKey as string), o));
      }

      if (returnValue instanceof Observable) {
        return returnValue.pipe(tap(() => store.dispatch(this, action || propertyKey as string)));
      }

      store.dispatch(this, action || propertyKey as string);

      return returnValue;
    }
  };
}
