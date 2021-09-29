import { STATE_KEY } from './symbol';

export class Utils {
  static getStateKey(object: Object): object {
    return Reflect.getMetadata(STATE_KEY, object);
  }
}
