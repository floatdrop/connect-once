/* global describe, it */
/* jshint immed: false */
'use strict';

delete require.cache[require.resolve('..')];
var connectOnce = require('..'),
    should = require('should');

describe('connection', function () {

    it('should give retries count before error event', function (done) {
        var errorSample = new Error('Bang Bang!');

        var connection = new connectOnce({ retries: 5, reconnectWait: 10 }, function (cb) {
            setTimeout(cb, 1, errorSample);
        });

        var reconnects = 0;

        connection.on('reconnect', function (err) {
            reconnects += 1;
            should(err).eql(errorSample);
        });

        connection.when('available', function (err) {
            reconnects.should.eql(4);
            should(err).eql(errorSample);
            done();
        });
    });

    it('should call async `connect` function once', function (done) {
        var connection = new connectOnce(function (cb) {
            setTimeout(cb, 1, null, 'string');
            done();
        });

        function check(err, str) {
            should.not.exist(err);
            should.exist(str);
            str.should.eql('string');
        }

        connection.when('available', check);
        connection.when('available', check);
    });

    it('should call `connect` function once', function (done) {
        var connection = new connectOnce(function (cb) {
            cb(null, 'string');
            done();
        });

        function check(err, str) {
            should.not.exist(err);
            should.exist(str);
            str.should.eql('string');
        }

        connection.when('available', check);
        connection.when('available', check);
    });

    it('should save results and call `when` immediately', function (done) {
        var connection = new connectOnce(function (cb) { cb(null, 'string'); });
        connection.when('available', function (err, str) {
            should.not.exist(err);
            should.exist(str);
            str.should.eql('string');
            done();
        });
    });

    it('should emit available', function (done) {
        var connection = new connectOnce(function (cb) { setTimeout(cb, 1, null, 'string'); });
        connection.on('available', function (err, str) {
            should.not.exist(err);
            should.exist(str);
            str.should.eql('string');
            done();
        });
    });

    it('should call connect function', function (done) {
        new connectOnce(function () {
            arguments.length.should.eql(1);
            done();
        });
    });

});
