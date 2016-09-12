'use strict';

let {gulp, join} = require('../../gulp-utils');

gulp.task('copy:js', () => {
  return gulp.src(join('.tmp/scripts/**/*.js'))
    .pipe(gulp.dest(join('static/scripts/')));
});