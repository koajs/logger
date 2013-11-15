
var logger = require('./');
var koa = require('koa');
var compress = require('koa-compress')();
var app = koa();

// wrap subsequent middleware in a logger

app.use(logger());

// compress the response 1/2 the time to calculate the stream length

app.use(function* (next) {
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

app.listen(3000);
console.log('listening on port 3000');

// sleep helper

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}