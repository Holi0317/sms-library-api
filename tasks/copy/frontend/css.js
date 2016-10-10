'use strict';

let gulp = require('gulp');

gulp.task('copy:frontend:css', () => {
  return gulp.src('frontend/.tmp/styles/**/*.css')
    .pipe(gulp.dest('frontend/static/styles/'));
});