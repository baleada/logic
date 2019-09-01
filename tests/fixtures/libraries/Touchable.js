(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Touchable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

/*
 * Touchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
var Touchable =
/*#__PURE__*/
function () {
  function Touchable(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Touchable);

    _dependencyOptions.set(this, {
      writable: true,
      value: void 0
    });

    _dependency.set(this, {
      writable: true,
      value: void 0
    });

    /* Options */

    /* Public properties */
    this.element = element;
    /* Private properties */

    /* Dependency */

    _classPrivateFieldSet(this, _dependencyOptions, options);

    _classPrivateFieldSet(this, _dependency, new Dependency(this.element, _classPrivateFieldGet(this, _dependencyOptions)));
  }
  /* Public getters */


  _createClass(Touchable, [{
    key: "setElement",

    /* Public methods */
    value: function setElement(element) {
      this.element = element;
      return this;
    }
  }, {
    key: "listen",
    value: function listen(touchType, listener) {
      _classPrivateFieldGet(this, _dependency).listen(touchType, listener);
    }
  }, {
    key: "touch",
    value: function touch(touchType, data) {
      _classPrivateFieldGet(this, _dependency).touch(touchType, data);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      _classPrivateFieldGet(this, _dependency).destroy();
    }
    /* Private methods */

  }, {
    key: "manager",
    get: function get() {
      return _classPrivateFieldGet(this, _dependency).manager;
    }
  }]);

  return Touchable;
}();

exports.default = Touchable;

var _dependencyOptions = new WeakMap();

var _dependency = new WeakMap();
},{}]},{},[1])(1)
});
