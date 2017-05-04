(function () {
'use strict';
/*
  Хранилище массивов и манипуляции с ними в условиях обмена между сущностями ангуляра
*/
  
var moduleName = "ArrayStorage";

try {
  if (angular.module(moduleName)) return function () {};
} catch(err) { /* failed to require */ }

var data = {};
var get = function (name, idx) {
  if (data[name] == undefined) {
    data[name] = [];
  }
  if (idx == undefined) {
    //~ console.log(data[name]);
    return data[name];
  }
  return data[name][idx];
};
var push = function (name, arr) {
  var a= get(name);
  Array.prototype.push.apply(a, arr);
  return a;
};
var put = function (name, arr) {
  var a= get(name);
  a.splice(0, a.length);
  if(!arr) return push(name, arr);
  return a;
};
var unshift = function (name, arr) {
  var a= get(name);
  Array.prototype.unshift.apply(a, arr);
  return a;
};
var clear = function (name) {
  return put(name);
};


var factory = {
  _data: data,
  push: push,
  get: get,
  put: put,
  unshift: unshift,
  clear: clear
};

//~ console.log(moduleName+" starting...");

angular.module(moduleName, [])

.run(function ($window) {
  //~ console.log(moduleName+" runing...");
  $window['angular.'+moduleName] = factory;
})

.factory(moduleName, function () {
  return factory;
})

;

}());