'use strict';

let gulp = require('gulp');
let ts = require('gulp-typescript');
let path = require('path');

function join(...args) {
  return path.join(__dirname, '../../', ...args);
}

let tsProject = ts.createProject({
  typescript: require('typescript'),
  outDir: join('lib'),
  noImplicitAny: true,
  target: 'ES6',
  module: 'commonjs',
  removeComments: false,
  experimentalAsyncFunctions: true,
  experimentalDecorators: true,
  moduleResolution: 'node'
});

gulp.task('compile:backend', () => {
  return gulp.src(join('src/**/*.ts'))
    .pipe(ts(tsProject))
    .pipe(gulp.dest(join('lib')));
});