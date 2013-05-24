var assert = require('assert'),
    helpers = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'helpers.js'),
    grunt = require('grunt'),
    MockFS = require('mockfs'),
    fs = require('fs'),
    cssPacker = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'pack-css-task.js')(grunt),
    mfs;



describe("CSS packer", function(){

   beforeEach(function(){
      mfs = new MockFS({
         items: {
         }
      });

      mfs.mount('./out');

      helpers.clearDomCache();
   });

   it("creates output directory from current working dir", function(){
      cssPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out'));
   });

   it("creates packed files target directory from output root", function(){
      cssPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/packer/css'));
   });

   it("packed html file is placed inside output dir", function(){
      cssPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/index.html'));
   });

   it("packed html file is placed inside output dir", function(){
      cssPacker.apply({
         data: {
            root: 'test/fixture/1',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(true, fs.existsSync('./out/index.html'));
   });

   it("css files are packed into single file", function(){
      cssPacker.apply({
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
      cssPacker.apply({
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
      cssPacker.apply({
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
      cssPacker.apply({
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


   afterEach(function(){
      mfs.umount();
   });

});

