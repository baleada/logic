(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Navigable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typedEmit = _interopRequireDefault(require("../util/typedEmit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Navigable =
/*#__PURE__*/
function () {
  function Navigable(array) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Navigable);

    _loops.set(this, {
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

    _onGoTo.set(this, {
      writable: true,
      value: void 0
    });

    _onNext.set(this, {
      writable: true,
      value: void 0
    });

    _onPrev.set(this, {
      writable: true,
      value: void 0
    });

    _navigate.set(this, {
      writable: true,
      value: function value(newLocation, type) {
        (0, _typedEmit.default)(newLocation, type, this, _classPrivateFieldGet(this, _onNavigate), [{
          type: 'goTo',
          emitter: _classPrivateFieldGet(this, _onGoTo)
        }, {
          type: 'next',
          emitter: _classPrivateFieldGet(this, _onNext)
        }, {
          type: 'prev',
          emitter: _classPrivateFieldGet(this, _onPrev)
        }]);
        return this;
      }
    });

    /* Options */
    options = _objectSpread({
      initialLocation: 0,
      loops: true,
      increment: 1,
      decrement: 1,
      onNavigate: function onNavigate(newLocation, instance) {
        return instance.setLocation(newLocation);
      }
    }, options);

    _classPrivateFieldSet(this, _loops, options.loops);

    _classPrivateFieldSet(this, _increment, options.increment);

    _classPrivateFieldSet(this, _decrement, options.decrement);

    _classPrivateFieldSet(this, _onNavigate, options.onNavigate);

    _classPrivateFieldSet(this, _onGoTo, options.onGoTo);

    _classPrivateFieldSet(this, _onNext, options.onNext);

    _classPrivateFieldSet(this, _onPrev, options.onPrev);
    /* Public properties */


    this.array = array;
    this.location = options.initialLocation;
    /* Private properties */

    /* Dependency */
  }
  /* Public getters */


  _createClass(Navigable, [{
    key: "setArray",

    /* Public methods */
    value: function setArray(array) {
      this.array = array;
      return this;
    }
  }, {
    key: "setLocation",
    value: function setLocation(location) {
      this.location = location;
      return this;
    }
  }, {
    key: "goTo",
    value: function goTo(newLocation, navigateType) {
      switch (true) {
        case newLocation > this.array.length:
          newLocation = this.array.length; // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set new location: ${newLocation} is greater than ${this.array.length} (the array's length). Location has been set to the array's length instead.`)

          break;

        case newLocation < 0:
          newLocation = 0; // TODO: decide whether to show warnings or not
          // console.warn(`Cannot set newLocation: ${newLocation} is less than 0. Location has been set to 0 instead.` )

          break;
      }

      navigateType = navigateType || 'goTo';
      return _classPrivateFieldGet(this, _navigate).call(this, newLocation, navigateType);
    }
  }, {
    key: "next",
    value: function next() {
      var newLocation;
      var lastLocation = this.array.length - 1;

      if (this.location + _classPrivateFieldGet(this, _increment) > lastLocation) {
        switch (true) {
          case _classPrivateFieldGet(this, _loops):
            newLocation = this.location + _classPrivateFieldGet(this, _increment);

            while (newLocation > lastLocation) {
              newLocation -= this.array.length;
            }

            break;

          default:
            newLocation = lastLocation;
        }
      } else {
        newLocation = this.location + _classPrivateFieldGet(this, _increment);
      }

      return this.goTo(newLocation, 'next');
    }
  }, {
    key: "prev",
    value: function prev() {
      var newLocation;

      if (this.location - _classPrivateFieldGet(this, _decrement) < 0) {
        switch (true) {
          case _classPrivateFieldGet(this, _loops):
            newLocation = this.location - _classPrivateFieldGet(this, _decrement);

            while (newLocation < 0) {
              newLocation += this.array.length;
            }

            break;

          default:
            newLocation = 0;
        }
      } else {
        newLocation = this.location - _classPrivateFieldGet(this, _decrement);
      }

      return this.goTo(newLocation, 'prev');
    }
    /* Private methods */

  }, {
    key: "item",
    get: function get() {
      return this.array[this.location];
    }
  }]);

  return Navigable;
}();

var _loops = new WeakMap();

var _increment = new WeakMap();

var _decrement = new WeakMap();

var _onNavigate = new WeakMap();

var _onGoTo = new WeakMap();

var _onNext = new WeakMap();

var _onPrev = new WeakMap();

var _navigate = new WeakMap();

var _default = Navigable;
exports.default = _default;
},{"../util/typedEmit":4}],2:[function(require,module,exports){
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
exports.default = _default;

var _emit = _interopRequireDefault(require("./emit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(mutatedState, type, instance, catchallEmitter, typedEmitters) {
  (0, _emit.default)(catchallEmitter, mutatedState, instance);

  var _ref = typedEmitters.find(function (_ref2) {
    var currentType = _ref2.type;
    return currentType === type;
  }) || {
    emitter: undefined
  },
      typedEmitter = _ref.emitter;

  (0, _emit.default)(typedEmitter, mutatedState, instance);
}
},{"./emit":2}]},{},[1])(1)
});
