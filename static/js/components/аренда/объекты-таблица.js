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
    cb(vm.data);
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
      vm.data.push(...resp.data.map((item)=>{ vm.ItemRoomsIndexes(item); return item; }));
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
      if (data['@кабинеты']) vm.ItemRoomsIndexes(data);
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

ItemRoomsIndexes(item){///вместо самого массива помещений используется массив сортировки индексов
  var vm = this;
  item._sortItemRooms = !item._sortItemRooms;
  //~ for (let liter in item['@литеры']) liter['количество помещений'] = 0;
  //~ if ( === undefined) return item.rooms = item['@кабинеты'];///без сортировки
  item.roomsIndexes = Array(item['@кабинеты'].length).fill()
    .map((item, idx) => idx)
    .filter(idx=>vm.FilterRoomsByIdx(item, idx))
  ;
  //~ item.rooms = item['@кабинеты'].sort((a, b) => {
  item.roomsIndexes.sort((a,b) => vm._CompareItemRoom(a, b, item));
  return item.roomsIndexes;
},

_CompareItemRoom(a, b, item){/// для ItemRoomsIndexes
  let d1 =  /^\d/.test(item['@кабинеты'][a]['номер-название']);
  let d2 = /^\d/.test(item['@кабинеты'][b]['номер-название']);
  let v1 = d1 ? item['@кабинеты'][a]['номер-название'].replace(/^(\d+).*/, '$1') : item['@кабинеты'][a]['номер-название'];
  let v2 = d2 ? item['@кабинеты'][b]['номер-название'].replace(/^(\d+).*/, '$1') : item['@кабинеты'][b]['номер-название'];
  let l1 = v1.length;
  let l2 = v2.length;
  
  if (d1 && d2) {/// только цифры
    if (l1 > l2) return (item._sortItemRooms ? 1 : -1);
    if (l1 < l2) return (item._sortItemRooms ? -1 : 1);
    if (v1 > v2) return (item._sortItemRooms ? 1 : -1);
    if (v1 < v2) return (item._sortItemRooms ? -1 : 1);
    return 0;
   //~ return v1.localeCompare(v2) * (l1 >= l2 ? 1 : -1) * (item._sortItemRooms ? 1 : -1);
  }
  else {///чистый текст (без цифры в начале)
    return v1.localeCompare(v2)*(item._sortItemRooms ? 1 : -1);
  }
},

FilterRoomsByIdx(item, idx){///idx index помещения
  //~ item['@литеры']['количество помещений']
  if (!item.showLiter) return true;
  return item['@кабинеты'][idx].$литер.id == item.showLiter.id;
  
},

GoToContract(id){
  $EventBus.$emit('Прокрути к договору', id);
  
},

ShowLiter(item, liter){
  this.$set(item, 'showLiter', liter);
  this.ItemRoomsIndexes(item);
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
    //~ "filters": {"литер": undefined,},
    //~ "sortItemRooms": undefined,
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