import { SymbolKey } from './symbols';

export class Utils {
  static getStateKey(object: Object): object {
    return Reflect.getMetadata(Symbol.for(SymbolKey.StateKey), object);
  }
}
