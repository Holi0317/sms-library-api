let gulp = require('gulp');
let postcss = require('gulp-postcss');
let cssnano = require('cssnano');

gulp.task('minify:css', () => {
  return gulp.src('.tmp/styles/*.css')
    .pipe(postcss([
      cssnano()
    ]))
    .pipe(gulp.dest('.tmp/styles'));
});