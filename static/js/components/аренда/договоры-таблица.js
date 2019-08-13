(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Договоры::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Аренда::Договор::Форма' ]);

const Factory = function($templateCache, $http, appRoutes /*$timeout, $rootScope, /**$compile, , Util*/, $КомпонентАрендаДоговорФорма ) {// factory
  
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
  return $http.get(appRoutes.urlFor('аренда/договоры/список'))
    .then(function(resp){
      vm.data = resp.data;
    });
};
meth.SelectContract = function(obj){
  this.selectedContract  = obj;
  this.$emit('select-object', obj);
};
meth.New = function(){
  this.newContract = {};
};

comp.FilteredData = function(){
  return this.data;
  
};

meth.OnSave = function(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
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
      "newContract": undefined,
      "selectedContract": undefined,
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
  $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components = {'v-rent-contract-form': new $КомпонентАрендаДоговорФорма(), };

  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаДоговорыТаблица', Factory);

}());