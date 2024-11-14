const fs = require('fs-extra');
const path = require('path');

const pattern = /(from\s+)(["'])(?!.*\.js)(\.?\.\/.*)(["'])/g;

/**
 * @param {string} dir
 */
async function _withExt(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await _withExt(fullPath);
    } else if (file.endsWith('.js')) {
      const content = await fs.readFile(fullPath, 'utf8');
      const newContent = content.replaceAll(pattern, "$1$2$3.js$4")
      await fs.writeFile(fullPath, newContent, 'utf8');
    }
  }
}

/**
 * @param {string} pkgName
 */
async function withExt(pkgName) {
  const destDir = path.join(__dirname, `../dist/${pkgName}`);
  await _withExt(destDir)
}

module.exports = { withExt };
