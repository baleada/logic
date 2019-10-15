(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Reorderable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _is = _interopRequireDefault(require("../util/is"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var Reorderable =
/*#__PURE__*/
function (_Array) {
  _inherits(Reorderable, _Array);

  function Reorderable() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Reorderable);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Reorderable)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _getSliceFromAndSliceItemCount.set(_assertThisInitialized(_this), {
      writable: true,
      value: function value(param) {
        var sliceFrom = _is.default.number(param) ? param : _is.default.object(param) ? param.hasOwnProperty('start') ? param.start : 0 : 0,
            sliceItemCount = _is.default.number(param) ? 1 : _is.default.object(param) ? param.hasOwnProperty('itemCount') ? param.itemCount : 1 : 0;
        return {
          sliceFrom: sliceFrom,
          sliceItemCount: sliceItemCount
        };
      }
    });

    _getSpliceFrom.set(_assertThisInitialized(_this), {
      writable: true,
      value: function value(param, sliceFrom) {
        return _is.default.number(param) ? param : sliceFrom;
      }
    });

    return _this;
  }

  _createClass(Reorderable, [{
    key: "reorder",
    value: function reorder(itemsToMoveParam, itemsDestinationParam) {
      var _classPrivateFieldGet2 = _classPrivateFieldGet(this, _getSliceFromAndSliceItemCount).call(this, itemsToMoveParam),
          sliceFrom = _classPrivateFieldGet2.sliceFrom,
          sliceItemCount = _classPrivateFieldGet2.sliceItemCount,
          spliceFrom = _classPrivateFieldGet(this, _getSpliceFrom).call(this, itemsDestinationParam, sliceFrom),
          itemsToMove = this.slice(sliceFrom, sliceFrom + sliceItemCount),
          before = this.slice(0, sliceFrom),
          middle = this.slice(sliceFrom + sliceItemCount, spliceFrom + 1),
          after = this.slice(spliceFrom + 1),
          withItemsMoved = [].concat(_toConsumableArray(before), _toConsumableArray(middle), _toConsumableArray(itemsToMove), _toConsumableArray(after));

      return _construct(Reorderable, withItemsMoved);
    } // Adapted from Adam Wathan's Advanced Vue Component Design course

    /* Private methods */

  }]);

  return Reorderable;
}(_wrapNativeSuper(Array));

exports.default = Reorderable;

var _getSliceFromAndSliceItemCount = new WeakMap();

var _getSpliceFrom = new WeakMap();
},{"../util/is":2}],2:[function(require,module,exports){
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
},{}]},{},[1])(1)
});
