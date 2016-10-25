let gulp = require('gulp');
let exec = require('child_process').exec;

gulp.task('run', ['build'], cb => {
  let child = exec('node lib/index.js');
  child.stdout.on('data', data => {
    console.log(data);
  });
  child.stderr.on('data', data => {
    console.error(data);
  });
  child.on('close', code => {
    console.log('index.js exited with code: ', code);
    if (code !== 0) return cb(code);
    cb();
  });
});