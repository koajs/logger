
/**
 * test server
 */

const Koa = require('koa')
const Boom = require('boom')
const _ = require('koa-route')
const logger = require('./index')

module.exports = function(opts) {
  const app = new Koa()
  app.use(logger(opts))

  app.use(_.get('/200', function (ctx) {
    ctx.body = 'hello world'
  }))

  app.use(_.get('/301', function (ctx) {
    ctx.status = 301
  }))

  app.use(_.get('/304', function (ctx) {
    ctx.status = 304
  }))

  app.use(_.get('/404', function (ctx) {
    ctx.status = 404
    ctx.body = 'not found'
  }))

  app.use(_.get('/500', function (ctx) {
    ctx.status = 500
    ctx.body = 'server error'
  }))

  app.use(_.get('/500-boom', function (ctx) {
    ctx.throw(Boom.badImplementation('terrible implementation'))
  }))

  app.use(_.get('/error', function (ctx) {
    throw new Error('oh no')
  }))

  return app
}

// module.exports = app
