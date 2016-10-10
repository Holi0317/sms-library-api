'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('tsconfig.json', {
  typescript: require('typescript'),
  rootDir: 'timer'
});

gulp.task('compile:backend', () => {
  return gulp.src(['timer/src/**/*.ts', 'custom-typings/main.d.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('timer/lib'));
});