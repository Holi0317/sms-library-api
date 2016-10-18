'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('build:timer', cb => {
  runSequence(
    'clean:timer',
    'compile:timer',
    cb
  )
});