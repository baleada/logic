(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Copiable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _warn = _interopRequireDefault(require("../util/warn"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Copiable =
/*#__PURE__*/
function () {
  function Copiable(string) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Copiable);

    _usesFallbacks.set(this, {
      writable: true,
      value: void 0
    });

    _computedClipboard.set(this, {
      writable: true,
      value: void 0
    });

    _computedSucceeded.set(this, {
      writable: true,
      value: void 0
    });

    _computedErrored.set(this, {
      writable: true,
      value: void 0
    });

    _getCopied.set(this, {
      writable: true,
      value: function value() {
        if (_classPrivateFieldGet(this, _usesFallbacks)) {
          (0, _warn.default)('noFallbackAvailable', {
            subject: 'Copiable\'s copied property'
          });
        } else {
          return _classPrivateFieldGet(this, _readText).call(this).then(function (text) {
            return text;
          });
        }
      }
    });

    _readText.set(this, {
      writable: true,
      value: function value() {
        return this.clipboard.readText();
      }
    });

    _writeText.set(this, {
      writable: true,
      value: function value() {
        return this.clipboard.writeText(this.string);
      }
    });

    _writeTextFallback.set(this, {
      writable: true,
      value: function value() {
        var input = document.createElement('input');
        input.type = 'text';
        input.value = this.string;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
    });

    /* Options */
    options = _objectSpread({
      usesFallbacks: false
    }, options);

    _classPrivateFieldSet(this, _usesFallbacks, options.usesFallbacks);
    /* Public properties */


    this.string = string;
    /* Private properties */

    _classPrivateFieldSet(this, _computedClipboard, navigator.clipboard);

    _classPrivateFieldSet(this, _computedSucceeded, false);

    _classPrivateFieldSet(this, _computedErrored, false);
    /* Dependency */

  }
  /* Public getters */


  _createClass(Copiable, [{
    key: "setString",

    /* Public methods */
    value: function setString(string) {
      this.string = string;
      return this;
    }
  }, {
    key: "copy",
    value: function copy() {
      var _this = this;

      if (_classPrivateFieldGet(this, _usesFallbacks)) {
        _classPrivateFieldGet(this, _writeTextFallback).call(this);

        _classPrivateFieldSet(this, _computedErrored, false);

        _classPrivateFieldSet(this, _computedSucceeded, true);
      } else {
        _classPrivateFieldGet(this, _writeText).call(this).then(function () {
          _classPrivateFieldSet(_this, _computedErrored, false);

          _classPrivateFieldSet(_this, _computedSucceeded, true);
        }).catch(function () {
          _classPrivateFieldSet(_this, _computedErrored, true);

          _classPrivateFieldSet(_this, _computedSucceeded, false);
        });
      }

      return this;
    }
    /* Private methods */

  }, {
    key: "clipboard",
    get: function get() {
      return _classPrivateFieldGet(this, _computedClipboard);
    }
  }, {
    key: "copied",
    get: function get() {
      return _classPrivateFieldGet(this, _getCopied);
    }
  }, {
    key: "succeeded",
    get: function get() {
      return _classPrivateFieldGet(this, _computedSucceeded);
    }
  }, {
    key: "errored",
    get: function get() {
      return _classPrivateFieldGet(this, _computedErrored);
    }
  }]);

  return Copiable;
}();

exports.default = Copiable;

var _usesFallbacks = new WeakMap();

var _computedClipboard = new WeakMap();

var _computedSucceeded = new WeakMap();

var _computedErrored = new WeakMap();

var _getCopied = new WeakMap();

var _readText = new WeakMap();

var _writeText = new WeakMap();

var _writeTextFallback = new WeakMap();
},{"../util/warn":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasEveryProperty = hasEveryProperty;
exports.hasSomeProperties = hasSomeProperties;

function hasEveryProperty(object, properties) {
  return properties.every(function (property) {
    return object.hasOwnProperty(property);
  });
}

function hasSomeProperties(object, properties) {
  return properties.some(function (property) {
    return object.hasOwnProperty(property);
  });
}
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = warn;

var _hasProperties = require("./hasProperties");

var dictionary = {
  hasRequiredOptions: {
    shouldWarn: function shouldWarn(_ref) {
      var received = _ref.received,
          required = _ref.required,
          every = _ref.every;
      return every ? !(0, _hasProperties.hasEveryProperty)(received, required) : !(0, _hasProperties.hasSomeProperties)(received, required);
    },
    getWarning: function getWarning(_ref2) {
      var subject = _ref2.subject,
          required = _ref2.required,
          every = _ref2.every,
          docs = _ref2.docs;
      var main = required.length > 1 ? "".concat(subject, " received neither ").concat(required[0], " ").concat(required.slice(1).map(function (option) {
        return 'nor ' + option;
      }), " options.") : "".concat(subject, " did not receive ").concat(required[0], " option."),
          someOrEvery = required.length > 1 ? "".concat(every ? 'All' : 'Some', " of those options are required.") : "This option is required.",
          docsLink = "See the docs for more info: ".concat(docs);
      return "".concat(main, " ").concat(someOrEvery, " ").concat(docsLink);
    }
  },
  noFallbackAvailable: {
    shouldWarn: function shouldWarn() {
      return true;
    },
    getWarning: function getWarning(_ref3) {
      var subject = _ref3.subject;
      return "There is no fallback available for ".concat(subject, ".");
    }
  }
};

function warn(type, args) {
  if (dictionary[type].shouldWarn(args)) {
    console.warn(dictionary[type].getWarning(args));
  }
}
},{"./hasProperties":2}]},{},[1])(1)
});
