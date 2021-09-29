import 'reflect-metadata';
import { Observable, tap } from 'rxjs';
import { store } from "./store";
import { STATE_KEY } from './symbol';

export function State(): ClassDecorator {
  return (target: any) => class extends target {
    constructor() {
      super(...arguments);
      Reflect.defineMetadata(STATE_KEY, target, target.prototype);
      store.put(target, this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    descriptor.value = function () {
      const returnValue = fn.apply(this, arguments);

      if (returnValue instanceof Promise) {
        returnValue.then(() => store.dispatch(action || propertyKey, this));
      } else if (returnValue instanceof Observable) {
        returnValue.pipe(tap(() => store.dispatch(action || propertyKey, this)));
      } else {
        store.dispatch(action || propertyKey, this);
      }

      return returnValue;
    }
  };
}
