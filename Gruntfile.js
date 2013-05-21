module.exports = function(grunt) {

   grunt.loadTasks('tasks');

   grunt.initConfig({
      packjs: {
         sample: {
            root: 'sample',
            output: 'packer'
         }
      }
   });

   grunt.registerTask('default', 'packjs');

};