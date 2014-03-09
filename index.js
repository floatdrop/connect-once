'use strict';

/**
 * Creates event emitter, which will pass connection to listeners,
 * when connect function callback will be called.
 *
 * @constructor
 * @param {Object} [options] - Options for establishing connection
 * @param {Number} [options.retries=5] - Number of retries before emitting error
 * @param {Number} [options.reconnectWait=1000] - Milliseconds between reconnect trys.
 * @param {Function} connect - Function to be called with following arguments to get connection
 * @params {...Object} [arguments] - Arguments for connect function
 */
function Connection() {
    var args = Array.prototype.slice.apply(arguments);

    this.options = (args.length > 1 && typeof args[0] === 'object') ? args.shift() : {};
    this.options.retries = this.options.retries || 5;
    this.retries = this.options.retries;
    this.options.reconnectWait = this.options.reconnectWait || 1000;

    this.connect = args.shift();
    if (typeof this.connect !== 'function') { throw new Error('Provided callback is not a function'); }

    this.arguments = args || [];

    this.connect.apply(
        this.connect,
        args.concat([this.retry.bind(this)])
    );
}

Connection.prototype = Object.create(require('events').EventEmitter.prototype);

/**
 * Callback, that will be passed to connect function. When connection is available
 * it will store results of connect function and emit `available` event with them.
 * If error returned from connect function it will retry to connect accordingly to
 * options and emit `available` with error as first argument on retries == 0.
 *
 * @method
 */
Connection.prototype.retry = function retry() {
    var args = Array.prototype.slice.call(arguments);

    var error = args[0];
    this.retries --;

    if (!error || this.retries <= 0) {
        this.retries = this.options.retries;
        this.result = args;
        return this.emit.apply(this,
            ['available']
            .concat(this.result)
        );
    }

    this.emit('reconnect', error);
    return setTimeout(function () {
        this.connect.apply(
            this.connect,
            this.arguments.concat([this.retry.bind(this)])
        );
    }.bind(this), this.options.reconnectWait);
};

/**
 * Wrapper around `on` method, that will call passed callback if
 * this.results is present or attach listener otherwise.
 *
 * @method
 */
Connection.prototype.when = function when() {
    var args = Array.prototype.slice.call(arguments);
    if (this.result && // if it when('available', funciton)
        args.length === 2 &&
        args[0] === 'available' &&
        typeof args[1] === 'function') { // then apply cached results
        return args[1].apply(null, this.result);
    }
    this.once.apply(this, args);
};

module.exports = Connection;
