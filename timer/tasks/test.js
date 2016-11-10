let gulp = require('gulp');
let ava = require('gulp-ava');

gulp.task('test', ['compile'], () => {
  return gulp.src('test/**/*.js')
    .pipe(ava());
});