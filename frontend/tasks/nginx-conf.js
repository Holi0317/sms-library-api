'use strict';

let {gulp, join} = require('../gulp-utils');
let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');

gulp.task('nginx-conf', cb => {
  let backend_url = argv['backend-url'];
  if (!backend_url) {
    cb(new Error('Backend url not defined. It should be defined as the last argument passed into this script.'));
    return;
  }
  fs.readFile(join('nginx.template.conf'), 'utf8', (err, file) => {
    if (err) throw err;
    let ctx = file.replace('%%backend_url%%', backend_url);
    fs.writeFile(join('nginx.conf'), ctx, 'utf8', cb);
  });
});