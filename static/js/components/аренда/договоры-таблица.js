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

module.factory('$КомпонентАрендаДоговорыТаблица', function($templateCache, $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */ $EventBus, Util, $КомпонентАрендаДоговорФорма ) {// 

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  
};
  
const util = {/*разное*/
IsEqualId(id){ return (id.id || id) == this.id; },
};/// конец util

const methods = {/*методы*/

Ready(){/// метод
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
    $EventBus.$emit('$КомпонентАрендаДоговорыТаблица - готов');
  });
},

LoadData(){
  var vm = this;
  return $http.post(appRoutes.urlFor('аренда/договоры/список'), {})
    .then(function(resp){
      vm.data.push(...resp.data);
      return vm.data;
    });
},

SelectContract(obj){
  this.selectedContract  = obj;
  this.$emit('select-object', obj);
},

New(){
  this.newContract = {};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},

RoomMetr(room){
  return this.ParseNum(room['ставка']) || this.ParseNum(room['сумма'])/this.ParseNum(room.$помещение['площадь']);
},

RoomSum(room){
  return this.ParseNum(room['сумма']) || this.ParseNum(room['ставка'])*this.ParseNum(room.$помещение['площадь']);
},

OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    var f = vm.data.find(util.IsEqualId, data);
    if (data['удалить']) return vm.data.removeOf(f);
    if (f) { /// редакт
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
}; ///конец methods

//~ const comp = {/* computed */};

const  data = function(){
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
};///конец data

var $Компонент = {
  props,
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
  $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components = {'v-rent-contract-form': new $КомпонентАрендаДоговорФорма(), };

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());