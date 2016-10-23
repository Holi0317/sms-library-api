let gulp = require('gulp');
let flatten = require('gulp-flatten');

gulp.task('copy:fonts', () => {
  return gulp.src('node_modules/**/*.{woff2,woff,ttf}')
    .pipe(flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('static/fonts'));
});