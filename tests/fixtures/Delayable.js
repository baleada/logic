(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

/*
 * Delayable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/**
 * Delayable is a library that enriches a function by:
 * - Giving it the methods necessary to execute itself after a delay or at regular intervals<
 * - Allowing it to store the time elapsed since it was delayed, the time remaining until it will be executed, and the number of times it has been executed
 * Delayable depends on `[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout)`, `[setInterval](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval)`, `[requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)`, and the `[global Data object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)`, but is otherwise written in vanilla JS. Delayable powers <nuxt-link to="/docs/tools/composition-functions/useDelayable">`useDelayable`</nuxt-link>.
 */
var Delayable =
/*#__PURE__*/
function () {
  /* Private properties */
  function Delayable(callback, options) {
    _classCallCheck(this, Delayable);

    _delay.set(this, {
      writable: true,
      value: void 0
    });

    _isInterval.set(this, {
      writable: true,
      value: void 0
    });

    _parameters.set(this, {
      writable: true,
      value: void 0
    });

    _id.set(this, {
      writable: true,
      value: void 0
    });

    _tickId.set(this, {
      writable: true,
      value: void 0
    });

    _started.set(this, {
      writable: true,
      value: void 0
    });

    _setTimeout.set(this, {
      writable: true,
      value: function value() {
        var _window,
            _this = this,
            _arguments = arguments;

        return (_window = window).setTimeout.apply(_window, [function () {
          _this.callback.apply(_this, _toConsumableArray(_arguments));

          _classPrivateFieldGet(_this, _stopTick).call(_this);

          _this.timeElapsed = _classPrivateFieldGet(_this, _delay); // Set timeElapsed to delay in case the user has switched tabs (which pauses requestAnimationFrame)

          _this.executions = 1;
        }, _classPrivateFieldGet(this, _delay)].concat(_toConsumableArray(_classPrivateFieldGet(this, _parameters))));
      }
    });

    _setInterval.set(this, {
      writable: true,
      value: function value() {
        var _this2 = this;

        return window.setInterval(function () {
          _this2.callback.apply(_this2, _toConsumableArray(_classPrivateFieldGet(_this2, _parameters)));

          _classPrivateFieldGet(_this2, _stopTick).call(_this2);

          _this2.timeElapsed = 0;
          _this2.executions++;

          _classPrivateFieldGet(_this2, _startTick).call(_this2);
        }, _classPrivateFieldGet(this, _delay));
      }
    });

    _setTimeElapsed.set(this, {
      writable: true,
      value: function value() {
        var timeElapsed = Date.now() - _classPrivateFieldGet(this, _started);

        this.timeElapsed = _classPrivateFieldGet(this, _isInterval) ? timeElapsed - _classPrivateFieldGet(this, _delay) * this.executions : Math.min(timeElapsed, _classPrivateFieldGet(this, _delay));
      }
    });

    _setTimeRemaining.set(this, {
      writable: true,
      value: function value() {
        this.timeRemaining = _classPrivateFieldGet(this, _delay) - this.timeElapsed;
      }
    });

    _tick.set(this, {
      writable: true,
      value: function value() {
        _classPrivateFieldGet(this, _setTimeElapsed).call(this);

        _classPrivateFieldGet(this, _setTimeRemaining).call(this);

        if (this.timeElapsed < _classPrivateFieldGet(this, _delay)) {
          _classPrivateFieldGet(this, _stopTick).call(this);

          _classPrivateFieldGet(this, _startTick).call(this);
        }
      }
    });

    _startTick.set(this, {
      writable: true,
      value: function value() {
        _classPrivateFieldSet(this, _tickId, window.requestAnimationFrame(_classPrivateFieldGet(this, _tick).bind(this)));
      }
    });

    _stopTick.set(this, {
      writable: true,
      value: function value() {
        window.cancelAnimationFrame(_classPrivateFieldGet(this, _tickId));
      }
    });

    _setup.set(this, {
      writable: true,
      value: function value() {
        this.cancel();
        this.executions = 0;
        this.timeElapsed = 0;
        this.timeRemaining = _classPrivateFieldGet(this, _delay);

        _classPrivateFieldSet(this, _started, Date.now());

        _classPrivateFieldGet(this, _startTick).call(this);
      }
    });

    options = _objectSpread({
      delay: 0
    }, options);
    /* Options */

    _classPrivateFieldSet(this, _delay, options.delay);

    _classPrivateFieldSet(this, _parameters, is.array(options.parameters) ? options.parameters : []);
    /* Public properties */

    /**
     * A shallow copy of the callback passed to the Delayable constructor
     * @type {Function}
     */


    this.callback = callback;
    /**
     * The number of times the callback function has been executed
     * @type {Number}
     */

    this.executions = 0;
    /**
     * The time (in milliseconds) that has elapsed since the callback function was initially delayed OR last executed, whichever is smaller
     * @type {Number}
     */

    this.timeElapsed = 0;
    /**
     * The time (in milliseconds) that remains until the callback function will be executed
     * @type {Number}
     */

    this.timeRemaining = _classPrivateFieldGet(this, _delay);
  }
  /* Public methods */

  /**
   * Sets the Delayable instance's callback function
   * @param {Function} callback The new callback function
   */


  _createClass(Delayable, [{
    key: "setCallback",
    value: function setCallback(callback) {
      this.callback = callback;
    }
    /**
     * Cancels the delayed callback function. The function won't be executed, but <code>timeElapsed</code> and <code>timeRemaining</code> will <b>not</b> be reset to their initial values.
     */

  }, {
    key: "cancel",
    value: function cancel() {
      window.clearTimeout(_classPrivateFieldGet(this, _id));
      window.clearInterval(_classPrivateFieldGet(this, _id));

      _classPrivateFieldGet(this, _stopTick).call(this);

      this.executions = 0;
    }
    /**
     * Executes the callback function after the period of time specified by <code>delay</code>
     */

  }, {
    key: "timeout",
    value: function timeout() {
      _classPrivateFieldSet(this, _isInterval, false);

      _classPrivateFieldGet(this, _setup).call(this);

      _classPrivateFieldSet(this, _id, _classPrivateFieldGet(this, _setTimeout).call(this));
    }
    /**
     * Repeatedly executes the callback function with a fixed time delay (specified by <code>delay</code>) between each execution
     */

  }, {
    key: "interval",
    value: function interval() {
      _classPrivateFieldSet(this, _isInterval, true);

      _classPrivateFieldGet(this, _setup).call(this);

      _classPrivateFieldSet(this, _id, _classPrivateFieldGet(this, _setInterval).call(this));
    }
    /* Private methods */

  }]);

  return Delayable;
}();

exports.default = Delayable;

var _delay = new WeakMap();

var _isInterval = new WeakMap();

var _parameters = new WeakMap();

var _id = new WeakMap();

var _tickId = new WeakMap();

var _started = new WeakMap();

var _setTimeout = new WeakMap();

var _setInterval = new WeakMap();

var _setTimeElapsed = new WeakMap();

var _setTimeRemaining = new WeakMap();

var _tick = new WeakMap();

var _startTick = new WeakMap();

var _stopTick = new WeakMap();

var _setup = new WeakMap();
},{}]},{},[1]);
