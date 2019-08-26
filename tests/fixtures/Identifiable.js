(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _IdentifiableGotrue = _interopRequireDefault(require("../wrappers/IdentifiableGotrue.js"));

var _is = _interopRequireDefault(require("../utils/is"));

var _capitalize = _interopRequireDefault(require("../utils/capitalize.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { keys.push.apply(keys, Object.getOwnPropertySymbols(object)); } if (enumerableOnly) keys = keys.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var Identifiable =
/*#__PURE__*/
function () {
  function Identifiable(options) {
    var _this = this;

    _classCallCheck(this, Identifiable);

    _on.set(this, {
      writable: true,
      value: void 0
    });

    _dependency.set(this, {
      writable: true,
      value: void 0
    });

    _getCurrentUser.set(this, {
      writable: true,
      value: function value() {
        return _classPrivateFieldGet(this, _dependency).getCurrentUser();
      }
    });

    options = _objectSpread({
      identifyConfig: {}
    }, options);

    _classPrivateFieldSet(this, _dependency, new _IdentifiableGotrue.default(options.identifyConfig));

    _classPrivateFieldSet(this, _on, {});

    this.responses = {};
    var promises = ['signup', 'login', 'loginExternalProvider', 'confirm', 'requestPasswordRecovery', 'recover', 'acceptInvite', 'acceptInviteExternalProvider', 'update', 'getJwt', 'logout'];
    promises.forEach(function (promise) {
      _this.responses[promise] = {};
      _classPrivateFieldGet(_this, _on)[promise] = {};
      _classPrivateFieldGet(_this, _on)[promise].success = options["on".concat((0, _capitalize.default)(promise), "Success")];
      _classPrivateFieldGet(_this, _on)[promise].error = options["on".concat((0, _capitalize.default)(promise), "Error")];
    });
    this.user = _classPrivateFieldGet(this, _getCurrentUser).call(this);
    this.loading = false;
  } // Utils


  _createClass(Identifiable, [{
    key: "signup",
    // Promise-based
    value: function signup(email, password, data) {
      var _this2 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).signup(email, password, data).then(function (response) {
        _this2.loading = false;
        _this2.responses.signup = response;
        _this2.user = _classPrivateFieldGet(_this2, _getCurrentUser).call(_this2);
        if (_is.default.function(_classPrivateFieldGet(_this2, _on).signup.success)) _classPrivateFieldGet(_this2, _on).signup.success(response);
      }).catch(function (error) {
        _this2.loading = false;
        _this2.responses.signup = error;
        if (_is.default.function(_classPrivateFieldGet(_this2, _on).signup.error)) _classPrivateFieldGet(_this2, _on).signup.error(error);
      });
    }
  }, {
    key: "login",
    value: function login(email, password, remember) {
      var _this3 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).login(email, password, remember).then(function (response) {
        _this3.loading = false;
        _this3.responses.login = response;
        _this3.user = _classPrivateFieldGet(_this3, _getCurrentUser).call(_this3);
        if (_is.default.function(_classPrivateFieldGet(_this3, _on).login.success)) _classPrivateFieldGet(_this3, _on).login.success(response);
      }).catch(function (error) {
        _this3.loading = false;
        _this3.responses.login = error;
        if (_is.default.function(_classPrivateFieldGet(_this3, _on).login.error)) _classPrivateFieldGet(_this3, _on).login.error(error);
      });
    }
  }, {
    key: "loginExternalProvider",
    value: function loginExternalProvider(provider) {
      var _this4 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).loginExternalProvider(provider).then(function (response) {
        _this4.loading = false;
        _this4.responses.loginExternalProvider = response;
        _this4.user = _classPrivateFieldGet(_this4, _getCurrentUser).call(_this4);
        if (_is.default.function(_classPrivateFieldGet(_this4, _on).loginExternalProvider.success)) _classPrivateFieldGet(_this4, _on).loginExternalProvider.success(response);
      }).catch(function (error) {
        _this4.loading = false;
        _this4.responses.loginExternalProvider = error;
        if (_is.default.function(_classPrivateFieldGet(_this4, _on).loginExternalProvider.error)) _classPrivateFieldGet(_this4, _on).loginExternalProvider.error(error);
      });
    }
  }, {
    key: "confirm",
    value: function confirm(token, remember) {
      var _this5 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).confirm(token, remember).then(function (response) {
        _this5.loading = false;
        _this5.responses.confirm = response;
        _this5.user = _classPrivateFieldGet(_this5, _getCurrentUser).call(_this5);
        if (_is.default.function(_classPrivateFieldGet(_this5, _on).confirm.success)) _classPrivateFieldGet(_this5, _on).confirm.success(response);
      }).catch(function (error) {
        _this5.loading = false;
        _this5.responses.confirm = error;
        if (_is.default.function(_classPrivateFieldGet(_this5, _on).confirm.error)) _classPrivateFieldGet(_this5, _on).confirm.error(error);
      });
    }
  }, {
    key: "requestPasswordRecovery",
    value: function requestPasswordRecovery(email) {
      var _this6 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).requestPasswordRecovery(email).then(function (response) {
        _this6.loading = false;
        _this6.responses.requestPasswordRecovery = response;
        if (_is.default.function(_classPrivateFieldGet(_this6, _on).requestPasswordRecovery.success)) _classPrivateFieldGet(_this6, _on).requestPasswordRecovery.success(response);
      }).catch(function (error) {
        _this6.loading = false;
        _this6.responses.requestPasswordRecovery = error;
        if (_is.default.function(_classPrivateFieldGet(_this6, _on).requestPasswordRecovery.error)) _classPrivateFieldGet(_this6, _on).requestPasswordRecovery.error(error);
      });
    }
  }, {
    key: "recover",
    value: function recover(token, remember) {
      var _this7 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).recover(token, remember).then(function (response) {
        _this7.loading = false;
        _this7.responses.recover = response;
        _this7.user = _classPrivateFieldGet(_this7, _getCurrentUser).call(_this7);
        if (_is.default.function(_classPrivateFieldGet(_this7, _on).recover.success)) _classPrivateFieldGet(_this7, _on).recover.success(response);
      }).catch(function (error) {
        _this7.loading = false;
        _this7.responses.recover = error;
        if (_is.default.function(_classPrivateFieldGet(_this7, _on).recover.error)) _classPrivateFieldGet(_this7, _on).recover.error(error);
      });
    }
  }, {
    key: "acceptInvite",
    value: function acceptInvite(token, password, remember) {
      var _this8 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).acceptInvite(token, password, remember).then(function (response) {
        _this8.loading = false;
        _this8.responses.acceptInvite = response;
        _this8.user = _classPrivateFieldGet(_this8, _getCurrentUser).call(_this8);
        if (_is.default.function(_classPrivateFieldGet(_this8, _on).acceptInvite.success)) _classPrivateFieldGet(_this8, _on).acceptInvite.success(response);
      }).catch(function (error) {
        _this8.loading = false;
        _this8.responses.acceptInvite = error;
        if (_is.default.function(_classPrivateFieldGet(_this8, _on).acceptInvite.error)) _classPrivateFieldGet(_this8, _on).acceptInvite.error(error);
      });
    }
  }, {
    key: "acceptInviteExternalProvider",
    value: function acceptInviteExternalProvider(provider, token) {
      var _this9 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).acceptInviteExternalProvider(provider, token).then(function (response) {
        _this9.loading = false;
        _this9.responses.acceptInviteExternalProvider = response;
        _this9.user = _classPrivateFieldGet(_this9, _getCurrentUser).call(_this9);
        if (_is.default.function(_classPrivateFieldGet(_this9, _on).acceptInviteExternalProvider.success)) _classPrivateFieldGet(_this9, _on).acceptInviteExternalProvider.success(response);
      }).catch(function (error) {
        _this9.loading = false;
        _this9.responses.acceptInviteExternalProvider = error;
        if (_is.default.function(_classPrivateFieldGet(_this9, _on).acceptInviteExternalProvider.error)) _classPrivateFieldGet(_this9, _on).acceptInviteExternalProvider.error(error);
      });
    } // User methods—does this belong in other component?

  }, {
    key: "update",
    value: function update(userMetadata) {
      var _this10 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).update(this.user, userMetadata).then(function (response) {
        _this10.loading = false;
        _this10.responses.update = response;
        _this10.user = _classPrivateFieldGet(_this10, _getCurrentUser).call(_this10);
        if (_is.default.function(_classPrivateFieldGet(_this10, _on).update.success)) _classPrivateFieldGet(_this10, _on).update.success(response);
      }).catch(function (error) {
        _this10.loading = false;
        _this10.responses.update = error;
        if (_is.default.function(_classPrivateFieldGet(_this10, _on).update.error)) _classPrivateFieldGet(_this10, _on).update.error(error);
      });
    }
  }, {
    key: "getJwt",
    value: function getJwt() {
      var _this11 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).getJwt(this.user).then(function (response) {
        _this11.loading = false;
        _this11.responses.getJwt = response;
        if (_is.default.function(_classPrivateFieldGet(_this11, _on).getJwt.success)) _classPrivateFieldGet(_this11, _on).getJwt.success(response);
      }).catch(function (error) {
        _this11.loading = false;
        _this11.responses.getJwt = error;
        if (_is.default.function(_classPrivateFieldGet(_this11, _on).getJwt.error)) _classPrivateFieldGet(_this11, _on).getJwt.error(error);
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      var _this12 = this;

      this.loading = true;

      _classPrivateFieldGet(this, _dependency).logout(this.user).then(function (response) {
        _this12.loading = false;
        _this12.responses.logout = response;
        _this12.user = _classPrivateFieldGet(_this12, _getCurrentUser).call(_this12);
        if (_is.default.function(_classPrivateFieldGet(_this12, _on).logout.success)) _classPrivateFieldGet(_this12, _on).logout.success(response);
      }).catch(function (error) {
        _this12.loading = false;
        _this12.responses.logout = error;
        if (_is.default.function(_classPrivateFieldGet(_this12, _on).logout.error)) _classPrivateFieldGet(_this12, _on).logout.error(error);
      });
    }
  }]);

  return Identifiable;
}();

