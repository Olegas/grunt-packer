var path = require('path'),
    helpers = require('./helpers.js'),
    fs = require('fs'),
    async = require('async');

function resolveUrl(root, code, cssDir) {
   var matchResult = code.match(/url\((?!("|')?data:)[^#\)]+?\)/ig);
   if (matchResult) {
      matchResult.forEach(function(match){
         var parts = match.match(/url\((?:"|'|\s)?([^"'\s]+?)(?:"|'|\s)?\)/i);

         if(parts) {
            var url;
            if(parts[1].charAt(0) == '/')
               url = parts[1];
            else
               url = '/' + path.relative(root, path.resolve(cssDir, parts[1]));
            code = code.replace(match, "url('" + url.replace(/\\/g, '/') + "')");
         }
      });
   }
   return code;
}

function bumpImportsUp(packedCss) {
   var imports = packedCss.match(/@import[^;]+;/ig);
   if (imports) {
      imports.forEach(function(anImport){
         packedCss = packedCss.replace(anImport, '');
      });
      packedCss = imports.join("\n") + packedCss;
   }

   return packedCss;
}

module.exports = {

   gruntPackCSS: function(grunt) {

      function collector(dom) {
         var links = dom.getElementsByTagName('link'),
             files = [],
             elements = [],
             before, link, href, packName, rel, media;
         for(var i = 0, l = links.length; i < l; i++) {
            link = links[i];
            packName = link.getAttribute('data-pack-name');

            // data-pack-name='skip' == skip this css from packing
            if(packName == 'skip')
               continue;

            href = links[i].getAttribute('href');
            rel = links[i].getAttribute('rel');
            media = links[i].getAttribute('media') || 'screen';

            // stylesheet, has href ends with .css and not starts with http, media is screen
            if(href && rel == 'stylesheet' && media == 'screen' && href.indexOf('http') !== 0 && href.indexOf('.css') !== href.length - 3) {
               files.push(href);
               elements.push(link);
               before = link.nextSibling;
            }
         }

         return {
            files: files,
            nodes: elements,
            before: before
         };
      }

      function packer(files, root) {
         return bumpImportsUp(files.map(function(css){
            return resolveUrl(root, grunt.file.read(css), path.dirname(css));
         }).join('\n'));
      }

      function getTargetNode(dom, path) {
         return helpers.mkDomNode(dom, 'link', {
            rel: 'stylesheet',
            href: '/' + path.replace(/\\/g, '/')
         });
      }

      return helpers.makePlugin(grunt, collector, packer, getTargetNode, 'css');
   },

   nativePackCSS: function (files, root, callback) {
      async.map(files, function(css, cb){
         fs.readFile(css, function(err, content){
            if (err) {
               cb(err);
            } else {
               cb(null, resolveUrl(root, content.toString(), path.dirname(css)));
            }
         });
      }, function(err, results){
         if (err) {
            callback(err);
         } else {
            callback(null, bumpImportsUp(results.join('\n')));
         }
      });
   },

   resolveUrl: resolveUrl,
   bumpImportsUp: bumpImportsUp

};