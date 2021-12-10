import { Type } from '@ngify/types';
import { filter, map, Observable, Subject } from "rxjs";

class Store {
  private readonly subject = new Subject<{ key: Type<any>, action: string, state: object }>();
  private readonly states = new Map<Type<any>, Readonly<object>>();

  /**
   * Get the state class instance of a given state class.
   * @param clazz
   */
  get<T>(clazz: Type<T>): Readonly<T> {
    return this.states.get(clazz) as Readonly<T>;
  }

  /**
   * Put the state instance in the store.
   * @param state
   */
  put<T extends Object>(state: T) {
    this.states.set(state.constructor as Type<any>, state);
  }

  /**
   * Action event of dispatch state.
   * @param action
   * @param state
   */
  dispatch<T extends object>(state: T, action: string) {
    const key = state.constructor as Type<any>;
    state = { ...state };
    this.states.set(key, Object.assign(this.states.get(key), state));
    this.subject.next({ key, action, state });
  }

  /**
   * Get Observable of the state class.
   * @param clazz
   * @param action
   */
  on<T>(clazz: Type<T>, action?: string): Observable<InstanceType<Type<T>>> {
    return this.subject.asObservable().pipe(
      filter(o => o.key === clazz),
      filter(o => action ? o.action === action : true),
      map(o => o.state as unknown as InstanceType<Type<T>>)
    );
  }
}

export const store = new Store();
