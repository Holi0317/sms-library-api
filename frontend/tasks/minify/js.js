'use strict';

let {gulp, join} = require('../../gulp-utils');
let uglify = require('gulp-uglify');

gulp.task('minify:js', () => {
  return gulp.src(join('.tmp/scripts/bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest(join('.tmp/scripts/')));
});