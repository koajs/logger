const { process } = require('node:process');
const Koa = require('koa');
const compress = require('koa-compress')();
const logger = require('.');

const app = new Koa();

// wrap subsequent middleware in a logger
app.use(logger());

// 204
app.use((ctx, next) => {
  if (ctx.path === '/204') ctx.status = 204;
  else return next();
});

// 404
app.use((ctx, next) => {
  if (ctx.path === '/404') return;
  return next();
});

// destroy
app.use((ctx, next) => {
  if (ctx.path === '/close') return ctx.req.destroy();
  return next();
});

// compress the response 1/2 the time to calculate the stream length
app.use((ctx, next) => {
  if (Math.random() > 0.5) {
    return next();
  }

  return compress(ctx, next);
});

// response middleware
app.use(async (ctx, next) => {
  // yield control downstream
  await next();

  // sleep for 0-2s
  await sleep((Math.random() * 2000) | 0);

  // error
  if (Math.random() > 0.75) {
    const err = new Error('boom');
    err.status = 500;
    throw err;
  }

  // random body
  const body = Array.from({ length: (Math.random() * 5 * 1024) | 9 }).join('a');
  ctx.status = 200;
  ctx.body = body;
});

const port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on port ' + port);

// sleep helper
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}
