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
    vm.param = {
        "дата": (urlParam.d && urlParam.d[0]) || d.toISOString().replace(/T.+/, ''),
      };
    return {
      "reloadShip": false,
    };
  };
  
  const mounted = function(){
    var vm = this;
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
      //~ formatSkipYear: true,// доп костыль - дописывать год при установке
      onClose: function (context) {
        var s = this.component.item.select;
        //~ vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-')); console.log("pickadate", this); 
        vm.SetDateReload([s.year, s.month+1, s.date].join('-'));
      },
    });
    
  };
  
  const methods = {
    SetDateReload(date){
      var vm = this;
      if ( date == vm.param['дата']) return;
      vm.param['дата'] = undefined;
      if (date && typeof date  == "string") location.href = location.pathname+'?d='+date;
      else location.reload();
    },
    
    ReloadShip(data){///обновление отгрузок
      var vm = this;
      /* это работает if (vm.param['дата'] != data['дата']) return vm.SetDateReload(data['дата']);*/
      //~ var d = vm.param['дата'];
      //~ vm.param['дата'] = undefined;
      vm.reloadShip = true;
      setTimeout(function(){
        //~ vm.param['дата'] = d;
        vm.reloadShip = false;
      });
    },
    
    AddDays(n){
      this.SetDateReload(dateFns.format(dateFns.addDays(new Date(this.param['дата']), n), 'YYYY-MM-DD'));
      
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