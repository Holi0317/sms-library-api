let gulp = require('gulp');

gulp.task('copy:js', () => {
  return gulp.src('.tmp/scripts/**/*.js')
    .pipe(gulp.dest('static/scripts/'));
});