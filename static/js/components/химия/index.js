(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Химия";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'appRoutes', 'Компонент::Химия::Продукция::Таблица', 'Компонент::Химия::Сырье::Таблица', 'Компонент::Химия::Отгрузка::Таблица', 'EventBus', 'Util',/**/ ]);

module.controller('Controll', function  (/*$scope, $q,$timeout, */ $element, appRoutes,  /*$http ,*/ TemplateCache, $КомпонентХимияПродукцияТаблица, $КомпонентХимияСырьеТаблица, $КомпонентХимияОтгрузкаТаблица, $EventBus, Util /**/) {
  var ctrl = this;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'химия.html'), 1);
  
  ctrl.$onInit = function(){
    tCache.then(function(){
      ctrl.ready = true;
      ctrl.Vue();
    });
    
  };
  
  var urlParam = Util.paramFromLocation();
  
  const data = function(){
    var vm = this;
    var d = new Date;
    return {
      "param": {
        "дата": urlParam.d || d.toISOString().replace(/T.+/, ''),
      },
    };
  };
  
  const mounted = function(){
    var vm = this;
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
      //~ formatSkipYear: true,// доп костыль - дописывать год при установке
      onClose: function (context) {
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
      location.href = location.pathname+'?d='+date;
      //~ setTimeout(function(){
        //~ vm.param['дата'] = date;
      //~ });

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
        'v-prod-table': new $КомпонентХимияПродукцияТаблица(),
        'v-ship-table': new $КомпонентХимияОтгрузкаТаблица(),
      },
    });
    
  };
  
});
}());