(function () {
'use strict';
/*
*/
  
var moduleName = "User";

try {
  if (angular.module(moduleName)) return function () {};
} catch(err) { /* failed to require */ }

var _profile = {};

function profile(key, val){
  if ( key === undefined ) return _profile;
  if ( angular.isObject(key) ) {_profile = key; return;}
  if ( val === undefined ) return _profile[key];
  _profile[key] = val;
  if (key == 'id') _profile.uid = val;
  if (key == 'uid') _profile.id = val;
}

var _count = {};

function count(key, val) {
  if ( key === undefined ) return _count;
  if ( angular.isObject(key) ) {_count = key; return;}
  if ( val === undefined ) return _count[key];
  _count[key] = val;
  
}

function id(val) {
  if (val) return profile('id', val);
  var id = profile('id');
  if (id === undefined) id = profile('uid');
  if (id !== undefined) return id;
  var body = $('body');
  profile('id', parseInt(body.attr('data-profile-id') || body.attr('data-auth-id') || body.attr('data-user-id')) || 0);
  return profile('id');
}

var factory = {
  id: id,
  uid: id,
  profile: profile,
  count: count
};

angular.module(moduleName, [])

.run(function ($window) {
  $window['angular.'+moduleName] = factory;
})

.factory(moduleName, function () {
  //~ console.log("factory "+moduleName+" inited!");
  return factory;
})

;

}());