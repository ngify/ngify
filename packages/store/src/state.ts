import 'reflect-metadata';
import { Observable } from 'rxjs';
import { store } from "./store";
import { SymbolKey } from "./symbols";

export function State(): ClassDecorator {
  return (target: any) => class extends target {
    constructor() {
      super(...arguments);
      Reflect.defineMetadata(Symbol.for(SymbolKey.StateKey), target, target.prototype);
      store.put(target, this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    descriptor.value = function () {
      // const key = Utils.getStateKey(target);
      const returnValue = fn.apply(this, arguments);

      if (returnValue instanceof Promise) {
        returnValue.then(() => store.dispatch(action || propertyKey, this));
      } else if (returnValue instanceof Observable) {
        returnValue.subscribe(() => store.dispatch(action || propertyKey, this));
      } else {
        store.dispatch(action || propertyKey, this);
      }

      return returnValue;
    }
  };
}
