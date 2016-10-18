'use strict';

let gulp = require('gulp');
let nodemon = require('nodemon');

gulp.task('serve:backend', ['compile:backend', 'copy:backend-view'], cb => {
  nodemon({
    script: 'startserver.js',
    watch: ['lib/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js jade'
  }).once('start', () => {
    cb();
  });

  gulp.watch('src/**/*.ts', ['compile:backend']);
  gulp.watch('src/**/*.{jade,pug}', ['copy:backend-view']);

});