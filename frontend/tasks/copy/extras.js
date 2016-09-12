'use strict';

let {gulp, join} = require('../../gulp-utils');

gulp.task('copy:extras', () => {
  return gulp.src([
    join('app/*.*'),
    `!${join('app/.eslintrc')}`
  ], {
    dot: true
  }).pipe(gulp.dest(join('static')));
});
