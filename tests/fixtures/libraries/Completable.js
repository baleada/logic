(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Completable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _is = _interopRequireDefault(require("../utils/is"));

var _lastMatch = _interopRequireDefault(require("../utils/lastMatch"));

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
 * Completable is a library that enriches a string by:
 * - Allowing it to store
 * - Allowing it to extract a segment of the string
 * - Giving it the methods necessary to replace the segment or the full string with a more complete string
 *
 * Completable is written in vanilla JS with no dependencies. It powers <nuxt-link to="/docs/tools/composition-functions/useCompletable">`useCompletable`</nuxt-link>.
 */
var Completable =
/*#__PURE__*/
function () {
  /* Private properties */
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // #matchDirection

  /**
   * Completable constructor
   * @param {String}  string                          The string that will be made completable
   * @param {Boolean} [segmentsFromDivider=false]     `true` when the Completable instance should start from a divider (for example, the space between words) while extracting a segment, and `false when it should start from the very beginning of the string. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   * @param {Boolean} [segmentsToPosition=false]      `true` when the Completable instance should stop at the current position while extracting a segment, and `false` when it should stop at the very end of the string. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   * @param {RegExp}  [divider=/s/]                   <p>Tells the Completable instance how segments of the string are divided. Has no effect when <code>segmentsFromDivider</code> is <code>false</code>.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.</p>
   * @param {Boolean} [positionsAfterCompletion=true] <p><code>true</code> when the Completable instance, after completing the string, should set the current position to the index after the segment's replacement. `false` when it should not change the current position.</p><p>See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
   * @param {Function}  [onComplete]                    A function that Completable will call after completing the string. `onComplete` has one paramater: the completed string (String).
   * @param {Function}  [onPosition]                    A function that Completable will call after completing the string. `onPosition` accepts two parameters: the new position (Number), and the Completable instance (Object).
   */
  function Completable(string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Completable);

    _segmentsFromDivider.set(this, {
      writable: true,
      value: void 0
    });

    _segmentsToPosition.set(this, {
      writable: true,
      value: void 0
    });

    _divider.set(this, {
      writable: true,
      value: void 0
    });

    _positionsAfterCompletion.set(this, {
      writable: true,
      value: void 0
    });

    _onComplete.set(this, {
      writable: true,
      value: void 0
    });

    _onPosition.set(this, {
      writable: true,
      value: void 0
    });

    _computeSegmentStartIndex.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _segmentsFromDivider) ? (0, _lastMatch.default)(this.string, _classPrivateFieldGet(this, _divider), this.position) + 1 : 0;
      }
    });

    _computeSegmentEndIndex.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _segmentsToPosition) ? this.position : this.string.length;
      }
    });

    /* Options */
    options = _objectSpread({
      segmentsFromDivider: false,
      segmentsToPosition: false,
      divider: /\s/,
      positionsAfterCompletion: true
    }, options);

    _classPrivateFieldSet(this, _segmentsFromDivider, options.segmentsFromDivider);

    _classPrivateFieldSet(this, _segmentsToPosition, options.segmentsToPosition);

    _classPrivateFieldSet(this, _divider, options.divider); // this.#matchDirection = matchDirection


    _classPrivateFieldSet(this, _positionsAfterCompletion, options.positionsAfterCompletion);

    _classPrivateFieldSet(this, _onComplete, options.onComplete);

    _classPrivateFieldSet(this, _onPosition, options.onPosition);
    /* Public properties */

    /**
     * A shallow copy of the string passed to the Completable constructor
     * @type {String}
     */


    this.string = string;
    /**
     * The current index-based position in the `string`. See the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.
     * @type {Number}
     */

    this.position = string.length;
  }
  /* Public getters */

  /**
   * Segment getter function
   * @return {String} An extracted segment of `string`. See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section for more info.
   */


  _createClass(Completable, [{
    key: "setString",

    /* Public methods */

    /**
     * Sets the Completable instance's string
     * @param {String} string The new string
     * @return {Object}       The Completable instance
     */
    value: function setString(string) {
      this.string = string;
      return this;
    }
    /**
     * <p>Sets the position from which the Completable instance will start extracting segments.</p><p>See the <nuxt-link to="#How-the-Completable-instance-extracts-segments">How the Completable instance extracts segments</nuxt-link> section and the <nuxt-link to="#How-the-Completable-instance-handles-current-position">How the Completable instance handles current position</nuxt-link> section for more info.</p>
     * @param {Number} position The new `position`
     * @return {Object}       The Completable instance
     */

  }, {
    key: "setPosition",
    value: function setPosition(position) {
      this.position = position;
      return this;
    }
    /**
     * <p>Completes the string, replacing <code>segment</code> with a completion/replacement string, and computes a new position based on the <code>positionsAfterCompletion</code> option. Afterward, <code>complete</code> calls the user-provided <code>onComplete</code> function, passing the new string and the new position.</p><p>Note that <code>complete</code> does not set its <code>string</code> or <code>position</code> to the new values, but the user can do so using <code>set</code> and <code>setPosition</code>.</p>
     * @param {String} completion The completion/replacement.
     * @return {Object}       The Completable instance
     */

  }, {
    key: "complete",
    value: function complete(completion) {
      var textBefore = _classPrivateFieldGet(this, _segmentsFromDivider) ? this.string.slice(0, this.position - this.segment.length) : '',
          textAfter = _classPrivateFieldGet(this, _segmentsToPosition) ? this.string.slice(this.position) : '',
          string = textBefore + completion + textAfter,
          position = _classPrivateFieldGet(this, _positionsAfterCompletion) ? textBefore.length + completion.length : this.position;
      if (_is.default.function(_classPrivateFieldGet(this, _onComplete))) _classPrivateFieldGet(this, _onComplete).call(this, string, this);
      if (_is.default.function(_classPrivateFieldGet(this, _onPosition))) _classPrivateFieldGet(this, _onPosition).call(this, position, this);
      return this;
    }
    /* Private methods */

  }, {
    key: "segment",
    get: function get() {
      return this.string.slice(_classPrivateFieldGet(this, _computeSegmentStartIndex).call(this), _classPrivateFieldGet(this, _computeSegmentEndIndex).call(this));
    }
  }]);

  return Completable;
}();

var _segmentsFromDivider = new WeakMap();

var _segmentsToPosition = new WeakMap();

var _divider = new WeakMap();

var _positionsAfterCompletion = new WeakMap();

var _onComplete = new WeakMap();

var _onPosition = new WeakMap();

var _computeSegmentStartIndex = new WeakMap();

var _computeSegmentEndIndex = new WeakMap();

var _default = Completable;
exports.default = _default;
},{"../utils/is":2,"../utils/lastMatch":3}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function lastMatch(string, regexp, fromIndex) {
  if (fromIndex === undefined || fromIndex > string.length) fromIndex = string.length - 1;
  var indexOf;

  if (!regexp.test(string.slice(0, fromIndex)) || fromIndex === 0) {
    indexOf = -1;
  } else {
    var i = fromIndex - 1;

    while (i > -1 && indexOf === undefined) {
      indexOf = regexp.test(string[i]) ? i : undefined;
      i--;
    }

    if (indexOf === undefined) indexOf = -1;
  }

  return indexOf;
}

var _default = lastMatch;
exports.default = _default;
},{}]},{},[1])(1)
});
