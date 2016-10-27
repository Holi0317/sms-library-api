let gulp = require('gulp');
let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs');

gulp.task('nginx-conf', cb => {
  let server_name = argv['server-name'];
  if (!server_name) {
    cb(new Error('Server name not defined. It should be defined as a flag, --server-name'));
    return;
  }
  fs.readFile('nginx.template.conf', 'utf8', (err, file) => {
    if (err) throw err;
    let ctx = file.replace('%%server_name%%', server_name);
    fs.writeFile('nginx.conf', ctx, 'utf8', cb);
  });
});