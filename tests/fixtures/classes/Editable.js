(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Editable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _is = _interopRequireDefault(require("../util/is"));

var _hasProperties = require("../util/hasProperties");

var _warn = _interopRequireDefault(require("../util/warn"));

var _typedEmit = _interopRequireDefault(require("../util/typedEmit"));

var _Renamable = _interopRequireDefault(require("../subclasses/Renamable"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Editable =
/*#__PURE__*/
function () {
  /* Private properties */
  function Editable(_state) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Editable);

    _intendedTypes.set(this, {
      writable: true,
      value: void 0
    });

    _editsFullArray.set(this, {
      writable: true,
      value: void 0
    });

    _hardCodedType.set(this, {
      writable: true,
      value: void 0
    });

    _onEdit.set(this, {
      writable: true,
      value: void 0
    });

    _onWrite.set(this, {
      writable: true,
      value: void 0
    });

    _onErase.set(this, {
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
        if (_classPrivateFieldGet(this, _hardCodedType) && _classPrivateFieldGet(this, _hardCodedType) !== 'array') {
          return _classPrivateFieldGet(this, _hardCodedType);
        } else {
          return _classPrivateFieldGet(this, _guessType).call(this, state);
        }
      }
    });

    _guessType.set(this, {
      writable: true,
      value: function value(state) {
        var type,
            i = 0;

        while (type === undefined && i < _classPrivateFieldGet(this, _intendedTypes).length) {
          if (_is.default[_classPrivateFieldGet(this, _intendedTypes)[i]](state)) {
            type = _classPrivateFieldGet(this, _intendedTypes)[i];
          }

          i++;
        }

        if (type === undefined) {
          type = 'unintended';
        }

        return type;
      }
    });

    _getEditableState.set(this, {
      writable: true,
      value: function value() {
        if (this.type !== 'array') {
          return this.state;
        } else {
          return _classPrivateFieldGet(this, _editsFullArray) ? this.state : '';
        }
      }
    });

    _edit.set(this, {
      writable: true,
      value: function value(newState, type) {
        (0, _typedEmit.default)(newState, type, this, _classPrivateFieldGet(this, _onEdit), [{
          type: 'write',
          emitter: _classPrivateFieldGet(this, _onWrite)
        }, {
          type: 'erase',
          emitter: _classPrivateFieldGet(this, _onErase)
        }]);
        return this;
      }
    });

    _writeArray.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _editsFullArray) ? this.editableState : this.state.concat([this.editableState]);
      }
    });

    _writeMap.set(this, {
      writable: true,
      value: function value(options) {
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['key'],
          subject: 'Editable\'s write method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['value', 'rename'],
          subject: 'Editable\'s write method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        var newState = this.state;
        var key = options.key;

        if ((0, _hasProperties.hasEveryProperty)(options, ['rename', 'value'])) {
          var renamable = new _Renamable.default(newState),
              renamed = renamable.renameKey(options.rename, key);
          renamed.set(key, options.value);
          newState = new Map(renamed);
        } else if ((0, _hasProperties.hasEveryProperty)(options, ['rename'])) {
          var _renamable = new _Renamable.default(newState),
              _renamed = _renamable.renameKey(options.rename, key);

          newState = new Map(_renamed);
        } else if ((0, _hasProperties.hasEveryProperty)(options, ['value'])) {
          newState.set(key, options.value);
        }

        return newState;
      }
    });

    _writeObject.set(this, {
      writable: true,
      value: function value(options) {
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['key'],
          subject: 'Editable\'s write method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['value', 'rename'],
          subject: 'Editable\'s write method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        var newState = this.state,
            key = options.key;

        if ((0, _hasProperties.hasEveryProperty)(options, ['rename', 'value'])) {
          newState[key] = options.value;
          delete newState[options.rename];
        } else if ((0, _hasProperties.hasEveryProperty)(options, ['rename'])) {
          newState[key] = newState[options.rename];
          delete newState[options.rename];
        } else if ((0, _hasProperties.hasEveryProperty)(options, ['value'])) {
          newState[key] = options.value;
        }

        return newState;
      }
    });

    _eraseArray.set(this, {
      writable: true,
      value: function value(options) {
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['item', 'last', 'all'],
          subject: 'Editable\'s erase method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        var newState = this.state;

        if (options.hasOwnProperty('item')) {
          if (_is.default.string(options.item)) {
            var item = options.item;

            options.item = function (currentItem) {
              return currentItem === item;
            };
          }

          newState = newState.filter(function (currentItem) {
            return !options.item(currentItem);
          }); // TODO: Offer a way to choose which match or matches get removed
        }

        if (options.hasOwnProperty('last') && options.last !== false) {
          newState = newState.slice(0, -1);
        }

        if (options.hasOwnProperty('all') && options.all !== false) {
          newState = [];
        }

        return newState;
      }
    });

    _eraseMap.set(this, {
      writable: true,
      value: function value(options) {
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['key', 'last', 'all'],
          subject: 'Editable\'s erase method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        var newState = this.state;

        if (options.hasOwnProperty('key') && _is.default.string(options.key)) {
          newState.delete(options.key);
        }

        if (options.hasOwnProperty('last') && options.last !== false) {
          var last = Array.from(newState.keys()).reverse()[0];
          newState.delete(last); // TODO: What's the UI/feature/use case for deleting last key/value?
        }

        if (options.hasOwnProperty('all') && options.all !== false) {
          newState.clear();
        }

        return newState;
      }
    });

    _eraseObject.set(this, {
      writable: true,
      value: function value(options) {
        (0, _warn.default)('hasRequiredOptions', {
          received: options,
          required: ['value', 'last', 'all'],
          subject: 'Editable\'s erase method',
          docs: 'https://baleada.netlify.com/docs/logic/classes/Editable'
        });
        var newState = this.state;

        if (options.hasOwnProperty('key') && _is.default.string(options.key)) {
          delete newState[options.key];
        }

        if (options.hasOwnProperty('last') && options.last !== false) {
          delete newState[Object.keys(newState).reverse()[0]]; // TODO: What's the UI/feature/use case for deleting last key/value?
        }

        if (options.hasOwnProperty('all') && options.all !== false) {
          newState = {};
        }

        return newState;
      }
    });

    _classPrivateFieldSet(this, _intendedTypes, ['array', 'boolean', 'date', 'file', 'filelist', 'map', 'number', 'object', 'string']);
    /* Options */


    _options = _objectSpread({
      editsFullArray: true,
      onEdit: function onEdit(newState, instance) {
        return instance.setState(newState);
      }
    }, _options);

    _classPrivateFieldSet(this, _hardCodedType, _options.type);

    _classPrivateFieldSet(this, _editsFullArray, _options.editsFullArray);

    _classPrivateFieldSet(this, _onEdit, _options.onEdit);

    _classPrivateFieldSet(this, _onWrite, _options.onWrite);

    _classPrivateFieldSet(this, _onErase, _options.onErase);

    _classPrivateFieldSet(this, _writeDictionary, {
      array: function array() {
        return _classPrivateFieldGet(_this, _writeArray).call(_this);
      },
      map: function map(options) {
        return _classPrivateFieldGet(_this, _writeMap).call(_this, options);
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
      map: function map(options) {
        return _classPrivateFieldGet(_this, _eraseMap).call(_this, options);
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


  _createClass(Editable, [{
    key: "setState",

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
      return this;
    }
  }, {
    key: "write",
    value: function write() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newState = _classPrivateFieldGet(this, _writeDictionary).hasOwnProperty(this.type) ? _classPrivateFieldGet(this, _writeDictionary)[this.type](options) : this.editableState;
      return _classPrivateFieldGet(this, _edit).call(this, newState, 'write');
    }
  }, {
    key: "erase",
    value: function erase() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var newState = _classPrivateFieldGet(this, _eraseDictionary).hasOwnProperty(this.type) ? _classPrivateFieldGet(this, _eraseDictionary)[this.type](options) : undefined;
      return _classPrivateFieldGet(this, _edit).call(this, newState, 'erase');
    }
    /* Private methods */

  }, {
    key: "type",
    get: function get() {
      return _classPrivateFieldGet(this, _getType).call(this, this.state);
    }
  }]);

  return Editable;
}();

