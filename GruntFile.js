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
      src: ['src/js/**/*.js'],
      dest: 'dist/huayra-motion.js'
    }
  },
  copy: {
    partials: {
      expand: true,
      cwd: 'src/partials/',
      src: ['**'],
      dest: 'dist/partials',
    },
    css: {
      expand: true,
      cwd: 'src/css/',
      src: ['**'],
      dest: 'dist/css',
    },
    font: {
      expand: true,
      cwd: 'src/font/',
      src: ['**'],
      dest: 'dist/font',
    },
    images: {
      expand: true,
      cwd: 'src/images/',
      src: ['**'],
      dest: 'dist/images',
    },
    img: {
      expand: true,
      cwd: 'src/img/',
      src: ['**'],
      dest: 'dist/img',
    },
    libs: {
      expand: true,
      cwd: 'src/libs/',
      src: ['**'],
      dest: 'dist/libs',
    },
    media: {
      expand: true,
      cwd: 'src/media/',
      src: ['**'],
      dest: 'dist/media',
    },
    public: {
      expand: true,
      cwd: 'src/public/',
      src: ['**'],
      dest: 'dist/public',
    },
    node_modules: {
      expand: true,
      cwd: 'src/node_modules/',
      src: ['**'],
      dest: 'dist/node_modules',
    },
    sonidos: {
      expand: true,
      cwd: 'src/sonidos/',
      src: ['**'],
      dest: 'dist/sonidos',
    },
    index: {
      expand: true,
      cwd: 'src/',
      src: ['*.html'],
      dest: 'dist/',
    },
    json: {
      expand: true,
      cwd: 'src/',
      src: ['*.json'],
      dest: 'dist/',
    },
  },
  watch: {
    dev: {
      files: ['Gruntfile.js', 'src/js/**/*.js', 'src/**/*.html'],
      tasks: ['clear', 'jshint', 'concat:dist', 'copy'],
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
