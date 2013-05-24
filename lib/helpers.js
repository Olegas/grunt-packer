var crypto = require('crypto'),
   xmldom = require('xmldom'),
   fs = require('fs'),
   path = require('path'),
   DOMParser = xmldom.DOMParser,
   XMLSerializer = xmldom.XMLSerializer,
   parser = new DOMParser(),
   serializer = new XMLSerializer();

(function () {

   "use strict";

   function wrap(obj, prop, replacer) {
      (function(orig){
         obj[prop] = replacer;
         obj[prop].restore = function(){
            obj[prop] = orig;
         }
      })(obj[prop]);
   }

   var helpers, domCache = {};

   helpers = module.exports = {
      uniqname: function (names, ext) {
         var md5 = crypto.createHash('md5');
         md5.update(names + "");
         return md5.digest('hex') + '.' + ext;
      },

      clearDomCache: function() {
         domCache = {}
      },

      domify: function (f, mime) {
         if (domCache[f]) {
            return domCache[f];
         }
         var errors = [];
         wrap(console, 'log', function(m){
            errors.push(m);
         });
         wrap(console, 'error', function(m){
            errors.push(m);
         });
         domCache[f] = parser.parseFromString(fs.readFileSync(f, 'utf-8'), mime || 'text/html');
         console.log.restore();
         console.error.restore();

         return domCache[f];
      },

      stringify: function(dom) {
         return serializer.serializeToString(dom);
      },

      extract: function (dom, tag, checker) {
         var collection = dom.getElementsByTagName(tag),
            result = [],
            j = 0;
         for (var i = 0, l = collection.length; i < l; i++) {
            if (checker(collection[i])) {
               result[j++] = collection[i];
            }
         }
         return result;
      },

      removeDomCollection: function (col, filter) {
         var deadlist = [];
         for (var i = 0, l = col.length; i < l; i++) {
            if (!filter || filter(col[i]))
               deadlist.push(col[i]);
         }
         for (i = 0, l = deadlist.length; i < l; i++) {
            deadlist[i].parentNode.removeChild(deadlist[i]);
         }
      },

      mkDomNode: function (doc, nodeName, attributes) {
         var el = doc.createElement(nodeName);
         Object.keys(attributes || []).forEach(function (attr) {
            el.setAttribute(attr, attributes[attr]);
         });
         return el;
      },

      replaceCollection: function(dom, result, replacement) {
         this.removeDomCollection(result.nodes);
         result.before ? result.before.parentNode.insertBefore(replacement, result.before) : dom.getElementsByTagName('head')[0].appendChild(replacement);
      },

      checkFiles: function(grunt, root, sourceFile, result) {
         var isSane = true, errors = [];
         result.files.forEach(function(packItem, i){
            var fullPath = path.join(root, packItem);
            if(!fs.existsSync(fullPath)){
               var l = result.nodes[i].lineNumber,
                   c = result.nodes[i].columnNumber;
               errors.push(("line " + l + " col " + c + ": file not found").bold + " " + packItem);
               isSane = false;
            }
         });
         if(!isSane) {
            grunt.log.writeln("Warning: ".yellow.bold + path.relative(root, sourceFile));
            grunt.log.writeln(errors.join("\n"));
         }
         return isSane;
      },

      makePlugin: function(grunt, collector, packer, nodeProducer, ext) {

         return function() {

            this.data.files = this.data.files || '**/*.html';

            var root = path.resolve(this.data.root),
                dst = path.resolve(this.data.output || root),
                packageHome = path.join(dst, this.data.packages),
                fileset = grunt.file.expand(path.join(root, this.data.files));

            fileset.map(function(f){

               f = path.resolve(f);

               var dom = helpers.domify(f),
                   results;

               results = collector(dom);

               if(!(results instanceof Array)) {
                  results = [ results ];
               }

               results.forEach(function(result){

                  var packedCss, packedFile;

                  if(result.files.length > 1) {
                     if(helpers.checkFiles(grunt, root, f, result)) {
                        packedCss = packer(result.files.map(function(fl){
                           return path.join(root, fl);
                        }), root);
                        packedFile = path.join(packageHome, helpers.uniqname(result.files, ext));
                        helpers.replaceCollection(dom, result, nodeProducer(dom, path.relative(dst, packedFile)));

                        // write packed file
                        grunt.file.write(packedFile, packedCss);

                        // update HTML
                        grunt.file.write(path.join(dst, path.relative(root, f)), helpers.stringify(dom));

                        grunt.verbose.ok("OK  : ".green + f);
                     } else {
                        grunt.verbose.error("Skip: ".red.bold + f);
                     }
                  }
               })

            });

            return true;

         }
      }
   };

})();