var _on = new WeakMap();

var _dependency = new WeakMap();

var _getCurrentUser = new WeakMap();

var _default = Identifiable;
exports.default = _default;
},{"../utils/capitalize.js":2,"../utils/is":3,"../wrappers/IdentifiableGotrue.js":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = capitalize;

function capitalize(word) {
  return word.length > 0 ? "".concat(word[0].toUpperCase()).concat(word.slice(1)) : word;
}
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gotrueJs = _interopRequireDefault(require("gotrue-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to get private field on non-instance"); } if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = privateMap.get(receiver); if (!descriptor) { throw new TypeError("attempted to set private field on non-instance"); } if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } return value; }

var IdentifiableDependencyWrapper =
/*#__PURE__*/
function () {
  function IdentifiableDependencyWrapper(config) {
    _classCallCheck(this, IdentifiableDependencyWrapper);

    _dependency.set(this, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldSet(this, _dependency, new _gotrueJs.default(config));
  } // Utils


  _createClass(IdentifiableDependencyWrapper, [{
    key: "getCurrentUser",
    value: function getCurrentUser() {
      var _classPrivateFieldGet2;

      return (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _dependency)).currentUser.apply(_classPrivateFieldGet2, arguments);
    } // Promise-based

  }, {
    key: "signup",
    value: function signup() {
      var _classPrivateFieldGet3;

      return (_classPrivateFieldGet3 = _classPrivateFieldGet(this, _dependency)).signup.apply(_classPrivateFieldGet3, arguments);
    }
  }, {
    key: "login",
    value: function login() {
      var _classPrivateFieldGet4;

      return (_classPrivateFieldGet4 = _classPrivateFieldGet(this, _dependency)).login.apply(_classPrivateFieldGet4, arguments);
    }
  }, {
    key: "loginExternalProvider",
    value: function loginExternalProvider() {
      var _classPrivateFieldGet5;

      return (_classPrivateFieldGet5 = _classPrivateFieldGet(this, _dependency)).loginExternalUrl.apply(_classPrivateFieldGet5, arguments);
    }
  }, {
    key: "confirm",
    value: function confirm() {
      var _classPrivateFieldGet6;

      return (_classPrivateFieldGet6 = _classPrivateFieldGet(this, _dependency)).confirm.apply(_classPrivateFieldGet6, arguments);
    }
  }, {
    key: "requestPasswordRecovery",
    value: function requestPasswordRecovery() {
      var _classPrivateFieldGet7;

      return (_classPrivateFieldGet7 = _classPrivateFieldGet(this, _dependency)).requestPasswordRecovery.apply(_classPrivateFieldGet7, arguments);
    }
  }, {
    key: "recover",
    value: function recover() {
      var _classPrivateFieldGet8;

      return (_classPrivateFieldGet8 = _classPrivateFieldGet(this, _dependency)).recover.apply(_classPrivateFieldGet8, arguments);
    }
  }, {
    key: "acceptInvite",
    value: function acceptInvite() {
      var _classPrivateFieldGet9;

      return (_classPrivateFieldGet9 = _classPrivateFieldGet(this, _dependency)).acceptInvite.apply(_classPrivateFieldGet9, arguments);
    }
  }, {
    key: "acceptInviteExternalProvider",
    value: function acceptInviteExternalProvider() {
      var _classPrivateFieldGet10;

      return (_classPrivateFieldGet10 = _classPrivateFieldGet(this, _dependency)).acceptInviteExternalUrl.apply(_classPrivateFieldGet10, arguments);
    }
  }, {
    key: "update",
    value: function update(user, userMetadata) {
      return user.update({
        data: userMetadata
      });
    }
  }, {
    key: "getJwt",
    value: function getJwt(user) {
      return user.jwt.apply(user, _toConsumableArray(Array.from(arguments).slice(1)));
    }
  }, {
    key: "logout",
    value: function logout(user) {
      return user.logout.apply(user, _toConsumableArray(Array.from(arguments).slice(1)));
    }
  }, {
    key: "tokenDetails",
    value: function tokenDetails(user) {
      return user.tokenDetails.apply(user, _toConsumableArray(Array.from(arguments).slice(1)));
    }
  }, {
    key: "clearSession",
    value: function clearSession(user) {
      return user.clearSession.apply(user, _toConsumableArray(Array.from(arguments).slice(1)));
    }
  }]);

  return IdentifiableDependencyWrapper;
}();

