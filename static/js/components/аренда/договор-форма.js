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
var module = angular.module(moduleName, ['Компонент::Контрагент', 'Контрагенты', 'EventBus',/* 'Компонент::Поиск в списке',*/ 'Компонент::Выбор в списке', 'Аренда::Договор::Помещения::Форма', 'Uploader::Файлы', /*'Uploader'*/]);

module
.factory('$КомпонентАрендаДоговорФорма', function($templateCache, $http, $q, $timeout, appRoutes, $КомпонентКонтрагент, $Контрагенты, $EventBus, /*$КомпонентПоискВСписке,*/ $КомпонентВыборВСписке, Util, $Список, $КомпонентАрендаДоговорПомещенияФорма, $КомпонентФайлы /*$Uploader*/) {// factory

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

InitDatepicker(el, param, setCallback){
  var vm = this;
  el.pickadate(Object.assign({// все настройки в файле русификации ru_RU.js
    //~ "clear": 'Очистить',
    "formatSkipYear": false,// доп костыль - дописывать год при установке
    //~ "clear":'Очистить',
    //~ "closeOnClear": true,
    "onSet": function (context) {
      var s = this.component.item.select;
      if (!s) return;
      if (setCallback) return setCallback([s.year, s.month+1, s.date].join('-'));
      vm.$set(vm.form, this._hidden.name , [s.year, s.month+1, s.date].join('-'));
    },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  }, param || {}));//{closeOnSelect: true,}
  
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
  //~ item['@помещения'].map(util.MapItemRooms, vm);
  item._uploads = [];
  item._id = vm.idMaker.next().value;
  if (item.id && !item['@доп.соглашения']) item['@доп.соглашения'] = [];
  if (item['@доп.соглашения']) item['@доп.соглашения'].push({"_id":vm.idMaker.next().value});
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
    //~ && vm.form['@помещения'].slice(0, -1).every(function(room){ return !!room['помещение/id'] && !!(room['ставка'] || room['сумма']); })
  ;
  //~ console.log("Valid", test);
  return test;
},

Save(){
  var vm = this;
  
  //~ return console.log("Save", JSON.stringify(vm.form['@доп.соглашения']));
  //~ vm.form['контрагент']['реквизиты'] = JSON.stringify({"ИНН": vm.form['контрагент/ИНН'], "юр. адрес": vm.form['контрагент/юр. адрес']});
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('аренда/сохранить договор'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      if (vm.form['копия/id']) resp.data.success['копия/id'] = vm.form['копия/id'];
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

ClearDate(name, val){
  var vm = this;
  vm.form[name] = val;
  vm.keys[name] = vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    //~ if(val) vm.form[name] = val;
    vm.f(el);
    //~ console.log("ClearDate", el);
  });
},

Copy(){
  var vm = this;
  var init = vm.InitForm(angular.copy(vm.form));///vm.form;
  //~ debugger;
  init.id = undefined;
  init.uid = undefined;
  init.ts = undefined;
  init['номер'] = undefined;
  init['коммент'] = undefined;
  init['копия/id'] = vm.form.id;
  init['предоплата'] = false;
  init['договор/id'] = undefined;
  init['@помещения/id'] = undefined;
  init['@помещения'].forEach(vm.CopyRoom);

  vm.form = init;
  
  vm.ClearDate('дата договора', init['дата договора']);
  vm.ClearDate('дата1', init['дата1']);
  vm.ClearDate('дата2', init['дата2']);
  vm.ClearDate('дата расторжения', init['дата расторжения']);
},

CopyRoom(room){
  room.id = undefined;
  room._id=this.idMaker.next().value;
  room.uid = undefined;
  room.ts = undefined;
  room['договор/id'] = undefined;
  return room;
},


DopTable(idx){/// доп соглашения
  var vm = this;
  //~ if (!vm.form['@доп.соглашения']) vm.$set(vm.form, '@доп.соглашения', []);
  if (!vm.form['@доп.соглашения'][idx-1]) vm.form['@доп.соглашения'][idx-1] = {
    "_id": vm.idMaker.next().value,
  };
  if (!vm.form['@доп.соглашения'][idx-1]['@помещения']) 
    vm.form['@доп.соглашения'][idx-1]['@помещения'] = angular.copy(vm.form['@помещения']).map(vm.CopyRoom);
  if (vm.roomsTableIdx == idx) return;
  //~ vm.roomsTableIdx = undefined;
  //~ setTimeout(()=>{
    vm.roomsTableIdx = idx;
    vm.ClearDateDop('дата1', vm.form['@доп.соглашения'][idx-1]['дата1']);///, (new Date).toISOString().replace(/T.+/, '')
  //~ });
  
},

ClearDateDop(name, val){
  var vm = this;
  var idx = vm.roomsTableIdx;
  //~ vm.keys[`${ name } доп соглашения ${ idx }`] = undefined;
  vm.$set(vm.form['@доп.соглашения'][idx-1], name, val);
  //~ console.log("ClearDateDop", vm.form['@доп.соглашения'][idx-1]);
  //~ setTimeout(()=>{
    //~ vm.keys[`${ name } доп соглашения ${ idx }`] = vm.idMaker.next().value;
    setTimeout(()=>{
      var el = $(`input[name="${ name } доп соглашения ${ idx }"]`, $(vm.$el));
      //~ console.log("ClearDateDop", el);
      vm.InitDatepicker(el, undefined, function(date){
        //~ vm.$set(vm.form['@доп.соглашения'][idx-1], name, undefined);
        //~ setTimeout(()=>{
        if (!vm.form['@доп.соглашения'][idx-1][name]) Materialize.toast('Новое доп соглашение', 3000, 'green-text text-darken-3 green lighten-4 fw500 border animated zoomInUp slow');
        var foo = vm.form['предоплата'];/// тупой передерг
        vm.form['предоплата'] = undefined;
          vm.$set(vm.form['@доп.соглашения'][idx-1], name, dateFns.format(new Date(date), 'YYYY-MM-DD'));////new Date('2020-4-20').toISOString() ---  хрень
          vm.form['предоплата'] = foo;
        //~ });
        //~ console.log("setCallback", vm.form['@доп.соглашения'][idx-1][name]);
      });
    });
    
  //~ });
  
},

RemoveDop(idx){///удалить доп соглашение
  var vm = this;
  vm.ClearDateDop('дата1');
  vm.roomsTableIdx -= 1;
  //~ vm.form['@доп.соглашения'].splice(idx, 1);
  //~ vm.form['@доп.соглашения'][idx]['@помещения'].length = 0;
  vm.form['@доп.соглашения'][idx]['@помещения'] = undefined;
  Materialize.toast('Доп соглашение будет удалено', 3000, 'green-text text-darken-3 orange lighten-4 fw500 border animated zoomInUp slow');
},

OnTableSum(sum){/// сумма по таблице
  var vm = this;
  //~ console.log("OnTableSum", vm.form['@помещения'] === propRooms);
  vm.tableSum =  sum;
  
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},

}; /// конец methods

const computed = {

TotalSum(){
  var vm = this;
  //~ if (!vm.tableSum) return;
  if (vm.roomsTableIdx == 0 && vm.form['сумма нал'])  return vm.ParseNum(vm.form['сумма нал'] || 0) + vm.tableSum;
  if (vm.roomsTableIdx > 0 && vm.form['@доп.соглашения'][vm.roomsTableIdx-1]['сумма нал'] ) return vm.ParseNum(vm.form['@доп.соглашения'][vm.roomsTableIdx-1]['сумма нал'] || 0) + vm.tableSum;
  return vm.tableSum;
}
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
    "keys": {"дата расторжения": vm.idMaker.next().value, "дата договора":vm.idMaker.next().value, "дата1":vm.idMaker.next().value, "дата2":vm.idMaker.next().value,}, ///передерг рендер
    "roomsTableIdx": 0, /// отображение таблицы арендуемых помещений (0 - основной договор, 1,2,... - доп соглашениия)
    "tableSum": 0, /// общая сумма по таблице и наличке
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
  $Компонент.components['contract-rooms'] = new $КомпонентАрендаДоговорПомещенияФорма();
  $Компонент.components['v-uploads'] = new $КомпонентФайлы();
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());