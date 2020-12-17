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
var module = angular.module(moduleName, ['EventBus', 'Аренда::Расходы::Форма', 'UploaderCommon', /*'Компонент::Выбор в списке', 'Компонент::Выбор объекта',*/ ]);

module.factory('$КомпонентАрендаРасходыТаблица', function($templateCache, $http, appRoutes, Util,  /*$EventBus,$Список, */ $КомпонентАрендаРасходыФорма, /*$КомпонентАрендаДоговорыВыбор, $КомпонентВыборОбъекта*/  $UploaderViewIframeMixins ) {// 



const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  
};
  
const util = {/*разное*/
  IsEqualId(id){ return (id.id || id) == this/*.id*/; },
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

TotalSum(row){
  var vm = this;
  var s = row['@позиции'].reduce(function(a, pos){
    //~ if (!pos || !pos['сумма'] || !pos['сумма2']) return a;
    return a + vm.ParseNum(pos['сумма'] || pos['сумма2']);///+vm.ParseNum();
  }, 0);
  return s;
},

/**ContragentContractData(){
  var vm = this;
  return vm.contragentContracts || $http.post(appRoutes.urlFor('аренда/договоры/список'), {"договоры на дату": vm.form['дата'], "order_by": " order by  lower(regexp_replace(k.title, '^\W', '', 'g')) "}).then(function(resp){
     resp.data.map(function(item){
      item._match = `${ item['$контрагент']['title']  } ${ item.$контрагент['реквизиты'] && item.$контрагент['реквизиты']['ИНН'] } ${  item['@помещения'] && item['@помещения'][0]['$объект'].name } ${ item['дата1'] } ${ item['номер'] }`.toLowerCase();
     /// , "адрес": item['адрес'], "$помещение": room, "$объект": item['$объект'],});
      ///${ item['@помещения'].map(p=>{ return p['$помещение']['номер-название']; }).join(':') } 
      return item;
    });
  });
},***/

New(){
  this.newForm = {"договор/id": this.param['договор'].id};
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},


OnSave(data){ ///  из события сохранения формы
  var vm = this;
  if (vm.newForm) vm.newForm = undefined;
  if (data) {
    data._edit = undefined;
    var f = vm.data.find(util.IsEqualId, data.id);
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
    
    //~ if (!data['копия/id']) 
    if (data['копия/id']) {
      f = vm.data.find(util.IsEqualId, data['копия/id']);
      if (f) f._edit = undefined;
    }
    vm.FilterData();
  }
},

Edit(item){
  this.$set(item, '_edit', angular.copy(item));
},

AllChbsChange(val){
  var vm = this;
  if (typeof val == 'boolean') vm.form['все крыжики'] = val;
  
  /*if (val != 'оставить крыжики')*/
  vm.data.map((item)=>{
    item['крыжик'] = undefined;
    
  });
  vm.filteredData.map((item)=>{
    item['крыжик'] =  !!vm.form['все крыжики'];
  });
  this.CheckedData();
},

ChbChange(name){
  //~ this.FilterData();
  setTimeout(()=>this.CheckedData());
  
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
  vm.filteredData = /// [...vm.data];
    vm.data.filter((item)=>{
      
      //~ const cur = dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(item['дата расторжения'] || item['дата2']));
      //~ if (!cur) vm.archLen += 1;
      const test = ///(vm.filters['архивные договоры'] ? !cur : cur)
        (vm.filters['арендаторы'] ? item['$контрагент'].title.toLowerCase().indexOf(vm.filters['арендаторы'].toLowerCase()) >= 0 : true)
        && ( (vm.filters['объект'] && vm.filters['объект'].id) ? item.$объект.id == vm.filters['объект'].id : true);
      //~ console.log("filteredData", vm.filters['объект'], item.$объект);
      return test;
    });
    
  vm.AllChbsChange();
  return vm;
},

CheckedData(){
  this.checkedData = this.data.filter((item)=>{ return !!item['крыжик']; });
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

Print(){
  var vm = this;
  //~ var modal = $('#modal-print', $(vm.$el));
  //~ if (!month) return modal.modal('open');
  //~ if (param) Object.assign(vm.param, param);
  
  vm.param['аренда/расходы/id'] = vm.checkedData.map((item)=>{ return item.id; });
  //~ var obs = vm.rentObjects.filter((ob)=>{ return !!ob['крыжик печати']; }).map((ob)=>{ return ob['$объект'].id; });
  //~ if (!ids.length) return Materialize.toast("не указаны", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  //~ if (!obs.length) return Materialize.toast("не указан объект", 3000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
  //~ modal.modal('close');

  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/расходы#docx', '-'/*обязательно что-нибудь*/), Object.assign({}, vm.param, vm.form)).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) {
      let url = appRoutes.urlFor('аренда/расходы#docx', resp.data.docx);
      //~ console.log("Print", vm.form['pdf формат'], url);
      if (vm.form['pdf формат']) return vm.ViewIframe({"src": url+'?inline=1', "content_type":'application/pdf' });
      window.location.href = url;
    }
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},


}; ///конец methods

const computed = {
//~ Chbs(){
  //~ console.log("IsChbs");
  //~ ///return this.data.some((item)=>{ return !!item['крыжик']; });
  //~ return /*vm.filteredData*/ this.filteredData.filter((item)=>{ return !!item['крыжик']; });
//~ },
FilteredDataLen(){
  return this.filteredData.length;
},
//~ FilteredDataChbsLen(){
  //~ return this.filteredData.filter((item)=>{ return !!item['крыжик']; }).length;
//~ },
  
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
    "form": vm.param,
    //~ "data": [],
    "filteredData":[],
    "checkedData":[],/// с крыжиками
    "filters": {"арендаторы": '', "объект": {},},
    //~ "allChbs": false, /// крыжик выбора всех договоров
    //~ "payMonth":  vm.param['месяц'] || new Date().toISOString().replace(/T.+/, ''),
    "newForm": undefined,
    "rentObjects":[],
    "iframeFile": undefined,
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
  mixins: [$UploaderViewIframeMixins,],
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
  //~ $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();
  //~ $Компонент.components['v-contract-select'] = new $КомпонентАрендаДоговорыВыбор();

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());