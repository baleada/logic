(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Completable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lastMatch = _interopRequireDefault(require("../util/lastMatch"));

var _emit = _interopRequireDefault(require("../util/emit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Completable =
/*#__PURE__*/
function () {
  /* Private properties */
  // TODO: is there a use case for nextMatch instead of lastMatch?
  // #matchDirection
  function Completable(string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Completable);

    _segmentsFromDivider.set(this, {
      writable: true,
      value: void 0
    });

    _segmentsToLocation.set(this, {
      writable: true,
      value: void 0
    });

    _divider.set(this, {
      writable: true,
      value: void 0
    });

    _locatesAfterCompletion.set(this, {
      writable: true,
      value: void 0
    });

    _onComplete.set(this, {
      writable: true,
      value: void 0
    });

    _onLocate.set(this, {
      writable: true,
      value: void 0
    });

    _computeSegmentStartIndex.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _segmentsFromDivider) ? (0, _lastMatch.default)(this.string, _classPrivateFieldGet(this, _divider), this.location) + 1 : 0;
      }
    });

    _computeSegmentEndIndex.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _segmentsToLocation) ? this.location : this.string.length;
      }
    });

    /* Options */
    options = _objectSpread({
      segmentsFromDivider: false,
      segmentsToLocation: false,
      divider: /\s/,
      locatesAfterCompletion: true,
      onComplete: function onComplete(completedString, instance) {
        return instance.setString(completedString);
      },
      onLocate: function onLocate(newLocation, instance) {
        return instance.setLocation(newLocation);
      }
    }, options);

    _classPrivateFieldSet(this, _segmentsFromDivider, options.segmentsFromDivider);

    _classPrivateFieldSet(this, _segmentsToLocation, options.segmentsToLocation);

    _classPrivateFieldSet(this, _divider, options.divider); // this.#matchDirection = matchDirection


    _classPrivateFieldSet(this, _locatesAfterCompletion, options.locatesAfterCompletion);

    _classPrivateFieldSet(this, _onComplete, options.onComplete);

    _classPrivateFieldSet(this, _onLocate, options.onLocate);

    this.string = string;
    this.location = string.length;
  }

  _createClass(Completable, [{
    key: "setString",
    value: function setString(string) {
      this.string = string;
      return this;
    }
  }, {
    key: "setLocation",
    value: function setLocation(location) {
      this.location = location;
      return this;
    }
  }, {
    key: "complete",
    value: function complete(completion) {
      var textBefore = this.string.slice(0, this.location - this.segment.length),
          // segmentsFromDivider
      textAfter = this.string.slice(_classPrivateFieldGet(this, _computeSegmentEndIndex).call(this)),
          // segmentsToLocation
      completedString = textBefore + completion + textAfter,
          newLocation = _classPrivateFieldGet(this, _locatesAfterCompletion) ? textBefore.length + completion.length : this.location;
      (0, _emit.default)(_classPrivateFieldGet(this, _onComplete), completedString, this);
      (0, _emit.default)(_classPrivateFieldGet(this, _onLocate), newLocation, this);
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

var _segmentsToLocation = new WeakMap();

var _divider = new WeakMap();

var _locatesAfterCompletion = new WeakMap();

var _onComplete = new WeakMap();

var _onLocate = new WeakMap();

var _computeSegmentStartIndex = new WeakMap();

var _computeSegmentEndIndex = new WeakMap();

var _default = Completable;
exports.default = _default;
},{"../util/emit":2,"../util/lastMatch":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _is = _interopRequireDefault(require("./is"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(emitter, mutatedState, instance) {
  if (_is.default.function(emitter)) {
    emitter(mutatedState, instance);
  }
}
},{"./is":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.orderedIs = exports.default = void 0;

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
    return _typeof(a) === 'object';
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
    return a.startsWith('rgba');
  },
  hsla: function hsla(a) {
    return a.startsWith('hsla');
  },
  color: function color(a) {
    return is.hex(a) || is.rgb(a) || is.hsl(a) || is.rgba(a) || is.hsla(a);
  }
};
var _default = is;
exports.default = _default;
var orderedIs = new Map([['undefined', is.undefined], ['defined', is.defined], ['null', is.null], ['string', is.string], ['number', is.number], ['boolean', is.boolean], ['symbol', is.symbol], ['function', is.function], ['array', is.array], ['object', is.object], ['date', is.date], ['error', is.error], ['file', is.file], ['filelist', is.filelist], ['path', is.path], ['svg', is.svg], ['input', is.input], ['element', is.element], ['node', is.node], ['nodeList', is.nodeList], ['hex', is.hex], ['rgb', is.rgb], ['hsl', is.hsl], ['rgba', is.rgba], ['hsla', is.hsla], ['color', is.color]]);
exports.orderedIs = orderedIs;
},{}],4:[function(require,module,exports){
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
