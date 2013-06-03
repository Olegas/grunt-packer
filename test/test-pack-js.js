var assert = require('assert'),
   helpers = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'helpers.js'),
   grunt = require('grunt'),
   MockFS = require('mockfs'),
   fs = require('fs'),
   jsPacker = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'pack-js-task.js')(grunt),
   mfs;



describe("JS packer", function(){

   beforeEach(function(){
      mfs = new MockFS({
         items: {
         }
      });

      mfs.mount('./out');

      helpers.clearDomCache();
   });

   /*it("creates output directory from current working dir", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out'));
   });

   it("creates packed files target directory from output root", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/packer/css'));
   });

   it("packed html file is placed inside output dir", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/index.html'));
   });

   it("packed html file is placed inside output dir", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/index.html'));
   });

   it("css files are packed into single file", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      var packedCss = fs.readdirSync('./out/packer/css');
      assert.equal(1, packedCss.length);
   });

   it("all @import directives are moved to a top of a packed file", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      var packedCss = fs.readdirSync('./out/packer/css'), cssContent = fs.readFileSync('./out/packer/css/' + packedCss[0], 'utf-8').split('\n');
      assert.equal(true, cssContent[0].indexOf('@import') === 0);
      assert.equal(true, cssContent[1].indexOf('@import') === 0);
   });

   it("all @import directives are moved to a top of a packed file", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      var packedCss = fs.readdirSync('./out/packer/css'), cssContent = fs.readFileSync('./out/packer/css/' + packedCss[0], 'utf-8').split('\n');
      assert.equal(true, cssContent[0].indexOf('@import') === 0);
      assert.equal(true, cssContent[1].indexOf('@import') === 0);
   });

   it("all @import url rewritten according to a new file location", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      var urlPat = /url\((?:'|")([^'")]+)(?:'|")\)/,
         packedCss = fs.readdirSync('./out/packer/css'),
         cssContent = fs.readFileSync('./out/packer/css/' + packedCss[0], 'utf-8').split('\n'),
         firstUrl = cssContent[0].match(urlPat)[1],
         secondUrl = cssContent[1].match(urlPat)[1];

      assert.equal('/css/imported1.css', firstUrl);
      assert.equal('/css/imported2.css', secondUrl);
   });

   it("packing of css file can be skipped by using data-pack-name='skip' on a tag", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/2',
            packages: 'packer/css',
            output: 'out'
         }
      });

      // one file is skipped, so one another will not be packed, so there are no packer dir and html is not changed
      assert.equal(false, fs.existsSync('./out/packer/css'));
      assert.equal(false, fs.existsSync('./out/index.html'));
   });*/



   describe("when script is ignored", function(){

      it("when it is external", function(){
         jsPacker.apply({
            data: {
               root: 'test/fixture/ext-scripts',
               packages: 'packer/js',
               output: 'out'
            }
         });

         assert.equal(false, fs.existsSync('./out/packer/js'));
         assert.equal(false, fs.existsSync('./out/index.html'));
      });

      describe("when it is not JavaScript", function(){

         it("by extension (not .js)", function(){
            jsPacker.apply({
               data: {
                  root: 'test/fixture/non-js-scripts',
                  packages: 'packer/js',
                  htmls: 'index.html',
                  output: 'out'
               }
            });

            assert.equal(false, fs.existsSync('./out/packer/js'));
            assert.equal(false, fs.existsSync('./out/index.html'));
         });

         it("by type (not text/javascript)", function(){
            jsPacker.apply({
               data: {
                  root: 'test/fixture/non-js-scripts',
                  packages: 'packer/js',
                  htmls: 'index2.html',
                  output: 'out'
               }
            });

            assert.equal(false, fs.existsSync('./out/packer/js'));
            assert.equal(false, fs.existsSync('./out/index2.html'));
         });

      });

      it("when it has data-pack-name='skip'", function(){
         jsPacker.apply({
            data: {
               root: 'test/fixture/js-common',
               packages: 'packer/js',
               htmls: 'index-use-skip.html',
               output: 'out'
            }
         });

         assert.equal(false, fs.existsSync('./out/packer/js'));
         assert.equal(false, fs.existsSync('./out/index-use-skip.html'));
      });

   });

   describe("when package is splited", function(){

      it("when scripts are separated by ignored script", function(){
         jsPacker.apply({
            data: {
               root: 'test/fixture/js-common',
               packages: 'packer/js',
               htmls: 'index-package-break.html',
               output: 'out'
            }
         });

         assert.equal(true, fs.existsSync('./out/packer/js'));
         assert.equal(true, fs.existsSync('./out/index-package-break.html'));
         assert.equal(4, fs.readdirSync('./out/packer/js').length);
      });

      describe("when package names are used", function(){

         it("using data-pack-name='some-name' scripts can be packed into common package (p1, p1, p2, p2)", function(){
            jsPacker.apply({
               data: {
                  root: 'test/fixture/js-common',
                  packages: 'packer/js',
                  htmls: 'index-use-names.html',
                  output: 'out'
               }
            });

            assert.equal(true, fs.existsSync('./out/packer/js'));
            assert.equal(true, fs.existsSync('./out/index-use-names.html'));
            assert.equal(2, fs.readdirSync('./out/packer/js').length);
         });

         it("but one can't mix package (p1, p2, p1, p2)", function(){
            jsPacker.apply({
               data: {
                  root: 'test/fixture/js-common',
                  packages: 'packer/js',
                  htmls: 'index-use-names-split.html',
                  output: 'out'
               }
            });

            assert.equal(false, fs.existsSync('./out/packer/js'));
            assert.equal(false, fs.existsSync('./out/index-use-names.html'));
         });

      });

   });

   it("js files packed into packages one-by-one in order", function(){
      jsPacker.apply({
         data: {
            root: 'test/fixture/js-common',
            packages: 'packer/js',
            htmls: 'index.html',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/packer/js'));
      assert.equal(true, fs.existsSync('./out/index.html'));

      var packs =  fs.readdirSync('./out/packer/js');

      assert.equal(1, packs.length);

      var content = fs.readFileSync('./out/packer/js/' + packs[0], 'utf-8');
      var fa = content.indexOf('a()'), fb = content.indexOf('b()') , fc = content.indexOf('c()'), fd = content.indexOf('d()');

      assert.equal(true, fa < fb);
      assert.equal(true, fb < fc);
      assert.equal(true, fc < fd);

   });

   afterEach(function(){
      mfs.umount();
   });

});

