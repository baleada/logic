(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Fetchable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
 * Fetchable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
var Fetchable =
/*#__PURE__*/
function () {
  /* Private properties */
  function Fetchable(resource) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Fetchable);

    _computedFetching.set(this, {
      writable: true,
      value: void 0
    });

    _computedResponse.set(this, {
      writable: true,
      value: void 0
    });

    _computedError.set(this, {
      writable: true,
      value: void 0
    });

    _fetchOptions.set(this, {
      writable: true,
      value: void 0
    });

    /* Options */

    /* Public properties */
    this.resource = resource;
    /* Private properties */

    _classPrivateFieldSet(this, _computedFetching, false);

    _classPrivateFieldSet(this, _computedResponse, {});

    _classPrivateFieldSet(this, _computedError, {});
    /* Dependency */


    _classPrivateFieldSet(this, _fetchOptions, options);
  }
  /* Public getters */


  _createClass(Fetchable, [{
    key: "setResource",

    /* Public methods */
    value: function setResource(resource) {
      this.resource = resource;
      return this;
    }
  }, {
    key: "fetch",
    value: function (_fetch) {
      function fetch() {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function () {
      var _this = this;

      _classPrivateFieldSet(this, _computedFetching, true);

      return fetch(this.resource, _classPrivateFieldGet(this, _fetchOptions)).then(function (response) {
        _classPrivateFieldSet(_this, _computedResponse, response);

        return _this;
      }).catch(function (error) {
        _classPrivateFieldSet(_this, _computedError, error);

        return _this;
      });
    })
    /* Private methods */

  }, {
    key: "fetching",
    get: function get() {
      return _classPrivateFieldGet(this, _computedFetching);
    }
  }, {
    key: "response",
    get: function get() {
      return _classPrivateFieldGet(this, _computedResponse);
    }
  }, {
    key: "responseJson",
    get: function get() {
      try {
        return this.response.json();
      } catch (_unused) {
        return {};
      }
    }
  }, {
    key: "error",
    get: function get() {
      return _classPrivateFieldGet(this, _computedError);
    }
  }, {
    key: "errorJson",
    get: function get() {
      try {
        return this.error.json();
      } catch (_unused2) {
        return {};
      }
    }
  }]);

  return Fetchable;
}();

exports.default = Fetchable;

var _computedFetching = new WeakMap();

var _computedResponse = new WeakMap();

var _computedError = new WeakMap();

var _fetchOptions = new WeakMap();
},{}]},{},[1])(1)
});