var _intendedTypes = new WeakMap();

var _editsFullArray = new WeakMap();

var _hardCodedType = new WeakMap();

var _onEdit = new WeakMap();

var _onWrite = new WeakMap();

var _onErase = new WeakMap();

var _writeDictionary = new WeakMap();

var _eraseDictionary = new WeakMap();

var _getType = new WeakMap();

var _guessType = new WeakMap();

var _getEditableState = new WeakMap();

var _edit = new WeakMap();

var _writeArray = new WeakMap();

var _writeMap = new WeakMap();

var _writeObject = new WeakMap();

var _eraseArray = new WeakMap();

var _eraseMap = new WeakMap();

var _eraseObject = new WeakMap();

var _default = Editable;
exports.default = _default;
},{"../subclasses/Renamable":2,"../util/hasProperties":4,"../util/is":5,"../util/typedEmit":6,"../util/warn":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

/*
 * Renamable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */
var Renamable =
/*#__PURE__*/
function (_Map) {
  _inherits(Renamable, _Map);

  function Renamable() {
    _classCallCheck(this, Renamable);

    return _possibleConstructorReturn(this, _getPrototypeOf(Renamable).apply(this, arguments));
  }

  _createClass(Renamable, [{
    key: "renameKey",
    value: function renameKey(keyToRename, newName) {
      var keys = Array.from(this.keys()),
          keyToRenameIndex = keys.findIndex(function (key) {
        return key === keyToRename;
      }),
          newKeys = [].concat(_toConsumableArray(keys.slice(0, keyToRenameIndex)), [newName], _toConsumableArray(keys.slice(keyToRenameIndex + 1))),
          values = Array.from(this.values()),
          renamed = newKeys.reduce(function (renamed, key, index) {
        return renamed.set(key, values[index]);
      }, new Map());
      return new Renamable(renamed);
    }
  }]);

  return Renamable;
}(_wrapNativeSuper(Map));

exports.default = Renamable;
},{}],3:[function(require,module,exports){
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
},{"./is":5}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _emit = _interopRequireDefault(require("./emit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(mutatedState, type, instance, catchallEmitter, typedEmitters) {
  (0, _emit.default)(catchallEmitter, mutatedState, instance);

  var _typedEmitters$find = typedEmitters.find(function (_ref) {
    var currentType = _ref.type;
    return currentType === type;
  }),
      typedEmitter = _typedEmitters$find.emitter;

  (0, _emit.default)(typedEmitter, mutatedState, instance);
}
},{"./emit":3}],7:[function(require,module,exports){
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
},{"./hasProperties":4}]},{},[1])(1)
});
