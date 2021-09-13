import { SymbolKey } from './symbols';

export class Utils {
  static getStateName(object: Object): string {
    return Reflect.getMetadata(Symbol.for(SymbolKey.StateName), object);
  }
}
