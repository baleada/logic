(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Intersectable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toNodeList = _interopRequireDefault(require("../utils/toNodeList"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Observable =
/*#__PURE__*/
function () {
  function Observable(elements) {
    var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Observable);

    _supportedObserverTypes.set(this, {
      writable: true,
      value: void 0
    });

    _onIntersect.set(this, {
      writable: true,
      value: void 0
    });

    _onMutate.set(this, {
      writable: true,
      value: void 0
    });

    _onResize.set(this, {
      writable: true,
      value: void 0
    });

    _intersectionObserverOptions.set(this, {
      writable: true,
      value: void 0
    });

    _computedIntersectionObserver.set(this, {
      writable: true,
      value: void 0
    });

    _computedMutationObserver.set(this, {
      writable: true,
      value: void 0
    });

    _computedResizeObserver.set(this, {
      writable: true,
      value: void 0
    });

    _getIntersectionObserverOptions.set(this, {
      writable: true,
      value: function value(_ref) {
        var onIntersect = _ref.onIntersect,
            onMutate = _ref.onMutate,
            onResize = _ref.onResize,
            rest = _objectWithoutProperties(_ref, ["onIntersect", "onMutate", "onResize"]);

        return rest;
      }
    });

    _getIntersectionObserver.set(this, {
      writable: true,
      value: function value(options) {
        return new IntersectionObserver(_classPrivateFieldGet(this, _onIntersect), options);
      }
    });

    _getMutationObserver.set(this, {
      writable: true,
      value: function value() {
        return new MutationObserver(_classPrivateFieldGet(this, _onMutate));
      }
    });

    _getResizeObserver.set(this, {
      writable: true,
      value: function value() {
        return new ResizeObserver(_classPrivateFieldGet(this, _onResize));
      }
    });

    /* Options */
    _classPrivateFieldSet(this, _onIntersect, _options.onIntersect);

    _classPrivateFieldSet(this, _onMutate, _options.onMutate);

    _classPrivateFieldSet(this, _onResize, _options.onResize);
    /* Public properties */


    this.elements = (0, _toNodeList.default)(elements);
    /* Private properties */

    _classPrivateFieldSet(this, _supportedObserverTypes, ['intersection', 'mutation', 'resize']);
    /* Dependency */


    _classPrivateFieldSet(this, _intersectionObserverOptions, _classPrivateFieldGet(this, _getIntersectionObserverOptions).call(this, _options));

    _classPrivateFieldSet(this, _computedIntersectionObserver, is.function(_classPrivateFieldGet(this, _onIntersect)) ? _classPrivateFieldGet(this, _getIntersectionObserver).call(this, _classPrivateFieldGet(this, _intersectionObserverOptions)) : undefined);

    _classPrivateFieldSet(this, _computedMutationObserver, is.function(_classPrivateFieldGet(this, _onMutate)) ? _classPrivateFieldGet(this, _getMutationObserver).call(this) : undefined);

    _classPrivateFieldSet(this, _computedResizeObserver, is.function(_classPrivateFieldGet(this, _onResize)) ? _classPrivateFieldGet(this, _getResizeObserver).call(this) : undefined);
  }
  /* Public getters */


  _createClass(Observable, [{
    key: "setElements",

    /* Public methods */
    value: function setElements(elements) {
      this.elements = (0, _toNodeList.default)(elements);
      return this;
    }
  }, {
    key: "observe",
    value: function observe() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.elements.forEach(function (element) {
        _classPrivateFieldGet(_this, _supportedObserverTypes).forEach(function (observerType) {
          _this["".concat(observerType, "Observer")].observe(element, options);
        });
      });
    }
    /* Private methods */

  }, {
    key: "intersectionObserver",
    get: function get() {
      return _classPrivateFieldGet(this, _computedIntersectionObserver);
    }
  }, {
    key: "mutationObserver",
    get: function get() {
      return _classPrivateFieldGet(this, _computedMutationObserver);
    }
  }, {
    key: "resizeObserver",
    get: function get() {
      return _classPrivateFieldGet(this, _computedResizeObserver);
    }
  }]);

  return Observable;
}();

exports.default = Observable;

var _supportedObserverTypes = new WeakMap();

var _onIntersect = new WeakMap();

var _onMutate = new WeakMap();

var _onResize = new WeakMap();

var _intersectionObserverOptions = new WeakMap();

var _computedIntersectionObserver = new WeakMap();

var _computedMutationObserver = new WeakMap();

var _computedResizeObserver = new WeakMap();

var _getIntersectionObserverOptions = new WeakMap();

var _getIntersectionObserver = new WeakMap();

var _getMutationObserver = new WeakMap();

var _getResizeObserver = new WeakMap();
},{"../utils/toNodeList":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toNodeList;

function toNodeList(arrayOfNodes) {
  return arrayOfNodes.reduce(function (fragment, node) {
    fragment.appendChild(node.cloneNode());
    return fragment;
  }, document.createDocumentFragment()).childNodes;
}
},{}]},{},[1])(1)
});
