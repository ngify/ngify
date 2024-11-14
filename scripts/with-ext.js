const fs = require('fs-extra');
const path = require('path');

const [pkgName] = process.argv.slice(2);
const destDir = path.join(__dirname, `../dist/${pkgName}`);
const pattern = /(from\s+)(["'])(?!.*\.js)(\.?\.\/.*)(["'])/g;

/**
 * @param {string} dir
 */
async function withExt(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await fs.stat(fullPath);
    if (stats.isDirectory()) {
      await withExt(fullPath);
    } else if (file.endsWith('.js')) {
      const content = await fs.readFile(fullPath, 'utf8');
      const newContent = content.replaceAll(pattern, "$1$2$3.js$4")
      await fs.writeFile(fullPath, newContent, 'utf8');
    }
  }
}

withExt(destDir);
