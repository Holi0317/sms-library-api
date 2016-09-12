'use strict';

let {gulp, join} = require('../../gulp-utils');

gulp.task('copy:css', () => {
  return gulp.src(join('.tmp/styles/**/*.css'))
    .pipe(gulp.dest(join('static/styles/')));
});