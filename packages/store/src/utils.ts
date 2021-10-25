import { STATE_KEY } from './symbol';

export const getStateKey = (object: Object): object => Reflect.getMetadata(STATE_KEY, object);