var _dependency = new WeakMap();

var _default = IdentifiableDependencyWrapper;
exports.default = _default;
},{"gotrue-js":6}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Admin = function () {
  function Admin(user) {
    _classCallCheck(this, Admin);

    this.user = user;
  }

  // Return a list of all users in an audience


  _createClass(Admin, [{
    key: "listUsers",
    value: function listUsers(aud) {
      return this.user._request("/admin/users", {
        method: "GET",
        audience: aud
      });
    }
  }, {
    key: "getUser",
    value: function getUser(user) {
      return this.user._request("/admin/users/" + user.id);
    }
  }, {
    key: "updateUser",
    value: function updateUser(user) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return this.user._request("/admin/users/" + user.id, {
        method: "PUT",
        body: JSON.stringify(attributes)
      });
    }
  }, {
    key: "createUser",
    value: function createUser(email, password) {
      var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      attributes.email = email;
      attributes.password = password;
      return this.user._request("/admin/users", {
        method: "POST",
        body: JSON.stringify(attributes)
      });
    }
  }, {
    key: "deleteUser",
    value: function deleteUser(user) {
      return this.user._request("/admin/users/" + user.id, {
        method: "DELETE"
      });
    }
  }]);

  return Admin;
}();

exports.default = Admin;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _microApiClient = require("micro-api-client");

