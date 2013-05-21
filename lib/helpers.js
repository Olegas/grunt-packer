var crypto = require('crypto'),
   xmldom = require('xmldom'),
   fs = require('fs'),
   DOMParser = xmldom.DOMParser,
   XMLSerializer = xmldom.XMLSerializer,
   parser = new DOMParser(),
   serializer = new XMLSerializer(),
   domCache = {};

(function () {

   "use strict";

   module.exports = {
      uniqname: function (names, ext) {
         var md5 = crypto.createHash('md5');
         md5.update(names + "");
         return md5.digest('hex') + '.' + ext;
      },

      domify: function (f, mime) {
         if (domCache[f]) {
            return domCache[f];
         }
         return (domCache[f] = parser.parseFromString(fs.readFileSync(f, 'utf-8'), mime || 'text/html'));
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
      }
   };

})();
