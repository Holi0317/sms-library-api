'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('build:backend', cb => {
  runSequence(
    'clean:backend',
    ['compile:backend', 'copy:backend-view'],
    cb
  )
});