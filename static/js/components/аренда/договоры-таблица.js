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
var moduleName = "Аренда::Договоры::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Аренда::Договор::Форма', 'Компонент::Выбор объекта', ]);

module.factory('$КомпонентАрендаДоговорыТаблица', function($templateCache, $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */ $EventBus, Util, $КомпонентАрендаДоговорФорма, $КомпонентВыборОбъекта ) {// 

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

New(){
  this.newContract = {};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},

RoomMetr(room){
  return this.ParseNum(room['ставка']) || this.ParseNum(room['сумма'])/this.ParseNum(room['площадь'] || room.$помещение['площадь']);
},

RoomSum(room){
  return (this.ParseNum(room['сумма']) || this.ParseNum(room['ставка'])*this.ParseNum(room['площадь'] || room.$помещение['площадь']))+this.ParseNum(room['сумма нал'] || 0);
},

RoomsSum(item){///итого за все помещения
  var vm = this;
  return (item['@помещения'] || []).reduce(function(a, room){ return a + vm.RoomSum(room); }, 0);
},
RoomsSquare(item){///итого площадь все помещения
  var vm = this;
  return (item['@помещения'] || []).reduce(function(a, room){ return a + vm.ParseNum(room['площадь'] || room.$помещение['площадь']); }, 0.0);
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    
    if (data['удалить']) {
      vm.data.removeOf(f);
      return vm.FilterData();
    }
    var f = data.id && vm.data.find(util.IsEqualId, data);
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
      $(`#item-${ data.id }`, $(vm.$el)).get(0).scrollIntoView();
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
  vm.filteredData.map((item)=>{
    item['крыжик'] =  !!vm.allChbs;
  });
},

ChbChange(name){
  this.FilterData();
  
},

PrintPay(month){
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  if (!month) return modal.modal('open');
  
  var ids = vm.data.filter((item)=>{ return !!item['крыжик']; }).map((item)=>{ return item.id; });
  //~ var obs = vm.rentObjects.filter((ob)=>{ return !!ob['крыжик печати']; }).map((ob)=>{ return ob['$объект'].id; });
  if (!ids.length) return Materialize.toast("не указаны договоры", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  //~ if (!obs.length) return Materialize.toast("не указан объект", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  modal.modal('close');
  //~ console.log("PrintPay", month, ids);
  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/счет#docx', '-'/*обязательно что-нибудь*/), {"месяц": month, "договоры": ids, "присвоить номера": vm.payNums, "счет или акт": vm.radioSchetAkt, /*"объекты":obs*/}).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) window.location.href = appRoutes.urlFor('аренда/счет#docx', resp.data.docx);
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

Reestr(month){
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
  window.location.href = appRoutes.url_for('аренда/реестр актов.xlsx', month);
  modal.modal('close');
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

OnChangeFilter(event){
  var vm = this;
  //~ console.log("OnKeyDownFilter", event.target.name, event.target.value);
  if (vm.filters.timeout) clearTimeout(vm.filters.timeout);
  vm.filters.timeout = setTimeout(() => {
    //~ vm.filters[event.target.name] = event.target.value;
    vm.FilterData();
  }, 700);
  
},

FilterData(){
  var vm = this;
  //~ if (!vm.filters['арендаторы'].length) return vm.data;
  vm.archLen = 0;
  //~ vm.filteredData.length = 0;
  vm.filteredData = ///vm.filters['арендаторы'].length || (vm.filters['объект'] && vm.filters['объект'].id) /// || (vm.filters['архивные договоры'] !== undefined)
    vm.data.filter((item)=>{
      
      const cur = dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(item['дата расторжения'] || item['дата2']));
      if (!cur) vm.archLen += 1;
      const test = (vm.filters['архивные договоры'] ? !cur : cur)
        && (vm.filters['арендаторы'] ? item['$контрагент'].title.toLowerCase().indexOf(vm.filters['арендаторы'].toLowerCase()) >= 0 : true)
        && ( (vm.filters['объект'] && vm.filters['объект'].id && item['@помещения']) ? item['@помещения'][0].$объект.id == vm.filters['объект'].id : true);
      //~ console.log("filteredData", test);
      return test;
    });
   // : vm.data;
  
  vm.AllChbsChange();
  return vm;
},

ClearFilter(name){
  var vm = this;
  vm.filters[name] = '';
  vm.FilterData();
},

SelectObjectFilter(data){
  console.log("SelectObjectFilter", data);
  this.filters['объект'] = data;/// ? data.$item : {};
  this.FilterData();
},


}; ///конец methods

const computed = {
//~ IsChbs(){
  //~ console.log("IsChbs");
  //~ return this.data.some((item)=>{ return !!item['крыжик']; });
//~ },
FilteredDataLen(){
  return this.filteredData.length;
  
}
  
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
    "payNums": false, ///крыжик счета с номерами
    "radioSchetAkt": 'счет',/// или акт
    "filters": {"арендаторы": '', "объект": {}, "архивные договоры": false,},
    //~ "rentObjects":[],
    "archLen":0, /// кол-во архивных договоров
    "clipBoard": undefined,
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
      
      $('.datepicker.pay-month', $el).pickadate({// все настройки в файле русификации ru_RU.js
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm yyyy',
        monthOnly: 'OK',// кнопка
        selectYears: true,
        onSet: function (context) {var s = this.component.item.select; vm.$set(vm, "payMonth" , [s.year, s.month+1, s.date].join('-')); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
      });//{closeOnSelect: true,}
    });
    
  });
};

var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  mounted,
  components:{},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components['v-rent-contract-form'] =  new $КомпонентАрендаДоговорФорма();
  $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());