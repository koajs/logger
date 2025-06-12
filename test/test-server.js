const { Readable } = require('node:stream');
const Koa = require('koa');
const Boom = require('boom');
const _ = require('koa-route');
const logger = require('..');

function testServer(options) {
  const app = new Koa();
  app.use(logger(options));

  app.use(
    _.get('/200', (ctx) => {
      ctx.status = 200;
      ctx.body = 'hello world';
    })
  );

  app.use(
    _.get('/200-stream', (ctx) => {
      ctx.status = 200;
      ctx.body = Readable.from(['hello world']);
    })
  );

  app.use(
    _.get('/301', (ctx) => {
      ctx.status = 301;
    })
  );

  app.use(
    _.get('/304', (ctx) => {
      ctx.status = 304;
    })
  );

  app.use(
    _.get('/404', (ctx) => {
      ctx.status = 404;
      ctx.body = 'not found';
    })
  );

  app.use(
    _.get('/500', (ctx) => {
      ctx.status = 500;
      ctx.body = 'server error';
    })
  );

  app.use(
    _.get('/500-boom', (ctx) => {
      ctx.throw(Boom.badImplementation('terrible implementation'));
    })
  );

  app.use(
    _.get('/error', () => {
      throw new Error('oh no');
    })
  );

  return app;
}

module.exports = testServer;
