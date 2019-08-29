(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаОбъектыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Объекты::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Аренда::Объект::Форма', 'EventBus' ]);


const Factory = function($templateCache, $http, appRoutes,  /*$timeout, $rootScope, /**$compile, , Util*/$КомпонентАрендаОбъектФорма, $EventBus ) {// factory

const util = {/**разное*/
  IsEqualId(id){ return (id.id || id) == this.id; },
  
};///конец util

const methods = {/*методы*/

Ready(){/// метод
  var vm = this;
  var loader = vm.LoadData();
  $EventBus.$on('Дайте список объектов аренды', function(cb){
    cb(loader);
  });
  loader.then(function(){
    vm.ready = true;
  });
},

LoadData(){
  var vm = this;
  return $http.get(appRoutes.urlFor('аренда/объекты/список'))
    .then(function(resp){
      vm.data.push(...resp.data);
      return vm.data;
    });
},

SelectObject(obj){
  this.selectedObject = obj;
  this.$emit('select-object', obj);
},

New(){
  this.newObject = {};
},

OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newObject) vm.newObject = undefined;
  if (data) {
    var f = vm.data.find(util.IsEqualId, data);
    if (f) { /// редакт или удалил
      if (data['удалить']) return vm.data.removeOf(f);
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.data.push(data);
    }
  }
},

Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},
}; /// конец methods

const  data = function(){
  //~ console.log("on data item", this.item);
  let vm = this;
  
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "data": [],
    "newObject": undefined,
    "selectedObject": undefined,
    };
  //);
};///конец data

//~ let comp = {/* computed */};


var $Компонент = {
  //~ props,
  data,
  methods,
  //~ "computed":comp,
  //~ "created"() {  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/объекты/таблица');
  $Компонент.components = {'v-rent-object-form': new $КомпонентАрендаОбъектФорма(), };

  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаОбъектыТаблица', Factory);

}());