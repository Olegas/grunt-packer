var cssTask = require('./lib/pack-css-task');

module.exports = {
   packCSS: cssTask.nativePackCSS,
   resolveUrl: cssTask.resolveUrl,
   bumpImportsUp: cssTask.bumpImportsUp
};