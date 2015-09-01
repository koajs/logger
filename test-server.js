
/**
 * test server
 */

var koa = require('koa');
var _ = require('koa-route');
var logger = require('./index');

module.exports.default = createServer();
module.exports.customLogger = createServer({
  logger: {
    debug: function () {
      /* ignore, params will be tested within test suite */
    }
  },
  level: 'debug'
});


function createServer(loggerOption) {
  var app = koa();
  app.use(logger(loggerOption));

  app.use(_.get('/200', function *() {
    this.body = 'hello world';
  }));

  app.use(_.get('/301', function *() {
    this.status = 301;
  }));

  app.use(_.get('/304', function *() {
    this.status = 304;
  }));

  app.use(_.get('/404', function *() {
    this.status = 404;
    this.body = 'not found';
  }));

  app.use(_.get('/500', function *() {
    this.status = 500;
    this.body = 'server error';
  }));

  app.use(_.get('/error', function *() {
    throw new Error('oh no');
  }));

  app._loggerOption = loggerOption;

  return app;
}

