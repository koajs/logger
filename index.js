
/**
 * Module dependencies.
 */

var bytes = require('bytes');
var ms = require('ms');

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
  return function(next) {
    return function *dev(){
      // request
      var start = new Date;
      console.log('  \033[90m<-- \033[;1m%s\033[90m %s\033[0m', this.method, this.url);
      
      try {
        yield next;
        log(this, start);
      } catch (err) {
        log(this, start, err);
        throw err;
      }
    }
  }
}

/**
 * Log helper.
 */

function log(ctx, start, err) {
  err = err || {};

  // time
  var delta = ms(new Date - start);
  
  // length
  var len = ctx.responseLength;

  var s = (err.status || ctx.status) / 100 | 0;
  var c = colors[s];

  console.log('  \033[90m--> \033[;1m%s\033[90m %s \033[' + c + 'm%s\033[90m %s %s\033[0m',
    ctx.method,
    ctx.url,
    ctx.status,
    delta,
    null == len ? '-' : bytes(len));
}
