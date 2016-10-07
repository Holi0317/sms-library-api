'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let requireDir = require('require-directory');

requireDir(module, './tasks');

gulp.task('build:backend', cb => {
  return runSequence(
    'clean:backend',
    ['compile:backend', 'copy:backend-view'],
    cb
  )
});