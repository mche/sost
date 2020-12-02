//~ import тест from '../тест.js';
//~ import uploader from 'vue-simple-uploader';

//~ import Vue from 'vue';
//~ import VCalendar from 'v-calendar';
//~ import  VCalendar from '../../../lib/v-calendar/src/components/Calendar.vue'

//~ require('../../util/array-removeOf.js');

//~ console.log(VCalendar);

//~ // Use v-calendar & v-date-picker components
//~ Vue.use(VCalendar, {
  //~ componentPrefix: 'vc',  // Use <vc-calendar /> instead of <v-calendar />
  //~ ...,                // ...other defaults
//~ });



!(function () {'use strict';
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

//~ const store = new Vuex.Store({
  //~ state: {
    //~ count: 0,
  //~ },
  //~ mutations: {
    //~ increment() {
      //~ this.state.count++;
    //~ }
  //~ },
//~ });

//~ const store = new Vue({
  //~ "props":{
      //~ "prop1":{
          //~ "type":Number,
          //~ "default": ()=>5,
        //~ },
    //~ },
  //~ "methods":{
    //~ Meth1(){
      //~ console.log("Meth1", this.prop1);
    //~ },
    //~ Inc1(){
      //~ this.prop1++;
      
    //~ },
    
  //~ },
  
//~ });

module
.factory('$КомпонентАрендаДоговорФорма', function($templateCache, $http, $q, $timeout, appRoutes, $КомпонентКонтрагент, $Контрагенты, $EventBus, /*$КомпонентПоискВСписке,*/ $КомпонентВыборВСписке, Util, $Список, $КомпонентАрендаДоговорПомещенияФорма, $КомпонентФайлы /*$Uploader*/) {// factory

//~ var rentRoomsData;///синглетон для данных объектов аренды
$Контрагенты.Load();
//~ var projectList = new $Список(appRoutes.url_for('список проектов'));
//~ projectList.Load();

const props = {
  //~ "store":{
      //~ "type": Object,
      //~ "default": ()=>store,
    //~ },
  "item": {
    type: Object,
    default:  () => {
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
    
    vm.InitDatePicker($('.datepicker', $(vm.$el)));
    vm.InitMonthPickerDiscount($('.month-picker-discount', $(vm.$el)));
    
    $('.modal', $(vm.$el)).modal();
    setTimeout(()=>{
      vm.$el.scrollIntoView({ "block": 'start', "behavior": 'smooth', });////behavior: 'instant', block: 'center'
      let t = vm.Valid;
    }, 700);
    //~ console.log("ТЕСТ", тест);
    
  });

},

InitDatePicker(el, param, setCallback){
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

InitMonthPickerDiscount(el, param, setCallback){/// для скидок
  var vm = this;
  el.pickadate(Object.assign({// все настройки в файле русификации ru_RU.js
    monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
    format: 'mmmm yyyy',
    monthOnly: 'OK',// кнопка
    selectYears: true,
    "onSet": function (context) {
      var s = this.component.item.select;
      if (!s) return;
      //~ console.log("onSet", this.$node[0]);
      //~ if (setCallback) return setCallback([s.year, s.month+1, s.date].join('-'));
      vm.$set(vm.form['@скидки'][this.$node[0].getAttribute('data-idx')], 'месяц' , [s.year, s.month+1, s.date].join('-'));
    },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  }, param || {}));//{closeOnSelect: true,}
  
},

ProjectData(){/// проекты - арендодатели
  var vm = this;
  //~ return projectList.Load().then(function(){
    //~ vm.projectData = projectList.Data();
  //~ });
  return new Promise(function(resolve, reject){
    $EventBus.$emit('Дайте список проектов', function(loader){/// один раз выполнится
      loader.then(function(data){
        vm.projectData = data;
        return resolve(true);
      }, function(err){ return reject(err); });
    });
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
  if (item['@доп.соглашения']) {
    item['@доп.соглашения'].push({});/// новое доп
    item['@доп.соглашения'].forEach((dop)=>{ dop._id = vm.idMaker.next().value; });///
  }
  if (/*item.id && */!item['@скидки']) item['@скидки'] = [];
  //~ item[''].forEach((dop)=>{ dop._id = vm.idMaker.next().value; });///
  //~ item['@скидки'].push({"дата1": (new Date).toISOString().replace(/T.+/, '')});
  return item;
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
  vm.form[name] = val || null;
  vm.keys[name] = vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    //~ if(val) vm.form[name] = val;
    vm.InitDatePicker(el);
    //~ console.log("ClearDate", el);
  });
},

Copy(){
  var vm = this;
  var copy = angular.copy(vm.form);
  copy['дата договора'] = undefined;
  copy['дата1'] = undefined;
  copy['дата2'] = undefined;
  copy['дата расторжения'] = undefined;
  var init = vm.InitForm(copy);///vm.form;
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
  init['@доп.соглашения'] = [];
  

  vm.form = init;
  
  vm.ClearDate('дата договора', init['дата договора']);
  vm.ClearDate('дата1', init['дата1']);
  vm.ClearDate('дата2', init['дата2']);
  vm.ClearDate('дата расторжения', init['дата расторжения']);
  vm.roomsTableIdx = undefined;/// передернуть таблицу помещений
  setTimeout(()=>vm.roomsTableIdx = 0);
  //~ vm.roomsTableIdx = 0;
},

CopyRoom(room){
  room.id = undefined;
  room._id=this.idMaker.next().value;
  room.uid = undefined;
  room.ts = undefined;
  room['договор/id'] = undefined;
  return room;
},


DopTable(dop){/// доп соглашения
  var vm = this;
  //~ if (!vm.form['@доп.соглашения']) vm.$set(vm.form, '@доп.соглашения', []);
  //~ if (!vm.form['@доп.соглашения'][idx-1]) vm.form['@доп.соглашения'][idx-1] = {
    //~ "_id": vm.idMaker.next().value,
  //~ };
  var idx = vm.form['@доп.соглашения'].indexOf(dop);
  if (!dop['@помещения']) 
    dop['@помещения'] = angular.copy(idx ? vm.form['@доп.соглашения'][idx-1]['@помещения'] : vm.form['@помещения']).map(vm.CopyRoom);
  if (vm.roomsTableIdx == idx+1) return;
  //~ vm.roomsTableIdx = undefined;
  //~ setTimeout(()=>{
    vm.roomsTableIdx = idx+1;
    vm.ClearDateDop('дата1', dop['дата1']);///, (new Date).toISOString().replace(/T.+/, '')
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
      vm.InitDatePicker(el, undefined, function(date){
        //~ vm.$set(vm.form['@доп.соглашения'][idx-1], name, undefined);
        //~ setTimeout(()=>{
        if (!vm.form['@доп.соглашения'][idx-1][name]) Materialize.toast('Новое доп соглашение', 3000, 'orange-text text-darken-3 orange lighten-4 fw500 border animated zoomInUp slow');
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
  //~
  //~ vm.form['@доп.соглашения'][idx]['@помещения'].length = 0;
  vm.form['@доп.соглашения'][idx]['@помещения'] = undefined;
  if (vm.form['@доп.соглашения'][idx].id) vm.form['@доп.соглашения'].splice(idx, 1);
  Materialize.toast('Доп соглашение будет удалено', 3000, 'green-text text-darken-3 orange lighten-4 fw500 border animated zoomInUp slow');
},

OnTableSum(sum){/// сумма безнал по таблице
  var vm = this;
  //~ console.log("OnTableSum", sum);
  if (sum['сумма'] == 0 || sum['сумма']) {
    if (this.roomsTableIdx == 0) this.form['сумма безнал'] = sum['сумма'];
    else this.form['@доп.соглашения'][this.roomsTableIdx-1]['сумма безнал'] = sum['сумма'];
  } else {
    if (this.roomsTableIdx == 0) this.form['сумма безнал'] = null;
    else  this.form['@доп.соглашения'][this.roomsTableIdx-1]['сумма безнал'] = null;
  }
  //~ let v = vm.Valid;
  //~ console.log("OnTableSum", sum, v);
  vm.tableSum =  vm.ParseNum(sum['сумма'] == 0 ? sum['сумма'] : sum['сумма'] || sum);///['сумма'];
  
},

OnRoomsChange(rooms){/// из компонента таблицы помещений
  //~ console.log("OnRoomsChange", rooms, this.roomsTableIdx-1);
  if (this.roomsTableIdx == 0) this.form['@помещения'] = [...rooms];
  else this.form['@доп.соглашения'][this.roomsTableIdx-1]['@помещения'] = [...rooms];
  this.valid = undefined;/// передернуть валидацию
  //~ this.ValidDop();
},

ParseNum(num){
  return parseFloat(Util.numeric(num));
},

RemoveBtn(confirm){
  var vm = this;
  var modal = $('#modal-remove', $(vm.$el));
  //~ console.log("PrintPay", month);
  if (!confirm) return modal.modal('open');
  return $http.post(appRoutes.urlFor('аренда/удалить договор'), {"id": vm.form.id})
    .then(function(resp){
      if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
      if (resp.data.remove) {
        resp.data.remove['удалить'] = true;
        vm.$emit('on-save', resp.data.remove);
        Materialize.toast('Договор удален', 3000, 'green-text text-darken-3 green lighten-3 border fw500  animated zoomInUp');
      }
  });
},

AddDiscount(){///добавить скидку
  var vm = this;
  vm.form['@скидки'].push({"месяц": (new Date).toISOString().replace(/T.+/, '')});
  let idx = vm.form['@скидки'].length - 1;
  setTimeout(()=>{
    //~ console.log("AddDiscount", $('.month-picker-discount', $(vm.$el)).eq(idx));
    vm.InitMonthPickerDiscount($('.month-picker-discount', $(vm.$el)).eq(idx));
    
  });
  //~ vm.InitMonthPickerDiscount($('.month-picker-discount', $(vm.$el)));
},

MoneyXLS(){/// выписка по арендатору
  var vm = this;
  //~ var modal = $('#modal-pay', $(vm.$el));
  //~ if (!month) return modal.modal('open');
  
  vm.httpProcess = true;
  /// вернет урл для GET-запроса
  return $http.post(appRoutes.urlFor('аренда/движение по арендатору#xlsx', '-'/*обязательно что-нибудь для POST*/), {"арендодатель": vm.form['$проект'].id, "арендатор": vm.form['контрагент'].id,}).then(function(resp){
    vm.httpProcess  = false;
    //~ modal.modal('close');
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.xlsx) window.location.href = appRoutes.urlFor('аренда/движение по арендатору#xlsx', resp.data.xlsx);/// а это get-запрос
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

ValidDop(){
  //~ if (idx !== undefined) return !this.form['@доп.соглашения'] || (!this.form['@доп.соглашения'][idx]['дата1'] || (!this.form['@доп.соглашения'][idx]['@помещения'] || this.form['@доп.соглашения'][idx]['@помещения'].length > 1));
  return !this.form['@доп.соглашения'] || this.form['@доп.соглашения'].every(dop=>{return !dop['дата1'] || (!dop['@помещения'] || dop['@помещения'].length > 1 || !!dop['@помещения'][0]['помещение/id']); });
},


}; /// конец methods

const computed = {

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
    && vm.form['@помещения'].length > 1
    && (!this.form['@доп.соглашения'] || this.form['@доп.соглашения'].every(dop=>{return !dop['дата1'] || (!dop['@помещения'] || dop['@помещения'].length > 1 || !!dop['@помещения'][0]['помещение/id']); }))
    //~ && vm.ValidDop()
    //~ && this.ValidRooms()

  ;
    this.valid = this.valid === undefined ? test : test;
  //~ console.log("Valid", this.form['@доп.соглашения'] );
  return this.valid;
},

ValidRooms(){
  return this.form['@помещения'].length > 1 /*&& this.*/;
  //~ && vm.form['@помещения'].slice(0, -1).every(function(room){ return !!room['помещение/id'] && !!(room['ставка'] || room['сумма']); })
},
  
TotalSum(){
  var vm = this;
  //~ if (!vm.tableSum) return;
  if (vm.roomsTableIdx == 0 && vm.form['сумма нал'])  return vm.ParseNum(vm.form['сумма нал'] || 0) + vm.tableSum;
  if (vm.roomsTableIdx > 0 && vm.form['@доп.соглашения'][vm.roomsTableIdx-1]['сумма нал'] ) return vm.ParseNum(vm.form['@доп.соглашения'][vm.roomsTableIdx-1]['сумма нал'] || 0) + vm.tableSum;
  return vm.tableSum;
},

IsOld(){
  var vm = this;
  return !dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(vm.form['дата расторжения'] || (vm.form['продление срока'] ? '2100-01-01' : vm.form['дата2'])));
},
//~ Count(){
  //~ return store.prop1;
  
//~ },
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
  vm.dateFns = dateFns;
  //~ if (form.id) vm.Uploads(form.id);

  return {//
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "keys": {"дата расторжения": vm.idMaker.next().value, "дата договора":vm.idMaker.next().value, "дата1":vm.idMaker.next().value, "дата2":vm.idMaker.next().value,}, ///передерг рендер
    "roomsTableIdx": 0, /// отображение таблицы арендуемых помещений (0 - основной договор, 1,2,... - доп соглашениия)
    "tableSum": 0, /// общая сумма по таблице и наличке
    "projectData": undefined,
    "httpProcess": undefined,
    "valid":undefined,
    //~ "uploads": [],
  };
  //);
};///конец data

const mounted = function(){
  //~ this.$nextTick(() => {
    //~ window.uploader = this.$refs.uploader.uploader;
  //~ });
  //~ console.log('MOUNTED');
  var vm = this;
  $q.all([vm.ContragentData(), vm.ProjectData(), /*vm.ObjectData(),*/]).then(function(){
    vm.Ready();
  });
  //~ this.$store.commit('increment');
  //~ store.Inc1();

};/// конец mounted



var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  //~ store,
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
  //~ $Компонент.components['v-calendar'] = VCalendar;
  //~ $Компонент.components['v-uploader'] = uploader;
  //~ $Компонент.components['v-uploader'] = new $Uploader();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/


}());