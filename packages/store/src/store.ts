import { Type } from '@ngify/types';
import { filter, map, Observable, Subject } from "rxjs";
import { SymbolKey } from './symbols';

export const store = new class Store {
  subject = new Subject<{ name: string, action: string, state: any }>();
  states = {};

  get(name: string) {
    return this.states[name];
  }

  put(name: string, state: Object) {
    this.states[name] = state;
  }

  dispatch<T = any>(name: string, action: string, state: T) {
    Object.assign(this.states[name], state);
    this.subject.next({ name, action, state });
  }

  on<T = any>(clazz: Type<T>, action?: string): Observable<T> {
    const stateName = Reflect.getMetadata(Symbol.for(SymbolKey.StateName), clazz.prototype);

    return this.subject.asObservable().pipe(
      filter(o => o.name === stateName && action ? o.action === action : true),
      map(o => o.state)
    );
  }
}
