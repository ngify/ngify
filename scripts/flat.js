const fs = require('fs-extra');
const path = require('path');

const [pkgName] = process.argv.slice(2);
const srcDir = path.join(__dirname, `../dist/${pkgName}/src`);
const destDir = path.join(__dirname, `../dist/${pkgName}`);
const pkgJson = path.join(__dirname, `../dist/${pkgName}/package.json`);

// 将 dist/pkgName/src 目录下的文件移动到 dist/pkgName 目录下，并删除 dist/pkgName/src 目录
// 然后修改 dist/pkgName/package.json 文件中的 /src/ 为 /
fs.copy(srcDir, destDir, { overwrite: true })
  .then(() => fs.remove(srcDir))
  .then(() => fs.readJson(pkgJson))
  .then(packageJson =>
    fs.writeJson(
      pkgJson,
      JSON.parse(JSON.stringify(packageJson).replaceAll('/src/', '/')),
      { spaces: 2 }
    )
  )
