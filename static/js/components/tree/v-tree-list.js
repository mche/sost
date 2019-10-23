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

module
.factory('$КомпонентДеревоСписок', function($templateCache,  /*$timeout, $http, $rootScope, /**$compile, appRoutes, Util*/ $EventBus) {// factory

const props = {
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
};

//~ var comp = {/** computed **/};

const util = {
SortData(a, b) {
  if (a.sortBy > b.sortBy) return 1;
  if (a.sortBy < b.sortBy) return -1; 
  return 0;
},

FilterData(item){
  //~ if (!this.parent) return ///this.parent = defaultParent;
  //~ console.log("FilterData");
  return item.parent === (this.parent ? this.parent.id : this.default.parent.id );
},

MapDataToSort(item){
  return {"sortBy": item[this.param.sortBy || 'title'].toLowerCase(), "data": item};
},

MapDataFromSort(item){
  return item.data;
},

SomeDataOnToggleSelect(it){/// 
  var param = this;
  var item = this.item;
  var parentId = item.parents_id[item.parents_id.length-1];
  if (param.expand || it.id == parentId) param.parent = it;
  //~ var paramChilds = {"item":item, "it": it, "expandedChild": undefined};
  //~ if (!item._expand && item.childs) item.childs.some(SomeChilds, paramChilds);
  
  return item._expand || !!param.parent;
},

IsEqualId(id){
  return (id.id || id) == this.id;
},

};


const methods = {/*методы*/

ToggleSelect(item, event){
  //~ console.log("ToggleSelect", item, event);
  let vm = this;
  vm.$set(item, '_expand', !item._expand);
  var param = {"item": item, "parent": undefined, "expand": item._expand};
  if (!item._expand) vm.data.some(util.SomeDataOnToggleSelect, param);
  if (vm.param.selectItemEventName)  $EventBus.$emit(vm.param.selectItemEventName, item._expand ? item : param.parent);
    
    //~ $timeout(function(){
        //~ $c.data.map(MapOnToggleSelect, item);//свернуть дерево
      //~ });
},

IsExpand(item){
  let vm = this;
  //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
  var it = item && item.selectedItem;
  if (it && it.parents_id && it.parents_id.length && it.parents_id.some(util.IsEqualId, item)) item._expand = true;
  return item._expand;
},

EditNode(node){
  var vm = this;
  //~ console.log("AddNode", arguments);
  if (!node) {// кнопка новый узел
    //~ console.log("AddNode", JSON.stringify(this.param['новый узел']));
    vm.newItem = vm.param['новый узел'] ? angular.copy(vm.param['новый узел']) : {};
    vm.newItem.parent = vm.parent.id || vm.parent;
    return;
  }
  vm.$set(node, '_edit', angular.copy(node));
},

OnSaveNode(node){ ///  из события сохранения/возникновения записи компонента формы
  var vm = this;
  if (vm.newItem) vm.newItem = undefined;
  if (node) {
    var f = vm.data.find(util.IsEqualId, node);
    //~ console.log("OnSaveNode", node, f);
    if (f) { /// редакт
      if (f._edit) f._edit = undefined;
      Object.assign(f, node);
    } else {/// новая
      vm.data.push(node);
      //~ vm.childs.splice(0,  vm.childs.length);
      //~ $timeout(function(){
        //~ vm.Childs();///обновить
        //~ 
      //~ });
    }
  }
},
}; /*конец методов*/

const computed = {
Childs(){
  //~ console.log("Childs");
  let vm = this;
  //~ vm.childs = [...
  return vm.data.filter(util.FilterData, vm).map(util.MapDataToSort, vm).sort(util.SortData).map(util.MapDataFromSort);
  //];
  //~ return vm.childs;
},

ULStyle(){
  if (this.level === 0) return {};
  return this.param.ulStyle || {"margin-left":'0.5rem'};
},
  
}; /*конец computed*/

const data = function(){
  let vm = this;
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "default": {"parent": {"id": null, /*"parents_title":[]*/}},
    "newItem": undefined,
    //~ "childs": [],
  };
  //);
};

const mounted = function(){/// 
  var vm = this;
  //~ console.log("Mounted", vm);
  //~ if (!vm.param) vm.param = {};
  //~ if (vm.level === undefined) vm.level = 0;
  //~ if (vm.parent === undefined) vm.parent = vm.item.topParent || vm.default.parent;//!!!
  //~ vm.Childs();
  vm.ready = true;
  
};

var $Компонент = {
  //~ "template": $templateCache.get('компонент/дерево/список'), ! в конструкторе
  props,
  data,
  methods,
  computed,
  //~ "created"() { //~ },
  mounted,
    //~ this.Childs();
    //~ this.Mounted();
  //~ },
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

}// end Factory
/**********************************************************************/
);

}());