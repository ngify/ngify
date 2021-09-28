const fs = require('fs');
const minimist = require('minimist');
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const { bold: chalk } = require('chalk');
const { terser } = require('rollup-plugin-terser');
const { exec } = require('child_process');

const { pkg, prod } = minimist(process.argv.slice(2));
const pkgs = pkg ? [pkg] : ['store', 'http', 'types'];
const formats = ['cjs', 'esm'];
const log = console.log;

const createInputOptions = (pkg, prod) => {
  const options = {
    input: `packages/${pkg}/src/index.ts`,
    external: ['rxjs', 'reflect-metadata'],
    plugins: [
      typescript({})
    ]
  };

  if (prod) {
    options.plugins.push(terser());
  }

  return options;
};

const createOutputOptions = (pkg, fmt) => ({
  dir: `packages/${pkg}/dist/${fmt}`,
  format: fmt,
  sourcemap: true
});

if (prod) {
  for (const pkg of pkgs) {
    const directory = `packages/${pkg}/dist`;
    fs.existsSync(directory) && fs.rmSync(directory, { recursive: true });

    for (const fmt of formats) {
      (async function (pkg, fmt) {
        log(chalk.blue(`[@ngify/${pkg}] start to build ${fmt} format...`));

        const outputOptions = createOutputOptions(pkg, fmt);
        // create a bundle
        const bundle = await rollup.rollup(createInputOptions(pkg, prod));
        // generate code and a sourcemap
        await bundle.generate(outputOptions);
        // or write the bundle to disk
        await bundle.write(outputOptions);

        log(chalk.green(`[@ngify/${pkg}] ${fmt} format build is complete!`));
      })(pkg, fmt);
    }

    log(chalk.magenta(`[@ngify/${pkg}] emitting declaration file...`));
    exec(`tsc --project ./packages/${pkg}/tsconfig.json --emitDeclarationOnly`, error => {
      if (error) {
        log(chalk.red(`[@ngify/${pkg}] failed to emit declaration file!`));
        log(error);
      } else {
        log(chalk.magenta(`[@ngify/${pkg}] declaration file emit is complete!`));
      }
    });
  }
} else {
  for (const pkg of pkgs) {
    const watchOptions = {
      ...createInputOptions(pkg, prod),
      output: formats.map(fmt => createOutputOptions(pkg, fmt))
    };

    const watcher = rollup.watch(watchOptions);

    watcher.on('event', event => {
      switch (event.code) {
        case 'START':
          log(chalk.blue(`[@ngify/${pkg}] start to build...`));
          break;

        case 'BUNDLE_END':
          log(chalk.green(`[@ngify/${pkg}] build is complete!`));
          break;

        case 'ERROR':
          log(chalk.red(`[@ngify/${pkg}] build error!`));
          log(event.error);
          break;

        case 'FATAL':
          log(chalk.red(`[@ngify/${pkg}] build failed!`));
          break;
      }
    });
  }
}
