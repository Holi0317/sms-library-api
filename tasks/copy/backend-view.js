'use strict';

let gulp = require('gulp');

gulp.task('copy:backend-view', () => {
  return gulp.src('backend/src/views/**/*.{jade,pug}')
    .pipe(gulp.dest('backend/lib/views/'));
});