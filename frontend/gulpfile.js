'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let requireDir = require('require-directory');

requireDir(module, './tasks');

gulp.task('build:frontend', cb => {
  runSequence(
    'clean:frontend',
    'compile',
    'minify',
    'copy',
    cb
  );
});