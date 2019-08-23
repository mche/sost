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

const Factory = function($templateCache, $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */Util, $КомпонентАрендаДоговорФорма ) {// 
  
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
  return $http.post(appRoutes.urlFor('аренда/договоры/список'), {})
    .then(function(resp){
      vm.data.push(...resp.data);
      return vm.data;
    });
};
meth.SelectContract = function(obj){
  this.selectedContract  = obj;
  this.$emit('select-object', obj);
};
meth.New = function(){
  this.newContract = {};
};

//~ comp.FilteredData = function(){
  //~ return this.data;
  
//~ };

meth.ParseNum = function(num){
  return parseFloat(Util.numeric(num));
};
meth.RoomSum = function(room){
  return this.ParseNum(room['ставка'])*this.ParseNum(room.$помещение['площадь']);
  
};


const IsEqualId = function(id){ return (id.id || id) == this.id; };

meth.OnSave = function(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    var f = vm.data.find(IsEqualId, data);
    if (data['удалить']) return vm.data.removeOf(f);
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.data.push(data);
    }
  }
};

meth.Edit = function(item){
  this.$set(item, '_edit', angular.copy(item));
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
      "data": [],
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