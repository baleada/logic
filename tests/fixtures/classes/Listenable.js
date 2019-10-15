(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Listenable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _is = _interopRequireDefault(require("../util/is"));

var _touchEvents = _interopRequireDefault(require("../dictionaries/touchEvents"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var Listenable =
/*#__PURE__*/
function () {
  function Listenable(eventType) {
    var _this = this;

    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Listenable);

    _element.set(this, {
      writable: true,
      value: void 0
    });

    _recognizerOptions.set(this, {
      writable: true,
      value: void 0
    });

    _store.set(this, {
      writable: true,
      value: void 0
    });

    _activeListenerIds.set(this, {
      writable: true,
      value: void 0
    });

    _eventListenersGetter.set(this, {
      writable: true,
      value: void 0
    });

    _getEventListeners.set(this, {
      writable: true,
      value: function value(listener, optionsOrUseCapture, wantsUntrusted) {
        var options = [optionsOrUseCapture, wantsUntrusted];
        return _classPrivateFieldGet(this, _eventListenersGetter).call(this, listener, options);
      }
    });

    _getTouchEventListeners.set(this, {
      writable: true,
      value: function value(listener, options) {
        return _touchEvents.default[this.eventType](listener, _classPrivateFieldGet(this, _store), _classPrivateFieldGet(this, _recognizerOptions)).map(function (eventListener) {
          return [].concat(_toConsumableArray(eventListener), _toConsumableArray(options));
        });
      }
    });

    _getId.set(this, {
      writable: true,
      value: function value(listener, optionsOrUseCapture) {
        var id = {
          listener: listener
        };

        if (_is.default.object(optionsOrUseCapture) && optionsOrUseCapture.hasOwnProperty('capture')) {
          id.options = {
            capture: optionsOrUseCapture.capture
          };
        } else if (_is.default.boolean(optionsOrUseCapture)) {
          id.useCapture = optionsOrUseCapture;
        }

        return id;
      }
    });

    _getRemoveArgs.set(this, {
      writable: true,
      value: function value(activeListener) {
        var listener = activeListener.listener,
            options = activeListener.options,
            useCapture = activeListener.useCapture;
        return [listener, options, useCapture].filter(function (a) {
          return !!a;
        });
      }
    });

    /* Options */
    _options = _objectSpread({
      element: document,
      recognizer: {}
    }, _options);

    _classPrivateFieldSet(this, _element, _options.element);

    _classPrivateFieldSet(this, _recognizerOptions, _options.recognizer);
    /* Public properties */


    this.eventType = eventType;
    /* Private properties */

    _classPrivateFieldSet(this, _store, {});

    _classPrivateFieldSet(this, _activeListenerIds, []);

    _classPrivateFieldSet(this, _eventListenersGetter, _touchEvents.default.hasOwnProperty(this.eventType) ? _classPrivateFieldGet(this, _getTouchEventListeners) : function (listener, options) {
      return [[_this.eventType, listener].concat(_toConsumableArray(options))];
    });
    /* Dependency */

  }

  _createClass(Listenable, [{
    key: "setEventType",

    /* Public getters */

    /* Public methods */
    value: function setEventType(eventType) {
      this.destroy();
      this.eventType = eventType;
      return this;
    }
  }, {
    key: "listen",
    value: function listen(listener, optionsOrUseCapture, wantsUntrusted) {
      var _this2 = this;

      var eventListeners = _classPrivateFieldGet(this, _getEventListeners).call(this, listener, optionsOrUseCapture, wantsUntrusted);

      eventListeners.forEach(function (eventListener) {
        var _classPrivateFieldGet2;

        (_classPrivateFieldGet2 = _classPrivateFieldGet(_this2, _element)).addEventListener.apply(_classPrivateFieldGet2, _toConsumableArray(eventListener));

        _classPrivateFieldGet(_this2, _activeListenerIds).push(_classPrivateFieldGet(_this2, _getId).call(_this2, eventListener));
      });
      return this;
    }
  }, {
    key: "destroy",
    value: function destroy(activeListener) {
      var _this3 = this;

      if (activeListener) {
        var _classPrivateFieldGet3;

        (_classPrivateFieldGet3 = _classPrivateFieldGet(this, _element)).removeEventListener.apply(_classPrivateFieldGet3, _toConsumableArray(_classPrivateFieldGet(this, _getRemoveArgs).call(this, activeListener)));
      } else {
        this.activeListeners.forEach(function (activeListener) {
          var _classPrivateFieldGet4;

          (_classPrivateFieldGet4 = _classPrivateFieldGet(_this3, _element)).removeEventListener.apply(_classPrivateFieldGet4, _toConsumableArray(_classPrivateFieldGet(_this3, _getRemoveArgs).call(_this3, activeListener)));
        });
      }

      return this;
    }
    /* Private methods */

  }, {
    key: "activeListeners",
    get: function get() {
      return _classPrivateFieldGet(this, _activeListenerIds);
    }
  }, {
    key: "eventData",
    get: function get() {
      return _classPrivateFieldGet(this, _store);
    }
  }]);

  return Listenable;
}();

exports.default = Listenable;

var _element = new WeakMap();

var _recognizerOptions = new WeakMap();

var _store = new WeakMap();

var _activeListenerIds = new WeakMap();

var _eventListenersGetter = new WeakMap();

var _getEventListeners = new WeakMap();

var _getTouchEventListeners = new WeakMap();

var _getId = new WeakMap();

var _getRemoveArgs = new WeakMap();
},{"../dictionaries/touchEvents":2,"../util/is":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* Utils, dictionaries, and default options */
var directions = {
  up: {
    degrees: function degrees(_degrees) {
      return _degrees > 45 && _degrees < 135;
    },
    radians: function radians(_radians) {
      return _radians > 0.25 * Math.PI && _radians < 0.75 * Math.PI;
    }
  },
  left: {
    degrees: function degrees(_degrees2) {
      return _degrees2 > 135 && _degrees2 < 225;
    },
    radians: function radians(_radians2) {
      return _radians2 > 0.75 * Math.PI && _radians2 < 1.25 * Math.PI;
    }
  },
  down: {
    degrees: function degrees(_degrees3) {
      return _degrees3 > 225 && _degrees3 < 315;
    },
    radians: function radians(_radians3) {
      return _radians3 > 1.25 * Math.PI && _radians3 < 1.75 * Math.PI;
    }
  },
  right: {
    degrees: function degrees(_degrees4) {
      return _degrees4 > 315 && _degrees4 <= 360 || _degrees4 < 45 && _degrees4 >= 0;
    },
    radians: function radians(_radians4) {
      return _radians4 > 1.75 * Math.PI && _radians4 <= 2 * Math.PI || _radians4 < 0.25 * Math.PI && _radians4 >= 0;
    }
  }
};

function toDirection(angle) {
  var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'degrees';
  return Object.keys(directions).find(function (direction) {
    return directions[direction][unit](angle);
  });
}

var api = {
  toDirection: toDirection
};

function recognize(listener, recognizer, event, store) {
  if (recognizer(event, store)) {
    listener(event, api);
  }
}

function getPolarCoordinates(_ref) {
  var xA = _ref.xA,
      xB = _ref.xB,
      yA = _ref.yA,
      yB = _ref.yB;
  var distance = Math.hypot(xB - xA, yB - yA),
      angle = Math.atan2(yB - yA, xB - xA),
      radians = angle >= 0 ? angle : 2 * Math.PI + angle,
      degrees = radians * 180 / Math.PI;
  return {
    distance: distance,
    angle: {
      radians: radians,
      degrees: degrees
    }
  };
}

function getMouseEquivalents(touchListeners) {
  return touchListeners.map(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        eventType = _ref3[0],
        listener = _ref3[1];

    return [mouseEquivalents[eventType], listener];
  }).filter(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 1),
        eventType = _ref5[0];

    return !!eventType;
  });
}

