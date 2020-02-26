(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаРасходыФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Расходы::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus',/* 'Компонент::Поиск в списке',*/ 'Компонент::Выбор в списке', /* 'Uploader::Файлы',*/ ]);

module
.factory('$КомпонентАрендаРасходыФорма', function($templateCache, $http, $timeout, appRoutes, $EventBus, /*$КомпонентПоискВСписке,*/ $КомпонентВыборВСписке, Util/*$КомпонентФайлы */) {// factory

//~ var rentRoomsData;///синглетон для данных объектов аренды
//~ $Контрагенты.Load();

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
};///конец props
  
const util = {/*разное*/
  //~ IsEqualId(it){ return (it.id || it) == this.id; },
  MapPosItem(pos){
    var vm = this;
    //~ console.log("MapItemRooms", room);
    //~ var r = room['помещение/id'] && rentRoomsData.find(util.IsEqualId, {"id": room['помещение/id']});
    //~ room['объект-помещение'] = room.$помещение ? `${ room.$объект['name'] }: №${ room.$помещение['номер-название'] }, ${ room.$помещение['этаж'] } эт., ${ parseFloat(room.$помещение['площадь']).toLocaleString() } м²` : '';
    pos._id = vm.idMaker.next().value;
    //~ vm.InputMetr(room) || vm.InputSum(room);
  },
  FilterPos(item){
    return item._match.indexOf(this.match) !== -1;
  },
  //~ MapRoom(item){
    //~ return item['объект-помещение'];
  //~ },
};///конец util

const methods = {/*методы*/


Ready(){/// метод
  var vm = this;
  
  //~ vm.rentRooms = rentRoomsData;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
    
    vm.InitDatepicker($('.datepicker', $(vm.$el)));
    
    $('.modal', $(vm.$el)).modal();
  });

},

InitDatepicker(el){
  var vm = this;
  el.pickadate({// все настройки в файле русификации ru_RU.js
    //~ "clear": 'Очистить',
    "formatSkipYear": false,// доп костыль - дописывать год при установке
    "onSet": function (context) {
      var s = this.component.item.select;
      if (!s) return;
      vm.$set(vm.form,this._hidden.name , [s.year, s.month+1, s.date].join('-'));
    },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  });//{closeOnSelect: true,}
  
},

ContragentContractData(){
  var vm = this;
  return $http.get(appRoutes.urlFor('аренда/договоры/список'), {"договоры на дату": vm.form['дата'],}).then(function(resp){
    vm.contragentContracts = resp.data.map(function(item){
      item._match = `${ item['$контрагент']['title']  } ${ item['дата1'] } ${ item['дата2'] } ${ item['номер'] }`.toLowerCase();
     /// , /*"адрес": item['адрес'],*/ "$помещение": room, "$объект": item['$объект'],});
      return item;
    });
  });
},


InitForm(item){/// обязательные реактивные поля
  var vm = this;
  var d = new Date;
  item["дата"] = item["дата"] || d.toISOString().replace(/T.+/, '');
  //~ item["дата2"] = item["дата2"] || (new Date(d.setMonth(d.getMonth() + 11))).toISOString().replace(/T.+/, '');
  //~ if (!item['контрагент']) item['контрагент'] = {"id": item['контрагент/id'], /*"реквизиты":{},*/};
  if (!item['@позиции']) item['@позиции'] = [];
  if (!item['@позиции'].length) item['@позиции'].push({"сумма": ''});/// это поле для компутед суммы!!!
  item['@позиции'].map(util.MapPosItem, vm);
  item._uploads = [];
  item._id = vm.idMaker.next().value;
  return item;
},


Save(){
  var vm = this;
  
  //~ vm.form['контрагент']['реквизиты'] = JSON.stringify({"ИНН": vm.form['контрагент/ИНН'], "юр. адрес": vm.form['контрагент/юр. адрес']});
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить договор'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
      $Контрагенты.RefreshData();
      vm.ContragentData();
      //~ rentRoomsData = undefined;
    },
    function(resp){
      console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    });
},

Valid(name){
  var vm = this;
  return false;
  if (name == 'контрагент') return !!(vm.form['контрагент'].id || vm.form['контрагент'].title);
  else if (name) return !!vm.form[name];
  
  return vm.form['номер'] && vm.form['номер'].length
    && vm.form['дата1'] && vm.form['дата2'] && vm.form['контрагент'] && (vm.form['контрагент'].id || vm.form['контрагент'].title)
    && vm.ValidPos()
  ;
},

ValidPos(){
  var vm = this;
  return vm.form['@позиции'].length > 1
    && vm.form['@позиции'].every(function(pos){ return !pos['номенклатура/id']  || room['количество']; });
  
},

CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

//~ SelectContragent(data){///из компонента
  //~ var vm = this;
  //~ vm.form['контрагент'] = data;
  //~ vm.form['$контрагент'] = data;
//~ },

OnContragentSelect(item, propSelect){/// из компонента выбор из списка 
  console.log("OnContractSelect", item, propSelect);
  var vm = this;
  
}, 

On000Select(item, propSelect){/// из компонента выбор из списка позиций
  //~ console.log("OnRoomSelect", item, propSelect);
  var vm = this;
  var rooms = vm.form['@позиции'];
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
    rooms.removeOf(room);
  }
},



RoomSum(room){
  var vm = this;
  //~ console.log("RoomSum", room.$помещение ? room.$помещение['площадь'] : room['площадь'], room['ставка']);
  return vm.ParseNum(room.$помещение ? room.$помещение['площадь'] : room['площадь'])*vm.ParseNum(room['ставка']);
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},

ClearDate(name){
  var vm = this;
  vm.form[name] = null;
  vm.keys[name] = vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    vm.InitDatepicker(el);
    //~ console.log("ClearDate", el);
  });
},

}; /// конец methods

const computed = {

//~ TotalSum(){
  //~ var vm = this;
  //~ var s = vm.form['@помещения'].reduce(function(a, room){
    //~ if (!room || !room['сумма']) return a;
    //~ return a + vm.ParseNum(room['сумма']);
  //~ }, 0);
  //~ return s;
//~ },

//~ TotalSqure(){
  //~ var vm = this;
  //~ var s = vm.form['@помещения'].reduce(function(a, room){
    //~ if (!room || !room.$помещение) return a;
    //~ return a + vm.ParseNum(room.$помещение['площадь']);
  //~ }, 0.0);
  //~ return s;
//~ },

};

const idMaker = IdMaker();/// глобал util/IdMaker.js

const data = function() {
  let vm = this;
  vm.idMaker = idMaker;
  var form = vm.InitForm(angular.copy(vm.item));
  //~ if (form.id) vm.Uploads(form.id);

  return {//
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "keys": {"дата расторжения": vm.idMaker.next().value, "дата договора":vm.idMaker.next().value}, ///передерг рендер
    //~ "uploads": [],
  };
  //);
};///конец data

const mounted = function(){

  var vm = this;
  vm.ContragentContractData().then(function(){
    vm.Ready();
  });
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
  $Компонент.template = $templateCache.get('аренда/расходы/форма');
  //~ $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  //~ $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());