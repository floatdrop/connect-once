/* global describe, it */
'use strict';

delete require.cache[require.resolve('..')];
var connectOnce = require('..'),
    should = require('should');

describe('connectOnce', function () {
    it('should emit available', function (done) {
        var connection = connectOnce(function (cb) { cb(null, 'string'); });
        connection.on('available', function (err, str) {
            should.not.exist(err);
            should.exist(str);
            str.should.eql('string');
            done();
        });
    });

    it('should call connect function', function (done) {
        connectOnce(done);
    });

    it('should throw with invalid parameters', function () {
        var re = /Provided callback is not a function/;
        should.throws(connectOnce.bind(null, 'string'), re);
        should.throws(connectOnce.bind(null, {}, 'string'), re);
        should.throws(connectOnce.bind(null, 'string', 'string'), re);
        should.throws(connectOnce.bind(null, 'string', 'string', 'string'), re);
    });

    it('should not throw with valid parameters', function () {
        should.doesNotThrow(connectOnce.bind(null, function () { }));
        should.doesNotThrow(connectOnce.bind(null, {}, function () { }));
        should.doesNotThrow(connectOnce.bind(null, {}, function () { }, 'string'));
        should.doesNotThrow(connectOnce.bind(null, function () { }, 'string'));
    });
});
