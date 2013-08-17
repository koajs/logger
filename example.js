
var logger = require('./');
var koa = require('koa');
var app = koa();

// wrap subsequent middleware in a logger

app.use(logger());

// response middleware

app.use(function(next){
  return function *(){
    // yield control downstream
    yield next;

    // sleep for 0-1s
    yield sleep(Math.random() * 1000 | 0);

    // random body
    var body = Array(Math.random() * 5 * 1024 | 9).join('a');
    this.status = Math.random() > .75 ? 500 : 200;
    this.body = body;
  }
});

app.listen(3000);
console.log('listening on port 3000');

// sleep helper

function sleep(ms) {
  return function(done){
    setTimeout(done, ms);
  }
}