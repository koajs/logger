
# koa-logger

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

 Development style logger middleware for [Koa](https://github.com/koajs/koa).

```
<-- GET /
--> GET / 200 835ms 746b
<-- GET /
--> GET / 200 960ms 1.9kb
<-- GET /users
--> GET /users 200 357ms 922b
<-- GET /users?page=2
--> GET /users?page=2 200 466ms 4.66kb
```

## Installation

```js
$ npm install koa-logger
```

## Example

```js
var logger = require('koa-logger')
var koa = require('koa')

var app = koa()
app.use(logger())
```

## Notes

  Recommended that you `.use()` this middleware near the top
  to "wrap" all subsequent middleware.

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa-logger.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koa-logger
[travis-image]: https://img.shields.io/travis/koajs/logger.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/logger
