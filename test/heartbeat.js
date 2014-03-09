/* global describe, it */
'use strict';

delete require.cache[require.resolve('..')];
var connectOnce = require('..'),
    is = require('is');

require('should');

describe('heartbeat', function () {
    it('should reconnect when heartbeat is not called beat cb', function (done) {
        var connection = new connectOnce({
            heartbeatTimeout: 10,
            heartbeat: function () { }
        }, function (cb) { cb(); });

        connection.when('reconnect', function () {
            done();
        });
    });

    it('should not reconnect when heartbeat is called beat cb', function (done) {
        var beats = 0;

        var connection = new connectOnce({
            heartbeatInterval: 10,
            heartbeat: function (beat) {
                beat();
                beats ++;
                if (beats === 5) {
                    done();
                }
            }
        }, function (cb) { cb(); });

        connection.when('reconnect', function () {
            done('Reconnect is called');
        });
    });

    it('should pass parameters and beat function to heartbeat', function (done) {
        new connectOnce({
            heartbeatInterval: 10,
            heartbeat: function (error, one, two, beat) {
                is.fn(beat).should.be.ok;
                one.should.eql('one');
                two.should.eql('two');
                done();
            }
        }, function (cb) { cb(null, 'one', 'two'); });
    });

    it('should call heatbeat function', function (done) {
        new connectOnce({
            heartbeatInterval: 10,
            heartbeat: function () {
                done();
            }
        }, function (cb) { cb(); });
    });
});
