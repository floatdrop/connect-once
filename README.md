# connect-once [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status](coveralls-image)](coveralls-url) [![Dependency Status][depstat-image]][depstat-url]
> Connect once and memorize connection for next usages

## Usage

```js
var connection = new connectOnce({ 
    retries: 60, 
    reconnectWait: 1000
}, MongoClient.connect, 'mongodb://localhost/test');

connection.when('available', function (err, db) {
    if (err) {
        return next(err);
    }
    req.db = db;
    next();
});
```

## API

### connect-once([options,] connectFunction[, connectArguments ...])

### Options:

#### options.retries
Type: `Number`
Default: `5`

#### options.reconnectWait
Type: `Number`
Default: `1000`

# License

(MIT License) (c) 2013 Vsevolod Strukchinsky (floatdrop@gmail.com)


[npm-url]: https://npmjs.org/package/connect-once
[npm-image]: https://badge.fury.io/js/connect-once.png

[travis-url]: http://travis-ci.org/floatdrop/connect-once
[travis-image]: https://travis-ci.org/floatdrop/connect-once.png?branch=master

[coveralls-url]: https://coveralls.io/r/floatdrop/connect-once
[coveralls-image]: https://coveralls.io/repos/floatdrop/connect-once/badge.png

[depstat-url]: https://david-dm.org/floatdrop/connect-once
[depstat-image]: https://david-dm.org/floatdrop/connect-once.png?theme=shields.io
