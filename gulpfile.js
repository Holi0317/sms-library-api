'use strict';

let gulp = require('gulp');
let nodemon = require('nodemon');
let requireDir = require('require-directory');
let browserSync = require('browser-sync').create('slh');
let reload = browserSync.reload;

requireDir(module, './tasks');

let deferReload = () => {
  setTimeout(reload, 2000);
};

gulp.task('nodemon', ['compile:backend', 'copy:backend-view'], cb => {
  nodemon({
    script: 'backend/startserver.js',
    watch: ['backend/lib/'],
    env: {
      PORT: '3002',
      NODE_ENV: 'development'
    },
    ext: 'js jade'
  }).once('start', () => {
    cb();
  }).on('restart', deferReload);
});

gulp.task('serve', ['compile:frontend', 'copy:frontend:fonts', 'nodemon'], () => {
  browserSync.init({
    proxy: 'localhost:3002',
    port: 3000,
    serveStatic: ['frontend/.tmp', 'frontend/app']
  });

  gulp.watch('frontend/app/styles/*.scss', ['compile:styles', deferReload]);
  gulp.watch('frontend/app/scripts/**/*.js', ['compile:js', deferReload]);
  gulp.watch('backend/src/**/*.ts', ['compile:backend']);
  gulp.watch('backend/src/**/*.jade', ['copy:backend-view']);
});

gulp.task('default', ['build']);