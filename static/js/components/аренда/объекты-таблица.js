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
var module = angular.module(moduleName, [ 'Аренда::Объект::Форма' ]);


const Factory = function($templateCache, $http, appRoutes,  /*$timeout, $rootScope, /**$compile, , Util*/$КомпонентАрендаОбъектФорма ) {// factory
  
let meth = {/*методы*/};
let comp = {/* computed */};

meth.Ready = function(){/// метод
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
  });
};
meth.LoadData = function(){
  var vm = this;
  return $http.get(appRoutes.urlFor('аренда/объекты/список'))
    .then(function(resp){
      vm.data = resp.data;
    });
};
meth.SelectObject = function(obj){
  this.selectedObject = obj;
  this.$emit('select-object', obj);
};
meth.New = function(){
  this.newObject = {};
};

comp.FilteredData = function(){
  return this.data;
  
};

const IsEqualId = function(id){ return (id.id || id) == this.id; };

meth.OnSave = function(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newObject) vm.newObject = undefined;
  if (data) {
    var f = vm.data.find(IsEqualId, data);
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.data.push(data);
    }
  }
};

meth.Edit = function(ob){
  this.$set(ob, '_edit', angular.copy(ob));
  
};

var $Компонент = {
  //~ "props": [''],
  "data"() {
    //~ console.log("on data item", this.item);
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "data": undefined,
      "newObject": undefined,
      "selectedObject": undefined,
      };
    //);
  },
  "methods": meth,
  "computed":comp,
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