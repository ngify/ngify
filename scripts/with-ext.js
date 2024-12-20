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
      const newContent = content.replace(pattern, (_, p1, p2, p3, p4) => {
        const entryPath = path.resolve(path.dirname(fullPath), p3);
        // 如果存在，那么就是一个目录，则需要加上 /index.js
        if (fs.existsSync(entryPath)) {
          return `${p1}${p2}${p3}/index.js${p4}`;
        }
        return `${p1}${p2}${p3}.js${p4}`;
      })
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
