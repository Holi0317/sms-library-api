'use strict';

let gulp = require('gulp');

gulp.task('copy:frontend:css', () => {
  return gulp.src('.tmp/styles/**/*.css')
    .pipe(gulp.dest('static/styles/'));
});