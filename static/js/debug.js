(function () {
'use strict';
/*
*/
  
var moduleName = "Debug";

try {
  if (angular.module(moduleName)) return function () {};
} catch(err) { /* failed to require */ }

angular.module(moduleName, ['appRoutes'])

//~ .run(function ($window) {
  //~ $window['angular.'+moduleName] = factory;
//~ })

.factory(moduleName, function ($http, $q, appRoutes) {
  //~ console.log("factory "+moduleName+" inited!");
  var queque = [];
  
  var cancelerHttp;

  function send (data) {
    
    if(data) queque.push(data);
    data = queque.shift();
    
    if (!data || cancelerHttp) return;
    
    //~ if (cancelerHttp) cancelerHttp.resolve();
    cancelerHttp = $q.defer();
    $http.post(appRoutes.url_for('отладка приложения'), data, {timeout: cancelerHttp.promise}).then(function(resp){
      cancelerHttp.resolve();
      cancelerHttp = undefined;
      
      if (resp.data.error) console.log("Remote debug error"+resp.data.error);
      //~ if (queque.length === 0) return;
      
      send();
    });
    
  };
  
  var _param = {"enable": false};
  function param(key, val) {
    if (key === undefined) return _param;
    if (val === undefined) return _param[key];
    _param[key] = val;
    
  };
  
  function log () {
    var args = Array.prototype.slice.call(arguments, 0);
    
    if (!param('enable')) return;
    
    //~ if (cancelerHttp) return queque.push(args);
    //~ else send(args);
    send(args);
    
  };

  return {
    log: log,
    param: param,//set/get
  };
})

;

}());