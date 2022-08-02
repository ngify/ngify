import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import chalk from 'chalk';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import minimist from 'minimist';
import { rollup, watch } from 'rollup';

const { pkg, prod } = minimist(process.argv.slice(2));
const pkgs = pkg ? [pkg] : ['types', 'store', 'http', 'at'];
const formats = ['cjs', 'esm'];
const log = console.log;

const createInputOptions = (pkg, prod) => {
  const options = {
    input: `packages/${pkg}/src/index.ts`,
    external: ['rxjs', 'rxjs/fetch', '@ngify/types', 'tslib'],
    plugins: [
      typescript({
        removeComments: true
      }),
      nodeResolve()
    ]
  };

  if (prod) {
    // do something...
  }

  return options;
};

const createOutputOptions = (pkg, fmt) => ({
  dir: `packages/${pkg}/dist/${fmt}`,
  format: fmt,
  name: `ngify.${pkg}`,
  sourcemap: true,
  preserveModules: true
});

const emitDeclaration = pkg => {
  log(chalk.magenta(`[@ngify/${pkg}] emitting declaration file...`));

  const cmd = `tsc --project ./packages/${pkg}/tsconfig.json --emitDeclarationOnly`;

  if (pkg === 'types') {
    try {
      execSync(cmd);
      log(chalk.magenta(`[@ngify/${pkg}] declaration file emit is complete!`));
    } catch (error) {
      log(chalk.red(`[@ngify/${pkg}] failed to emit declaration file!`));
      log(error);
    }
    return;
  }

  exec(cmd, error => {
    if (error) {
      log(chalk.red(`[@ngify/${pkg}] failed to emit declaration file!`));
      log(error);
    } else {
      log(chalk.magenta(`[@ngify/${pkg}] declaration file emit is complete!`));
    }
  });
};

if (prod) {
  for (const pkg of pkgs) {
    // delete the dist directory
    const directory = `packages/${pkg}/dist`;
    fs.existsSync(directory) && fs.rmSync(directory, { recursive: true });

    for (const fmt of formats) {
      log(chalk.blue(`[@ngify/${pkg}] start to build ${fmt} format...`));

      // create a bundle
      rollup(createInputOptions(pkg, prod)).then(async (bundle) => {
        const outputOptions = createOutputOptions(pkg, fmt);
        // generate code and a sourcemap
        await bundle.generate(outputOptions);
        // or write the bundle to disk
        await bundle.write(outputOptions);

        log(chalk.green(`[@ngify/${pkg}] ${fmt} format build is complete!`));
      });
    }

    // emit declaration file
    emitDeclaration(pkg);
  }
} else {
  for (const pkg of pkgs) {
    const watchOptions = {
      ...createInputOptions(pkg, prod),
      output: formats.map(fmt => createOutputOptions(pkg, fmt))
    };

    const watcher = watch(watchOptions);

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
      }
    });
  }
}
