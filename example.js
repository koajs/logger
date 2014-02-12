
var logger = require('./');
var koa = require('koa');
var compress = require('koa-compress')();
var app = koa();

// wrap subsequent middleware in a logger

app.use(logger());

// 204

app.use(function *(next){
  if ('/204' == this.path) this.status = 204;
  else yield next;
})

// 404

app.use(function *(next){
  if ('/404' == this.path) return;
  yield next;
})

// destroy

app.use(function *(next){
  if ('/close' == this.path) return this.req.destroy();
  yield next;
})

// compress the response 1/2 the time to calculate the stream length

app.use(function *(next){
  if (Math.random() > 0.5) {
    yield next;
  } else {
    yield compress.call(this, next);
  }
})

// response middleware

app.use(function *(next){
  // yield control downstream
  yield next;

  // sleep for 0-2s
  yield sleep(Math.random() * 2000 | 0);

  // error
  if (Math.random() > .75) {
    var err = new Error('boom');
    err.status = 500;
    throw err;
  }

  // random body
  var body = Array(Math.random() * 5 * 1024 | 9).join('a');
  this.status = 200;
  this.body = body;
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on port ' + port);

// sleep helper

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}