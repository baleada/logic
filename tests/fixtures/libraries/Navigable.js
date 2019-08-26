(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _is = _interopRequireDefault(require("../utils/is"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

/**
 * Navigable is a library that enriches an array by:
 * - Allowing it to store a index of the item that has been navigated to
 * - Giving it the methods necessary to navigate to a different item
 *
 * Navigable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useNavigable">`useNavigable`</nuxt-link>.
 */
var Navigable =
/*#__PURE__*/
function () {
  /* Private properties */

  /**
   * Constructs a Navigable instance
   * @param {Array}  array          The array that will be made navigable
   * @param {Number}  [initialIndex=0] The default index
   * @param {Boolean} [loops=true]   `true` when the Navigable instance should loop around to the beginning of the array when it navigates past the last item and loop around to the end when it navigates before the first item. `false` when navigating past the last item or before the first item does not change the index.
   * @param {Number}  [increment=1]  The number of items that will be traversed when the navigable instance is stepping forward through the array
   * @param {Number}  [decrement=1]  The number of items that will be traversed when the navigable instance is stepping backward through the array
   * @param {Function}  onNavigate    A function that Navigable will call after navigating to a new item. `onNavigate` acceepts two parameters: the index (Number) of the item that has been navigated to, and the Navigable instance (Object).
   */
  function Navigable(array) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Navigable);

    _loops.set(this, {
      writable: true,
      value: void 0
    });

    _initialIndex.set(this, {
      writable: true,
      value: void 0
    });

    _increment.set(this, {
      writable: true,
      value: void 0
    });

    _decrement.set(this, {
      writable: true,
      value: void 0
    });

    _onNavigate.set(this, {
      writable: true,
      value: void 0
    });

    _navigate.set(this, {
      writable: true,
      value: function value(index) {
        if (_is.default.function(_classPrivateFieldGet(this, _onNavigate))) _classPrivateFieldGet(this, _onNavigate).call(this, index, this);
        return this;
      }
    });

    /* Options */
    options = _objectSpread({
      initialIndex: 0,
      loops: true,
      increment: 1,
      decrement: 1,
      onNavigate: undefined
    }, options);

    _classPrivateFieldSet(this, _initialIndex, options.initialIndex);

    _classPrivateFieldSet(this, _loops, options.loops);

    _classPrivateFieldSet(this, _increment, options.increment);

    _classPrivateFieldSet(this, _decrement, options.decrement);

    _classPrivateFieldSet(this, _onNavigate, options.onNavigate);
    /* Public properties */

    /**
     * A shallow copy of the array passed to the Navigable constructor
     * @type {Array}
     */


    this.array = array;
    /**
     *  The index of the item that has been navigated to
     * @type {Number}
     */

    this.index = _classPrivateFieldGet(this, _initialIndex);
  }
  /* Public methods */

  /**
   * Sets the Navigable instance's array
   * @param {Array} array The new array
   * @return {Object}       The new Navigable instance
   */


  _createClass(Navigable, [{
    key: "setArray",
    value: function setArray(array) {
      this.array = array;
      return this;
    }
    /**
     * Sets a value for `index`
     * @param {Number} index The new index
     * @return {Object}       The Navigable instance
     */

  }, {
    key: "setIndex",
    value: function setIndex(index) {
      this.index = index;
      return this;
    }
    /**
     * Navigates to a specific item
     * @param  {Number} index The index of the item that should be navigated to
     * @return {Object}       The Navigable instance
     */

  }, {
    key: "goTo",
    value: function goTo(index) {
      switch (true) {
        case index > this.array.length:
          index = this.array.length; // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set index: ${index} is greater than ${this.array.length} (the array's length). Index has been set to the array's length instead.`)

          break;

        case index < 0:
          index = 0; // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set index: ${index} is less than 0. Index has been set to 0 instead.` )

          break;

        default:
          index = index;
      }

      return _classPrivateFieldGet(this, _navigate).call(this, index);
    }
    /**
     * Steps forward through the array, increasing `index` by `increment`
     * @return {Object}       The Navigable instance
     */

  }, {
    key: "next",
    value: function next() {
      var index;
      var lastIndex = this.array.length - 1;

      if (this.index + _classPrivateFieldGet(this, _increment) > lastIndex) {
        switch (true) {
          case _classPrivateFieldGet(this, _loops):
            index = this.index + _classPrivateFieldGet(this, _increment);

            while (index > lastIndex) {
              index -= this.array.length;
            }

            break;

          default:
            index = lastIndex;
        }
      } else {
        index = this.index + _classPrivateFieldGet(this, _increment);
      }

      return this.goTo(index);
    }
    /**
     * Steps backward through the array, decreasing `index` by `decrement`
     * @return {Object}       The Navigable instance
     */

  }, {
    key: "prev",
    value: function prev() {
      var index;

      if (this.index - _classPrivateFieldGet(this, _decrement) < 0) {
        switch (true) {
          case _classPrivateFieldGet(this, _loops):
            index = this.index - _classPrivateFieldGet(this, _decrement);

            while (index < 0) {
              index += this.array.length;
            }

            break;

          default:
            index = 0;
        }
      } else {
        index = this.index - _classPrivateFieldGet(this, _decrement);
      }

      return this.goTo(index);
    }
    /* Private methods */

  }]);

  return Navigable;
}();

var _loops = new WeakMap();

var _initialIndex = new WeakMap();

var _increment = new WeakMap();

var _decrement = new WeakMap();

var _onNavigate = new WeakMap();

var _navigate = new WeakMap();

var _default = Navigable;
exports.default = _default;
},{"../utils/is":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* Modified from anime.js https://github.com/juliangarnier/anime */
var is = {
  undefined: function undefined(a) {
    return typeof a === 'undefined';
  },
  defined: function defined(a) {
    return typeof a !== 'undefined';
  },
  null: function _null(a) {
    return a === null;
  },
  string: function string(a) {
    return typeof a === 'string';
  },
  number: function number(a) {
    return typeof a === 'number';
  },
  boolean: function boolean(a) {
    return typeof a === 'boolean';
  },
  symbol: function symbol(a) {
    return _typeof(a) === 'symbol';
  },
  function: function _function(a) {
    return typeof a === 'function';
  },
  array: function array(a) {
    return Array.isArray(a);
  },
  object: function object(a) {
    return Object.prototype.toString.call(a).indexOf('Object') > -1;
  },
  date: function date(a) {
    return a instanceof Date;
  },
  error: function error(a) {
    return a instanceof Error;
  },
  file: function file(a) {
    return a instanceof File;
  },
  filelist: function filelist(a) {
    return a instanceof FileList;
  },
  path: function path(a) {
    return a instanceof SVGPathElement;
  },
  svg: function svg(a) {
    return a instanceof SVGElement;
  },
  input: function input(a) {
    return a instanceof HTMLInputElement;
  },
  element: function element(a) {
    return a instanceof HTMLElement;
  },
  node: function node(a) {
    return a instanceof Node;
  },
  nodeList: function nodeList(a) {
    return a instanceof NodeList;
  },
  hex: function hex(a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
  },
  rgb: function rgb(a) {
    return /^rgb[^a]/.test(a);
  },
  hsl: function hsl(a) {
    return /^hsl[^a]/.test(a);
  },
  rgba: function rgba(a) {
    return /^rgba/.test(a);
  },
  hsla: function hsla(a) {
    return /^hsla/.test(a);
  },
  color: function color(a) {
    return is.hex(a) || is.rgb(a) || is.hsl(a) || is.rgba(a) || is.hsla(a);
  }
};
var _default = is;
exports.default = _default;
},{}]},{},[1]);
