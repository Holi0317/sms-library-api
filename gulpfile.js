'use strict';

let gulp = require('gulp');
let mocha = require('gulp-mocha');
let nodemon = require('nodemon');
let browserSync = require('browser-sync').create('slh');
let reload = browserSync.reload;

require('./frontend/gulpfile.js');

gulp.task('nodemon', cb => {
  nodemon({
    script: 'backend/startserver.js',
    watch: ['backend/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js jade'
  }).once('start', () => {
    cb();
  }).on('restart', () => {
    setTimeout(reload, 1000);
  });
});

gulp.task('serve', ['compile', 'copy:fonts', 'nodemon'], () => {
  browserSync.init({
    proxy: 'localhost:3002',
    port: 3000
  });

  gulp.watch('frontend/app/styles/*.scss', ['compile:styles', reload]);
  gulp.watch('frontend/app/scripts/**/*.js', ['compile:js', reload]);
});

gulp.task('test', () => {
  return gulp.src('test/test-*.js')
    .pipe(mocha())
    .once('end', () => {
      process.exit();
    });
});
