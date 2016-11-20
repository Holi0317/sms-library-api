let app = require('./app');
let config = require('../common/config').config;
let debug = require('debug')('sms-library-helper:server');
let http = require('http');

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

let port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

config.sequelize.sync()
  .then(() => {
    server.listen(port);
  });
server.on('error', err => {
  if (err.syscall !== 'listen') {
    throw err;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (err.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw err;
  }
});
server.on('listening', () => {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
});