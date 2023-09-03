import typescript from '@rollup/plugin-typescript';
import clean from 'rollup-plugin-delete';

/** @type {['esm', 'cjs']} */
export const formats = ['esm', 'cjs'];

/**
 * @param {'cjs'|'esm'} fmt
 */
export function entryFileNames(fmt) {
  return fmt === 'esm' ? '[name].mjs' : '[name].js'
}

/** @type {import('rollup').RollupOptions} */
export const options = {
  input: './src/index.ts',
  external: [
    'tslib',
    'rxjs',
    /rxjs\/\w+/,
    /@ngify\/\w+/,
    'lodash-es'
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.lib.json'
    }),
    clean({
      targets: './dist',
      runOnce: true
    })
  ],
  output: formats.map(fmt => ({
    dir: './dist',
    entryFileNames: entryFileNames(fmt),
    format: fmt,
    sourcemap: true,
    preserveModules: true
  }))
};
