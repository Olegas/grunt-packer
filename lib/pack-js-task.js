var helpers = require('./helpers.js');

module.exports = function(grunt) {

   function collector(dom) {
      var defId = 0,
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
               nodes: [],
               before: null
            });

            pack.files.push(link);
            pack.nodes.push(script);
            pack.before = script.nextSibling;
         } else {
            // any other script will split package
            defId++;
         }
      }

      return packs;
   }

   function packer(files) {
      return files.map(function(js){
         return grunt.file.read(js);
      }).join('\n;\n')
   }

   function nodeProducer(dom, path) {
      var script = helpers.mkDomNode(dom, 'script', {
         type: 'text/javascript',
         charset: 'utf-8',
         src: '/' + path.replace(/\\/g, '/')
      });
      script.textContent = " ";
      return script;
   }

   return helpers.makePlugin(grunt, collector, packer, nodeProducer, 'js');

};