var _microApiClient2 = _interopRequireDefault(_microApiClient);

var _user = require("./user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HTTPRegexp = /^http:\/\//;
var defaultApiURL = "/.netlify/identity";

var GoTrue = function () {
  function GoTrue() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$APIUrl = _ref.APIUrl,
        APIUrl = _ref$APIUrl === undefined ? defaultApiURL : _ref$APIUrl,
        _ref$audience = _ref.audience,
        audience = _ref$audience === undefined ? "" : _ref$audience,
        _ref$setCookie = _ref.setCookie,
        setCookie = _ref$setCookie === undefined ? false : _ref$setCookie;

    _classCallCheck(this, GoTrue);

    if (APIUrl.match(HTTPRegexp)) {
      console.warn("Warning:\n\nDO NOT USE HTTP IN PRODUCTION FOR GOTRUE EVER!\nGoTrue REQUIRES HTTPS to work securely.");
    }

    if (audience) {
      this.audience = audience;
    }

    this.setCookie = setCookie;

    this.api = new _microApiClient2.default(APIUrl);
  }

  _createClass(GoTrue, [{
    key: "_request",
    value: function _request(path) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      options.headers = options.headers || {};
      var aud = options.audience || this.audience;
      if (aud) {
        options.headers["X-JWT-AUD"] = aud;
      }
      return this.api.request(path, options).catch(function (err) {
        if (err instanceof _microApiClient.JSONHTTPError && err.json) {
          if (err.json.msg) {
            err.message = err.json.msg;
          } else if (err.json.error) {
            err.message = err.json.error + ": " + err.json.error_description;
          }
        }
        return Promise.reject(err);
      });
    }
  }, {
    key: "settings",
    value: function settings() {
      return this._request("/settings");
    }
  }, {
    key: "signup",
    value: function signup(email, password, data) {
      return this._request("/signup", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password, data: data })
      });
    }
  }, {
    key: "login",
    value: function login(email, password, remember) {
      var _this = this;

      this._setRememberHeaders(remember);
      return this._request("/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=password&username=" + encodeURIComponent(email) + "&password=" + encodeURIComponent(password)
      }).then(function (response) {
        _user2.default.removeSavedSession();
        return _this.createUser(response, remember);
      });
    }
  }, {
    key: "loginExternalUrl",
    value: function loginExternalUrl(provider) {
      return this.api.apiURL + "/authorize?provider=" + provider;
    }
  }, {
    key: "confirm",
    value: function confirm(token, remember) {
      this._setRememberHeaders(remember);
      return this.verify("signup", token, remember);
    }
  }, {
    key: "requestPasswordRecovery",
    value: function requestPasswordRecovery(email) {
      return this._request("/recover", {
        method: "POST",
        body: JSON.stringify({ email: email })
      });
    }
  }, {
    key: "recover",
    value: function recover(token, remember) {
      this._setRememberHeaders(remember);
      return this.verify("recovery", token, remember);
    }
  }, {
    key: "acceptInvite",
    value: function acceptInvite(token, password, remember) {
      var _this2 = this;

      this._setRememberHeaders(remember);
      return this._request("/verify", {
        method: "POST",
        body: JSON.stringify({ token: token, password: password, type: "signup" })
      }).then(function (response) {
        return _this2.createUser(response, remember);
      });
    }
  }, {
    key: "acceptInviteExternalUrl",
    value: function acceptInviteExternalUrl(provider, token) {
      return this.api.apiURL + "/authorize?provider=" + provider + "&invite_token=" + token;
    }
  }, {
    key: "createUser",
    value: function createUser(tokenResponse) {
      var remember = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this._setRememberHeaders(remember);
      var user = new _user2.default(this.api, tokenResponse, this.audience);
      return user.getUserData().then(function (user) {
        if (remember) {
          user._saveSession();
        }
        return user;
      });
    }
  }, {
    key: "currentUser",
    value: function currentUser() {
      var user = _user2.default.recoverSession(this.api);
      user && this._setRememberHeaders(user._fromStorage);
      return user;
    }
  }, {
    key: "verify",
    value: function verify(type, token, remember) {
      var _this3 = this;

      this._setRememberHeaders(remember);
      return this._request("/verify", {
        method: "POST",
        body: JSON.stringify({ token: token, type: type })
      }).then(function (response) {
        return _this3.createUser(response, remember);
      });
    }
  }, {
    key: "_setRememberHeaders",
    value: function _setRememberHeaders(remember) {
      if (this.setCookie) {
        this.api.defaultHeaders = this.api.defaultHeaders || {};
        this.api.defaultHeaders["X-Use-Cookie"] = remember ? "1" : "session";
      }
    }
  }]);

  return GoTrue;
}();

