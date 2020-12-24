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
var module = angular.module(moduleName, ['Компонент::Выбор в списке', 'Util', 'EventBus',]);

module
.factory('$КомпонентАрендаДоговорПомещенияФорма', function($templateCache, $КомпонентВыборВСписке, Util, $EventBus) {// factory

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
  "помещения": {/// помещение договора
    type: Array,
    default: function () {
      return [];
    },
  },
  "всегоСуммаБезнал": {/// сумма безнал договора, которая вместо построчного суммирования
    type: Object,
    default: function () {
      return {};
    },
  },
  //~ "allRooms": Array,
};///конец props
  
const util = {/*разное*/
  MapItemRooms(room){
    var vm = this;
    //~ console.log("MapItemRooms", room);
    //~ var r = room['помещение/id'] && rentRoomsData.find(util.IsEqualId, {"id": room['помещение/id']});
    //~ room['объект-помещение'] = room.$помещение ? `${ room.$объект['name'] }: №${ room.$помещение['номер-название'] }, ${ room.$помещение['этаж'] } эт., ${ parseFloat(room.$помещение['площадь']).toLocaleString() } м²` : '';
    room._id = vm.idMaker.next().value;
    if (room.id && !room['ставка|сумма'] && room['ставка']) room['ставка|сумма'] = 'ставка';
    else if (room.id && !room['ставка|сумма'] && room['сумма']) room['ставка|сумма'] = 'сумма';
    //~ if (room['ставка|сумма'] == 'ставка')  vm.InputMetr(room);
    //~ else vm.InputSum(room);
    //~ vm.InputMetr(room) || vm.InputSum(room);
    vm.InputSquare(room);
  },
  FilterRooms(item){
    return item._match.indexOf(this.match) !== -1;
  },
};///конец util

const methods = {/*методы*/

ObjectData(){/// список объектов/помещений
  var vm = this;
  return new Promise(function(resolve, reject){
    $EventBus.$emit('Дайте список объектов аренды', function(/*loader*/data){/// один раз выполнится
      //~ loader.then(function(data){
        //~ rentRoomsData = [];
        vm.rentRooms = [];
        data.map(function(item){
          //~ console.log("Дайте список объектов аренды",  item['$объект']);
          item['@кабинеты'].map(function(room){
            vm.rentRooms.push({"id": room.id, /*"объект-помещение": `${ item['$объект']['name']  }: №${ room['номер-название'] }, ${ room['этаж'] } эт., ${ room['площадь'] } м²`,*/ "_match": `${ item['$объект']['name']  } лит.${ room.$литер.title } ${ room['номер-название'] } ${ vm.FloorTitle(room['этаж']) } ${ room['площадь'] }`.toLowerCase(), /*"адрес": item['адрес'],*/ "$помещение": room, "$объект": item['$объект'],/*"$item": angular.copy(item),*/});
          });
        });
        //~ console.log("Дайте список объектов аренды",vm.rentRooms );
        //~ 
        return resolve(true);
      //~ }, function(err){ return reject(err); });
        
    });
  });
},
  
InitRooms(){
  this.rooms.map(util.MapItemRooms, this);
  
},

Ready(){/// метод
  var vm = this;
  vm.InitRooms();
  this.ready = true;
  
},

OnRoomSelect(item, propSelect){/// из компонента выбор из списка помещений
  var vm = this;
  //~ var rooms = vm.form['@помещения'];
  var rooms = vm.rooms;
  var room = propSelect.room;
  
  if ( room === rooms[rooms.length-1])  rooms.push({"сумма":'', /*"объект-помещение": '',*/ "_id": vm.idMaker.next().value});/// тут обязательно объявить реактивные поля!
  //~ rooms.splice(rooms.indexOf(room), 1, {"id": item['помещение'].id, "объект-помещение": val, "ставка": room['ставка'], });
  //~ room.id = item['помещение'].id;
  //~ Object.assign(room, item['помещение']);
  //~ debugger;
  if (item) {
    room['помещение/id'] = item && item.$помещение.id;
    room.$помещение = item && item.$помещение;
    ((room['ставка|сумма'] == 'ставка') && vm.InputMetr(room)) || vm.InputSum(room);
  } else {///удалить строку формы
    //~ rooms.removeOf(room);
    let idx = rooms.indexOf(room);
    //~ console.log("OnRoomSelect", idx, rooms.length);
    if (rooms.length > 1 && idx < rooms.length-1) {
      document.getElementById(`room-row-${ room._id }`).classList.add('slideOutRight');
      setTimeout(()=>rooms.splice(/*rooms.length-1*/ idx, 1), 700);
    }
    //~ else {
      room['помещение/id'] = undefined;
      room.$помещение = undefined;
    //~ }
  }
  this.$emit('rooms-change', rooms);
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
  if (room['площадь']  && !/^\d+$|[.,]\d*$/.test(room['площадь'])) {
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
  return vm.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : (room.$помещение && room.$помещение['площадь'])));
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},

FloorTitle(floor){
  return floor.toString().replace(/-1/, 'подв.').replace(/0/, 'цок.').replace(/9999/, 'крыша');
},

InputTotalMoney(){
  this.totalMoney['сумма'] = this.ParseNum(this.totalMoney['сумма']);
  //~ console.log("InputTotalMoney", this.totalMoney['сумма']);
  if (isNaN(this.totalMoney['сумма'])) this.totalMoney['сумма'] = null;
  this.$emit('table-sum', this.totalMoney['сумма']  === 0 ? this.totalMoney : ( this.totalMoney['сумма'] && this.totalMoney) || this.TotalSum);
  if (this.totalMoney['сумма']) this.totalMoney['сумма'] = this.ParseNum(this.totalMoney['сумма']).toLocaleString(({"currency": 'RUB'}));
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
  if (this.totalMoney['сумма'] !== 0 && !this.totalMoney['сумма']) vm.$emit('table-sum', s);
  return s;
},

TotalSqure(){
  var vm = this;
  var s = vm./*form['@помещения']*/rooms.reduce(function(a, room){
    if (!room || !(room['площадь'] || room['площадь'] == 0 || room.$помещение)) return a;
    return a + vm.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : (room.$помещение && room.$помещение['площадь'])));
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
  
  vm.extParam = Object.assign({}, defaultParam, vm.param);
  //~ if (form.id) vm.Uploads(form.id);
  //~ console.log("data", vm.rooms);
  if (this['всегоСуммаБезнал']) this.$emit('table-sum', this['всегоСуммаБезнал']);

  return {//
    "ready": false,
    "rooms": vm['помещения'],
    "totalMoney": this['всегоСуммаБезнал'],
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
  vm.ObjectData().then(()=>{
    vm.Ready();
  });
  //~ console.log("mounted", vm.rooms, vm.dataRooms);
};/// конец mounted

const  beforeMount = function(){
  //~ if (vm.extParam.debounce !== 0) {
    if (typeof debounce !== 'function') return console.error("Нет функции debounce!");
    this.InputTotalMoney = debounce(this.InputTotalMoney, 700);
  //~ }
};

let template = parcelRequire('js/c/аренда/договор-помещения-форма.vue.html');

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  //~ beforeMount,
  mounted,
  "components": { },
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('аренда/договор/помещения/форма');
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());