/***
Вставлять модули глобально всегда (НО только однократно!)
Не надо их явно прописывать в других модулях
angular.GlobalModules('Foo', 'Bar');
angular.GlobalModules('Yada');
angular.GlobalModules();/// 'Yada', 'Foo', 'Bar'

SEE ALSO
взял тут http://embed.plnkr.co/Gv4YOk5p3wtXqdz5vdnr/
еще тут https://javascript.ru/forum/angular/43088-dinamicheskaya-zagruzka-modulya-v-angular.html
***/
(function(angular) {///

  var _module = angular.module,/* _bootstrap = angular.bootstrap, _requests = 0, _inited = false;*/
  /*var _loadMap = {},_invokeQueue = {}, _funcCache = {},*/
    globalModules = [], activated = [];
  //~ var bootstrapTime = function(args) {
    //~ if (_inited && _requests === 0)  return _bootstrap.apply(angular, args);
  //~ };
  var globalModulesFilter = function(mod){/// фильтровать в заданном списке(this), чтоб не повторять
    return this.indexOf(mod) == -1;
  };
  var globalModulesActivated = function(mod){/// фильтровать неактивированных (однократно активировать модуль)
    if (activated.some(function(act){ return act == mod; })) return false;///уже активирован
    activated.push(mod);///больше не подствалять
    return true;
    
  }

  angular.extend(angular, {
    module: function(name, requires, configFn) {
      
      if (!requires) return _module.call(angular, name, requires, configFn);
      
      var need = globalModules.filter(globalModulesFilter, requires)
        .filter(globalModulesFilter, [name])///исключить сам глобальный модуль
        .filter(globalModulesActivated)
      ;
      console.log('angular.module("'+name+'", ['+(requires||'не задано')+']) + глобальники: ', need);
      //~ var autoLoad = [];
      //~ if (!need.length) return _module.call(angular, name, requires, configFn);
      Array.prototype.unshift.apply(requires, need);
      
      return _module.call(angular, name, requires, configFn);

      /*var module = _module.call(angular, name, [], configFn);

      angular.forEach(module, function(val, key) {
        if (!angular.isFunction(val)) return;
        
        module[key] = function() {
          _invokeQueue[name].push([key, Array.prototype.slice.call(arguments)]);
          return module;
        };
        _funcCache[key] = val;
      });
      _invokeQueue[name] = [];

      //~ console.log("loading", autoLoad);
      //~ require(autoLoad, function() {
        for (var n in _funcCache) module[n] = _funcCache[n];
        
        module.requires = requires;

        if (angular.isFunction(configFn)) module.config(configFn);

        for (var i = 0; i < _invokeQueue[name].length; i++) {
          var call = _invokeQueue[name][i];
          module[call[0]].apply(module, call[1]);
        }
        _requests--;

        bootstrapTime();
      //~ });
      _requests++;
      _inited = true;

      return module;*/
    },

    //~ bootstrap: function() {
      //~ var args = Array.prototype.slice.call(arguments);
      //~ bootstrapTime(args);
    //~ },
    
    GlobalModules: function(arr){
      if (!angular.isArray(arr)) arr = Array.prototype.slice.call(arguments);
      Array.prototype.push.apply(globalModules, arr.filter(globalModulesFilter, globalModules));
      return globalModules;
    }
  });

})(angular);///конец global-modules