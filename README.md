# connect-once [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]
> Memorizing async function result

This module solves [problem](http://stackoverflow.com/questions/6275643/node-js-design-pattern-for-creating-db-connection-once/25209316#25209316) with connection creating in Node.JS.

Most known example - MongoDB connections. Often you want to get one connection shared with all incoming requests. However there are two edges, that can hurt you, when your application starting under significant load. Connection should be:

 * Created once for all requests, that are coming at the same time - otherwise you can take down your database connection pool.
 * Ready before first request arrives - to reduce page loading time.

Also it is nice to have some retries, when database decides to take a rest. For this (and other) tasks connect-once was written. 

## Usage

You can see [express-mongo-db](https://github.com/floatdrop/express-mongo-db) and [express-mongoose-db](https://github.com/floatdrop/express-mongoose-db) as real-life examples of connect-once usage.

Install package with npm:

`npm i connect-once --save`

Then create a connection:

```js
var connectOnce = require('connect-once');

var connection = new connectOnce({ 
    retries: 60, 
    reconnectWait: 1000
}, MongoClient.connect, 'mongodb://localhost/test');

connection.when('available', function (err, db) {
    // Do stuff
});
```

## Heartbeat

Heartbeat is useful, when you want check connection from time to time. For example, if you working with mongodb and cache connection to db - what happens when server, which connection binded to goes to heaven? Connection is lost and programmer should recreate it.

__Note:__ for now there is no way to stop heartbeats.

```js
var connectOnce = require('connect-once');

var connection = new connectOnce({ 
    heartbeat: function (db, beat) {
        db.stats(function (err) {
            if (!err) { beat(); }
        });
    }
}, MongoClient.connect, 'mongodb://localhost/test');

connection.when('available', function (err, db) {
    // Do stuff
});
```

## Force retry (update cached value)

There are interesting use case of connect-once in a wild: it can be used as some sort of in-memory cache. Because it consumes general function with callback - there is no difference, what to memorize - connection or abstract object.

Suppose you have a function `getCache(callback)`, that invokes `callback` with next arguments: `null, new Date()`. To update cached value from time-to time you can use next code:

```js
var connectOnce = require('connect-once');
var connection = new connectOnce(getCache);
setInterval(function () {
    connection.retry(new Error('Update cache'));
}, 5000);
```

Also `available` event will be fired every 5000 seconds.

## API

You can read [source code](https://github.com/floatdrop/connect-once/blob/master/index.js) (65 sloc!) or generated [documentation of Connection class](http://floatdrop.github.io/connect-once/Connection.html) which is not very nice. 

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
