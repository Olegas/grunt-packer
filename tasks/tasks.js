var packCss = require('../lib/pack-css-task');
var packJs = require('../lib/pack-js-task');

module.exports = function(grunt) {

   grunt.registerMultiTask('packcss', 'Pack CSS files referenced from HTML documents', packCss(grunt));
   grunt.registerMultiTask('packjs', 'Pack JS files referenced from HTML documents', packJs(grunt));

};