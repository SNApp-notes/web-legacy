webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = __webpack_require__(0);

var _angular2 = _interopRequireDefault(_angular);

var _main = __webpack_require__(12);

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _module = _angular2.default.module('components', []);
_module.component('main', _main2.default);

exports.default = _module;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = __webpack_require__(0);

var _angular2 = _interopRequireDefault(_angular);

var _rpc = __webpack_require__(14);

var _rpc2 = _interopRequireDefault(_rpc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _module = _angular2.default.module('services', []);

_module.provider('rpc', _rpc2.default);

exports.default = _module;

/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(17);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./app.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./app.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _angular = __webpack_require__(0);

var _angular2 = _interopRequireDefault(_angular);

__webpack_require__(3);

__webpack_require__(9);

var _ngNotificationsBar = __webpack_require__(7);

var _ngNotificationsBar2 = _interopRequireDefault(_ngNotificationsBar);

var _index = __webpack_require__(5);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(6);

var _index4 = _interopRequireDefault(_index3);

__webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _module = _angular2.default.module('app', [_ngNotificationsBar2.default.name, _index2.default.name, _index4.default.name]);

_module.config(['rpcProvider', 'notificationsConfigProvider', function (rpcProvider, notificationsConfigProvider) {
    rpcProvider.setup('rpc.scm');
    notificationsConfigProvider.setAcceptHTML(false);
    notificationsConfigProvider.setAutoHide(true);
}]);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mainTemplate = __webpack_require__(20);

var _mainTemplate2 = _interopRequireDefault(_mainTemplate);

var _main = __webpack_require__(13);

var _main2 = _interopRequireDefault(_main);

__webpack_require__(25);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    template: _mainTemplate2.default,
    controller: _main2.default,
    controllerAs: 'ctrl'
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (rpc, notifications) {
    rpc.then(function (service) {
        var name = 'notes_token';
        var token = localStorage.getItem('notes_token');
        var username = localStorage.getItem('notes_username');
        if (token && username) {
            service.valid_token(username, token).then(function (valid) {
                if (valid) {
                    console.log('valid token');
                } else {
                    console.log('invalid token');
                }
            }).catch(function (error) {
                notifications.showError({ message: error });
            });
        } else {
            service.login('kuba', 'vampire666').then(function (token) {
                if (token) {
                    localStorage.setItem('notes_token', token);
                    localStorage.setItem('notes_username', 'kuba');
                }
            }).catch(function (error) {
                notifications.showError({ message: error });
            });
        }
    });
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var id = 1;
    function request(method, params) {
        return JSON.stringify({ id: id++, method: method, params: params || [] });
    }
    var uri;
    this.setup = function (user_uri) {
        uri = user_uri;
    };
    this.$get = ['$http', '$q', function ($http, $q) {
        function rpc(method, params) {
            return $http({
                method: 'POST',
                url: uri,
                data: request(method, params)
            }).then(function (response) {
                return response.data;
            });
        }
        var defer = $q.defer();
        return rpc('system.describe').then(function (data) {
            var service = {};
            data.result.procs.forEach(function (spec) {
                service[spec.name] = function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    if (args.length == spec.params.length) {
                        return rpc(spec.name, args).then(function (data) {
                            if (data.error) {
                                throw data.error;
                            } else {
                                return data.result;
                            }
                        });
                    } else {
                        return $q.reject('Invalid arity expected ' + spec.params.length + ' got ' + args.length);
                    }
                };
            });
            return service;
        });
    }];
};

var _jquery = __webpack_require__(3);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

/***/ }),
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, "body {\n    maring: 0;\n    padding: 0;\n}\n", ""]);

// exports


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".main {\n    border-bottom: 1px solid gray;\n}\n", ""]);

// exports


/***/ }),
/* 19 */,
/* 20 */
/***/ (function(module, exports) {

module.exports = "<div class=\"main\">Hello app</div>\n";

/***/ }),
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(18);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./main.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./main.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ })
],[11]);