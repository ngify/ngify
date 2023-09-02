import typescript from '@rollup/plugin-typescript';
import clean from 'rollup-plugin-delete';

/** @type {['esm', 'cjs']} */
const formats = ['esm', 'cjs'];

/** @type {import('rollup').RollupOptions} */
const options = {
  input: './src/index.ts',
  external: [
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
    entryFileNames: fmt === 'esm' ? '[name].mjs' : '[name].js',
    format: fmt,
    sourcemap: true,
    preserveModules: true
  }))
};

export default options;
