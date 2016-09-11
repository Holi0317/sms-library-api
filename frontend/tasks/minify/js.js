'use strict';

let gulp = require('gulp');
let uglify = require('gulp-uglify');

gulp.task('minify:js', () => {
  return gulp.src('frontend/.tmp/scripts/bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('frontend/.tmp/scripts/'));
});