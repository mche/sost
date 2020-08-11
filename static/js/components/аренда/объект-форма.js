(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаОбъектФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Объект::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Компонент::Выбор объекта', 'Компонент::Выбор в списке',]);

module
.factory('$КомпонентАрендаОбъектФорма',  function($templateCache, $http, $timeout, appRoutes, Util, $КомпонентВыборОбъекта, $КомпонентВыборВСписке) {// factory

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
};/// конец props

const util = {/*разное*/
  IsValidRoom(room){
    return this.prop ? !!(room[this.name] && room[this.name][this.prop]) : !!room[this.name];
  },
  reqFields: ['номер-название', 'этаж', 'площадь'],
  IsValidField(name){
    return !!this[name];
  },
}; ///конец util

const methods = {/*методы*/

InitForm(form){
  let vm = this;
  if (!form["@кабинеты"]) form["@кабинеты"] = [{ }];
  form["@кабинеты"].map((room)=>{
    room._id = idMaker.next().value;
    
  });
  return form;
  
},
  
Ready(){/// метод
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
  });
},

SelectObject(obj){
  //~ console.log("SelectObject", obj);
  this.form.$объект = obj;
  
},

Valid(){
  var form = this.form;
  //~ console.log("Valid", this.ValidRooms('этаж', 'length'));
  return /*form['адрес']  && form['адрес'].length*/ this.form.$объект
    && this.ValidRooms('номер-название') && this.ValidRooms('этаж', 'length') && this.ValidRooms('площадь');
  ;
},

CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

ValidRooms(name, prop){///проверка строк кабинетов
  var form = this.form;
  if (!form["@кабинеты"] || !form["@кабинеты"].length) return true;
  return form["@кабинеты"].every(util.IsValidRoom, {"name": name, "prop":prop,});
  
},

ValidRoom(room){
  return util.reqFields.every(util.IsValidField, room);
},

AddRoom(room){// индекс вставки, если undefined или -1 - вставка в конец; 0 - в начало
  var vm = this;
  var form = vm.form;
  var n = {"_id": vm.idMaker.next().value, /*"этаж": vm.showFloor && vm.showFloor.id*/};
  
  var idx = room ? form["@кабинеты"].indexOf(room) : 0;
  
  //~ if (idx === undefined) idx = form["@кабинеты"].length + 1;
    //~ var prevRow = data["@позиции тмц"][ idx === 0 ? idx : (idx < 0 ? data["@позиции тмц"].length - idx : idx-1) ];
    //~ if (prevRow) {
      //~ if (prevRow['$объект'] && prevRow['$объект'].id) n['$объект'] = angular.copy(prevRow['$объект']);
    //~ }
  form['@кабинеты'].splice(idx, 0, n);
  
  if ( vm.showFloor ) {
    vm.ShowFloor();/// сброс вкладки
    setTimeout(()=>{
      $(`#room-row-${ n._id }`, $(vm.$el)).get(0).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
    });
  }
  
},

DeleteRoom(room){
  this.form['@кабинеты'].removeOf(room);
},

CopyRoom(room){
  var vm = this;
  var copy = angular.copy(room);
  var idx = vm.form['@кабинеты'].indexOf(room);
  if (idx < 0) return;
  copy.id = undefined;
  copy._id = vm.idMaker.next().value;
  vm.form['@кабинеты'].splice(idx, 0, copy);
  if ( vm.showFloor ) {
    //~ var showFloor = vm.showFloor;
    vm.ShowFloor();/// сброс вкладки
    setTimeout(()=>{
      $(`#room-row-${ copy._id }`, $(vm.$el)).get(0).scrollIntoView();
      //~ vm.ShowFloor(vm.showFloor);
    });
  }
},

Save(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить объект'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
    },
    function(resp){
      console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},

Remove(){
  var vm = this;
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/удалить объект'), {"id": vm.form.id})
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Удалено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      
      vm.$emit('on-save', {"id": resp.data.remove.id, "удалить": true,});
    },
    function(resp){
      console.log("Ошибка", resp);
      Materialize.toast("Ошибка "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},

ShowFloor(item, floor){
  this.showFloor = item;
  this.tableRooms = this.SortRooms(item ? item['помещения'] : this.form['@кабинеты']);
},

SortRooms(rooms){
  return rooms.sort((a,b)=>this._CompareRoom(a,b));
},

_CompareRoom(a,b){/// из объекты-таблица.js
  //~ console.log("_CompareRoom", this);
  let d1 =  /^\d/.test(a['номер-название']);
  let d2 = /^\d/.test(b['номер-название']);
  let v1 = d1 ? a['номер-название'].replace(/^(\d+).*/, '$1') : a['номер-название'];
  let v2 = d2 ? b['номер-название'].replace(/^(\d+).*/, '$1') : b['номер-название'];
  let l1 = v1.length;
  let l2 = v2.length;
  
  if (d1 && d2) {/// только цифры
    if (l1 > l2) return (!this._sortItemRooms ? 1 : -1);
    if (l1 < l2) return (!this._sortItemRooms ? -1 : 1);
    if (v1 > v2) return (!this._sortItemRooms ? 1 : -1);
    if (v1 < v2) return (!this._sortItemRooms ? -1 : 1);
    return 0;
   //~ return v1.localeCompare(v2) * (l1 >= l2 ? 1 : -1) * (item._sortItemRooms ? 1 : -1);
  }
  else {///чистый текст (без цифры в начале)
    return v1.localeCompare(v2)*(!this._sortItemRooms ? 1 : -1);
  }
},

OnFloorSelect(item, propSel){
  //~ console.log("OnFloorSelect", item, propSel.room);
  propSel.room['этаж'] = item && item.id;
  //~ var s = propSel.room['площадь'];
  //~ propSel.room['площадь'] = undefined;
  //~ setTimeout(()=>{
    //~ propSel.room['площадь'] = s;
  //~ });
},

_CompareFloor(a,b){
  if (parseFloat(a) > parseFloat(b))  return 1; 
  if (parseFloat(a) < parseFloat(b)) return -1; 
  return 0;
},


_ReduceFloorSquares(a,room){
  if (!room || !room['площадь']) return a;
  if (!a[floors[room['этаж']]]) a[floors[room['этаж']]] = {"площадь":0, "помещения":[], "name": floors[room['этаж']]};
  a[floors[room['этаж']]]['площадь'] += this.ParseNum(room['площадь']);
  this.totalSquare += this.ParseNum(room['площадь']);
  a[floors[room['этаж']]]['помещения'].push(room);
  return a;
},

}; ///конец методы

const floors = {
  "-1": '              подвал',
  "0": '               цокольный этаж',
  "1": '1 этаж',
  "2": '2 этаж',
  "3": '3 этаж',
  "4": '4 этаж',
};

const computed = {

/*TotalSqure(){
  //~ var vm = this;
  console.log("TotalSqure");
  //~ var s = this.form['@кабинеты'].reduce((a, room)=>this._ReduceTotalSquare(a, room), 0.0);
  return Object.keys(this.FloorSquares).reduce((a, floor)=>this._ReduceTotalSquare(a, floor), 0.0);
},*/

FloorSquares(){// площади по этажам  и вообще разбор помещений
  //~ console.log("FloorSquares", this.FloorSquares);
  //~ var vm = this;
  this.totalSquare = 0.0;
  return this.form['@кабинеты'].reduce((a, room)=>this._ReduceFloorSquares(a, room), {});
},

ListFloors(){///выбор в списке этажей
  //~ console.log("ListFloors");
  return Object.keys(floors)
    .sort((a,b)=>this._CompareFloor(a,b))
    .map((id)=>({"id": id, "floor": floors[id]}));
  
},
  
};

const idMaker = IdMaker();/// глобал util/IdMaker.js

const data = function() {
  let vm = this;
  vm.idMaker = idMaker;
  var form = vm.InitForm(angular.copy(vm.item));

  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "expandRooms":  form["@кабинеты"].length < 10,
    "showFloor": undefined,///вкладки этажей
    "tableRooms": vm.SortRooms(form["@кабинеты"]),
    "totalSquare": 0.0,
    "floorsSquare": undefined,
    };
  //);
};///  конец data

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
  "components": {
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/объект/форма');
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  $Компонент.components['v-select-floor'] = new $КомпонентВыборВСписке();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());