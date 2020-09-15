(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vue"));
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["v-calendar"] = factory(require("vue"));
	else
		root["v-calendar"] = factory(root["Vue"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__8bbf__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fb15");
/******/ })
/************************************************************************/
/******/ ({

/***/ "00fd":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "01f9":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__("2d00");
var $export = __webpack_require__("5ca1");
var redefine = __webpack_require__("2aba");
var hide = __webpack_require__("32e9");
var Iterators = __webpack_require__("84f2");
var $iterCreate = __webpack_require__("41a0");
var setToStringTag = __webpack_require__("7f20");
var getPrototypeOf = __webpack_require__("38fd");
var ITERATOR = __webpack_require__("2b4c")('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),

/***/ "02f4":
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__("4588");
var defined = __webpack_require__("be13");
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),

/***/ "0390":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var at = __webpack_require__("02f4")(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};


/***/ }),

/***/ "03dd":
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__("eac5"),
    nativeKeys = __webpack_require__("57a5");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),

/***/ "04d4":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Calendar_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c539");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Calendar_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Calendar_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Calendar_vue_vue_type_style_index_0_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "0621":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69"),
    isArguments = __webpack_require__("d370"),
    isArray = __webpack_require__("6747");

/** Built-in value references. */
var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

module.exports = isFlattenable;


/***/ }),

/***/ "0733":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return addTapOrClickHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addHorizontalSwipeHandler; });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("2fa3");
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("9404");

 // This function detects taps or clicks
// Can't just rely on 'click' event because of oddities in mobile Safari

const addTapOrClickHandler = function addTapOrClickHandler(element, handler) {
  if (!element || !element.addEventListener || !Object(___WEBPACK_IMPORTED_MODULE_1__[/* isFunction */ "j"])(handler)) {
    return null;
  } // State variables


  let tap = false;
  let disableClick = false;

  const touchstart = function touchstart() {
    return tap = true;
  };

  const touchmove = function touchmove() {
    return tap = false;
  };

  const touchend = function touchend(event) {
    if (tap) {
      // Reset state
      tap = false; // Disable click so we don't call handler twice

      disableClick = true;
      handler(event);
      return;
    } // Make sure tap event hasn't disabled click


    if (event.type === 'click' && !disableClick) {
      handler(event);
    } // Reset state


    disableClick = false;
  }; // Add event handlers


  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'touchstart', touchstart);
  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'touchmove', touchmove);
  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'click', touchend);
  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'touchend', touchend); // Return function that removes event handlers

  return function () {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'touchstart', touchstart);
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'touchmove', touchmove);
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'click', touchend);
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'touchend', touchend);
  };
};
const addHorizontalSwipeHandler = function addHorizontalSwipeHandler(element, handler, {
  maxSwipeTime,
  minHorizontalSwipeDistance,
  maxVerticalSwipeDistance
}) {
  if (!element || !element.addEventListener || !Object(___WEBPACK_IMPORTED_MODULE_1__[/* isFunction */ "j"])(handler)) {
    return null;
  } // State variables


  let startX = 0;
  let startY = 0;
  let startTime = null;
  let isSwiping = false; // Touch start handler

  function touchStart(e) {
    const t = e.changedTouches[0];
    startX = t.screenX;
    startY = t.screenY;
    startTime = new Date().getTime();
    isSwiping = true;
  } // Touch end handler


  function touchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;
    const t = e.changedTouches[0];
    const deltaX = t.screenX - startX;
    const deltaY = t.screenY - startY;
    const deltaTime = new Date().getTime() - startTime;

    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) >= minHorizontalSwipeDistance && Math.abs(deltaY) <= maxVerticalSwipeDistance) {
        const arg = {
          toLeft: false,
          toRight: false
        };

        if (deltaX < 0) {
          // Swipe to the left
          arg.toLeft = true;
        } else {
          // Swipe to the right
          arg.toRight = true;
        }

        handler(arg);
      }
    }
  } // Add event handlers


  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'touchstart', touchStart); // on(element, 'touchmove', touchmove);

  Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* on */ "n"])(element, 'touchend', touchEnd); // Return function that removes event handlers

  return function () {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'touchstart', touchStart); // off(element, 'touchmove', touchmove);

    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__[/* off */ "m"])(element, 'touchend', touchEnd);
  };
};

/***/ }),

/***/ "07c7":
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ "07e3":
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "087d":
/***/ (function(module, exports) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),

/***/ "08cc":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("1a8c");

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;


/***/ }),

/***/ "099a":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = strictIndexOf;


/***/ }),

/***/ "0b07":
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__("34ac"),
    getValue = __webpack_require__("3698");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "0bfb":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 21.2.5.3 get RegExp.prototype.flags
var anObject = __webpack_require__("cb7c");
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ "0d24":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__("2b3e"),
    stubFalse = __webpack_require__("07c7");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("62e4")(module)))

/***/ }),

/***/ "0d58":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__("ce10");
var enumBugKeys = __webpack_require__("e11e");

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),

/***/ "0f0f":
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__("8eeb"),
    keysIn = __webpack_require__("9934");

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),

/***/ "0f5c":
/***/ (function(module, exports, __webpack_require__) {

var baseSet = __webpack_require__("159a");

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `_.setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, ['x', '0', 'y', 'z'], 5);
 * console.log(object.x[0].y.z);
 * // => 5
 */
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}

module.exports = set;


/***/ }),

/***/ "100e":
/***/ (function(module, exports, __webpack_require__) {

var identity = __webpack_require__("cd9d"),
    overRest = __webpack_require__("2286"),
    setToString = __webpack_require__("c1c9");

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ "1041":
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__("8eeb"),
    getSymbolsIn = __webpack_require__("a029");

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),

/***/ "11e9":
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__("52a7");
var createDesc = __webpack_require__("4630");
var toIObject = __webpack_require__("6821");
var toPrimitive = __webpack_require__("6a99");
var has = __webpack_require__("69a8");
var IE8_DOM_DEFINE = __webpack_require__("c69a");
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__("9e1e") ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),

/***/ "126d":
/***/ (function(module, exports, __webpack_require__) {

var asciiToArray = __webpack_require__("6da8"),
    hasUnicode = __webpack_require__("aaec"),
    unicodeToArray = __webpack_require__("d094");

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

module.exports = stringToArray;


/***/ }),

/***/ "1290":
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),

/***/ "1310":
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "1315":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ setupScreens; });

// EXTERNAL MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");
var external_commonjs_vue_commonjs2_vue_root_Vue_default = /*#__PURE__*/__webpack_require__.n(external_commonjs_vue_commonjs2_vue_root_Vue_);

// EXTERNAL MODULE: ./src/utils/_.js
var _ = __webpack_require__("9404");

// CONCATENATED MODULE: ./src/utils/buildMediaQuery.js
 // This function gratuitously borrowed from TailwindCSS
// https://github.com/tailwindcss/tailwindcss/blob/master/src/util/buildMediaQuery.js

function buildMediaQuery(screens) {
  // Default min width
  if (Object(_["m" /* isString */])(screens)) {
    screens = {
      min: screens
    };
  } // Wrap in array


  if (!Object(_["h" /* isArray */])(screens)) {
    screens = [screens];
  }

  return screens.map(function (screen) {
    if (Object(_["e" /* has */])(screen, 'raw')) {
      return screen.raw;
    }

    return Object(_["p" /* map */])(screen, function (value, feature) {
      feature = Object(_["d" /* get */])({
        min: 'min-width',
        max: 'max-width'
      }, feature, feature);
      return `(${feature}: ${value})`;
    }).join(' and ');
  }).join(', ');
}
// EXTERNAL MODULE: ./src/utils/defaults/screens.json
var defaults_screens = __webpack_require__("85a9");

// CONCATENATED MODULE: ./src/utils/screens.js
// Vue won't get included in bundle as it is externalized
// https://cli.vuejs.org/guide/build-targets.html#library




let isSettingUp = false;
let shouldRefreshQueries = false;
let screensComp = null;
function setupScreens(screens = defaults_screens, forceSetup) {
  if (screensComp && !forceSetup || isSettingUp) {
    return;
  }

  isSettingUp = true;
  shouldRefreshQueries = true; // Use a private Vue component to store reactive screen matches

  screensComp = new external_commonjs_vue_commonjs2_vue_root_Vue_default.a({
    data() {
      return {
        matches: [],
        queries: []
      };
    },

    methods: {
      refreshQueries() {
        var _this = this;

        this.queries = Object(_["q" /* mapValues */])(screens, function (v) {
          const query = window.matchMedia(buildMediaQuery(v));
          query.addListener(_this.refreshMatches);
          return query;
        });
        this.refreshMatches();
      },

      refreshMatches() {
        this.matches = Object(_["u" /* toPairs */])(this.queries).filter(function (p) {
          return p[1].matches;
        }).map(function (p) {
          return p[0];
        });
      }

    }
  });
  isSettingUp = false;
} // Global mixin that provides responsive '$screens' utility method
// that refreshes any time the screen matches update

external_commonjs_vue_commonjs2_vue_root_Vue_default.a.mixin({
  beforeCreate() {
    if (!isSettingUp) {
      setupScreens();
    }
  },

  mounted() {
    if (shouldRefreshQueries && screensComp) {
      screensComp.refreshQueries();
      shouldRefreshQueries = false;
    }
  },

  computed: {
    $screens() {
      return function (config, def) {
        return screensComp.matches.reduce(function (prev, curr) {
          return Object(_["e" /* has */])(config, curr) ? config[curr] : prev;
        }, Object(_["n" /* isUndefined */])(def) ? config.default : def);
      };
    }

  }
});

/***/ }),

/***/ "1349":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("f064");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("61acf245", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "1368":
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__("da03");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "1495":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("86cc");
var anObject = __webpack_require__("cb7c");
var getKeys = __webpack_require__("0d58");

module.exports = __webpack_require__("9e1e") ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),

/***/ "159a":
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__("32b3"),
    castPath = __webpack_require__("e2e4"),
    isIndex = __webpack_require__("c098"),
    isObject = __webpack_require__("1a8c"),
    toKey = __webpack_require__("f4d6");

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject(object)) {
    return object;
  }
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

module.exports = baseSet;


/***/ }),

/***/ "15f3":
/***/ (function(module, exports, __webpack_require__) {

var basePickBy = __webpack_require__("89d9"),
    hasIn = __webpack_require__("8604");

/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return basePickBy(object, paths, function(value, path) {
    return hasIn(object, path);
  });
}

module.exports = basePick;


/***/ }),

/***/ "1838":
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqual = __webpack_require__("c05f"),
    get = __webpack_require__("9b02"),
    hasIn = __webpack_require__("8604"),
    isKey = __webpack_require__("f608"),
    isStrictComparable = __webpack_require__("08cc"),
    matchesStrictComparable = __webpack_require__("20ec"),
    toKey = __webpack_require__("f4d6");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;


/***/ }),

/***/ "18d8":
/***/ (function(module, exports, __webpack_require__) {

var memoizeCapped = __webpack_require__("234d");

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;


/***/ }),

/***/ "1a2d":
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__("42a2"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;


/***/ }),

/***/ "1a8c":
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "1bac":
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__("7d1f"),
    getSymbolsIn = __webpack_require__("a029"),
    keysIn = __webpack_require__("9934");

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),

/***/ "1bc3":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__("f772");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "1c3c":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69"),
    Uint8Array = __webpack_require__("2474"),
    eq = __webpack_require__("9638"),
    equalArrays = __webpack_require__("a2be"),
    mapToArray = __webpack_require__("edfa"),
    setToArray = __webpack_require__("ac41");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

module.exports = equalByTag;


/***/ }),

/***/ "1cec":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07"),
    root = __webpack_require__("2b3e");

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),

/***/ "1ec9":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("f772");
var document = __webpack_require__("e53d").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "1efc":
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),

/***/ "1fc8":
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__("4245");

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),

/***/ "20ec":
/***/ (function(module, exports) {

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

module.exports = matchesStrictComparable;


/***/ }),

/***/ "214f":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__("b0c5");
var redefine = __webpack_require__("2aba");
var hide = __webpack_require__("32e9");
var fails = __webpack_require__("79e5");
var defined = __webpack_require__("be13");
var wks = __webpack_require__("2b4c");
var regexpExec = __webpack_require__("520a");

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};


/***/ }),

/***/ "2285":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CustomTransition_vue_vue_type_style_index_0_id_5be4b00c_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("6f6a");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CustomTransition_vue_vue_type_style_index_0_id_5be4b00c_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CustomTransition_vue_vue_type_style_index_0_id_5be4b00c_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CustomTransition_vue_vue_type_style_index_0_id_5be4b00c_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "2286":
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__("85e3");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ "22f3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Attribute; });
/* harmony import */ var _dateInfo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("cfe5");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("2fa3");
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("9404");



class Attribute {
  constructor({
    key,
    hashcode,
    highlight,
    content,
    dot,
    bar,
    popover,
    dates,
    excludeDates,
    excludeMode,
    customData,
    order,
    pinPage
  }, theme, locale) {
    var _this = this;

    this.key = Object(___WEBPACK_IMPORTED_MODULE_2__[/* isUndefined */ "n"])(key) ? Object(_helpers__WEBPACK_IMPORTED_MODULE_1__[/* createGuid */ "c"])() : key;
    this.hashcode = hashcode;
    this.customData = customData;
    this.order = order || 0;
    this.dateOpts = {
      order,
      locale
    };
    this.pinPage = pinPage; // Normalize attribute types

    if (highlight) {
      this.highlight = theme.normalizeHighlight(highlight);
    }

    if (content) {
      this.content = theme.normalizeContent(content);
    }

    if (dot) {
      this.dot = theme.normalizeDot(dot);
    }

    if (bar) {
      this.bar = theme.normalizeBar(bar);
    }

    if (popover) {
      this.popover = popover;
    } // Wrap dates in array if needed


    if (dates) {
      this.dates = Object(___WEBPACK_IMPORTED_MODULE_2__[/* isArray */ "h"])(dates) ? dates : [dates];
    }

    this.hasDates = Object(_helpers__WEBPACK_IMPORTED_MODULE_1__[/* arrayHasItems */ "b"])(this.dates); // Wrap exclude dates in array if needed

    if (excludeDates) {
      this.excludeDates = Object(___WEBPACK_IMPORTED_MODULE_2__[/* isArray */ "h"])(excludeDates) ? excludeDates : [excludeDates];
    }

    this.hasExcludeDates = Object(_helpers__WEBPACK_IMPORTED_MODULE_1__[/* arrayHasItems */ "b"])(this.excludeDates);
    this.excludeMode = excludeMode || 'intersects'; // Assign final dates

    this.dates = (this.hasDates && this.dates || this.hasExcludeDates && [{}] || []).map(function (d) {
      return d && (d instanceof _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"] ? d : new _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](d, _this.dateOpts));
    }).filter(function (d) {
      return d;
    }); // Assign final exclude dates

    this.excludeDates = (this.hasExcludeDates && this.excludeDates || []).map(function (d) {
      return d && (d instanceof _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"] ? d : new _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](d, _this.dateOpts));
    }).filter(function (d) {
      return d;
    });
    this.isComplex = Object(___WEBPACK_IMPORTED_MODULE_2__[/* some */ "t"])(this.dates, function (d) {
      return d.isComplex;
    });
  } // Accepts: Date or date range object
  // Returns: First date that partially intersects the given date


  intersectsDate(date) {
    return !this.excludesDate(date) && (this.dates.find(function (d) {
      return d.intersectsDate(date);
    }) || false);
  } // Accepts: Date or date range object
  // Returns: First date that completely includes the given date


  includesDate(date) {
    date = date instanceof _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"] ? date : new _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](date, this.dateOpts);
    return !this.excludesDate(date) && (this.dates.find(function (d) {
      return d.includesDate(date);
    }) || false);
  }

  excludesDate(date) {
    var _this2 = this;

    date = date instanceof _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"] ? date : new _dateInfo__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](date, this.dateOpts);
    return this.hasExcludeDates && this.excludeDates.find(function (ed) {
      return _this2.excludeMode === 'intersects' && ed.intersectsDate(date) || _this2.excludeMode === 'includes' && ed.includesDate(date);
    });
  } // Accepts: Day object
  // Returns: First attribute date info that occurs on given day.


  includesDay(day) {
    return !this.excludesDay(day) && (this.dates.find(function (d) {
      return d.includesDay(day);
    }) || false);
  }

  excludesDay(day) {
    return this.hasExcludeDates && this.excludeDates.find(function (ed) {
      return ed.includesDay(day);
    });
  }

}

/***/ }),

/***/ "230e":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
var document = __webpack_require__("7726").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "234d":
/***/ (function(module, exports, __webpack_require__) {

var memoize = __webpack_require__("e380");

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;


/***/ }),

/***/ "2350":
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "23a5":
/***/ (function(module) {

module.exports = JSON.parse("{\"maxSwipeTime\":300,\"minHorizontalSwipeDistance\":60,\"maxVerticalSwipeDistance\":80}");

/***/ }),

/***/ "23c6":
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__("2d95");
var TAG = __webpack_require__("2b4c")('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ "2411":
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__("f909"),
    createAssigner = __webpack_require__("2ec1");

/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});

module.exports = mergeWith;


/***/ }),

/***/ "242e":
/***/ (function(module, exports, __webpack_require__) {

var baseFor = __webpack_require__("72af"),
    keys = __webpack_require__("ec69");

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

module.exports = baseForOwn;


/***/ }),

/***/ "2474":
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__("2b3e");

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),

/***/ "2478":
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__("4245");

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),

/***/ "2524":
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__("6044");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),

/***/ "253c":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ "2593":
/***/ (function(module, exports, __webpack_require__) {

var basePick = __webpack_require__("15f3"),
    flatRest = __webpack_require__("c6cf");

/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = flatRest(function(object, paths) {
  return object == null ? {} : basePick(object, paths);
});

module.exports = pick;


/***/ }),

/***/ "26e8":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;


/***/ }),

/***/ "2768":
/***/ (function(module, exports) {

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

module.exports = isNil;


/***/ }),

/***/ "28a5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isRegExp = __webpack_require__("aae3");
var anObject = __webpack_require__("cb7c");
var speciesConstructor = __webpack_require__("ebd6");
var advanceStringIndex = __webpack_require__("0390");
var toLength = __webpack_require__("9def");
var callRegExpExec = __webpack_require__("5f1b");
var regexpExec = __webpack_require__("520a");
var fails = __webpack_require__("79e5");
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
__webpack_require__("214f")('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});


/***/ }),

/***/ "28c9":
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),

/***/ "294c":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "29ae":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ locale_Locale; });

// UNUSED EXPORTS: resolveConfig

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.to-string.js
var es6_regexp_to_string = __webpack_require__("6b54");

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs2/helpers/esm/defineProperty.js
var defineProperty = __webpack_require__("bd86");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__("ac6a");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.search.js
var es6_regexp_search = __webpack_require__("386d");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.replace.js
var es6_regexp_replace = __webpack_require__("a481");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.match.js
var es6_regexp_match = __webpack_require__("4917");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.constructor.js
var es6_regexp_constructor = __webpack_require__("3b2b");

// EXTERNAL MODULE: ./src/utils/_.js
var _ = __webpack_require__("9404");

// CONCATENATED MODULE: ./src/utils/fecha.js






/* eslint-disable no-bitwise, no-mixed-operators, no-useless-escape, no-multi-assign */

/* DATE FORMATTING & PARSING USING A SLIGHTLY MODIFIED VERSION OF FECHA (https://github.com/taylorhakes/fecha) */

/* ADDS A NARROW WEEKDAY FORMAT 'dd' */

const token = /d{1,2}|W{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
const twoDigits = /\d\d?/;
const threeDigits = /\d{3}/;
const fourDigits = /\d{4}/;
const word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
const literal = /\[([^]*?)\]/gm;

const noop = function noop() {};

function monthUpdate(arrName) {
  return function (d, v, i18n) {
    const index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());

    if (~index) {
      d.month = index;
    }
  };
}

function pad(val, len) {
  val = String(val);
  len = len || 2;

  while (val.length < len) {
    val = `0${val}`;
  }

  return val;
}

const formatFlags = {
  D(dateObj) {
    return dateObj.getDate();
  },

  DD(dateObj) {
    return pad(dateObj.getDate());
  },

  Do(dateObj, i18n) {
    return i18n.DoFn(dateObj.getDate());
  },

  d(dateObj) {
    return dateObj.getDay();
  },

  dd(dateObj) {
    return pad(dateObj.getDay());
  },

  W(dateObj, i18n) {
    return i18n.dayNamesNarrow[dateObj.getDay()];
  },

  WW(dateObj, i18n) {
    return i18n.dayNamesShorter[dateObj.getDay()];
  },

  WWW(dateObj, i18n) {
    return i18n.dayNamesShort[dateObj.getDay()];
  },

  WWWW(dateObj, i18n) {
    return i18n.dayNames[dateObj.getDay()];
  },

  M(dateObj) {
    return dateObj.getMonth() + 1;
  },

  MM(dateObj) {
    return pad(dateObj.getMonth() + 1);
  },

  MMM(dateObj, i18n) {
    return i18n.monthNamesShort[dateObj.getMonth()];
  },

  MMMM(dateObj, i18n) {
    return i18n.monthNames[dateObj.getMonth()];
  },

  YY(dateObj) {
    return String(dateObj.getFullYear()).substr(2);
  },

  YYYY(dateObj) {
    return pad(dateObj.getFullYear(), 4);
  },

  h(dateObj) {
    return dateObj.getHours() % 12 || 12;
  },

  hh(dateObj) {
    return pad(dateObj.getHours() % 12 || 12);
  },

  H(dateObj) {
    return dateObj.getHours();
  },

  HH(dateObj) {
    return pad(dateObj.getHours());
  },

  m(dateObj) {
    return dateObj.getMinutes();
  },

  mm(dateObj) {
    return pad(dateObj.getMinutes());
  },

  s(dateObj) {
    return dateObj.getSeconds();
  },

  ss(dateObj) {
    return pad(dateObj.getSeconds());
  },

  S(dateObj) {
    return Math.round(dateObj.getMilliseconds() / 100);
  },

  SS(dateObj) {
    return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
  },

  SSS(dateObj) {
    return pad(dateObj.getMilliseconds(), 3);
  },

  a(dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
  },

  A(dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
  },

  ZZ(dateObj) {
    const o = dateObj.getTimezoneOffset();
    return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
  }

};
const parseFlags = {
  D: [twoDigits, function (d, v) {
    d.day = v;
  }],
  Do: [new RegExp(twoDigits.source + word.source), function (d, v) {
    d.day = parseInt(v, 10);
  }],
  d: [twoDigits, noop],
  W: [word, noop],
  M: [twoDigits, function (d, v) {
    d.month = v - 1;
  }],
  MMM: [word, monthUpdate('monthNamesShort')],
  MMMM: [word, monthUpdate('monthNames')],
  YY: [twoDigits, function (d, v) {
    const da = new Date();
    const cent = +da.getFullYear().toString().substr(0, 2);
    d.year = `${v > 68 ? cent - 1 : cent}${v}`;
  }],
  YYYY: [fourDigits, function (d, v) {
    d.year = v;
  }],
  S: [/\d/, function (d, v) {
    d.millisecond = v * 100;
  }],
  SS: [/\d{2}/, function (d, v) {
    d.millisecond = v * 10;
  }],
  SSS: [threeDigits, function (d, v) {
    d.millisecond = v;
  }],
  h: [twoDigits, function (d, v) {
    d.hour = v;
  }],
  m: [twoDigits, function (d, v) {
    d.minute = v;
  }],
  s: [twoDigits, function (d, v) {
    d.second = v;
  }],
  a: [word, function (d, v, i18n) {
    const val = v.toLowerCase();

    if (val === i18n.amPm[0]) {
      d.isPm = false;
    } else if (val === i18n.amPm[1]) {
      d.isPm = true;
    }
  }],
  ZZ: [/([\+\-]\d\d:?\d\d|Z)/, function (d, v) {
    if (v === 'Z') v = '+00:00';
    const parts = `${v}`.match(/([+-]|\d\d)/gi);

    if (parts) {
      const minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
      d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
    }
  }]
};
parseFlags.DD = parseFlags.D;
parseFlags.dd = parseFlags.d;
parseFlags.WWWW = parseFlags.WWW = parseFlags.WW = parseFlags.W;
parseFlags.MM = parseFlags.M;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a;
const fecha_format = function format(dateObj, mask, locale) {
  if (_["k" /* isNumber */]) {
    dateObj = new Date(dateObj);
  }

  if (!Object(_["i" /* isDate */])(dateObj)) {
    throw new Error('Invalid Date in fecha.format');
  }

  mask = locale.masks[mask] || mask;
  const literals = []; // Make literals inactive by replacing them with ??

  mask = mask.replace(literal, function ($0, $1) {
    literals.push($1);
    return '??';
  }); // Apply formatting rules

  mask = mask.replace(token, function ($0) {
    return $0 in formatFlags ? formatFlags[$0](dateObj, locale) : $0.slice(1, $0.length - 1);
  }); // Inline literal values back into the formatted value

  return mask.replace(/\?\?/g, function () {
    return literals.shift();
  });
};

const parseString = function parseString(dateStr, mask, locale) {
  if (typeof mask !== 'string') {
    throw new Error('Invalid mask in fecha.parse');
  }

  mask = locale.masks[mask] || mask; // Avoid regular expression denial of service, fail early for really long strings
  // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS

  if (dateStr.length > 1000) {
    return false;
  }

  let isValid = true;
  const dateInfo = {};
  mask.replace(token, function ($0) {
    if (parseFlags[$0]) {
      const info = parseFlags[$0];
      const index = dateStr.search(info[0]);

      if (!~index) {
        isValid = false;
      } else {
        dateStr.replace(info[0], function (result) {
          info[1](dateInfo, result, locale);
          dateStr = dateStr.substr(index + result.length);
          return result;
        });
      }
    }

    return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
  });

  if (!isValid) {
    return false;
  }

  const today = new Date();

  if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
    dateInfo.hour = +dateInfo.hour + 12;
  } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
    dateInfo.hour = 0;
  }

  let date;

  if (dateInfo.timezoneOffset != null) {
    dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
    date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
  } else {
    date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
  }

  return date;
};

const fecha_parse = function parse(dateStr, mask, locale) {
  const masks = Object(_["h" /* isArray */])(mask) && mask || [Object(_["m" /* isString */])(mask) && mask || 'YYYY-MM-DD'];
  return masks.map(function (m) {
    return parseString(dateStr, m, locale);
  }).find(function (d) {
    return d;
  }) || new Date(dateStr);
};
// EXTERNAL MODULE: ./src/utils/defaults/locales.js
var defaults_locales = __webpack_require__("f15d");

// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers = __webpack_require__("2fa3");

// CONCATENATED MODULE: ./src/utils/locale.js




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





const daysInWeek = 7;
const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function resolveConfig(config, locales) {
  // Get the detected locale string
  const detLocale = new Intl.DateTimeFormat().resolvedOptions().locale; // Resolve the locale id

  let id;

  if (Object(_["m" /* isString */])(config)) {
    id = config;
  } else if (Object(_["e" /* has */])(config, 'id')) {
    id = config.id;
  }

  id = (id || detLocale).toLowerCase();
  const localeKeys = Object.keys(locales);

  const validKey = function validKey(k) {
    return localeKeys.find(function (lk) {
      return lk.toLowerCase() === k;
    });
  };

  id = validKey(id) || validKey(id.substring(0, 2)) || detLocale; // Add fallback and spread default locale to prevent repetitive update loops

  const defLocale = _objectSpread(_objectSpread(_objectSpread({}, locales['en-IE']), locales[id]), {}, {
    id
  }); // Assign or merge defaults with provided config


  config = Object(_["l" /* isObject */])(config) ? Object(_["c" /* defaultsDeep */])(config, defLocale) : defLocale; // Return resolved config

  return config;
}
class locale_Locale {
  constructor(config, locales = defaults_locales["a" /* default */]) {
    const {
      id,
      firstDayOfWeek,
      masks
    } = resolveConfig(config, locales);
    this.id = id;
    this.firstDayOfWeek = Object(_["a" /* clamp */])(firstDayOfWeek, 1, daysInWeek);
    this.masks = masks;
    this.dayNames = this.getDayNames('long');
    this.dayNamesShort = this.getDayNames('short');
    this.dayNamesShorter = this.dayNamesShort.map(function (s) {
      return s.substring(0, 2);
    });
    this.dayNamesNarrow = this.getDayNames('narrow');
    this.monthNames = this.getMonthNames('long');
    this.monthNamesShort = this.getMonthNames('short');
    this.monthData = {}; // Bind methods

    this.getMonthComps = this.getMonthComps.bind(this);
    this.parse = this.parse.bind(this);
    this.format = this.format.bind(this);
    this.toDate = this.toDate.bind(this);
    this.toPage = this.toPage.bind(this);
  }

  parse(dateStr, mask) {
    return fecha_parse(dateStr, mask || this.masks.L, this);
  }

  format(date, mask) {
    return fecha_format(date, mask || this.masks.L, this);
  }

  toDate(d, mask) {
    if (Object(_["i" /* isDate */])(d)) {
      return new Date(d.getTime());
    }

    if (Object(_["k" /* isNumber */])(d)) {
      return new Date(d);
    }

    if (Object(_["m" /* isString */])(d)) {
      return this.parse(d, mask);
    }

    if (Object(_["l" /* isObject */])(d)) {
      const date = new Date();
      return new Date(d.year || date.getFullYear(), d.month || date.getMonth(), d.day || date.getDate());
    }

    return d;
  }

  toPage(arg, fromPage) {
    if (Object(_["k" /* isNumber */])(arg)) {
      return Object(helpers["a" /* addPages */])(fromPage, arg);
    }

    if (Object(_["m" /* isString */])(arg)) {
      return Object(helpers["p" /* pageForDate */])(this.toDate(arg));
    }

    if (Object(_["i" /* isDate */])(arg)) {
      return Object(helpers["p" /* pageForDate */])(arg);
    }

    if (Object(_["l" /* isObject */])(arg)) {
      return arg;
    }

    return null;
  }

  getMonthDates(year = 2000) {
    const dates = [];

    for (let i = 0; i < 12; i++) {
      dates.push(new Date(year, i, 15));
    }

    return dates;
  }

  getMonthNames(length) {
    const dtf = new Intl.DateTimeFormat(this.id, {
      month: length,
      timezome: 'UTC'
    });
    return this.getMonthDates().map(function (d) {
      return dtf.format(d);
    });
  }

  getWeekdayDates({
    year = 2000,
    utc = false,
    firstDayOfWeek = this.firstDayOfWeek
  } = {}) {
    const dates = [];

    for (let i = 1, j = 0; j < daysInWeek; i++) {
      const d = utc ? new Date(Date.UTC(year, 0, i)) : new Date(year, 0, i);
      const day = utc ? d.getUTCDay() : d.getDay();

      if (day === firstDayOfWeek - 1 || j > 0) {
        dates.push(d);
        j++;
      }
    }

    return dates;
  }

  getDayNames(length) {
    const dtf = new Intl.DateTimeFormat(this.id, {
      weekday: length,
      timeZone: 'UTC'
    });
    return this.getWeekdayDates({
      firstDayOfWeek: 1,
      utc: true
    }).map(function (d) {
      return dtf.format(d);
    });
  } // Days/month/year components for a given month and year


  getMonthComps(month, year) {
    const key = `${month}-${year}`;
    let comps = this.monthData[key];

    if (!comps) {
      const inLeapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      const firstWeekday = new Date(year, month - 1, 1).getDay() + 1;
      const days = month === 2 && inLeapYear ? 29 : daysInMonths[month - 1];
      const weeks = Math.ceil((days + Math.abs(firstWeekday - this.firstDayOfWeek)) / daysInWeek);
      comps = {
        firstDayOfWeek: this.firstDayOfWeek,
        inLeapYear,
        firstWeekday,
        days,
        weeks,
        month,
        year
      };
      this.monthData[key] = comps;
    }

    return comps;
  } // Days/month/year components for today's month


  getThisMonthComps() {
    const date = new Date();
    return this.getMonthComps(date.getMonth() + 1, date.getFullYear());
  } // Day/month/year components for previous month


  getPrevMonthComps(month, year) {
    if (month === 1) return this.getMonthComps(12, year - 1);
    return this.getMonthComps(month - 1, year);
  } // Day/month/year components for next month


  getNextMonthComps(month, year) {
    if (month === 12) return this.getMonthComps(1, year + 1);
    return this.getMonthComps(month + 1, year);
  }

  getDayFromDate(date) {
    if (!date) return null;
    const month = date.getMonth() + 1;
    const year = date.getUTCFullYear();
    const comps = this.getMonthComps(month, year);
    const day = date.getDate();
    const dayFromEnd = comps.days - day + 1;
    const weekday = date.getDay() + 1;
    const weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
    const weekdayOrdinalFromEnd = Math.floor((comps.days - day) / 7 + 1);
    const week = Math.ceil((day + Math.abs(comps.firstWeekday - comps.firstDayOfWeek)) / 7);
    const weekFromEnd = comps.weeks - week + 1;
    return {
      day,
      dayFromEnd,
      weekday,
      weekdayOrdinal,
      weekdayOrdinalFromEnd,
      week,
      weekFromEnd,
      month,
      year,
      date,
      dateTime: date.getTime()
    };
  } // Buils day components for a given page


  getCalendarDays({
    monthComps,
    prevMonthComps,
    nextMonthComps
  }) {
    const days = [];
    const {
      firstDayOfWeek,
      firstWeekday
    } = monthComps;
    const prevMonthDaysToShow = firstWeekday + (firstWeekday < firstDayOfWeek ? daysInWeek : 0) - firstDayOfWeek;
    let prevMonth = true;
    let thisMonth = false;
    let nextMonth = false; // Formatter for aria labels

    const formatter = new Intl.DateTimeFormat(this.id, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }); // Init counters with previous month's data

    let day = prevMonthComps.days - prevMonthDaysToShow + 1;
    let dayFromEnd = prevMonthComps.days - day + 1;
    let weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
    let weekdayOrdinalFromEnd = 1;
    let week = prevMonthComps.weeks;
    let weekFromEnd = 1;
    let month = prevMonthComps.month;
    let year = prevMonthComps.year; // Store todays comps

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear(); // Cycle through 6 weeks (max in month)

    for (let w = 1; w <= 6; w++) {
      // Cycle through days in week
      for (let i = 1, weekday = firstDayOfWeek; i <= daysInWeek; i++, weekday += weekday === daysInWeek ? 1 - daysInWeek : 1) {
        // We need to know when to start counting actual month days
        if (prevMonth && weekday === firstWeekday) {
          // Reset counters for current month
          day = 1;
          dayFromEnd = monthComps.days;
          weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
          weekdayOrdinalFromEnd = Math.floor((monthComps.days - day) / daysInWeek + 1);
          week = 1;
          weekFromEnd = monthComps.weeks;
          month = monthComps.month;
          year = monthComps.year; // ...and flag we're tracking actual month days

          prevMonth = false;
          thisMonth = true;
        } // Append day info for the current week
        // Note: this might or might not be an actual month day
        //  We don't know how the UI wants to display various days,
        //  so we'll supply all the data we can


        const date = new Date(year, month - 1, day);
        const id = this.format(date, 'YYYY-MM-DD');
        const weekdayPosition = i;
        const weekdayPositionFromEnd = daysInWeek - i;
        const isToday = day === todayDay && month === todayMonth && year === todayYear;
        const isFirstDay = thisMonth && day === 1;
        const isLastDay = thisMonth && day === monthComps.days;
        const onTop = w === 1;
        const onBottom = w === 6;
        const onLeft = i === 1;
        const onRight = i === daysInWeek;
        days.push({
          id,
          label: day.toString(),
          ariaLabel: formatter.format(date),
          day,
          dayFromEnd,
          weekday,
          weekdayPosition,
          weekdayPositionFromEnd,
          weekdayOrdinal,
          weekdayOrdinalFromEnd,
          week,
          weekFromEnd,
          month,
          year,
          date,
          dateTime: date.getTime(),
          isToday,
          isFirstDay,
          isLastDay,
          inMonth: thisMonth,
          inPrevMonth: prevMonth,
          inNextMonth: nextMonth,
          onTop,
          onBottom,
          onLeft,
          onRight,
          classes: [`id-${id}`, `day-${day}`, `day-from-end-${dayFromEnd}`, `weekday-${weekday}`, `weekday-position-${weekdayPosition}`, `weekday-ordinal-${weekdayOrdinal}`, `weekday-ordinal-from-end-${weekdayOrdinalFromEnd}`, `week-${week}`, `week-from-end-${weekFromEnd}`, {
            'is-today': isToday,
            'is-first-day': isFirstDay,
            'is-last-day': isLastDay,
            'in-month': thisMonth,
            'in-prev-month': prevMonth,
            'in-next-month': nextMonth,
            'on-top': onTop,
            'on-bottom': onBottom,
            'on-left': onLeft,
            'on-right': onRight
          }]
        }); // See if we've hit the last day of the month

        if (thisMonth && isLastDay) {
          thisMonth = false;
          nextMonth = true; // Reset counters to next month's data

          day = 1;
          dayFromEnd = nextMonthComps.days;
          weekdayOrdinal = 1;
          weekdayOrdinalFromEnd = Math.floor((nextMonthComps.days - day) / daysInWeek + 1);
          week = 1;
          weekFromEnd = nextMonthComps.weeks;
          month = nextMonthComps.month;
          year = nextMonthComps.year; // Still in the middle of the month (hasn't ended yet)
        } else {
          day++;
          dayFromEnd--;
          weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
          weekdayOrdinalFromEnd = Math.floor((monthComps.days - day) / daysInWeek + 1);
        }
      } // Append week days


      week++;
      weekFromEnd--;
    }

    return days;
  }

}

/***/ }),

/***/ "29f3":
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "2aba":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var hide = __webpack_require__("32e9");
var has = __webpack_require__("69a8");
var SRC = __webpack_require__("ca5a")('src');
var $toString = __webpack_require__("fa5b");
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__("8378").inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ "2aeb":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__("cb7c");
var dPs = __webpack_require__("1495");
var enumBugKeys = __webpack_require__("e11e");
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__("230e")('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__("fab2").appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),

/***/ "2af9":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Calendar", function() { return /* reexport */ Calendar; });
__webpack_require__.d(__webpack_exports__, "CalendarNav", function() { return /* reexport */ CalendarNav; });
__webpack_require__.d(__webpack_exports__, "DatePicker", function() { return /* reexport */ DatePicker; });
__webpack_require__.d(__webpack_exports__, "Popover", function() { return /* reexport */ Popover; });
__webpack_require__.d(__webpack_exports__, "PopoverRef", function() { return /* reexport */ PopoverRef; });
__webpack_require__.d(__webpack_exports__, "Grid", function() { return /* reexport */ Grid; });

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.to-string.js
var es6_regexp_to_string = __webpack_require__("6b54");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__("ac6a");

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs2/helpers/esm/defineProperty.js
var defineProperty = __webpack_require__("bd86");

// EXTERNAL MODULE: ./node_modules/date-fns/esm/addDays/index.js
var addDays = __webpack_require__("f7f1");

// EXTERNAL MODULE: ./node_modules/date-fns/esm/_lib/toInteger/index.js
var toInteger = __webpack_require__("fe1f");

// EXTERNAL MODULE: ./node_modules/date-fns/esm/toDate/index.js
var toDate = __webpack_require__("fd3a");

// EXTERNAL MODULE: ./node_modules/date-fns/esm/_lib/requiredArgs/index.js
var requiredArgs = __webpack_require__("8c86");

// CONCATENATED MODULE: ./node_modules/date-fns/esm/addMonths/index.js



/**
 * @name addMonths
 * @category Month Helpers
 * @summary Add the specified number of months to the given date.
 *
 * @description
 * Add the specified number of months to the given date.
 *
 * ### v2.0.0 breaking changes:
 *
 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of months to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the months added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 5 months to 1 September 2014:
 * var result = addMonths(new Date(2014, 8, 1), 5)
 * //=> Sun Feb 01 2015 00:00:00
 */

function addMonths(dirtyDate, dirtyAmount) {
  Object(requiredArgs["a" /* default */])(2, arguments);
  var date = Object(toDate["a" /* default */])(dirtyDate);
  var amount = Object(toInteger["a" /* default */])(dirtyAmount);

  if (isNaN(amount)) {
    return new Date(NaN);
  }

  if (!amount) {
    // If 0 months, no-op to avoid changing times in the hour before end of DST
    return date;
  }

  var dayOfMonth = date.getDate(); // The JS Date object supports date math by accepting out-of-bounds values for
  // month, day, etc. For example, new Date(2020, 1, 0) returns 31 Dec 2019 and
  // new Date(2020, 13, 1) returns 1 Feb 2021.  This is *almost* the behavior we
  // want except that dates will wrap around the end of a month, meaning that
  // new Date(2020, 13, 31) will return 3 Mar 2021 not 28 Feb 2021 as desired. So
  // we'll default to the end of the desired month by adding 1 to the desired
  // month and using a date of 0 to back up one day to the end of the desired
  // month.

  var endOfDesiredMonth = new Date(date.getTime());
  endOfDesiredMonth.setMonth(date.getMonth() + amount + 1, 0);
  var daysInMonth = endOfDesiredMonth.getDate();

  if (dayOfMonth >= daysInMonth) {
    // If we're already at the end of the month, then this is the correct date
    // and we're done.
    return endOfDesiredMonth;
  } else {
    // Otherwise, we now know that setting the original day-of-month value won't
    // cause an overflow, so set the desired day-of-month. Note that we can't
    // just set the date of `endOfDesiredMonth` because that object may have had
    // its time changed in the unusual case where where a DST transition was on
    // the last day of the month and its local time was in the hour skipped or
    // repeated next to a DST transition.  So we use `date` instead which is
    // guaranteed to still have the original time.
    date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
    return date;
  }
}
// CONCATENATED MODULE: ./node_modules/date-fns/esm/addYears/index.js



/**
 * @name addYears
 * @category Year Helpers
 * @summary Add the specified number of years to the given date.
 *
 * @description
 * Add the specified number of years to the given date.
 *
 * ### v2.0.0 breaking changes:
 *
 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of years to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the years added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 5 years to 1 September 2014:
 * var result = addYears(new Date(2014, 8, 1), 5)
 * //=> Sun Sep 01 2019 00:00:00
 */

function addYears(dirtyDate, dirtyAmount) {
  Object(requiredArgs["a" /* default */])(2, arguments);
  var amount = Object(toInteger["a" /* default */])(dirtyAmount);
  return addMonths(dirtyDate, amount * 12);
}
// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.split.js
var es6_regexp_split = __webpack_require__("28a5");

// EXTERNAL MODULE: ./node_modules/popper.js/dist/esm/popper.js
var popper = __webpack_require__("f0bd");

// EXTERNAL MODULE: ./src/utils/_.js
var utils_ = __webpack_require__("9404");

// CONCATENATED MODULE: ./src/utils/popovers.js



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


const popovers_popovers = {};
const popoversMixin = {
  data() {
    return {
      popovers$: popovers_popovers
    };
  },

  computed: {
    $popovers() {
      return this.popovers$;
    }

  },
  methods: {
    $popoverExists(id) {
      return this.$popovers && this.$popovers[id];
    },

    $popoverIsActive(id, ref) {
      const activeRef = this.$popovers && this.$popovers[id] && this.$popovers[id].ref;
      return !!(activeRef && (!ref || ref === activeRef));
    },

    $popoverHasPriority(popover) {
      const existingPopover = this.$popovers[popover.id];
      if (!existingPopover || !existingPopover.priority) return true;
      return popover.priority > existingPopover.priority;
    },

    $showPopover(popover) {
      var _this = this;

      if (!this.$popoverHasPriority(popover)) return;
      const {
        id,
        ref
      } = popover;
      const existingPopover = this.$popovers[id];
      Object(utils_["b" /* defaults */])(popover, existingPopover);

      popover.next = function () {
        if (!existingPopover || ref !== existingPopover.ref) {
          _this.$set(_this.$popovers, id, _objectSpread(_objectSpread({}, popover), {}, {
            priority: 0
          }));
        }
      };

      this.handleStateTimer(popover, 'show');
    },

    $hidePopover(popover) {
      var _this2 = this;

      if (!this.$popoverHasPriority(popover)) return;
      const {
        id,
        ref
      } = popover;
      Object(utils_["b" /* defaults */])(popover, this.$popovers[id]);

      popover.next = function () {
        if (!ref || ref === _this2.$popovers[id].ref) {
          _this2.$set(_this2.$popovers, id, {});
        }
      };

      this.handleStateTimer(popover, 'hide');
    },

    $updatePopover(popover) {
      const {
        id,
        ref
      } = popover;
      Object(utils_["b" /* defaults */])(popover, this.$popovers[id]);

      if (!ref || ref === this.$popovers[id].ref) {
        this.$set(this.$popovers, id, popover);
      }
    },

    handleStateTimer(state) {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = undefined;
      }

      if (!state.delay) {
        state.next();
      } else {
        this.$set(this.$popovers, state.id, _objectSpread(_objectSpread({}, state), {}, {
          timer: setTimeout(state.next, state.delay)
        }));
      }
    }

  }
};
// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers = __webpack_require__("2fa3");

// EXTERNAL MODULE: ./src/utils/touch.js
var touch = __webpack_require__("0733");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Popover.vue?vue&type=script&lang=js&




function Popovervue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function Popovervue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { Popovervue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { Popovervue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }






/* harmony default export */ var Popovervue_type_script_lang_js_ = ({
  name: 'Popover',

  render(h) {
    return h('div', {
      class: ['vc-popover-content-wrapper', {
        'is-interactive': this.isInteractive
      }],
      ref: 'popover'
    }, [h('transition', {
      props: {
        name: this.transition,
        appear: true
      },
      on: {
        beforeEnter: this.beforeEnter,
        afterEnter: this.afterEnter,
        beforeLeave: this.beforeLeave,
        afterLeave: this.afterLeave
      }
    }, [this.isVisible && h('div', {
      attrs: {
        tabindex: -1
      },
      class: ['vc-popover-content', `direction-${this.direction}`, this.contentClass]
    }, [this.content, h('span', {
      class: ['vc-popover-caret', `direction-${this.direction}`, `align-${this.alignment}`]
    })])])]);
  },

  mixins: [popoversMixin],
  props: {
    id: {
      type: String,
      required: true
    },
    transition: {
      type: String,
      default: 'slide-fade'
    },
    contentClass: String
  },

  data() {
    return {
      ref: null,
      args: null,
      visibility: '',
      placement: 'bottom',
      positionFixed: false,
      modifiers: {},
      isInteractive: false,
      delay: 10,
      popperEl: null
    };
  },

  computed: {
    content() {
      var _this = this;

      return Object(utils_["j" /* isFunction */])(this.$scopedSlots.default) && this.$scopedSlots.default({
        direction: this.direction,
        alignment: this.alignment,
        args: this.args,
        updateLayout: this.scheduleUpdate,
        hide: function hide(opts) {
          return _this.hide(opts);
        }
      }) || this.$slots.default;
    },

    popperOptions() {
      return {
        placement: this.placement,
        positionFixed: this.positionFixed,
        modifiers: Popovervue_type_script_lang_js_objectSpread({
          hide: {
            enabled: false
          },
          preventOverflow: {
            enabled: false
          }
        }, this.modifiers),
        onCreate: this.onPopperUpdate,
        onUpdate: this.onPopperUpdate
      };
    },

    isVisible() {
      return !!(this.ref && (this.$scopedSlots.default || this.$slots.default) && this.visibility !== 'hidden');
    },

    direction() {
      return this.placement && this.placement.split('-')[0] || 'bottom';
    },

    alignment() {
      const isLeftRight = this.direction === 'left' || this.direction === 'right';
      let alignment = this.placement.split('-');
      alignment = alignment.length > 1 ? alignment[1] : '';

      if (['start', 'top', 'left'].includes(alignment)) {
        return isLeftRight ? 'top' : 'left';
      }

      if (['end', 'bottom', 'right'].includes(alignment)) {
        return isLeftRight ? 'bottom' : 'right';
      }

      return isLeftRight ? 'middle' : 'center';
    },

    state() {
      return this.$popovers[this.id];
    }

  },
  watch: {
    state: {
      immediate: true,

      handler(val) {
        if (val) {
          this.ref = val.ref;
          this.args = val.args;
          this.visibility = val.visibility;
          this.placement = val.placement;
          this.positionFixed = val.positionFixed;
          this.modifiers = val.modifiers;
          this.isInteractive = val.isInteractive;
          this.setupPopper();
        }
      }

    }
  },

  mounted() {
    this.popoverEl = this.$refs.popover;
    this.addEvents();
  },

  beforeDestroy() {
    this.removeEvents();
  },

  methods: {
    addEvents() {
      Object(helpers["n" /* on */])(this.popoverEl, 'click', this.onClick);
      Object(helpers["n" /* on */])(this.popoverEl, 'mouseover', this.onMouseOver);
      Object(helpers["n" /* on */])(this.popoverEl, 'mouseleave', this.onMouseLeave);
      Object(helpers["n" /* on */])(this.popoverEl, 'focusin', this.onFocusIn);
      Object(helpers["n" /* on */])(this.popoverEl, 'focusout', this.onFocusOut);
      Object(helpers["n" /* on */])(document, 'keydown', this.onDocumentKeydown);
      this.removeDocHandler = Object(touch["b" /* addTapOrClickHandler */])(document, this.onDocumentClick);
    },

    removeEvents() {
      Object(helpers["m" /* off */])(this.popoverEl, 'click', this.onClick);
      Object(helpers["m" /* off */])(this.popoverEl, 'mouseover', this.onMouseOver);
      Object(helpers["m" /* off */])(this.popoverEl, 'mouseleave', this.onMouseLeave);
      Object(helpers["m" /* off */])(this.popoverEl, 'focusin', this.onFocusIn);
      Object(helpers["m" /* off */])(this.popoverEl, 'focusout', this.onFocusOut);
      Object(helpers["m" /* off */])(document, 'keydown', this.onDocumentKeydown);
      if (this.removeDocHandler) this.removeDocHandler();
    },

    onClick(e) {
      e.stopPropagation();
    },

    onMouseOver() {
      if (this.isInteractive && this.visibility === 'hover') {
        this.show();
      }
    },

    onMouseLeave() {
      if (this.isInteractive && this.visibility === 'hover') {
        this.hide();
      }
    },

    onFocusIn() {
      if (this.isInteractive && this.visibility === 'focus') {
        this.show();
      }
    },

    onFocusOut(e) {
      if (this.isInteractive && this.visibility === 'focus' && e.relatedTarget && !Object(helpers["e" /* elementContains */])(this.popoverEl, e.relatedTarget)) {
        this.hide();
      }
    },

    onDocumentClick(e) {
      if (!this.$refs.popover || !this.ref) {
        return;
      } // Don't hide if target element is contained within popover ref or content


      if (Object(helpers["e" /* elementContains */])(this.popoverEl, e.target) || Object(helpers["e" /* elementContains */])(this.ref, e.target)) {
        return;
      } // Hide the popover


      this.hide();
    },

    onDocumentKeydown(e) {
      if (e.key === 'Esc' || e.key === 'Escape') {
        this.hide();
      }
    },

    show() {
      this.$showPopover({
        id: this.id,
        ref: this.ref,
        delay: 0
      });
    },

    hide(opts) {
      this.$hidePopover(Popovervue_type_script_lang_js_objectSpread(Popovervue_type_script_lang_js_objectSpread({}, opts), {}, {
        id: this.id,
        ref: this.ref
      }));
    },

    onUpdate({
      args
    }) {
      this.args = args;
      this.setupPopper();
    },

    setupPopper() {
      var _this2 = this;

      this.$nextTick(function () {
        if (!_this2.ref || !_this2.$refs.popover) return;

        if (_this2.popper && _this2.popper.reference !== _this2.ref) {
          _this2.popper.destroy();

          _this2.popper = null;
        }

        if (!_this2.popper) {
          _this2.popper = new popper["a" /* default */](_this2.ref, _this2.popoverEl, _this2.popperOptions);
        } else {
          _this2.popper.scheduleUpdate();
        }
      });
    },

    onPopperUpdate(data) {
      this.placement = data.placement;
    },

    scheduleUpdate() {
      if (this.popper) {
        this.popper.scheduleUpdate();
      }
    },

    beforeEnter(e) {
      this.$emit('beforeShow', e);
    },

    afterEnter(e) {
      this.$emit('afterShow', e);
    },

    beforeLeave(e) {
      this.$emit('beforeHide', e);
    },

    afterLeave(e) {
      this.destroyPopper();
      this.$emit('afterHide', e);
    },

    destroyPopper() {
      if (this.popper) {
        this.popper.destroy();
        this.popper = null;
      }
    }

  }
});
// CONCATENATED MODULE: ./src/components/Popover.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Popovervue_type_script_lang_js_ = (Popovervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Popover.vue?vue&type=style&index=0&id=7605e1b2&lang=postcss&scoped=true&
var Popovervue_type_style_index_0_id_7605e1b2_lang_postcss_scoped_true_ = __webpack_require__("86aa");

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

// CONCATENATED MODULE: ./src/components/Popover.vue
var render, staticRenderFns





/* normalize component */

var component = normalizeComponent(
  components_Popovervue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "7605e1b2",
  null
  
)

/* harmony default export */ var Popover = (component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"52886563-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/PopoverRow.vue?vue&type=template&id=28ced894&scoped=true&
var PopoverRowvue_type_template_id_28ced894_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-day-popover-row"},[(_vm.indicator)?_c('div',{staticClass:"vc-day-popover-row-indicator"},[_c('span',{class:_vm.indicator.class,style:(_vm.indicator.style)})]):_vm._e(),_c('div',{staticClass:"vc-day-popover-row-content"},[_vm._t("default",[_vm._v(_vm._s(_vm.attribute.popover ? _vm.attribute.popover.label : 'No content provided'))])],2)])}
var PopoverRowvue_type_template_id_28ced894_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/PopoverRow.vue?vue&type=template&id=28ced894&scoped=true&

// EXTERNAL MODULE: ./src/utils/defaults/index.js
var defaults = __webpack_require__("51ec");

// CONCATENATED MODULE: ./src/utils/mixins/child.js


const childMixin = {
  inject: ['sharedState'],
  mixins: [defaults["a" /* defaultsMixin */], popoversMixin],
  computed: {
    masks() {
      return this.sharedState.masks;
    },

    theme() {
      return this.sharedState.theme;
    },

    locale() {
      return this.sharedState.locale;
    },

    dayPopoverId() {
      return this.sharedState.dayPopoverId;
    }

  },
  methods: {
    format(date, mask) {
      return this.locale.format(date, mask);
    }

  }
};
// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.regexp.replace.js
var es6_regexp_replace = __webpack_require__("a481");

// EXTERNAL MODULE: ./src/utils/defaults/theme.js
var theme = __webpack_require__("5ca5");

// CONCATENATED MODULE: ./src/utils/theme.js




function theme_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function theme_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { theme_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { theme_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }



const targetProps = ['base', 'start', 'end', 'startEnd'];
const displayProps = ['class', 'color', 'fillMode'];

function concatClass(obj, prop, className) {
  if (!obj || !prop || !className) return;
  obj[prop] = `${obj[prop] ? `${obj[prop]} ` : ''}${className}`;
}

class theme_Theme {
  constructor(config) {
    var _this = this;

    this._config = Object(utils_["b" /* defaults */])(config, theme["a" /* default */]); // Make properties of config appear as properties of theme

    Object(utils_["u" /* toPairs */])(this._config).forEach(function ([prop]) {
      Object.defineProperty(_this, prop, {
        enumerable: true,

        get() {
          return this.getConfig(prop, {});
        }

      });
    }); // Build and cache normalized attributes

    this.buildNormalizedAttrs();
  }

  buildNormalizedAttrs() {
    var _this2 = this;

    this.normalizedAttrs = {
      highlight: {
        opts: ['fillMode', 'class', 'contentClass']
      },
      dot: {
        opts: ['class']
      },
      bar: {
        opts: ['class']
      },
      content: {
        opts: ['class']
      }
    };
    Object(utils_["u" /* toPairs */])(this.normalizedAttrs).forEach(function ([type, config]) {
      const attr = {
        base: {},
        start: {},
        end: {}
      };
      config.opts.forEach(function (opt) {
        const prefix = type;
        const suffix = Object(utils_["w" /* upperFirst */])(opt);
        const base = _this2[`${prefix}Base${suffix}`];
        const startEnd = _this2[`${prefix}StartEnd${suffix}`] || base;
        const start = _this2[`${prefix}Start${suffix}`] || startEnd;
        const end = _this2[`${prefix}End${suffix}`] || start;

        if (!Object(utils_["n" /* isUndefined */])(base)) {
          attr.base[opt] = base;
        }

        if (!Object(utils_["n" /* isUndefined */])(start)) {
          attr.start[opt] = start;
        }

        if (!Object(utils_["n" /* isUndefined */])(end)) {
          attr.end[opt] = end;
        }
      });
      config.attr = attr;
    });
  }

  getConfig(prop, {
    color = this._config.color,
    isDark = this._config.isDark
  }) {
    if (!Object(utils_["e" /* has */])(this._config, prop)) return undefined;
    let propVal = Object(utils_["d" /* get */])(this._config, prop);

    if (Object(utils_["l" /* isObject */])(propVal) && Object(utils_["f" /* hasAny */])(propVal, ['light', 'dark'])) {
      propVal = isDark ? propVal.dark : propVal.light;
    }

    if (Object(utils_["m" /* isString */])(propVal)) {
      return propVal.replace(/{color}/g, color);
    }

    return propVal;
  }

  mergeTargets(to, from) {
    const config = {};
    Object(utils_["c" /* defaultsDeep */])(config, to, from); // Combine target classes together

    if (to.class && from.class && !to.class.includes(from.class)) {
      config.class = `${to.class} ${from.class}`;
    }

    return config;
  } // Normalizes attribute config to the structure defined by the properties


  normalizeAttr({
    config,
    type
  }) {
    var _this3 = this;

    let rootColor = this.color;
    let root = {}; // Get the normalized root config

    const normAttr = this.normalizedAttrs[type].attr;

    if (config === true || Object(utils_["m" /* isString */])(config)) {
      // Assign default color for booleans or strings
      rootColor = Object(utils_["m" /* isString */])(config) ? config : rootColor; // Set the default root

      root = theme_objectSpread({}, normAttr);
    } else if (Object(utils_["l" /* isObject */])(config)) {
      if (Object(utils_["f" /* hasAny */])(config, targetProps)) {
        // Mixin target configs
        root = theme_objectSpread({}, config);
      } else {
        // Mixin display configs
        root = {
          base: theme_objectSpread({}, config),
          start: theme_objectSpread({}, config),
          end: theme_objectSpread({}, config)
        };
      }
    } else {
      return null;
    } // Fill in missing targets


    Object(utils_["b" /* defaults */])(root, {
      start: root.startEnd,
      end: root.startEnd
    }, normAttr); // Normalize each target

    Object(utils_["u" /* toPairs */])(root).forEach(function ([targetType, targetConfig]) {
      let targetColor = rootColor;

      if (targetConfig === true || Object(utils_["m" /* isString */])(targetConfig)) {
        targetColor = Object(utils_["m" /* isString */])(targetConfig) ? targetConfig : targetColor;
        root[targetType] = {
          color: targetColor
        };
      } else if (Object(utils_["l" /* isObject */])(targetConfig)) {
        if (Object(utils_["f" /* hasAny */])(targetConfig, displayProps)) {
          root[targetType] = theme_objectSpread({}, targetConfig);
        } else {
          root[targetType] = {};
        }
      } // Fill in missing options


      root[targetType] = _this3.mergeTargets(root[targetType], normAttr[targetType]); // Set the theme color if it is missing

      if (!Object(utils_["e" /* has */])(root, `${targetType}.color`)) {
        Object(utils_["s" /* set */])(root, `${targetType}.color`, targetColor);
      }
    });
    return root;
  }

  getHighlightBgClass(fillMode, config = this._config) {
    switch (fillMode) {
      case 'none':
        return this.getConfig('bgLow', config);

      case 'light':
        return this.getConfig('bgAccentLow', config);

      case 'solid':
        return this.getConfig('bgAccentHigh', config);

      default:
        return '';
    }
  }

  getHighlightContentClass(fillMode, config = this._config) {
    switch (fillMode) {
      case 'none':
        return this.getConfig('contentAccent', config);

      case 'light':
        return this.getConfig('contentAccent', config);

      case 'solid':
        return this.getConfig('contentAccentContrast', config);

      default:
        return '';
    }
  }

  normalizeHighlight(config) {
    var _this4 = this;

    const highlight = this.normalizeAttr({
      config,
      type: 'highlight'
    });
    Object(utils_["u" /* toPairs */])(highlight).forEach(function ([_, targetConfig]) {
      const {
        fillMode
      } = Object(utils_["b" /* defaults */])(targetConfig, {
        isDark: _this4.isDark,
        color: _this4.color
      });
      concatClass(targetConfig, 'class', _this4.getHighlightBgClass(fillMode, targetConfig));
      concatClass(targetConfig, 'contentClass', _this4.getHighlightContentClass(fillMode, targetConfig));
    });
    return highlight;
  }

  normalizeDot(config) {
    var _this5 = this;

    const dot = this.normalizeAttr({
      config,
      type: 'dot'
    });
    Object(utils_["u" /* toPairs */])(dot).forEach(function ([_, targetConfig]) {
      Object(utils_["b" /* defaults */])(targetConfig, {
        isDark: _this5.isDark,
        color: _this5.color
      });
      concatClass(targetConfig, 'class', _this5.getConfig('bgAccentHigh', targetConfig));
    });
    return dot;
  }

  normalizeBar(config) {
    var _this6 = this;

    const bar = this.normalizeAttr({
      config,
      type: 'bar'
    });
    Object(utils_["u" /* toPairs */])(bar).forEach(function ([_, targetConfig]) {
      Object(utils_["b" /* defaults */])(targetConfig, {
        isDark: _this6.isDark,
        color: _this6.color
      });
      concatClass(targetConfig, 'class', _this6.getConfig('bgAccentHigh', targetConfig));
    });
    return bar;
  }

  normalizeContent(config) {
    var _this7 = this;

    const content = this.normalizeAttr({
      config,
      type: 'content'
    });
    Object(utils_["u" /* toPairs */])(content).forEach(function ([_, targetConfig]) {
      Object(utils_["b" /* defaults */])(targetConfig, {
        isDark: _this7.isDark,
        color: _this7.color
      });
      concatClass(targetConfig, 'class', _this7.getConfig('contentAccent', targetConfig));
    });
    return content;
  }

}
// EXTERNAL MODULE: ./src/utils/locale.js + 1 modules
var locale = __webpack_require__("29ae");

// EXTERNAL MODULE: ./src/utils/screens.js + 1 modules
var screens = __webpack_require__("1315");

// EXTERNAL MODULE: ./src/utils/attribute.js
var utils_attribute = __webpack_require__("22f3");

// CONCATENATED MODULE: ./src/utils/mixins/root.js








const rootMixin = {
  mixins: [defaults["a" /* defaultsMixin */], popoversMixin],
  props: {
    color: String,
    isDark: Boolean,
    theme: Object,
    firstDayOfWeek: Number,
    masks: Object,
    locale: [String, Object],
    minDate: null,
    maxDate: null,
    disabledDates: null,
    availableDates: null
  },
  computed: {
    $theme() {
      // Return the theme prop if it is an instance of the Theme class
      if (this.theme instanceof theme_Theme) return this.theme; // Merge the default theme with the provided theme

      const config = Object(utils_["c" /* defaultsDeep */])(this.theme, this.$defaults.theme); // Merge in the color and isDark props if they were specifically provided

      config.color = this.passedProp('color', config.color);
      config.isDark = this.passedProp('isDark', config.isDark); // Create the theme

      return new theme_Theme(config);
    },

    $locale() {
      // Return the locale prop if it is an instance of the Locale class
      if (this.locale instanceof locale["a" /* default */]) return this.locale; // Build up a base config from component props

      const config = Object(utils_["l" /* isObject */])(this.locale) ? this.locale : {
        id: this.locale,
        firstDayOfWeek: this.firstDayOfWeek,
        masks: this.masks
      }; // Return new locale

      return new locale["a" /* default */](config, this.$locales);
    },

    format() {
      var _this = this;

      return function (date, mask) {
        return _this.$locale ? _this.$locale.format(date, mask) : '';
      };
    },

    disabledAttribute() {
      // Build up a complete list of disabled dates
      let dates = []; // Initialize with disabled dates prop, if any

      if (this.disabledDates) {
        dates = Object(utils_["h" /* isArray */])(this.disabledDates) ? this.disabledDates : [this.disabledDates];
      } // Add disabled dates for minDate and maxDate props


      const minDate = this.$locale.toDate(this.minDate);
      const maxDate = this.$locale.toDate(this.maxDate);

      if (minDate) {
        dates.push({
          start: null,
          end: Object(addDays["a" /* default */])(minDate, -1)
        });
      }

      if (maxDate) {
        dates.push({
          start: Object(addDays["a" /* default */])(maxDate, 1),
          end: null
        });
      } // Return the new disabled attribute


      return new utils_attribute["a" /* default */]({
        key: 'disabled',
        dates,
        excludeDates: this.availableDates,
        excludeMode: 'includes',
        order: 100
      }, this.$theme, this.$locale);
    }

  },

  created() {
    Object(screens["a" /* setupScreens */])(this.$defaults.screens);
  }

};
// CONCATENATED MODULE: ./src/utils/mixins/propOrDefault.js

const propOrDefaultMixin = {
  methods: {
    propOrDefault(prop, defaultPath, strategy) {
      return this.passedProp(prop, Object(utils_["d" /* get */])(this.$defaults, defaultPath), strategy);
    },

    passedProp(prop, fallback, strategy) {
      if (Object(utils_["e" /* has */])(this.$options.propsData, prop)) {
        const propValue = this[prop];

        if (Object(utils_["l" /* isObject */])(propValue) && strategy === 'merge') {
          return Object(utils_["c" /* defaultsDeep */])(propValue, fallback);
        }

        return propValue;
      }

      return fallback;
    }

  }
};
// CONCATENATED MODULE: ./src/utils/mixins/safeScopedSlot.js

const safeScopedSlotMixin = {
  methods: {
    safeScopedSlot(name, args, def = null) {
      return Object(utils_["j" /* isFunction */])(this.$scopedSlots[name]) ? this.$scopedSlots[name](args) : def;
    }

  }
};
// CONCATENATED MODULE: ./src/utils/mixins/index.js




const mixins_childMixin = childMixin;
const mixins_rootMixin = rootMixin;
const mixins_propOrDefaultMixin = propOrDefaultMixin;
const mixins_safeScopedSlotMixin = safeScopedSlotMixin;
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/PopoverRow.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var PopoverRowvue_type_script_lang_js_ = ({
  name: 'PopoverRow',
  mixins: [mixins_childMixin],
  props: {
    attribute: Object
  },
  computed: {
    indicator() {
      const {
        highlight,
        dot,
        bar,
        content,
        popover
      } = this.attribute;
      if (popover && popover.hideIndicator) return null;

      if (highlight) {
        const {
          color,
          isDark
        } = highlight.start;
        return {
          class: this.theme.getConfig('bgAccentHigh', {
            color,
            isDark: !isDark
          }),
          style: {
            width: '10px',
            height: '5px',
            borderRadius: '3px'
          }
        };
      }

      if (dot) {
        const {
          color,
          isDark
        } = dot.start;
        return {
          class: this.theme.getConfig('bgAccentHigh', {
            color,
            isDark: !isDark
          }),
          style: {
            width: '5px',
            height: '5px',
            borderRadius: '50%'
          }
        };
      }

      if (bar) {
        const {
          color,
          isDark
        } = bar.start;
        return {
          class: this.theme.getConfig('bgAccentHigh', {
            color,
            isDark: !isDark
          }),
          style: {
            width: '10px',
            height: '3px'
          }
        };
      }

      if (content) {
        const {
          color,
          isDark
        } = content.start;
        return {
          class: this.theme.getConfig('contentContrast', {
            color,
            isDark: !isDark
          })
        };
      }

      return null;
    }

  }
});
// CONCATENATED MODULE: ./src/components/PopoverRow.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_PopoverRowvue_type_script_lang_js_ = (PopoverRowvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/PopoverRow.vue?vue&type=style&index=0&id=28ced894&lang=postcss&scoped=true&
var PopoverRowvue_type_style_index_0_id_28ced894_lang_postcss_scoped_true_ = __webpack_require__("7365");

// CONCATENATED MODULE: ./src/components/PopoverRow.vue






/* normalize component */

var PopoverRow_component = normalizeComponent(
  components_PopoverRowvue_type_script_lang_js_,
  PopoverRowvue_type_template_id_28ced894_scoped_true_render,
  PopoverRowvue_type_template_id_28ced894_scoped_true_staticRenderFns,
  false,
  null,
  "28ced894",
  null
  
)

/* harmony default export */ var PopoverRow = (PopoverRow_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js&
const directions = {
  vLeading: 'vertical-leading',
  vTrailing: 'vertical-trailing',
  hLeading: 'horizontal-leading',
  hTrailing: 'horizontal-trailing'
};
/* harmony default export */ var Gridvue_type_script_lang_js_ = ({
  name: 'Grid',

  render(h) {
    var _this = this;

    // Grid cell renderer
    const getCell = function getCell({
      nodes,
      position,
      row,
      column
    }) {
      // Get the default slot first
      if (nodes.length >= position) {
        return nodes[position - 1];
      } // Get the scoped slot second


      if (_this.$scopedSlots.default) {
        return _this.$scopedSlots.default({
          position,
          row,
          column
        });
      }

      return null;
    }; // Grid cells renderer


    const getCells = function getCells() {
      const cells = []; // Resolve default slot nodes (remove whitespaced)

      const nodes = _this.$slots.default && _this.$slots.default.filter(function (n) {
        return n.tag !== undefined;
      }) || []; // Build cells

      for (let r = 1, p = 1; r <= _this.rows; r++) {
        for (let c = 1; c <= _this.columns; c++) {
          const rFromEnd = r - _this.rows - 1;
          const cFromEnd = c - _this.columns - 1; // Add the cell for current row & column

          cells.push(h('div', {
            class: ['vc-grid-cell', `vc-grid-cell-row-${r}`, `vc-grid-cell-row-${rFromEnd}`, `vc-grid-cell-col-${c}`, `vc-grid-cell-col-${cFromEnd}`],
            style: {
              'grid-row': r,
              'grid-column': c
            },
            on: {
              keydown: function keydown(e) {
                return _this.handleCellKeydown({
                  row: r,
                  column: c,
                  event: e
                });
              }
            }
          }, [getCell({
            nodes,
            position: p++,
            row: r,
            column: c
          })]));
        }
      }

      return cells;
    };

    return h('div', {
      class: 'vc-grid-container',
      style: this.containerStyle
    }, [...getCells()]);
  },

  props: {
    count: Number,
    rows: {
      type: Number,
      default: 1
    },
    columns: {
      type: Number,
      default: 1
    },
    gap: {
      type: String,
      default: '0px'
    },
    autofit: Boolean,
    columnWidth: {
      type: String,
      default: '1fr'
    },
    disableFocus: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerStyle() {
      return {
        gridTemplateColumns: this.gridTemplateColumns,
        gridGap: this.gap
      };
    },

    gridTemplateColumns() {
      return `repeat(${this.autofit ? 'auto-fit' : this.columns}, ${this.columnWidth})`;
    }

  },
  methods: {
    handleCellKeydown({
      row,
      column,
      event
    }) {
      // Return if focus management is disabled
      if (this.disableFocus) return;
      const state = {
        row,
        column,
        alt: false,
        handled: false
      }; // Increment row/column based on key

      switch (event.key) {
        case 'ArrowUp':
          {
            state.row--;
            break;
          }

        case 'ArrowDown':
          {
            state.row++;
            break;
          }

        case 'ArrowLeft':
          {
            state.column--;
            break;
          }

        case 'ArrowRight':
          {
            state.column++;
            break;
          }

        case 'Home':
          {
            state.column = 1;
            break;
          }

        case 'End':
          {
            state.column = this.columns;
            break;
          }

        case 'PageUp':
          {
            state.alt = event.altKey;
            state.direction = directions.vLeading;
            break;
          }

        case 'PageDown':
          {
            state.alt = event.altKey;
            state.direction = directions.vTrailing;
            break;
          }

        default:
          {
            return;
          }
      } // Handle state for row rollovers


      if (state.row < 1) {
        state.direction = directions.vLeading;
        state.row = this.rows;
      } else if (state.row > this.rows) {
        state.direction = directions.vTrailing;
        state.row = 1;
      } // Handle state for column rollovers


      if (state.column < 1) {
        state.direction = directions.hLeading;
        state.column = this.columns;
      } else if (state.column > this.columns) {
        state.direction = directions.hTrailing;
        state.column = 1;
      } // Emit rollover event if direction was assigned


      if (state.direction) {
        this.$emit('rollover', state);
      } // Focusd on cell for current state if event wasn't handled


      if (!state.handled) {
        // Get grid cell element
        const cellSelector = `.vc-grid-cell-row-${state.row}.vc-grid-cell-col-${state.column}`;
        const cellEl = this.$el.querySelector(cellSelector);

        if (cellEl) {
          this.tryFocus(cellEl);
        }
      }

      event.stopPropagation();
      event.preventDefault();
    },

    tryFocus(el = this.$el) {
      this.$nextTick(function () {
        const selectors = ['.vc-grid-focus', 'button, [href], input, select, textarea, [tabindex="0"]', '[tabindex]:not([tabindex="undefined"])'];
        const focusableEl = selectors.map(function (s) {
          return el.querySelector(s);
        }).find(function (e) {
          return e;
        });

        if (focusableEl) {
          focusableEl.focus();
          return true;
        }

        return false;
      });
    }

  }
});
// CONCATENATED MODULE: ./src/components/Grid.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Gridvue_type_script_lang_js_ = (Gridvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Grid.vue?vue&type=style&index=0&id=3ca35a05&scoped=true&lang=css&
var Gridvue_type_style_index_0_id_3ca35a05_scoped_true_lang_css_ = __webpack_require__("998b");

// CONCATENATED MODULE: ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns





/* normalize component */

var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js_,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  "3ca35a05",
  null
  
)

/* harmony default export */ var Grid = (Grid_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/PopoverRef.vue?vue&type=script&lang=js&


/* harmony default export */ var PopoverRefvue_type_script_lang_js_ = ({
  name: 'PopoverRef',
  mixins: [popoversMixin],
  props: {
    id: {
      type: String,
      default: 'default'
    },
    element: null,
    args: null,
    visibility: {
      type: String,
      default: 'hover-focus',
      validator: function validator(value) {
        return ['hover-focus', 'hover', 'focus', 'click', 'visible', 'hidden'].indexOf(value) !== -1;
      }
    },
    placement: {
      type: String,
      default: 'bottom'
    },
    positionFixed: Boolean,
    modifiers: {
      type: Object,
      default: function _default() {}
    },
    isInteractive: Boolean,
    showDelay: {
      type: Number,
      default: 10
    },
    hideDelay: {
      type: Number,
      default: 150
    }
  },

  data() {
    return {
      reference: null,
      isHovered: false,
      isFocused: false
    };
  },

  computed: {
    isActive() {
      return this.$popoverIsActive(this.id, this.reference);
    }

  },

  render() {
    return this.$slots.default[0];
  },

  watch: {
    visibility() {
      this.refreshVisibility();
    },

    args() {
      var _this = this;

      this.$nextTick(function () {
        if (_this.isActive) {
          _this.update();
        }
      });
    }

  },

  mounted() {
    var _this2 = this;

    this.reference = this.element || this.$slots.default[0].elm;
    this.addEvents();
    this.$once('beforeDestroy', function () {
      return _this2.removeEvents();
    });
    this.refreshVisibility();
  },

  methods: {
    addEvents() {
      Object(helpers["n" /* on */])(this.reference, 'click', this.onClick);
      Object(helpers["n" /* on */])(this.reference, 'mouseover', this.onMouseOver);
      Object(helpers["n" /* on */])(this.reference, 'mouseleave', this.onMouseLeave);
      Object(helpers["n" /* on */])(this.reference, 'focusin', this.onFocusIn);
      Object(helpers["n" /* on */])(this.reference, 'focusout', this.onFocusOut); // on(this.reference, 'blur', this.onFocusOut);
    },

    removeEvents() {
      Object(helpers["m" /* off */])(this.reference, 'click', this.onClick);
      Object(helpers["m" /* off */])(this.reference, 'mouseover', this.onMouseOver);
      Object(helpers["m" /* off */])(this.reference, 'mouseleave', this.onMouseLeave);
      Object(helpers["m" /* off */])(this.reference, 'focusin', this.onFocusIn);
      Object(helpers["m" /* off */])(this.reference, 'focusout', this.onFocusOut); // off(this.reference, 'blur', this.onFocusOut);
    },

    onClick() {
      if (this.visibility === 'click') {
        this.toggle();
      }
    },

    onMouseOver() {
      if (!this.isHovered) {
        this.isHovered = true;

        if (this.visibility.includes('hover')) {
          this.refreshVisibility();
        }
      }
    },

    onMouseLeave() {
      if (this.isHovered) {
        this.isHovered = false;

        if (this.visibility === 'hover' || this.visibility === 'hover-focus' && !this.isFocused) {
          this.refreshVisibility();
        }
      }
    },

    onFocusIn() {
      if (!this.isFocused) {
        this.isFocused = true;

        if (this.visibility.includes('focus')) {
          this.refreshVisibility();
        }
      }
    },

    onFocusOut(e) {
      if (this.isFocused && !Object(helpers["e" /* elementContains */])(this.reference, e.relatedTarget)) {
        this.isFocused = false;

        if (this.visibility.includes('focus')) {
          this.refreshVisibility();
        }
      }
    },

    refreshVisibility() {
      switch (this.visibility) {
        case 'hover':
          if (this.isHovered) {
            this.show();
          } else if (this.isActive) {
            this.hide();
          }

          break;

        case 'focus':
          if (this.isFocused) {
            this.show();
          } else if (this.isActive) {
            this.hide();
          }

          break;

        case 'hover-focus':
          if (this.isHovered || this.isFocused) {
            this.show({
              visibility: this.isFocused ? 'focus' : 'hover'
            });
          } else if (this.isActive) {
            this.hide();
          }

          break;

        case 'visible':
          this.show();
          break;

        case 'hidden':
          if (this.isActive) {
            this.hide();
          }

          break;
      }
    },

    toggle() {
      var _this3 = this;

      if (this.isActive) {
        this.hide();
      } else {
        this.$nextTick(function () {
          _this3.show();
        });
      }
    },

    show({
      visibility
    } = {}) {
      this.$showPopover({
        id: this.id,
        ref: this.reference,
        args: this.args,
        visibility: visibility || this.visibility,
        placement: this.placement,
        positionFixed: this.positionFixed,
        modifiers: this.modifiers,
        isInteractive: this.isInteractive,
        delay: this.showDelay
      });
    },

    hide({
      delay = this.hideDelay
    } = {}) {
      this.$hidePopover({
        id: this.id,
        ref: this.reference,
        delay
      });
    },

    update() {
      this.$updatePopover({
        id: this.id,
        ref: this.reference,
        args: this.args
      });
    }

  }
});
// CONCATENATED MODULE: ./src/components/PopoverRef.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_PopoverRefvue_type_script_lang_js_ = (PopoverRefvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/PopoverRef.vue
var PopoverRef_render, PopoverRef_staticRenderFns




/* normalize component */

var PopoverRef_component = normalizeComponent(
  components_PopoverRefvue_type_script_lang_js_,
  PopoverRef_render,
  PopoverRef_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var PopoverRef = (PopoverRef_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"52886563-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalendarNav.vue?vue&type=template&id=f5c8bd24&
var CalendarNavvue_type_template_id_f5c8bd24_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-nav-container"},[_c('grid',{ref:"headerGrid",attrs:{"columns":3},on:{"rollover":_vm.onHeaderRollover}},[_c('span',{ref:"prevButton",staticClass:"vc-nav-arrow vc-flex vc-justify-center vc-items-center vc-mr-auto",class:_vm.theme.navArrows,attrs:{"role":"button","tabindex":"-1"},on:{"click":_vm.movePrev,"keydown":function (e) { return _vm.onSpaceOrEnter(e, _vm.movePrev); }}},[_vm._t("nav-left-button",[_c('svg-icon',{attrs:{"name":"left-arrow","width":"20px","height":"24px"}})])],2),_c('span',{ref:"titleButton",staticClass:"vc-nav-title vc-grid-focus",class:_vm.theme.navTitle,style:({ whiteSpace: 'nowrap' }),attrs:{"role":"button","tabindex":"0"},on:{"click":_vm.toggleMode,"keydown":function (e) { return _vm.onSpaceOrEnter(e, _vm.toggleMode); }}},[_vm._v("\n      "+_vm._s(_vm.title)+"\n    ")]),_c('span',{ref:"nextButton",staticClass:"vc-nav-arrow vc-flex vc-justify-center vc-items-center vc-ml-auto",class:_vm.theme.navArrows,attrs:{"role":"button","tabindex":"-1"},on:{"click":_vm.moveNext,"keydown":function (e) { return _vm.onSpaceOrEnter(e, _vm.moveNext); }}},[_vm._t("nav-right-button",[_c('svg-icon',{attrs:{"name":"right-arrow","width":"20px","height":"24px"}})])],2)]),_c('grid',{ref:"itemsGrid",attrs:{"rows":4,"columns":3,"gap":"2px 5px"},on:{"rollover":_vm.onItemsRollover}},_vm._l((_vm.activeItems),function(item){return _c('span',{key:item.label,ref:"items",refInFor:true,class:_vm.getItemClasses(item),attrs:{"role":"button","aria-label":item.ariaLabel,"tabindex":item.isDisabled ? undefined : item.isActive ? 0 : -1},on:{"click":item.click,"keydown":function (e) { return _vm.onSpaceOrEnter(e, item.click); }}},[_vm._v("\n      "+_vm._s(item.label)+"\n    ")])}),0)],1)}
var CalendarNavvue_type_template_id_f5c8bd24_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CalendarNav.vue?vue&type=template&id=f5c8bd24&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"52886563-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SvgIcon.vue?vue&type=template&id=63f7b5ec&scoped=true&
var SvgIconvue_type_template_id_63f7b5ec_scoped_true_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('svg',_vm._g({staticClass:"vc-svg-icon",attrs:{"width":_vm.width,"height":_vm.height,"viewBox":_vm.viewBox}},_vm.$listeners),[_c('path',{attrs:{"d":_vm.path}})])}
var SvgIconvue_type_template_id_63f7b5ec_scoped_true_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/SvgIcon.vue?vue&type=template&id=63f7b5ec&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/SvgIcon.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
const _defSize = '26px';
const _defViewBox = '0 0 32 32';
const icons = {
  'left-arrow': {
    viewBox: '0 -1 16 34',
    path: 'M11.196 10c0 0.143-0.071 0.304-0.179 0.411l-7.018 7.018 7.018 7.018c0.107 0.107 0.179 0.268 0.179 0.411s-0.071 0.304-0.179 0.411l-0.893 0.893c-0.107 0.107-0.268 0.179-0.411 0.179s-0.304-0.071-0.411-0.179l-8.321-8.321c-0.107-0.107-0.179-0.268-0.179-0.411s0.071-0.304 0.179-0.411l8.321-8.321c0.107-0.107 0.268-0.179 0.411-0.179s0.304 0.071 0.411 0.179l0.893 0.893c0.107 0.107 0.179 0.25 0.179 0.411z'
  },
  'right-arrow': {
    viewBox: '-5 -1 16 34',
    path: 'M10.625 17.429c0 0.143-0.071 0.304-0.179 0.411l-8.321 8.321c-0.107 0.107-0.268 0.179-0.411 0.179s-0.304-0.071-0.411-0.179l-0.893-0.893c-0.107-0.107-0.179-0.25-0.179-0.411 0-0.143 0.071-0.304 0.179-0.411l7.018-7.018-7.018-7.018c-0.107-0.107-0.179-0.268-0.179-0.411s0.071-0.304 0.179-0.411l0.893-0.893c0.107-0.107 0.268-0.179 0.411-0.179s0.304 0.071 0.411 0.179l8.321 8.321c0.107 0.107 0.179 0.268 0.179 0.411z'
  }
};
/* harmony default export */ var SvgIconvue_type_script_lang_js_ = ({
  props: ['name'],

  data() {
    return {
      width: _defSize,
      height: _defSize,
      viewBox: _defViewBox,
      path: '',
      isBaseline: false
    };
  },

  mounted() {
    this.updateIcon();
  },

  watch: {
    name() {
      this.updateIcon();
    }

  },
  methods: {
    updateIcon() {
      const icon = icons[this.name];

      if (icon) {
        this.width = icon.width || _defSize;
        this.height = icon.height || _defSize;
        this.viewBox = icon.viewBox;
        this.path = icon.path;
      }
    }

  }
});
// CONCATENATED MODULE: ./src/components/SvgIcon.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_SvgIconvue_type_script_lang_js_ = (SvgIconvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/SvgIcon.vue?vue&type=style&index=0&id=63f7b5ec&lang=postcss&scoped=true&
var SvgIconvue_type_style_index_0_id_63f7b5ec_lang_postcss_scoped_true_ = __webpack_require__("9010");

// CONCATENATED MODULE: ./src/components/SvgIcon.vue






/* normalize component */

var SvgIcon_component = normalizeComponent(
  components_SvgIconvue_type_script_lang_js_,
  SvgIconvue_type_template_id_63f7b5ec_scoped_true_render,
  SvgIconvue_type_template_id_63f7b5ec_scoped_true_staticRenderFns,
  false,
  null,
  "63f7b5ec",
  null
  
)

/* harmony default export */ var SvgIcon = (SvgIcon_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalendarNav.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





const _yearGroupCount = 12;
/* harmony default export */ var CalendarNavvue_type_script_lang_js_ = ({
  name: 'CalendarNav',
  components: {
    Grid: Grid,
    SvgIcon: SvgIcon
  },
  mixins: [mixins_childMixin],
  props: {
    value: {
      type: Object,
      default: function _default() {
        return {
          month: 0,
          year: 0
        };
      }
    },
    validator: {
      type: Function,
      default: function _default() {
        return function () {
          return true;
        };
      }
    }
  },

  data() {
    return {
      monthMode: true,
      yearIndex: 0,
      yearGroupIndex: 0,
      onSpaceOrEnter: helpers["o" /* onSpaceOrEnter */]
    };
  },

  computed: {
    month() {
      return this.value ? this.value.month || 0 : 0;
    },

    year() {
      return this.value ? this.value.year || 0 : 0;
    },

    title() {
      return this.monthMode ? this.yearIndex : `${this.firstYear} - ${this.lastYear}`;
    },

    monthItems() {
      var _this = this;

      const {
        month: thisMonth,
        year: thisYear
      } = Object(helpers["p" /* pageForDate */])(new Date());
      return this.locale.getMonthDates().map(function (d, i) {
        const month = i + 1;
        return {
          label: _this.locale.format(d, _this.masks.navMonths),
          ariaLabel: _this.locale.format(d, 'MMMM YYYY'),
          isActive: month === _this.month && _this.yearIndex === _this.year,
          isCurrent: month === thisMonth && _this.yearIndex === thisYear,
          isDisabled: !_this.validator({
            month,
            year: _this.yearIndex
          }),
          click: function click() {
            return _this.monthClick(month);
          }
        };
      });
    },

    yearItems() {
      var _this2 = this;

      const {
        _,
        year: thisYear
      } = Object(helpers["p" /* pageForDate */])(new Date());
      const startYear = this.yearGroupIndex * _yearGroupCount;
      const endYear = startYear + _yearGroupCount;
      const items = [];

      for (let year = startYear; year < endYear; year += 1) {
        items.push({
          year,
          label: year,
          ariaLabel: year,
          isActive: year === this.year,
          isCurrent: year === thisYear,
          isDisabled: !this.validator({
            month: this.month,
            year
          }),
          click: function click() {
            return _this2.yearClick(year);
          }
        });
      }

      return items;
    },

    activeItems() {
      return this.monthMode ? this.monthItems : this.yearItems;
    },

    firstYear() {
      return Object(utils_["g" /* head */])(this.yearItems.map(function (i) {
        return i.year;
      }));
    },

    lastYear() {
      return Object(utils_["o" /* last */])(this.yearItems.map(function (i) {
        return i.year;
      }));
    }

  },
  watch: {
    year() {
      this.yearIndex = this.year;
    },

    yearIndex(val) {
      this.yearGroupIndex = this.getYearGroupIndex(val);
    }

  },

  created() {
    this.yearIndex = this.year;
  },

  mounted() {
    this.$refs.itemsGrid.tryFocus();
  },

  methods: {
    getItemClasses({
      isActive,
      isCurrent,
      isDisabled
    }) {
      const classes = [this.theme.navCell];

      if (isActive) {
        classes.push(this.theme.navCellActive, 'vc-grid-focus');
      } else if (isCurrent) {
        classes.push(this.theme.navCellInactiveCurrent);
      } else {
        classes.push(this.theme.navCellInactive);
      }

      if (isDisabled) {
        classes.push('vc-opacity-25 vc-pointer-events-none');
      }

      return classes;
    },

    getYearGroupIndex(year) {
      return Math.floor(year / _yearGroupCount);
    },

    monthClick(month) {
      this.$emit('input', {
        month,
        year: this.yearIndex
      });
    },

    yearClick(year) {
      this.yearIndex = year;
      this.monthMode = true;
      this.$refs.itemsGrid.tryFocus();
    },

    toggleMode() {
      this.monthMode = !this.monthMode;
    },

    movePrev() {
      if (this.monthMode) {
        this.movePrevYear();
      }

      this.movePrevYearGroup();
    },

    moveNext() {
      if (this.monthMode) {
        this.moveNextYear();
      }

      this.moveNextYearGroup();
    },

    movePrevYear() {
      this.yearIndex--;
    },

    moveNextYear() {
      this.yearIndex++;
    },

    movePrevYearGroup() {
      this.yearGroupIndex--;
    },

    moveNextYearGroup() {
      this.yearGroupIndex++;
    },

    onHeaderRollover(e) {
      switch (e.direction) {
        case 'vertical-trailing':
          this.$refs.itemsGrid.tryFocus();
          break;
      }

      e.handled = true;
    },

    onItemsRollover(e) {
      switch (e.direction) {
        case 'horizontal-leading':
          {
            this.movePrev();
            break;
          }

        case 'horizontal-trailing':
          {
            this.moveNext();
            break;
          }

        case 'vertical-leading':
          {
            this.$refs.headerGrid.tryFocus();
            e.handled = true;
            break;
          }

        case 'vertical-trailing':
          {
            e.handled = true;
            break;
          }
      }
    }

  }
});
// CONCATENATED MODULE: ./src/components/CalendarNav.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CalendarNavvue_type_script_lang_js_ = (CalendarNavvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/CalendarNav.vue





/* normalize component */

var CalendarNav_component = normalizeComponent(
  components_CalendarNavvue_type_script_lang_js_,
  CalendarNavvue_type_template_id_f5c8bd24_render,
  CalendarNavvue_type_template_id_f5c8bd24_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var CalendarNav = (CalendarNav_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalendarDay.vue?vue&type=script&lang=js&



function CalendarDayvue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function CalendarDayvue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { CalendarDayvue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { CalendarDayvue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





/* harmony default export */ var CalendarDayvue_type_script_lang_js_ = ({
  name: 'CalendarDay',
  mixins: [mixins_childMixin, mixins_safeScopedSlotMixin],

  render(h) {
    var _this = this;

    // Backgrounds layer
    const backgroundsLayer = function backgroundsLayer() {
      return _this.hasBackgrounds && h('div', {
        class: 'vc-highlights vc-day-layer'
      }, _this.backgrounds.map(function ({
        key,
        wrapperClass,
        class: bgClass
      }) {
        return h('div', {
          key,
          class: wrapperClass
        }, [h('div', {
          class: bgClass
        })]);
      }));
    }; // Content layer


    const contentLayer = function contentLayer() {
      return _this.safeScopedSlot('day-content', {
        day: _this.day,
        attributes: _this.day.attributes,
        attributesMap: _this.day.attributesMap,
        dayProps: _this.dayContentProps,
        dayEvents: _this.dayContentEvents
      }) || h('span', {
        class: _this.dayContentClass,
        attrs: CalendarDayvue_type_script_lang_js_objectSpread({}, _this.dayContentProps),
        on: _this.dayContentEvents,
        ref: 'content'
      }, [_this.day.label]);
    }; // Popover content wrapper


    const contentWrapperLayer = function contentWrapperLayer() {
      if (!_this.hasPopovers) {
        return contentLayer();
      }

      const {
        visibility,
        placement,
        isInteractive
      } = _this.popoverState;
      return h(PopoverRef, {
        props: {
          id: _this.dayPopoverId,
          args: _this.dayEvent,
          visibility,
          placement,
          isInteractive
        }
      }, [contentLayer()]);
    }; // Dots layer


    const dotsLayer = function dotsLayer() {
      return _this.hasDots && h('div', {
        class: 'vc-day-layer vc-day-box-center-bottom'
      }, [h('div', {
        class: 'vc-dots'
      }, _this.dots.map(function ({
        key,
        class: bgClass
      }) {
        return h('span', {
          class: bgClass,
          key
        });
      }))]);
    }; // Bars layer


    const barsLayer = function barsLayer() {
      return _this.hasBars && h('div', {
        class: 'vc-day-layer vc-day-box-center-bottom'
      }, [h('div', {
        class: 'vc-bars'
      }, _this.bars.map(function ({
        key,
        class: bgClass
      }) {
        return h('span', {
          class: bgClass,
          key
        });
      }))]);
    }; // Root layer


    return h('div', {
      class: ['vc-day', ...this.day.classes, {
        'vc-day-box-center-center': !this.$scopedSlots['day-content']
      }]
    }, [h('div', {
      class: ['vc-h-full', {
        [this.theme.dayNotInMonth]: !this.inMonth
      }]
    }, [backgroundsLayer(), contentWrapperLayer(), dotsLayer(), barsLayer()])]);
  },

  inject: ['sharedState'],
  props: {
    day: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      glyphs: {},
      popoverState: {}
    };
  },

  computed: {
    label() {
      return this.day.label;
    },

    dateTime() {
      return this.day.dateTime;
    },

    inMonth() {
      return this.day.inMonth;
    },

    isDisabled() {
      return this.day.isDisabled;
    },

    backgrounds() {
      return this.glyphs.backgrounds;
    },

    hasBackgrounds() {
      return !!Object(helpers["b" /* arrayHasItems */])(this.backgrounds);
    },

    content() {
      return this.glyphs.content;
    },

    dots() {
      return this.glyphs.dots;
    },

    hasDots() {
      return !!Object(helpers["b" /* arrayHasItems */])(this.dots);
    },

    bars() {
      return this.glyphs.bars;
    },

    hasBars() {
      return !!Object(helpers["b" /* arrayHasItems */])(this.bars);
    },

    popovers() {
      return this.glyphs.popovers;
    },

    hasPopovers() {
      return !!Object(helpers["b" /* arrayHasItems */])(this.popovers);
    },

    dayContentClass() {
      return ['vc-day-content vc-focusable', Object(utils_["d" /* get */])(Object(utils_["o" /* last */])(this.content), 'class') || '', this.isDisabled ? this.theme.dayContentDisabled : '', this.theme.isDark ? 'vc-is-dark' : '', this.theme.dayContent];
    },

    dayContentProps() {
      let tabindex;

      if (this.day.isFocusable) {
        tabindex = '0';
      } else if (this.day.inMonth) {
        tabindex = '-1';
      }

      return {
        tabindex,
        'aria-label': this.day.ariaLabel
      };
    },

    dayContentEvents() {
      return {
        click: this.click,
        mouseenter: this.mouseenter,
        mouseleave: this.mouseleave,
        focusin: this.focusin,
        focusout: this.focusout,
        keydown: this.keydown
      };
    },

    dayEvent() {
      return CalendarDayvue_type_script_lang_js_objectSpread(CalendarDayvue_type_script_lang_js_objectSpread({}, this.day), {}, {
        el: this.$refs.content,
        popovers: this.popovers
      });
    }

  },
  watch: {
    theme() {
      this.refresh();
    },

    popovers() {
      const visibilities = ['click', 'focus', 'hover', 'visible'];
      let placement = '';
      let isInteractive = false;
      let vIdx = -1;
      this.popovers.forEach(function (p) {
        const vNew = visibilities.indexOf(p.visibility);
        vIdx = vNew > vIdx ? vNew : vIdx;
        placement = placement || p.placement;
        isInteractive = isInteractive || p.isInteractive;
      });
      this.popoverState = {
        visibility: vIdx >= 0 ? visibilities[vIdx] : 'hidden',
        placement: placement || 'bottom',
        isInteractive
      };
    }

  },
  methods: {
    getDayEvent(origEvent) {
      return CalendarDayvue_type_script_lang_js_objectSpread(CalendarDayvue_type_script_lang_js_objectSpread({}, this.dayEvent), {}, {
        event: origEvent
      });
    },

    click(e) {
      this.$emit('dayclick', this.getDayEvent(e));
    },

    mouseenter(e) {
      this.$emit('daymouseenter', this.getDayEvent(e));
    },

    mouseleave(e) {
      this.$emit('daymouseleave', this.getDayEvent(e));
    },

    focusin(e) {
      this.$emit('dayfocusin', this.getDayEvent(e));
    },

    focusout(e) {
      this.$emit('dayfocusout', this.getDayEvent(e));
    },

    keydown(e) {
      this.$emit('daykeydown', this.getDayEvent(e));
    },

    refresh() {
      var _this2 = this;

      if (!this.day.refresh) return;
      this.day.refresh = false;
      const glyphs = {
        backgrounds: [],
        dots: [],
        bars: [],
        popovers: [],
        content: []
      };
      this.day.attributes = Object.values(this.day.attributesMap || {}).sort(function (a, b) {
        return a.order - b.order;
      });
      this.day.attributes.forEach(function (attr) {
        // Add glyphs for each attribute
        const {
          targetDate
        } = attr;
        const {
          isDate,
          isComplex,
          startTime,
          endTime
        } = targetDate;
        const onStart = startTime === _this2.dateTime;
        const onEnd = endTime === _this2.dateTime;
        const onStartAndEnd = onStart && onEnd;
        const onStartOrEnd = onStart || onEnd;
        const dateInfo = {
          isDate,
          isComplex,
          onStart,
          onEnd,
          onStartAndEnd,
          onStartOrEnd
        };

        _this2.processHighlight(attr, dateInfo, glyphs);

        _this2.processContent(attr, dateInfo, glyphs);

        _this2.processDot(attr, dateInfo, glyphs);

        _this2.processBar(attr, dateInfo, glyphs);

        _this2.processPopover(attr, glyphs);
      });
      this.glyphs = glyphs;
    },

    processHighlight({
      key,
      highlight
    }, {
      isDate,
      isComplex,
      onStart,
      onEnd,
      onStartAndEnd
    }, {
      backgrounds,
      content
    }) {
      if (!highlight) return;
      const {
        base,
        start,
        end
      } = highlight;

      if (isDate || isComplex) {
        backgrounds.push({
          key,
          wrapperClass: 'vc-day-layer vc-day-box-center-center',
          class: `vc-highlight ${start.class}`
        });
        content.push({
          key: `${key}-content`,
          class: start.contentClass
        });
      } else if (onStartAndEnd) {
        backgrounds.push({
          key,
          wrapperClass: 'vc-day-layer vc-day-box-center-center',
          class: `vc-highlight ${start.class}`
        });
        content.push({
          key: `${key}-content`,
          class: start.contentClass
        });
      } else if (onStart) {
        backgrounds.push({
          key: `${key}-base`,
          wrapperClass: 'vc-day-layer vc-day-box-right-center',
          class: `vc-highlight vc-highlight-base-start ${base.class}`
        });
        backgrounds.push({
          key,
          wrapperClass: 'vc-day-layer vc-day-box-center-center',
          class: `vc-highlight ${start.class}`
        });
        content.push({
          key: `${key}-content`,
          class: start.contentClass
        });
      } else if (onEnd) {
        backgrounds.push({
          key: `${key}-base`,
          wrapperClass: 'vc-day-layer vc-day-box-left-center',
          class: `vc-highlight vc-highlight-base-end ${base.class}`
        });
        backgrounds.push({
          key,
          wrapperClass: 'vc-day-layer vc-day-box-center-center',
          class: `vc-highlight ${end.class}`
        });
        content.push({
          key: `${key}-content`,
          class: end.contentClass
        });
      } else {
        backgrounds.push({
          key: `${key}-middle`,
          wrapperClass: 'vc-day-layer vc-day-box-center-center',
          class: `vc-highlight vc-highlight-base-middle ${base.class}`
        });
        content.push({
          key: `${key}-content`,
          class: base.contentClass
        });
      }
    },

    processContent({
      key,
      content
    }, {
      isDate,
      onStart,
      onEnd
    }, {
      content: contents
    }) {
      if (!content) return;
      const {
        base,
        start,
        end
      } = content;

      if (isDate || onStart) {
        contents.push({
          key,
          class: start.class
        });
      } else if (onEnd) {
        contents.push({
          key,
          class: end.class
        });
      } else {
        contents.push({
          key,
          class: base.class
        });
      }
    },

    processDot({
      key,
      dot
    }, {
      isDate,
      onStart,
      onEnd
    }, {
      dots
    }) {
      if (!dot) return;
      const {
        base,
        start,
        end
      } = dot;

      if (isDate || onStart) {
        dots.push({
          key,
          class: `vc-dot ${start.class}`
        });
      } else if (onEnd) {
        dots.push({
          key,
          class: `vc-dot ${end.class}`
        });
      } else {
        dots.push({
          key,
          class: `vc-dot ${base.class}`
        });
      }
    },

    processBar({
      key,
      bar
    }, {
      isDate,
      onStart,
      onEnd
    }, {
      bars
    }) {
      if (!bar) return;
      const {
        base,
        start,
        end
      } = bar;

      if (isDate || onStart) {
        bars.push({
          key,
          class: `vc-bar ${start.class}`
        });
      } else if (onEnd) {
        bars.push({
          key,
          class: `vc-bar ${end.class}`
        });
      } else {
        bars.push({
          key,
          class: `vc-bar ${base.class}`
        });
      }
    },

    processPopover(attribute, {
      popovers
    }) {
      const {
        key,
        customData,
        popover
      } = attribute;
      if (!popover) return;
      const resolvedPopover = Object(utils_["b" /* defaults */])({
        key,
        customData,
        attribute
      }, CalendarDayvue_type_script_lang_js_objectSpread({}, popover), {
        visibility: popover.label ? 'hover' : 'click',
        placement: 'bottom',
        isInteractive: !popover.label
      });
      popovers.splice(0, 0, resolvedPopover);
    }

  }
});
// CONCATENATED MODULE: ./src/components/CalendarDay.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CalendarDayvue_type_script_lang_js_ = (CalendarDayvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/CalendarDay.vue?vue&type=style&index=0&id=2aac4f42&lang=postcss&scoped=true&
var CalendarDayvue_type_style_index_0_id_2aac4f42_lang_postcss_scoped_true_ = __webpack_require__("d581");

// CONCATENATED MODULE: ./src/components/CalendarDay.vue
var CalendarDay_render, CalendarDay_staticRenderFns





/* normalize component */

var CalendarDay_component = normalizeComponent(
  components_CalendarDayvue_type_script_lang_js_,
  CalendarDay_render,
  CalendarDay_staticRenderFns,
  false,
  null,
  "2aac4f42",
  null
  
)

/* harmony default export */ var CalendarDay = (CalendarDay_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CalendarPane.vue?vue&type=script&lang=js&



function CalendarPanevue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function CalendarPanevue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { CalendarPanevue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { CalendarPanevue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }








/* harmony default export */ var CalendarPanevue_type_script_lang_js_ = ({
  name: 'CalendarPane',
  mixins: [mixins_propOrDefaultMixin, mixins_childMixin, mixins_safeScopedSlotMixin],

  render(h) {
    var _this = this;

    // Header
    const header = this.safeScopedSlot('header', this.page) || h('div', {
      class: ['vc-header', this.theme.header]
    }, [// Header title
    h('div', {
      class: `vc-title-layout align-${this.titlePosition}`
    }, [h('div', {
      class: 'vc-title-wrapper'
    }, [// Navigation popover ref with title
    h(PopoverRef, {
      props: {
        id: this.navPopoverId,
        visibility: this.navVisibility_,
        placement: this.navPlacement,
        modifiers: {
          flip: {
            behavior: ['bottom']
          }
        },
        isInteractive: true
      }
    }, [// Title content
    h('div', {
      class: ['vc-title', this.theme.title]
    }, [this.safeScopedSlot('header-title', this.page, this.page.title)])]), // Navigation popover
    h(Popover, {
      props: {
        id: this.navPopoverId,
        contentClass: this.theme.navPopoverContainer
      }
    }, [// Navigation pane
    h(CalendarNav, {
      props: {
        value: this.page,
        validator: this.canMove
      },
      on: {
        input: function input($event) {
          return _this.move($event);
        }
      },
      scopedSlots: this.$scopedSlots
    })])])])]); // Weeks

    const weeks = h(Grid, {
      class: 'vc-weeks',
      props: {
        rows: 7,
        columns: 7,
        columnWidth: '1fr',
        disableFocus: true
      }
    }, [...this.weekdayLabels.map(function (wl, i) {
      return h('div', {
        key: i + 1,
        class: ['vc-weekday', _this.theme.weekdays]
      }, [wl]);
    }), ...this.page.days.map(function (day) {
      return h(CalendarDay, {
        attrs: CalendarPanevue_type_script_lang_js_objectSpread(CalendarPanevue_type_script_lang_js_objectSpread({}, _this.$attrs), {}, {
          day
        }),
        on: CalendarPanevue_type_script_lang_js_objectSpread({}, _this.$listeners),
        scopedSlots: _this.$scopedSlots,
        key: day.id,
        ref: 'days',
        refInFor: true
      });
    })]);
    return h('div', {
      class: 'vc-pane',
      ref: 'pane'
    }, [header, weeks]);
  },

  props: {
    page: Object,
    titlePosition: String,
    navVisibility: String,
    canMove: {
      type: Function,
      default: function _default() {
        return true;
      }
    }
  },

  data() {
    return {
      navPopoverId: Object(helpers["c" /* createGuid */])()
    };
  },

  computed: {
    navVisibility_() {
      return this.propOrDefault('navVisibility', 'navVisibility');
    },

    navPlacement() {
      switch (this.titlePosition) {
        case 'left':
          return 'bottom-start';

        case 'right':
          return 'bottom-end';

        default:
          return 'bottom';
      }
    },

    weekdayLabels() {
      var _this2 = this;

      return this.locale.getWeekdayDates().map(function (d) {
        return _this2.format(d, _this2.masks.weekdays);
      });
    }

  },
  methods: {
    move(page) {
      this.$emit('update:page', page);
    },

    refresh() {
      this.$refs.days.forEach(function (d) {
        return d.refresh();
      });
    }

  }
});
// CONCATENATED MODULE: ./src/components/CalendarPane.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CalendarPanevue_type_script_lang_js_ = (CalendarPanevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/CalendarPane.vue?vue&type=style&index=0&id=4a5f2beb&lang=postcss&scoped=true&
var CalendarPanevue_type_style_index_0_id_4a5f2beb_lang_postcss_scoped_true_ = __webpack_require__("3d14");

// CONCATENATED MODULE: ./src/components/CalendarPane.vue
var CalendarPane_render, CalendarPane_staticRenderFns





/* normalize component */

var CalendarPane_component = normalizeComponent(
  components_CalendarPanevue_type_script_lang_js_,
  CalendarPane_render,
  CalendarPane_staticRenderFns,
  false,
  null,
  "4a5f2beb",
  null
  
)

/* harmony default export */ var CalendarPane = (CalendarPane_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CustomTransition.vue?vue&type=script&lang=js&
/* harmony default export */ var CustomTransitionvue_type_script_lang_js_ = ({
  name: 'CustomTransition',

  render(h) {
    return h('transition', {
      props: {
        name: this.name_,
        appear: this.appear
      },
      on: {
        beforeEnter: this.beforeEnter,
        afterEnter: this.afterEnter
      }
    }, [this.$slots.default]);
  },

  props: {
    name: String,
    appear: Boolean
  },
  computed: {
    name_() {
      return this.name || 'none';
    }

  },
  methods: {
    beforeEnter(el) {
      this.$emit('beforeEnter', el);
      this.$emit('beforeTransition', el);
    },

    afterEnter(el) {
      this.$emit('afterEnter', el);
      this.$emit('afterTransition', el);
    }

  }
});
// CONCATENATED MODULE: ./src/components/CustomTransition.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CustomTransitionvue_type_script_lang_js_ = (CustomTransitionvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/CustomTransition.vue?vue&type=style&index=0&id=5be4b00c&lang=postcss&scoped=true&
var CustomTransitionvue_type_style_index_0_id_5be4b00c_lang_postcss_scoped_true_ = __webpack_require__("2285");

// CONCATENATED MODULE: ./src/components/CustomTransition.vue
var CustomTransition_render, CustomTransition_staticRenderFns





/* normalize component */

var CustomTransition_component = normalizeComponent(
  components_CustomTransitionvue_type_script_lang_js_,
  CustomTransition_render,
  CustomTransition_staticRenderFns,
  false,
  null,
  "5be4b00c",
  null
  
)

/* harmony default export */ var CustomTransition = (CustomTransition_component.exports);
// EXTERNAL MODULE: ./src/utils/attributeStore.js
var attributeStore = __webpack_require__("93495");

// EXTERNAL MODULE: ./src/styles/tailwind-lib.css
var tailwind_lib = __webpack_require__("bdab");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Calendar.vue?vue&type=script&lang=js&




function Calendarvue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function Calendarvue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { Calendarvue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { Calendarvue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }














/* harmony default export */ var Calendarvue_type_script_lang_js_ = ({
  name: 'Calendar',

  render(h) {
    var _this = this;

    // Renderer for calendar panes
    const panes = this.pages.map(function (page, i) {
      return h(CalendarPane, {
        attrs: Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, _this.$attrs), {}, {
          attributes: _this.store
        }),
        props: {
          titlePosition: _this.titlePosition_,
          page,
          minPage: _this.minPage_,
          maxPage: _this.maxPage_,
          canMove: _this.canMove
        },
        on: Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, _this.$listeners), {}, {
          'update:page': function updatePage(e) {
            return _this.refreshPages({
              page: e,
              position: i + 1
            });
          },
          dayfocusin: function dayfocusin(e) {
            _this.lastFocusedDay = e;

            _this.$emit('dayfocusin', e);
          },
          dayfocusout: function dayfocusout(e) {
            _this.lastFocusedDay = null;

            _this.$emit('dayfocusout', e);
          }
        }),
        scopedSlots: _this.$scopedSlots,
        key: page.key,
        ref: 'pages',
        refInFor: true
      });
    }); // Renderer for calendar arrows

    const getArrowButton = function getArrowButton(isPrev) {
      const click = function click() {
        return _this.move(isPrev ? -_this.step_ : _this.step_);
      };

      const keydown = function keydown(e) {
        return Object(helpers["o" /* onSpaceOrEnter */])(e, click);
      };

      const isDisabled = isPrev ? !_this.canMovePrev : !_this.canMoveNext;
      return h('div', {
        class: [`vc-flex vc-justify-center vc-items-center vc-cursor-pointer vc-select-none ${isDisabled ? 'vc-opacity-25 vc-pointer-events-none vc-cursor-not-allowed' : 'vc-pointer-events-auto'}`, _this.$theme.arrows],
        attrs: {
          role: 'button'
        },
        on: {
          click,
          keydown
        }
      }, [(isPrev ? _this.safeScopedSlot('header-left-button', {
        click
      }) : _this.safeScopedSlot('header-right-button', {
        click
      })) || h(SvgIcon, {
        props: {
          name: isPrev ? 'left-arrow' : 'right-arrow'
        }
      })]);
    }; // Day popover


    const getDayPopover = function getDayPopover() {
      return h(Popover, {
        props: {
          id: _this.sharedState.dayPopoverId,
          contentClass: _this.$theme.dayPopoverContainer
        },
        scopedSlots: {
          default: function _default({
            args: day,
            updateLayout,
            hide
          }) {
            const attributes = Object.values(day.attributes).filter(function (a) {
              return a.popover;
            });
            const masks = _this.$locale.masks;
            const format = _this.format;
            const dayTitle = format(day.date, masks.dayPopover);
            return _this.safeScopedSlot('day-popover', {
              day,
              attributes,
              masks,
              format,
              dayTitle,
              updateLayout,
              hide
            }) || h('div', [// Show popover header only if format is defined
            masks.dayPopover && h('div', {
              class: ['vc-text-center', _this.$theme.dayPopoverHeader]
            }, [dayTitle]), attributes.map(function (attribute) {
              return h(PopoverRow, {
                key: attribute.key,
                props: {
                  attribute
                }
              });
            })]);
          }
        }
      });
    }; // Renderer for calendar container


    const getContainerGrid = function getContainerGrid() {
      return h('div', {
        attrs: {
          'data-helptext': 'Press the arrow keys to navigate by day, Home and End to navigate to week ends, PageUp and PageDown to navigate by month, Alt+PageUp and Alt+PageDown to navigate by year'
        },
        class: ['vc-container', 'vc-reset', {
          'vc-min-w-full': _this.isExpanded
        }, _this.$theme.container],
        on: {
          keydown: _this.handleKeydown,
          mouseup: function mouseup(e) {
            return e.preventDefault();
          }
        },
        ref: 'container'
      }, [h('div', {
        class: ['vc-w-full vc-relative', {
          'vc-overflow-hidden': _this.inTransition
        }]
      }, [h(CustomTransition, {
        props: {
          name: _this.transitionName
        },
        on: {
          beforeEnter: function beforeEnter() {
            _this.inTransition = true;
          },
          afterEnter: function afterEnter() {
            _this.inTransition = false;
          }
        }
      }, [h(Grid, {
        class: 'grid',
        props: {
          rows: _this.rows,
          columns: _this.columns,
          columnWidth: 'minmax(256px, 1fr)',
          disableFocus: true
        },
        attrs: Calendarvue_type_script_lang_js_objectSpread({}, _this.$attrs),
        key: Object(helpers["b" /* arrayHasItems */])(_this.pages) ? _this.pages[0].key : ''
      }, panes)]), h('div', {
        class: [`vc-arrows-container title-${_this.titlePosition_}`]
      }, [getArrowButton(true), getArrowButton(false)])]), getDayPopover()]);
    };

    return getContainerGrid();
  },

  mixins: [mixins_propOrDefaultMixin, mixins_rootMixin, mixins_safeScopedSlotMixin],

  provide() {
    return {
      sharedState: this.sharedState
    };
  },

  props: {
    rows: {
      type: Number,
      default: 1
    },
    columns: {
      type: Number,
      default: 1
    },
    step: Number,
    titlePosition: String,
    isExpanded: Boolean,
    fromDate: Date,
    toDate: Date,
    fromPage: Object,
    toPage: Object,
    minPage: Object,
    maxPage: Object,
    transition: String,
    attributes: [Object, Array],
    disablePageSwipe: Boolean
  },

  data() {
    return {
      pages: [],
      store: null,
      lastFocusedDay: null,
      focusableDay: new Date().getDate(),
      transitionName: '',
      inTransition: false,
      sharedState: {
        dayPopoverId: Object(helpers["c" /* createGuid */])(),
        theme: {},
        masks: {},
        locale: {}
      }
    };
  },

  computed: {
    titlePosition_() {
      return this.propOrDefault('titlePosition', 'titlePosition');
    },

    minPage_() {
      return this.minPage || Object(helpers["p" /* pageForDate */])(this.$locale.toDate(this.minDate));
    },

    maxPage_() {
      return this.maxPage || Object(helpers["p" /* pageForDate */])(this.$locale.toDate(this.maxDate));
    },

    count() {
      return this.rows * this.columns;
    },

    step_() {
      return this.step || this.count;
    },

    canMovePrev() {
      return !Object(helpers["x" /* pageIsValid */])(this.minPage_) || Object(helpers["t" /* pageIsAfterPage */])(this.pages[0], this.minPage_);
    },

    canMoveNext() {
      return !Object(helpers["x" /* pageIsValid */])(this.maxPage_) || Object(helpers["u" /* pageIsBeforePage */])(this.pages[this.pages.length - 1], this.maxPage_);
    }

  },
  watch: {
    $locale() {
      this.refreshLocale();
      this.refreshPages({
        page: Object(utils_["g" /* head */])(this.pages),
        ignoreCache: true
      });
      this.initStore();
    },

    $theme() {
      this.refreshTheme();
      this.initStore();
    },

    fromDate() {
      this.refreshPages();
    },

    fromPage(val) {
      const firstPage = this.pages && this.pages[0];
      if (Object(helpers["w" /* pageIsEqualToPage */])(val, firstPage)) return;
      this.refreshPages();
    },

    toPage(val) {
      const lastPage = this.pages && this.pages[this.pages.length - 1];
      if (Object(helpers["w" /* pageIsEqualToPage */])(val, lastPage)) return;
      this.refreshPages();
    },

    count() {
      this.refreshPages();
    },

    attributes(val) {
      const {
        adds,
        deletes
      } = this.store.refresh(val);
      this.refreshAttrs(this.pages, adds, deletes);
    },

    pages(val) {
      this.refreshAttrs(val, this.store.list, null, true);
    },

    disabledAttribute() {
      this.refreshDisabledDays();
    },

    lastFocusedDay(val) {
      if (val) {
        this.focusableDay = val.day;
        this.refreshFocusableDays();
      }
    },

    inTransition(val) {
      if (val) {
        this.$emit('transition-start');
      } else {
        this.$emit('transition-end');

        if (this.transitionPromise) {
          this.transitionPromise.resolve();
          this.transitionPromise = null;
        }
      }
    }

  },

  created() {
    this.refreshLocale();
    this.refreshTheme();
    this.initStore();
    this.refreshPages();
  },

  mounted() {
    var _this2 = this;

    if (!this.disablePageSwipe) {
      // Add swipe handler to move to next and previous pages
      const removeHandlers = Object(touch["a" /* addHorizontalSwipeHandler */])(this.$refs.container, function ({
        toLeft,
        toRight
      }) {
        if (toLeft) {
          _this2.moveNext();
        } else if (toRight) {
          _this2.movePrev();
        }
      }, this.$defaults.touch); // Clean up on destroy

      this.$once('beforeDestroy', function () {
        return removeHandlers();
      });
    }
  },

  methods: {
    refreshLocale() {
      this.sharedState.locale = this.$locale;
      this.sharedState.masks = this.$locale.masks;
    },

    refreshTheme() {
      this.sharedState.theme = this.$theme;
    },

    canMove(page) {
      return Object(helpers["v" /* pageIsBetweenPages */])(page, this.minPage_, this.maxPage_);
    },

    async movePrev(opts) {
      const result = await this.move(-this.step_, opts);
      return result;
    },

    async moveNext(opts) {
      const result = this.move(this.step_, opts);
      return result;
    },

    async move(arg, opts) {
      const page = this.$locale.toPage(arg, this.pages[0]);

      if (!page) {
        return null;
      }

      const result = await this.refreshPages(Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, opts), {}, {
        page
      }));
      return result;
    },

    async focusDate(date, opts = {}) {
      const page = Object(helpers["p" /* pageForDate */])(date); // Calculate new fromPage

      let fromPage = null;

      if (opts.position) {
        fromPage = this.getTargetPageRange(page, opts.position).fromPage;
      } else if (Object(helpers["u" /* pageIsBeforePage */])(page, this.pages[0])) {
        fromPage = this.getTargetPageRange(page, -1).fromPage;
      } else if (Object(helpers["t" /* pageIsAfterPage */])(page, Object(utils_["o" /* last */])(this.pages))) {
        fromPage = this.getTargetPageRange(page, 1).fromPage;
      } // Move to new fromPage if it's different from the current one


      if (fromPage && !Object(helpers["w" /* pageIsEqualToPage */])(fromPage, this.pages[0])) {
        await this.refreshPages(Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, opts), {}, {
          position: 1,
          page: fromPage
        }));
      } // Set focus on the element for the date


      const focusableEl = this.$el.querySelector(`.id-${this.$locale.format(date, 'YYYY-MM-DD')}.in-month .vc-focusable`);

      if (focusableEl) {
        focusableEl.focus();
      }
    },

    async showPageRange(range, opts) {
      let fromPage;
      let toPage;

      if (Object(utils_["i" /* isDate */])(range)) {
        fromPage = Object(helpers["p" /* pageForDate */])(range);
      } else if (Object(utils_["l" /* isObject */])(range)) {
        const {
          month,
          year
        } = range;
        const {
          from,
          to
        } = range;

        if (Object(utils_["k" /* isNumber */])(month) && Object(utils_["k" /* isNumber */])(year)) {
          fromPage = range;
        } else if (from || to) {
          fromPage = Object(utils_["i" /* isDate */])(from) ? Object(helpers["p" /* pageForDate */])(from) : from;
          toPage = Object(utils_["i" /* isDate */])(to) ? Object(helpers["p" /* pageForDate */])(to) : to;
        }
      } else {
        return;
      }

      const lastPage = Object(utils_["o" /* last */])(this.pages);
      let page = fromPage; // Offset page from the desired `toPage`

      if (Object(helpers["t" /* pageIsAfterPage */])(toPage, lastPage)) {
        page = Object(helpers["a" /* addPages */])(toPage, -(this.pages.length - 1));
      } // But no earlier than the desired `fromPage`


      if (Object(helpers["u" /* pageIsBeforePage */])(fromPage, page)) {
        page = fromPage;
      }

      await this.refreshPages(Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, opts), {}, {
        page
      }));
    },

    getTargetPageRange(page, position) {
      // Calculate the page to start displaying from
      let fromPage = null; // 1. Try the page parameter

      if (Object(helpers["x" /* pageIsValid */])(page)) {
        const pagesToAdd = position > 0 ? 1 - position : -(this.count + position);
        fromPage = Object(helpers["a" /* addPages */])(page, pagesToAdd);
      } else {
        // 2. Try the fromPage prop
        fromPage = this.fromPage || Object(helpers["p" /* pageForDate */])(this.$locale.toDate(this.fromDate));

        if (!Object(helpers["x" /* pageIsValid */])(fromPage)) {
          // 3. Try the toPage prop
          const toPage = this.toPage || Object(helpers["p" /* pageForDate */])(this.$locale.toDate(this.toPage));

          if (Object(helpers["x" /* pageIsValid */])(toPage)) {
            fromPage = Object(helpers["a" /* addPages */])(toPage, 1 - this.count);
          } else {
            // 4. Try the first attribute
            fromPage = this.getPageForAttributes();
          }
        }
      } // 5. Fall back to today's page


      fromPage = Object(helpers["x" /* pageIsValid */])(fromPage) ? fromPage : Object(helpers["s" /* pageForThisMonth */])(); // Adjust from page within allowed min/max pages

      const toPage = Object(helpers["a" /* addPages */])(fromPage, this.count - 1);

      if (Object(helpers["u" /* pageIsBeforePage */])(fromPage, this.minPage_)) {
        fromPage = this.minPage_;
      } else if (Object(helpers["t" /* pageIsAfterPage */])(toPage, this.maxPage_)) {
        fromPage = Object(helpers["a" /* addPages */])(this.maxPage_, 1 - this.count);
      }

      return {
        fromPage,
        toPage
      };
    },

    async refreshPages({
      page,
      position = 1,
      transition,
      ignoreCache
    } = {}) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        const {
          fromPage,
          toPage
        } = _this3.getTargetPageRange(page, position); // Create the new pages


        const pages = [];

        for (let i = 0; i < _this3.count; i++) {
          pages.push(_this3.buildPage(Object(helpers["a" /* addPages */])(fromPage, i), ignoreCache));
        } // Refresh disabled days for new pages


        _this3.refreshDisabledDays(pages); // Refresh focusable days for new pages


        _this3.refreshFocusableDays(pages); // Assign the transition


        _this3.transitionName = _this3.getPageTransition(_this3.pages[0], pages[0], transition); // Assign the new pages

        _this3.pages = pages; // Emit page update events

        _this3.$emit('update:from-page', fromPage);

        _this3.$emit('update:to-page', toPage);

        if (_this3.transitionName && _this3.transitionName !== 'none') {
          _this3.transitionPromise = {
            resolve,
            reject
          };
        } else {
          resolve();
        }
      });
    },

    refreshDisabledDays(pages) {
      var _this4 = this;

      this.getPageDays(pages).forEach(function (d) {
        d.isDisabled = !!_this4.disabledAttribute && _this4.disabledAttribute.includesDay(d);
      });
    },

    refreshFocusableDays(pages) {
      var _this5 = this;

      this.getPageDays(pages).forEach(function (d) {
        d.isFocusable = d.inMonth && d.day === _this5.focusableDay;
      });
    },

    getPageDays(pages = this.pages) {
      return pages.reduce(function (prev, curr) {
        return prev.concat(curr.days);
      }, []);
    },

    getPageTransition(oldPage, newPage, transition = this.transition) {
      if (transition === 'none') return transition;

      if (transition === 'fade' || !transition && this.count > 1 || !Object(helpers["x" /* pageIsValid */])(oldPage) || !Object(helpers["x" /* pageIsValid */])(newPage)) {
        return 'fade';
      } // Moving to a previous page


      const movePrev = Object(helpers["u" /* pageIsBeforePage */])(newPage, oldPage); // Vertical slide

      if (transition === 'slide-v') {
        return movePrev ? 'slide-down' : 'slide-up';
      } // Horizontal slide


      return movePrev ? 'slide-right' : 'slide-left';
    },

    getPageForAttributes() {
      let page = null;
      const attr = this.store.pinAttr;

      if (attr && attr.hasDates) {
        let [date] = attr.dates;
        date = date.start || date.date;
        page = Object(helpers["p" /* pageForDate */])(this.$locale.toDate(date));
      }

      return page;
    },

    buildPage({
      month,
      year
    }, ignoreCache) {
      var _this6 = this;

      const key = `${year.toString()}-${month.toString()}`;
      let page = this.pages.find(function (p) {
        return p.key === key;
      });

      if (!page || ignoreCache) {
        const date = new Date(year, month - 1, 15);
        const monthComps = this.$locale.getMonthComps(month, year);
        const prevMonthComps = this.$locale.getPrevMonthComps(month, year);
        const nextMonthComps = this.$locale.getNextMonthComps(month, year);
        page = {
          key,
          month,
          year,
          title: this.$locale.format(date, this.$locale.masks.title),
          shortMonthLabel: this.$locale.format(date, 'MMM'),
          monthLabel: this.$locale.format(date, 'MMMM'),
          shortYearLabel: year.toString().substring(2),
          yearLabel: year.toString(),
          monthComps,
          prevMonthComps,
          nextMonthComps,
          canMove: function canMove(pg) {
            return _this6.canMove(pg);
          },
          move: function move(pg) {
            return _this6.move(pg);
          },
          moveThisMonth: function moveThisMonth() {
            return _this6.moveThisMonth();
          },
          movePrevMonth: function movePrevMonth() {
            return _this6.move(prevMonthComps);
          },
          moveNextMonth: function moveNextMonth() {
            return _this6.move(nextMonthComps);
          },
          refresh: true
        }; // Assign day info

        page.days = this.$locale.getCalendarDays(page);
      }

      return page;
    },

    initStore() {
      // Create a new attribute store
      this.store = new attributeStore["a" /* default */](this.$theme, this.$locale, this.attributes); // Refresh attributes for existing pages

      this.refreshAttrs(this.pages, this.store.list, [], true);
    },

    refreshAttrs(pages = [], adds = [], deletes = [], reset) {
      var _this7 = this;

      if (!Object(helpers["b" /* arrayHasItems */])(pages)) return; // For each page...

      pages.forEach(function (p) {
        // For each day...
        p.days.forEach(function (d) {
          let map = {}; // If resetting...

          if (reset) {
            // Flag day for refresh if it has attributes
            d.refresh = Object(helpers["b" /* arrayHasItems */])(d.attributes);
          } else if (Object(utils_["f" /* hasAny */])(d.attributesMap, deletes)) {
            // Delete attributes from the delete list
            map = Object(utils_["r" /* omit */])(d.attributesMap, deletes); // Flag day for refresh

            d.refresh = true;
          } else {
            // Get the existing attributes
            map = d.attributesMap || {};
          } // For each attribute to add...


          adds.forEach(function (attr) {
            // Add it if it includes the current day
            const targetDate = attr.includesDay(d);

            if (targetDate) {
              const newAttr = Calendarvue_type_script_lang_js_objectSpread(Calendarvue_type_script_lang_js_objectSpread({}, attr), {}, {
                targetDate
              });

              map[attr.key] = newAttr; // Flag day for refresh

              d.refresh = true;
            }
          }); // Reassign day attributes

          if (d.refresh) {
            d.attributesMap = map;
          }
        });
      }); // Refresh pages

      this.$nextTick(function () {
        _this7.$refs.pages.forEach(function (p) {
          return p.refresh();
        });
      });
    },

    handleKeydown(e) {
      const day = this.lastFocusedDay;

      if (day != null) {
        day.event = e;
        this.handleDayKeydown(day);
      }
    },

    handleDayKeydown(day) {
      const {
        date,
        event
      } = day;
      let newDate = null;

      switch (event.key) {
        case 'ArrowLeft':
          {
            // Move to previous day
            newDate = Object(addDays["a" /* default */])(date, -1);
            break;
          }

        case 'ArrowRight':
          {
            // Move to next day
            newDate = Object(addDays["a" /* default */])(date, 1);
            break;
          }

        case 'ArrowUp':
          {
            // Move to previous week
            newDate = Object(addDays["a" /* default */])(date, -7);
            break;
          }

        case 'ArrowDown':
          {
            // Move to next week
            newDate = Object(addDays["a" /* default */])(date, 7);
            break;
          }

        case 'Home':
          {
            // Move to first weekday position
            newDate = Object(addDays["a" /* default */])(date, -day.weekdayPosition + 1);
            break;
          }

        case 'End':
          {
            // Move to last weekday position
            newDate = Object(addDays["a" /* default */])(date, day.weekdayPositionFromEnd);
            break;
          }

        case 'PageUp':
          {
            if (event.altKey) {
              // Move to previous year w/ Alt/Option key
              newDate = addYears(date, -1);
            } else {
              // Move to previous month
              newDate = addMonths(date, -1);
            }

            break;
          }

        case 'PageDown':
          {
            if (event.altKey) {
              // Move to next year w/ Alt/Option key
              newDate = addYears(date, 1);
            } else {
              // Move to next month
              newDate = addMonths(date, 1);
            }

            break;
          }
      }

      if (newDate) {
        event.preventDefault();
        this.focusDate(newDate);
      }
    }

  }
});
// CONCATENATED MODULE: ./src/components/Calendar.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Calendarvue_type_script_lang_js_ = (Calendarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/Calendar.vue?vue&type=style&index=0&lang=css&
var Calendarvue_type_style_index_0_lang_css_ = __webpack_require__("04d4");

// CONCATENATED MODULE: ./src/components/Calendar.vue
var Calendar_render, Calendar_staticRenderFns





/* normalize component */

var Calendar_component = normalizeComponent(
  components_Calendarvue_type_script_lang_js_,
  Calendar_render,
  Calendar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var Calendar = (Calendar_component.exports);
// CONCATENATED MODULE: ./src/utils/pickers/single.js


class single_SinglePicker {
  constructor({
    format,
    parse
  }) {
    this._format = format;
    this._parse = parse;
  }

  hasValue(value) {
    return Object(utils_["i" /* isDate */])(value);
  }

  format(value) {
    return this.hasValue(value) ? this._format(value) : '';
  }

  parse(text) {
    const value = this._parse(text);

    return Object(utils_["i" /* isDate */])(value) ? value : null;
  }

  normalize(value) {
    return value && new Date(value);
  }

  filterDisabled({
    value,
    isRequired,
    disabled,
    fallbackValue
  }) {
    if (!this.hasValue(value) && isRequired) {
      return fallbackValue;
    }

    if (this.hasValue(value) && disabled && disabled.intersectsDate(value)) {
      return null;
    }

    return value;
  }

  valuesAreEqual(a, b) {
    return Object(helpers["d" /* datesAreEqual */])(a, b);
  }

  getPageRange(value) {
    if (!this.hasValue(value)) {
      return null;
    }

    const from = Object(helpers["p" /* pageForDate */])(value);
    return {
      from,
      to: from
    };
  }

  handleDayClick(day, picker) {
    // Done if day selection is invalid
    if (!picker.dateIsValid(day.date)) {
      return;
    } // Check if selected date was reselected


    if (this.valuesAreEqual(day.date, picker.value_)) {
      // Reset value to null if allowed
      if (!picker.isRequired) {
        picker.value_ = null;
      }
    } else {
      picker.doFormatInput = true;
      picker.doHidePopover = true; // Set value to selected date

      picker.value_ = day.date;
    }
  }

  handleDayMouseEnter() {// Don't do anything here
  }

}
// CONCATENATED MODULE: ./src/utils/pickers/multiple.js



class multiple_MultiplePicker {
  constructor({
    format,
    parse
  }) {
    this._format = format;
    this._parse = parse;
  }

  hasValue(value) {
    return Object(helpers["b" /* arrayHasItems */])(value);
  }

  format(value) {
    var _this = this;

    if (this.hasValue(value)) {
      return value.map(function (d) {
        return _this._format(d);
      }).join(', ');
    }

    return '';
  }

  parse(text) {
    var _this2 = this;

    if (!Object(utils_["m" /* isString */])(text)) return [];
    return text.split(',').map(function (s) {
      return _this2._parse(s);
    }).filter(function (d) {
      return Object(utils_["i" /* isDate */])(d);
    });
  }

  normalize(value) {
    if (!this.hasValue(value)) return [];
    return Object(utils_["v" /* uniq */])(value).sort(function (a, b) {
      return a.getTime() - b.getTime();
    });
  }

  filterDisabled({
    value,
    isRequired,
    disabled,
    fallbackValue
  }) {
    if (!this.hasValue(value)) return [];
    if (!disabled) return value;
    const newValue = value.filter(function (d) {
      return !disabled.intersectsDate(d);
    });
    if (!this.hasValue(newValue) && isRequired) return fallbackValue;
    return newValue;
  }

  valuesAreEqual(a, b) {
    const aHasItems = this.hasValue(a);
    const bHasItems = this.hasValue(b);
    if (!aHasItems && !bHasItems) return true;
    if (aHasItems !== bHasItems || a.length !== b.length) return false;
    return !a.some(function (d) {
      return !b.includes(d);
    }) && !b.some(function (d) {
      return !a.includes(d);
    });
  }

  getPageRange(value) {
    if (!this.hasValue(value)) return null;
    const from = Object(helpers["p" /* pageForDate */])(value[0]);
    const to = Object(helpers["j" /* getMaxPage */])(Object(helpers["p" /* pageForDate */])(Object(utils_["o" /* last */])(value)), Object(helpers["a" /* addPages */])(from, 1));
    return {
      from,
      to
    };
  }

  handleDayClick(day, picker) {
    // Done if day selection is invalid
    if (!picker.dateIsValid(day.date)) {
      return;
    }

    let value = []; // Check if no values exist

    if (!this.hasValue(picker.value_)) {
      value = [day.date]; // Check if value contains the selected date
    } else if (picker.value_.some(function (d) {
      return d.getTime() === day.dateTime;
    })) {
      // Calculate the new dates array
      value = picker.value_.filter(function (v) {
        return !Object(helpers["d" /* datesAreEqual */])(v, day.date);
      }); // Re-select the date if it is required

      if (!this.hasValue(value) && picker.isRequired) {
        value = [day.date];
      }
    } else {
      // Append selected date
      value = [...picker.value_, day.date];
    }

    this.doFormatInput = true;
    this.doHidePopover = false;
    picker.value_ = this.normalize(value);
  }

  handleDayMouseEnter() {}

}
// EXTERNAL MODULE: ./src/utils/dateInfo.js
var dateInfo = __webpack_require__("cfe5");

// CONCATENATED MODULE: ./src/utils/pickers/range.js




class range_RangePicker {
  constructor({
    locale,
    format,
    parse
  }) {
    this._locale = locale;
    this._format = format;
    this._parse = parse;
  }

  hasValue(value) {
    return Object(utils_["l" /* isObject */])(value) && Object(utils_["i" /* isDate */])(value.start) && Object(utils_["i" /* isDate */])(value.end);
  }

  normalize(value) {
    if (!this.hasValue(value)) return null;
    const {
      start,
      end
    } = new dateInfo["a" /* default */]({
      start: new Date(value.start),
      end: new Date(value.end)
    }, {
      locale: this._locale
    });
    return {
      start,
      end
    };
  }

  format(value) {
    const nValue = this.normalize(value);
    if (!nValue) return '';
    const {
      start,
      end
    } = nValue;

    const startText = this._format(start);

    const endText = this._format(end);

    if (!startText || !endText) return '';
    return `${startText} - ${endText}`;
  }

  parse(text) {
    let start;
    let end;
    const separator = [' - ', '-'].find(function (s) {
      return text.includes(s);
    });
    const dateTexts = text.split(separator).map(function (s) {
      return s.trim();
    });

    if (dateTexts.length >= 2) {
      start = this._parse(dateTexts[0]);
      end = this._parse(dateTexts[1]);
    }

    return start && end ? this.normalize({
      start,
      end
    }) : null;
  }

  filterDisabled({
    value,
    isRequired,
    disabled,
    fallbackValue
  }) {
    let newValue = isRequired ? fallbackValue : null;

    if (this.hasValue(value) && (!disabled || !disabled.intersectsDate(value))) {
      newValue = value;
    }

    return newValue;
  }

  valuesAreEqual(a, b) {
    const aHasValue = this.hasValue(a);
    const bHasValue = this.hasValue(b);
    if (!aHasValue && !bHasValue) return true;
    if (aHasValue !== bHasValue) return false;
    return Object(helpers["d" /* datesAreEqual */])(a.start, b.start) && Object(helpers["d" /* datesAreEqual */])(a.end, b.end);
  }

  getPageRange(value) {
    if (!this.hasValue(value)) return null;
    const from = Object(helpers["p" /* pageForDate */])(value.start);
    const to = Object(helpers["j" /* getMaxPage */])(Object(helpers["p" /* pageForDate */])(value.end), Object(helpers["a" /* addPages */])(from, 1));
    return {
      from,
      to
    };
  }

  handleDayClick(day, picker) {
    const {
      dateTime
    } = day; // Start new drag selection if not dragging

    if (!picker.dragValue) {
      // Update drag value if it is valid
      const newDragValue = {
        start: new Date(dateTime),
        end: new Date(dateTime)
      }; // Assign drag value if it is valid

      if (picker.dateIsValid(newDragValue)) {
        picker.dragValue = newDragValue;
      }
    } else {
      // Update selected value if it is valid
      const newValue = this.normalize({
        start: new Date(picker.dragValue.start.getTime()),
        end: new Date(dateTime)
      }); // Assign new value if it is valid

      if (picker.dateIsValid(newValue)) {
        picker.doFormatInput = true;
        picker.doHidePopover = true; // Clear drag selection

        picker.dragValue = null;
        picker.value_ = newValue;
      }
    }
  }

  handleDayMouseEnter(day, picker) {
    const {
      dateTime
    } = day; // Make sure drag has been initialized

    if (picker.dragValue) {
      // Calculate the new dragged value
      const newDragValue = {
        start: new Date(picker.dragValue.start.getTime()),
        end: new Date(dateTime)
      }; // Assign drag value if it is valid

      if (picker.dateIsValid(newDragValue)) {
        picker.dragValue = newDragValue;
      }
    }
  }

}
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/DatePicker.vue?vue&type=script&lang=js&



function DatePickervue_type_script_lang_js_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function DatePickervue_type_script_lang_js_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { DatePickervue_type_script_lang_js_ownKeys(Object(source), true).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { DatePickervue_type_script_lang_js_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }












/* harmony default export */ var DatePickervue_type_script_lang_js_ = ({
  name: 'DatePicker',

  render(h) {
    var _this = this;

    const calendar = function calendar() {
      return h(Calendar, {
        attrs: DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({}, _this.$attrs), {}, {
          attributes: _this.attributes_,
          theme: _this.$theme,
          locale: _this.$locale
        }),
        props: {
          minDate: _this.minDate,
          maxDate: _this.maxDate,
          disabledDates: _this.disabledDates,
          availableDates: _this.availableDates
        },
        on: DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({}, _this.$listeners), {}, {
          dayclick: _this.onDayClick,
          daymouseenter: _this.onDayMouseEnter,
          daykeydown: _this.onDayKeydown,
          dayfocusin: _this.onDayFocusIn
        }),
        scopedSlots: _this.$scopedSlots,
        ref: 'calendar'
      });
    }; // If inline just return the calendar


    if (this.isInline) return calendar(); // Render the slot or ihput

    const inputSlot = this.safeScopedSlot('default', {
      inputClass: this.inputClass,
      inputValue: this.inputValue,
      inputProps: this.inputProps_,
      inputEvents: this.inputEvents,
      isDragging: !!this.dragValue,
      updateValue: this.updateValue,
      hidePopover: this.hidePopover
    }) || h('input', {
      class: this.inputClass,
      attrs: this.inputProps_,
      domProps: {
        value: this.inputValue
      },
      on: this.inputEvents
    }); // Convert this span to a fragment when supported in Vue

    return h('span', [h(PopoverRef, {
      props: DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({}, this.popover_), {}, {
        id: this.datePickerPopoverId,
        isInteractive: true
      })
    }, [inputSlot]), // Picker popover
    h(Popover, {
      props: {
        id: this.datePickerPopoverId,
        placement: 'bottom-start',
        contentClass: this.$theme.container
      },
      on: {
        beforeShow: function beforeShow(e) {
          return _this.$emit('popoverWillShow', e);
        },
        afterShow: function afterShow(e) {
          return _this.$emit('popoverDidShow', e);
        },
        beforeHide: function beforeHide(e) {
          return _this.$emit('popoverWillHide', e);
        },
        afterHide: function afterHide(e) {
          return _this.$emit('popoverDidHide', e);
        }
      },
      scopedSlots: {
        default() {
          return calendar();
        }

      },
      ref: 'popover'
    })]);
  },

  mixins: [mixins_rootMixin, mixins_propOrDefaultMixin, mixins_safeScopedSlotMixin],
  props: {
    mode: {
      type: String,
      default: 'single'
    },
    value: {
      type: null,
      required: true
    },
    isRequired: Boolean,
    isInline: Boolean,
    updateOnInput: Boolean,
    inputDebounce: Number,
    inputProps: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    popover: {
      type: Object,
      default: function _default() {
        return {};
      }
    },
    dragAttribute: Object,
    selectAttribute: Object,
    attributes: Array
  },

  data() {
    return {
      value_: null,
      dragValue: null,
      inputValue: '',
      doFormatInput: true,
      doHidePopover: false,
      doAdjustPageRange: false,
      updateTimeout: null,
      datePickerPopoverId: Object(helpers["c" /* createGuid */])()
    };
  },

  computed: {
    updateOnInput_() {
      return this.propOrDefault('updateOnInput', 'datePicker.updateOnInput');
    },

    inputDebounce_() {
      return this.propOrDefault('inputDebounce', 'datePicker.inputDebounce');
    },

    inputMasks() {
      const inputFormat = this.$locale.masks.input;
      return Object(utils_["h" /* isArray */])(inputFormat) && inputFormat || [inputFormat];
    },

    inputClass() {
      const inputClass = this.inputProps.class || this.$theme.datePickerInput;
      const inputDragClass = this.inputProps.dragClass || this.$theme.datePickerInputDrag;
      return this.picker.hasValue(this.dragValue) ? inputDragClass || inputClass : inputClass;
    },

    inputProps_() {
      // Merge the user props with local
      const props = DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({}, this.inputProps), {}, {
        value: this.inputValue,
        type: 'input'
      }); // Delete class properties


      delete props.class;
      delete props.dragClass;
      return props;
    },

    inputEvents() {
      return {
        input: this.inputInput,
        change: this.inputChange,
        // keydown: this.inputKeydown,
        keyup: this.inputKeyup
      };
    },

    popover_() {
      return this.propOrDefault('popover', 'datePicker.popover', 'merge');
    },

    canHidePopover() {
      return !(this.popover.keepVisibleOnInput || this.popover_.visibility !== 'visible');
    },

    selectAttribute_() {
      if (!this.picker.hasValue(this.value_)) return null;

      const attribute = DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({
        key: 'select-drag'
      }, this.selectAttribute), {}, {
        dates: this.value_,
        pinPage: true
      });

      const {
        dot,
        bar,
        highlight,
        content
      } = attribute;

      if (!dot && !bar && !highlight && !content) {
        attribute.highlight = true;
      }

      return attribute;
    },

    dragAttribute_() {
      if (this.mode !== 'range' || !this.picker.hasValue(this.dragValue)) {
        return null;
      }

      const attribute = DatePickervue_type_script_lang_js_objectSpread(DatePickervue_type_script_lang_js_objectSpread({
        key: 'select-drag'
      }, this.dragAttribute), {}, {
        dates: this.dragValue
      });

      const {
        dot,
        bar,
        highlight,
        content
      } = attribute;

      if (!dot && !bar && !highlight && !content) {
        attribute.highlight = {
          startEnd: {
            fillMode: 'none'
          }
        };
      }

      return attribute;
    },

    attributes_() {
      const attrs = Object(utils_["h" /* isArray */])(this.attributes) ? [...this.attributes] : [];

      if (this.dragAttribute_) {
        attrs.push(this.dragAttribute_);
      } else if (this.selectAttribute_) {
        attrs.push(this.selectAttribute_);
      }

      return attrs;
    },

    picker() {
      var _this2 = this;

      const opts = {
        locale: this.$locale,
        format: function format(d) {
          return _this2.$locale.format(d, _this2.inputMasks[0]);
        },
        parse: function parse(s) {
          return _this2.$locale.parse(s, _this2.inputMasks);
        }
      };

      switch (this.mode) {
        case 'multiple':
          return new multiple_MultiplePicker(opts);

        case 'range':
          return new range_RangePicker(opts);

        default:
          return new single_SinglePicker(opts);
      }
    }

  },
  watch: {
    mode() {
      // Clear value on select mode change
      this.value_ = null;
    },

    value: {
      handler() {
        this.value_ = this.picker.filterDisabled({
          value: this.value,
          isRequired: this.isRequired,
          disabled: this.disabledAttribute,
          fallbackValue: null
        });

        if (this.value && !this.value_) {
          this.$emit('input', null);
        }
      },

      immediate: true
    },
    value_: {
      handler(val) {
        // Only emit events for internal updates and value changes
        if (!this.picker.valuesAreEqual(val, this.value)) {
          this.$emit('input', val);
        } // Execute side-effects for non-inline pickers


        if (!this.isInline) {
          if (this.doFormatInput) this.formatInput();
          if (this.doHidePopover) this.hidePopover();
          if (this.doAdjustPageRange) this.adjustPageRange();
        }

        this.doFormatInput = true;
        this.doHidePopover = false;
        this.doAdjustPageRange = false;
      },

      immediate: true
    },

    dragValue(val) {
      this.formatInput();
      this.$emit('drag', this.picker.normalize(val));
    }

  },

  mounted() {
    var _this3 = this;

    // Handle escape key presses
    Object(helpers["n" /* on */])(document, 'keydown', this.onDocumentKeyDown); // Clear drag on background click

    const offTapOrClickHandler = Object(touch["b" /* addTapOrClickHandler */])(document, function (e) {
      if (document.body.contains(e.target) && !Object(helpers["e" /* elementContains */])(_this3.$el, e.target) && _this3.dragValue) {
        _this3.dragValue = null;
      }
    }); // Clean up handlers

    this.$once('beforeDestroy', function () {
      Object(helpers["m" /* off */])(document, 'keydown', _this3.onDocumentKeyDown);
      offTapOrClickHandler();
    });
  },

  methods: {
    dateIsValid(date) {
      if (!date) return true;
      return !!this.disabledAttribute && !this.disabledAttribute.intersectsDate(date);
    },

    onDocumentKeyDown(e) {
      // Clear drag on escape keydown
      if (this.dragValue && e.keyCode === 27) {
        this.dragValue = null;
      }
    },

    onDayClick(day) {
      this.picker.handleDayClick(day, this); // Re-emit event

      this.$emit('dayclick', day);
    },

    onDayMouseEnter(day) {
      this.picker.handleDayMouseEnter(day, this); // Re-emit event

      this.$emit('daymouseenter', day);
    },

    onDayFocusIn(day) {
      this.picker.handleDayMouseEnter(day, this); // Re-emit event

      this.$emit('dayfocusin', day);
    },

    onDayKeydown(day) {
      switch (day.event.key) {
        case ' ':
        case 'Enter':
          {
            this.picker.handleDayClick(day, this);
            day.event.preventDefault();
            break;
          }

        case 'Escape':
          {
            this.hidePopover();
          }
      } // Re-emit event


      this.$emit('daykeydown', day);
    },

    inputInput(e) {
      this.inputValue = e.target.value;

      if (this.updateOnInput_) {
        this.updateValue(this.inputValue, {
          formatInput: false,
          hidePopover: false,
          adjustPageRange: true,
          debounce: this.inputDebounce_
        });
      }
    },

    inputChange() {
      this.updateValue(this.inputValue, {
        formatInput: true,
        hidePopover: false,
        adjustPageRange: false
      });
    },

    inputKeyup(e) {
      // Escape key
      if (e.keyCode === 27) {
        this.updateValue(this.value_, {
          formatInput: true,
          hidePopover: true,
          adjustPageRange: false
        });
      }
    },

    updateValue(value = this.inputValue, {
      formatInput,
      hidePopover,
      adjustPageRange,
      debounce
    } = {}) {
      var _this4 = this;

      clearTimeout(this.updateTimeout);

      if (debounce === undefined || debounce < 0) {
        this.forceUpdateValue(value, {
          formatInput,
          hidePopover,
          adjustPageRange
        });
      } else {
        this.updateTimeout = setTimeout(function () {
          _this4.updateTimeout = null;

          _this4.forceUpdateValue(value, {
            formatInput,
            hidePopover,
            adjustPageRange
          });
        }, debounce);
      }
    },

    forceUpdateValue(value, {
      formatInput,
      hidePopover,
      adjustPageRange
    }) {
      // Reassign input value for good measure
      this.inputValue = Object(utils_["m" /* isString */])(value) ? value : this.inputValue; // Parse value if needed

      const userValue = Object(utils_["m" /* isString */])(value) ? this.picker.parse(value) : value; // Set state for handling value change

      this.doFormatInput = formatInput;
      this.doHidePopover = hidePopover;
      this.doAdjustPageRange = adjustPageRange; // Sanitize and assign new value

      this.value_ = this.picker.filterDisabled({
        value: this.picker.normalize(userValue),
        disabled: this.disabledAttribute,
        fallbackValue: this.value_
      });
    },

    formatInput() {
      var _this5 = this;

      this.$nextTick(function () {
        const value = _this5.picker.hasValue(_this5.dragValue) ? _this5.dragValue : _this5.value_;
        _this5.inputValue = _this5.picker.format(value);
      });
    },

    hidePopover() {
      const popover = this.$refs.popover;

      if (popover) {
        popover.hide({
          priority: 10,
          delay: 250
        });
      }
    },

    adjustPageRange() {
      if (this.picker.hasValue(this.value_) && this.$refs.calendar) {
        this.$refs.calendar.showPageRange(this.picker.getPageRange(this.value_));
      }
    }

  }
});
// CONCATENATED MODULE: ./src/components/DatePicker.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_DatePickervue_type_script_lang_js_ = (DatePickervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./src/components/DatePicker.vue?vue&type=style&index=0&id=56ae83be&lang=postcss&scoped=true&
var DatePickervue_type_style_index_0_id_56ae83be_lang_postcss_scoped_true_ = __webpack_require__("d0d6");

// CONCATENATED MODULE: ./src/components/DatePicker.vue
var DatePicker_render, DatePicker_staticRenderFns





/* normalize component */

var DatePicker_component = normalizeComponent(
  components_DatePickervue_type_script_lang_js_,
  DatePicker_render,
  DatePicker_staticRenderFns,
  false,
  null,
  "56ae83be",
  null
  
)

/* harmony default export */ var DatePicker = (DatePicker_component.exports);
// CONCATENATED MODULE: ./src/components/index.js







/***/ }),

/***/ "2b03":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

module.exports = baseFindIndex;


/***/ }),

/***/ "2b10":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

module.exports = baseSlice;


/***/ }),

/***/ "2b3e":
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__("585a");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "2b4c":
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__("5537")('wks');
var uid = __webpack_require__("ca5a");
var Symbol = __webpack_require__("7726").Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ "2c66":
/***/ (function(module, exports, __webpack_require__) {

var SetCache = __webpack_require__("d612"),
    arrayIncludes = __webpack_require__("8db3"),
    arrayIncludesWith = __webpack_require__("5edf"),
    cacheHas = __webpack_require__("c584"),
    createSet = __webpack_require__("750a"),
    setToArray = __webpack_require__("ac41");

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;


/***/ }),

/***/ "2d00":
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "2d7c":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),

/***/ "2d95":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "2dcb":
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__("91e9");

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),

/***/ "2ec1":
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__("100e"),
    isIterateeCall = __webpack_require__("9aff");

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;


/***/ }),

/***/ "2fa3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return evalFn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return pageIsValid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return pageIsBeforePage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return pageIsAfterPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return pageIsBetweenPages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return pageIsEqualToPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return pageForDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addPages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return pageForThisMonth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return pageForNextMonth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return pageForPrevMonth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return getMaxPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return datesAreEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return arrayHasItems; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return findAncestor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return elementHasAncestor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return elementPositionInAncestor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return mixinOptionalProps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return on; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return off; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return elementContains; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return onSpaceOrEnter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return createGuid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return hash; });
/* harmony import */ var _Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("bd86");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("6b54");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("ac6a");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("9404");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(_Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


const evalFn = function evalFn(fn, args) {
  return Object(___WEBPACK_IMPORTED_MODULE_3__[/* isFunction */ "j"])(fn) ? fn(args) : fn;
};
const pageIsValid = function pageIsValid(page) {
  return !!(page && page.month && page.year);
};
const pageIsBeforePage = function pageIsBeforePage(page, comparePage) {
  if (!pageIsValid(page) || !pageIsValid(comparePage)) return false;
  if (page.year === comparePage.year) return page.month < comparePage.month;
  return page.year < comparePage.year;
};
const pageIsAfterPage = function pageIsAfterPage(page, comparePage) {
  if (!pageIsValid(page) || !pageIsValid(comparePage)) return false;
  if (page.year === comparePage.year) return page.month > comparePage.month;
  return page.year > comparePage.year;
};
const pageIsBetweenPages = function pageIsBetweenPages(page, fromPage, toPage) {
  return (page || false) && !pageIsBeforePage(page, fromPage) && !pageIsAfterPage(page, toPage);
};
const pageIsEqualToPage = function pageIsEqualToPage(aPage, bPage) {
  if (!aPage && bPage) return false;
  if (aPage && !bPage) return false;
  if (!aPage && !bPage) return true;
  return aPage.month === bPage.month && aPage.year === bPage.year;
};
const pageForDate = function pageForDate(date) {
  if (!date) return null;
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
};
const addPages = function addPages({
  month,
  year
}, count) {
  const incr = count > 0 ? 1 : -1;

  for (let i = 0; i < Math.abs(count); i++) {
    month += incr;

    if (month > 12) {
      month = 1;
      year++;
    } else if (month < 1) {
      month = 12;
      year--;
    }
  }

  return {
    month,
    year
  };
};
const pageForThisMonth = function pageForThisMonth() {
  return pageForDate(new Date());
};
const pageForNextMonth = function pageForNextMonth() {
  return addPages(pageForThisMonth(), 1);
};
const pageForPrevMonth = function pageForPrevMonth() {
  return addPages(pageForThisMonth(), -1);
};
const getMaxPage = function getMaxPage(...args) {
  return args.reduce(function (prev, curr) {
    if (!prev) return curr;
    if (!curr) return prev;
    return pageIsAfterPage(curr, prev) ? curr : prev;
  });
};
function datesAreEqual(a, b) {
  const aIsDate = Object(___WEBPACK_IMPORTED_MODULE_3__[/* isDate */ "i"])(a);
  const bIsDate = Object(___WEBPACK_IMPORTED_MODULE_3__[/* isDate */ "i"])(b);
  if (!aIsDate && !bIsDate) return true;
  if (aIsDate !== bIsDate) return false;
  return a.getTime() === b.getTime();
}
const arrayHasItems = function arrayHasItems(array) {
  return Object(___WEBPACK_IMPORTED_MODULE_3__[/* isArray */ "h"])(array) && array.length;
};
const findAncestor = function findAncestor(el, fn) {
  if (!el) return null;
  if (fn && fn(el)) return el;
  return findAncestor(el.parentElement, fn);
};
const elementHasAncestor = function elementHasAncestor(el, ancestor) {
  return !!findAncestor(el, function (e) {
    return e === ancestor;
  });
};
const elementPositionInAncestor = function elementPositionInAncestor(el, ancestor) {
  let top = 0;
  let left = 0;

  do {
    top += el.offsetTop || 0;
    left += el.offsetLeft || 0;
    el = el.offsetParent;
  } while (el && el !== ancestor);

  return {
    top,
    left
  };
};
const mixinOptionalProps = function mixinOptionalProps(source, target, props) {
  const assigned = [];
  props.forEach(function (p) {
    const name = p.name || p.toString();
    const mixin = p.mixin;
    const validate = p.validate;

    if (Object.prototype.hasOwnProperty.call(source, name)) {
      const value = validate ? validate(source[name]) : source[name];
      target[name] = mixin && Object(___WEBPACK_IMPORTED_MODULE_3__[/* isObject */ "l"])(value) ? _objectSpread(_objectSpread({}, mixin), value) : value;
      assigned.push(name);
    }
  });
  return {
    target,
    assigned: assigned.length ? assigned : null
  };
};
const on = function on(element, event, handler) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false);
  }
};
const off = function off(element, event, handler) {
  if (element && event) {
    element.removeEventListener(event, handler, false);
  }
};
const elementContains = function elementContains(element, child) {
  return !!element && !!child && (element === child || element.contains(child));
};
const onSpaceOrEnter = function onSpaceOrEnter(event, handler) {
  if (event.key === ' ' || event.key === 'Enter') {
    handler(event);
    event.preventDefault();
  }
};
/* eslint-disable no-bitwise */

const createGuid = function createGuid() {
  function S4() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }

  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
};
function hash(str) {
  let hashcode = 0;
  let i = 0;
  let chr;
  if (str.length === 0) return hashcode;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hashcode = (hashcode << 5) - hashcode + chr;
    hashcode |= 0; // Convert to 32bit integer
  }

  return hashcode;
}
/* eslint-enable no-bitwise */

/***/ }),

/***/ "2fcc":
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),

/***/ "3092":
/***/ (function(module, exports, __webpack_require__) {

var arraySome = __webpack_require__("4284"),
    baseIteratee = __webpack_require__("badf"),
    baseSome = __webpack_require__("361d"),
    isArray = __webpack_require__("6747"),
    isIterateeCall = __webpack_require__("9aff");

/**
 * Checks if `predicate` returns truthy for **any** element of `collection`.
 * Iteration is stopped once `predicate` returns truthy. The predicate is
 * invoked with three arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 * @example
 *
 * _.some([null, 0, 'yes', false], Boolean);
 * // => true
 *
 * var users = [
 *   { 'user': 'barney', 'active': true },
 *   { 'user': 'fred',   'active': false }
 * ];
 *
 * // The `_.matches` iteratee shorthand.
 * _.some(users, { 'user': 'barney', 'active': false });
 * // => false
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.some(users, ['active', false]);
 * // => true
 *
 * // The `_.property` iteratee shorthand.
 * _.some(users, 'active');
 * // => true
 */
function some(collection, predicate, guard) {
  var func = isArray(collection) ? arraySome : baseSome;
  if (guard && isIterateeCall(collection, predicate, guard)) {
    predicate = undefined;
  }
  return func(collection, baseIteratee(predicate, 3));
}

module.exports = some;


/***/ }),

/***/ "30c9":
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__("9520"),
    isLength = __webpack_require__("b218");

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ "32b3":
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__("872a"),
    eq = __webpack_require__("9638");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),

/***/ "32e9":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("86cc");
var createDesc = __webpack_require__("4630");
module.exports = __webpack_require__("9e1e") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "32f4":
/***/ (function(module, exports, __webpack_require__) {

var arrayFilter = __webpack_require__("2d7c"),
    stubArray = __webpack_require__("d327");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),

/***/ "34ac":
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__("9520"),
    isMasked = __webpack_require__("1368"),
    isObject = __webpack_require__("1a8c"),
    toSource = __webpack_require__("dc57");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "34e9":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("bd86");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("ac6a");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("2af9");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("ed08");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "c", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["Calendar"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "d", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["CalendarNav"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "f", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["DatePicker"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "g", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["Grid"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "i", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["Popover"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "j", function() { return _components__WEBPACK_IMPORTED_MODULE_2__["PopoverRef"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "a", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["Attribute"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "b", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["AttributeStore"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "e", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["DateInfo"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "h", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["Locale"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "k", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["addHorizontalSwipeHandler"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "l", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["addPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "m", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["addTapOrClickHandler"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "n", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["arrayHasItems"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "o", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["createGuid"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "p", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["datesAreEqual"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "r", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["elementContains"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "s", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["elementHasAncestor"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "t", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["elementPositionInAncestor"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "u", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["evalFn"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "v", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["findAncestor"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "w", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["getMaxPage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "x", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["hash"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "y", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["mixinOptionalProps"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "z", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["off"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "A", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["on"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "B", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["onSpaceOrEnter"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "C", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageForDate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "D", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageForNextMonth"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "E", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageForPrevMonth"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "F", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageForThisMonth"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "G", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageIsAfterPage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "H", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageIsBeforePage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "I", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageIsBetweenPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "J", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageIsEqualToPage"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "K", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["pageIsValid"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "L", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["setupCalendar"]; });




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(_Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


 // Declare install function executed by Vue.use()

function install(Vue, opts) {
  // Don't install more than once
  if (install.installed) return;
  install.installed = true; // Manually setup calendar with options

  const defaults = _utils__WEBPACK_IMPORTED_MODULE_3__["setupCalendar"](opts); // Register components

  Object.entries(_components__WEBPACK_IMPORTED_MODULE_2__).forEach(function ([componentName, component]) {
    Vue.component(`${defaults.componentPrefix}${componentName}`, component);
  });
} // Create module definition for Vue.use()


const plugin = _objectSpread(_objectSpread({
  install
}, _components__WEBPACK_IMPORTED_MODULE_2__), _utils__WEBPACK_IMPORTED_MODULE_3__); // Use automatically when global Vue instance detected


let GlobalVue = null;

if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}

if (GlobalVue) {
  GlobalVue.use(plugin);
} // Default export is library as a whole, registered via Vue.use()


/* harmony default export */ __webpack_exports__["q"] = (plugin); // Allow component use individually

 // Allow util use individually


/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba")))

/***/ }),

/***/ "35e8":
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__("d9f6");
var createDesc = __webpack_require__("aebd");
module.exports = __webpack_require__("8e60") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "361d":
/***/ (function(module, exports, __webpack_require__) {

var baseEach = __webpack_require__("48a0");

/**
 * The base implementation of `_.some` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function baseSome(collection, predicate) {
  var result;

  baseEach(collection, function(value, index, collection) {
    result = predicate(value, index, collection);
    return !result;
  });
  return !!result;
}

module.exports = baseSome;


/***/ }),

/***/ "3698":
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "3729":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69"),
    getRawTag = __webpack_require__("00fd"),
    objectToString = __webpack_require__("29f3");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "375a":
/***/ (function(module, exports, __webpack_require__) {

var createCompounder = __webpack_require__("b20a");

/**
 * Converts `string` to
 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the kebab cased string.
 * @example
 *
 * _.kebabCase('Foo Bar');
 * // => 'foo-bar'
 *
 * _.kebabCase('fooBar');
 * // => 'foo-bar'
 *
 * _.kebabCase('__FOO_BAR__');
 * // => 'foo-bar'
 */
var kebabCase = createCompounder(function(result, word, index) {
  return result + (index ? '-' : '') + word.toLowerCase();
});

module.exports = kebabCase;


/***/ }),

/***/ "3818":
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__("7e64"),
    arrayEach = __webpack_require__("8057"),
    assignValue = __webpack_require__("32b3"),
    baseAssign = __webpack_require__("5b01"),
    baseAssignIn = __webpack_require__("0f0f"),
    cloneBuffer = __webpack_require__("e538"),
    copyArray = __webpack_require__("4359"),
    copySymbols = __webpack_require__("54eb"),
    copySymbolsIn = __webpack_require__("1041"),
    getAllKeys = __webpack_require__("a994"),
    getAllKeysIn = __webpack_require__("1bac"),
    getTag = __webpack_require__("42a2"),
    initCloneArray = __webpack_require__("c87c"),
    initCloneByTag = __webpack_require__("c2b6"),
    initCloneObject = __webpack_require__("fa21"),
    isArray = __webpack_require__("6747"),
    isBuffer = __webpack_require__("0d24"),
    isMap = __webpack_require__("cc45"),
    isObject = __webpack_require__("1a8c"),
    isSet = __webpack_require__("d7ee"),
    keys = __webpack_require__("ec69");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),

/***/ "3846":
/***/ (function(module, exports, __webpack_require__) {

// 21.2.5.3 get RegExp.prototype.flags()
if (__webpack_require__("9e1e") && /./g.flags != 'g') __webpack_require__("86cc").f(RegExp.prototype, 'flags', {
  configurable: true,
  get: __webpack_require__("0bfb")
});


/***/ }),

/***/ "3852":
/***/ (function(module, exports, __webpack_require__) {

var baseHas = __webpack_require__("96f3"),
    hasPath = __webpack_require__("e2c0");

/**
 * Checks if `path` is a direct property of `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': 2 } };
 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b');
 * // => true
 *
 * _.has(object, ['a', 'b']);
 * // => true
 *
 * _.has(other, 'a');
 * // => false
 */
function has(object, path) {
  return object != null && hasPath(object, path, baseHas);
}

module.exports = has;


/***/ }),

/***/ "386d":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anObject = __webpack_require__("cb7c");
var sameValue = __webpack_require__("83a1");
var regExpExec = __webpack_require__("5f1b");

// @@search logic
__webpack_require__("214f")('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative($search, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});


/***/ }),

/***/ "38fd":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__("69a8");
var toObject = __webpack_require__("4bf8");
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),

/***/ "39ff":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07"),
    root = __webpack_require__("2b3e");

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),

/***/ "3b2b":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var inheritIfRequired = __webpack_require__("5dbc");
var dP = __webpack_require__("86cc").f;
var gOPN = __webpack_require__("9093").f;
var isRegExp = __webpack_require__("aae3");
var $flags = __webpack_require__("0bfb");
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (__webpack_require__("9e1e") && (!CORRECT_NEW || __webpack_require__("79e5")(function () {
  re2[__webpack_require__("2b4c")('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  __webpack_require__("2aba")(global, 'RegExp', $RegExp);
}

__webpack_require__("7a56")('RegExp');


/***/ }),

/***/ "3b4a":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07");

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ "3bb4":
/***/ (function(module, exports, __webpack_require__) {

var isStrictComparable = __webpack_require__("08cc"),
    keys = __webpack_require__("ec69");

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

module.exports = getMatchData;


/***/ }),

/***/ "3d14":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarPane_vue_vue_type_style_index_0_id_4a5f2beb_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("c724");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarPane_vue_vue_type_style_index_0_id_4a5f2beb_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarPane_vue_vue_type_style_index_0_id_4a5f2beb_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarPane_vue_vue_type_style_index_0_id_4a5f2beb_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "3eea":
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__("7948"),
    baseClone = __webpack_require__("3818"),
    baseUnset = __webpack_require__("4bb5"),
    castPath = __webpack_require__("e2e4"),
    copyObject = __webpack_require__("8eeb"),
    customOmitClone = __webpack_require__("e0e7"),
    flatRest = __webpack_require__("c6cf"),
    getAllKeysIn = __webpack_require__("1bac");

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = arrayMap(paths, function(path) {
    path = castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  copyObject(object, getAllKeysIn(object), result);
  if (isDeep) {
    result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    baseUnset(result, paths[length]);
  }
  return result;
});

module.exports = omit;


/***/ }),

/***/ "3f84":
/***/ (function(module, exports, __webpack_require__) {

var apply = __webpack_require__("85e3"),
    baseRest = __webpack_require__("100e"),
    customDefaultsMerge = __webpack_require__("e031"),
    mergeWith = __webpack_require__("2411");

/**
 * This method is like `_.defaults` except that it recursively assigns
 * default properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaults
 * @example
 *
 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
 * // => { 'a': { 'b': 2, 'c': 3 } }
 */
var defaultsDeep = baseRest(function(args) {
  args.push(undefined, customDefaultsMerge);
  return apply(mergeWith, undefined, args);
});

module.exports = defaultsDeep;


/***/ }),

/***/ "41a0":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__("2aeb");
var descriptor = __webpack_require__("4630");
var setToStringTag = __webpack_require__("7f20");
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__("32e9")(IteratorPrototype, __webpack_require__("2b4c")('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),

/***/ "41c3":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("1a8c"),
    isPrototype = __webpack_require__("eac5"),
    nativeKeysIn = __webpack_require__("ec8c");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),

/***/ "4245":
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__("1290");

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),

/***/ "4284":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

module.exports = arraySome;


/***/ }),

/***/ "42a2":
/***/ (function(module, exports, __webpack_require__) {

var DataView = __webpack_require__("b5a7"),
    Map = __webpack_require__("79bc"),
    Promise = __webpack_require__("1cec"),
    Set = __webpack_require__("c869"),
    WeakMap = __webpack_require__("39ff"),
    baseGetTag = __webpack_require__("3729"),
    toSource = __webpack_require__("dc57");

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),

/***/ "4359":
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),

/***/ "4416":
/***/ (function(module, exports) {

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

module.exports = last;


/***/ }),

/***/ "454f":
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__("46a7");
var $Object = __webpack_require__("584a").Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),

/***/ "4588":
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ "4630":
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "46a7":
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__("63b6");
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__("8e60"), 'Object', { defineProperty: __webpack_require__("d9f6").f });


/***/ }),

/***/ "47f5":
/***/ (function(module, exports, __webpack_require__) {

var baseFindIndex = __webpack_require__("2b03"),
    baseIsNaN = __webpack_require__("d9a8"),
    strictIndexOf = __webpack_require__("099a");

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;


/***/ }),

/***/ "48a0":
/***/ (function(module, exports, __webpack_require__) {

var baseForOwn = __webpack_require__("242e"),
    createBaseEach = __webpack_require__("950a");

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

module.exports = baseEach;


/***/ }),

/***/ "4917":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anObject = __webpack_require__("cb7c");
var toLength = __webpack_require__("9def");
var advanceStringIndex = __webpack_require__("0390");
var regExpExec = __webpack_require__("5f1b");

// @@match logic
__webpack_require__("214f")('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      if (!rx.global) return regExpExec(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});


/***/ }),

/***/ "499e":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "default", function() { return /* binding */ addStylesClient; });

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ "49e7":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-svg-icon[data-v-63f7b5ec]{display:inline-block;stroke:currentColor;stroke-width:0}.vc-svg-icon path[data-v-63f7b5ec]{fill:currentColor}", ""]);

// exports


/***/ }),

/***/ "49f4":
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__("6044");

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),

/***/ "4bb5":
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__("e2e4"),
    last = __webpack_require__("4416"),
    parent = __webpack_require__("8296"),
    toKey = __webpack_require__("f4d6");

/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}

module.exports = baseUnset;


/***/ }),

/***/ "4bf8":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__("be13");
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),

/***/ "4caa":
/***/ (function(module, exports, __webpack_require__) {

var deburrLetter = __webpack_require__("a919"),
    toString = __webpack_require__("76dd");

/** Used to match Latin Unicode letters (excluding mathematical operators). */
var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

/** Used to compose unicode character classes. */
var rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;

/** Used to compose unicode capture groups. */
var rsCombo = '[' + rsComboRange + ']';

/**
 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
 */
var reComboMark = RegExp(rsCombo, 'g');

/**
 * Deburrs `string` by converting
 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
 * letters to basic Latin letters and removing
 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to deburr.
 * @returns {string} Returns the deburred string.
 * @example
 *
 * _.deburr('déjà vu');
 * // => 'deja vu'
 */
function deburr(string) {
  string = toString(string);
  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
}

module.exports = deburr;


/***/ }),

/***/ "4cfe":
/***/ (function(module, exports) {

/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 *
 * _.isUndefined(null);
 * // => false
 */
function isUndefined(value) {
  return value === undefined;
}

module.exports = isUndefined;


/***/ }),

/***/ "4d8c":
/***/ (function(module, exports, __webpack_require__) {

var baseFlatten = __webpack_require__("5c69");

/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}

module.exports = flatten;


/***/ }),

/***/ "4f50":
/***/ (function(module, exports, __webpack_require__) {

var assignMergeValue = __webpack_require__("b760"),
    cloneBuffer = __webpack_require__("e538"),
    cloneTypedArray = __webpack_require__("c8fe"),
    copyArray = __webpack_require__("4359"),
    initCloneObject = __webpack_require__("fa21"),
    isArguments = __webpack_require__("d370"),
    isArray = __webpack_require__("6747"),
    isArrayLikeObject = __webpack_require__("dcbe"),
    isBuffer = __webpack_require__("0d24"),
    isFunction = __webpack_require__("9520"),
    isObject = __webpack_require__("1a8c"),
    isPlainObject = __webpack_require__("60ed"),
    isTypedArray = __webpack_require__("73ac"),
    safeGet = __webpack_require__("8adb"),
    toPlainObject = __webpack_require__("8de2");

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;


/***/ }),

/***/ "501e":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == numberTag);
}

module.exports = isNumber;


/***/ }),

/***/ "50d8":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ "51ec":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return setupDefaults; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return defaultsMixin; });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("8bbf");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("9404");
/* harmony import */ var _touch_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("23a5");
var _touch_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t("23a5", 1);
/* harmony import */ var _masks_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("7efe");
var _masks_json__WEBPACK_IMPORTED_MODULE_3___namespace = /*#__PURE__*/__webpack_require__.t("7efe", 1);
/* harmony import */ var _screens_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("85a9");
var _screens_json__WEBPACK_IMPORTED_MODULE_4___namespace = /*#__PURE__*/__webpack_require__.t("85a9", 1);
/* harmony import */ var _theme__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("5ca5");
/* harmony import */ var _locales__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("f15d");
// Vue won't get included in bundle as it is externalized
// https://cli.vuejs.org/guide/build-targets.html#library







const pluginDefaults = {
  componentPrefix: 'v',
  navVisibility: 'click',
  titlePosition: 'center',
  transition: 'slide-h',
  touch: _touch_json__WEBPACK_IMPORTED_MODULE_2__,
  masks: _masks_json__WEBPACK_IMPORTED_MODULE_3__,
  screens: _screens_json__WEBPACK_IMPORTED_MODULE_4__,
  theme: _theme__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"],
  locales: _locales__WEBPACK_IMPORTED_MODULE_6__[/* default */ "a"],
  datePicker: {
    updateOnInput: true,
    inputDebounce: 1000,
    popover: {
      visibility: 'hover-focus',
      placement: 'bottom-start',
      keepVisibleOnInput: false
    }
  }
};
let defaults_ = null;
const setupDefaults = function setupDefaults(opts) {
  if (!defaults_) {
    defaults_ = new vue__WEBPACK_IMPORTED_MODULE_0___default.a({
      data() {
        return {
          defaults: Object(___WEBPACK_IMPORTED_MODULE_1__[/* defaultsDeep */ "c"])(opts, pluginDefaults)
        };
      },

      computed: {
        locales() {
          var _this = this;

          return Object(___WEBPACK_IMPORTED_MODULE_1__[/* mapValues */ "q"])(this.defaults.locales, function (v) {
            v.masks = Object(___WEBPACK_IMPORTED_MODULE_1__[/* defaultsDeep */ "c"])(v.masks, _this.defaults.masks);
            return v;
          });
        }

      }
    });
  }

  return defaults_.defaults;
};
const defaultsMixin = {
  beforeCreate() {
    setupDefaults();
  },

  computed: {
    $defaults() {
      return defaults_.defaults;
    },

    $locales() {
      return defaults_.locales;
    }

  }
};

/***/ }),

/***/ "520a":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var regexpFlags = __webpack_require__("0bfb");

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ "52a7":
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),

/***/ "54eb":
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__("8eeb"),
    getSymbols = __webpack_require__("32f4");

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),

/***/ "5537":
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__("8378");
var global = __webpack_require__("7726");
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__("2d00") ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "55a3":
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),

/***/ "57a5":
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__("91e9");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),

/***/ "584a":
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "585a":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba")))

/***/ }),

/***/ "5b01":
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__("8eeb"),
    keys = __webpack_require__("ec69");

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),

/***/ "5c69":
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__("087d"),
    isFlattenable = __webpack_require__("0621");

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

module.exports = baseFlatten;


/***/ }),

/***/ "5ca1":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("7726");
var core = __webpack_require__("8378");
var hide = __webpack_require__("32e9");
var redefine = __webpack_require__("2aba");
var ctx = __webpack_require__("9b43");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "5ca5":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony default export */ __webpack_exports__["a"] = ({
  color: 'blue',
  isDark: false,
  container: {
    light: 'vc-text-gray-900 vc-bg-white vc-border vc-border-gray-400 vc-rounded-lg',
    dark: 'vc-text-gray-200 vc-bg-gray-900 vc-border vc-border-gray-700 vc-rounded-lg'
  },
  header: {
    light: 'vc-text-gray-900',
    dark: 'vc-text-gray-200'
  },
  title: {
    light: 'vc-text-lg vc-text-gray-800 vc-font-semibold hover:vc-opacity-75',
    dark: 'vc-text-lg vc-text-gray-100 vc-font-semibold hover:vc-opacity-75'
  },
  arrows: {
    light: 'vc-text-gray-600 vc-rounded vc-border-2 vc-border-transparent hover:vc-opacity-50 hover:vc-bg-gray-300 focus:vc-border-gray-300',
    dark: 'vc-text-white vc-rounded vc-border-2 vc-border-transparent hover:vc-opacity-50 focus:vc-border-gray-700'
  },
  weekdays: {
    light: 'vc-text-sm vc-font-bold vc-text-gray-500',
    dark: 'vc-text-sm vc-font-bold vc-text-{color}-200'
  },
  navPopoverContainer: {
    light: 'vc-rounded-lg vc-text-sm vc-font-semibold vc-text-white vc-bg-gray-800 vc-border vc-border-gray-700 vc-p-1 vc-shadow',
    dark: 'vc-rounded-lg vc-text-sm vc-font-semibold vc-text-gray-800 vc-bg-white vc-border vc-border-gray-100 vc-p-1 vc-shadow'
  },
  navTitle: {
    light: 'vc-text-{color}-100 vc-font-bold vc-leading-snug vc-px-2 vc-py-1 vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-900 focus:vc-border-{color}-600',
    dark: 'vc-text-gray-900 vc-font-bold vc-leading-snug vc-px-2 vc-py-1 vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-200 focus:vc-border-{color}-400'
  },
  navArrows: {
    light: 'vc-leading-snug vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-900 focus:vc-border-{color}-600',
    dark: 'vc-leading-snug vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-200 focus:vc-border-{color}-400'
  },
  navCell: {
    light: 'vc-w-12 vc-font-semibold vc-cursor-pointer vc-text-center vc-leading-snug vc-py-1 vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-900 hover:vc-shadow-inner hover:vc-text-white focus:vc-border-{color}-600',
    dark: 'vc-w-12 vc-font-semibold vc-cursor-pointer vc-text-center vc-leading-snug vc-py-1 vc-rounded vc-border-2 vc-border-transparent hover:vc-bg-gray-200 hover:vc-text-gray-900 focus:vc-border-{color}-400'
  },
  navCellInactive: 'vc-border-transparent',
  navCellInactiveCurrent: {
    light: 'vc-text-{color}-100 vc-font-bold vc-border-{color}-100',
    dark: 'vc-text-{color}-600 vc-font-bold vc-border-{color}-500'
  },
  navCellActive: {
    light: 'vc-bg-{color}-100 vc-text-{color}-900 vc-border-transparent vc-font-bold vc-shadow',
    dark: 'vc-bg-{color}-500 vc-text-white vc-border-transparent vc-font-bold vc-shadow'
  },
  dayNotInMonth: 'vc-opacity-0 vc-pointer-events-none',
  dayContent: 'vc-font-medium vc-text-sm vc-cursor-pointer focus:vc-font-bold vc-rounded-full',
  dayContentDisabled: {
    light: 'vc-text-gray-400',
    dark: 'vc-text-gray-600'
  },
  dayPopoverContainer: {
    light: 'vc-rounded vc-text-xs vc-text-white vc-font-medium vc-bg-gray-800 vc-border vc-border-gray-700 vc-px-2 vc-py-1 vc-shadow',
    dark: 'vc-rounded vc-text-xs vc-text-gray-900 vc-font-medium vc-bg-white vc-border vc-border-gray-200 vc-px-2 vc-py-1 vc-shadow'
  },
  dayPopoverHeader: {
    light: 'vc-text-xs vc-text-gray-300 vc-font-semibold',
    dark: 'vc-text-xs vc-text-gray-700 vc-font-semibold'
  },
  highlightBaseFillMode: 'light',
  highlightStartEndFillMode: 'solid',
  highlightStartEndClass: 'vc-rounded-full',
  bgLow: {
    light: 'vc-bg-white vc-border-2 vc-border-{color}-700',
    dark: 'vc-bg-gray-900 vc-border-2 vc-border-{color}-200'
  },
  bgAccentLow: {
    light: 'vc-bg-{color}-200',
    dark: 'vc-bg-{color}-800 vc-opacity-75'
  },
  bgAccentHigh: {
    light: 'vc-bg-{color}-600',
    dark: 'vc-bg-{color}-500'
  },
  contentAccent: {
    light: 'vc-font-bold vc-text-{color}-900',
    dark: 'vc-font-bold vc-text-{color}-100'
  },
  contentAccentContrast: 'vc-font-bold vc-text-white',
  datePickerInput: 'vc-appearance-none vc-text-base vc-text-gray-800 vc-bg-white vc-border vc-border-gray-400 vc-rounded vc-w-full vc-py-2 vc-px-3 vc-leading-tight focus:vc-outline-none focus:vc-shadow',
  datePickerInputDrag: 'vc-appearance-none vc-text-base vc-text-gray-500 vc-bg-white vc-border vc-border-gray-400 vc-rounded vc-w-full vc-py-2 vc-px-3 vc-leading-tight focus:vc-outline-none focus:vc-shadow'
});

/***/ }),

/***/ "5cab":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("961c");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("bce10684", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "5d89":
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__("f8af");

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),

/***/ "5dbc":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
var setPrototypeOf = __webpack_require__("8b97").set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};


/***/ }),

/***/ "5e2e":
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__("28c9"),
    listCacheDelete = __webpack_require__("69d5"),
    listCacheGet = __webpack_require__("b4c0"),
    listCacheHas = __webpack_require__("fba5"),
    listCacheSet = __webpack_require__("67ca");

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),

/***/ "5edf":
/***/ (function(module, exports) {

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

module.exports = arrayIncludesWith;


/***/ }),

/***/ "5f1b":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var classof = __webpack_require__("23c6");
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};


/***/ }),

/***/ "5fa8":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, "[data-v-56ae83be] .vc-container{border:none}", ""]);

// exports


/***/ }),

/***/ "6044":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07");

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),

/***/ "60ed":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    getPrototype = __webpack_require__("2dcb"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;


/***/ }),

/***/ "613b":
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__("5537")('keys');
var uid = __webpack_require__("ca5a");
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),

/***/ "6220":
/***/ (function(module, exports, __webpack_require__) {

var baseIsDate = __webpack_require__("b1d2"),
    baseUnary = __webpack_require__("b047"),
    nodeUtil = __webpack_require__("99d3");

/* Node.js helper references. */
var nodeIsDate = nodeUtil && nodeUtil.isDate;

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
 * @example
 *
 * _.isDate(new Date);
 * // => true
 *
 * _.isDate('Mon April 23 2012');
 * // => false
 */
var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

module.exports = isDate;


/***/ }),

/***/ "626a":
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__("2d95");
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ "62e4":
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "6300":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("5fa8");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("896f0928", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "63b6":
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__("e53d");
var core = __webpack_require__("584a");
var ctx = __webpack_require__("d864");
var hide = __webpack_require__("35e8");
var has = __webpack_require__("07e3");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "642a":
/***/ (function(module, exports, __webpack_require__) {

var baseIsMatch = __webpack_require__("966f"),
    getMatchData = __webpack_require__("3bb4"),
    matchesStrictComparable = __webpack_require__("20ec");

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;


/***/ }),

/***/ "656b":
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__("e2e4"),
    toKey = __webpack_require__("f4d6");

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;


/***/ }),

/***/ "6679":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike(value) && baseGetTag(value) == boolTag);
}

module.exports = isBoolean;


/***/ }),

/***/ "6747":
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "67ca":
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__("cb5a");

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),

/***/ "6821":
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__("626a");
var defined = __webpack_require__("be13");
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),

/***/ "694d":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-container{--slide-translate:22px;--slide-duration:0.15s;--slide-timing:ease;--header-padding:10px 10px 0 10px;--title-padding:0 8px;--arrows-padding:8px 10px;--arrow-font-size:26px;--weekday-padding:5px 0;--weeks-padding:5px 6px 7px 6px;--nav-container-width:170px;--day-min-height:28px;--day-content-width:28px;--day-content-height:28px;--day-content-margin:1.6px auto;--day-content-transition-time:0.13s ease-in;--day-content-bg-color-hover:rgba(204,214,224,0.3);--day-content-dark-bg-color-hover:rgba(114,129,151,0.3);--day-content-bg-color-focus:rgba(204,214,224,0.4);--day-content-dark-bg-color-focus:rgba(114,129,151,0.4);--highlight-height:28px;--dot-diameter:5px;--dot-border-radius:50%;--dot-spacing:3px;--bar-height:3px;--bars-width:75%;font-family:BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;position:relative;width:-webkit-max-content;width:max-content;-webkit-tap-highlight-color:transparent}.vc-arrows-container{width:100%;position:absolute;top:0;display:flex;justify-content:space-between;padding:var(--arrows-padding);pointer-events:none}.vc-arrows-container.title-left{justify-content:flex-end}.vc-arrows-container.title-right{justify-content:flex-start}", ""]);

// exports


/***/ }),

/***/ "69a8":
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "69d5":
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__("cb5a");

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),

/***/ "6a99":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__("d3f4");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "6ac0":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

module.exports = arrayReduce;


/***/ }),

/***/ "6b54":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__("3846");
var anObject = __webpack_require__("cb7c");
var $flags = __webpack_require__("0bfb");
var DESCRIPTORS = __webpack_require__("9e1e");
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  __webpack_require__("2aba")(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (__webpack_require__("79e5")(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}


/***/ }),

/***/ "6da8":
/***/ (function(module, exports) {

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

module.exports = asciiToArray;


/***/ }),

/***/ "6f6a":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("ee59");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("5ac13234", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "6f6c":
/***/ (function(module, exports) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),

/***/ "6fcd":
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__("50d8"),
    isArguments = __webpack_require__("d370"),
    isArray = __webpack_require__("6747"),
    isBuffer = __webpack_require__("0d24"),
    isIndex = __webpack_require__("c098"),
    isTypedArray = __webpack_require__("73ac");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ "72af":
/***/ (function(module, exports, __webpack_require__) {

var createBaseFor = __webpack_require__("99cd");

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

module.exports = baseFor;


/***/ }),

/***/ "72f0":
/***/ (function(module, exports) {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ "7365":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_PopoverRow_vue_vue_type_style_index_0_id_28ced894_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("87e8");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_PopoverRow_vue_vue_type_style_index_0_id_28ced894_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_PopoverRow_vue_vue_type_style_index_0_id_28ced894_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_PopoverRow_vue_vue_type_style_index_0_id_28ced894_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "73ac":
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__("743f"),
    baseUnary = __webpack_require__("b047"),
    nodeUtil = __webpack_require__("99d3");

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ "743f":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isLength = __webpack_require__("b218"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ "750a":
/***/ (function(module, exports, __webpack_require__) {

var Set = __webpack_require__("c869"),
    noop = __webpack_require__("bcdf"),
    setToArray = __webpack_require__("ac41");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
  return new Set(values);
};

module.exports = createSet;


/***/ }),

/***/ "7530":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("1a8c");

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),

/***/ "7559":
/***/ (function(module, exports) {

/** Used to match words composed of alphanumeric characters. */
var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

/**
 * Splits an ASCII `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function asciiWords(string) {
  return string.match(reAsciiWord) || [];
}

module.exports = asciiWords;


/***/ }),

/***/ "76dd":
/***/ (function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__("ce86");

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ }),

/***/ "7726":
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "77f1":
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__("4588");
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),

/***/ "7948":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;


/***/ }),

/***/ "794b":
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__("8e60") && !__webpack_require__("294c")(function () {
  return Object.defineProperty(__webpack_require__("1ec9")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "79aa":
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "79bc":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07"),
    root = __webpack_require__("2b3e");

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),

/***/ "79e5":
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "7a48":
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__("6044");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),

/***/ "7a56":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__("7726");
var dP = __webpack_require__("86cc");
var DESCRIPTORS = __webpack_require__("9e1e");
var SPECIES = __webpack_require__("2b4c")('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),

/***/ "7b83":
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__("7c64"),
    mapCacheDelete = __webpack_require__("93ed"),
    mapCacheGet = __webpack_require__("2478"),
    mapCacheHas = __webpack_require__("a524"),
    mapCacheSet = __webpack_require__("1fc8");

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),

/***/ "7b97":
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__("7e64"),
    equalArrays = __webpack_require__("a2be"),
    equalByTag = __webpack_require__("1c3c"),
    equalObjects = __webpack_require__("b1e5"),
    getTag = __webpack_require__("42a2"),
    isArray = __webpack_require__("6747"),
    isBuffer = __webpack_require__("0d24"),
    isTypedArray = __webpack_require__("73ac");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;


/***/ }),

/***/ "7c64":
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__("e24b"),
    ListCache = __webpack_require__("5e2e"),
    Map = __webpack_require__("79bc");

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),

/***/ "7d1f":
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__("087d"),
    isArray = __webpack_require__("6747");

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),

/***/ "7e64":
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__("5e2e"),
    stackClear = __webpack_require__("efb6"),
    stackDelete = __webpack_require__("2fcc"),
    stackGet = __webpack_require__("802a"),
    stackHas = __webpack_require__("55a3"),
    stackSet = __webpack_require__("d02c");

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),

/***/ "7e8e":
/***/ (function(module, exports) {

/** Used to detect strings that need a more robust regexp to match words. */
var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

/**
 * Checks if `string` contains a word composed of Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a word is found, else `false`.
 */
function hasUnicodeWord(string) {
  return reHasUnicodeWord.test(string);
}

module.exports = hasUnicodeWord;


/***/ }),

/***/ "7ed2":
/***/ (function(module, exports) {

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

module.exports = setCacheAdd;


/***/ }),

/***/ "7efe":
/***/ (function(module) {

module.exports = JSON.parse("{\"title\":\"MMMM YYYY\",\"weekdays\":\"W\",\"navMonths\":\"MMM\",\"input\":[\"L\",\"YYYY-MM-DD\",\"YYYY/MM/DD\"],\"dayPopover\":\"WWW, MMM D, YYYY\",\"data\":[\"L\",\"YYYY-MM-DD\",\"YYYY/MM/DD\"]}");

/***/ }),

/***/ "7f20":
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__("86cc").f;
var has = __webpack_require__("69a8");
var TAG = __webpack_require__("2b4c")('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ "802a":
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),

/***/ "8057":
/***/ (function(module, exports) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),

/***/ "8103":
/***/ (function(module, exports, __webpack_require__) {

var createCaseFirst = __webpack_require__("d194");

/**
 * Converts the first character of `string` to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.upperFirst('fred');
 * // => 'Fred'
 *
 * _.upperFirst('FRED');
 * // => 'FRED'
 */
var upperFirst = createCaseFirst('toUpperCase');

module.exports = upperFirst;


/***/ }),

/***/ "8296":
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__("656b"),
    baseSlice = __webpack_require__("2b10");

/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
function parent(object, path) {
  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}

module.exports = parent;


/***/ }),

/***/ "8378":
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "8384":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.clamp` which doesn't coerce arguments.
 *
 * @private
 * @param {number} number The number to clamp.
 * @param {number} [lower] The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 */
function baseClamp(number, lower, upper) {
  if (number === number) {
    if (upper !== undefined) {
      number = number <= upper ? number : upper;
    }
    if (lower !== undefined) {
      number = number >= lower ? number : lower;
    }
  }
  return number;
}

module.exports = baseClamp;


/***/ }),

/***/ "83a1":
/***/ (function(module, exports) {

// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};


/***/ }),

/***/ "84f2":
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "85a9":
/***/ (function(module) {

module.exports = JSON.parse("{\"sm\":\"640px\",\"md\":\"768px\",\"lg\":\"1024px\",\"xl\":\"1280px\"}");

/***/ }),

/***/ "85e3":
/***/ (function(module, exports) {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ "85f2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("454f");

/***/ }),

/***/ "8604":
/***/ (function(module, exports, __webpack_require__) {

var baseHasIn = __webpack_require__("26e8"),
    hasPath = __webpack_require__("e2c0");

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;


/***/ }),

/***/ "86aa":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Popover_vue_vue_type_style_index_0_id_7605e1b2_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("9349");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Popover_vue_vue_type_style_index_0_id_7605e1b2_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Popover_vue_vue_type_style_index_0_id_7605e1b2_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Popover_vue_vue_type_style_index_0_id_7605e1b2_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "86cc":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("cb7c");
var IE8_DOM_DEFINE = __webpack_require__("c69a");
var toPrimitive = __webpack_require__("6a99");
var dP = Object.defineProperty;

exports.f = __webpack_require__("9e1e") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "872a":
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__("3b4a");

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),

/***/ "87e8":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("c631");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("475a7ea0", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "89d9":
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__("656b"),
    baseSet = __webpack_require__("159a"),
    castPath = __webpack_require__("e2e4");

/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = baseGet(object, path);

    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}

module.exports = basePickBy;


/***/ }),

/***/ "8adb":
/***/ (function(module, exports) {

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;


/***/ }),

/***/ "8b97":
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__("d3f4");
var anObject = __webpack_require__("cb7c");
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__("9b43")(Function.call, __webpack_require__("11e9").f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),

/***/ "8bbf":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__8bbf__;

/***/ }),

/***/ "8c86":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return requiredArgs; });
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
  }
}

/***/ }),

/***/ "8db3":
/***/ (function(module, exports, __webpack_require__) {

var baseIndexOf = __webpack_require__("47f5");

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;


/***/ }),

/***/ "8de2":
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__("8eeb"),
    keysIn = __webpack_require__("9934");

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;


/***/ }),

/***/ "8e60":
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__("294c")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "8eeb":
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__("32b3"),
    baseAssignValue = __webpack_require__("872a");

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),

/***/ "9010":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SvgIcon_vue_vue_type_style_index_0_id_63f7b5ec_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("9740");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SvgIcon_vue_vue_type_style_index_0_id_63f7b5ec_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SvgIcon_vue_vue_type_style_index_0_id_63f7b5ec_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SvgIcon_vue_vue_type_style_index_0_id_63f7b5ec_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "9093":
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__("ce10");
var hiddenKeys = __webpack_require__("e11e").concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),

/***/ "91e9":
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),

/***/ "9349":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("b6dd");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("f4e80066", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "93495":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AttributeStore; });
/* harmony import */ var _Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("bd86");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("6b54");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("ac6a");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _attribute__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("22f3");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("2fa3");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(_Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }



class AttributeStore {
  constructor(theme, locale, attrs) {
    this.theme = theme;
    this.locale = locale;
    this.map = {};
    this.refresh(attrs, true);
  }

  refresh(attrs, reset) {
    var _this = this;

    const map = {};
    const list = [];
    let pinAttr = null; // Keep record of added and deleted attributes

    const adds = [];
    const deletes = reset ? new Set() : new Set(Object.keys(this.map));

    if (Object(_helpers__WEBPACK_IMPORTED_MODULE_4__[/* arrayHasItems */ "b"])(attrs)) {
      attrs.forEach(function (attr, i) {
        if (!attr || !attr.dates) return;
        const key = attr.key ? attr.key.toString() : i.toString();
        const order = attr.order || 0;
        const hashcode = Object(_helpers__WEBPACK_IMPORTED_MODULE_4__[/* hash */ "k"])(JSON.stringify(attr));
        let exAttr = _this.map[key]; // If just tracking delta changes and attribute hash hasn't changed

        if (!reset && exAttr && exAttr.hashcode === hashcode) {
          // ...don't need to replace the attribute
          deletes.delete(key);
        } else {
          // Otherwise, create attribute and add to the list of adds
          exAttr = new _attribute__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"](_objectSpread({
            key,
            order,
            hashcode
          }, attr), _this.theme, _this.locale);
          adds.push(exAttr);
        } // Keep track of attribute to pin for initial page


        if (exAttr && exAttr.pinPage) {
          pinAttr = exAttr;
        } // Add attribute to map and list


        map[key] = exAttr;
        list.push(exAttr);
      });
    }

    this.map = map;
    this.list = list;
    this.pinAttr = pinAttr;
    return {
      adds,
      deletes: Array.from(deletes)
    };
  }

}

/***/ }),

/***/ "93ed":
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__("4245");

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),

/***/ "9404":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export getType */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return isDate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return has; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return hasAny; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return some; });
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("6b54");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_isBoolean__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("6679");
/* harmony import */ var lodash_isBoolean__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_isBoolean__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_isNumber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("501e");
/* harmony import */ var lodash_isNumber__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_isNumber__WEBPACK_IMPORTED_MODULE_2__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "k", function() { return lodash_isNumber__WEBPACK_IMPORTED_MODULE_2___default.a; });
/* harmony import */ var lodash_isString__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("e2a0");
/* harmony import */ var lodash_isString__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_isString__WEBPACK_IMPORTED_MODULE_3__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "m", function() { return lodash_isString__WEBPACK_IMPORTED_MODULE_3___default.a; });
/* harmony import */ var lodash_isArrayLikeObject__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("dcbe");
/* harmony import */ var lodash_isArrayLikeObject__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash_isArrayLikeObject__WEBPACK_IMPORTED_MODULE_4__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "h", function() { return lodash_isArrayLikeObject__WEBPACK_IMPORTED_MODULE_4___default.a; });
/* harmony import */ var lodash_isFunction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("9520");
/* harmony import */ var lodash_isFunction__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash_isFunction__WEBPACK_IMPORTED_MODULE_5__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "j", function() { return lodash_isFunction__WEBPACK_IMPORTED_MODULE_5___default.a; });
/* harmony import */ var lodash_isUndefined__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("4cfe");
/* harmony import */ var lodash_isUndefined__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(lodash_isUndefined__WEBPACK_IMPORTED_MODULE_6__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "n", function() { return lodash_isUndefined__WEBPACK_IMPORTED_MODULE_6___default.a; });
/* harmony import */ var lodash_isNil__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("2768");
/* harmony import */ var lodash_isNil__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(lodash_isNil__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var lodash_isDate__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__("6220");
/* harmony import */ var lodash_isDate__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(lodash_isDate__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var lodash_clamp__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__("f678");
/* harmony import */ var lodash_clamp__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(lodash_clamp__WEBPACK_IMPORTED_MODULE_9__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "a", function() { return lodash_clamp__WEBPACK_IMPORTED_MODULE_9___default.a; });
/* harmony import */ var lodash_kebabCase__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__("375a");
/* harmony import */ var lodash_kebabCase__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(lodash_kebabCase__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var lodash_capitalize__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__("e9a7");
/* harmony import */ var lodash_capitalize__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(lodash_capitalize__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var lodash_upperFirst__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__("8103");
/* harmony import */ var lodash_upperFirst__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(lodash_upperFirst__WEBPACK_IMPORTED_MODULE_12__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "w", function() { return lodash_upperFirst__WEBPACK_IMPORTED_MODULE_12___default.a; });
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__("9b02");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_13__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "d", function() { return lodash_get__WEBPACK_IMPORTED_MODULE_13___default.a; });
/* harmony import */ var lodash_set__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__("0f5c");
/* harmony import */ var lodash_set__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(lodash_set__WEBPACK_IMPORTED_MODULE_14__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "s", function() { return lodash_set__WEBPACK_IMPORTED_MODULE_14___default.a; });
/* harmony import */ var lodash_mapValues__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__("9e86");
/* harmony import */ var lodash_mapValues__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(lodash_mapValues__WEBPACK_IMPORTED_MODULE_15__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "q", function() { return lodash_mapValues__WEBPACK_IMPORTED_MODULE_15___default.a; });
/* harmony import */ var lodash_toPairs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__("f542");
/* harmony import */ var lodash_toPairs__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(lodash_toPairs__WEBPACK_IMPORTED_MODULE_16__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "u", function() { return lodash_toPairs__WEBPACK_IMPORTED_MODULE_16___default.a; });
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__("95ae");
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(lodash_defaults__WEBPACK_IMPORTED_MODULE_17__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "b", function() { return lodash_defaults__WEBPACK_IMPORTED_MODULE_17___default.a; });
/* harmony import */ var lodash_defaultsDeep__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__("3f84");
/* harmony import */ var lodash_defaultsDeep__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(lodash_defaultsDeep__WEBPACK_IMPORTED_MODULE_18__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "c", function() { return lodash_defaultsDeep__WEBPACK_IMPORTED_MODULE_18___default.a; });
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__("2593");
/* harmony import */ var lodash_pick__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(lodash_pick__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__("3eea");
/* harmony import */ var lodash_omit__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(lodash_omit__WEBPACK_IMPORTED_MODULE_20__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "r", function() { return lodash_omit__WEBPACK_IMPORTED_MODULE_20___default.a; });
/* harmony import */ var lodash_has__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__("3852");
/* harmony import */ var lodash_has__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(lodash_has__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__("dd61");
/* harmony import */ var lodash_map__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(lodash_map__WEBPACK_IMPORTED_MODULE_22__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "p", function() { return lodash_map__WEBPACK_IMPORTED_MODULE_22___default.a; });
/* harmony import */ var lodash_head__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__("a59b");
/* harmony import */ var lodash_head__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(lodash_head__WEBPACK_IMPORTED_MODULE_23__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "g", function() { return lodash_head__WEBPACK_IMPORTED_MODULE_23___default.a; });
/* harmony import */ var lodash_last__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__("4416");
/* harmony import */ var lodash_last__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(lodash_last__WEBPACK_IMPORTED_MODULE_24__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "o", function() { return lodash_last__WEBPACK_IMPORTED_MODULE_24___default.a; });
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__("eed6");
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(lodash_uniq__WEBPACK_IMPORTED_MODULE_25__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "v", function() { return lodash_uniq__WEBPACK_IMPORTED_MODULE_25___default.a; });
/* harmony import */ var lodash_some__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__("3092");
/* harmony import */ var lodash_some__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(lodash_some__WEBPACK_IMPORTED_MODULE_26__);

// Type utils







 // Number utils

 // String utils



 // Object utils









 // Collection utils





 // Type checkers

const getType = function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
};
const isDate = function isDate(value) {
  return lodash_isDate__WEBPACK_IMPORTED_MODULE_8___default()(value) && !isNaN(value.getTime());
};
const isObject = function isObject(value) {
  return getType(value) === 'Object';
}; // Object utils

const has = lodash_has__WEBPACK_IMPORTED_MODULE_21___default.a;
const hasAny = function hasAny(obj, props) {
  return lodash_some__WEBPACK_IMPORTED_MODULE_26___default()(props, function (p) {
    return lodash_has__WEBPACK_IMPORTED_MODULE_21___default()(obj, p);
  });
}; // Collection utils

const some = lodash_some__WEBPACK_IMPORTED_MODULE_26___default.a;

/***/ }),

/***/ "950a":
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__("30c9");

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

module.exports = createBaseEach;


/***/ }),

/***/ "9520":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObject = __webpack_require__("1a8c");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "95ae":
/***/ (function(module, exports, __webpack_require__) {

var baseRest = __webpack_require__("100e"),
    eq = __webpack_require__("9638"),
    isIterateeCall = __webpack_require__("9aff"),
    keysIn = __webpack_require__("9934");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = baseRest(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

module.exports = defaults;


/***/ }),

/***/ "961c":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-day[data-v-2aac4f42]{position:relative;min-height:var(--day-min-height);width:100%;height:100%;z-index:1}.vc-day-layer[data-v-2aac4f42]{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none}.vc-day-box-center-center[data-v-2aac4f42]{display:flex;justify-content:center;align-items:center;height:100%;transform-origin:50% 50%}.vc-day-box-left-center[data-v-2aac4f42]{display:flex;justify-content:flex-start;align-items:center;height:100%;transform-origin:0 50%}.vc-day-box-right-center[data-v-2aac4f42]{display:flex;justify-content:flex-end;align-items:center;height:100%;transform-origin:100% 50%}.vc-day-box-center-bottom[data-v-2aac4f42]{display:flex;justify-content:center;align-items:flex-end}.vc-day-content[data-v-2aac4f42]{display:flex;justify-content:center;align-items:center;width:var(--day-content-width);height:var(--day-content-height);margin:var(--day-content-margin);-webkit-user-select:none;-ms-user-select:none;user-select:none}.vc-day-content[data-v-2aac4f42]:hover{background-color:var(--day-content-bg-color-hover)}.vc-day-content:hover.vc-is-dark[data-v-2aac4f42]{background-color:var(--day-content-dark-bg-color-hover)}.vc-day-content[data-v-2aac4f42]:focus{background-color:var(--day-content-bg-color-focus)}.vc-day-content:focus.vc-is-dark[data-v-2aac4f42]{background-color:var(--day-content-dark-bg-color-focus)}.vc-highlights[data-v-2aac4f42]{overflow:hidden;pointer-events:none;z-index:-1}.vc-highlight[data-v-2aac4f42]{width:var(--highlight-height);height:var(--highlight-height)}.vc-highlight.vc-highlight-base-start[data-v-2aac4f42]{width:50%!important;border-radius:0!important;border-right-width:0!important}.vc-highlight.vc-highlight-base-end[data-v-2aac4f42]{width:50%!important;border-radius:0!important;border-left-width:0!important}.vc-highlight.vc-highlight-base-middle[data-v-2aac4f42]{width:100%;border-radius:0!important;border-left-width:0!important;border-right-width:0!important;margin:0 -1px}.vc-dots[data-v-2aac4f42]{display:flex;justify-content:center;align-items:center}.vc-dot[data-v-2aac4f42]{width:var(--dot-diameter);height:var(--dot-diameter);border-radius:var(--dot-border-radius);transition:all var(--day-content-transition-time)}.vc-dot[data-v-2aac4f42]:not(:last-child){margin-right:var(--dot-spacing)}.vc-bars[data-v-2aac4f42]{display:flex;justify-content:flex-start;align-items:center;width:var(--bars-width)}.vc-bar[data-v-2aac4f42]{flex-grow:1;height:var(--bar-height);transition:all var(--day-content-transition-time)}", ""]);

// exports


/***/ }),

/***/ "9638":
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "966f":
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__("7e64"),
    baseIsEqual = __webpack_require__("c05f");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

module.exports = baseIsMatch;


/***/ }),

/***/ "96f3":
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  return object != null && hasOwnProperty.call(object, key);
}

module.exports = baseHas;


/***/ }),

/***/ "9740":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("49e7");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("90070284", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "97d3":
/***/ (function(module, exports, __webpack_require__) {

var baseEach = __webpack_require__("48a0"),
    isArrayLike = __webpack_require__("30c9");

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

module.exports = baseMap;


/***/ }),

/***/ "9934":
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__("6fcd"),
    baseKeysIn = __webpack_require__("41c3"),
    isArrayLike = __webpack_require__("30c9");

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),

/***/ "998b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Grid_vue_vue_type_style_index_0_id_3ca35a05_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("1349");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Grid_vue_vue_type_style_index_0_id_3ca35a05_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Grid_vue_vue_type_style_index_0_id_3ca35a05_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_6_oneOf_1_0_node_modules_css_loader_index_js_ref_6_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Grid_vue_vue_type_style_index_0_id_3ca35a05_scoped_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "99cd":
/***/ (function(module, exports) {

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

module.exports = createBaseFor;


/***/ }),

/***/ "99d3":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__("585a");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("62e4")(module)))

/***/ }),

/***/ "9aff":
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__("9638"),
    isArrayLike = __webpack_require__("30c9"),
    isIndex = __webpack_require__("c098"),
    isObject = __webpack_require__("1a8c");

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ "9b02":
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__("656b");

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;


/***/ }),

/***/ "9b43":
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__("d8e8");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "9c6c":
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__("2b4c")('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__("32e9")(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "9def":
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__("4588");
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ "9e1e":
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__("79e5")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "9e69":
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__("2b3e");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "9e86":
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__("872a"),
    baseForOwn = __webpack_require__("242e"),
    baseIteratee = __webpack_require__("badf");

/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see _.mapKeys
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * _.mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
function mapValues(object, iteratee) {
  var result = {};
  iteratee = baseIteratee(iteratee, 3);

  baseForOwn(object, function(value, key, object) {
    baseAssignValue(result, key, iteratee(value, key, object));
  });
  return result;
}

module.exports = mapValues;


/***/ }),

/***/ "a029":
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__("087d"),
    getPrototype = __webpack_require__("2dcb"),
    getSymbols = __webpack_require__("32f4"),
    stubArray = __webpack_require__("d327");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),

/***/ "a2be":
/***/ (function(module, exports, __webpack_require__) {

var SetCache = __webpack_require__("d612"),
    arraySome = __webpack_require__("4284"),
    cacheHas = __webpack_require__("c584");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!cacheHas(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;


/***/ }),

/***/ "a2db":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69");

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),

/***/ "a3fd":
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__("7948");

/**
 * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
 * of key-value pairs for `object` corresponding to the property names of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the key-value pairs.
 */
function baseToPairs(object, props) {
  return arrayMap(props, function(key) {
    return [key, object[key]];
  });
}

module.exports = baseToPairs;


/***/ }),

/***/ "a454":
/***/ (function(module, exports, __webpack_require__) {

var constant = __webpack_require__("72f0"),
    defineProperty = __webpack_require__("3b4a"),
    identity = __webpack_require__("cd9d");

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ "a481":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anObject = __webpack_require__("cb7c");
var toObject = __webpack_require__("4bf8");
var toLength = __webpack_require__("9def");
var toInteger = __webpack_require__("4588");
var advanceStringIndex = __webpack_require__("0390");
var regExpExec = __webpack_require__("5f1b");
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
__webpack_require__("214f")('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});


/***/ }),

/***/ "a524":
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__("4245");

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),

/***/ "a59b":
/***/ (function(module, exports) {

/**
 * Gets the first element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias first
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the first element of `array`.
 * @example
 *
 * _.head([1, 2, 3]);
 * // => 1
 *
 * _.head([]);
 * // => undefined
 */
function head(array) {
  return (array && array.length) ? array[0] : undefined;
}

module.exports = head;


/***/ }),

/***/ "a919":
/***/ (function(module, exports, __webpack_require__) {

var basePropertyOf = __webpack_require__("ddc6");

/** Used to map Latin Unicode letters to basic Latin letters. */
var deburredLetters = {
  // Latin-1 Supplement block.
  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
  '\xc7': 'C',  '\xe7': 'c',
  '\xd0': 'D',  '\xf0': 'd',
  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
  '\xd1': 'N',  '\xf1': 'n',
  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
  '\xc6': 'Ae', '\xe6': 'ae',
  '\xde': 'Th', '\xfe': 'th',
  '\xdf': 'ss',
  // Latin Extended-A block.
  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
  '\u0134': 'J',  '\u0135': 'j',
  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
  '\u0174': 'W',  '\u0175': 'w',
  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
  '\u0132': 'IJ', '\u0133': 'ij',
  '\u0152': 'Oe', '\u0153': 'oe',
  '\u0149': "'n", '\u017f': 's'
};

/**
 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
 * letters to basic Latin letters.
 *
 * @private
 * @param {string} letter The matched letter to deburr.
 * @returns {string} Returns the deburred letter.
 */
var deburrLetter = basePropertyOf(deburredLetters);

module.exports = deburrLetter;


/***/ }),

/***/ "a994":
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__("7d1f"),
    getSymbols = __webpack_require__("32f4"),
    keys = __webpack_require__("ec69");

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),

/***/ "aae3":
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__("d3f4");
var cof = __webpack_require__("2d95");
var MATCH = __webpack_require__("2b4c")('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),

/***/ "aaec":
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

module.exports = hasUnicode;


/***/ }),

/***/ "ac41":
/***/ (function(module, exports) {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),

/***/ "ac6a":
/***/ (function(module, exports, __webpack_require__) {

var $iterators = __webpack_require__("cadf");
var getKeys = __webpack_require__("0d58");
var redefine = __webpack_require__("2aba");
var global = __webpack_require__("7726");
var hide = __webpack_require__("32e9");
var Iterators = __webpack_require__("84f2");
var wks = __webpack_require__("2b4c");
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),

/***/ "aeb4":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-pane[data-v-4a5f2beb]{flex-grow:1;flex-shrink:1;display:flex;flex-direction:column;justify-content:center;align-items:stretch}.vc-horizontal-divider[data-v-4a5f2beb]{align-self:center}.vc-header[data-v-4a5f2beb]{flex-shrink:0;display:flex;align-items:stretch;-webkit-user-select:none;-ms-user-select:none;user-select:none;padding:var(--header-padding)}.vc-header.align-left[data-v-4a5f2beb]{order:-1;justify-content:flex-start}.vc-header.align-right[data-v-4a5f2beb]{order:1;justify-content:flex-end}.vc-title-layout[data-v-4a5f2beb]{display:flex;justify-content:center;align-items:center;flex-grow:1}.vc-title-layout.align-left[data-v-4a5f2beb]{justify-content:flex-start}.vc-title-layout.align-right[data-v-4a5f2beb]{justify-content:flex-end}.vc-title-wrapper[data-v-4a5f2beb]{position:relative}.vc-title[data-v-4a5f2beb]{cursor:pointer;white-space:nowrap;padding:var(--title-padding)}.vc-title[data-v-4a5f2beb],.vc-weekday[data-v-4a5f2beb]{-webkit-user-select:none;-ms-user-select:none;user-select:none}.vc-weekday[data-v-4a5f2beb]{display:flex;justify-content:center;align-items:center;flex:1;padding:var(--weekday-padding);cursor:default}.vc-weeks[data-v-4a5f2beb]{flex-shrink:1;flex-grow:1;padding:var(--weeks-padding)}", ""]);

// exports


/***/ }),

/***/ "aebd":
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "b047":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ "b0c5":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpExec = __webpack_require__("520a");
__webpack_require__("5ca1")({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});


/***/ }),

/***/ "b1d2":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var dateTag = '[object Date]';

/**
 * The base implementation of `_.isDate` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
 */
function baseIsDate(value) {
  return isObjectLike(value) && baseGetTag(value) == dateTag;
}

module.exports = baseIsDate;


/***/ }),

/***/ "b1e5":
/***/ (function(module, exports, __webpack_require__) {

var getAllKeys = __webpack_require__("a994");

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;


/***/ }),

/***/ "b20a":
/***/ (function(module, exports, __webpack_require__) {

var arrayReduce = __webpack_require__("6ac0"),
    deburr = __webpack_require__("4caa"),
    words = __webpack_require__("ea72");

/** Used to compose unicode capture groups. */
var rsApos = "['\u2019]";

/** Used to match apostrophes. */
var reApos = RegExp(rsApos, 'g');

/**
 * Creates a function like `_.camelCase`.
 *
 * @private
 * @param {Function} callback The function to combine each word.
 * @returns {Function} Returns the new compounder function.
 */
function createCompounder(callback) {
  return function(string) {
    return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
  };
}

module.exports = createCompounder;


/***/ }),

/***/ "b218":
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ "b4b0":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("1a8c"),
    isSymbol = __webpack_require__("ffd6");

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),

/***/ "b4c0":
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__("cb5a");

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),

/***/ "b5a7":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07"),
    root = __webpack_require__("2b3e");

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),

/***/ "b6dd":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-popover-content-wrapper[data-v-7605e1b2]{--popover-horizontal-content-offset:8px;--popover-vertical-content-offset:10px;--popover-slide-translation:15px;--popover-transition-time:0.14s ease-in-out;--popover-caret-horizontal-offset:18px;--popover-caret-vertical-offset:8px;position:absolute;display:block;outline:none;z-index:10}.vc-popover-content-wrapper[data-v-7605e1b2]:not(.is-interactive){pointer-events:none}.vc-popover-content[data-v-7605e1b2]{position:relative;outline:none;z-index:10}.vc-popover-content.direction-bottom[data-v-7605e1b2]{margin-top:var(--popover-vertical-content-offset)}.vc-popover-content.direction-top[data-v-7605e1b2]{margin-bottom:var(--popover-vertical-content-offset)}.vc-popover-content.direction-left[data-v-7605e1b2]{margin-right:var(--popover-horizontal-content-offset)}.vc-popover-content.direction-right[data-v-7605e1b2]{margin-left:var(--popover-horizontal-content-offset)}.vc-popover-caret[data-v-7605e1b2]{content:\"\";position:absolute;display:block;width:12px;height:12px;border-top:inherit;border-left:inherit;background:inherit;z-index:-1}.vc-popover-caret.direction-bottom[data-v-7605e1b2]{top:0}.vc-popover-caret.direction-bottom.align-left[data-v-7605e1b2]{transform:translateY(-50%) rotate(45deg)}.vc-popover-caret.direction-bottom.align-center[data-v-7605e1b2]{transform:translateX(-50%) translateY(-50%) rotate(45deg)}.vc-popover-caret.direction-bottom.align-right[data-v-7605e1b2]{transform:translateY(-50%) rotate(45deg)}.vc-popover-caret.direction-top[data-v-7605e1b2]{top:100%}.vc-popover-caret.direction-top.align-left[data-v-7605e1b2]{transform:translateY(-50%) rotate(-135deg)}.vc-popover-caret.direction-top.align-center[data-v-7605e1b2]{transform:translateX(-50%) translateY(-50%) rotate(-135deg)}.vc-popover-caret.direction-top.align-right[data-v-7605e1b2]{transform:translateY(-50%) rotate(-135deg)}.vc-popover-caret.direction-left[data-v-7605e1b2]{left:100%}.vc-popover-caret.direction-left.align-top[data-v-7605e1b2]{transform:translateX(-50%) rotate(135deg)}.vc-popover-caret.direction-left.align-middle[data-v-7605e1b2]{transform:translateY(-50%) translateX(-50%) rotate(135deg)}.vc-popover-caret.direction-left.align-bottom[data-v-7605e1b2]{transform:translateX(-50%) rotate(135deg)}.vc-popover-caret.direction-right[data-v-7605e1b2]{left:0}.vc-popover-caret.direction-right.align-top[data-v-7605e1b2]{transform:translateX(-50%) rotate(-45deg)}.vc-popover-caret.direction-right.align-middle[data-v-7605e1b2]{transform:translateY(-50%) translateX(-50%) rotate(-45deg)}.vc-popover-caret.direction-right.align-bottom[data-v-7605e1b2]{transform:translateX(-50%) rotate(-45deg)}.vc-popover-caret.align-left[data-v-7605e1b2]{left:var(--popover-caret-horizontal-offset)}.vc-popover-caret.align-center[data-v-7605e1b2]{left:50%}.vc-popover-caret.align-right[data-v-7605e1b2]{right:var(--popover-caret-horizontal-offset)}.vc-popover-caret.align-top[data-v-7605e1b2]{top:var(--popover-caret-vertical-offset)}.vc-popover-caret.align-middle[data-v-7605e1b2]{top:50%}.vc-popover-caret.align-bottom[data-v-7605e1b2]{bottom:var(--popover-caret-vertical-offset)}.fade-enter-active[data-v-7605e1b2],.fade-leave-active[data-v-7605e1b2],.slide-fade-enter-active[data-v-7605e1b2],.slide-fade-leave-active[data-v-7605e1b2]{transition:all var(--popover-transition-time);pointer-events:none}.fade-enter[data-v-7605e1b2],.fade-leave-to[data-v-7605e1b2],.slide-fade-enter[data-v-7605e1b2],.slide-fade-leave-to[data-v-7605e1b2]{opacity:0}.slide-fade-enter.direction-bottom[data-v-7605e1b2],.slide-fade-leave-to.direction-bottom[data-v-7605e1b2]{transform:translateY(calc(-1*var(--popover-slide-translation)))}.slide-fade-enter.direction-top[data-v-7605e1b2],.slide-fade-leave-to.direction-top[data-v-7605e1b2]{transform:translateY(var(--popover-slide-translation))}.slide-fade-enter.direction-left[data-v-7605e1b2],.slide-fade-leave-to.direction-left[data-v-7605e1b2]{transform:translateX(var(--popover-slide-translation))}.slide-fade-enter.direction-right[data-v-7605e1b2],.slide-fade-leave-to.direction-right[data-v-7605e1b2]{transform:translateX(calc(-1*var(--popover-slide-translation)))}", ""]);

// exports


/***/ }),

/***/ "b760":
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__("872a"),
    eq = __webpack_require__("9638");

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;


/***/ }),

/***/ "badf":
/***/ (function(module, exports, __webpack_require__) {

var baseMatches = __webpack_require__("642a"),
    baseMatchesProperty = __webpack_require__("1838"),
    identity = __webpack_require__("cd9d"),
    isArray = __webpack_require__("6747"),
    property = __webpack_require__("f9ce");

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

module.exports = baseIteratee;


/***/ }),

/***/ "bbc0":
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__("6044");

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),

/***/ "bcdf":
/***/ (function(module, exports) {

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

module.exports = noop;


/***/ }),

/***/ "bd86":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return _defineProperty; });
/* harmony import */ var _core_js_object_define_property__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("85f2");
/* harmony import */ var _core_js_object_define_property__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_core_js_object_define_property__WEBPACK_IMPORTED_MODULE_0__);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    _core_js_object_define_property__WEBPACK_IMPORTED_MODULE_0___default()(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/***/ }),

/***/ "bdab":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("f498");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("1ee16f20", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "be13":
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ "c05f":
/***/ (function(module, exports, __webpack_require__) {

var baseIsEqualDeep = __webpack_require__("7b97"),
    isObjectLike = __webpack_require__("1310");

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;


/***/ }),

/***/ "c098":
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ "c1c9":
/***/ (function(module, exports, __webpack_require__) {

var baseSetToString = __webpack_require__("a454"),
    shortOut = __webpack_require__("f3c1");

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ "c2b6":
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__("f8af"),
    cloneDataView = __webpack_require__("5d89"),
    cloneRegExp = __webpack_require__("6f6c"),
    cloneSymbol = __webpack_require__("a2db"),
    cloneTypedArray = __webpack_require__("c8fe");

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),

/***/ "c32f":
/***/ (function(module, exports, __webpack_require__) {

var baseSlice = __webpack_require__("2b10");

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

module.exports = castSlice;


/***/ }),

/***/ "c366":
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__("6821");
var toLength = __webpack_require__("9def");
var toAbsoluteIndex = __webpack_require__("77f1");
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),

/***/ "c3fc":
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__("42a2"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;


/***/ }),

/***/ "c539":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("694d");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("19ad7201", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "c584":
/***/ (function(module, exports) {

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;


/***/ }),

/***/ "c631":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-day-popover-row[data-v-28ced894]{--day-content-transition-time:0.13s ease-in;display:flex;align-items:center;transition:all var(--day-content-transition-time)}.vc-day-popover-row[data-v-28ced894]:not(:first-child){margin-top:3px}.vc-day-popover-row-indicator[data-v-28ced894]{display:flex;justify-content:center;align-items:center;flex-grow:0;width:15px;margin-right:3px}.vc-day-popover-row-indicator span[data-v-28ced894]{transition:all var(--day-content-transition-time)}.vc-day-popover-row-content[data-v-28ced894]{display:flex;align-items:center;flex-wrap:none;flex-grow:1;width:-webkit-max-content;width:max-content}", ""]);

// exports


/***/ }),

/***/ "c69a":
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__("9e1e") && !__webpack_require__("79e5")(function () {
  return Object.defineProperty(__webpack_require__("230e")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "c6cf":
/***/ (function(module, exports, __webpack_require__) {

var flatten = __webpack_require__("4d8c"),
    overRest = __webpack_require__("2286"),
    setToString = __webpack_require__("c1c9");

/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return setToString(overRest(func, undefined, flatten), func + '');
}

module.exports = flatRest;


/***/ }),

/***/ "c724":
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__("aeb4");
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = __webpack_require__("499e").default
var update = add("f2c4f118", content, true, {"sourceMap":false,"shadowMode":false});

/***/ }),

/***/ "c869":
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__("0b07"),
    root = __webpack_require__("2b3e");

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),

/***/ "c87c":
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),

/***/ "c8ba":
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "c8fe":
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__("f8af");

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),

/***/ "ca5a":
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ "cadf":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__("9c6c");
var step = __webpack_require__("d53b");
var Iterators = __webpack_require__("84f2");
var toIObject = __webpack_require__("6821");

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__("01f9")(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),

/***/ "cb5a":
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__("9638");

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),

/***/ "cb7c":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("d3f4");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "cc45":
/***/ (function(module, exports, __webpack_require__) {

var baseIsMap = __webpack_require__("1a2d"),
    baseUnary = __webpack_require__("b047"),
    nodeUtil = __webpack_require__("99d3");

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;


/***/ }),

/***/ "cd9d":
/***/ (function(module, exports) {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ "ce10":
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__("69a8");
var toIObject = __webpack_require__("6821");
var arrayIndexOf = __webpack_require__("c366")(false);
var IE_PROTO = __webpack_require__("613b")('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "ce86":
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__("9e69"),
    arrayMap = __webpack_require__("7948"),
    isArray = __webpack_require__("6747"),
    isSymbol = __webpack_require__("ffd6");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ }),

/***/ "cebd":
/***/ (function(module, exports) {

/**
 * Converts `set` to its value-value pairs.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the value-value pairs.
 */
function setToPairs(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = [value, value];
  });
  return result;
}

module.exports = setToPairs;


/***/ }),

/***/ "cfe5":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DateInfo; });
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("ac6a");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("bd86");
/* harmony import */ var date_fns__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("f7f1");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("2fa3");
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("9404");
/* harmony import */ var _locale__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("29ae");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { Object(_Users_nreyes_Code_v_calendar_node_modules_babel_runtime_corejs2_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





const millisecondsPerDay = 24 * 60 * 60 * 1000;
class DateInfo {
  constructor(config, {
    order = 0,
    locale = new _locale__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"]()
  } = {}) {
    this.isDateInfo = true;
    this.isRange = Object(___WEBPACK_IMPORTED_MODULE_4__[/* isObject */ "l"])(config) || Object(___WEBPACK_IMPORTED_MODULE_4__[/* isFunction */ "j"])(config);
    this.isDate = !this.isRange;
    this.order = order;
    this.locale = locale;
    this.mask = locale.masks.data;
    this.getMonthComps = locale.getMonthComps;
    this.firstDayOfWeek = locale.firstDayOfWeek;
    this.opts = {
      order,
      locale
    }; // Process date

    if (this.isDate) {
      this.type = 'date'; // Initialize date from config

      let date = this.toDate(config); // Can't accept invalid dates

      date = Object(___WEBPACK_IMPORTED_MODULE_4__[/* isDate */ "i"])(date) ? date : new Date(); // Strip date time

      date.setHours(0, 0, 0, 0); // date.setUTCHours(0, 0, 0, 0);
      // Assign date

      this.date = date;
      this.dateTime = date.getTime();
    } // Process date range


    if (this.isRange) {
      this.type = 'range'; // Date config is a function

      if (Object(___WEBPACK_IMPORTED_MODULE_4__[/* isFunction */ "j"])(config)) {
        this.on = {
          and: config
        }; // Date config is an object
      } else {
        // Initialize start and end dates (null means infinity)
        let start = this.toDate(config.start);
        let end = this.toDate(config.end); // Reconfigure start and end dates if needed

        if (start && end && start > end) {
          const temp = start;
          start = end;
          end = temp;
        } else if (start && config.span >= 1) {
          end = Object(date_fns__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(start, config.span - 1);
        } // Reset invalid dates to null and strip times for valid dates


        if (start) {
          if (!Object(___WEBPACK_IMPORTED_MODULE_4__[/* isDate */ "i"])(start)) start = null;else start.setHours(0, 0, 0, 0); // else start.setUTCHours(0, 0, 0, 0);
        }

        if (end) {
          if (!Object(___WEBPACK_IMPORTED_MODULE_4__[/* isDate */ "i"])(end)) end = null;else end.setHours(0, 0, 0, 0); // else end.setUTCHours(0, 0, 0, 0);
        } // Assign start and end dates


        this.start = start;
        this.end = end;
        this.startTime = start && start.getTime();
        this.endTime = end && end.getTime(); // Assign spans

        if (start && end) {
          this.daySpan = this.diffInDays(start, end);
          this.weekSpan = this.diffInWeeks(start, end);
          this.monthSpan = this.diffInMonths(start, end);
          this.yearSpan = this.diffInYears(start, end);
        } // Assign 'and' condition


        const andOpt = Object(_helpers__WEBPACK_IMPORTED_MODULE_3__[/* mixinOptionalProps */ "l"])(config, {}, DateInfo.patternProps);

        if (andOpt.assigned) {
          this.on = {
            and: andOpt.target
          };
        } // Assign 'or' conditions


        if (config.on) {
          const or = (Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(config.on) ? config.on : [config.on]).map(function (o) {
            if (Object(___WEBPACK_IMPORTED_MODULE_4__[/* isFunction */ "j"])(o)) return o;
            const opt = Object(_helpers__WEBPACK_IMPORTED_MODULE_3__[/* mixinOptionalProps */ "l"])(o, {}, DateInfo.patternProps);
            return opt.assigned ? opt.target : null;
          }).filter(function (o) {
            return o;
          });
          if (or.length) this.on = _objectSpread(_objectSpread({}, this.on), {}, {
            or
          });
        }
      } // Assign flag if date is complex


      this.isComplex = !!this.on;
    }
  }

  toDate(date) {
    const mask = this.locale.masks.data;
    return this.locale.toDate(date, mask);
  }

  toDateInfo(date) {
    return date.isDateInfo ? date : new DateInfo(date, this.opts);
  }

  startOfWeek(date) {
    const day = date.getDay() + 1;
    const daysToAdd = day >= this.firstDayOfWeek ? this.firstDayOfWeek - day : -(7 - (this.firstDayOfWeek - day));
    return Object(date_fns__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(date, daysToAdd);
  }

  diffInDays(d1, d2) {
    return Math.round((d2 - d1) / millisecondsPerDay);
  }

  diffInWeeks(d1, d2) {
    return this.diffInDays(this.startOfWeek(d1), this.startOfWeek(d2));
  }

  diffInYears(d1, d2) {
    return d2.getUTCFullYear() - d1.getUTCFullYear();
  }

  diffInMonths(d1, d2) {
    return this.diffInYears(d1, d2) * 12 + (d2.getMonth() - d1.getMonth());
  }

  static get patterns() {
    return {
      dailyInterval: {
        test: function test(day, interval, di) {
          return di.diffInDays(di.start || new Date(), day.date) % interval === 0;
        }
      },
      weeklyInterval: {
        test: function test(day, interval, di) {
          return di.diffInWeeks(di.start || new Date(), day.date) % interval === 0;
        }
      },
      monthlyInterval: {
        test: function test(day, interval, di) {
          return di.diffInMonths(di.start || new Date(), day.date) % interval === 0;
        }
      },
      yearlyInterval: {
        test: function test() {
          return function (day, interval, di) {
            return di.diffInYears(di.start || new Date(), day.date) % interval === 0;
          };
        }
      },
      days: {
        validate: function validate(days) {
          return Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(days) ? days : [parseInt(days, 10)];
        },
        test: function test(day, days) {
          return days.includes(day.day) || days.includes(-day.dayFromEnd);
        }
      },
      weekdays: {
        validate: function validate(weekdays) {
          return Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(weekdays) ? weekdays : [parseInt(weekdays, 10)];
        },
        test: function test(day, weekdays) {
          return weekdays.includes(day.weekday);
        }
      },
      ordinalWeekdays: {
        validate: function validate(ordinalWeekdays) {
          return Object.keys(ordinalWeekdays).reduce(function (obj, ck) {
            const weekdays = ordinalWeekdays[ck];
            if (!weekdays) return obj;
            obj[ck] = Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(weekdays) ? weekdays : [parseInt(weekdays, 10)];
            return obj;
          }, {});
        },
        test: function test(day, ordinalWeekdays) {
          return Object.keys(ordinalWeekdays).map(function (k) {
            return parseInt(k, 10);
          }).find(function (k) {
            return ordinalWeekdays[k].includes(day.weekday) && (k === day.weekdayOrdinal || k === -day.weekdayOrdinalFromEnd);
          });
        }
      },
      weekends: {
        validate: function validate(config) {
          return config;
        },
        test: function test(day) {
          return day.weekday === 1 || day.weekday === 7;
        }
      },
      workweek: {
        validate: function validate(config) {
          return config;
        },
        test: function test(day) {
          return day.weekday >= 2 && day.weekday <= 6;
        }
      },
      weeks: {
        validate: function validate(weeks) {
          return Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(weeks) ? weeks : [parseInt(weeks, 10)];
        },
        test: function test(day, weeks) {
          return weeks.includes(day.week) || weeks.includes(-day.weekFromEnd);
        }
      },
      months: {
        validate: function validate(months) {
          return Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(months) ? months : [parseInt(months, 10)];
        },
        test: function test(day, months) {
          return months.includes(day.month);
        }
      },
      years: {
        validate: function validate(years) {
          return Object(___WEBPACK_IMPORTED_MODULE_4__[/* isArray */ "h"])(years) ? years : [parseInt(years, 10)];
        },
        test: function test(day, years) {
          return years.includes(day.year);
        }
      }
    };
  }

  static get patternProps() {
    return Object.keys(DateInfo.patterns).map(function (k) {
      return {
        name: k,
        validate: DateInfo.patterns[k].validate
      };
    });
  }

  static testConfig(config, day, dateInfo) {
    if (Object(___WEBPACK_IMPORTED_MODULE_4__[/* isFunction */ "j"])(config)) return config(day);

    if (Object(___WEBPACK_IMPORTED_MODULE_4__[/* isObject */ "l"])(config)) {
      return Object.keys(config).every(function (k) {
        return DateInfo.patterns[k].test(day, config[k], dateInfo);
      });
    }

    return null;
  }

  iterateDatesInRange({
    start,
    end
  }, func) {
    if (!start || !end || !Object(___WEBPACK_IMPORTED_MODULE_4__[/* isFunction */ "j"])(func)) return null;
    const state = {
      i: 0,
      date: start,
      day: this.locale.getDayFromDate(start),
      finished: false
    };
    let result = null;

    for (; !state.finished && state.date <= end; state.i++) {
      result = func(state);
      state.date = Object(date_fns__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(state.date, 1);
      state.day = this.locale.getDayFromDate(state.date);
    }

    return result;
  }

  shallowIntersectingRange(other) {
    return this.rangeShallowIntersectingRange(this, other);
  } // Returns a date range that intersects two DateInfo objects
  // NOTE: This is a shallow calculation (does not take patterns into account),
  //   so this method should only really be called for special conditions
  //   where absolute accuracy is not necessarily needed


  rangeShallowIntersectingRange(date1, date2) {
    date1 = this.toDateInfo(date1);
    date2 = this.toDateInfo(date2);

    if (!this.dateShallowIntersectsDate(date1, date2)) {
      return null;
    }

    const thisRange = date1.toRange();
    const otherRange = date2.toRange(); // Start with infinite start and end dates

    let start = null;
    let end = null; // This start date exists

    if (thisRange.start) {
      // Use this definite start date if other start date is infinite
      if (!otherRange.start) {
        start = thisRange.start;
      } else {
        // Otherwise, use the latest start date
        start = thisRange.start > otherRange.start ? thisRange.start : otherRange.start;
      } // Other start date exists

    } else if (otherRange.start) {
      // Use other definite start date as this one is infinite
      start = otherRange.start;
    } // This end date exists


    if (thisRange.end) {
      // Use this definite end date if other end date is infinite
      if (!otherRange.end) {
        end = thisRange.end;
      } else {
        // Otherwise, use the earliest end date
        end = thisRange.end < otherRange.end ? thisRange.end : otherRange.end;
      } // Other end date exists

    } else if (otherRange.end) {
      // Use other definite end date as this one is infinite
      end = otherRange.end;
    } // Return calculated range


    return {
      start,
      end
    };
  } // ========================================================
  // Determines if this date partially intersects another date
  // NOTE: This is a deep test (patterns tested)


  intersectsDate(other) {
    var _this = this;

    const date = this.toDateInfo(other);
    if (!this.shallowIntersectsDate(date)) return null;
    if (!this.on) return this;
    const range = this.rangeShallowIntersectingRange(this, date);
    let result = false;
    this.iterateDatesInRange(range, function (state) {
      if (_this.matchesDay(state.day)) {
        result = result || date.matchesDay(state.day);
        state.finished = result;
      }
    });
    return result;
  } // ========================================================
  // Determines if this date partially intersects another date
  // NOTE: This is a shallow test (no patterns tested)


  shallowIntersectsDate(other) {
    return this.dateShallowIntersectsDate(this, this.toDateInfo(other));
  } // ========================================================
  // Determines if first date partially intersects second date
  // NOTE: This is a shallow test (no patterns tested)


  dateShallowIntersectsDate(date1, date2) {
    if (date1.isDate) {
      return date2.isDate ? date1.dateTime === date2.dateTime : this.dateShallowIncludesDate(date2, date1);
    }

    if (date2.isDate) {
      return this.dateShallowIncludesDate(date1, date2);
    } // Both ranges


    if (date1.start && date2.end && date1.start > date2.end) {
      return false;
    }

    if (date1.end && date2.start && date1.end < date2.start) {
      return false;
    }

    return true;
  } // ========================================================
  // Determines if this date completely includes another date
  // NOTE: This is a deep test (patterns tested)


  includesDate(other) {
    var _this2 = this;

    const date = this.toDateInfo(other);

    if (!this.shallowIncludesDate(date)) {
      return false;
    }

    if (!this.on) {
      return true;
    }

    const range = this.rangeShallowIntersectingRange(this, date);
    let result = true;
    this.iterateDatesInRange(range, function (state) {
      if (_this2.matchesDay(state.day)) {
        result = result && date.matchesDay(state.day);
        state.finished = !result;
      }
    });
    return result;
  } // ========================================================
  // Determines if this date completely includes another date
  // NOTE: This is a shallow test (no patterns tested)


  shallowIncludesDate(other) {
    return this.dateShallowIncludesDate(this, other.isDate ? other : new DateInfo(other, this.opts));
  } // ========================================================
  // Determines if first date completely includes second date
  // NOTE: This is a shallow test (no patterns tested)


  dateShallowIncludesDate(date1, date2) {
    // First date is simple date
    if (date1.isDate) {
      if (date2.isDate) {
        return date1.dateTime === date2.dateTime;
      }

      if (!date2.startTime || !date2.endTime) {
        return false;
      }

      return date1.dateTime === date2.startTime && date1.dateTime === date2.endTime;
    } // Second date is simple date and first is date range


    if (date2.isDate) {
      if (date1.start && date2.date < date1.start) {
        return false;
      }

      if (date1.end && date2.date > date1.end) {
        return false;
      }

      return true;
    } // Both dates are date ranges


    if (date1.start && (!date2.start || date2.start < date1.start)) {
      return false;
    }

    if (date1.end && (!date2.end || date2.end > date1.end)) {
      return false;
    }

    return true;
  }

  includesDay(day) {
    // Date is outside general range - return null
    if (!this.shallowIncludesDate(day.date)) return null; // Return this date if patterns match

    return this.matchesDay(day) ? this : null;
  }

  matchesDay(day) {
    var _this3 = this;

    // No patterns to test
    if (!this.on) return true; // Fail if 'and' condition fails

    if (this.on.and && !DateInfo.testConfig(this.on.and, day, this)) {
      return false;
    } // Fail if every 'or' condition fails


    if (this.on.or && !this.on.or.some(function (or) {
      return DateInfo.testConfig(or, day, _this3);
    })) {
      return false;
    } // Patterns match


    return true;
  }

  toRange() {
    if (this.isDate) {
      return new DateInfo({
        start: this.date,
        end: this.date
      }, this.opts);
    }

    return new DateInfo({
      start: this.start,
      end: this.end
    }, this.opts);
  } // Build the 'compare to other' function


  compare(other) {
    if (this.order !== other.order) return this.order - other.order;
    if (this.type !== other.type) return this.isDate ? 1 : -1;
    if (this.isDate) return 0;
    const diff = this.start - other.start;
    return diff !== 0 ? diff : this.end - other.end;
  }

}

/***/ }),

/***/ "d02c":
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__("5e2e"),
    Map = __webpack_require__("79bc"),
    MapCache = __webpack_require__("7b83");

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),

/***/ "d094":
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

module.exports = unicodeToArray;


/***/ }),

/***/ "d0d6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DatePicker_vue_vue_type_style_index_0_id_56ae83be_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("6300");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DatePicker_vue_vue_type_style_index_0_id_56ae83be_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DatePicker_vue_vue_type_style_index_0_id_56ae83be_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_DatePicker_vue_vue_type_style_index_0_id_56ae83be_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "d194":
/***/ (function(module, exports, __webpack_require__) {

var castSlice = __webpack_require__("c32f"),
    hasUnicode = __webpack_require__("aaec"),
    stringToArray = __webpack_require__("126d"),
    toString = __webpack_require__("76dd");

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = toString(string);

    var strSymbols = hasUnicode(string)
      ? stringToArray(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? castSlice(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

module.exports = createCaseFirst;


/***/ }),

/***/ "d327":
/***/ (function(module, exports) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),

/***/ "d370":
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__("253c"),
    isObjectLike = __webpack_require__("1310");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ "d3f4":
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "d53b":
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),

/***/ "d581":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarDay_vue_vue_type_style_index_0_id_2aac4f42_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("5cab");
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarDay_vue_vue_type_style_index_0_id_2aac4f42_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarDay_vue_vue_type_style_index_0_id_2aac4f42_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0__);
/* unused harmony reexport * */
 /* unused harmony default export */ var _unused_webpack_default_export = (_node_modules_vue_style_loader_index_js_ref_7_oneOf_1_0_node_modules_css_loader_index_js_ref_7_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_2_node_modules_postcss_loader_src_index_js_ref_7_oneOf_1_3_node_modules_cache_loader_dist_cjs_js_ref_0_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CalendarDay_vue_vue_type_style_index_0_id_2aac4f42_lang_postcss_scoped_true___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ "d612":
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__("7b83"),
    setCacheAdd = __webpack_require__("7ed2"),
    setCacheHas = __webpack_require__("dc0f");

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

module.exports = SetCache;


/***/ }),

/***/ "d7ee":
/***/ (function(module, exports, __webpack_require__) {

var baseIsSet = __webpack_require__("c3fc"),
    baseUnary = __webpack_require__("b047"),
    nodeUtil = __webpack_require__("99d3");

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;


/***/ }),

/***/ "d864":
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__("79aa");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "d8e8":
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "d9a8":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;


/***/ }),

/***/ "d9f6":
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__("e4ae");
var IE8_DOM_DEFINE = __webpack_require__("794b");
var toPrimitive = __webpack_require__("1bc3");
var dP = Object.defineProperty;

exports.f = __webpack_require__("8e60") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "da03":
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__("2b3e");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "dc0f":
/***/ (function(module, exports) {

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;


/***/ }),

/***/ "dc57":
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "dcbe":
/***/ (function(module, exports, __webpack_require__) {

var isArrayLike = __webpack_require__("30c9"),
    isObjectLike = __webpack_require__("1310");

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;


/***/ }),

/***/ "dd61":
/***/ (function(module, exports, __webpack_require__) {

var arrayMap = __webpack_require__("7948"),
    baseIteratee = __webpack_require__("badf"),
    baseMap = __webpack_require__("97d3"),
    isArray = __webpack_require__("6747");

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

module.exports = map;


/***/ }),

/***/ "ddc6":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.propertyOf` without support for deep paths.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyOf(object) {
  return function(key) {
    return object == null ? undefined : object[key];
  };
}

module.exports = basePropertyOf;


/***/ }),

/***/ "e031":
/***/ (function(module, exports, __webpack_require__) {

var baseMerge = __webpack_require__("f909"),
    isObject = __webpack_require__("1a8c");

/**
 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
 * objects into destination objects that are passed thru.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to merge.
 * @param {Object} object The parent object of `objValue`.
 * @param {Object} source The parent object of `srcValue`.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 * @returns {*} Returns the value to assign.
 */
function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
  if (isObject(objValue) && isObject(srcValue)) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, objValue);
    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
    stack['delete'](srcValue);
  }
  return objValue;
}

module.exports = customDefaultsMerge;


/***/ }),

/***/ "e0e7":
/***/ (function(module, exports, __webpack_require__) {

var isPlainObject = __webpack_require__("60ed");

/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */
function customOmitClone(value) {
  return isPlainObject(value) ? undefined : value;
}

module.exports = customOmitClone;


/***/ }),

/***/ "e11e":
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),

/***/ "e24b":
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__("49f4"),
    hashDelete = __webpack_require__("1efc"),
    hashGet = __webpack_require__("bbc0"),
    hashHas = __webpack_require__("7a48"),
    hashSet = __webpack_require__("2524");

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),

/***/ "e2a0":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isArray = __webpack_require__("6747"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

module.exports = isString;


/***/ }),

/***/ "e2c0":
/***/ (function(module, exports, __webpack_require__) {

var castPath = __webpack_require__("e2e4"),
    isArguments = __webpack_require__("d370"),
    isArray = __webpack_require__("6747"),
    isIndex = __webpack_require__("c098"),
    isLength = __webpack_require__("b218"),
    toKey = __webpack_require__("f4d6");

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

module.exports = hasPath;


/***/ }),

/***/ "e2e4":
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__("6747"),
    isKey = __webpack_require__("f608"),
    stringToPath = __webpack_require__("18d8"),
    toString = __webpack_require__("76dd");

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;


/***/ }),

/***/ "e380":
/***/ (function(module, exports, __webpack_require__) {

var MapCache = __webpack_require__("7b83");

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;


/***/ }),

/***/ "e3f8":
/***/ (function(module, exports, __webpack_require__) {

var baseGet = __webpack_require__("656b");

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;


/***/ }),

/***/ "e4ae":
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__("f772");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "e538":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__("2b3e");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("62e4")(module)))

/***/ }),

/***/ "e53d":
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "e9a7":
/***/ (function(module, exports, __webpack_require__) {

var toString = __webpack_require__("76dd"),
    upperFirst = __webpack_require__("8103");

/**
 * Converts the first character of `string` to upper case and the remaining
 * to lower case.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to capitalize.
 * @returns {string} Returns the capitalized string.
 * @example
 *
 * _.capitalize('FRED');
 * // => 'Fred'
 */
function capitalize(string) {
  return upperFirst(toString(string).toLowerCase());
}

module.exports = capitalize;


/***/ }),

/***/ "ea72":
/***/ (function(module, exports, __webpack_require__) {

var asciiWords = __webpack_require__("7559"),
    hasUnicodeWord = __webpack_require__("7e8e"),
    toString = __webpack_require__("76dd"),
    unicodeWords = __webpack_require__("f4d9");

/**
 * Splits `string` into an array of its words.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * _.words('fred, barney, & pebbles');
 * // => ['fred', 'barney', 'pebbles']
 *
 * _.words('fred, barney, & pebbles', /[^, ]+/g);
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern, guard) {
  string = toString(string);
  pattern = guard ? undefined : pattern;

  if (pattern === undefined) {
    return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
  }
  return string.match(pattern) || [];
}

module.exports = words;


/***/ }),

/***/ "eac5":
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ "ebd6":
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__("cb7c");
var aFunction = __webpack_require__("d8e8");
var SPECIES = __webpack_require__("2b4c")('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),

/***/ "ec47":
/***/ (function(module, exports, __webpack_require__) {

var baseToPairs = __webpack_require__("a3fd"),
    getTag = __webpack_require__("42a2"),
    mapToArray = __webpack_require__("edfa"),
    setToPairs = __webpack_require__("cebd");

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/**
 * Creates a `_.toPairs` or `_.toPairsIn` function.
 *
 * @private
 * @param {Function} keysFunc The function to get the keys of a given object.
 * @returns {Function} Returns the new pairs function.
 */
function createToPairs(keysFunc) {
  return function(object) {
    var tag = getTag(object);
    if (tag == mapTag) {
      return mapToArray(object);
    }
    if (tag == setTag) {
      return setToPairs(object);
    }
    return baseToPairs(object, keysFunc(object));
  };
}

module.exports = createToPairs;


/***/ }),

/***/ "ec69":
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__("6fcd"),
    baseKeys = __webpack_require__("03dd"),
    isArrayLike = __webpack_require__("30c9");

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),

/***/ "ec8c":
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),

/***/ "ed08":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Locale", function() { return /* reexport */ locale["a" /* default */]; });
__webpack_require__.d(__webpack_exports__, "DateInfo", function() { return /* reexport */ dateInfo["a" /* default */]; });
__webpack_require__.d(__webpack_exports__, "Attribute", function() { return /* reexport */ attribute["a" /* default */]; });
__webpack_require__.d(__webpack_exports__, "AttributeStore", function() { return /* reexport */ attributeStore["a" /* default */]; });
__webpack_require__.d(__webpack_exports__, "setupCalendar", function() { return /* reexport */ setup; });
__webpack_require__.d(__webpack_exports__, "evalFn", function() { return /* reexport */ helpers["h" /* evalFn */]; });
__webpack_require__.d(__webpack_exports__, "pageIsValid", function() { return /* reexport */ helpers["x" /* pageIsValid */]; });
__webpack_require__.d(__webpack_exports__, "pageIsBeforePage", function() { return /* reexport */ helpers["u" /* pageIsBeforePage */]; });
__webpack_require__.d(__webpack_exports__, "pageIsAfterPage", function() { return /* reexport */ helpers["t" /* pageIsAfterPage */]; });
__webpack_require__.d(__webpack_exports__, "pageIsBetweenPages", function() { return /* reexport */ helpers["v" /* pageIsBetweenPages */]; });
__webpack_require__.d(__webpack_exports__, "pageIsEqualToPage", function() { return /* reexport */ helpers["w" /* pageIsEqualToPage */]; });
__webpack_require__.d(__webpack_exports__, "pageForDate", function() { return /* reexport */ helpers["p" /* pageForDate */]; });
__webpack_require__.d(__webpack_exports__, "addPages", function() { return /* reexport */ helpers["a" /* addPages */]; });
__webpack_require__.d(__webpack_exports__, "pageForThisMonth", function() { return /* reexport */ helpers["s" /* pageForThisMonth */]; });
__webpack_require__.d(__webpack_exports__, "pageForNextMonth", function() { return /* reexport */ helpers["q" /* pageForNextMonth */]; });
__webpack_require__.d(__webpack_exports__, "pageForPrevMonth", function() { return /* reexport */ helpers["r" /* pageForPrevMonth */]; });
__webpack_require__.d(__webpack_exports__, "getMaxPage", function() { return /* reexport */ helpers["j" /* getMaxPage */]; });
__webpack_require__.d(__webpack_exports__, "datesAreEqual", function() { return /* reexport */ helpers["d" /* datesAreEqual */]; });
__webpack_require__.d(__webpack_exports__, "arrayHasItems", function() { return /* reexport */ helpers["b" /* arrayHasItems */]; });
__webpack_require__.d(__webpack_exports__, "findAncestor", function() { return /* reexport */ helpers["i" /* findAncestor */]; });
__webpack_require__.d(__webpack_exports__, "elementHasAncestor", function() { return /* reexport */ helpers["f" /* elementHasAncestor */]; });
__webpack_require__.d(__webpack_exports__, "elementPositionInAncestor", function() { return /* reexport */ helpers["g" /* elementPositionInAncestor */]; });
__webpack_require__.d(__webpack_exports__, "mixinOptionalProps", function() { return /* reexport */ helpers["l" /* mixinOptionalProps */]; });
__webpack_require__.d(__webpack_exports__, "on", function() { return /* reexport */ helpers["n" /* on */]; });
__webpack_require__.d(__webpack_exports__, "off", function() { return /* reexport */ helpers["m" /* off */]; });
__webpack_require__.d(__webpack_exports__, "elementContains", function() { return /* reexport */ helpers["e" /* elementContains */]; });
__webpack_require__.d(__webpack_exports__, "onSpaceOrEnter", function() { return /* reexport */ helpers["o" /* onSpaceOrEnter */]; });
__webpack_require__.d(__webpack_exports__, "createGuid", function() { return /* reexport */ helpers["c" /* createGuid */]; });
__webpack_require__.d(__webpack_exports__, "hash", function() { return /* reexport */ helpers["k" /* hash */]; });
__webpack_require__.d(__webpack_exports__, "addTapOrClickHandler", function() { return /* reexport */ touch["b" /* addTapOrClickHandler */]; });
__webpack_require__.d(__webpack_exports__, "addHorizontalSwipeHandler", function() { return /* reexport */ touch["a" /* addHorizontalSwipeHandler */]; });

// EXTERNAL MODULE: ./src/utils/locale.js + 1 modules
var locale = __webpack_require__("29ae");

// EXTERNAL MODULE: ./src/utils/dateInfo.js
var dateInfo = __webpack_require__("cfe5");

// EXTERNAL MODULE: ./src/utils/attribute.js
var attribute = __webpack_require__("22f3");

// EXTERNAL MODULE: ./src/utils/attributeStore.js
var attributeStore = __webpack_require__("93495");

// EXTERNAL MODULE: ./src/utils/defaults/index.js
var utils_defaults = __webpack_require__("51ec");

// EXTERNAL MODULE: ./src/utils/screens.js + 1 modules
var screens = __webpack_require__("1315");

// CONCATENATED MODULE: ./src/utils/setup.js


/* harmony default export */ var setup = (function (opts) {
  // Register plugin defaults
  const defaults = Object(utils_defaults["b" /* setupDefaults */])(opts); // Install support for responsive screens

  Object(screens["a" /* setupScreens */])(defaults.screens, true);
  return defaults;
});
// EXTERNAL MODULE: ./src/utils/helpers.js
var helpers = __webpack_require__("2fa3");

// EXTERNAL MODULE: ./src/utils/touch.js
var touch = __webpack_require__("0733");

// CONCATENATED MODULE: ./src/utils/index.js








/***/ }),

/***/ "edfa":
/***/ (function(module, exports) {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),

/***/ "ee59":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".none-enter-active[data-v-5be4b00c],.none-leave-active[data-v-5be4b00c]{transition-duration:0s}.fade-enter-active[data-v-5be4b00c],.fade-leave-active[data-v-5be4b00c],.slide-down-enter-active[data-v-5be4b00c],.slide-down-leave-active[data-v-5be4b00c],.slide-left-enter-active[data-v-5be4b00c],.slide-left-leave-active[data-v-5be4b00c],.slide-right-enter-active[data-v-5be4b00c],.slide-right-leave-active[data-v-5be4b00c],.slide-up-enter-active[data-v-5be4b00c],.slide-up-leave-active[data-v-5be4b00c]{transition:transform var(--slide-duration) var(--slide-timing),opacity var(--slide-duration) var(--slide-timing);-webkit-backface-visibility:hidden;backface-visibility:hidden}.fade-leave-active[data-v-5be4b00c],.none-leave-active[data-v-5be4b00c],.slide-down-leave-active[data-v-5be4b00c],.slide-left-leave-active[data-v-5be4b00c],.slide-right-leave-active[data-v-5be4b00c],.slide-up-leave-active[data-v-5be4b00c]{position:absolute;width:100%}.fade-enter[data-v-5be4b00c],.fade-leave-to[data-v-5be4b00c],.none-enter[data-v-5be4b00c],.none-leave-to[data-v-5be4b00c],.slide-down-enter[data-v-5be4b00c],.slide-down-leave-to[data-v-5be4b00c],.slide-left-enter[data-v-5be4b00c],.slide-left-leave-to[data-v-5be4b00c],.slide-right-enter[data-v-5be4b00c],.slide-right-leave-to[data-v-5be4b00c],.slide-up-enter[data-v-5be4b00c],.slide-up-leave-to[data-v-5be4b00c]{opacity:0}.slide-left-enter[data-v-5be4b00c],.slide-right-leave-to[data-v-5be4b00c]{transform:translateX(var(--slide-translate))}.slide-left-leave-to[data-v-5be4b00c],.slide-right-enter[data-v-5be4b00c]{transform:translateX(calc(-1*var(--slide-translate)))}.slide-down-leave-to[data-v-5be4b00c],.slide-up-enter[data-v-5be4b00c]{transform:translateY(var(--slide-translate))}.slide-down-enter[data-v-5be4b00c],.slide-up-leave-to[data-v-5be4b00c]{transform:translateY(calc(-1*var(--slide-translate)))}", ""]);

// exports


/***/ }),

/***/ "eed6":
/***/ (function(module, exports, __webpack_require__) {

var baseUniq = __webpack_require__("2c66");

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length) ? baseUniq(array) : [];
}

module.exports = uniq;


/***/ }),

/***/ "ef5d":
/***/ (function(module, exports) {

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;


/***/ }),

/***/ "efb6":
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__("5e2e");

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),

/***/ "f064":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-grid-container[data-v-3ca35a05]{position:relative;flex-shrink:1;display:grid;overflow:auto;-webkit-overflow-scrolling:touch}.vc-grid-cell[data-v-3ca35a05]{display:flex;justify-content:center;align-items:center}", ""]);

// exports


/***/ }),

/***/ "f0bd":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.16.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

var timeoutDuration = function () {
  var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
  for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
    if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
      return 1;
    }
  }
  return 0;
}();

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

/**
 * Returns the reference node of the reference object, or the reference object itself.
 * @method
 * @memberof Popper.Utils
 * @param {Element|Object} reference - the reference element (the popper will be relative to this)
 * @returns {Element} parent
 */
function getReferenceNode(reference) {
  return reference && reference.referenceNode ? reference.referenceNode : reference;
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width']) + parseFloat(styles['border' + sideB + 'Width']);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.width;
  var height = sizes.height || element.clientHeight || result.height;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop);
    var marginLeft = parseFloat(styles.marginLeft);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  var parentNode = getParentNode(element);
  if (!parentNode) {
    return false;
  }
  return isFixed(parentNode);
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicitly asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
 * @returns {Object} The popper's position offsets rounded
 *
 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
 * good as it can be within reason.
 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
 *
 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
 * as well on High DPI screens).
 *
 * Firefox prefers no rounding for positioning and does not have blurriness on
 * high DPI screens.
 *
 * Only horizontal placement and left/right values need to be considered.
 */
function getRoundedOffsets(data, shouldRound) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
  var round = Math.round,
      floor = Math.floor;

  var noRound = function noRound(v) {
    return v;
  };

  var referenceWidth = round(reference.width);
  var popperWidth = round(popper.width);

  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
  var isVariation = data.placement.indexOf('-') !== -1;
  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
  var verticalToInteger = !shouldRound ? noRound : round;

  return {
    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
    top: verticalToInteger(popper.top),
    bottom: verticalToInteger(popper.bottom),
    right: horizontalToInteger(popper.right)
  };
}

var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized]);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width']);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

    // flips variation if reference element overflows boundaries
    var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    // flips variation if popper content overflows boundaries
    var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

    var flippedVariation = flippedVariationByRef || flippedVariationByContent;

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport',
    /**
     * @prop {Boolean} flipVariations=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the reference element overlaps its boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariations: false,
    /**
     * @prop {Boolean} flipVariationsByContent=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the popper element overlaps its reference boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariationsByContent: false
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {Element|referenceObject} reference - The reference element used to position the popper
   * @param {Element} popper - The HTML / XML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

/* harmony default export */ __webpack_exports__["a"] = (Popper);
//# sourceMappingURL=popper.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("c8ba")))

/***/ }),

/***/ "f15d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("ac6a");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("9404");


const locales = {
  // Arabic
  ar: {
    dow: 7,
    L: 'D/\u200FM/\u200FYYYY'
  },
  // Bulgarian
  bg: {
    dow: 2,
    L: 'D.MM.YYYY'
  },
  // Catalan
  ca: {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Chinese (China)
  'zh-CN': {
    dow: 2,
    L: 'YYYY/MM/DD'
  },
  // Chinese (Taiwan)
  'zh-TW': {
    dow: 1,
    L: 'YYYY/MM/DD'
  },
  // Croatian
  hr: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Czech
  cs: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Danish
  da: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Dutch
  nl: {
    dow: 2,
    L: 'DD-MM-YYYY'
  },
  // English (US)
  'en-US': {
    dow: 1,
    L: 'MM/DD/YYYY'
  },
  // English (Australia)
  'en-AU': {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // English (Canada)
  'en-CA': {
    dow: 1,
    L: 'YYYY-MM-DD'
  },
  // English (Great Britain)
  'en-GB': {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // English (Ireland)
  'en-IE': {
    dow: 2,
    L: 'DD-MM-YYYY'
  },
  // English (New Zealand)
  'en-NZ': {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // English (South Africa)
  'en-ZA': {
    dow: 1,
    L: 'YYYY/MM/DD'
  },
  // Esperanto
  eo: {
    dow: 2,
    L: 'YYYY-MM-DD'
  },
  // Estonian
  et: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Finnish
  fi: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // French
  fr: {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // French (Canada)
  'fr-CA': {
    dow: 1,
    L: 'YYYY-MM-DD'
  },
  // French (Switzerland)
  'fr-CH': {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // German
  de: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Hebrew
  he: {
    dow: 1,
    L: 'DD.MM.YYYY'
  },
  // Indonesian
  id: {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Italian
  it: {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Japanese
  ja: {
    dow: 1,
    L: 'YYYY年M月D日'
  },
  // Korean
  ko: {
    dow: 1,
    L: 'YYYY.MM.DD'
  },
  // Latvian
  lv: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Lithuanian
  lt: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Macedonian
  mk: {
    dow: 2,
    L: 'D.MM.YYYY'
  },
  // Norwegian
  nb: {
    dow: 2,
    L: 'D. MMMM YYYY'
  },
  nn: {
    dow: 2,
    L: 'D. MMMM YYYY'
  },
  // Polish
  pl: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Portuguese
  pt: {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Romanian
  ro: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Russian
  ru: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Slovak
  sk: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Spanish (Spain)
  'es-ES': {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Spanish (Mexico)
  'es-MX': {
    dow: 2,
    L: 'DD/MM/YYYY'
  },
  // Swedish
  sv: {
    dow: 2,
    L: 'YYYY-MM-DD'
  },
  // Thai
  th: {
    dow: 1,
    L: 'DD/MM/YYYY'
  },
  // Turkish
  tr: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Ukrainian
  uk: {
    dow: 2,
    L: 'DD.MM.YYYY'
  },
  // Vietnam
  vi: {
    dow: 2,
    L: 'DD/MM/YYYY'
  }
};
locales.en = locales['en-US'];
locales.es = locales['es-ES'];
locales.no = locales.nb;
locales.zh = locales['zh-CN']; // Remap from abbr. to intuitive property names

Object(___WEBPACK_IMPORTED_MODULE_1__[/* toPairs */ "u"])(locales).forEach(function ([id, {
  dow,
  L
}]) {
  locales[id] = {
    id,
    firstDayOfWeek: dow,
    masks: {
      L
    }
  };
});
/* harmony default export */ __webpack_exports__["a"] = (locales);

/***/ }),

/***/ "f3c1":
/***/ (function(module, exports) {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ "f498":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("2350")(false);
// imports


// module
exports.push([module.i, ".vc-reset,.vc-reset *{line-height:1.5;box-sizing:border-box}.vc-reset:focus,.vc-reset :focus{outline:none}.vc-reset [role=button],.vc-reset button{cursor:pointer}.vc-border,.vc-border-2,.vc-border-3{border-style:solid}.vc-appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}.vc-bg-fixed{background-attachment:fixed}.vc-bg-local{background-attachment:local}.vc-bg-scroll{background-attachment:scroll}.vc-bg-transparent{background-color:initial}.vc-bg-black{background-color:#000}.vc-bg-white{background-color:#fff}.vc-bg-gray-100{background-color:#f7fafc}.vc-bg-gray-200{background-color:#edf2f7}.vc-bg-gray-300{background-color:#e2e8f0}.vc-bg-gray-400{background-color:#cbd5e0}.vc-bg-gray-500{background-color:#a0aec0}.vc-bg-gray-600{background-color:#718096}.vc-bg-gray-700{background-color:#4a5568}.vc-bg-gray-800{background-color:#2d3748}.vc-bg-gray-900{background-color:#1a202c}.vc-bg-red-100{background-color:#fff5f5}.vc-bg-red-200{background-color:#fed7d7}.vc-bg-red-300{background-color:#feb2b2}.vc-bg-red-400{background-color:#fc8181}.vc-bg-red-500{background-color:#f56565}.vc-bg-red-600{background-color:#e53e3e}.vc-bg-red-700{background-color:#c53030}.vc-bg-red-800{background-color:#9b2c2c}.vc-bg-red-900{background-color:#742a2a}.vc-bg-orange-100{background-color:#fffaf0}.vc-bg-orange-200{background-color:#feebc8}.vc-bg-orange-300{background-color:#fbd38d}.vc-bg-orange-400{background-color:#f6ad55}.vc-bg-orange-500{background-color:#ed8936}.vc-bg-orange-600{background-color:#dd6b20}.vc-bg-orange-700{background-color:#c05621}.vc-bg-orange-800{background-color:#9c4221}.vc-bg-orange-900{background-color:#7b341e}.vc-bg-yellow-100{background-color:ivory}.vc-bg-yellow-200{background-color:#fefcbf}.vc-bg-yellow-300{background-color:#faf089}.vc-bg-yellow-400{background-color:#f6e05e}.vc-bg-yellow-500{background-color:#ecc94b}.vc-bg-yellow-600{background-color:#d69e2e}.vc-bg-yellow-700{background-color:#b7791f}.vc-bg-yellow-800{background-color:#975a16}.vc-bg-yellow-900{background-color:#744210}.vc-bg-green-100{background-color:#f0fff4}.vc-bg-green-200{background-color:#c6f6d5}.vc-bg-green-300{background-color:#9ae6b4}.vc-bg-green-400{background-color:#68d391}.vc-bg-green-500{background-color:#48bb78}.vc-bg-green-600{background-color:#38a169}.vc-bg-green-700{background-color:#2f855a}.vc-bg-green-800{background-color:#276749}.vc-bg-green-900{background-color:#22543d}.vc-bg-teal-100{background-color:#e6fffa}.vc-bg-teal-200{background-color:#b2f5ea}.vc-bg-teal-300{background-color:#81e6d9}.vc-bg-teal-400{background-color:#4fd1c5}.vc-bg-teal-500{background-color:#38b2ac}.vc-bg-teal-600{background-color:#319795}.vc-bg-teal-700{background-color:#2c7a7b}.vc-bg-teal-800{background-color:#285e61}.vc-bg-teal-900{background-color:#234e52}.vc-bg-blue-100{background-color:#ebf8ff}.vc-bg-blue-200{background-color:#bee3f8}.vc-bg-blue-300{background-color:#90cdf4}.vc-bg-blue-400{background-color:#63b3ed}.vc-bg-blue-500{background-color:#4299e1}.vc-bg-blue-600{background-color:#3182ce}.vc-bg-blue-700{background-color:#2b6cb0}.vc-bg-blue-800{background-color:#2c5282}.vc-bg-blue-900{background-color:#2a4365}.vc-bg-indigo-100{background-color:#ebf4ff}.vc-bg-indigo-200{background-color:#c3dafe}.vc-bg-indigo-300{background-color:#a3bffa}.vc-bg-indigo-400{background-color:#7f9cf5}.vc-bg-indigo-500{background-color:#667eea}.vc-bg-indigo-600{background-color:#5a67d8}.vc-bg-indigo-700{background-color:#4c51bf}.vc-bg-indigo-800{background-color:#434190}.vc-bg-indigo-900{background-color:#3c366b}.vc-bg-purple-100{background-color:#faf5ff}.vc-bg-purple-200{background-color:#e9d8fd}.vc-bg-purple-300{background-color:#d6bcfa}.vc-bg-purple-400{background-color:#b794f4}.vc-bg-purple-500{background-color:#9f7aea}.vc-bg-purple-600{background-color:#805ad5}.vc-bg-purple-700{background-color:#6b46c1}.vc-bg-purple-800{background-color:#553c9a}.vc-bg-purple-900{background-color:#44337a}.vc-bg-pink-100{background-color:#fff5f7}.vc-bg-pink-200{background-color:#fed7e2}.vc-bg-pink-300{background-color:#fbb6ce}.vc-bg-pink-400{background-color:#f687b3}.vc-bg-pink-500{background-color:#ed64a6}.vc-bg-pink-600{background-color:#d53f8c}.vc-bg-pink-700{background-color:#b83280}.vc-bg-pink-800{background-color:#97266d}.vc-bg-pink-900{background-color:#702459}.hover\\:vc-bg-transparent:hover{background-color:initial}.hover\\:vc-bg-black:hover{background-color:#000}.hover\\:vc-bg-white:hover{background-color:#fff}.hover\\:vc-bg-gray-100:hover{background-color:#f7fafc}.hover\\:vc-bg-gray-200:hover{background-color:#edf2f7}.hover\\:vc-bg-gray-300:hover{background-color:#e2e8f0}.hover\\:vc-bg-gray-400:hover{background-color:#cbd5e0}.hover\\:vc-bg-gray-500:hover{background-color:#a0aec0}.hover\\:vc-bg-gray-600:hover{background-color:#718096}.hover\\:vc-bg-gray-700:hover{background-color:#4a5568}.hover\\:vc-bg-gray-800:hover{background-color:#2d3748}.hover\\:vc-bg-gray-900:hover{background-color:#1a202c}.hover\\:vc-bg-red-100:hover{background-color:#fff5f5}.hover\\:vc-bg-red-200:hover{background-color:#fed7d7}.hover\\:vc-bg-red-300:hover{background-color:#feb2b2}.hover\\:vc-bg-red-400:hover{background-color:#fc8181}.hover\\:vc-bg-red-500:hover{background-color:#f56565}.hover\\:vc-bg-red-600:hover{background-color:#e53e3e}.hover\\:vc-bg-red-700:hover{background-color:#c53030}.hover\\:vc-bg-red-800:hover{background-color:#9b2c2c}.hover\\:vc-bg-red-900:hover{background-color:#742a2a}.hover\\:vc-bg-orange-100:hover{background-color:#fffaf0}.hover\\:vc-bg-orange-200:hover{background-color:#feebc8}.hover\\:vc-bg-orange-300:hover{background-color:#fbd38d}.hover\\:vc-bg-orange-400:hover{background-color:#f6ad55}.hover\\:vc-bg-orange-500:hover{background-color:#ed8936}.hover\\:vc-bg-orange-600:hover{background-color:#dd6b20}.hover\\:vc-bg-orange-700:hover{background-color:#c05621}.hover\\:vc-bg-orange-800:hover{background-color:#9c4221}.hover\\:vc-bg-orange-900:hover{background-color:#7b341e}.hover\\:vc-bg-yellow-100:hover{background-color:ivory}.hover\\:vc-bg-yellow-200:hover{background-color:#fefcbf}.hover\\:vc-bg-yellow-300:hover{background-color:#faf089}.hover\\:vc-bg-yellow-400:hover{background-color:#f6e05e}.hover\\:vc-bg-yellow-500:hover{background-color:#ecc94b}.hover\\:vc-bg-yellow-600:hover{background-color:#d69e2e}.hover\\:vc-bg-yellow-700:hover{background-color:#b7791f}.hover\\:vc-bg-yellow-800:hover{background-color:#975a16}.hover\\:vc-bg-yellow-900:hover{background-color:#744210}.hover\\:vc-bg-green-100:hover{background-color:#f0fff4}.hover\\:vc-bg-green-200:hover{background-color:#c6f6d5}.hover\\:vc-bg-green-300:hover{background-color:#9ae6b4}.hover\\:vc-bg-green-400:hover{background-color:#68d391}.hover\\:vc-bg-green-500:hover{background-color:#48bb78}.hover\\:vc-bg-green-600:hover{background-color:#38a169}.hover\\:vc-bg-green-700:hover{background-color:#2f855a}.hover\\:vc-bg-green-800:hover{background-color:#276749}.hover\\:vc-bg-green-900:hover{background-color:#22543d}.hover\\:vc-bg-teal-100:hover{background-color:#e6fffa}.hover\\:vc-bg-teal-200:hover{background-color:#b2f5ea}.hover\\:vc-bg-teal-300:hover{background-color:#81e6d9}.hover\\:vc-bg-teal-400:hover{background-color:#4fd1c5}.hover\\:vc-bg-teal-500:hover{background-color:#38b2ac}.hover\\:vc-bg-teal-600:hover{background-color:#319795}.hover\\:vc-bg-teal-700:hover{background-color:#2c7a7b}.hover\\:vc-bg-teal-800:hover{background-color:#285e61}.hover\\:vc-bg-teal-900:hover{background-color:#234e52}.hover\\:vc-bg-blue-100:hover{background-color:#ebf8ff}.hover\\:vc-bg-blue-200:hover{background-color:#bee3f8}.hover\\:vc-bg-blue-300:hover{background-color:#90cdf4}.hover\\:vc-bg-blue-400:hover{background-color:#63b3ed}.hover\\:vc-bg-blue-500:hover{background-color:#4299e1}.hover\\:vc-bg-blue-600:hover{background-color:#3182ce}.hover\\:vc-bg-blue-700:hover{background-color:#2b6cb0}.hover\\:vc-bg-blue-800:hover{background-color:#2c5282}.hover\\:vc-bg-blue-900:hover{background-color:#2a4365}.hover\\:vc-bg-indigo-100:hover{background-color:#ebf4ff}.hover\\:vc-bg-indigo-200:hover{background-color:#c3dafe}.hover\\:vc-bg-indigo-300:hover{background-color:#a3bffa}.hover\\:vc-bg-indigo-400:hover{background-color:#7f9cf5}.hover\\:vc-bg-indigo-500:hover{background-color:#667eea}.hover\\:vc-bg-indigo-600:hover{background-color:#5a67d8}.hover\\:vc-bg-indigo-700:hover{background-color:#4c51bf}.hover\\:vc-bg-indigo-800:hover{background-color:#434190}.hover\\:vc-bg-indigo-900:hover{background-color:#3c366b}.hover\\:vc-bg-purple-100:hover{background-color:#faf5ff}.hover\\:vc-bg-purple-200:hover{background-color:#e9d8fd}.hover\\:vc-bg-purple-300:hover{background-color:#d6bcfa}.hover\\:vc-bg-purple-400:hover{background-color:#b794f4}.hover\\:vc-bg-purple-500:hover{background-color:#9f7aea}.hover\\:vc-bg-purple-600:hover{background-color:#805ad5}.hover\\:vc-bg-purple-700:hover{background-color:#6b46c1}.hover\\:vc-bg-purple-800:hover{background-color:#553c9a}.hover\\:vc-bg-purple-900:hover{background-color:#44337a}.hover\\:vc-bg-pink-100:hover{background-color:#fff5f7}.hover\\:vc-bg-pink-200:hover{background-color:#fed7e2}.hover\\:vc-bg-pink-300:hover{background-color:#fbb6ce}.hover\\:vc-bg-pink-400:hover{background-color:#f687b3}.hover\\:vc-bg-pink-500:hover{background-color:#ed64a6}.hover\\:vc-bg-pink-600:hover{background-color:#d53f8c}.hover\\:vc-bg-pink-700:hover{background-color:#b83280}.hover\\:vc-bg-pink-800:hover{background-color:#97266d}.hover\\:vc-bg-pink-900:hover{background-color:#702459}.vc-bg-bottom{background-position:bottom}.vc-bg-center{background-position:50%}.vc-bg-left{background-position:0}.vc-bg-left-bottom{background-position:0 100%}.vc-bg-left-top{background-position:0 0}.vc-bg-right{background-position:100%}.vc-bg-right-bottom{background-position:100% 100%}.vc-bg-right-top{background-position:100% 0}.vc-bg-top{background-position:top}.vc-bg-repeat{background-repeat:repeat}.vc-bg-no-repeat{background-repeat:no-repeat}.vc-bg-repeat-x{background-repeat:repeat-x}.vc-bg-repeat-y{background-repeat:repeat-y}.vc-bg-repeat-round{background-repeat:round}.vc-bg-repeat-space{background-repeat:space}.vc-bg-auto{background-size:auto}.vc-bg-cover{background-size:cover}.vc-bg-contain{background-size:contain}.vc-border-collapse{border-collapse:collapse}.vc-border-separate{border-collapse:initial}.vc-border-transparent{border-color:transparent}.vc-border-black{border-color:#000}.vc-border-white{border-color:#fff}.vc-border-gray-100{border-color:#f7fafc}.vc-border-gray-200{border-color:#edf2f7}.vc-border-gray-300{border-color:#e2e8f0}.vc-border-gray-400{border-color:#cbd5e0}.vc-border-gray-500{border-color:#a0aec0}.vc-border-gray-600{border-color:#718096}.vc-border-gray-700{border-color:#4a5568}.vc-border-gray-800{border-color:#2d3748}.vc-border-gray-900{border-color:#1a202c}.vc-border-red-100{border-color:#fff5f5}.vc-border-red-200{border-color:#fed7d7}.vc-border-red-300{border-color:#feb2b2}.vc-border-red-400{border-color:#fc8181}.vc-border-red-500{border-color:#f56565}.vc-border-red-600{border-color:#e53e3e}.vc-border-red-700{border-color:#c53030}.vc-border-red-800{border-color:#9b2c2c}.vc-border-red-900{border-color:#742a2a}.vc-border-orange-100{border-color:#fffaf0}.vc-border-orange-200{border-color:#feebc8}.vc-border-orange-300{border-color:#fbd38d}.vc-border-orange-400{border-color:#f6ad55}.vc-border-orange-500{border-color:#ed8936}.vc-border-orange-600{border-color:#dd6b20}.vc-border-orange-700{border-color:#c05621}.vc-border-orange-800{border-color:#9c4221}.vc-border-orange-900{border-color:#7b341e}.vc-border-yellow-100{border-color:ivory}.vc-border-yellow-200{border-color:#fefcbf}.vc-border-yellow-300{border-color:#faf089}.vc-border-yellow-400{border-color:#f6e05e}.vc-border-yellow-500{border-color:#ecc94b}.vc-border-yellow-600{border-color:#d69e2e}.vc-border-yellow-700{border-color:#b7791f}.vc-border-yellow-800{border-color:#975a16}.vc-border-yellow-900{border-color:#744210}.vc-border-green-100{border-color:#f0fff4}.vc-border-green-200{border-color:#c6f6d5}.vc-border-green-300{border-color:#9ae6b4}.vc-border-green-400{border-color:#68d391}.vc-border-green-500{border-color:#48bb78}.vc-border-green-600{border-color:#38a169}.vc-border-green-700{border-color:#2f855a}.vc-border-green-800{border-color:#276749}.vc-border-green-900{border-color:#22543d}.vc-border-teal-100{border-color:#e6fffa}.vc-border-teal-200{border-color:#b2f5ea}.vc-border-teal-300{border-color:#81e6d9}.vc-border-teal-400{border-color:#4fd1c5}.vc-border-teal-500{border-color:#38b2ac}.vc-border-teal-600{border-color:#319795}.vc-border-teal-700{border-color:#2c7a7b}.vc-border-teal-800{border-color:#285e61}.vc-border-teal-900{border-color:#234e52}.vc-border-blue-100{border-color:#ebf8ff}.vc-border-blue-200{border-color:#bee3f8}.vc-border-blue-300{border-color:#90cdf4}.vc-border-blue-400{border-color:#63b3ed}.vc-border-blue-500{border-color:#4299e1}.vc-border-blue-600{border-color:#3182ce}.vc-border-blue-700{border-color:#2b6cb0}.vc-border-blue-800{border-color:#2c5282}.vc-border-blue-900{border-color:#2a4365}.vc-border-indigo-100{border-color:#ebf4ff}.vc-border-indigo-200{border-color:#c3dafe}.vc-border-indigo-300{border-color:#a3bffa}.vc-border-indigo-400{border-color:#7f9cf5}.vc-border-indigo-500{border-color:#667eea}.vc-border-indigo-600{border-color:#5a67d8}.vc-border-indigo-700{border-color:#4c51bf}.vc-border-indigo-800{border-color:#434190}.vc-border-indigo-900{border-color:#3c366b}.vc-border-purple-100{border-color:#faf5ff}.vc-border-purple-200{border-color:#e9d8fd}.vc-border-purple-300{border-color:#d6bcfa}.vc-border-purple-400{border-color:#b794f4}.vc-border-purple-500{border-color:#9f7aea}.vc-border-purple-600{border-color:#805ad5}.vc-border-purple-700{border-color:#6b46c1}.vc-border-purple-800{border-color:#553c9a}.vc-border-purple-900{border-color:#44337a}.vc-border-pink-100{border-color:#fff5f7}.vc-border-pink-200{border-color:#fed7e2}.vc-border-pink-300{border-color:#fbb6ce}.vc-border-pink-400{border-color:#f687b3}.vc-border-pink-500{border-color:#ed64a6}.vc-border-pink-600{border-color:#d53f8c}.vc-border-pink-700{border-color:#b83280}.vc-border-pink-800{border-color:#97266d}.vc-border-pink-900{border-color:#702459}.hover\\:vc-border-transparent:hover{border-color:transparent}.hover\\:vc-border-black:hover{border-color:#000}.hover\\:vc-border-white:hover{border-color:#fff}.hover\\:vc-border-gray-100:hover{border-color:#f7fafc}.hover\\:vc-border-gray-200:hover{border-color:#edf2f7}.hover\\:vc-border-gray-300:hover{border-color:#e2e8f0}.hover\\:vc-border-gray-400:hover{border-color:#cbd5e0}.hover\\:vc-border-gray-500:hover{border-color:#a0aec0}.hover\\:vc-border-gray-600:hover{border-color:#718096}.hover\\:vc-border-gray-700:hover{border-color:#4a5568}.hover\\:vc-border-gray-800:hover{border-color:#2d3748}.hover\\:vc-border-gray-900:hover{border-color:#1a202c}.hover\\:vc-border-red-100:hover{border-color:#fff5f5}.hover\\:vc-border-red-200:hover{border-color:#fed7d7}.hover\\:vc-border-red-300:hover{border-color:#feb2b2}.hover\\:vc-border-red-400:hover{border-color:#fc8181}.hover\\:vc-border-red-500:hover{border-color:#f56565}.hover\\:vc-border-red-600:hover{border-color:#e53e3e}.hover\\:vc-border-red-700:hover{border-color:#c53030}.hover\\:vc-border-red-800:hover{border-color:#9b2c2c}.hover\\:vc-border-red-900:hover{border-color:#742a2a}.hover\\:vc-border-orange-100:hover{border-color:#fffaf0}.hover\\:vc-border-orange-200:hover{border-color:#feebc8}.hover\\:vc-border-orange-300:hover{border-color:#fbd38d}.hover\\:vc-border-orange-400:hover{border-color:#f6ad55}.hover\\:vc-border-orange-500:hover{border-color:#ed8936}.hover\\:vc-border-orange-600:hover{border-color:#dd6b20}.hover\\:vc-border-orange-700:hover{border-color:#c05621}.hover\\:vc-border-orange-800:hover{border-color:#9c4221}.hover\\:vc-border-orange-900:hover{border-color:#7b341e}.hover\\:vc-border-yellow-100:hover{border-color:ivory}.hover\\:vc-border-yellow-200:hover{border-color:#fefcbf}.hover\\:vc-border-yellow-300:hover{border-color:#faf089}.hover\\:vc-border-yellow-400:hover{border-color:#f6e05e}.hover\\:vc-border-yellow-500:hover{border-color:#ecc94b}.hover\\:vc-border-yellow-600:hover{border-color:#d69e2e}.hover\\:vc-border-yellow-700:hover{border-color:#b7791f}.hover\\:vc-border-yellow-800:hover{border-color:#975a16}.hover\\:vc-border-yellow-900:hover{border-color:#744210}.hover\\:vc-border-green-100:hover{border-color:#f0fff4}.hover\\:vc-border-green-200:hover{border-color:#c6f6d5}.hover\\:vc-border-green-300:hover{border-color:#9ae6b4}.hover\\:vc-border-green-400:hover{border-color:#68d391}.hover\\:vc-border-green-500:hover{border-color:#48bb78}.hover\\:vc-border-green-600:hover{border-color:#38a169}.hover\\:vc-border-green-700:hover{border-color:#2f855a}.hover\\:vc-border-green-800:hover{border-color:#276749}.hover\\:vc-border-green-900:hover{border-color:#22543d}.hover\\:vc-border-teal-100:hover{border-color:#e6fffa}.hover\\:vc-border-teal-200:hover{border-color:#b2f5ea}.hover\\:vc-border-teal-300:hover{border-color:#81e6d9}.hover\\:vc-border-teal-400:hover{border-color:#4fd1c5}.hover\\:vc-border-teal-500:hover{border-color:#38b2ac}.hover\\:vc-border-teal-600:hover{border-color:#319795}.hover\\:vc-border-teal-700:hover{border-color:#2c7a7b}.hover\\:vc-border-teal-800:hover{border-color:#285e61}.hover\\:vc-border-teal-900:hover{border-color:#234e52}.hover\\:vc-border-blue-100:hover{border-color:#ebf8ff}.hover\\:vc-border-blue-200:hover{border-color:#bee3f8}.hover\\:vc-border-blue-300:hover{border-color:#90cdf4}.hover\\:vc-border-blue-400:hover{border-color:#63b3ed}.hover\\:vc-border-blue-500:hover{border-color:#4299e1}.hover\\:vc-border-blue-600:hover{border-color:#3182ce}.hover\\:vc-border-blue-700:hover{border-color:#2b6cb0}.hover\\:vc-border-blue-800:hover{border-color:#2c5282}.hover\\:vc-border-blue-900:hover{border-color:#2a4365}.hover\\:vc-border-indigo-100:hover{border-color:#ebf4ff}.hover\\:vc-border-indigo-200:hover{border-color:#c3dafe}.hover\\:vc-border-indigo-300:hover{border-color:#a3bffa}.hover\\:vc-border-indigo-400:hover{border-color:#7f9cf5}.hover\\:vc-border-indigo-500:hover{border-color:#667eea}.hover\\:vc-border-indigo-600:hover{border-color:#5a67d8}.hover\\:vc-border-indigo-700:hover{border-color:#4c51bf}.hover\\:vc-border-indigo-800:hover{border-color:#434190}.hover\\:vc-border-indigo-900:hover{border-color:#3c366b}.hover\\:vc-border-purple-100:hover{border-color:#faf5ff}.hover\\:vc-border-purple-200:hover{border-color:#e9d8fd}.hover\\:vc-border-purple-300:hover{border-color:#d6bcfa}.hover\\:vc-border-purple-400:hover{border-color:#b794f4}.hover\\:vc-border-purple-500:hover{border-color:#9f7aea}.hover\\:vc-border-purple-600:hover{border-color:#805ad5}.hover\\:vc-border-purple-700:hover{border-color:#6b46c1}.hover\\:vc-border-purple-800:hover{border-color:#553c9a}.hover\\:vc-border-purple-900:hover{border-color:#44337a}.hover\\:vc-border-pink-100:hover{border-color:#fff5f7}.hover\\:vc-border-pink-200:hover{border-color:#fed7e2}.hover\\:vc-border-pink-300:hover{border-color:#fbb6ce}.hover\\:vc-border-pink-400:hover{border-color:#f687b3}.hover\\:vc-border-pink-500:hover{border-color:#ed64a6}.hover\\:vc-border-pink-600:hover{border-color:#d53f8c}.hover\\:vc-border-pink-700:hover{border-color:#b83280}.hover\\:vc-border-pink-800:hover{border-color:#97266d}.hover\\:vc-border-pink-900:hover{border-color:#702459}.focus\\:vc-border-transparent:focus{border-color:transparent}.focus\\:vc-border-black:focus{border-color:#000}.focus\\:vc-border-white:focus{border-color:#fff}.focus\\:vc-border-gray-100:focus{border-color:#f7fafc}.focus\\:vc-border-gray-200:focus{border-color:#edf2f7}.focus\\:vc-border-gray-300:focus{border-color:#e2e8f0}.focus\\:vc-border-gray-400:focus{border-color:#cbd5e0}.focus\\:vc-border-gray-500:focus{border-color:#a0aec0}.focus\\:vc-border-gray-600:focus{border-color:#718096}.focus\\:vc-border-gray-700:focus{border-color:#4a5568}.focus\\:vc-border-gray-800:focus{border-color:#2d3748}.focus\\:vc-border-gray-900:focus{border-color:#1a202c}.focus\\:vc-border-red-100:focus{border-color:#fff5f5}.focus\\:vc-border-red-200:focus{border-color:#fed7d7}.focus\\:vc-border-red-300:focus{border-color:#feb2b2}.focus\\:vc-border-red-400:focus{border-color:#fc8181}.focus\\:vc-border-red-500:focus{border-color:#f56565}.focus\\:vc-border-red-600:focus{border-color:#e53e3e}.focus\\:vc-border-red-700:focus{border-color:#c53030}.focus\\:vc-border-red-800:focus{border-color:#9b2c2c}.focus\\:vc-border-red-900:focus{border-color:#742a2a}.focus\\:vc-border-orange-100:focus{border-color:#fffaf0}.focus\\:vc-border-orange-200:focus{border-color:#feebc8}.focus\\:vc-border-orange-300:focus{border-color:#fbd38d}.focus\\:vc-border-orange-400:focus{border-color:#f6ad55}.focus\\:vc-border-orange-500:focus{border-color:#ed8936}.focus\\:vc-border-orange-600:focus{border-color:#dd6b20}.focus\\:vc-border-orange-700:focus{border-color:#c05621}.focus\\:vc-border-orange-800:focus{border-color:#9c4221}.focus\\:vc-border-orange-900:focus{border-color:#7b341e}.focus\\:vc-border-yellow-100:focus{border-color:ivory}.focus\\:vc-border-yellow-200:focus{border-color:#fefcbf}.focus\\:vc-border-yellow-300:focus{border-color:#faf089}.focus\\:vc-border-yellow-400:focus{border-color:#f6e05e}.focus\\:vc-border-yellow-500:focus{border-color:#ecc94b}.focus\\:vc-border-yellow-600:focus{border-color:#d69e2e}.focus\\:vc-border-yellow-700:focus{border-color:#b7791f}.focus\\:vc-border-yellow-800:focus{border-color:#975a16}.focus\\:vc-border-yellow-900:focus{border-color:#744210}.focus\\:vc-border-green-100:focus{border-color:#f0fff4}.focus\\:vc-border-green-200:focus{border-color:#c6f6d5}.focus\\:vc-border-green-300:focus{border-color:#9ae6b4}.focus\\:vc-border-green-400:focus{border-color:#68d391}.focus\\:vc-border-green-500:focus{border-color:#48bb78}.focus\\:vc-border-green-600:focus{border-color:#38a169}.focus\\:vc-border-green-700:focus{border-color:#2f855a}.focus\\:vc-border-green-800:focus{border-color:#276749}.focus\\:vc-border-green-900:focus{border-color:#22543d}.focus\\:vc-border-teal-100:focus{border-color:#e6fffa}.focus\\:vc-border-teal-200:focus{border-color:#b2f5ea}.focus\\:vc-border-teal-300:focus{border-color:#81e6d9}.focus\\:vc-border-teal-400:focus{border-color:#4fd1c5}.focus\\:vc-border-teal-500:focus{border-color:#38b2ac}.focus\\:vc-border-teal-600:focus{border-color:#319795}.focus\\:vc-border-teal-700:focus{border-color:#2c7a7b}.focus\\:vc-border-teal-800:focus{border-color:#285e61}.focus\\:vc-border-teal-900:focus{border-color:#234e52}.focus\\:vc-border-blue-100:focus{border-color:#ebf8ff}.focus\\:vc-border-blue-200:focus{border-color:#bee3f8}.focus\\:vc-border-blue-300:focus{border-color:#90cdf4}.focus\\:vc-border-blue-400:focus{border-color:#63b3ed}.focus\\:vc-border-blue-500:focus{border-color:#4299e1}.focus\\:vc-border-blue-600:focus{border-color:#3182ce}.focus\\:vc-border-blue-700:focus{border-color:#2b6cb0}.focus\\:vc-border-blue-800:focus{border-color:#2c5282}.focus\\:vc-border-blue-900:focus{border-color:#2a4365}.focus\\:vc-border-indigo-100:focus{border-color:#ebf4ff}.focus\\:vc-border-indigo-200:focus{border-color:#c3dafe}.focus\\:vc-border-indigo-300:focus{border-color:#a3bffa}.focus\\:vc-border-indigo-400:focus{border-color:#7f9cf5}.focus\\:vc-border-indigo-500:focus{border-color:#667eea}.focus\\:vc-border-indigo-600:focus{border-color:#5a67d8}.focus\\:vc-border-indigo-700:focus{border-color:#4c51bf}.focus\\:vc-border-indigo-800:focus{border-color:#434190}.focus\\:vc-border-indigo-900:focus{border-color:#3c366b}.focus\\:vc-border-purple-100:focus{border-color:#faf5ff}.focus\\:vc-border-purple-200:focus{border-color:#e9d8fd}.focus\\:vc-border-purple-300:focus{border-color:#d6bcfa}.focus\\:vc-border-purple-400:focus{border-color:#b794f4}.focus\\:vc-border-purple-500:focus{border-color:#9f7aea}.focus\\:vc-border-purple-600:focus{border-color:#805ad5}.focus\\:vc-border-purple-700:focus{border-color:#6b46c1}.focus\\:vc-border-purple-800:focus{border-color:#553c9a}.focus\\:vc-border-purple-900:focus{border-color:#44337a}.focus\\:vc-border-pink-100:focus{border-color:#fff5f7}.focus\\:vc-border-pink-200:focus{border-color:#fed7e2}.focus\\:vc-border-pink-300:focus{border-color:#fbb6ce}.focus\\:vc-border-pink-400:focus{border-color:#f687b3}.focus\\:vc-border-pink-500:focus{border-color:#ed64a6}.focus\\:vc-border-pink-600:focus{border-color:#d53f8c}.focus\\:vc-border-pink-700:focus{border-color:#b83280}.focus\\:vc-border-pink-800:focus{border-color:#97266d}.focus\\:vc-border-pink-900:focus{border-color:#702459}.vc-rounded-none{border-radius:0}.vc-rounded-sm{border-radius:18px}.vc-rounded{border-radius:4px}.vc-rounded-lg{border-radius:8px}.vc-rounded-full{border-radius:9999px}.vc-rounded-t-none{border-top-left-radius:0;border-top-right-radius:0}.vc-rounded-r-none{border-top-right-radius:0;border-bottom-right-radius:0}.vc-rounded-b-none{border-bottom-right-radius:0;border-bottom-left-radius:0}.vc-rounded-l-none{border-top-left-radius:0;border-bottom-left-radius:0}.vc-rounded-t-sm{border-top-left-radius:18px;border-top-right-radius:18px}.vc-rounded-r-sm{border-top-right-radius:18px;border-bottom-right-radius:18px}.vc-rounded-b-sm{border-bottom-right-radius:18px;border-bottom-left-radius:18px}.vc-rounded-l-sm{border-top-left-radius:18px;border-bottom-left-radius:18px}.vc-rounded-t{border-top-left-radius:4px;border-top-right-radius:4px}.vc-rounded-r{border-top-right-radius:4px}.vc-rounded-b,.vc-rounded-r{border-bottom-right-radius:4px}.vc-rounded-b,.vc-rounded-l{border-bottom-left-radius:4px}.vc-rounded-l{border-top-left-radius:4px}.vc-rounded-t-lg{border-top-left-radius:8px;border-top-right-radius:8px}.vc-rounded-r-lg{border-top-right-radius:8px;border-bottom-right-radius:8px}.vc-rounded-b-lg{border-bottom-right-radius:8px;border-bottom-left-radius:8px}.vc-rounded-l-lg{border-top-left-radius:8px;border-bottom-left-radius:8px}.vc-rounded-t-full{border-top-left-radius:9999px;border-top-right-radius:9999px}.vc-rounded-r-full{border-top-right-radius:9999px;border-bottom-right-radius:9999px}.vc-rounded-b-full{border-bottom-right-radius:9999px;border-bottom-left-radius:9999px}.vc-rounded-l-full{border-top-left-radius:9999px;border-bottom-left-radius:9999px}.vc-rounded-tl-none{border-top-left-radius:0}.vc-rounded-tr-none{border-top-right-radius:0}.vc-rounded-br-none{border-bottom-right-radius:0}.vc-rounded-bl-none{border-bottom-left-radius:0}.vc-rounded-tl-sm{border-top-left-radius:18px}.vc-rounded-tr-sm{border-top-right-radius:18px}.vc-rounded-br-sm{border-bottom-right-radius:18px}.vc-rounded-bl-sm{border-bottom-left-radius:18px}.vc-rounded-tl{border-top-left-radius:4px}.vc-rounded-tr{border-top-right-radius:4px}.vc-rounded-br{border-bottom-right-radius:4px}.vc-rounded-bl{border-bottom-left-radius:4px}.vc-rounded-tl-lg{border-top-left-radius:8px}.vc-rounded-tr-lg{border-top-right-radius:8px}.vc-rounded-br-lg{border-bottom-right-radius:8px}.vc-rounded-bl-lg{border-bottom-left-radius:8px}.vc-rounded-tl-full{border-top-left-radius:9999px}.vc-rounded-tr-full{border-top-right-radius:9999px}.vc-rounded-br-full{border-bottom-right-radius:9999px}.vc-rounded-bl-full{border-bottom-left-radius:9999px}.vc-border-solid{border-style:solid}.vc-border-dashed{border-style:dashed}.vc-border-dotted{border-style:dotted}.vc-border-double{border-style:double}.vc-border-none{border-style:none}.vc-border-0{border-width:0}.vc-border-2{border-width:2px}.vc-border-4{border-width:4px}.vc-border-8{border-width:8px}.vc-border{border-width:1px}.vc-border-t-0{border-top-width:0}.vc-border-r-0{border-right-width:0}.vc-border-b-0{border-bottom-width:0}.vc-border-l-0{border-left-width:0}.vc-border-t-2{border-top-width:2px}.vc-border-r-2{border-right-width:2px}.vc-border-b-2{border-bottom-width:2px}.vc-border-l-2{border-left-width:2px}.vc-border-t-4{border-top-width:4px}.vc-border-r-4{border-right-width:4px}.vc-border-b-4{border-bottom-width:4px}.vc-border-l-4{border-left-width:4px}.vc-border-t-8{border-top-width:8px}.vc-border-r-8{border-right-width:8px}.vc-border-b-8{border-bottom-width:8px}.vc-border-l-8{border-left-width:8px}.vc-border-t{border-top-width:1px}.vc-border-r{border-right-width:1px}.vc-border-b{border-bottom-width:1px}.vc-border-l{border-left-width:1px}.vc-cursor-pointer{cursor:pointer}.vc-cursor-not-allowed{cursor:not-allowed}.vc-flex{display:flex}.vc-items-center{align-items:center}.vc-justify-center{justify-content:center}.vc-font-medium{font-weight:500}.vc-font-semibold{font-weight:600}.focus\\:vc-font-bold:focus,.vc-font-bold{font-weight:700}.vc-h-full{height:100%}.vc-leading-tight{line-height:1.25}.vc-leading-snug{line-height:1.375}.vc-mr-auto{margin-right:auto}.vc-ml-auto{margin-left:auto}.vc-min-w-full{min-width:100%}.vc-opacity-0{opacity:0}.vc-opacity-25{opacity:.25}.vc-opacity-75{opacity:.75}.hover\\:vc-opacity-50:hover{opacity:.5}.hover\\:vc-opacity-75:hover{opacity:.75}.focus\\:vc-outline-none:focus{outline:0}.vc-overflow-hidden{overflow:hidden}.vc-p-1{padding:4px}.vc-py-1{padding-top:4px;padding-bottom:4px}.vc-py-2{padding-top:8px;padding-bottom:8px}.vc-px-2{padding-left:8px;padding-right:8px}.vc-px-3{padding-left:12px;padding-right:12px}.vc-pointer-events-none{pointer-events:none}.vc-pointer-events-auto{pointer-events:auto}.vc-relative{position:relative}.vc-shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.06)}.hover\\:vc-shadow-inner:hover{box-shadow:inset 0 2px 4px 0 rgba(0,0,0,.06)}.focus\\:vc-shadow:focus{box-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.06)}.vc-text-left{text-align:left}.vc-text-center{text-align:center}.vc-text-right{text-align:right}.vc-text-justify{text-align:justify}.vc-text-transparent{color:transparent}.vc-text-black{color:#000}.vc-text-white{color:#fff}.vc-text-gray-100{color:#f7fafc}.vc-text-gray-200{color:#edf2f7}.vc-text-gray-300{color:#e2e8f0}.vc-text-gray-400{color:#cbd5e0}.vc-text-gray-500{color:#a0aec0}.vc-text-gray-600{color:#718096}.vc-text-gray-700{color:#4a5568}.vc-text-gray-800{color:#2d3748}.vc-text-gray-900{color:#1a202c}.vc-text-red-100{color:#fff5f5}.vc-text-red-200{color:#fed7d7}.vc-text-red-300{color:#feb2b2}.vc-text-red-400{color:#fc8181}.vc-text-red-500{color:#f56565}.vc-text-red-600{color:#e53e3e}.vc-text-red-700{color:#c53030}.vc-text-red-800{color:#9b2c2c}.vc-text-red-900{color:#742a2a}.vc-text-orange-100{color:#fffaf0}.vc-text-orange-200{color:#feebc8}.vc-text-orange-300{color:#fbd38d}.vc-text-orange-400{color:#f6ad55}.vc-text-orange-500{color:#ed8936}.vc-text-orange-600{color:#dd6b20}.vc-text-orange-700{color:#c05621}.vc-text-orange-800{color:#9c4221}.vc-text-orange-900{color:#7b341e}.vc-text-yellow-100{color:ivory}.vc-text-yellow-200{color:#fefcbf}.vc-text-yellow-300{color:#faf089}.vc-text-yellow-400{color:#f6e05e}.vc-text-yellow-500{color:#ecc94b}.vc-text-yellow-600{color:#d69e2e}.vc-text-yellow-700{color:#b7791f}.vc-text-yellow-800{color:#975a16}.vc-text-yellow-900{color:#744210}.vc-text-green-100{color:#f0fff4}.vc-text-green-200{color:#c6f6d5}.vc-text-green-300{color:#9ae6b4}.vc-text-green-400{color:#68d391}.vc-text-green-500{color:#48bb78}.vc-text-green-600{color:#38a169}.vc-text-green-700{color:#2f855a}.vc-text-green-800{color:#276749}.vc-text-green-900{color:#22543d}.vc-text-teal-100{color:#e6fffa}.vc-text-teal-200{color:#b2f5ea}.vc-text-teal-300{color:#81e6d9}.vc-text-teal-400{color:#4fd1c5}.vc-text-teal-500{color:#38b2ac}.vc-text-teal-600{color:#319795}.vc-text-teal-700{color:#2c7a7b}.vc-text-teal-800{color:#285e61}.vc-text-teal-900{color:#234e52}.vc-text-blue-100{color:#ebf8ff}.vc-text-blue-200{color:#bee3f8}.vc-text-blue-300{color:#90cdf4}.vc-text-blue-400{color:#63b3ed}.vc-text-blue-500{color:#4299e1}.vc-text-blue-600{color:#3182ce}.vc-text-blue-700{color:#2b6cb0}.vc-text-blue-800{color:#2c5282}.vc-text-blue-900{color:#2a4365}.vc-text-indigo-100{color:#ebf4ff}.vc-text-indigo-200{color:#c3dafe}.vc-text-indigo-300{color:#a3bffa}.vc-text-indigo-400{color:#7f9cf5}.vc-text-indigo-500{color:#667eea}.vc-text-indigo-600{color:#5a67d8}.vc-text-indigo-700{color:#4c51bf}.vc-text-indigo-800{color:#434190}.vc-text-indigo-900{color:#3c366b}.vc-text-purple-100{color:#faf5ff}.vc-text-purple-200{color:#e9d8fd}.vc-text-purple-300{color:#d6bcfa}.vc-text-purple-400{color:#b794f4}.vc-text-purple-500{color:#9f7aea}.vc-text-purple-600{color:#805ad5}.vc-text-purple-700{color:#6b46c1}.vc-text-purple-800{color:#553c9a}.vc-text-purple-900{color:#44337a}.vc-text-pink-100{color:#fff5f7}.vc-text-pink-200{color:#fed7e2}.vc-text-pink-300{color:#fbb6ce}.vc-text-pink-400{color:#f687b3}.vc-text-pink-500{color:#ed64a6}.vc-text-pink-600{color:#d53f8c}.vc-text-pink-700{color:#b83280}.vc-text-pink-800{color:#97266d}.vc-text-pink-900{color:#702459}.hover\\:vc-text-transparent:hover{color:transparent}.hover\\:vc-text-black:hover{color:#000}.hover\\:vc-text-white:hover{color:#fff}.hover\\:vc-text-gray-100:hover{color:#f7fafc}.hover\\:vc-text-gray-200:hover{color:#edf2f7}.hover\\:vc-text-gray-300:hover{color:#e2e8f0}.hover\\:vc-text-gray-400:hover{color:#cbd5e0}.hover\\:vc-text-gray-500:hover{color:#a0aec0}.hover\\:vc-text-gray-600:hover{color:#718096}.hover\\:vc-text-gray-700:hover{color:#4a5568}.hover\\:vc-text-gray-800:hover{color:#2d3748}.hover\\:vc-text-gray-900:hover{color:#1a202c}.hover\\:vc-text-red-100:hover{color:#fff5f5}.hover\\:vc-text-red-200:hover{color:#fed7d7}.hover\\:vc-text-red-300:hover{color:#feb2b2}.hover\\:vc-text-red-400:hover{color:#fc8181}.hover\\:vc-text-red-500:hover{color:#f56565}.hover\\:vc-text-red-600:hover{color:#e53e3e}.hover\\:vc-text-red-700:hover{color:#c53030}.hover\\:vc-text-red-800:hover{color:#9b2c2c}.hover\\:vc-text-red-900:hover{color:#742a2a}.hover\\:vc-text-orange-100:hover{color:#fffaf0}.hover\\:vc-text-orange-200:hover{color:#feebc8}.hover\\:vc-text-orange-300:hover{color:#fbd38d}.hover\\:vc-text-orange-400:hover{color:#f6ad55}.hover\\:vc-text-orange-500:hover{color:#ed8936}.hover\\:vc-text-orange-600:hover{color:#dd6b20}.hover\\:vc-text-orange-700:hover{color:#c05621}.hover\\:vc-text-orange-800:hover{color:#9c4221}.hover\\:vc-text-orange-900:hover{color:#7b341e}.hover\\:vc-text-yellow-100:hover{color:ivory}.hover\\:vc-text-yellow-200:hover{color:#fefcbf}.hover\\:vc-text-yellow-300:hover{color:#faf089}.hover\\:vc-text-yellow-400:hover{color:#f6e05e}.hover\\:vc-text-yellow-500:hover{color:#ecc94b}.hover\\:vc-text-yellow-600:hover{color:#d69e2e}.hover\\:vc-text-yellow-700:hover{color:#b7791f}.hover\\:vc-text-yellow-800:hover{color:#975a16}.hover\\:vc-text-yellow-900:hover{color:#744210}.hover\\:vc-text-green-100:hover{color:#f0fff4}.hover\\:vc-text-green-200:hover{color:#c6f6d5}.hover\\:vc-text-green-300:hover{color:#9ae6b4}.hover\\:vc-text-green-400:hover{color:#68d391}.hover\\:vc-text-green-500:hover{color:#48bb78}.hover\\:vc-text-green-600:hover{color:#38a169}.hover\\:vc-text-green-700:hover{color:#2f855a}.hover\\:vc-text-green-800:hover{color:#276749}.hover\\:vc-text-green-900:hover{color:#22543d}.hover\\:vc-text-teal-100:hover{color:#e6fffa}.hover\\:vc-text-teal-200:hover{color:#b2f5ea}.hover\\:vc-text-teal-300:hover{color:#81e6d9}.hover\\:vc-text-teal-400:hover{color:#4fd1c5}.hover\\:vc-text-teal-500:hover{color:#38b2ac}.hover\\:vc-text-teal-600:hover{color:#319795}.hover\\:vc-text-teal-700:hover{color:#2c7a7b}.hover\\:vc-text-teal-800:hover{color:#285e61}.hover\\:vc-text-teal-900:hover{color:#234e52}.hover\\:vc-text-blue-100:hover{color:#ebf8ff}.hover\\:vc-text-blue-200:hover{color:#bee3f8}.hover\\:vc-text-blue-300:hover{color:#90cdf4}.hover\\:vc-text-blue-400:hover{color:#63b3ed}.hover\\:vc-text-blue-500:hover{color:#4299e1}.hover\\:vc-text-blue-600:hover{color:#3182ce}.hover\\:vc-text-blue-700:hover{color:#2b6cb0}.hover\\:vc-text-blue-800:hover{color:#2c5282}.hover\\:vc-text-blue-900:hover{color:#2a4365}.hover\\:vc-text-indigo-100:hover{color:#ebf4ff}.hover\\:vc-text-indigo-200:hover{color:#c3dafe}.hover\\:vc-text-indigo-300:hover{color:#a3bffa}.hover\\:vc-text-indigo-400:hover{color:#7f9cf5}.hover\\:vc-text-indigo-500:hover{color:#667eea}.hover\\:vc-text-indigo-600:hover{color:#5a67d8}.hover\\:vc-text-indigo-700:hover{color:#4c51bf}.hover\\:vc-text-indigo-800:hover{color:#434190}.hover\\:vc-text-indigo-900:hover{color:#3c366b}.hover\\:vc-text-purple-100:hover{color:#faf5ff}.hover\\:vc-text-purple-200:hover{color:#e9d8fd}.hover\\:vc-text-purple-300:hover{color:#d6bcfa}.hover\\:vc-text-purple-400:hover{color:#b794f4}.hover\\:vc-text-purple-500:hover{color:#9f7aea}.hover\\:vc-text-purple-600:hover{color:#805ad5}.hover\\:vc-text-purple-700:hover{color:#6b46c1}.hover\\:vc-text-purple-800:hover{color:#553c9a}.hover\\:vc-text-purple-900:hover{color:#44337a}.hover\\:vc-text-pink-100:hover{color:#fff5f7}.hover\\:vc-text-pink-200:hover{color:#fed7e2}.hover\\:vc-text-pink-300:hover{color:#fbb6ce}.hover\\:vc-text-pink-400:hover{color:#f687b3}.hover\\:vc-text-pink-500:hover{color:#ed64a6}.hover\\:vc-text-pink-600:hover{color:#d53f8c}.hover\\:vc-text-pink-700:hover{color:#b83280}.hover\\:vc-text-pink-800:hover{color:#97266d}.hover\\:vc-text-pink-900:hover{color:#702459}.vc-text-xs{font-size:12px}.vc-text-sm{font-size:14px}.vc-text-base{font-size:16px}.vc-text-lg{font-size:18px}.vc-text-xl{font-size:20px}.vc-text-2xl{font-size:24px}.vc-select-none{-webkit-user-select:none;-ms-user-select:none;user-select:none}.vc-w-12{width:48px}.vc-w-full{width:100%}@media (min-width:640px){.sm\\:vc-bg-fixed{background-attachment:fixed}.sm\\:vc-bg-local{background-attachment:local}.sm\\:vc-bg-scroll{background-attachment:scroll}.sm\\:vc-bg-bottom{background-position:bottom}.sm\\:vc-bg-center{background-position:50%}.sm\\:vc-bg-left{background-position:0}.sm\\:vc-bg-left-bottom{background-position:0 100%}.sm\\:vc-bg-left-top{background-position:0 0}.sm\\:vc-bg-right{background-position:100%}.sm\\:vc-bg-right-bottom{background-position:100% 100%}.sm\\:vc-bg-right-top{background-position:100% 0}.sm\\:vc-bg-top{background-position:top}.sm\\:vc-bg-repeat{background-repeat:repeat}.sm\\:vc-bg-no-repeat{background-repeat:no-repeat}.sm\\:vc-bg-repeat-x{background-repeat:repeat-x}.sm\\:vc-bg-repeat-y{background-repeat:repeat-y}.sm\\:vc-bg-repeat-round{background-repeat:round}.sm\\:vc-bg-repeat-space{background-repeat:space}.sm\\:vc-bg-auto{background-size:auto}.sm\\:vc-bg-cover{background-size:cover}.sm\\:vc-bg-contain{background-size:contain}.sm\\:vc-border-collapse{border-collapse:collapse}.sm\\:vc-border-separate{border-collapse:initial}.sm\\:vc-border-solid{border-style:solid}.sm\\:vc-border-dashed{border-style:dashed}.sm\\:vc-border-dotted{border-style:dotted}.sm\\:vc-border-double{border-style:double}.sm\\:vc-border-none{border-style:none}.sm\\:vc-border-0{border-width:0}.sm\\:vc-border-2{border-width:2px}.sm\\:vc-border-4{border-width:4px}.sm\\:vc-border-8{border-width:8px}.sm\\:vc-border{border-width:1px}.sm\\:vc-border-t-0{border-top-width:0}.sm\\:vc-border-r-0{border-right-width:0}.sm\\:vc-border-b-0{border-bottom-width:0}.sm\\:vc-border-l-0{border-left-width:0}.sm\\:vc-border-t-2{border-top-width:2px}.sm\\:vc-border-r-2{border-right-width:2px}.sm\\:vc-border-b-2{border-bottom-width:2px}.sm\\:vc-border-l-2{border-left-width:2px}.sm\\:vc-border-t-4{border-top-width:4px}.sm\\:vc-border-r-4{border-right-width:4px}.sm\\:vc-border-b-4{border-bottom-width:4px}.sm\\:vc-border-l-4{border-left-width:4px}.sm\\:vc-border-t-8{border-top-width:8px}.sm\\:vc-border-r-8{border-right-width:8px}.sm\\:vc-border-b-8{border-bottom-width:8px}.sm\\:vc-border-l-8{border-left-width:8px}.sm\\:vc-border-t{border-top-width:1px}.sm\\:vc-border-r{border-right-width:1px}.sm\\:vc-border-b{border-bottom-width:1px}.sm\\:vc-border-l{border-left-width:1px}.sm\\:vc-text-left{text-align:left}.sm\\:vc-text-center{text-align:center}.sm\\:vc-text-right{text-align:right}.sm\\:vc-text-justify{text-align:justify}.sm\\:vc-text-xs{font-size:12px}.sm\\:vc-text-sm{font-size:14px}.sm\\:vc-text-base{font-size:16px}.sm\\:vc-text-lg{font-size:18px}.sm\\:vc-text-xl{font-size:20px}.sm\\:vc-text-2xl{font-size:24px}}@media (min-width:768px){.md\\:vc-bg-fixed{background-attachment:fixed}.md\\:vc-bg-local{background-attachment:local}.md\\:vc-bg-scroll{background-attachment:scroll}.md\\:vc-bg-bottom{background-position:bottom}.md\\:vc-bg-center{background-position:50%}.md\\:vc-bg-left{background-position:0}.md\\:vc-bg-left-bottom{background-position:0 100%}.md\\:vc-bg-left-top{background-position:0 0}.md\\:vc-bg-right{background-position:100%}.md\\:vc-bg-right-bottom{background-position:100% 100%}.md\\:vc-bg-right-top{background-position:100% 0}.md\\:vc-bg-top{background-position:top}.md\\:vc-bg-repeat{background-repeat:repeat}.md\\:vc-bg-no-repeat{background-repeat:no-repeat}.md\\:vc-bg-repeat-x{background-repeat:repeat-x}.md\\:vc-bg-repeat-y{background-repeat:repeat-y}.md\\:vc-bg-repeat-round{background-repeat:round}.md\\:vc-bg-repeat-space{background-repeat:space}.md\\:vc-bg-auto{background-size:auto}.md\\:vc-bg-cover{background-size:cover}.md\\:vc-bg-contain{background-size:contain}.md\\:vc-border-collapse{border-collapse:collapse}.md\\:vc-border-separate{border-collapse:initial}.md\\:vc-border-solid{border-style:solid}.md\\:vc-border-dashed{border-style:dashed}.md\\:vc-border-dotted{border-style:dotted}.md\\:vc-border-double{border-style:double}.md\\:vc-border-none{border-style:none}.md\\:vc-border-0{border-width:0}.md\\:vc-border-2{border-width:2px}.md\\:vc-border-4{border-width:4px}.md\\:vc-border-8{border-width:8px}.md\\:vc-border{border-width:1px}.md\\:vc-border-t-0{border-top-width:0}.md\\:vc-border-r-0{border-right-width:0}.md\\:vc-border-b-0{border-bottom-width:0}.md\\:vc-border-l-0{border-left-width:0}.md\\:vc-border-t-2{border-top-width:2px}.md\\:vc-border-r-2{border-right-width:2px}.md\\:vc-border-b-2{border-bottom-width:2px}.md\\:vc-border-l-2{border-left-width:2px}.md\\:vc-border-t-4{border-top-width:4px}.md\\:vc-border-r-4{border-right-width:4px}.md\\:vc-border-b-4{border-bottom-width:4px}.md\\:vc-border-l-4{border-left-width:4px}.md\\:vc-border-t-8{border-top-width:8px}.md\\:vc-border-r-8{border-right-width:8px}.md\\:vc-border-b-8{border-bottom-width:8px}.md\\:vc-border-l-8{border-left-width:8px}.md\\:vc-border-t{border-top-width:1px}.md\\:vc-border-r{border-right-width:1px}.md\\:vc-border-b{border-bottom-width:1px}.md\\:vc-border-l{border-left-width:1px}.md\\:vc-text-left{text-align:left}.md\\:vc-text-center{text-align:center}.md\\:vc-text-right{text-align:right}.md\\:vc-text-justify{text-align:justify}.md\\:vc-text-xs{font-size:12px}.md\\:vc-text-sm{font-size:14px}.md\\:vc-text-base{font-size:16px}.md\\:vc-text-lg{font-size:18px}.md\\:vc-text-xl{font-size:20px}.md\\:vc-text-2xl{font-size:24px}}@media (min-width:1024px){.lg\\:vc-bg-fixed{background-attachment:fixed}.lg\\:vc-bg-local{background-attachment:local}.lg\\:vc-bg-scroll{background-attachment:scroll}.lg\\:vc-bg-bottom{background-position:bottom}.lg\\:vc-bg-center{background-position:50%}.lg\\:vc-bg-left{background-position:0}.lg\\:vc-bg-left-bottom{background-position:0 100%}.lg\\:vc-bg-left-top{background-position:0 0}.lg\\:vc-bg-right{background-position:100%}.lg\\:vc-bg-right-bottom{background-position:100% 100%}.lg\\:vc-bg-right-top{background-position:100% 0}.lg\\:vc-bg-top{background-position:top}.lg\\:vc-bg-repeat{background-repeat:repeat}.lg\\:vc-bg-no-repeat{background-repeat:no-repeat}.lg\\:vc-bg-repeat-x{background-repeat:repeat-x}.lg\\:vc-bg-repeat-y{background-repeat:repeat-y}.lg\\:vc-bg-repeat-round{background-repeat:round}.lg\\:vc-bg-repeat-space{background-repeat:space}.lg\\:vc-bg-auto{background-size:auto}.lg\\:vc-bg-cover{background-size:cover}.lg\\:vc-bg-contain{background-size:contain}.lg\\:vc-border-collapse{border-collapse:collapse}.lg\\:vc-border-separate{border-collapse:initial}.lg\\:vc-border-solid{border-style:solid}.lg\\:vc-border-dashed{border-style:dashed}.lg\\:vc-border-dotted{border-style:dotted}.lg\\:vc-border-double{border-style:double}.lg\\:vc-border-none{border-style:none}.lg\\:vc-border-0{border-width:0}.lg\\:vc-border-2{border-width:2px}.lg\\:vc-border-4{border-width:4px}.lg\\:vc-border-8{border-width:8px}.lg\\:vc-border{border-width:1px}.lg\\:vc-border-t-0{border-top-width:0}.lg\\:vc-border-r-0{border-right-width:0}.lg\\:vc-border-b-0{border-bottom-width:0}.lg\\:vc-border-l-0{border-left-width:0}.lg\\:vc-border-t-2{border-top-width:2px}.lg\\:vc-border-r-2{border-right-width:2px}.lg\\:vc-border-b-2{border-bottom-width:2px}.lg\\:vc-border-l-2{border-left-width:2px}.lg\\:vc-border-t-4{border-top-width:4px}.lg\\:vc-border-r-4{border-right-width:4px}.lg\\:vc-border-b-4{border-bottom-width:4px}.lg\\:vc-border-l-4{border-left-width:4px}.lg\\:vc-border-t-8{border-top-width:8px}.lg\\:vc-border-r-8{border-right-width:8px}.lg\\:vc-border-b-8{border-bottom-width:8px}.lg\\:vc-border-l-8{border-left-width:8px}.lg\\:vc-border-t{border-top-width:1px}.lg\\:vc-border-r{border-right-width:1px}.lg\\:vc-border-b{border-bottom-width:1px}.lg\\:vc-border-l{border-left-width:1px}.lg\\:vc-text-left{text-align:left}.lg\\:vc-text-center{text-align:center}.lg\\:vc-text-right{text-align:right}.lg\\:vc-text-justify{text-align:justify}.lg\\:vc-text-xs{font-size:12px}.lg\\:vc-text-sm{font-size:14px}.lg\\:vc-text-base{font-size:16px}.lg\\:vc-text-lg{font-size:18px}.lg\\:vc-text-xl{font-size:20px}.lg\\:vc-text-2xl{font-size:24px}}@media (min-width:1280px){.xl\\:vc-bg-fixed{background-attachment:fixed}.xl\\:vc-bg-local{background-attachment:local}.xl\\:vc-bg-scroll{background-attachment:scroll}.xl\\:vc-bg-bottom{background-position:bottom}.xl\\:vc-bg-center{background-position:50%}.xl\\:vc-bg-left{background-position:0}.xl\\:vc-bg-left-bottom{background-position:0 100%}.xl\\:vc-bg-left-top{background-position:0 0}.xl\\:vc-bg-right{background-position:100%}.xl\\:vc-bg-right-bottom{background-position:100% 100%}.xl\\:vc-bg-right-top{background-position:100% 0}.xl\\:vc-bg-top{background-position:top}.xl\\:vc-bg-repeat{background-repeat:repeat}.xl\\:vc-bg-no-repeat{background-repeat:no-repeat}.xl\\:vc-bg-repeat-x{background-repeat:repeat-x}.xl\\:vc-bg-repeat-y{background-repeat:repeat-y}.xl\\:vc-bg-repeat-round{background-repeat:round}.xl\\:vc-bg-repeat-space{background-repeat:space}.xl\\:vc-bg-auto{background-size:auto}.xl\\:vc-bg-cover{background-size:cover}.xl\\:vc-bg-contain{background-size:contain}.xl\\:vc-border-collapse{border-collapse:collapse}.xl\\:vc-border-separate{border-collapse:initial}.xl\\:vc-border-solid{border-style:solid}.xl\\:vc-border-dashed{border-style:dashed}.xl\\:vc-border-dotted{border-style:dotted}.xl\\:vc-border-double{border-style:double}.xl\\:vc-border-none{border-style:none}.xl\\:vc-border-0{border-width:0}.xl\\:vc-border-2{border-width:2px}.xl\\:vc-border-4{border-width:4px}.xl\\:vc-border-8{border-width:8px}.xl\\:vc-border{border-width:1px}.xl\\:vc-border-t-0{border-top-width:0}.xl\\:vc-border-r-0{border-right-width:0}.xl\\:vc-border-b-0{border-bottom-width:0}.xl\\:vc-border-l-0{border-left-width:0}.xl\\:vc-border-t-2{border-top-width:2px}.xl\\:vc-border-r-2{border-right-width:2px}.xl\\:vc-border-b-2{border-bottom-width:2px}.xl\\:vc-border-l-2{border-left-width:2px}.xl\\:vc-border-t-4{border-top-width:4px}.xl\\:vc-border-r-4{border-right-width:4px}.xl\\:vc-border-b-4{border-bottom-width:4px}.xl\\:vc-border-l-4{border-left-width:4px}.xl\\:vc-border-t-8{border-top-width:8px}.xl\\:vc-border-r-8{border-right-width:8px}.xl\\:vc-border-b-8{border-bottom-width:8px}.xl\\:vc-border-l-8{border-left-width:8px}.xl\\:vc-border-t{border-top-width:1px}.xl\\:vc-border-r{border-right-width:1px}.xl\\:vc-border-b{border-bottom-width:1px}.xl\\:vc-border-l{border-left-width:1px}.xl\\:vc-text-left{text-align:left}.xl\\:vc-text-center{text-align:center}.xl\\:vc-text-right{text-align:right}.xl\\:vc-text-justify{text-align:justify}.xl\\:vc-text-xs{font-size:12px}.xl\\:vc-text-sm{font-size:14px}.xl\\:vc-text-base{font-size:16px}.xl\\:vc-text-lg{font-size:18px}.xl\\:vc-text-xl{font-size:20px}.xl\\:vc-text-2xl{font-size:24px}}", ""]);

// exports


/***/ }),

/***/ "f4d6":
/***/ (function(module, exports, __webpack_require__) {

var isSymbol = __webpack_require__("ffd6");

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;


/***/ }),

/***/ "f4d9":
/***/ (function(module, exports) {

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsDingbatRange = '\\u2700-\\u27bf',
    rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
    rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
    rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
    rsPunctuationRange = '\\u2000-\\u206f',
    rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
    rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
    rsVarRange = '\\ufe0e\\ufe0f',
    rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

/** Used to compose unicode capture groups. */
var rsApos = "['\u2019]",
    rsBreak = '[' + rsBreakRange + ']',
    rsCombo = '[' + rsComboRange + ']',
    rsDigits = '\\d+',
    rsDingbat = '[' + rsDingbatRange + ']',
    rsLower = '[' + rsLowerRange + ']',
    rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsUpper = '[' + rsUpperRange + ']',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
    rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
    rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
    rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
    reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
    rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq;

/** Used to match complex or compound words. */
var reUnicodeWord = RegExp([
  rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
  rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
  rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
  rsUpper + '+' + rsOptContrUpper,
  rsOrdUpper,
  rsOrdLower,
  rsDigits,
  rsEmoji
].join('|'), 'g');

/**
 * Splits a Unicode `string` into an array of its words.
 *
 * @private
 * @param {string} The string to inspect.
 * @returns {Array} Returns the words of `string`.
 */
function unicodeWords(string) {
  return string.match(reUnicodeWord) || [];
}

module.exports = unicodeWords;


/***/ }),

/***/ "f542":
/***/ (function(module, exports, __webpack_require__) {

var createToPairs = __webpack_require__("ec47"),
    keys = __webpack_require__("ec69");

/**
 * Creates an array of own enumerable string keyed-value pairs for `object`
 * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
 * entries are returned.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias entries
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the key-value pairs.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.toPairs(new Foo);
 * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
 */
var toPairs = createToPairs(keys);

module.exports = toPairs;


/***/ }),

/***/ "f608":
/***/ (function(module, exports, __webpack_require__) {

var isArray = __webpack_require__("6747"),
    isSymbol = __webpack_require__("ffd6");

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;


/***/ }),

/***/ "f678":
/***/ (function(module, exports, __webpack_require__) {

var baseClamp = __webpack_require__("8384"),
    toNumber = __webpack_require__("b4b0");

/**
 * Clamps `number` within the inclusive `lower` and `upper` bounds.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Number
 * @param {number} number The number to clamp.
 * @param {number} [lower] The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 * @example
 *
 * _.clamp(-10, -5, 5);
 * // => -5
 *
 * _.clamp(10, -5, 5);
 * // => 5
 */
function clamp(number, lower, upper) {
  if (upper === undefined) {
    upper = lower;
    lower = undefined;
  }
  if (upper !== undefined) {
    upper = toNumber(upper);
    upper = upper === upper ? upper : 0;
  }
  if (lower !== undefined) {
    lower = toNumber(lower);
    lower = lower === lower ? lower : 0;
  }
  return baseClamp(toNumber(number), lower, upper);
}

module.exports = clamp;


/***/ }),

/***/ "f772":
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "f7f1":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return addDays; });
/* harmony import */ var _lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("fe1f");
/* harmony import */ var _toDate_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("fd3a");
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("8c86");



/**
 * @name addDays
 * @category Day Helpers
 * @summary Add the specified number of days to the given date.
 *
 * @description
 * Add the specified number of days to the given date.
 *
 * ### v2.0.0 breaking changes:
 *
 * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
 *
 * @param {Date|Number} date - the date to be changed
 * @param {Number} amount - the amount of days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 * @returns {Date} the new date with the days added
 * @throws {TypeError} 2 arguments required
 *
 * @example
 * // Add 10 days to 1 September 2014:
 * var result = addDays(new Date(2014, 8, 1), 10)
 * //=> Thu Sep 11 2014 00:00:00
 */

function addDays(dirtyDate, dirtyAmount) {
  Object(_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(2, arguments);
  var date = Object(_toDate_index_js__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(dirtyDate);
  var amount = Object(_lib_toInteger_index_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(dirtyAmount);

  if (isNaN(amount)) {
    return new Date(NaN);
  }

  if (!amount) {
    // If 0 days, no-op to avoid changing times in the hour before end of DST
    return date;
  }

  date.setDate(date.getDate() + amount);
  return date;
}

/***/ }),

/***/ "f8af":
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__("2474");

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),

/***/ "f909":
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__("7e64"),
    assignMergeValue = __webpack_require__("b760"),
    baseFor = __webpack_require__("72af"),
    baseMergeDeep = __webpack_require__("4f50"),
    isObject = __webpack_require__("1a8c"),
    keysIn = __webpack_require__("9934"),
    safeGet = __webpack_require__("8adb");

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;


/***/ }),

/***/ "f9ce":
/***/ (function(module, exports, __webpack_require__) {

var baseProperty = __webpack_require__("ef5d"),
    basePropertyDeep = __webpack_require__("e3f8"),
    isKey = __webpack_require__("f608"),
    toKey = __webpack_require__("f4d6");

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;


/***/ }),

/***/ "fa21":
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__("7530"),
    getPrototype = __webpack_require__("2dcb"),
    isPrototype = __webpack_require__("eac5");

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),

/***/ "fa5b":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("5537")('native-function-to-string', Function.toString);


/***/ }),

/***/ "fab2":
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__("7726").document;
module.exports = document && document.documentElement;


/***/ }),

/***/ "fb15":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Calendar", function() { return /* reexport */ lib["c" /* Calendar */]; });
__webpack_require__.d(__webpack_exports__, "CalendarNav", function() { return /* reexport */ lib["d" /* CalendarNav */]; });
__webpack_require__.d(__webpack_exports__, "DatePicker", function() { return /* reexport */ lib["f" /* DatePicker */]; });
__webpack_require__.d(__webpack_exports__, "Popover", function() { return /* reexport */ lib["i" /* Popover */]; });
__webpack_require__.d(__webpack_exports__, "PopoverRef", function() { return /* reexport */ lib["j" /* PopoverRef */]; });
__webpack_require__.d(__webpack_exports__, "Grid", function() { return /* reexport */ lib["g" /* Grid */]; });
__webpack_require__.d(__webpack_exports__, "Locale", function() { return /* reexport */ lib["h" /* Locale */]; });
__webpack_require__.d(__webpack_exports__, "DateInfo", function() { return /* reexport */ lib["e" /* DateInfo */]; });
__webpack_require__.d(__webpack_exports__, "Attribute", function() { return /* reexport */ lib["a" /* Attribute */]; });
__webpack_require__.d(__webpack_exports__, "AttributeStore", function() { return /* reexport */ lib["b" /* AttributeStore */]; });
__webpack_require__.d(__webpack_exports__, "setupCalendar", function() { return /* reexport */ lib["L" /* setupCalendar */]; });
__webpack_require__.d(__webpack_exports__, "evalFn", function() { return /* reexport */ lib["u" /* evalFn */]; });
__webpack_require__.d(__webpack_exports__, "pageIsValid", function() { return /* reexport */ lib["K" /* pageIsValid */]; });
__webpack_require__.d(__webpack_exports__, "pageIsBeforePage", function() { return /* reexport */ lib["H" /* pageIsBeforePage */]; });
__webpack_require__.d(__webpack_exports__, "pageIsAfterPage", function() { return /* reexport */ lib["G" /* pageIsAfterPage */]; });
__webpack_require__.d(__webpack_exports__, "pageIsBetweenPages", function() { return /* reexport */ lib["I" /* pageIsBetweenPages */]; });
__webpack_require__.d(__webpack_exports__, "pageIsEqualToPage", function() { return /* reexport */ lib["J" /* pageIsEqualToPage */]; });
__webpack_require__.d(__webpack_exports__, "pageForDate", function() { return /* reexport */ lib["C" /* pageForDate */]; });
__webpack_require__.d(__webpack_exports__, "addPages", function() { return /* reexport */ lib["l" /* addPages */]; });
__webpack_require__.d(__webpack_exports__, "pageForThisMonth", function() { return /* reexport */ lib["F" /* pageForThisMonth */]; });
__webpack_require__.d(__webpack_exports__, "pageForNextMonth", function() { return /* reexport */ lib["D" /* pageForNextMonth */]; });
__webpack_require__.d(__webpack_exports__, "pageForPrevMonth", function() { return /* reexport */ lib["E" /* pageForPrevMonth */]; });
__webpack_require__.d(__webpack_exports__, "getMaxPage", function() { return /* reexport */ lib["w" /* getMaxPage */]; });
__webpack_require__.d(__webpack_exports__, "datesAreEqual", function() { return /* reexport */ lib["p" /* datesAreEqual */]; });
__webpack_require__.d(__webpack_exports__, "arrayHasItems", function() { return /* reexport */ lib["n" /* arrayHasItems */]; });
__webpack_require__.d(__webpack_exports__, "findAncestor", function() { return /* reexport */ lib["v" /* findAncestor */]; });
__webpack_require__.d(__webpack_exports__, "elementHasAncestor", function() { return /* reexport */ lib["s" /* elementHasAncestor */]; });
__webpack_require__.d(__webpack_exports__, "elementPositionInAncestor", function() { return /* reexport */ lib["t" /* elementPositionInAncestor */]; });
__webpack_require__.d(__webpack_exports__, "mixinOptionalProps", function() { return /* reexport */ lib["y" /* mixinOptionalProps */]; });
__webpack_require__.d(__webpack_exports__, "on", function() { return /* reexport */ lib["A" /* on */]; });
__webpack_require__.d(__webpack_exports__, "off", function() { return /* reexport */ lib["z" /* off */]; });
__webpack_require__.d(__webpack_exports__, "elementContains", function() { return /* reexport */ lib["r" /* elementContains */]; });
__webpack_require__.d(__webpack_exports__, "onSpaceOrEnter", function() { return /* reexport */ lib["B" /* onSpaceOrEnter */]; });
__webpack_require__.d(__webpack_exports__, "createGuid", function() { return /* reexport */ lib["o" /* createGuid */]; });
__webpack_require__.d(__webpack_exports__, "hash", function() { return /* reexport */ lib["x" /* hash */]; });
__webpack_require__.d(__webpack_exports__, "addTapOrClickHandler", function() { return /* reexport */ lib["m" /* addTapOrClickHandler */]; });
__webpack_require__.d(__webpack_exports__, "addHorizontalSwipeHandler", function() { return /* reexport */ lib["k" /* addHorizontalSwipeHandler */]; });

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  if (false) {}

  var i
  if ((i = window.document.currentScript) && (i = i.src.match(/(.+\/)[^/]+\.js(\?.*)?$/))) {
    __webpack_require__.p = i[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// EXTERNAL MODULE: ./src/lib.js
var lib = __webpack_require__("34e9");

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = __webpack_exports__["default"] = (lib["q" /* default */]);



/***/ }),

/***/ "fba5":
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__("cb5a");

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),

/***/ "fd3a":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return toDate; });
/* harmony import */ var _lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("8c86");

/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @param {Date|Number} argument - the value to convert
 * @returns {Date} the parsed date in the local time zone
 * @throws {TypeError} 1 argument required
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */

function toDate(argument) {
  Object(_lib_requiredArgs_index_js__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(1, arguments);
  var argStr = Object.prototype.toString.call(argument); // Clone the date

  if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else {
    if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

      console.warn(new Error().stack);
    }

    return new Date(NaN);
  }
}

/***/ }),

/***/ "fe1f":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return toInteger; });
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }

  var number = Number(dirtyNumber);

  if (isNaN(number)) {
    return number;
  }

  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

/***/ }),

/***/ "ffd6":
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__("3729"),
    isObjectLike = __webpack_require__("1310");

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ })

/******/ });
});
//# sourceMappingURL=v-calendar.umd.js.map