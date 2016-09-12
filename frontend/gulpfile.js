'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');
let requireDir = require('require-directory');

requireDir(module, './tasks');

gulp.task('default', cb => {
  runSequence(
    'clean',
    'compile',
    'minify',
    'copy',
    cb
  );
});