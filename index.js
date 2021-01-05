'use strict';

const counterFunc = require('passthrough-counter');
const humanize = require('humanize-number');
const bytes = require('bytes');
const chalk = require('chalk');
const util = require('util');

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

module.exports = function (options) {
  // print to console helper.
  const print = (function () {
    let transporter;
    if (typeof options === 'function') {
      transporter = options;
    } else if (options && options.transporter) {
      transporter = options.transporter;
    }

    // eslint-disable-next-line func-names
    return function printFunc(ctx, ...args) {
      const string = util.format(...args);
      if (transporter) transporter(string, args, ctx);
      else console.log(...args);
    };
  })();

  // eslint-disable-next-line func-names
  return async function logger(ctx, next) {
    // request
    const start = ctx[Symbol.for('request-received.startTime')]
      ? ctx[Symbol.for('request-received.startTime')].getTime()
      : Date.now();
    print(
      ctx,
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
    const {
      body,
      response: { length }
    } = ctx;
    let counter;
    if (length === null && body && body.readable)
      ctx.body = body.pipe((counter = counterFunc())).on('error', ctx.onerror);

    // log when the response is finished or closed,
    // whichever happens first.
    const { res } = ctx;

    const onfinish = done.bind(null, 'finish');
    const onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(print, ctx, start, counter ? counter.length : length, null, event);
    }
  };
};

// Log helper.
function log(print, ctx, start, length_, err, event) {
  // get the status code of the response
  const status = err
    ? err.isBoom
      ? err.output.statusCode
      : err.status || 500
    : ctx.status || 404;

  // set the color of the status code;
  const s = (status / 100) | 0;
  const color = colorCodes.hasOwnProperty(s) ? colorCodes[s] : colorCodes[0];

  // get the human readable response length
  const length = [204, 205, 304].includes(status)
    ? ''
    : length_ == null
    ? '-'
    : bytes(length_).toLowerCase();

  const upstream = err
    ? chalk.red('xxx')
    : event === 'close'
    ? chalk.yellow('-x-')
    : chalk.gray('-->');

  print(
    ctx,
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
    length
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
