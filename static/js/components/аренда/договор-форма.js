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
var module = angular.module(moduleName, ['Компонент::Контрагент', 'Контрагенты', 'EventBus', 'Компонент::Поиск в списке']);

const Factory = function($templateCache, $http, $timeout, appRoutes, $КомпонентКонтрагент, $Контрагенты, $EventBus, $КомпонентПоискВСписке) {// factory

let meth = {/*методы*/};

var rentRoomsData;///синглетон для данных объектов аренды
meth.Mounted = function(){
  var vm = this;
  vm.ContragentData().then(function(){
    if (!rentRoomsData) $EventBus.$emit('Дайте список объектов аренды', function(loader){/// один раз выполнится
      loader.then(function(data){
        rentRoomsData = [];
        data.map(function(item){
          item['@кабинеты'].map(function(room){
            rentRoomsData.push({"id": room.id, "объект-помещение": `${ item['адрес']  }: №${ room['номер-название'] }, ${ room['этаж'] } эт., ${ room['площадь'] } м²`, "_match": `${ item['адрес']  } ${ room['номер-название'] } ${ room['этаж'] } ${ room['площадь'] }`, /*"адрес": item['адрес'],*/ "помещение": room});
          });
        });
        //~ console.log("Дайте список объектов аренды", rentRoomsData);
        vm.Ready();
      });
    });
    else  vm.Ready();
    
  });
};

meth.Ready = function(){/// метод
  var vm = this;
  
  vm.rentRooms = rentRoomsData;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
    
    $('.datepicker', $(vm.$el)).pickadate({// все настройки в файле русификации ru_RU.js
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {var s = this.component.item.select; vm.$set(vm.form, 'дата', [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      });//{closeOnSelect: true,}
    
    $('.modal', $(vm.$el)).modal();
  });

};

$Контрагенты.Load();
meth.ContragentData = function(){
  var vm = this;
  return $Контрагенты.Load().then(function(){
    vm.contragentData = $Контрагенты.Data();
  });
};


meth.InitItem = function(item){/// обязательные реактивные поля
  item["дата"] = item["дата"] || (new Date).toISOString().replace(/T.+/, '');
  return item;
};

meth.Save = function(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить договор'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      vm.$emit('on-save', resp.data.success);
    });
};

meth.Valid = function(name){
  var vm = this;
  if (name == 'контрагент') return !!(vm.form['контрагент'].id || vm.form['контрагент'].title);
  else if (name) return !!vm.form[name];
  
  return vm.form['номер'] && vm.form['номер'].length
    && vm.form['дата'] && vm.form['контрагент'] && (vm.form['контрагент'].id || vm.form['контрагент'].title)
  ;
};

meth.CancelBtn = function(){
  this.$emit('on-save', this.item.id ? {"id": this.item.id} : undefined);
  
};

meth.SelectContragent = function(data){///из компонента
  var vm = this;
  console.log("SelectContragent", data);
  vm.form['контрагент'] = data;
};

const FilterRooms = function(item){
  return item._match.indexOf(this.match) !== -1;
};
const MapRoom = function(item){
  return item['объект-помещение'];
};
meth.MapSuggestRooms = function(items){
  var vm = this;
  vm.queryRooms = items;
  return vm.queryRooms.map(MapRoom);
};
meth.GetRoomsQuery = function(query, vmSuggest){
  var vm = this;
  if (query === null) return vm.MapSuggestRooms(vm.rentRooms);/// ToggleAll
  var rooms = vm.form['@помещения'];
  var room = vmSuggest.options.room;
  //~ var idx = rooms.indexOf(room);
  if (query == '') {
    //~ debugger;
    if (room.id) rooms.splice(rooms.indexOf(room), 1 /*{"объект-помещение": ''}*/);
    else room['объект-помещение'] = '';///rooms.splice(idx, 1, {"объект-помещение": '', "ставка": room['ставка']});
    //~ if (!vm.form['@помещения'].length) vm.form['@помещения'].push({"объект-помещение": ''});
    return null;
  }
  //~ debugger;
  if (room.id && room['объект-помещение'] != query)  room.id = undefined;
  room['объект-помещение'] = query;
  if (query.length < 2)  return null;
  return vm.MapSuggestRooms(vm.rentRooms.filter(FilterRooms, {"match":query}));  
};

meth.OnRoomSelect = function(val, idx, vmSuggest){
  var vm = this;
  var item = vm.queryRooms[idx];
  var rooms = vm.form['@помещения'];
  var room = vmSuggest.options.room;
  if ( room === rooms[rooms.length-1])  rooms.push({"объект-помещение": '', "_id": vm.idMaker.next().value});
  //~ rooms.splice(rooms.indexOf(room), 1, {"id": item['помещение'].id, "объект-помещение": val, "ставка": room['ставка'], });
  //~ room.id = item['помещение'].id;
  Object.assign(room, item['помещение']);
  room['объект-помещение'] = val;
};

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  "props": {
      "item": {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  "data"() {
    let vm = this;
    vm.idMaker = IdMaker();/// глобал
    var form = vm.InitItem(angular.copy(vm.item));
    if (!form['контрагент']) form['контрагент'] = {};
    if (!form['@помещения']) form['@помещения'] = [{"объект-помещение": '', "_id": vm.idMaker.next().value}];
    
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "cancelerHttp": undefined,
      "form": form,
      };
    //);
  },
  "methods": meth,
  /*"computed": {
    "edit": function(){
      return this.InitItem(angular.copy(this.item));
    }
  },*/
  //~ "created"() {  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Mounted();
  },
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('аренда/договор/форма');
  $Компонент.components['v-contragent'] =  new $КомпонентКонтрагент();
  $Компонент.components['v-suggest'] = new $КомпонентПоискВСписке();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаДоговорФорма', Factory);

}());