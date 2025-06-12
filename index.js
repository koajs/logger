'use strict';

const util = require('node:util');
const Counter = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const chalk = require('chalk');

// color map.
const colorCodes = {
  7: 'magenta',
  5: 'red',
  4: 'yellow',
  3: 'cyan',
  2: 'green',
  1: 'green',
  0: 'yellow'
};

// Log helper.
function log(print, ctx, start, length, err, event) {
  // get the status code of the response
  const status = err
    ? err.isBoom
      ? err.output.statusCode
      : err.status || 500
    : ctx.status || 404;

  // set the color of the status code;
  const s = (status / 100) | 0;
  const color = colorCodes[s > 7 ? 0 : s];

  // get the human readable response length
  const formattedLength = [204, 205, 304].includes(status)
    ? ''
    : length
      ? bytes(length).toLowerCase()
      : '-';

  const upstream = err
    ? chalk.red('xxx')
    : event === 'close'
      ? chalk.yellow('-x-')
      : chalk.gray('-->');

  print(
    '  ' +
      upstream +
      ' ' +
      chalk.bold('%s') +
      ' ' +
      chalk.gray('%s') +
      ' ' +
      chalk[color]('%s') +
      ' ' +
      chalk.gray('%s') +
      ' ' +
      chalk.gray('%s'),
    ctx.method,
    ctx.originalUrl,
    status,
    time(start),
    formattedLength
  );
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */
function time(start) {
  const delta = Date.now() - start;
  return humanize(
    delta < 10000 ? delta + 'ms' : Math.round(delta / 1000) + 's'
  );
}

function koaLogger(options) {
  // print to console helper.
  const print = (function () {
    let transporter;
    if (typeof options === 'function') {
      transporter = options;
    } else if (options && options.transporter) {
      transporter = options.transporter;
    }

    // eslint-disable-next-line func-names
    return function printFunc(...args) {
      const string = util.format(...args);
      if (transporter) transporter(string, args);
      else console.log(...args);
    };
  })();

  // eslint-disable-next-line func-names
  return async function logger(ctx, next) {
    // request
    const start = (() => {
      // see: https://github.com/koajs/logger/pull/79
      const injectedRequestRecivedStartTime =
        ctx[Symbol.for('request-received.startTime')];
      if (!injectedRequestRecivedStartTime) return Date.now();
      // TOD-O: remove cabinjs/request-received on our next major release (ts)
      console.warn(
        '[DEPRECATION WARNING]: Support for `request-received` will be removed in the next major release.'
      );

      // support request-received v0.0.1
      if ('getTime' in injectedRequestRecivedStartTime)
        return injectedRequestRecivedStartTime.getTime();
      // support request-received v0.2.0 + v0.3.0
      return injectedRequestRecivedStartTime;
    })();

    print(
      '  ' +
        chalk.gray('<--') +
        ' ' +
        chalk.bold('%s') +
        ' ' +
        chalk.gray('%s'),
      ctx.method,
      ctx.originalUrl
    );

    try {
      await next();
    } catch (err) {
      // log uncaught downstream errors
      log(print, ctx, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.

    let counter;
    if (ctx.response.length === 0 && ctx.body && ctx.body.readable)
      counter = ctx.body.pipe(new Counter()).on('error', ctx.onerror);

    // log when the response is finished or closed,
    // whichever happens first.
    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');

    ctx.res.once('finish', onfinish);
    ctx.res.once('close', onclose);

    function done(event) {
      const length = counter ? counter.length : ctx.response.length;
      ctx.res.removeListener('finish', onfinish);
      ctx.res.removeListener('close', onclose);
      log(print, ctx, start, length, null, event);
    }
  };
}

module.exports = koaLogger;
