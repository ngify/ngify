import type { HttpBackend } from './backend';
import { withXhr } from './feature';

export interface HttpConfig {
  /** The default HTTP backend handler */
  backend: HttpBackend;
}

export const config: HttpConfig = {
  backend: withXhr().value
};

export const setupConfig = (cfg: HttpConfig) => Object.assign(config, cfg);