exports.default = GoTrue;


if (typeof window !== "undefined") {
  window.GoTrue = GoTrue;
}
},{"./user":7,"micro-api-client":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _microApiClient = require("micro-api-client");

var _microApiClient2 = _interopRequireDefault(_microApiClient);

var _admin = require("./admin");

var _admin2 = _interopRequireDefault(_admin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExpiryMargin = 60 * 1000;
var storageKey = "gotrue.user";
var refreshPromises = {};
var currentUser = null;
var forbiddenUpdateAttributes = { api: 1, token: 1, audience: 1, url: 1 };
var forbiddenSaveAttributes = { api: 1 };
var isBrowser = function isBrowser() {
  return typeof window !== "undefined";
};

var User = function () {
  function User(api, tokenResponse, audience) {
    _classCallCheck(this, User);

    this.api = api;
    this.url = api.apiURL;
    this.audience = audience;
    this._processTokenResponse(tokenResponse);
    currentUser = this;
  }

  _createClass(User, [{
    key: "update",
    value: function update(attributes) {
      var _this = this;

      return this._request("/user", {
        method: "PUT",
        body: JSON.stringify(attributes)
      }).then(function (response) {
        return _this._saveUserData(response)._refreshSavedSession();
      });
    }
  }, {
    key: "jwt",
    value: function jwt(forceRefresh) {
      var _tokenDetails = this.tokenDetails(),
          expires_at = _tokenDetails.expires_at,
          refresh_token = _tokenDetails.refresh_token,
          access_token = _tokenDetails.access_token;

      if (forceRefresh || expires_at - ExpiryMargin < Date.now()) {
        return this._refreshToken(refresh_token);
      }
      return Promise.resolve(access_token);
    }
  }, {
    key: "logout",
    value: function logout() {
      return this._request("/logout", { method: "POST" }).then(this.clearSession.bind(this)).catch(this.clearSession.bind(this));
    }
  }, {
    key: "_refreshToken",
    value: function _refreshToken(refresh_token) {
      var _this2 = this;

      if (refreshPromises[refresh_token]) {
        return refreshPromises[refresh_token];
      }
      return refreshPromises[refresh_token] = this.api.request("/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=refresh_token&refresh_token=" + refresh_token
      }).then(function (response) {
        delete refreshPromises[refresh_token];
        _this2._processTokenResponse(response);
        _this2._refreshSavedSession();
        return _this2.token.access_token;
      }).catch(function (error) {
        delete refreshPromises[refresh_token];
        _this2.clearSession();
        return Promise.reject(error);
      });
    }
  }, {
    key: "_request",
    value: function _request(path) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      options.headers = options.headers || {};

      var aud = options.audience || this.audience;
      if (aud) {
        options.headers["X-JWT-AUD"] = aud;
      }

      return this.jwt().then(function (token) {
        return _this3.api.request(path, _extends({
          headers: Object.assign(options.headers, {
            Authorization: "Bearer " + token
          })
        }, options)).catch(function (err) {
          if (err instanceof _microApiClient.JSONHTTPError && err.json) {
            if (err.json.msg) {
              err.message = err.json.msg;
            } else if (err.json.error) {
              err.message = err.json.error + ": " + err.json.error_description;
            }
          }
          return Promise.reject(err);
        });
      });
    }
  }, {
    key: "getUserData",
    value: function getUserData() {
      return this._request("/user").then(this._saveUserData.bind(this)).then(this._refreshSavedSession.bind(this));
    }
  }, {
    key: "_saveUserData",
    value: function _saveUserData(attributes, fromStorage) {
      for (var key in attributes) {
        if (key in User.prototype || key in forbiddenUpdateAttributes) {
          continue;
        }
        this[key] = attributes[key];
      }
      if (fromStorage) {
        this._fromStorage = true;
      }
      return this;
    }
  }, {
    key: "_processTokenResponse",
    value: function _processTokenResponse(tokenResponse) {
      this.token = tokenResponse;
      var claims = void 0;
      try {
        claims = JSON.parse(urlBase64Decode(tokenResponse.access_token.split(".")[1]));
        this.token.expires_at = claims.exp * 1000;
      } catch (e) {
        console.error(new Error("Gotrue-js: Failed to parse tokenResponse claims: " + JSON.stringify(tokenResponse)));
      }
    }
  }, {
    key: "_refreshSavedSession",
    value: function _refreshSavedSession() {
      // only update saved session if we previously saved something
      if (isBrowser() && localStorage.getItem(storageKey)) {
        this._saveSession();
      }
      return this;
    }
  }, {
    key: "_saveSession",
    value: function _saveSession() {
      isBrowser() && localStorage.setItem(storageKey, JSON.stringify(this._details));
      return this;
    }
  }, {
    key: "tokenDetails",
    value: function tokenDetails() {
      return this.token;
    }
  }, {
    key: "clearSession",
    value: function clearSession() {
      User.removeSavedSession();
      this.token = null;
      currentUser = null;
    }
  }, {
    key: "admin",
    get: function get() {
      return new _admin2.default(this);
    }
  }, {
    key: "_details",
    get: function get() {
      var userCopy = {};
      for (var key in this) {
        if (key in User.prototype || key in forbiddenSaveAttributes) {
          continue;
        }
        userCopy[key] = this[key];
      }
      return userCopy;
    }
  }], [{
    key: "removeSavedSession",
    value: function removeSavedSession() {
      isBrowser() && localStorage.removeItem(storageKey);
    }
  }, {
    key: "recoverSession",
    value: function recoverSession(apiInstance) {
      if (currentUser) {
        return currentUser;
      }

      var json = isBrowser() && localStorage.getItem(storageKey);
      if (json) {
        try {
          var data = JSON.parse(json);
          var url = data.url,
              token = data.token,
              audience = data.audience;

          if (!url || !token) {
            return null;
          }

          var api = apiInstance || new _microApiClient2.default(url, {});
          return new User(api, token, audience)._saveUserData(data, true);
        } catch (ex) {
          console.error(new Error("Gotrue-js: Error recovering session: " + ex));
          return null;
        }
      }

      return null;
    }
  }]);

  return User;
}();

