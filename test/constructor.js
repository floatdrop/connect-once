/* global describe, it */
/* jshint immed: false */
'use strict';

delete require.cache[require.resolve('..')];
var connectOnce = require('..');

require('should');

describe('constructor', function () {
    it('should throw with invalid parameters', function () {
        var re = /Provided callback is not a function/;
        (function () { new connectOnce('string'); }).should.throw(re);
        (function () { new connectOnce({}, 'string'); }).should.throw(re);
        (function () { new connectOnce('string', 'string'); }).should.throw(re);
        (function () { new connectOnce('string', 'string', 'string'); }).should.throw(re);
    });

    it('should not throw with valid parameters', function () {
        var nop = function () { };
        (function () { new connectOnce(nop); }).should.not.throw();
        (function () { new connectOnce({}, nop); }).should.not.throw();
        (function () { new connectOnce({}, nop, 'string'); }).should.not.throw();
        (function () { new connectOnce(nop, 'string'); }).should.not.throw();
    });
});
