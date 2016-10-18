'use strict';

let gulp = require('gulp');

gulp.task('copy:backend-view', () => {
  return gulp.src('src/views/**/*.{jade,pug}')
    .pipe(gulp.dest('lib/views/'));
});