exports.default = User;


function urlBase64Decode(str) {
  // From https://jwt.io/js/jwt.js
  var output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  var result = window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
  try {
    return decodeURIComponent(escape(result));
  } catch (err) {
    return result;
  }
}
},{"./admin":5,"micro-api-client":8}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONHTTPError = exports.TextHTTPError = exports.HTTPError = exports.getPagination = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pagination = require("./pagination");

Object.defineProperty(exports, "getPagination", {
  enumerable: true,
  get: function get() {
    return _pagination.getPagination;
  }
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var HTTPError = exports.HTTPError = function (_extendableBuiltin2) {
  _inherits(HTTPError, _extendableBuiltin2);

  function HTTPError(response) {
    _classCallCheck(this, HTTPError);

    var _this = _possibleConstructorReturn(this, (HTTPError.__proto__ || Object.getPrototypeOf(HTTPError)).call(this, response.statusText));

    _this.name = _this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(response.statusText).stack;
    }
    _this.status = response.status;
    return _this;
  }

  return HTTPError;
}(_extendableBuiltin(Error));

var TextHTTPError = exports.TextHTTPError = function (_HTTPError) {
  _inherits(TextHTTPError, _HTTPError);

  function TextHTTPError(response, data) {
    _classCallCheck(this, TextHTTPError);

    var _this2 = _possibleConstructorReturn(this, (TextHTTPError.__proto__ || Object.getPrototypeOf(TextHTTPError)).call(this, response));

    _this2.data = data;
    return _this2;
  }

  return TextHTTPError;
}(HTTPError);

var JSONHTTPError = exports.JSONHTTPError = function (_HTTPError2) {
  _inherits(JSONHTTPError, _HTTPError2);

  function JSONHTTPError(response, json) {
    _classCallCheck(this, JSONHTTPError);

    var _this3 = _possibleConstructorReturn(this, (JSONHTTPError.__proto__ || Object.getPrototypeOf(JSONHTTPError)).call(this, response));

    _this3.json = json;
    return _this3;
  }

  return JSONHTTPError;
}(HTTPError);

var API = function () {
  function API() {
    var apiURL = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments[1];

    _classCallCheck(this, API);

    this.apiURL = apiURL;
    if (this.apiURL.match(/\/[^\/]?/)) {
      // eslint-disable-line no-useless-escape
      this._sameOrigin = true;
    }
    this.defaultHeaders = options && options.defaultHeaders || {};
  }

  _createClass(API, [{
    key: "headers",
    value: function headers() {
      var _headers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return _extends({}, this.defaultHeaders, {
        "Content-Type": "application/json"
      }, _headers);
    }
  }, {
    key: "parseJsonResponse",
    value: function parseJsonResponse(response) {
      return response.json().then(function (json) {
        if (!response.ok) {
          return Promise.reject(new JSONHTTPError(response, json));
        }

        var pagination = (0, _pagination.getPagination)(response);
        return pagination ? { pagination: pagination, items: json } : json;
      });
    }
  }, {
    key: "request",
    value: function request(path) {
      var _this4 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var headers = this.headers(options.headers || {});
      if (this._sameOrigin) {
        options.credentials = options.credentials || "same-origin";
      }
      return fetch(this.apiURL + path, _extends({}, options, { headers: headers })).then(function (response) {
        var contentType = response.headers.get("Content-Type");
        if (contentType && contentType.match(/json/)) {
          return _this4.parseJsonResponse(response);
        }

        if (!response.ok) {
          return response.text().then(function (data) {
            return Promise.reject(new TextHTTPError(response, data));
          });
        }
        return response.text().then(function (data) {
          data;
        });
      });
    }
  }]);

  return API;
}();

exports.default = API;
},{"./pagination":9}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.getPagination = getPagination;
function getPagination(response) {
  var links = response.headers.get("Link");
  var pagination = {};
  //var link, url, rel, m, page;
  if (links == null) {
    return null;
  }
  links = links.split(",");
  var total = response.headers.get("X-Total-Count");

  for (var i = 0, len = links.length; i < len; i++) {
    var link = links[i].replace(/(^\s*|\s*$)/, "");

    var _link$split = link.split(";"),
        _link$split2 = _slicedToArray(_link$split, 2),
        url = _link$split2[0],
        rel = _link$split2[1];

    var m = url.match(/page=(\d+)/);
    var page = m && parseInt(m[1], 10);
    if (rel.match(/last/)) {
      pagination.last = page;
    } else if (rel.match(/next/)) {
      pagination.next = page;
    } else if (rel.match(/prev/)) {
      pagination.prev = page;
    } else if (rel.match(/first/)) {
      pagination.first = page;
    }
  }

  pagination.last = Math.max(pagination.last || 0, pagination.prev && pagination.prev + 1 || 0);
  pagination.current = pagination.next ? pagination.next - 1 : pagination.last || 1;
  pagination.total = total ? parseInt(total, 10) : null;

  return pagination;
}
},{}]},{},[1]);
