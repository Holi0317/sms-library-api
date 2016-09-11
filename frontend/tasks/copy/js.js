'use strict';

let gulp = require('gulp');

gulp.task('copy:js', () => {
  return gulp.src('frontend/.tmp/scripts/**/*.js')
    .pipe(gulp.dest('frontend/static/scripts/'));
});