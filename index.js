
/**
 * Module dependencies.
 */

var Counter = require('passthrough-counter');
var humanize = require('humanize-number');
var bytes = require('bytes');

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

function dev() {
  return function *dev(next) {
    // request
    var start = new Date;

    console.log(isatty
      ? '  \033[90m<-- \033[;1m%s\033[90m %s\033[0m'
      : '  <-- %s %s',
      this.method,
      this.url);

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
    var body = this.body;
    var counter;
    if (null == length && body && body.readable) {
      this.body = body
        .pipe(counter = Counter())
        .on('error', this.onerror);
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
      log(ctx, start, counter ? counter.length : length);
    }
  }
}

/**
 * Log helper.
 */

function log(ctx, start, len, err) {
  err = err || {};

  // get the status code of the response
  var status = err.status || ctx.status;
  var handled = status != 200 || ctx.body != null;
  if (!handled) status = 404;

  // set the color of the status code;
  var s = status / 100 | 0;
  var c = colors[s];

  // get the human readable response length
  var length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null == len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  console.log(isatty
    ? '  \033[90m--> \033[;1m%s\033[90m %s \033[' + c + 'm%s\033[90m %s %s\033[0m'
    : '  --> %s %s %s %s %s',
    ctx.method,
    ctx.url,
    status,
    time(start),
    length);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}
