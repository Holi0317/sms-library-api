'use strict';

let gulp = require('gulp');
let uglify = require('gulp-uglify');

gulp.task('minify:js', () => {
  return gulp.src('.tmp/scripts/bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('.tmp/scripts/'));
});