var mouseEquivalents = {
  touchstart: 'mousedown',
  touchend: 'mouseup',
  touchmove: 'mousemove'
  /* Listeners */

};

function panListeners(listener, store, options) {
  options = _objectSpread({
    threshold: 1,
    includesMouseEquivalents: true
  }, options);

  var _options = options,
      threshold = _options.threshold,
      includesMouseEquivalents = _options.includesMouseEquivalents,
      recognizer = function recognizer(event, store) {
    var _store$start = store.start,
        xA = _store$start.x,
        yA = _store$start.y,
        xB = event.clientX,
        yB = event.clientY,
        _getPolarCoordinates = getPolarCoordinates({
      xA: xA,
      xB: xB,
      yA: yA,
      yB: yB
    }),
        distance = _getPolarCoordinates.distance,
        angle = _getPolarCoordinates.angle,
        end = {
      x: xB,
      y: yB
    };

    store = _objectSpread({}, store, {
      end: end,
      distance: distance,
      angle: angle
    });
    return distance > threshold;
  },
      storeTouchstartPoint = function storeTouchstartPoint(event) {
    store.start.x = event.clientX;
    store.start.y = event.clientY;
  },
      touchstart = function touchstart(event) {
    return storeTouchstartPoint(event);
  },
      touchmove = function touchmove(event) {
    return recognize(listener, recognizer, event, store);
  },
      touchcancel = function touchcancel(event) {
    return event;
  },
      touchListeners = [['touchstart', touchstart], ['touchmove', touchmove], ['touchcancel', touchcancel]];

  if (includesMouseEquivalents) {
    return [].concat(touchListeners, _toConsumableArray(getMouseEquivalents(touchListeners)));
  } else {
    return touchListeners;
  }
}

