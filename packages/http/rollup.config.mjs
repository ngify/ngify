import typescript from '@rollup/plugin-typescript';
import { options as commonOptions, entryFileNames, formats } from '../../rollup.config.mjs';

/** @type {['wx', 'fetch', 'testing']} */
const subpackages = ['wx', 'fetch', 'testing'];

/** @type {import('rollup').RollupOptions[]} */
const subpackageOptions = subpackages.map(pkg => ({
  input: `./${pkg}/src/index.ts`,
  external: commonOptions.external,
  plugins: [
    typescript({
      tsconfig: `./${pkg}/tsconfig.lib.json`
    })
  ],
  output: formats.map(fmt => ({
    dir: `./dist/${pkg}`,
    entryFileNames: entryFileNames(fmt),
    format: fmt,
    sourcemap: true,
    preserveModules: true
  }))
}));

/** @type {import('rollup').RollupOptions[]} */
const options = [
  commonOptions,
  ...subpackageOptions
];

export default options;
