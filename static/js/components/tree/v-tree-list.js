(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентДеревоСписок(),
      ...
    }
  })
  
*/
var moduleName = "Компонент::Дерево::Список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'EventBus' ]);

const Factory = function($templateCache,  /*$timeout, $http, $rootScope, /**$compile, appRoutes, Util*/ $EventBus) {// factory

var meth = {/*методы*/};
var comp = {/** computed **/};

meth.Mounted = function(){/// метод
  var vm = this;
  //~ console.log("Mounted", vm);
  //~ if (!vm.param) vm.param = {};
  //~ if (vm.level === undefined) vm.level = 0;
  //~ if (vm.parent === undefined) vm.parent = vm.item.topParent || vm.default.parent;//!!!
  vm.ready = true;
  
};

const SortData = function (a, b) {
  if (a.sortBy > b.sortBy) return 1;
  if (a.sortBy < b.sortBy) return -1; 
  return 0;
};
const FilterData = function(item){
  //~ if (!this.parent) return ///this.parent = defaultParent;
  //~ console.log("FilterData");
  return item.parent === (this.parent ? this.parent.id : this.default.parent.id );
};
const MapDataToSort = function(item){
  return {"sortBy": item[this.param.sortBy || 'title'].toLowerCase(), "data": item};
};
const MapDataFromSort = function(item){
  return item.data;
};
meth.Childs = function(){
  //~ console.log("Childs");
  let vm = this;
  vm.childs = [...vm.data.filter(FilterData, vm).map(MapDataToSort, vm).sort(SortData).map(MapDataFromSort)];
  return vm.childs;
};

meth.ULStyle = function(){
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
  if (vm.param.selectItemEventName)  $EventBus.$emit(vm.param.selectItemEventName, item._expand ? item : param.parent);
    
    //~ $timeout(function(){
        //~ $c.data.map(MapOnToggleSelect, item);//свернуть дерево
      //~ });
};

const IsEqualId = function(id){ return (id.id || id) == this.id; };
meth.IsExpand = function(item){
  let vm = this;
  //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
  var Item = vm.item && vm.item.selectedItem;
  if (Item && Item.parents_id && Item.parents_id.length && Item.parents_id.some(IsEqualId, item)) item._expand = true;
  return item._expand;
};

meth.EditNode = function(node){
  var vm = this;
  //~ console.log("AddNode", arguments);
  if (!node) {// кнопка добавить
    //~ console.log("AddNode", JSON.stringify(this.param['новый узел']));
    vm.newItem = angular.copy(vm.param['новый узел']);
    vm.newItem.parent = vm.parent.id || vm.parent;
    return;
  }
  vm.$set(node, '_edit', angular.copy(node));
};

meth.OnSaveNode = function(node){ ///  из события сохранения/возникновения записи компонента формы
  var vm = this;
  if (vm.newItem) vm.newItem = undefined;
  if (node) {
    var f = vm.data.find(IsEqualId, node);
    //~ console.log("OnSaveNode", node, f);
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, node);
    } else {/// новая
      vm.data.push(node);
      //~ vm.childs.splice(0,  vm.childs.length);
      //~ $timeout(function(){
        vm.Childs();///обновить
        //~ 
      //~ });
    }
  }
};

var $Компонент = {
  //~ "template": $templateCache.get('компонент/дерево/список'), ! в конструкторе
  "props": {
    "item": Object,
    "data": Array,
    "level": {
        type: Number,
        default: 0,
      },
    "parent": Object,
    "param": {
        type: Object,
        default: function () {
          return {};
        },
      },
    //~ "selectItemEventName": String,
    },
  "data"() {
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "default": {"parent": {"id": null, /*"parents_title":[]*/}},
      "newItem": undefined,
      "childs": [],
    };
    //);
  },
  "methods": meth,
  "computed": comp,
  //~ "created"() { //~ },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Childs();
    this.Mounted();
  },
  "components": { /*в конструкторе*/ },
};


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/дерево/список');/// только в кострукторе
  //~ $Компонент.components = $Компонент.components || {};
  
  $Компонент.components["v-internal-tree-list"] = $Компонент;
  $Компонент.components["v-internal-tree-form"] = compForm || {/*заглушка*/"template": '<div class="red-text">Заглушка компонента формы узла дерева {{ item }}</div>'/*$emit('on-save-node', {сохраненный узел})*/, "props":['item']};
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