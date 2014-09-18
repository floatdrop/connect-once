'use strict';

/**
 * Creates event emitter, which will pass connection to listeners,
 * when connect function callback will be called.
 *
 * @constructor
 * @param {Object} [options] - Options for establishing connection
 * @param {Number} [options.retries=5] - Number of retries before emitting error
 * @param {Number} [options.reconnectWait=1000] - Milliseconds between reconnect trys.
 * @param {Function} [options.heartbeat] - Function, that will check connection from time to time.
 * @param {Number} [options.heartbeatTimeout=800] - Milliseconds before heartbeat function counts as failed.
 * @param {Number} [options.heartbeatInterval=1000] - Milliseconds between heartbeats calls.
 * @param {Function} connect - Function to be called with following arguments to get connection
 * @param {...Object} [arguments] - Arguments for connect function
 */
function Connection() {
    var args = Array.prototype.slice.apply(arguments);

    this.options = (args.length > 1 && typeof args[0] === 'object') ? args.shift() : {};
    this.options.retries = this.options.retries || 5;
    this.retries = this.options.retries;
    this.options.reconnectWait = this.options.reconnectWait || 1000;

    if (this.options.heartbeat && typeof this.options.heartbeat !== 'function') { throw new Error('Provided heartbeat is not a function'); }
    this.options.heartbeatTimeout = this.options.heartbeatTimeout || 800;
    this.options.heartbeatInterval = this.options.heartbeatInterval || 1000;

    this.connect = args.shift();
    if (typeof this.connect !== 'function') { throw new Error('Provided callback is not a function'); }

    this.arguments = args || [];

    this.reconnect();
}

Connection.prototype = Object.create(require('events').EventEmitter.prototype);

Connection.prototype.reconnect = function () {
    return this.connect.apply(
        this.connect,
        this.arguments.concat([this.retry.bind(this)])
    );
};

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

        if (!error && this.options.heartbeat) {
            this.checkPulse(args);
        }

        /**
         * Emitted once, when connection is available. For retrieving saved results use `when` method.
         * Contains all arguments that was called by connect function callback.
         *
         * @event Connection#available
         */
        return this.emit.apply(this,
            ['available']
            .concat(this.result)
        );
    }

    /**
     * Emitted on each reconnection try. Contains error, that happened on connection try
     *
     * @event Connection#reconnect
     */
    this.emit('reconnect', error);
    return setTimeout(this.reconnect.bind(this), this.options.reconnectWait);
};

/**
 * This method starts checking connection with heartbeat function.
 *
 * @method
 */
Connection.prototype.checkPulse = function checkPulse(args) {
    var timer = setTimeout(function () {
        this.retry(new Error('Connection is dead'));
    }.bind(this), this.options.heartbeatTimeout);

    this.options.heartbeat.apply(
        this,
        args.concat([function () {
            clearTimeout(timer);
            setTimeout(this.checkPulse.bind(this), this.options.heartbeatInterval, args);
        }.bind(this)])
    );
};

/**
 * This is wrapper around `once` method. If event is equal `available` -
 * then it will check saved results from callback, and they absent attach
 * `callback` with `once` method on event `available`.
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
