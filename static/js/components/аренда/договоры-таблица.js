//~ import тест from '../тест2.js';
(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
let moduleName = "Аренда::Договоры::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
let module = angular.module(moduleName, [ 'Аренда::Договор::Форма', 'Компонент::Выбор объекта', 'Компонент::Выбор в списке',]);

module.factory('$КомпонентАрендаДоговорыТаблица', function($templateCache, $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */ $EventBus, Util, $Список, $КомпонентАрендаДоговорФорма, $КомпонентВыборОбъекта, $КомпонентВыборВСписке ) {// 

var projectList = new $Список(appRoutes.url_for('список проектов'));
projectList.Load();

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  
};
  
const util = {/*разное*/
IsEqualId(id){ return (id.id || id) == this.id; },
};/// конец util

const methods = {/*методы*/

Ready(){/// метод
  var vm = this;
  var loader = vm.ProjectData();
  $EventBus.$on('Дайте список проектов', function(cb){
    cb(loader);
  });
  return vm.LoadData().then(function(){
    vm.FilterData();
    vm.ready = true;
    $EventBus.$emit('$КомпонентАрендаДоговорыТаблица - готов');
    /*$EventBus.$emit('Дайте список объектов аренды', function(loader){/// один раз выполнится
      loader.then(function(data){
        //~ console.log("Объекты аренды", data);
        //~ vm.rentObjects.push(...data.map((it)=>{ return it['$объект']; }));
        vm.rentObjects.push(...data.map((it)=>{ return {"id": it['$объект'].id, "_match": it['$объект'].name, "$item":it['$объект']}; }));
      });
    });*/
    //~ console.log("ТЕСТ", тест);
  });
},

InitDatePicker(el){
  var vm = this;
  el.pickadate({// все настройки в файле русификации ru_RU.js
    monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
    format: 'mmmm yyyy',
    monthOnly: 'OK',// кнопка
    selectYears: true,
    hiddenName: false,///!
    onClose: function (context) {/*console.log("onSet", this.$node[0].name);*/ var s = this.component.item.select; s && vm.$set(vm, this.$node[0].name/*"payMonth"*/ , [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
  });//{closeOnSelect: true,}
  
},

ProjectData(){/// проекты - арендодатели
  var vm = this;
  return projectList.Load().then(function(){
    vm.projectData = projectList.Data();
    return vm.projectData;/// для промис
  });
},

LoadData(){
  var vm = this;
  
  return $http.post(appRoutes.urlFor('аренда/договоры/список'), {})
    .then(function(resp){
      vm.data.push(...resp.data);
      return vm.data;
    });
},

SelectContract(obj){
  this.selectedContract  = obj;
  this.$emit('select-object', obj);
},

SelectProjectFilter(proj){
  //~ console.log("SelectProject", arguments);
  this.filters['арендодатель'] = proj;
  this.FilterData();
  this.AllChbsChange(!!proj);
},

New(){
  this.newContract = {};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},

RoomMetr(room){
  return this.ParseNum(room['ставка']) || this.ParseNum(room['сумма'])/this.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : room.$помещение['площадь']));
},

RoomSum(room){
  return (this.ParseNum(room['сумма']) || this.ParseNum(room['ставка'])*this.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : room.$помещение['площадь'])))+this.ParseNum(room['сумма нал'] || 0);
},

RoomsSum(item){///итого за все помещения
  var vm = this;
  return ((item['@доп.соглашения'] ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения'] : item['@помещения']) || []).reduce(function(a, room){ return a + vm.RoomSum(room); }, 0);
},
RoomsSquare(item){///итого площадь все помещения
  var vm = this;
  return ((item['@доп.соглашения'] ? item['@доп.соглашения'][item['@доп.соглашения'].length-1]['@помещения'] : item['@помещения']) || []).reduce(function(a, room){ return a + vm.ParseNum(room['площадь'] || (room['площадь'] === 0 ? room['площадь'] : room.$помещение['площадь'])); }, 0.0);
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    var f = data.id && vm.data.find(util.IsEqualId, data);
    if (data['удалить']) {
      vm.data.removeOf(f);
      return vm.FilterData();
    }
    
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      if (data['копия/id']) f = vm.data.find(util.IsEqualId, {"id": data['копия/id']});
      if (f) {
        f._edit = undefined;
        //~ vm.data.splice(vm.data.indexOf(f), 0, data);
      } ///else 
      vm.data.unshift(data);
      //~ console.log("новый договор", data, f);
    }
    vm.FilterData();
    setTimeout(()=>{
      $(`#item-${ data.id }`, $(vm.$el)).get(0).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
    });
  }
},

Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},

AllChbsChange(val){
  var vm = this;
  if (typeof val == 'boolean') vm.allChbs = val;
  vm.data.map((item)=>{
    item['крыжик'] = undefined;
    
  });
  vm.filteredData.forEach((item)=>{
    item['крыжик'] =  !!vm.allChbs;
    //~ vm.$set(item, 'крыжик', !!vm.allChbs);
  });
  //~ console.log('AllChbsChange', val, vm.filteredData);
},

ChbChange(name){
  this.FilterData();
  this.AllChbsChange(!!this.filters[name]);
},

ClearDate(name, val){
  var vm = this;
  //~ vm.form[name] = val || null;
  vm[name]= val || null;
  vm.keys[name] = Math.random();//vm.idMaker.next().value;/// передернуть
  setTimeout(()=>{
    var el = $(`input[name="${ name }"]`, $(vm.$el));
    vm.InitDatePicker(el);
    //~ console.log("ClearDate", el);
  });
},

PrintPay(month, month2){/// счета и акты
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  //~ console.log("PrintPay", month);
  if (!month) return modal.modal('open');
  
  var ids = vm.data.filter((item)=>{ return !!item['крыжик']; }).map((item)=>{ return item.id; });
  //~ var obs = vm.rentObjects.filter((ob)=>{ return !!ob['крыжик печати']; }).map((ob)=>{ return ob['$объект'].id; });
  //~ if (!ids.length) return Materialize.toast("не указаны договоры", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  //~ if (!obs.length) return Materialize.toast("не указан объект", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  vm.httpProcess = true;
  //~ console.log("PrintPay", month, ids);
  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/счет#docx', '-'/*обязательно что-нибудь*/), {"месяц": month, "месяц2":month2, "договоры": ids, "присвоить номера": vm.payNums, "счет или акт": vm.radioSchetAkt, /*"объекты":obs*/}).then(function(resp){
    vm.httpProcess  = false;
    modal.modal('close');
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) window.location.href = appRoutes.urlFor('аренда/счет#docx', resp.data.docx);/// а это get-запрос
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

Reestr(month, month2){
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));

  //~ return $http.get(appRoutes.url_for('аренда/реестр актов.xlsx', month)).then(function(resp){
    //~ var copy = copyTextToClipboard(resp.data.join('\n'));
    //~ var success = function(msg){
      //~ Materialize.toast('Скопировано! ', 2000, 'blue-text text-darken-3 blue lighten-5 fw500 border animated zoomInUp fast');
    //~ };
    //~ setTimeout(function(){
      //~ if (copy.then) copy.then(success);
      //~ if (copy == 'success') success(copy);
      ///console.log('CopyQuestions', copy);
    //~ }, 10);
    
    //~ vm.UpdateClipboard(resp.data.join('\n'));
    
    //~ vm.clipBoard = resp.data.join('\n');
    //~ setTimeout(function(){
      //~ vm.CopyClipBoard();
    //~ });
  //~ });
  vm.httpProcess  = true;
  window.location.href = appRoutes.url_for('аренда/реестр актов.xlsx', month+(month2 ? ':'+month2 : ''));
  setTimeout(()=>{
    vm.httpProcess  = false;
    modal.modal('close');
  }, 2000);
  
},

