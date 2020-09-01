(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $Компонент...({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Акты::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  /*'Аренда::Акты::Форма','Компонент::Выбор в списке','Компонент::Выбор объекта',*/ ]);

module.factory('$КомпонентАрендаАктыТаблица', function($templateCache, $http, appRoutes,  /*$EventBus, Util,*//*$КомпонентВыборВСписке,$КомпонентВыборОбъекта*/  ) {// 

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
  return vm.LoadData().then(()=>{
    //~ vm.FilterData();
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
  return $http.post(appRoutes.urlFor('аренда/акты/список'), /*{"месяц": vm.payMonth,}*/ vm.param)
    .then(function(resp){
      vm.data.push(...resp.data);
      return vm.data;
    });
},

Save(item){
  //~ console.log("CheckBox", item);
  let vm = this;
  this.$set(item, '_saving', $http.post(appRoutes.urlFor('аренда/акты/сохранить подписание'), {"акт/id":item['$акты/аренда'].id})
    .then(resp => {
      vm.$delete(item, '_saving');
      if (resp.data.success) vm.$set(item, '$акты/аренда', resp.data.success);
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
    },
    resp => {
      vm.$delete(item, '_saving');
      Materialize.toast("Ошибка сохранения "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
    )
  );
  
},


ParseNum(num){
  return parseFloat(Util.numeric(num));
},



OnChangeFilter(event){
  var vm = this;
  if (vm.filters.timeout) clearTimeout(vm.filters.timeout);
  vm.filters.timeout = setTimeout(() => {
    vm.FilterData();
  }, 700);
  
},

FilterData(item){
  var vm = this;
  //~ vm.filteredData = /// [...vm.data];
    //~ vm.data.filter((item)=>{
      item._id = item._id || vm.idMaker.next().value;
  //~ item['крыжик'] =  : undefined;
  if (item['$акты/аренда'] && !!item['$акты/аренда']['подписан']) console.log(vm.checkedItems.push(item), item);
      //~ const cur = dateFns.isWithinRange(new Date(), new Date(/*item['дата1']*/ '2000-01-01'), new Date(item['дата расторжения'] || item['дата2']));
      //~ if (!cur) vm.archLen += 1;
      const test = true;
        //~ (vm.filters['арендаторы'] ? item['$контрагент'].title.toLowerCase().indexOf(vm.filters['арендаторы'].toLowerCase()) >= 0 : true)
        //~ && ( (vm.filters['объект'] && vm.filters['объект'].id) ? item.$объект.id == vm.filters['объект'].id : true);
      //~ console.log("filteredData", vm.filters['объект'], item.$объект);
      return test;
    //~ });
    
  //~ vm.AllChbsChange();
  //~ return vm;
},

/*Print(){
  var vm = this;
  vm.param['аренда/акты/id'] = vm.checkedData.map((item)=>{ return item.id; });
  /// вернет урл для скачивания
  return $http.post(appRoutes.urlFor('аренда/расходы#docx', '-'), vm.param).then(function(resp){
    if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border fw500  animated zoomInUp');
    if (resp.data.docx) window.location.href = appRoutes.urlFor('аренда/расходы#docx', resp.data.docx);
    if (resp.data.data) console.log("счет", resp.data.data);///отладка
    //~ window.location.href = appRoutes.urlFor('тмц/накладная.docx', $c.data.id);
  });
},*/


}; ///конец methods

const computed = {
FilteredData(){
  //~ this.filters.filtered = true;
  this.checkedItems.splice(0);
  //~ console.log(f);
  return  this.data.filter((item)=>this.FilterData(item));
  
},
};/* computed */

const idMaker = IdMaker();/// глобал util/IdMaker.js

const  data = function(){
  let vm = this;
  vm.idMaker = idMaker;
  return {
    "ready": false,
    "data":[],
    "checkedItems":[],
    //~ "filters":{"filtered": false,},
  };
};///конец data

const mounted = function(){
  var vm = this;
  vm.Ready().then(()=>{
    vm.ready = true;
    setTimeout(()=>{
      $('.modal', $(vm.$el)).modal( );// Callback for Modal close} {"complete": vm.ModalComplete}
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

const $Конструктор = function (){
  //~ let $this = this;
  $Компонент.template = $Компонент.template || $templateCache.get('аренда/акты/таблица');
  //~ $Компонент.components['v-form'] =  new $КомпонентАрендаРасходыФорма();
  //~ $Компонент.components['v-object-select'] = new $КомпонентВыборОбъекта();

  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());