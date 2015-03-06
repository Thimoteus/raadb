module.exports = function (grunt) {

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-uglify');

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: true
         },
         all: [ 'Gruntfile.js', 'src/**/*.js' ]
      },
      uglify: {
         options: {
            screwIE8: true,
            preserveComments: false,
            wrap: 'raadb'
         },
         src: {
            files: [{
               expand: true,
               cwd: 'src',
               src: '**/*.js',
               dest: 'build'
            }]
         }
      }
   });

   grunt.registerTask('default', ['jshint', 'uglify']);
};
