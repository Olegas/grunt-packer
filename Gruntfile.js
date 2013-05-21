module.exports = function(grunt) {

   grunt.loadTasks('tasks');

   grunt.initConfig({
      packjs: {
         sample: {
            root: 'sample',
            output: 'packer/js'
         }
      },
      packcss: {
         sample: {
            root: 'sample',
            output: 'packer/css'
         }
      }
   });

   grunt.registerTask('default', ['packjs', 'packcss']);

};