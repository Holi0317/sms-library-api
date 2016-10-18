'use strict';

let gulp = require('gulp');
let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');

gulp.task('nginx-conf', cb => {
  let backend_url = argv['backend-url'];
  let server_name = argv['server-name'];
  if (!backend_url) {
    cb(new Error('Backend url not defined. It should be defined as a flag, --backend-url'));
    return;
  }
  if (!server_name) {
    cb(new Error('Server name not defined. It should be defined as a flag, --server-name'));
  }
  fs.readFile('nginx.template.conf', 'utf8', (err, file) => {
    if (err) throw err;
    let ctx = file.replace('%%backend_url%%', backend_url).replace('%%server_name%%', server_name);
    fs.writeFile('nginx.conf', ctx, 'utf8', cb);
  });
});