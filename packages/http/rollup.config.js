const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: './src/index.ts',
    outputPath: '../../dist/http',
    tsConfig: './tsconfig.lib.json',
    assets: [
      { input: '.', output: '.', glob: '*.md' }
    ],
    additionalEntryPoints: [
      './src/wx/wx.ts',
      './src/testing/testing.ts',
    ],
    generateExportsField: true
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  }
);
