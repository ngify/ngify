import { Type } from '@ngify/types';
import { filter, map, Observable, Subject } from "rxjs";
import { Utils } from './utils';

class Store {
  private readonly subject = new Subject<{ key: object, action: string, state: any }>();
  private readonly states = new Map<object, object>();

  get<T extends object = any>(clazz: Type<T>): T {
    const key = Utils.getStateKey(clazz.prototype);
    return this.states.get(key) as T;
  }

  put<T extends object = any>(clazz: Type<T>, state: T) {
    const key = Utils.getStateKey(clazz.prototype);
    this.states.set(key, state);
  }

  dispatch<T extends object = any>(action: string, state: T) {
    const key = Utils.getStateKey(state);
    state = { ...state };
    this.states.set(key, Object.assign(this.states.get(key), state));
    this.subject.next({ key, action, state });
  }

  on<T extends object = any>(clazz: Type<T>, action?: string): Observable<T> {
    const key = Utils.getStateKey(clazz.prototype);

    return this.subject.asObservable().pipe(
      filter(o => o.key === key),
      filter(o => action ? o.action === action : true),
      map(o => o.state)
    );
  }
}

export const store = new Store();
