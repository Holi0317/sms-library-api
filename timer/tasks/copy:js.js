let gulp = require('gulp');

gulp.task('copy:js', () => {
  return gulp.src('src/**/*.js')
    .pipe(gulp.dest('lib/'));
});