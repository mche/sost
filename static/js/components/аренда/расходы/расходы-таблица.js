(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаРасходыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Расходы::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Аренда::Расходы::Форма', 'Компонент::Выбор в списке', ]);

module.factory('$КомпонентАрендаРасходыТаблица', function($templateCache, $http, appRoutes,  /*$EventBus, Util,*/ $КомпонентАрендаРасходыФорма, $КомпонентВыборВСписке ) {// 

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
    //~ $EventBus.$emit('$КомпонентАрендаРасходыТаблица - готов');
    /*$EventBus.$emit('Дайте список объектов аренды', function(loader){/// один раз выполнится
      loader.then(function(data){
        vm.rentObjects.push(...data.map((it)=>{ return {"id": it['$объект'].id, "_match": it['$объект'].name, "$item":it['$объект']}; }));
      });
    });*/
  });
},

LoadData(){
  var vm = this;
  vm.data = [];
  vm.loading = true;
  //~ console.log("LoadData", vm.param);
  return $http.post(appRoutes.urlFor('аренда/расходы/список'), /*{"месяц": vm.payMonth,}*/ vm.param)
    .then(function(resp){
      vm.loading = false;
      vm.data.push(...resp.data);
      return vm.data;
    });
},


New(){
  this.newForm = {};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newForm) vm.newForm = undefined;
  if (data) {
    var f = vm.data.find(util.IsEqualId, data);
    if (data['удалить']) {
      vm.data.removeOf(f);
      return vm.FilterData();
    }
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, data);
    } else {/// новая
      vm.data.push(data);
    }
    vm.FilterData();
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
  return $http.post(appRoutes.urlFor('аренда/счет.docx'), {"месяц": month, "договоры": ids, "присвоить номера": vm.payNums, "счет или акт": vm.radioSchetAkt, /*"объекты":obs*/}).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) window.location.href = appRoutes.urlFor('аренда/счет/#docx', resp.data.docx);
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},

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
  vm.filteredData = [...vm.data];

  return vm;
},

ClearFilter(name){
  var vm = this;
  vm.filters[name] = '';
  vm.FilterData();
},

//~ SelectObjectFilter(data){
  //~ this.filters['объект'] = data ? data.$item : {};
  //~ this.FilterData();
//~ },

Test(param){
  //~ console.log("Test", this.param, param);
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
  //~ console.log("on data", this.param);
  let vm = this;
  vm.data = [];
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "loading": false,
    //~ "data": [],
    "filteredData":[],
    "allChbs": false, /// крыжик выбора всех договоров
    //~ "payMonth":  vm.param['месяц'] || new Date().toISOString().replace(/T.+/, ''),
    "newForm": undefined,
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
  $Компонент.template = $templateCache.get('аренда/расходы/таблица');
  $Компонент.components['v-form'] =  new $КомпонентАрендаРасходыФорма();
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());