function panstartListeners(listener, store, options) {}

function panmoveListeners(listener, store, options) {}

function panendListeners(listener, store, options) {}

function pancancelListeners(listener, store, options) {}

function panleftListeners(listener, store, options) {}

function panrightListeners(listener, store, options) {}

function panupListeners(listener, store, options) {}

function pandownListeners(listener, store, options) {}

function pinchListeners(listener, store, options) {}

function pinchstartListeners(listener, store, options) {}

function pinchmoveListeners(listener, store, options) {}

function pinchendListeners(listener, store, options) {}

function pinchcancelListeners(listener, store, options) {}

function pinchinListeners(listener, store, options) {}

function pinchoutListeners(listener, store, options) {}

function pressListeners(listener, store, options) {}

function pressupListeners(listener, store, options) {}

function rotateListeners(listener, store, options) {}

function rotatestartListeners(listener, store, options) {}

function rotatemoveListeners(listener, store, options) {}

function rotateendListeners(listener, store, options) {}

function rotatecancelListeners(listener, store, options) {}

function swipeListeners(listener, store, options) {}

function swipeleftListeners(listener, store, options) {}

function swiperightListeners(listener, store, options) {}

function swipeupListeners(listener, store, options) {}

function swipedownListeners(listener, store, options) {}

function tapListeners(listener, store, options) {}

var _default = {
  panListeners: panListeners,
  panstartListeners: panstartListeners,
  panmoveListeners: panmoveListeners,
  panendListeners: panendListeners,
  pancancelListeners: pancancelListeners,
  panleftListeners: panleftListeners,
  panrightListeners: panrightListeners,
  panupListeners: panupListeners,
  pandownListeners: pandownListeners,
  pinchListeners: pinchListeners,
  pinchstartListeners: pinchstartListeners,
  pinchmoveListeners: pinchmoveListeners,
  pinchendListeners: pinchendListeners,
  pinchcancelListeners: pinchcancelListeners,
  pinchinListeners: pinchinListeners,
  pinchoutListeners: pinchoutListeners,
  pressListeners: pressListeners,
  pressupListeners: pressupListeners,
  rotateListeners: rotateListeners,
  rotatestartListeners: rotatestartListeners,
  rotatemoveListeners: rotatemoveListeners,
  rotateendListeners: rotateendListeners,
  rotatecancelListeners: rotatecancelListeners,
  swipeListeners: swipeListeners,
  swipeleftListeners: swipeleftListeners,
  swiperightListeners: swiperightListeners,
  swipeupListeners: swipeupListeners,
  swipedownListeners: swipedownListeners,
  tapListeners: tapListeners
};
exports.default = _default;
},{}],3:[function(require,module,exports){
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
