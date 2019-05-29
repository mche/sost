(function () {'use strict';
/*
  Компонент Vue
  Запись таблицы "спецодежда"
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $СпецодеждаФорма({<данные в компонент>}, $c, $scope),
      ...
    }
  })
  
*/
var moduleName = "Спецодежда::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

const Factory = function($templateCache, $timeout, $http, $rootScope, /**$compile,*/ appRoutes, Util) {// factory

const props = ['item', 'profiles'];
let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;
  vm.ready = true;
  $timeout(function(){
    
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {var s = this.component.item.select; vm.$set(vm.data, 'дата1', [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      });//{closeOnSelect: true,}
  });
};

meth.InitItem = function(item){/// обязательные реактивные поля
  item["дата1"] = item["дата1"] || (new Date).toISOString().replace(/T.+/, '');
  //~ item["наименование"] = item["наименование"] || '';
  //~ item['количество'] = item['количество'] || '';
  //~ item['срок'] = item['срок'] || '';
  return item;
};

meth.CancelBtn = function(){/// метод
  let vm = this;
  vm.closeForm = true;
};

const reNumber = /[^\d,.]/;
meth.NumberInput = function(name){
  let val = this.data[name]+'';
  let r = val.replace(reNumber, '');
  if (r == val) return;
  this.data[name] = r;
};

meth.Validate = function(){
  //~ console.log("Validate", JSON.stringify(this.data));
  let vm = this;
  return !['наименование', 'количество', 'срок'].some(function(name){ return !vm.data[name]; }) ;
};

meth.Save = function(){/// Сохранить
  let vm = this;
  vm.data['профили'] = vm.profiles.map(function(profile){ return profile.id; });
  //~ console.log("Save", JSON.stringify(this.data));
  return $http.post(appRoutes.UrlFor('спецодежда/сохранить'), vm.data)
    .then(function(resp){
      console.log("Save", resp.data);
      $rootScope.$broadcast("Сохранена спецодежда", resp.data);
      
    }, function(){
      Materialize.toast("Ошибка сохранения", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      console.error("Save", arguments);
    });
  
};

return /*конструктор*/function (data, $c, $scope){
  let $this = this;
  data = data || {};

  return {
    "template": $templateCache.get('спецодежда/форма'),
    "props": props,
    "data"() {
      let vm = this;
      vm.$scope = $scope;
      data.data = vm.InitItem(vm.item || {});
      return angular.extend(// return dst
        data,// dst
        {/// src
          "ready": false,
          "cancelerHttp": undefined,
          "closeForm": false,
        }
      );
    },
    "methods": meth,
    /*"computed": {},*/
    "created"() {
      //~ console.log('created', this);
      //~ data.ready = false;
      //~ data.closeForm = false;
    },
    "mounted"() {
      //~ console.log('mounted', this);
      this.Ready();
    },
    //~ "mixins": [Vue2Filters.mixin],
  };
};

};// end Factory
/**********************************************************************/
module
.factory('$СпецодеждаФорма', Factory);

}());
