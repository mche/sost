(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Химия";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'appRoutes', 'Компонент::Химия::Сырье::Таблица'/*'Util', 'EventBus',*/ ]);

module.controller('Controll', function  (/*$scope, $q,$timeout, */ $element, appRoutes,  /*$http ,*/ TemplateCache, $КомпонентХимияСырьеТаблица /*$EventBus*/) {
  var ctrl = this;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'химия.html'), 1);
  
  ctrl.$onInit = function(){
    tCache.then(function(){
      ctrl.ready = true;
      ctrl.Vue();
    });
    
  };
  
  const data = function(){
    var vm = this;
    var d = new Date;
    return {
      "param": {
        "дата": d.toISOString().replace(/T.+/, ''),
      },
    };
  };
  
  const mounted = function(){
    var vm = this;
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
      //~ formatSkipYear: true,// доп костыль - дописывать год при установке
      onSet: function (context) {
        var s = this.component.item.select;
        //~ vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-')); console.log("pickadate", this); 
        vm.SetDate([s.year, s.month+1, s.date].join('-'));
      },
    });
    
  };
  
  const methods = {
    SetDate(date){
      var vm = this;
      vm.param['дата'] = undefined;
      setTimeout(function(){
        vm.param['дата'] = date;
      });

    },
    
  };
  
  ctrl.Vue = function(){
    var el = $element[0];
    ctrl.vue = new Vue({
      el,
      data,
      methods,
      mounted,
      "components": {
        'v-stock-table': new $КомпонентХимияСырьеТаблица(),
      },
    });
    
  };
  
});
}());