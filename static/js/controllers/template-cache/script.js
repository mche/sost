(function () {
'use strict';

var moduleName = 'load.templateCache';
var moduleAlias = 'loadTemplateCache';

/*
  Place templates to angular $templateCache
  Synopsis:
  
  var promises_arr = loadTemplateCache.put({'foo':'/an/foo/url.ext', ...});
  $q.all(promises_arr);
  
  var all_in_one_promise = loadTemplateCache.put({'foo':'/an/foo/url.ext', ...}, true);
  all_in_one_promise.then(function (proms) {...});
  
  var promises_arr = loadTemplateCache.split(['/an/foo/url.ext', ...]); // array of urls
  promises_arr.push(loadTemplateCache.split('/an/bar/url.ext')); // single scalar url
  $q.all(promises_arr);
  
  var all_in_one_promise = loadTemplateCache.split(['/an/foo/url.ext', ...], true);
  all_in_one_promise.then(function (proms) {...});
  */

try {
  if (angular.module(moduleName)) return  function () {};
  if (angular.module(moduleAlias)) return  function () {};
} catch(err) { /* failed to require */ }

var re = {
  mojo: /^@{2,}\s*(.+)/gm //([^\n]+)
};

var service = function ($http, $templateCache, $q) {
  var self = this;
  var config = {"debug": false};
  
  var split_resp = function (resp) {
    var splt = resp.data.split(re.mojo);
    while (splt.length > 0) {
      var id = splt.shift();
      if (id === "") continue;
      var tpl = splt.shift();
      if (config.debug) console.log("put template to cache: "+id+"\n"+tpl);
      $templateCache.put(id, tpl);
    }
  };
  
  this.config = function (key, val) {
    if (! key) return config;
    if (val === undefined) return config[key];
    config[key]=val;
  };
  
  this.put = function (conf, q_all) {// q_all - returns $q.all(...) and array of promises overvise
    var promise = [];
    
    angular.forEach(conf, function(url, key) {
      var get = $http.get(url, {"cache": true}).then(function (resp) { $templateCache.put(key, resp.data);  });
      promise.push(get);
    });
    
    if (q_all) return $q.all(promise);
    
    return promise;
    
  };
  
  this.split = function(arr, q_all) {// массив(или одиночный скаляр) урлов (q_all - returns $q.all(...) and array of promises overvise
    var promise = [];
    if (!angular.isObject(arr)) arr = [arr];
    
    angular.forEach(arr, function(url, idx) {
      var get = $http.get(url, {"cache": true}).then(split_resp);
      promise.push(get);
    });
    
    if (q_all) return $q.all(promise);
    
    return promise;
    
  };
  
};

angular.module(moduleName, [])
.service('loadTemplateCache', service)
;

angular.module(moduleAlias, [])
.service('loadTemplateCache', service)
;

}());