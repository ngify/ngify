import 'reflect-metadata';
import { Observable } from 'rxjs';
import { store } from "./store";
import { SymbolKey } from "./symbols";
import { Utils } from './utils';

export function State(stateName: string): ClassDecorator {
  return (target: any) => class extends target {
    constructor() {
      super(...arguments);
      Reflect.defineMetadata(Symbol.for(SymbolKey.StateName), stateName, target.prototype);
      store.put(target, this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    descriptor.value = function () {
      const stateName = Utils.getStateName(target);
      const returnValue = fn.apply(this, arguments);

      if (returnValue instanceof Promise) {
        returnValue.then(() => store.dispatch(stateName, action || propertyKey, this));
      } else if (returnValue instanceof Observable) {
        returnValue.subscribe(() => store.dispatch(stateName, action || propertyKey, this));
      } else {
        store.dispatch(stateName, action || propertyKey, this);
      }

      return returnValue;
    }
  };
}
