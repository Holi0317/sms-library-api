let gulp = require('gulp');

gulp.task('copy:css', () => {
  return gulp.src('.tmp/styles/**/*.css')
    .pipe(gulp.dest('static/styles/'));
});