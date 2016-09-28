'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');
let path = require('path');

function join(...args) {
  return path.join(__dirname, '../../', ...args);
}

let tsProject = ts.createProject(join('tsconfig.json'), {
  typescript: require('typescript'),
});

gulp.task('compile:backend', () => {
  return gulp.src([join('src/**/*.ts'), join('custom-typings/main.d.ts')])
    .pipe(ts(tsProject))
    .pipe(gulp.dest(join('lib')));
});