(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентВыборОбъекта({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Компонент::Выбор объекта";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Компонент::Выбор в списке']);

module.factory('$КомпонентВыборОбъекта', function($timeout, $templateCache, $Список, appRoutes, $ЗапросОбъектыУК, $КомпонентВыборВСписке) {// factory

const props = {
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "select": Object,
  "dataList":Array,
  "dataUrl": {
    type: String,
    //~ "default": 'доступные объекты без проектов',
  },
};/// конец props

const util = {/*разное*/
  
  MapData(it){
    return {"id": it.id, "_match": it.name, "$item":it};
  },
  
}; ///конец util

const methods = {/*методы*/

LoadData(param){
  var vm = this;
  if (vm.dataUrl || !vm.dataList) {
    //~ console.log("LoadData", vm.dataUrl);
    var loader = vm.dataUrl ? new $Список(appRoutes.urlFor(vm.dataUrl)) : $ЗапросОбъектыУК;
    return loader.Load(param)
      .then(function(resp){
        vm.list = loader.Data().map(util.MapData);
        //~ vm['$объекты'] = loader.$Data();
        //~ if (vm.select !== undefined) vm.Select(vm['объекты'].find(util.FilterByID, vm.select));
        //~ else if (!vm.param['все объекты'] && vm['объекты'].length == 1) vm.Select(vm['объекты'][0]);
      });
  }///  if (vm.dataList)
  else {
    vm.list = vm.dataList.map(util.MapData);
    return $timeout(()=>{});
  }
  
},
  
Ready(){
  var vm = this;
  vm.ready = true;
},

SelectObject(obj){
  //~ console.log("SelectObject", obj);
  //~ this.form.$объект = obj;
  //~ this.select = obj.$item;
  this.$emit('on-select-object', obj && obj.$item);
  
},

}; ///конец методы

const computed = {/*  */

}; ///конец computed

const data = function() {
  let vm = this;
  vm.LoadData().then(function(){
    vm.Ready();
    
  });
  return {
    "ready": false,
  };

};///  конец data

const mounted = function(){
  var vm = this;
};/// конец mounted

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  //~ created,
  mounted,
  components: {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('компонент выбор объекта');
  $Компонент.components['v-select'] = new $КомпонентВыборВСписке();
  return $Компонент;
};

return $Конструктор;

})// конец factory

.factory('$ЗапросОбъектыУК', function( $Список, appRoutes) {// factory
  //~ console.log('$ЗапросОбъектыУК factory');
  return  new $Список(appRoutes.urlFor('аренда/объекты-ук'));
});// конец factory
}());