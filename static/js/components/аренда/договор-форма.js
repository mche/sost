(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Договор::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Компонент::Контрагент', 'Контрагенты', 'EventBus',/* 'Компонент::Поиск в списке',*/ 'Компонент::Выбор в списке',  'Uploader::Файлы', /*'Uploader'*/]);

module
.factory('$КомпонентАрендаДоговорФорма', function($templateCache, $http, $q, $timeout, appRoutes, $КомпонентКонтрагент, $Контрагенты, $EventBus, /*$КомпонентПоискВСписке,*/ $КомпонентВыборВСписке, Util, $Список, $КомпонентФайлы /*$Uploader*/) {// factory

//~ var rentRoomsData;///синглетон для данных объектов аренды
$Контрагенты.Load();
var projectList = new $Список(appRoutes.url_for('список проектов'));
projectList.Load();

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
    //~ $('input[type="text"]', $(vm.$el)).first().focus();
    
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

ProjectData(){
  var vm = this;
  return projectList.Load().then(function(){
    vm.projectData = projectList.Data();
    
  });
},

SelectProject(item){
  //~ this.form['$проект'] = item;
  this.$set(this.form, '$проект', item);
  
},

ContragentData(){
  var vm = this;
  return $Контрагенты.Load().then(function(){
    vm.contragentData = $Контрагенты.Data();
  });
},


InitForm(item){/// обязательные реактивные поля
  var vm = this;
  //~ 
  var d = new Date;
  item["дата1"] = item["дата1"] || d.toISOString().replace(/T.+/, '');
  item["дата2"] = item["дата2"] || (new Date(d.setMonth(d.getMonth() + 11))).toISOString().replace(/T.+/, '');
  if (!item['контрагент']) item['контрагент'] = {"id": item['контрагент/id'], /*"реквизиты":{},*/};
  if (!item['$проект']) item['$проект'] = {"id": item['проект/id']};
  //~ if (!item['контрагент']['реквизиты']) item['контрагент']['реквизиты']={};
  //~ console.log("InitForm", angular.copy(item['контрагент']));
  //~ vm.KontragentRecv(item);
  if (!item['@помещения']) item['@помещения'] = [];
  if (!item['@помещения'].length) item['@помещения'].push({"сумма": ''});/// это поле для компутед суммы!!!
  item['@помещения'].map(util.MapItemRooms, vm);
  item._uploads = [];
  item._id = vm.idMaker.next().value;
  return item;
},

Valid(){
  var vm = this;
  /*if (name == 'контрагент') return !!(vm.form['контрагент'].id || vm.form['контрагент'].title);
  else if (name == '$проект') return !!(vm.form[name] && vm.form[name].id);
  else if (name) return !!vm.form[name];*/
  
  
  
  var test =
    !!(vm.form['$проект'] && vm.form['$проект'].id)
    && !!(vm.form['номер'] && vm.form['номер'].length)
    && !!(vm.form['дата1'] && vm.form['дата2'])
    && !!(vm.form['контрагент'] && (vm.form['контрагент'].id || vm.form['контрагент'].title))
    //~ && vm.ValidPos()
    && vm.form['@помещения'].length > 1
    && vm.form['@помещения'].slice(0, -1).every(function(room){ return !!room['помещение/id'] && !!(room['ставка'] || room['сумма']); })
  ;
  console.log("Valid", test);
  return test;
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




CancelBtn(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
},

SelectContragent(data){///из компонента
  var vm = this;
  //~ console.log("SelectContragent", data);
  vm.form['контрагент'] = data;
  vm.form['$контрагент'] = data;
  //~ if (!data._isEdit) vm.KontragentRecv(vm.form);
},


OnRoomSelect(item, propSelect){/// из компонента выбор из списка помещений
  //~ console.log("OnRoomSelect", item, propSelect);
  var vm = this;
  var rooms = vm.form['@помещения'];
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

InputMetr(room){///ставка за1м/мес
  var vm = this;
  if (!room.$помещение || !room['ставка']) return;
  var s = vm.RoomSum(room);
  room['сумма'] = s.toLocaleString({"currency": 'RUB'});
  room['ставка|сумма'] = 'ставка';
  return room['сумма'];
},

InputSum(room){/// сумма за мес
  var vm = this;
  if (!room.$помещение || !room['сумма']) return;
  var s = vm.ParseNum(room['сумма'])/vm.ParseNum(room.$помещение ? room.$помещение['площадь'] : room['площадь']);
  room['ставка'] = s.toLocaleString({"currency": 'RUB'});
  room['ставка|сумма'] = 'сумма';
  return room['ставка'];
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

TotalSum(){
  var vm = this;
  var s = vm.form['@помещения'].reduce(function(a, room){
    if (!room || !room['сумма']) return a;
    return a + vm.ParseNum(room['сумма']);
  }, 0);
  return s;
},

TotalSqure(){
  var vm = this;
  var s = vm.form['@помещения'].reduce(function(a, room){
    if (!room || !room.$помещение) return a;
    return a + vm.ParseNum(room.$помещение['площадь']);
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
  //~ this.$nextTick(() => {
    //~ window.uploader = this.$refs.uploader.uploader;
  //~ });
  var vm = this;
  $q.all([vm.ContragentData(), vm.ProjectData()]).then(function(){
    //~ if (!rentRoomsData) 
    $EventBus.$emit('Дайте список объектов аренды', function(loader){/// один раз выполнится
      loader.then(function(data){
        //~ rentRoomsData = [];
        vm.rentRooms = [];
        data.map(function(item){
          item['@кабинеты'].map(function(room){
            /*rentRoomsData*/vm.rentRooms.push({"id": room.id, /*"объект-помещение": `${ item['$объект']['name']  }: №${ room['номер-название'] }, ${ room['этаж'] } эт., ${ room['площадь'] } м²`,*/ "_match": `${ item['$объект']['name']  } ${ room['номер-название'] } ${ room['этаж'] } ${ room['площадь'] }`.toLowerCase(), /*"адрес": item['адрес'],*/ "$помещение": room, "$объект": item['$объект'],/*"$item": angular.copy(item),*/});
          });
        });
        //~ console.log("Дайте список объектов аренды", rentRoomsData);
        vm.Ready();
      });
    });
    //~ else  vm.Ready();
    
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
  $Компонент.template = $templateCache.get('аренда/договор/форма');
  $Компонент.components['v-contragent'] =  new $КомпонентКонтрагент();
  //~ $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());