import { Type } from '@ngify/types';
import { filter, map, Observable, Subject } from "rxjs";
import { Utils } from './utils';

export const store = new class Store {
  subject = new Subject<{ name: string, action: string, state: any }>();
  states = {};

  get<T = any>(clazz: Type<T>): T {
    const stateName = Utils.getStateName(clazz.prototype);
    return this.states[stateName];
  }

  put<T = any>(clazz: Type<T>, state: T) {
    const stateName = Utils.getStateName(clazz.prototype);
    this.states[stateName] = state;
  }

  dispatch<T = any>(name: string, action: string, state: T) {
    Object.assign(this.states[name], state);
    this.subject.next({ name, action, state });
  }

  on<T = any>(clazz: Type<T>, action?: string): Observable<T> {
    const stateName = Utils.getStateName(clazz.prototype);

    return this.subject.asObservable().pipe(
      filter(o => o.name === stateName && action ? o.action === action : true),
      map(o => o.state)
    );
  }
}
