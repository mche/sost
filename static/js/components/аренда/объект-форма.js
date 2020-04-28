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
  
  if ( vm.showFloor &&  vm.showFloor.id) {
    vm.ShowFloor();
    setTimeout(()=>{
      $(`#room-row-${ n._id }`, $(vm.$el)).get(0).scrollIntoView();
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
  if (item) this.tableRooms = item['помещения'];
  else this.tableRooms = this.form['@кабинеты'];
  
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

TotalSqure(){
  var vm = this;
  var s = vm.form['@кабинеты'].reduce(function(a, room){
    if (!room || !room['площадь']) return a;
    return a + vm.ParseNum(room['площадь']);
  }, 0.0);
  return s;
},

FloorSquares(){// площади по этажам
  var vm = this;
  var s = vm.form['@кабинеты'].reduce(function(a, room){
    if (!room || !room['площадь']) return a;
    if (!a[floors[room['этаж']]]) a[floors[room['этаж']]] = {"площадь":0, "помещения":[], "name": floors[room['этаж']]};
    a[floors[room['этаж']]]['площадь'] += vm.ParseNum(room['площадь']);
    a[floors[room['этаж']]]['помещения'].push(room);
    return a;
  }, {});
  return s;
},

ListFloors(){///выбор в списке этажей
  return Object.keys(floors).sort((a,b)=>{
    if (parseFloat(a) > parseFloat(b))  return 1; 
    if (parseFloat(a) < parseFloat(b)) return -1; 
    return 0;
  }).map((id)=>{
    return {"id": id, "floor": floors[id]};
    
  });
  
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
    "tableRooms": form["@кабинеты"],
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