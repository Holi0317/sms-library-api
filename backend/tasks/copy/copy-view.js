let gulp = require('gulp');

gulp.task('copy:view', () => {
  return gulp.src('src/views/**/*.pug')
    .pipe(gulp.dest('lib/views/'));
});