//~ CopyClipBoard() {
  //~ var vm = this;
  //~ var textToCopy = vm.$el.getElementsByClassName('clipboard')[0];
  //~ var range = document.createRange();
  //~ range.selectNodeContents(textToCopy);
  //~ window.getSelection().addRange(range);
  //~ document.execCommand('copy');
//~ },

//~ UpdateClipboard(newClip) {
  //~ navigator.clipboard.writeText(newClip).then(function() {
    //~ /* clipboard successfully set */
    //~ Materialize.toast('Скопировано! ', 2000, 'blue-text text-darken-3 blue lighten-5 fw500 border animated zoomInUp fast');
  //~ }, function() {
    //~ /* clipboard write failed */
    //~ console.log('clipboard write failed', arguments);
  //~ });
//~ },

OnChangeFilter(event, ms){
  var vm = this;
  //~ console.log("OnKeyDownFilter", event.target.name, event.target.value);
  if (vm.filters.timeout) clearTimeout(vm.filters.timeout);
  vm.filters.timeout = setTimeout(() => {
    //~ vm.filters[event.target.name] = event.target.value;
    vm.FilterData();
  }, ms || 700);
  
},

FilterData(){
  var vm = this;
  //~ if (!vm.filters['арендаторы'].length) return vm.data;
  vm.archLen = 0;
  //~ vm.filteredData.length = 0;
  vm.filteredData = ///vm.filters['арендаторы'].length || (vm.filters['объект'] && vm.filters['объект'].id) /// || (vm.filters['архивные договоры'] !== undefined)
    vm.data.filter((item)=>{
      if (!item.hasOwnProperty('крыжик')) item['крыжик']  = undefined;/// доп реакт свойство
      item['архив'] = item.hasOwnProperty('архив') ? item['архив'] : !dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(item['дата расторжения'] || (item['продление срока'] ? new Date('2100-01-01') : item['дата2'])));
      if (item['архив']) vm.archLen += 1;
      const test = (vm.filters['архивные договоры'] ? item['архив'] : !item['архив'])
        && (vm.filters['арендодатель'] ? item['проект/id'] == vm.filters['арендодатель'].id : true)
        && (vm.filters['арендаторы'] ? item['$контрагент'].title.toLowerCase().indexOf(vm.filters['арендаторы'].toLowerCase()) >= 0 : true)
        && ( (vm.filters['объект'] && vm.filters['объект'].id && item['@помещения']) ? item['@помещения'][0].$объект.id == vm.filters['объект'].id : true);
      //~ console.log("filteredData", test);
      return test;
    });
   // : vm.data;
  
  //~ vm.AllChbsChange(true);
  return vm;
},

