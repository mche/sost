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
var module = angular.module(moduleName, ['Компонент::Выбор объекта', 'Компонент::Выбор в списке', 'Uploader::Файлы',]);

module
.factory('$КомпонентАрендаОбъектФорма',  function(/*$templateCache,*/ $http, $timeout, appRoutes, Util, $КомпонентВыборОбъекта, $КомпонентВыборВСписке, $КомпонентФайлы) {// factory

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
    return this.prop ? !!(room[this.name] && room[this.name][this.prop]) : room[this.name] == '0' || !!room[this.name];
  },
  reqFields: ['номер-название', 'этаж', 'площадь'],
  IsValidField(name){
    return this[name] == '0' || !!this[name];
  },
}; ///конец util

const methods = {/*методы*/

InitForm(form){
  let vm = this;
  if (!form["@кабинеты"]) form["@кабинеты"] = [{ }];
  form["@кабинеты"].map((room)=>{
    room._id = idMaker.next().value;
    
  });
  form.litersEdit = {};///редактирование литер(в компутед не может реактивность добавлять)
  return form;
  
},
  
Ready(){/// метод
  var vm = this;
  vm.ready = true;
  //~ $timeout(()=>{
    //~ $('input[type="text"]', $(vm.$el)).first().focus();
    //~ vm.$el.children[0].children[0].scrollIntoView({ "block": 'start', "behavior": 'smooth', });////behavior: 'instant', block: 'center'
  //~ }, 700);
},

SelectObject(obj){
  //~ console.log("SelectObject", obj);
  this.form.$объект = obj;
  
},

Valid(liters){
  if (!this.form.$объект) return false;
  
  for (const [id, edit] of Object.entries(this.form.litersEdit))
    if (!edit.title) return false;
  
  for (const [id, liter] of Object.entries(liters)) {
    for (const room of liter['помещения'])
      if (!this.ValidRoom(room)) return false;//console.log("not valid", room);
    //~ && this.ValidRooms('номер-название') && this.ValidRooms('этаж', 'length') && this.ValidRooms('площадь');
  }
  return true;
},

CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

ValidRooms(liter, name, prop){///проверка строк кабинетов
  //~ var form = this.form;
  const rooms = liter['помещения'];
  //~ if (!form["@кабинеты"] || !form["@кабинеты"].length) return true;
  return rooms.every(util.IsValidRoom, {"name": name, "prop":prop,});
  
},

ValidRoom(room){
  return util.reqFields.every(util.IsValidField, room);
},

AddRoom(liter, room){// индекс вставки, если undefined или -1 - вставка в конец; 0 - в начало
  var vm = this;
  var form = this.form;
  //~ console.log("AddRoom", room);
  let _id = vm.idMaker.next().value;
  var n = {
    _id,
    "номер-название": '',
    "этаж":(room && room['этаж']) || this.showFloors[liter.id],
    "$литер":{"id":liter.id, "title":liter.title,},
  };
  
  var idx = room ? form["@кабинеты"].indexOf(room) : 0;
  
  //~ if (idx === undefined) idx = form["@кабинеты"].length + 1;
    //~ var prevRow = data["@позиции тмц"][ idx === 0 ? idx : (idx < 0 ? data["@позиции тмц"].length - idx : idx-1) ];
    //~ if (prevRow) {
      //~ if (prevRow['$объект'] && prevRow['$объект'].id) n['$объект'] = angular.copy(prevRow['$объект']);
    //~ }
  form['@кабинеты'].splice(idx, 0, n);
  setTimeout(_=>document.getElementById(`room-row-${ _id }`).classList.add('slideInRight'));
  
  //~ if ( vm.showFloor ) {
    //~ vm.ShowFloor();/// сброс вкладки
  
    //~ setTimeout(()=>{
      //~ document.getElementById(`room-row-${ n._id }`).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
    //~ });
  //~ }
  
},

DeleteRoom(room){
  document.getElementById(`room-row-${ room._id }`).classList.add('slideOutRight');
  setTimeout(()=>this.form['@кабинеты'].removeOf(room), 300);
},

CopyRoom(room){
  var vm = this;
  var copy = angular.copy(room);
  var idx = vm.form['@кабинеты'].indexOf(room);
  if (idx < 0) return;
  copy._copy_id = copy.id;
  copy.id = undefined;
  copy._id = vm.idMaker.next().value;
  vm.form['@кабинеты'].splice(idx, 0, copy);
  setTimeout(_=>document.getElementById(`room-row-${ copy._id }`).classList.add('slideInRight'));
  //~ if ( vm.showFloor ) {
    //~ vm.ShowFloor();/// сброс вкладки
    //~ setTimeout(()=>{
      //~ $(`#room-row-${ copy._id }`, $(vm.$el)).get(0).scrollIntoView();
    //~ });
  //~ }
},

AddLiter(room){///room -  перенести помещение в новый литер
  let liter = (this.litersEdit &&  this.litersEdit[0]) || {"id":0, "title": '',};
  this.Edit(liter);
  if (room) room.$литер = liter;
  else this.AddRoom(liter);
  
  this.Expands('развернуть помещения:'+liter.id);
  setTimeout(_=>document.getElementById('liter-'+liter.id).scrollIntoView({ "block": 'start', "behavior": 'smooth', }), 300);
},

Save(){
  var vm = this;
  if (!this.valid) return;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить объект'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'float-none red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'fs14 green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
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

ShowFloor(liter, floor){
  this.$set(this.showFloors, liter.id, floor);
  //~ this.$set(liter, 'showFloor', floor);
  //~ console.log("ShowFloor", liter.showFloor);
  //~ this.tableRooms = this.SortRooms(item ? item['помещения'] : this.form['@кабинеты']);
},

Expands(key){
  this.$set(this.expands, key, !this.expands[key]);
  
},

SortRooms(rooms){
  //~ this.counter++;
  return rooms.sort((a,b)=>this._CompareRoom(a,b));
},

_CompareRoom(a,b){/// из объекты-таблица.js
  //~ console.log("_CompareRoom");
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
},

OnSelectLiter(liter, propSel){
  let room = propSel.room;
  if (room['$литер'].id != liter.id) room['$литер'] = liter;
  //~ console.log("OnSelectLiter", liter, propSel);
  //~ this.$set(room, '_showChangeLiter', false);
  
},

_CompareFloor(a,b){
  if (parseFloat(a) > parseFloat(b))  return 1; 
  if (parseFloat(a) < parseFloat(b)) return -1; 
  return 0;
},

//~ _ReduceLiters(a, liter) {
  //~ if (!a[liter.id]) a[liter.id] = Object.assign({"_id": this.idMaker.next().value, "площадь":0, "помещения":[], "по этажам":{},}, liter);
  //~ return a;
//~ },

_ReduceRooms(a,room){/// разбор списка кабинетов объекта на литеры, этажи и выч площадей
  this.counter++;
  if (!room._id) room._id = this.idMaker.next().value;
  if (!a[room['$литер'].id]) a[room['$литер'].id] = Object.assign({"_id": this.idMaker.next().value, "площадь":0, "помещения":[], "по этажам":{},}, this.form.litersEdit[room['$литер'].id] || room['$литер']);
  let liter = a[room['$литер'].id] ;
  liter['помещения'].push(room);
  if (!liter['по этажам'][room['этаж']]) liter['по этажам'][room['этаж']] = {"литер/id": liter.id, "площадь":0, "помещения":[], "name": floors[room['этаж']]};
  let s = this.ParseNum(room['площадь'] || 0)
  liter['площадь'] += s;
  liter['по этажам'][room['этаж']]['площадь'] += s ;
  this.totalSquare += s;
  liter['по этажам'][room['этаж']]['помещения'].push(room);
  return a;
},

Edit(liter, event){
  //~ let inp = event.target.parentElement.getElementsByTagName('input')[0];
  //~ console.log("edit", event.target.parentElement, inp);
  if (!this.form.litersEdit[liter.id]) this.$set(this.form.litersEdit, liter.id, {"id": liter.id, "title": liter.title});
  //~ setTimeout(()=>inp.focus(), 300);
},

CompareObjects(o1, o2){
  return Object.keys(o1).every(p=>o1[p] === o2[p]) 
    && Object.keys(o2).every(p=>o1[p] === o2[p]);
},

CompareObjects(o1, o2){
  return Object.keys(o1).every(p=>o1[p] === o2[p]) 
    && Object.keys(o2).every(p=>o1[p] === o2[p]);
},

}; ///конец методы


const computed = {

/*TotalSqure(){
  //~ var vm = this;
  console.log("TotalSqure");
  //~ var s = this.form['@кабинеты'].reduce((a, room)=>this._ReduceTotalSquare(a, room), 0.0);
  return Object.keys(this.FloorSquares).reduce((a, floor)=>this._ReduceTotalSquare(a, floor), 0.0);
},*/

Liters(){// площади по этажам  и вообще разбор помещений
  //~ console.log("FloorSquares", this.FloorSquares);
  //~ var vm = this;
  this.totalSquare = 0.0;
  //~ this.showFloors = {};
  //~ let liters = this.form["@литеры"].reduce((a, liter)=>this._ReduceLiters(a, liter), {});
  const liters = this.form["@кабинеты"].reduce((a, room)=>this._ReduceRooms(a, room), {});
  
  for (const [literId, floor] of Object.entries(this.showFloors))
    if (!(liters[literId] && liters[literId]['по этажам'][floor]))
      this.showFloors[literId] = undefined;
  
  for (const id in Object.keys(this.form.litersEdit))
    if (! liters[id]) {
      this.$delete(this.form.litersEdit, id);
      this.$delete(this.expands, 'развернуть помещения:'+id);
      //~ console.log("Удалил ред. литер", id);
    }
  
  const litersArray = Object.entries(liters).map(a=>({"id":a[0], "title": this.form.litersEdit[a[0]] ? this.form.litersEdit[a[0]].title : a[1].title}));
  if (this.liters && !litersArray.every((l,i)=>this.CompareObjects(l, this.liters[i]))) this.keys['список литер']++;
  this.liters = litersArray;
  
  
  this._liters = liters;/// для 
  this.valid = this.Valid(liters);
  return liters;
},

  
};/// конец computed

const idMaker = IdMaker();/// глобал util/IdMaker.js

const floors = {
  "-1": 'подвал',
  "0": 'цок. этаж',
  "1": '1 этаж',
  "2": '2 этаж',
  "3": '3 этаж',
  "4": '4 этаж',
  "9999": 'крыша',
};

const data = function() {
  let vm = this;
  vm.idMaker = idMaker;
  var form = vm.InitForm(angular.copy(vm.item));
  vm._floors = floors;
  vm.floors = Object.keys(floors)///выбор в списке этажей
        .sort((a,b)=>vm._CompareFloor(a,b))
        .map((id)=>({"id": id, "floor": floors[id]}))
  ;
  this.SortRooms(form["@кабинеты"]);

  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "valid": undefined,
    "cancelerHttp": undefined,
    "counter": 0,
    "form": form,
    //~ "showFloor": undefined,///вкладки этажей
    //~ "tableRooms": vm.SortRooms(form["@кабинеты"]),
    "totalSquare": 0.0,
    "showFloors": {},/// это по каждой литере какой этаж показать
    "expands": {}, /// для разных нужд реактивные флажки
    "liters":undefined, /// при компутед Liters делает массив {id title}
    "keys":{'список литер':0,}, ///обновление редактирования списка литеров в каждом помещении
    };
  //);
};///  конец data

let template = parcelRequire('js/c/аренда/объект-форма.vue.html');

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
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  //~ $Компонент.template = $templateCache.get('аренда/объект/форма');
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  $Компонент.components['v-select-floor'] = new $КомпонентВыборВСписке();
  $Компонент.components['v-select-liter'] = new $КомпонентВыборВСписке();
  $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());