let gulp = require('gulp');

gulp.task('copy:view', () => {
  return gulp.src('src/views/**/*.{jade,pug}')
    .pipe(gulp.dest('lib/views/'));
});