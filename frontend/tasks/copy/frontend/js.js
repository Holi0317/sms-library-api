'use strict';

let gulp = require('gulp');

gulp.task('copy:frontend:js', () => {
  return gulp.src('.tmp/scripts/**/*.js')
    .pipe(gulp.dest('static/scripts/'));
});