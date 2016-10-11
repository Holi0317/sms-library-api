'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('backend/tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('compile:backend', () => {
  return gulp.src(['backend/src/**/*.ts', 'custom-typings/main.d.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('backend/lib'));
});