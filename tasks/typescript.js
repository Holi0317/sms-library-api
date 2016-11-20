let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('typescript', () => {
  return gulp.src(['src/**/*.ts', 'custom-typings/*.d.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('lib'));
});