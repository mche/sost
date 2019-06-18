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
        onSet: function (context) {var s = this.component.item.select; vm.$set(vm.edit, 'дата1', [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      });//{closeOnSelect: true,}
    
      $('.modal', $(vm.$el)).modal();
  });
};

meth.InitItem = function(item){/// обязательные реактивные поля
  item["дата1"] = item["дата1"] || (new Date).toISOString().replace(/T.+/, '');
  return item;
};

meth.CancelBtn = function(){/// метод
  let vm = this;
  //~ vm.closeForm = true;
  vm.$emit('close-form', vm.item);
};

const reNumber = /[^\d,.]/;
meth.NumberInput = function(name){
  let val = this.edit[name]+'';
  let r = val.replace(reNumber, '');
  if (r == val) return;
  this.edit[name] = r;
};

meth.Validate = function(){
  //~ console.log("Validate", JSON.stringify(this.edit));
  let vm = this;
  return !['наименование', 'количество', 'срок'].some(function(name){ return !vm.edit[name]; }) ;
};

meth.Save = function(){/// Сохранить
  let vm = this;
  vm.edit['профили'] = vm.profiles.map(function(profile){ return profile.id; });
  //~ console.log("Save", JSON.stringify(this.edit));
  vm.httpSave = true;
  return $http.post(appRoutes.UrlFor('спецодежда/сохранить'), vm.edit)
    .then(function(resp){
      vm.httpSave = false;
      //~ console.log("Save", resp.data);
      if (resp.data.error) return Materialize.toast("Ошибка сохранения: "+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      if (resp.data.save) {
        vm.item.save = resp.data.save;
        vm.$emit('close-form', vm.item);
        Materialize.toast("Сохранено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
      }
      //~ $rootScope.$broadcast("Сохранена спецодежда", resp.data);
      
    }, function(){
      vm.httpSave = false;
      Materialize.toast("Ошибка сохранения", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      //~ console.error("Save", arguments);
    });
  
};

meth.Delete = function(){
  let vm = this;
  vm.httpRemove = true;
  return $http.post(appRoutes.UrlFor('удалить спецодежду'), {"id": vm.edit.id})
    .then(function(resp){
      vm.httpRemove = false;
      //~ console.log("Delete", resp.data);
      if (resp.data.error) return Materialize.toast("Ошибка удаления: "+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      if (resp.data.remove) {
        vm.item.remove = resp.data.remove;
        vm.$emit('close-form', vm.item);
        Materialize.toast("Удалено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
      }
    }, function(){
      vm.httpRemove = false;
      Materialize.toast("Ошибка удаления", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp fast');
      //~ console.error("Save", arguments);
    });
}

return /*конструктор*/function (data, $c, $scope){
  let $this = this;
  data = data || {};

  return {
    "template": $templateCache.get('спецодежда/форма'),
    "props": props,
    "data"() {
      let vm = this;
      vm.$scope = $scope;
      data.edit = vm.InitItem(vm.item.edit || {});
      return angular.extend(// return dst
        data,// dst
        {/// src
          "ready": false,
          "httpSave": undefined,
          "httpRemove": undefined,
          //~ "closeForm": false,
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
