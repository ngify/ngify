import { HttpBackend } from './backend';

export interface HttpConfig {
  /** The default HTTP backend handler */
  backend?: HttpBackend;
}

export const config: HttpConfig = {};

export const setupConfig = (cfg: HttpConfig) => Object.assign(config, cfg);
