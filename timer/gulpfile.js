'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let requireDir = require('require-directory');

requireDir(module, './tasks');

gulp.task('build:timer', cb => {
  return runSequence(
    'clean:timer',
    'compile:timer',
    cb
  )
});