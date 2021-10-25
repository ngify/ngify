import { Type } from '@ngify/types';
import { filter, map, Observable, Subject } from "rxjs";
import { getStateKey } from './utils';

class Store {
  private readonly subject = new Subject<{ key: object, action: string, state: any }>();
  private readonly states = new Map<object, Readonly<object>>();

  get<T extends object>(clazz: Type<T>): Readonly<T> {
    const key = getStateKey(clazz.prototype);
    return this.states.get(key) as Readonly<T>;
  }

  put<T extends object>(clazz: Type<T>, state: T) {
    const key = getStateKey(clazz.prototype);
    this.states.set(key, state);
  }

  dispatch<T extends object>(action: string, state: T) {
    const key = getStateKey(state);
    state = { ...state };
    this.states.set(key, Object.assign(this.states.get(key), state));
    this.subject.next({ key, action, state });
  }

  on<T extends object>(clazz: Type<T>, action?: string): Observable<T> {
    const key = getStateKey(clazz.prototype);

    return this.subject.asObservable().pipe(
      filter(o => o.key === key),
      filter(o => action ? o.action === action : true),
      map(o => o.state)
    );
  }
}

export const store = new Store();
