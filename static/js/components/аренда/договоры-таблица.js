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
var module = angular.module(moduleName, [ 'Аренда::Договор::Форма' ]);

module.factory('$КомпонентАрендаДоговорыТаблица', function($templateCache, $http, appRoutes, /*$timeout, $rootScope, /**$compile, , */ $EventBus, Util, $КомпонентАрендаДоговорФорма ) {// 

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
    vm.ready = true;
    $EventBus.$emit('$КомпонентАрендаДоговорыТаблица - готов');
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
  return this.ParseNum(room['ставка']) || this.ParseNum(room['сумма'])/this.ParseNum(room.$помещение['площадь']);
},

RoomSum(room){
  return this.ParseNum(room['сумма']) || this.ParseNum(room['ставка'])*this.ParseNum(room.$помещение['площадь']);
},

RoomsSum(item){///итого за все помещения
  var vm = this;
  return item['@помещения'].reduce(function(a, room){ return a + vm.RoomSum(room); }, 0);
},
RoomsSquare(item){///итого площадь все помещения
  var vm = this;
  return item['@помещения'].reduce(function(a, room){ return a + vm.ParseNum(room.$помещение['площадь']); }, 0.0);
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newContract) vm.newContract = undefined;
  if (data) {
    var f = vm.data.find(util.IsEqualId, data);
    if (data['удалить']) return vm.data.removeOf(f);
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.data.push(data);
    }
  }
},

Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},

AllChbsChange(val){
  var vm = this;
  if (typeof val == 'boolean') vm.allChbs = val;
  vm.data.map((item)=>{ item['крыжик'] =  vm.allChbs; });
},

PrintPay(month){
  var vm = this;
  var modal = $('#modal-pay', $(vm.$el));
  if (!month) return modal.modal('open');
  modal.modal('close');
  var ids = vm.data.filter((item)=>{ return !!item['крыжик']; }).map((item)=>{ return item.id; });
  //~ console.log("PrintPay", month, ids);
  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/счет.docx'), {"месяц": month, "договоры": ids}).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) window.location.href = appRoutes.urlFor('аренда/счет/#docx', resp.data.docx);
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

}; ///конец methods

const computed = {
//~ IsChbs(){
  //~ console.log("IsChbs");
  //~ return this.data.some((item)=>{ return !!item['крыжик']; });
//~ },
  
  
  /* computed */};

const  data = function(){
  //~ console.log("on data item", this.item);
  let vm = this;
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "data": [],
    "newContract": undefined,
    "selectedContract": undefined,
    "allChbs": false,
    "payMonth":  new Date().toISOString().replace(/T.+/, ''),
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
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/договоры/таблица');
  $Компонент.components = {'v-rent-contract-form': new $КомпонентАрендаДоговорФорма(), };

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());