module.exports = function (grunt) {
  grunt.initConfig({
    nodewebkit: {
                  options: {
                            build_dir: './webkitbuilds',
                            mac: true, // We want to build it for mac
                            win: true, // We want to build it for win
                            linux32: true, // We don't need linux32
                            linux64: true // We don't need linux64
                },
                src: [
                  './src/**/*',
                  './node_modules/**/*',
                ]
            },
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    //grunt.registerTask('default', ['grunt-node-webkit-builder']);
 }

