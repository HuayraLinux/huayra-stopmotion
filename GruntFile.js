var grunt = require('grunt');

grunt.initConfig({
  jshint: {
      all: ['Gruntfile.js', 'src/js/**/*.js'],
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
  copy: {
    templates: {
      src: 'src/partials/*',
      dest: 'dist/partials',
    },
  },
  watch: {
    dev: {
      files: [ 'Gruntfile.js', 'src/js/**/*.js'],
      tasks: [ 'clear', 'jshint', 'concat:dist', 'copy:templates'],
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
grunt.loadNpmTasks('grunt-contrib-copy');
