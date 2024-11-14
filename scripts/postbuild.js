const { flatSrc } = require('./flat-src');
const { withExt } = require('./with-ext');

const [pkgName] = process.argv.slice(2);

(async () => {
  await flatSrc(pkgName);
  await withExt(pkgName);
})();
