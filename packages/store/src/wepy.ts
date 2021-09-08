import { Type } from '@ngify/types';
import 'reflect-metadata';
import { Subject, takeUntil } from 'rxjs';
import { store } from "./store";
import { SymbolKey } from './symbols';

export function WithState(wepy: any, states: { [key: string]: Type<any> }) {
  return (target: any) => class extends target {

    beforeCreate() {
      const computed = {};

      for (const key of Object.keys(states)) {
        const clazz = states[key];
        const stateName = Reflect.getMetadata(Symbol.for(SymbolKey.StateName), clazz.prototype);

        computed[key] = store.get(stateName);

        this.$options.computed[key] = () => computed[key];
      }

      wepy.observe({
        vm: this,
        key: '',
        value: computed,
        parent: '',
        root: true
      });

      super.beforeCreate?.();
    }

    created() {
      this._destroy$ = new Subject();

      for (const key of Object.keys(states)) {
        const clazz = states[key];

        store.on(clazz).pipe(
          takeUntil(this._destroy$)
        ).subscribe(() => {
          this._computedWatchers[key].evaluate();
        });
      }

      super.created?.();
    }

    detached() {
      super.detached?.();
      this._destroy$.next();
      this._destroy$.complete();
    }
  } as typeof target;
}
