'use strict';

let gulp = require('gulp');

gulp.task('copy:frontend:extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/.eslintrc'
  ], {
    dot: true
  }).pipe(gulp.dest('static'));
});
