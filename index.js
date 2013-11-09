
/**
 * Module dependencies.
 */

var bytes = require('bytes');
var ms = require('ms');
var Stream = require('stream');

/**
 * TTY check for dev format.
 */

var isatty = process.stdout.isTTY;

/**
 * Expose logger.
 */

module.exports = dev;

/**
 * Color map.
 */

var colors = {
  5: 31,
  4: 33,
  3: 36,
  2: 32,
  1: 32
};

/**
 * Development logger.
 */

function dev(opts) {
  return function *dev(next) {
    // request
    var start = new Date;
    console.log('  \033[90m<-- \033[;1m%s\033[90m %s\033[0m', this.method, this.url);

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(this, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    var length = this.responseLength;

    if (null == length && this.body instanceof Stream.Readable) {
      length = 0;
      var through = new Stream.PassThrough;
      var counter = new Stream.Writable;
      counter._write = function(chunk, enc, cb){
        length += chunk.length;
        cb();
      };
      this.body.pipe(through).on('error', this.onerror);
      this.body.pipe(counter).on('error', this.onerror);
      this.body = through;
    }

    // log when the response is finished or closed,
    // whichever happens first.
    var ctx = this;
    var res = this.res;

    res.once('finish', done);
    res.once('close', done);

    function done(){
      res.removeListener('finish', done);
      res.removeListener('close', done);
      log(ctx, start, length);
    }
  }
}

/**
 * Log helper.
 */

function log(ctx, start, len, err) {
  err = err || {};

  // time
  var delta = ms(new Date - start);

  var s = (err.status || ctx.status) / 100 | 0;
  var c = colors[s];

  console.log('  \033[90m--> \033[;1m%s\033[90m %s \033[' + c + 'm%s\033[90m %s %s\033[0m',
    ctx.method,
    ctx.url,
    ctx.status,
    delta,
    null == len ? '-' : bytes(len));
}
