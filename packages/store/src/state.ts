import 'reflect-metadata';
import { Observable } from 'rxjs';
import { store } from "./store";
import { SymbolKey } from "./symbols";

export function State(stateName: string): ClassDecorator {
  return (target: any) => class extends target {
    constructor() {
      super(...arguments);
      Reflect.defineMetadata(Symbol.for(SymbolKey.StateName), stateName, target.prototype);
      store.put(stateName, this);
    }
  } as typeof target;
}

export function Action(action?: string): MethodDecorator {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = descriptor.value;

    descriptor.value = function () {
      const returnValue = fn.apply(this, arguments);
      const stateName = Reflect.getMetadata(Symbol.for(SymbolKey.StateName), target);

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
