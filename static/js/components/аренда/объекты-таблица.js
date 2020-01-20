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


module.factory('$КомпонентАрендаОбъектыТаблица',
function($templateCache, $http, appRoutes, Util,  /*$timeout, $rootScope, /**$compile, */$КомпонентАрендаОбъектФорма, $EventBus ) {// factory

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  
};
  
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
    $EventBus.$emit('$КомпонентАрендаОбъектыТаблица - готов');
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
SumSquare(item) {
  var s = 0;
  item['@кабинеты'].map(function(room){ s = s + room['площадь']; });
  return s;
},
ToggleRooms(item) {
  this.$set(item, '_expandRooms', !item._expandRooms);
  console.log('ToggleRooms', item._expandRooms);
},
ParseNum(num){
  return parseFloat(Util.numeric(num));
},

ItemRooms(item){
  var vm = this;
  if (vm.sortItemRooms === undefined) return item['@кабинеты'];///без сортировки
  return item['@кабинеты'].sort((a, b) => {
    let v1 = a['номер-название'].toLowerCase();
    let v2 = b['номер-название'].toLowerCase();
    if (v1 > v2) return vm.sortItemRooms ? 1 : -1;
    if (v1 < v2) return vm.sortItemRooms ? -1 : 1; 
    return 0;
  });
  
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
    "sortItemRooms": undefined,
    };
  //);
};///конец data

const computed = {


/* computed */};


var $Компонент = {
  props,
  data,
  methods,
  computed,
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

}// end Factory
/**********************************************************************/
);

}());