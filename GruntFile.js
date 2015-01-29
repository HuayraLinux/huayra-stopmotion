var grunt = require('grunt');

grunt.initConfig({
  jshint: {
    ignore_warning: {
      options: {
        '-W015': true,
      },
      src: [ 'Gruntfile.js', 'src/js/**/*.js' ]
    },
  },
  concat: {
    options: {
      separator: ';'
    },
    dist: {
      src: [ 'src/js/**/*.js' ],
      dest: 'dist/huayra-motion.js'
    }
  },
  watch: {
    dev: {
      files: [ 'Gruntfile.js', 'src/js/**/*.js'],
      tasks: [ 'clear', 'jshint', 'concat:dist' ],
      options: {
        atBegin: true
      }
    },
  }
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-clear');
