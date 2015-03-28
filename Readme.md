
# koa-logger

Development style logger middleware for koa.

```
=> GET /
<= 200 835 ms 746 B
=> GET /
<= 200 960ms 1.9 KB
=> GET /users
<= 200 357ms 922 B
=> GET /users?page=2
<= 200 466 ms 4.66 KB
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
