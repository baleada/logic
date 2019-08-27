(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Syncable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

// TODO: subclass Syncable for each type that requires special treatment?
var Syncable =
/*#__PURE__*/
function () {
  /* Private properties */
  function Syncable(_state) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Syncable);

    _intendedTypes.set(this, {
      writable: true,
      value: void 0
    });

    _editsFullState.set(this, {
      writable: true,
      value: void 0
    });

    _hardCodedType.set(this, {
      writable: true,
      value: void 0
    });

    _editableKey.set(this, {
      writable: true,
      value: void 0
    });

    _onSync.set(this, {
      writable: true,
      value: void 0
    });

    _onCancel.set(this, {
      writable: true,
      value: void 0
    });

    _writeDictionary.set(this, {
      writable: true,
      value: void 0
    });

    _eraseDictionary.set(this, {
      writable: true,
      value: void 0
    });

    _getType.set(this, {
      writable: true,
      value: function value(state) {
        var type,
            i = 0;

        while (type === undefined && i < _classPrivateFieldGet(this, _intendedTypes).length) {
          if (_is.default[_classPrivateFieldGet(this, _intendedTypes)[i]](state)) type = _classPrivateFieldGet(this, _intendedTypes)[i];
          i++;
        }

        if (type === undefined) type = 'unintended';
        return type;
      }
    });

    _getEditableState.set(this, {
      writable: true,
      value: function value() {
        if (_classPrivateFieldGet(this, _editsFullState)) {
          return this.state;
        } else if (this.type === 'object') {
          switch (true) {
            case !this.state.hasOwnProperty(_classPrivateFieldGet(this, _editableKey)):
              // TODO: something less drastic than an error
              throw new Error('Cannot sync with object when editsFullState is false and object does not have the property indicated by the editableKey option.');
              break;

            default:
              return this.state[_classPrivateFieldGet(this, _editableKey)];
          }
        } else if (this.type === 'array') {
          return '';
        } else {
          // TODO: something less drastic than an error
          throw new Error('When editsFullState is false, the Syncable state must be an array or an object.');
        }
      }
    });

    _typePairingIsSupported.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _editsFullState) && this.type === this.editableStateType || !_classPrivateFieldGet(this, _editsFullState) && ['array', 'object'].includes(this.type);
      }
    });

    _sync.set(this, {
      writable: true,
      value: function value(newState) {
        if (_is.default.function(_classPrivateFieldGet(this, _onSync))) _classPrivateFieldGet(this, _onSync).call(this, newState);
        return this;
      }
    });

    _writeArray.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _editsFullState) ? this.editableState : this.state.concat([this.editableState]);
      }
    });

    _writeObject.set(this, {
      writable: true,
      value: function value(options) {
        var key = options.hasOwnProperty('key') ? options.key : _classPrivateFieldGet(this, _editableKey);
        return _classPrivateFieldGet(this, _editsFullState) ? this.editableState : _objectSpread({}, this.state, _defineProperty({}, key, this.editableState));
      }
    });

    _eraseArray.set(this, {
      writable: true,
      value: function value(options) {
        var newState = this.state; // clone state

        if (['value', 'last', 'all'].every(function (property) {
          return !options.hasOwnProperty(property);
        })) throw new Error('Cannot erase array (erase function options do not have value, last, or all keys)');
        if (options.hasOwnProperty('value')) newState = this.state.filter(function (item) {
          return item !== options.value;
        });
        if (options.hasOwnProperty('last') && options.last !== false) newState = this.state.slice(0, -1);
        if (options.hasOwnProperty('all') && options.all !== false) newState = [];
        return newState;
      }
    });

    _eraseObject.set(this, {
      writable: true,
      value: function value(options) {
        var newState = this.state; // clone state

        if (['key', 'value', 'last', 'all'].every(function (property) {
          return !options.hasOwnProperty(property);
        })) throw new Error('Cannot erase array (options are undefined in erase function)');

        if (options.hasOwnProperty('value')) {
          // TODO: What's the UI/feature/use case for deleting object values?
          var key = Object.keys(newState).find(function (key) {
            return newState[key] === options.value;
          });
          newState[key] = undefined; // TODO: what's the best null value to use here?
        }

        if (options.hasOwnProperty('key') && _is.default.string(options.key)) delete newState[options.key];
        if (options.hasOwnProperty('last') && options.last !== false) delete newState[Object.keys(newState).reverse()[0]]; // TODO: What's the UI/feature/use case for deleting last key/value?

        if (options.hasOwnProperty('all') && options.all !== false) newState = {};
        return newState;
      }
    });

    _classPrivateFieldSet(this, _intendedTypes, ['array', 'boolean', 'date', 'file', 'filelist', 'number', 'object', 'string']);
    /* Options */


    _options = _objectSpread({
      editsFullState: true
    }, _options);

    _classPrivateFieldSet(this, _hardCodedType, _options.type);

    _classPrivateFieldSet(this, _editsFullState, _options.editsFullState);

    _classPrivateFieldSet(this, _editableKey, _options.editableKey);

    _classPrivateFieldSet(this, _onSync, _options.onSync);

    _classPrivateFieldSet(this, _onCancel, _options.onCancel);

    _classPrivateFieldSet(this, _writeDictionary, {
      array: function array() {
        return _classPrivateFieldGet(_this, _writeArray).call(_this);
      },
      object: function object(options) {
        return _classPrivateFieldGet(_this, _writeObject).call(_this, options);
      }
    });

    _classPrivateFieldSet(this, _eraseDictionary, {
      array: function array(options) {
        return _classPrivateFieldGet(_this, _eraseArray).call(_this, options);
      },
      boolean: function boolean() {
        return false;
      },
      date: function date() {
        return new Date();
      },
      number: function number() {
        return 0;
      },
      object: function object(options) {
        return _classPrivateFieldGet(_this, _eraseObject).call(_this, options);
      },
      string: function string() {
        return '';
      }
      /* Public properties */

    });

    this.state = _state;
    this.editableState = _classPrivateFieldGet(this, _getEditableState).call(this);
  }
  /* Public getters */


  _createClass(Syncable, [{
    key: "setState",
    // TODO: It's important to check type pairing but it's overly complex here
    // get formattedEditableState() {
    //   let formattedEditableState
    //
    //   if (this.#typePairingIsSupported()) {
    //     formattedEditableState = this.editableState
    //   } else if (!is.function(parse[this.type])) {
    //     throw new Error(`state/editableState type pairing (${this.type} and ${this.editableStateType}) is not supported`)
    //   } else {
    //     formattedEditableState = parse[this.type](this.editableState)
    //   }
    //
    //   return formattedEditableState
    // }

    /* Public methods */
    value: function setState(state) {
      this.state = state;
      this.setEditableState(_classPrivateFieldGet(this, _getEditableState).call(this));
      return this;
    }
  }, {
    key: "setEditableState",
    value: function setEditableState(state) {
      this.editableState = state;
      return this;
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.editableState = _classPrivateFieldGet(this, _getEditableState).call(this);
      if (_is.default.function(_classPrivateFieldGet(this, _onCancel))) _classPrivateFieldGet(this, _onCancel).call(this);
      return this;
    }
  }, {
    key: "write",
    value: function write() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newState = _classPrivateFieldGet(this, _writeDictionary).hasOwnProperty(this.type) ? _classPrivateFieldGet(this, _writeDictionary)[this.type](options) : this.editableState;
      return _classPrivateFieldGet(this, _sync).call(this, newState);
    }
  }, {
    key: "erase",
    value: function erase() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newState = _classPrivateFieldGet(this, _eraseDictionary).hasOwnProperty(this.type) ? _classPrivateFieldGet(this, _eraseDictionary)[this.type](options) : null;
      return _classPrivateFieldGet(this, _sync).call(this, newState);
    }
    /* Private methods */

  }, {
    key: "type",
    get: function get() {
      return _classPrivateFieldGet(this, _hardCodedType) ? _classPrivateFieldGet(this, _hardCodedType).toLowerCase() : _classPrivateFieldGet(this, _getType).call(this, this.state);
    }
  }, {
    key: "editableStateType",
    get: function get() {
      return _classPrivateFieldGet(this, _getType).call(this, this.editableState);
    }
  }]);

  return Syncable;
}();

var _intendedTypes = new WeakMap();

var _editsFullState = new WeakMap();

var _hardCodedType = new WeakMap();

var _editableKey = new WeakMap();

var _onSync = new WeakMap();

var _onCancel = new WeakMap();

var _writeDictionary = new WeakMap();

var _eraseDictionary = new WeakMap();

var _getType = new WeakMap();

var _getEditableState = new WeakMap();

var _typePairingIsSupported = new WeakMap();

var _sync = new WeakMap();

var _writeArray = new WeakMap();

var _writeObject = new WeakMap();

var _eraseArray = new WeakMap();

var _eraseObject = new WeakMap();

var _default = Syncable;
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
},{}]},{},[1])(1)
});
