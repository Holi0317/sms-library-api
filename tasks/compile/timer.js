'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');

let tsProject = ts.createProject('timer/tsconfig.json', {
  typescript: require('typescript')
});

gulp.task('compile:timer', () => {
  return gulp.src(['timer/src/**/*.ts', 'custom-typings/main.d.ts'])
    .pipe(tsProject())
    .pipe(gulp.dest('timer/lib'));
});