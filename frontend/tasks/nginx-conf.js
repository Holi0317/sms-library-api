'use strict';

let {gulp, join} = require('../gulp-utils');
let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');

gulp.task('nginx-conf', cb => {
  let backend_url = argv['backend-url'];
  let server_url = argv['server-url'];
  if (!backend_url) {
    cb(new Error('Backend url not defined. It should be defined as a flag, --backend-url'));
    return;
  }
  if (!server_url) {
    cb(new Error('Server url not defined. It should be defined as a flag, --server-url'));
  }
  fs.readFile(join('nginx.template.conf'), 'utf8', (err, file) => {
    if (err) throw err;
    let ctx = file.replace('%%backend_url%%', backend_url).replace('%%server_url%%', server_url);
    fs.writeFile(join('nginx.conf'), ctx, 'utf8', cb);
  });
});