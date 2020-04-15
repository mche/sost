(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорПомещенияФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Договор::Помещения::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Компонент::Выбор в списке', 'Util']);

module
.factory('$КомпонентАрендаДоговорПомещенияФорма', function($templateCache, $КомпонентВыборВСписке, Util) {// factory

const defaultParam = {
  "bgClass": 'lime lighten-4',
};

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "rooms": {
    type: Array,
    default: function () {
      return [];
    },
  },
  "allRooms": Array,
};///конец props
  
const util = {/*разное*/
  MapItemRooms(room){
    var vm = this;
    //~ console.log("MapItemRooms", room);
    //~ var r = room['помещение/id'] && rentRoomsData.find(util.IsEqualId, {"id": room['помещение/id']});
    //~ room['объект-помещение'] = room.$помещение ? `${ room.$объект['name'] }: №${ room.$помещение['номер-название'] }, ${ room.$помещение['этаж'] } эт., ${ parseFloat(room.$помещение['площадь']).toLocaleString() } м²` : '';
    room._id = vm.idMaker.next().value;
    //~ if (room.id && room['ставка']) room['ставка|сумма'] = 'ставка';
    //~ if (room.id && room['сумма']) room['ставка|сумма'] = 'сумма';
    vm.InputMetr(room) || vm.InputSum(room);
  },
  FilterRooms(item){
    return item._match.indexOf(this.match) !== -1;
  },
};///конец util

const methods = {/*методы*/

InitRooms(){
  this.rooms.map(util.MapItemRooms, this);
  
},

Ready(){/// метод
  var vm = this;
},

OnRoomSelect(item, propSelect){/// из компонента выбор из списка помещений
  //~ console.log("OnRoomSelect", item, propSelect);
  var vm = this;
  //~ var rooms = vm.form['@помещения'];
  var rooms = vm.rooms;
  var room = propSelect.room;
  
  if ( room === rooms[rooms.length-1])  rooms.push({"сумма":'', /*"объект-помещение": '',*/ "_id": vm.idMaker.next().value});/// тут обязательно объявить реактивные поля!
  //~ rooms.splice(rooms.indexOf(room), 1, {"id": item['помещение'].id, "объект-помещение": val, "ставка": room['ставка'], });
  //~ room.id = item['помещение'].id;
  //~ Object.assign(room, item['помещение']);
  if (item) {
    room['помещение/id'] = item && item.$помещение.id;
    room.$помещение = item && item.$помещение;
    ((room['ставка|сумма'] == 'ставка') && vm.InputMetr(room)) || vm.InputSum(room);
  } else {///удалить строку формы
    //~ rooms.removeOf(room);
    room['помещение/id'] = undefined;
    room.$помещение = undefined;
  }
},

InputMetr(room){///ставка за1м/мес
  var vm = this;
  if (/*!room.$помещение ||*/ !room['ставка']) return;
  var s = vm.ParseNum(room['ставка']) * vm.RoomSquare(room);
  room['сумма'] = s.toLocaleString({"currency": 'RUB'});
  room['ставка|сумма'] = 'ставка';
  return room['сумма'];
},

InputSum(room){/// сумма за мес
  var vm = this;
  if (/*!room.$помещение ||*/ !room['сумма']) return;
  var s = vm.ParseNum(room['сумма'])/vm.RoomSquare(room);
  room['ставка'] = s.toLocaleString({"currency": 'RUB'});
  room['ставка|сумма'] = 'сумма';
  return room['ставка'];
},

InputSquare(room){
  var vm = this;
  if (room['площадь'].length && !/^\d+$|[.,]\d*$/.test(room['площадь'])) {
    var s = vm.ParseNum(room['площадь']);
    room['площадь'] = s.toLocaleString('ru-RU', {"minimumFractionDigits":1});
  }
  //~ console.log("InputSquare", s);  
  if (room['ставка|сумма'] == 'сумма') vm.InputSum(room);
  if (room['ставка|сумма'] == 'ставка') vm.InputMetr(room);
},

RoomSquare(room){
  var vm = this;
  //~ console.log("RoomSquare", room.$помещение ? room.$помещение['площадь'] : room['площадь'], room['ставка']);
  return vm.ParseNum(room['площадь'] || (room.$помещение && room.$помещение['площадь']));
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},



}; /// конец methods

const computed = {

TotalSum(){
  var vm = this;
  var s = vm./*form['@помещения']*/rooms.reduce(function(a, room){
    if (!room || !(room['сумма'] || room['сумма нал'])) return a;
    return a + vm.ParseNum(room['сумма'])+ vm.ParseNum(room['сумма нал'] || 0);
  }, 0);
  //~ console.log("TotalSum", s);
  vm.$emit('table-sum', s);
  return s;
},

TotalSqure(){
  var vm = this;
  var s = vm./*form['@помещения']*/rooms.reduce(function(a, room){
    if (!room || !(room['площадь'] || room.$помещение)) return a;
    return a + vm.ParseNum(room['площадь'] || room.$помещение['площадь']);
  }, 0.0);
  return s;
},




//~ ValidPos(){
  //~ var vm = this;
  //~ return ;
  
//~ },

};

const idMaker = IdMaker();/// глобал util/IdMaker.js

const data = function() {
  let vm = this;
  vm.idMaker = idMaker;
  vm.InitRooms();
  vm.extParam = Object.assign({}, defaultParam, vm.param);
  //~ if (form.id) vm.Uploads(form.id);
  //~ console.log("data", vm.rooms);

  return {//
    "ready": false,
    "dataRooms": vm.rooms,
    //~ "form": form,
    //~ "uploads": [],
  };
  //);
};///конец data

const mounted = function(){
  //~ this.$nextTick(() => {
    //~ window.uploader = this.$refs.uploader.uploader;
  //~ });
  var vm = this;
  //~ console.log("mounted", vm.rooms, vm.dataRooms);
};/// конец mounted

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  mounted,
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('аренда/договор/помещения/форма');
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());