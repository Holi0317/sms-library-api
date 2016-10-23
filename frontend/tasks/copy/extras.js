let gulp = require('gulp');

gulp.task('copy:extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/.eslintrc'
  ], {
    dot: true
  }).pipe(gulp.dest('static'));
});
