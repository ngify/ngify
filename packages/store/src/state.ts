import { Observable, tap } from 'rxjs';
import { store } from './store';

export function State(): ClassDecorator {
  return (target: any) => class extends target {
    constructor() {
      super(...arguments);
      store.put(this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    descriptor.value = function () {
      const returnValue = fn.apply(this, arguments);

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
