(function () {
'use strict';
/***
  aliases
  */
var moduleNameS = ['load.templateCache', 'loadTemplateCache', 'LoadTemplateCache', 'TemplateCache', 'Кэш шаблонов'];

/*
  Place things into angular $templateCache
  
  SYNOPSIS
  
   angular.module(moduleName, ['TemplateCache', ...])
  .controller(controllerName, function(TemplateCache, ...) {
  
  var promises_arr = TemplateCache.put({'foo':'/an/foo/url.html', ...});
  $q.all(promises_arr).then(...);
  
  var all_in_one_promise = TemplateCache.put({'foo':'/an/foo/url.html', ...}, true);
  all_in_one_promise.then(function (proms) {...});
  
  var promises_arr = TemplateCache.split(['/an/foo/url.html', ...]); // array of urls
  promises_arr.push(TemplateCache.split('/an/bar/url.html')); // single scalar url
  $q.all(promises_arr).then(...);
  
  var all_in_one_promise = TemplateCache.split(['/an/foo/url.html', ...], true);
  all_in_one_promise.then(function (proms) {...});
  */

var moduleName = moduleNameS.filter(function(name){
  try{ if (angular.module(name)) return false; } // имя занято
  catch(err) { /* нет такого модуля */ return true; } // свободно
});

if (!moduleName.length) return;// все имена заняты


/*
https://regex101.com/r/tjOs4b/2
@{2,}\s*([^@<\n]+)(?:@{1,})?
*/
var re = {
  //~ mojo: /^@{2,}\s*(.+)/gm, //([^\n]+)
  mojo: /^@{2,}\s*([^@<\n]+)(?:@{1,})?/gm,//|<split-template-cache\s+([^\>\/]+)\/?>
  word: /\S/,
};

var service = function ($http, $templateCache, $q, $window) {
  var self = this;
  var config = {"debug": false};
  var version = $('head meta[name="app:version"]').attr('content') || $window.localStorage.getItem('app:version '+$window.location.pathname) || false;
  
  var split_resp = function (resp) {
    var splt = resp.data.split(re.mojo);
    //~ if (config.debug) console.log("Split resp", splt);
    while (splt.length > 0) {
      var id = splt.shift().trim();
      if (!id || !re.word.test(id)) continue;
      var tpl = splt.shift();
      if (config.debug) console.log("put template to cache id:", id, " template len:", tpl.length);
      $templateCache.put(id, tpl);
    }
  };
  
  this.config = function (key, val) {
    if (! key) return config;
    if (val === undefined) return config[key];
    config[key]=val;
    return this;
  };
  
  this.put = function (conf, q_all) {// q_all - returns $q.all(...) and array of promises overvise
    var promise = [];
    
    angular.forEach(conf, function(url, key) {
      if(version) {url += /\?/.test(url) ? '&v='+version :  '?v='+version;}
      var get = $http.get(url, {"cache": true}).then(function (resp) { $templateCache.put(key, resp.data);  });
      promise.push(get);
    });
    
    if (q_all) return $q.all(promise);
    
    return promise;
    
  };
  
  this.split = function(arr, q_all) {// массив(или одиночный скаляр) урлов (q_all - returns $q.all(...) and array of promises overvise
    var promise = [];
    if (!angular.isArray(arr)) arr = [arr];
    
    angular.forEach(arr, function(url, idx) {
      if(version) {url += /\?/.test(url) ? '&v='+version :  '?v='+version;}
      var get = $http.get(url, {"cache": true}).then(split_resp);
      promise.push(get);
    });
    
    if (q_all) return $q.all(promise);
    
    return promise;
    
  };
  
};


moduleName.map(function(name){
    var mod = angular.module(name, []);
    mod.run(['$templateCache', name,  function($templateCache, srv) {
      //~ console.log("Модуль кэша шаблонов angular.module('" +name+ "')");
      mod.$templateCache = $templateCache;
      mod[name]=srv;
    }]);
    moduleNameS.map(function(n){ mod.service(n, service); });// все комбинации сервисов
  
});


}());