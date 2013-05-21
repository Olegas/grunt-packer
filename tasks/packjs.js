var path = require('path'),
    fs = require('fs'),
    helpers = require('../lib/helpers.js');

module.exports = function(grunt) {

   grunt.registerMultiTask('packjs', 'Pack JS files referenced from HTML documents', function() {


      this.data.files = this.data.files || '**/*.html';

      var root = path.resolve(this.data.root),
          dst = path.join(root, this.data.output),
          fileset = grunt.file.expand(path.join(root, this.data.files));

      grunt.file.mkdir(dst);

      fileset.map(function(f){

         f = path.resolve(f);

         var defId = 0,
             dom = helpers.domify(f),
             scripts = dom.getElementsByTagName('script'),
             packs = [],
             script, link, packName, pack;

         for(var i = 0, l = scripts.length; i < l; i++) {
            script = scripts[i];
            packName = script.getAttribute('data-pack-name');

            // data-pack-name='skip' == skip this script from packing, ignore it at all, don't split package
            if(packName == 'skip')
               continue;

            link = script.getAttribute('src');

            // inline script will split package
            if(!link) {
               defId++;
               continue;
            }

            packName = packName + defId;

            // ends with .js and not starts with http
            if(link.indexOf('.js') == link.length - 3 && link.indexOf('http') !== 0) {

               pack = packs[packName] || (packs[packName] = {
                  files: [],
                  scriptToRemove: [],
                  before: null
               });

               pack.files.push(link);
               pack.scriptToRemove.push(script);
               pack.before = script.nextSibling;
            } else {
               // any other script will split package
               defId++;
            }
         }

         packs.forEach(function(pack){
            var script;
            if(pack.files.length > 1) {
               pack.output = path.join(dst, helpers.uniqname( pack.files, 'js'));

               grunt.file.write(pack.output, pack.files.map(function(js){
                  return grunt.file.read(path.join(path.dirname(f), js));
               }).join('\n;\n'));

               helpers.removeDomCollection(pack.scriptToRemove);

               script = helpers.mkDomNode(dom, 'script', {
                  type: 'text/javascript',
                  charset: 'utf-8',
                  src: '/' + path.relative(root, pack.output).replace(/\\/g, '/')
               });
               script.textContent = " ";
               pack.before ? pack.before.parentNode.insertBefore(script, pack.before) : dom.getElementsByTagName('head')[0].appendChild(script);
            }
         });

         grunt.file.write(f, helpers.stringify(dom));

      });

     return true;

   });

};