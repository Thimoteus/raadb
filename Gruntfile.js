module.exports = function (grunt) {

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-mocha-test');

   grunt.initConfig({
      jshint: {
         options: {
            jshintrc: true
         },
         all: [ 'Gruntfile.js', 'src/**/*.js', 'test/**/*.js' ]
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
      },
      mochaTest: {
         test: {
            src: ['test/**/*.js']
         }
      }
   });

   grunt.registerTask('default', ['jshint', 'uglify']);
   grunt.registerTask('test', 'mochaTest');
};
