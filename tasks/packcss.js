/**
 * CSS Packing task
 *
 * TODO:
 *  - support different media types on link tag (pack separately)
 *  - support @import "file/name.css" pattern (without "url()")
 */

var path = require('path'),
   fs = require('fs'),
   helpers = require('../lib/helpers.js');

module.exports = function(grunt) {

   grunt.registerMultiTask('packcss', 'Pack CSS files referenced from HTML documents', function() {

      this.data.files = this.data.files || '**/*.html';

      var root = path.resolve(this.data.root),
          dst = path.join(root, this.data.output),
          fileset = grunt.file.expand(path.join(root, this.data.files));

      grunt.file.mkdir(dst);

      fileset.map(function(f){

         f = path.resolve(f);

         var dom = helpers.domify(f),
             links = dom.getElementsByTagName('link'),
             files = [],
             linksToRemove = [],
             link, href, packName, rel, media, before, packedCss, imports, newLink, output;

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
               linksToRemove.push(link);
               before = link.nextSibling;
            }
         }

         if(files.length > 1) {
            // create packed css
            packedCss = files.map(function(css){
               var fullCssPath = path.join(path.dirname(f), css),
                  code = grunt.file.read(fullCssPath),
                  cssDir = path.dirname(fullCssPath),
                  matchResult = code.match(/url\([^#\)]+?\)/ig);
               if(matchResult) {
                  matchResult.forEach(function(match){
                     var parts = match.match(/url\((?:"|'|\s)?([^"'\s]+?)(?:"|'|\s)?\)/i);

                     if(parts) {
                        var url;
                        if(parts[1].charAt(0) == '/')
                           url = parts[1];
                        else
                           url = path.relative(dst, path.resolve(cssDir, parts[1]));
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
                  packedCss = anImport + "\n" + packedCss.replace(anImport, '');
               });
            }

            // remove source links from DOM
            helpers.removeDomCollection(linksToRemove);

            // create new DOM node referencing a packed file
            output = path.join(dst, helpers.uniqname(files, 'css'));
            newLink = helpers.mkDomNode(dom, 'link', {
               rel: 'stylesheet',
               href: '/' + path.relative(root, output).replace(/\\/g, '/')
            });

            // append to document
            before ? before.parentNode.insertBefore(newLink, before) : dom.getElementsByTagName('head')[0].appendChild(newLink);

            // write packed file
            grunt.file.write(output, packedCss);

            // update HTML
            grunt.file.write(f, helpers.stringify(dom));
         }

      });

      return true;

   });

};