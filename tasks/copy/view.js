let gulp = require('gulp');

gulp.task('copy:view', () => {
  return gulp.src('src/**/*.pug')
    .pipe(gulp.dest('lib/'));
});