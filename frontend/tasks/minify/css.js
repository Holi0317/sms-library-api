'use strict';

let gulp = require('gulp');
let postcss = require('gulp-postcss');

gulp.task('minify:css', () => {
  return gulp.src('frontend/.tmp/styles/*.css')
    .pipe(postcss([
      require('cssnano')()
    ]))
    .pipe(gulp.dest('frontend/.tmp/styles'));
});