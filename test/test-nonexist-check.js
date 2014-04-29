var assert = require('assert'),
   helpers = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'helpers.js'),
   grunt = require('grunt'),
   MockFS = require('mockfs'),
   fs = require('fs'),
   cssPacker = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'pack-css-task.js').gruntPackCSS(grunt),
   jsPacker = require((process.env.COVER == 'gruntpacker' ? '../lib-cov/' : '../lib/') + 'pack-js-task.js')(grunt),
   mfs;



describe("Common", function(){

   beforeEach(function(){
      mfs = new MockFS({
         items: {
         }
      });

      mfs.mount('./out');

      helpers.clearDomCache();
   });

   it("if HTML contains links to files, which can't be found, entire file is skipped", function(){
      cssPacker.apply({
         data: {
            root: 'test/fixture/missed-files',
            packages: 'packer/css',
            output: 'out'
         }
      });

      assert.equal(false, fs.existsSync('./out/index.html'));

      jsPacker.apply({
         data: {
            root: 'test/fixture/missed-files',
            packages: 'packer/js',
            output: 'out'
         }
      });

      assert.equal(false, fs.existsSync('./out/index.html'));
   });

   afterEach(function(){
      mfs.umount();
   });

});

