'use strict';

let gulp = require('gulp');
let postcss = require('gulp-postcss');
let cssnano = require('cssnano');

gulp.task('minify:css', () => {
  return gulp.src('frontend/.tmp/styles/*.css')
    .pipe(postcss([
      cssnano()
    ]))
    .pipe(gulp.dest('frontend/.tmp/styles'));
});