ClearFilter(name){
  var vm = this;
  vm.filters[name] = '';
  vm.FilterData();
},

SelectObjectFilter(data){
  //~ console.log("SelectObjectFilter", data);
  this.filters['объект'] = data;/// ? data.$item : {};
  this.FilterData();
  this.AllChbsChange(!!data);
},

ResizeObserver(){
  let vm = this;
  vm.resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      vm.elWidth = entry.target.clientWidth;
    }
  });
  vm.resizeObserver.observe(vm.$el);
},

}; ///конец methods

const computed = {
//~ IsChbs(){
  //~ console.log("IsChbs");
  //~ return this.data.some((item)=>{ return !!item['крыжик']; });
//~ },
FilteredDataLen(){
  return this.filteredData.length;
  
},

EditItemStyle(){
  if (this.elWidth < 1200) return {"width":'110%', "left":'-5%',};
  return {"width":'90%', "left":'5%',};
},

  
  /* computed */};

const  data = function(){
  //~ console.log("on data item", this.item);
  let vm = this;
  vm.data = [];
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    //~ "data": [],
    "filteredData":[],
    "newContract": undefined,
    "selectedContract": undefined,
    "allChbs": false, /// крыжик выбора всех договоров
    "payMonth":  new Date().toISOString().replace(/T.+/, ''),
    "payMonth2": undefined,
    "payNums": true, ///крыжик счета с номерами
    "radioSchetAkt": 'счет',/// или акт
    "filters": {"арендодатель": undefined, "арендаторы": '', "объект": {}, "архивные договоры": false,},
    //~ "rentObjects":[],
    "archLen":0, /// кол-во архивных договоров
    "clipBoard": undefined,
    "projectData":undefined,///арендодатели для компонетов
    "keys":{'payMonth2':Math.random()},
    "httpProcess": undefined,
    "elWidth": undefined,/// будет при resizeObserver
    };
  //);
};///конец data

const mounted = function(){
  //~ console.log('mounted', this);
  var vm = this;
  var $el = $(vm.$el);
  vm.Ready().then(function(){
    setTimeout(function(){
      $('.modal', $el).modal( );// Callback for Modal close} {"complete": vm.ModalComplete}
      vm.InitDatePicker($('.datepicker.pay-month', $el));
      vm.ResizeObserver();
    });
    
  });
};

const beforeDestroy = function(){
  this.resizeObserver.unobserve(this.$el);
  //~ console.log("beforeDestroy");
};

var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  mounted,
  beforeDestroy,
  components:{},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components['v-rent-contract-form'] =  new $КомпонентАрендаДоговорФорма();
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  //~ $Компонент.components['v-test'] = new Vue(тест);

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());