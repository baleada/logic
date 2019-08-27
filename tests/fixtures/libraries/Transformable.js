(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Transformable = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

/*
 * Transformable.js
 * (c) 2019 Alex Vipond
 * Released under the MIT license
 */

/* Dependencies */

/* Utils */
var Transformable =
/*#__PURE__*/
function () {
  /* Private properties */
  function Transformable(elements) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Transformable);

    _preservesMethods.set(this, {
      writable: true,
      value: void 0
    });

    _onTransform.set(this, {
      writable: true,
      value: void 0
    });

    _transform.set(this, {
      writable: true,
      value: function value(_ref) {
        var name = _ref.name,
            args = _ref.args;
        if (is.function(_classPrivateFieldGet(this, _onTransform))) _classPrivateFieldGet(this, _onTransform).call(this, {
          name: name,
          args: args
        });
        return this;
      }
    });

    /* Options */
    options = _objectSpread({
      preservesMethods: true
    }, options);

    _classPrivateFieldSet(this, _onTransform, options.onTransform);
    /* Public properties */


    this.elements = elements;
    /* Dependency */
  }
  /* Public getters */

  /* Public methods */


  _createClass(Transformable, [{
    key: "setElements",
    value: function setElements(elements) {
      this.elements = elements;
      return this;
    }
  }, {
    key: "translateX",
    value: function translateX(x) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'translateX',
        args: [x]
      }) : this.translate3d({
        x: x,
        y: 0,
        z: 0
      });
    }
  }, {
    key: "translateY",
    value: function translateY(y) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'translateY',
        args: [y]
      }) : this.translate3d({
        x: 0,
        y: y,
        z: 0
      });
    }
  }, {
    key: "translate",
    value: function translate(_ref2) {
      var x = _ref2.x,
          y = _ref2.y;
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'translate',
        args: [x, y]
      }) : this.translate3d({
        x: x,
        y: y,
        z: 0
      });
    }
  }, {
    key: "translateZ",
    value: function translateZ(z) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'translateZ',
        args: [z]
      }) : this.translate3d({
        x: 0,
        y: 0,
        z: z
      });
    }
  }, {
    key: "translate3d",
    value: function translate3d(_ref3) {
      var x = _ref3.x,
          y = _ref3.y,
          z = _ref3.z;
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'translate3d',
        args: [x, y, z]
      });
    }
  }, {
    key: "scaleX",
    value: function scaleX(x) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'scaleX',
        args: [x]
      }) : this.scale3d({
        x: x,
        y: 0,
        z: 0
      });
    }
  }, {
    key: "scaleY",
    value: function scaleY(y) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'scaleY',
        args: [y]
      }) : this.scale3d({
        x: 0,
        y: y,
        z: 0
      });
    }
  }, {
    key: "scale",
    value: function scale(_ref4) {
      var x = _ref4.x,
          y = _ref4.y;
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'scale',
        args: [x, y]
      }) : this.scale3d({
        x: x,
        y: y,
        z: 0
      });
    }
  }, {
    key: "scaleZ",
    value: function scaleZ(z) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'scaleZ',
        args: [z]
      }) : this.scale3d({
        x: 0,
        y: 0,
        z: z
      });
    }
  }, {
    key: "scale3d",
    value: function scale3d(_ref5) {
      var x = _ref5.x,
          y = _ref5.y,
          z = _ref5.z;
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'scale3d',
        args: [x, y, z]
      });
    }
  }, {
    key: "rotateX",
    value: function rotateX(a) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'rotateX',
        args: [a]
      }) : this.rotate3d({
        x: 1,
        y: 0,
        z: 0,
        a: a
      });
    }
  }, {
    key: "rotateY",
    value: function rotateY(a) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'rotateY',
        args: [a]
      }) : this.rotate3d({
        x: 0,
        y: 1,
        z: 0,
        a: a
      });
    }
  }, {
    key: "rotate",
    value: function rotate(a) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'rotate',
        args: [a]
      }) : this.rotate3d({
        x: 0,
        y: 0,
        z: 1,
        a: a
      });
    }
  }, {
    key: "rotateZ",
    value: function rotateZ(z) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'rotateZ',
        args: [z]
      }) : this.rotate3d({
        x: 0,
        y: 0,
        z: 1,
        a: a
      });
    }
  }, {
    key: "rotate3d",
    value: function rotate3d(_ref6) {
      var x = _ref6.x,
          y = _ref6.y,
          z = _ref6.z,
          a = _ref6.a;
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'rotate3d',
        args: [x, y, z, a]
      });
    }
  }, {
    key: "skewX",
    value: function skewX(ax) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'skewX',
        args: [ax]
      }) : this.skew({
        ax: ax,
        ay: 0
      });
    }
  }, {
    key: "skewY",
    value: function skewY(ay) {
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'skewY',
        args: [ay]
      }) : this.skew({
        ax: 0,
        ay: ay
      });
    }
  }, {
    key: "skew",
    value: function skew(_ref7) {
      var ax = _ref7.ax,
          ay = _ref7.ay;
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'skew',
        args: [ax, ay]
      });
    }
  }, {
    key: "matrix",
    value: function matrix(_ref8) {
      var a = _ref8.a,
          b = _ref8.b,
          c = _ref8.c,
          d = _ref8.d,
          tx = _ref8.tx,
          ty = _ref8.ty;
      return _classPrivateFieldGet(this, _preservesMethods) ? _classPrivateFieldGet(this, _transform).call(this, {
        name: 'matrix',
        args: [a, b, c, d, tx, ty]
      }) : this.matrix3d({
        a: a,
        b: b,
        c1: 0,
        d1: 0,
        c: c,
        d: d,
        c2: 0,
        d2: 0,
        a3: 0,
        b3: 0,
        c3: 1,
        d3: 0,
        tx: tx,
        ty: ty,
        c4: 0,
        d4: 1
      });
    }
  }, {
    key: "matrix3d",
    value: function matrix3d(_ref9) {
      var a1 = _ref9.a1,
          b1 = _ref9.b1,
          c1 = _ref9.c1,
          d1 = _ref9.d1,
          a2 = _ref9.a2,
          b2 = _ref9.b2,
          c2 = _ref9.c2,
          d2 = _ref9.d2,
          a3 = _ref9.a3,
          b3 = _ref9.b3,
          c3 = _ref9.c3,
          d3 = _ref9.d3,
          a4 = _ref9.a4,
          b4 = _ref9.b4,
          c4 = _ref9.c4,
          d4 = _ref9.d4;
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'matrix3d',
        args: [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4]
      });
    }
  }, {
    key: "perspective",
    value: function perspective(d) {
      return _classPrivateFieldGet(this, _transform).call(this, {
        name: 'perspective',
        args: [d]
      });
    }
    /* Private methods */

  }]);

  return Transformable;
}();

exports.default = Transformable;

var _preservesMethods = new WeakMap();

var _onTransform = new WeakMap();

var _transform = new WeakMap();
},{}]},{},[1])(1)
});
