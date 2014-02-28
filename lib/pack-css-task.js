var path = require('path'),
    helpers = require('./helpers.js'),
    fs = require('fs'),
    async = require('async');

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
         var packedCss, imports;
         packedCss = files.map(function(css){
            var code = grunt.file.read(css),
                cssDir = path.dirname(css),
                matchResult = code.match(/url\((?!("|')?data:)[^#\)]+?\)/ig);
            if(matchResult) {
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
         }).join('\n');

         // bump imports up
         imports = packedCss.match(/@import[^;]+;/ig);
         if(imports) {
            imports.forEach(function(anImport){
               packedCss = packedCss.replace(anImport, '');
            });
            packedCss = imports.join("\n") + packedCss;
         }

         return packedCss;
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
               var
                  code = content.toString(),
                  cssDir = path.dirname(css),
                  matchResult = code.match(/url\((?!("|')?data:)[^#\)]+?\)/ig);
               if(matchResult) {
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
               cb(null, code);
            }
         });
      }, function(err, results){
         if (err) {
            callback(err);
         } else {
            var packedCss = results.join('\n'), imports;

            // bump imports up
            imports = packedCss.match(/@import[^;]+;/ig);
            if(imports) {
               imports.forEach(function(anImport){
                  packedCss = packedCss.replace(anImport, '');
               });
               packedCss = imports.join("\n") + packedCss;
            }

            callback(null, packedCss);
         }
      });
   }

};