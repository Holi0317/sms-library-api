'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('build:frontend', cb => {
  runSequence(
    'clean:frontend',
    'compile:frontend',
    'minify',
    'copy:frontend',
    cb
  );
});