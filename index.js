/**
 * Module dependencies.
 */
var col = require('colors');
var Counter = require('passthrough-counter');
var unit = require('unitex');

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

col.setTheme({
  1: 'green',
  2: 'green',
  3: 'blue',
  4: 'yellow',
  5: 'red'
});

/**
 * Development logger.
 */

function dev(opts) {
  return function* logger(next) {
    // request
    var start = new Date;
    console.log(
        '=>'.white,
        this.method,
        this.url.yellow
    );

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
    var length = this.response.length;
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

    var onfinish = done.bind(null, 'finish');
    var onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, counter ? counter.length : length, null, event);
    }
  }
}

/**
 * Log helper.
 */

var datafmt = unit.formatter({ unit: 'B', base: 1024, atomic: true });

function log(ctx, start, len, err, event) {
  // get the status code of the response
  var status = err ? (err.status || 500) : (ctx.status || 404);

  // get the human readable response length
  var length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (len == null) {
    length = '-';
  } else {
    length = datafmt(len);
  }

  console.log(
    err ? 'xx'.red : event === 'close' ? '--'.red : '<='.white,
    col[status / 100 | 0](status),
    col.blue(time(start)),
    col.green(length)
  );
}

/**
 * Show the response time in a human readable format.
 */

var timefmt = unit.formatter({ unit: 's', prefix: -1 });

function time(start) {
  var delta = new Date - start;
  return timefmt(delta);
}
