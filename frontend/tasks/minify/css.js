'use strict';

let {gulp, join} = require('../../gulp-utils');
let postcss = require('gulp-postcss');

gulp.task('minify:css', () => {
  return gulp.src(join('.tmp/styles/*.css'))
    .pipe(postcss([
      require('cssnano')()
    ]))
    .pipe(gulp.dest(join('.tmp/styles')));
});