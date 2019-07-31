(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': $КомпонентДеревоСписок,
      ...
    }
  })
  
*/
var moduleName = "Компонент::Дерево::Список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);

const Factory = function($templateCache, $timeout,  /*$http, $rootScope, /**$compile, appRoutes, Util*/ $EventBus) {// factory

var meth = {/*методы*/};
var comp = {/** computed **/};

meth.Mounted = function(){/// метод
  var vm = this;
  if (!vm.param) vm.param = {};
  if (vm.level === undefined) vm.level = 0;
  if (vm.parent === undefined) vm.parent = vm.item.topParent || {"id": null, "parents_title":[]};//!!!
  vm.ready = true;
  
};

const SortData = function (a, b) {
  if (a.sortBy > b.sortBy) return 1;
  if (a.sortBy < b.sortBy) return -1; 
  return 0;
};
const FilterData = function(item){
  //~ if (!this.parent) return false;
  return item.parent === this.parent.id;
};
const MapDataToSort = function(item){
  return {"sortBy": item[this.param.sortBy || 'title'].toLowerCase(), "data": item};
};
const MapDataFromSort = function(item){
  return item.data;
};
comp.FilteredData = function(){
  let vm = this;
  return vm.data.filter(FilterData, vm).map(MapDataToSort, vm).sort(SortData).map(MapDataFromSort);
};

meth.UlStyle = function(){
  if (this.level === 0) return {};
  return this.param.ulStyle || {"margin-left":'0.5rem'};
};

const SomeDataOnToggleSelect = function(it){/// 
  var param = this;
  var item = this.item;
  var parentId = item.parents_id[item.parents_id.length-1];
  if (param.expand || it.id == parentId) param.parent = it;
  //~ var paramChilds = {"item":item, "it": it, "expandedChild": undefined};
  //~ if (!item._expand && item.childs) item.childs.some(SomeChilds, paramChilds);
  
  //~ console.log("SomeDataOnToggleSelect");
  return item._expand || !!param.parent;
};
meth.ToggleSelect = function(item, event){
  //~ console.log("ToggleSelect", item, event);
  let vm = this;
  vm.$set(item, '_expand', !item._expand);
  var param = {"item": item, "parent": undefined, "expand": item._expand};
  if (!item._expand) vm.data.some(SomeDataOnToggleSelect, param);
  if (vm.selectItemEventName)  $EventBus.$emit(vm.selectItemEventName, item._expand ? item : param.parent);
    
    //~ $timeout(function(){
        //~ $c.data.map(MapOnToggleSelect, item);//свернуть дерево
      //~ });
};

const IsEqualId = function(id){ return id = this.id; };
meth.IsExpand = function(item){
  let vm = this;
  //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
  var Item = vm.item && vm.item.selectedItem;
  if (Item && Item.parents_id && Item.parents_id.length && Item.parents_id.some(IsEqualId, item)) item._expand = true;
  return item._expand;
};

var $Компонент = {
  //~ "template": $templateCache.get('компонент/дерево/список'),
  "props": {
    "item": Object,
    "data": Array,
    "level": Number,
    "parent": Object,
    "param": Object,
    "selectItemEventName": String,
    },
  "data"() {
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
    };
    //);
  },
  "methods": meth,
  "computed": comp,
  //~ "created"() { //~ },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Mounted();
  },
  //~ "components": {  },
};


const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/дерево/список');
  //~ $Компонент.components = {"v-internal-tree-list": $Компонент};
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентДеревоСписок', Factory);

}());