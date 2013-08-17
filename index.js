
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
      yield next;

      // time
      var delta = ms(new Date - start);
      
      // length
      var len = this.responseLength;

      var s = this.status / 100 | 0;
      var c = colors[s];

      console.log('  \033[90m--> \033[;1m%s\033[90m %s \033[' + c + 'm%s\033[90m %s %s\033[0m',
        this.method,
        this.url,
        this.status,
        delta,
        null == len ? '-' : bytes(len));
    }
  }
}
