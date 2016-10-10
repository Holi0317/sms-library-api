'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript'),
  rootDir: 'backend'
});

gulp.task('compile:backend', () => {
  return gulp.src(['backend/src/**/*.ts', 'custom-typings/main.d.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('backend/lib'));
});