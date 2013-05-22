module.exports = function(grunt) {

   grunt.loadTasks('tasks');

   grunt.initConfig({
      packjs: {
         sample: {
            root: 'sample',
            packages: 'packer/js',
            output: '../out'
         }
      },
      packcss: {
         sample: {
            root: 'sample',
            packages: 'packer/css',
            output: '../out'
         }
      }
   });

   grunt.registerTask('default', ['packjs', 'packcss']);

};