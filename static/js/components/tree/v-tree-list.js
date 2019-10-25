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
"_shared": {/// рекурсия проброс везде в дереве
    "type": Object,
    "default": function () {
      return {
        "expanded": [],///массив раскрытых родительских позиций, передается в шину и в слот-формы 
      };
    },
  },
"data": Array,
"level": {/// рекурсия
    type: Number,
    "default": 0,
  },
"parent": Object, /// рекурсия
"param": {
    "type": Object,
    "default": function () {
      return {
        //~ selectItemEventName: 'Выбрана папка', /// $EventBus
        //~ newNode: {"название":'Новая папка'}, /// новый узел
        //~ sortBy: 'название', /// сортировка по полю
        //~ ulStyle: {...}, ///стили ul childs
      };
    },
  },
//~ "selectItemEventName": String,
  "_editForm":  {/// внутр
    type: Boolean,
    default: false,
  },
};


const util = {
SortData(a, b) {
  if (a.sortBy > b.sortBy) return 1;
  if (a.sortBy < b.sortBy) return -1; 
  return 0;
},

FilterData(item){
  //~ console.log("FilterData");
  return (item.parent || null) === (this.parent ? this.parent.id || this.parent : null );
},

MapDataToSort(item){
  return {"sortBy": item[this.param.sortBy || 'title'].toLowerCase(), "data": item};
},

MapDataFromSort(item){
  return item.data;
},

ExpandFalse(it){
  it._expand = false;
},

};


const methods = {/*методы*/

Childs(){/// для parent с кэшированием
  //~ 
  let vm = this;
  if (vm.parent && !vm.parent._childs)
    vm.$set(vm.parent, '_childs', vm.data.filter(util.FilterData, vm).map(util.MapDataToSort, vm).sort(util.SortData).map(util.MapDataFromSort));
  //~ else console.log("childs", vm.parent && vm.parent._childs);
  vm.childs = (vm.parent && vm.parent._childs) || [...vm.data.filter(util.FilterData, vm).map(util.MapDataToSort, vm).sort(util.SortData).map(util.MapDataFromSort)];
  //~ if (!vm.childs.length) vm.childs.push({});
  //~ console.log("Childs", childs);
  //~ return childs;
  //];
  return vm.childs;
},
  
ToggleSelect(item, event){
  //~
  let vm = this;
  vm.$set(item, '_expand', !item._expand);
   //~ console.log("ToggleSelect", vm.param.parent);
  //~ var param = {"item": item, "parent": undefined, "expand": item._expand};
  //~ if (!item._expand) vm.data.some(util.SomeDataOnToggleSelect, param);
  //~ if (vm._shared.selected &&  !item.parents_id.some(function(pid){ return vm._shared.selected.id == pid; })) vm._shared.selected._expand = false;
  if (!vm.parent || !vm.IsMyBranch()) ///перешел в другую цепочку-ветку
    vm.CollapseExpanded();
  if (item._expand) vm._shared.expanded.push(item);
  else vm._shared.expanded.removeOf(item);/// =  vm.parent;
  if (vm.param.selectItemEventName)  $EventBus.$emit(vm.param.selectItemEventName, vm._shared.expanded);//item._expand ? item : vm.parent);
  //~ console.log("ToggleSelect", vm._shared.expanded);
},

CollapseExpanded(){
  var vm = this;
  var idx = vm._shared.expanded.indexOf(vm.parent);
  vm._shared.expanded.slice(idx == -1 ? 0 : idx+1/*+(vm.parent ? 1 : 0)*/).map(util.ExpandFalse);
  var slice = vm._shared.expanded.slice(0,idx == -1 ? 0 : idx+1/*+(vm.parent ? 1 : 0)*/);
  vm._shared.expanded.length = 0;
  vm._shared.expanded.push(...slice);
},

/*IsExpand(item){
  let vm = this;
  //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
  var it = item && item.selectedItem;
  if (it && it.parents_id && it.parents_id.length && it.parents_id.some(util.IsEqualId, item)) item._expand = true;
  return item._expand;
},*/

NewNode(){
  var vm = this;
  var node = angular.copy(vm.param.newNode) || {};
  node.parent = vm.parent ? vm.parent.id || vm.parent : null;
  vm.childs.push(node);
  vm.EditNode(node);
},

EditNode(node){
  var vm = this;
  if (!vm.IsMyBranch()) {
    vm.CollapseExpanded();
    if (vm.parent) vm._shared.expanded.push(vm.parent);
  }
  vm.$set(node, '_edit', angular.copy(node));
},

IsMyBranch(){
  var vm = this;
  return /*!vm._shared.expanded.length ||*/ !vm.parent || vm._shared.expanded[vm._shared.expanded.length-1] === vm.parent;
},

OnSaveNode(node){ ///  из события сохранения/возникновения записи компонента формы
  console.log("OnSaveNode", node);
  var vm = this;
  /*if (vm.newItem) vm.newItem = undefined;
  if (node) {
    var f = vm.childs.find(util.IsEqualId, node);
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
  } else {
    //~ 
    
  }
  */
  vm.childs.some(function(it){
    if (it._edit && it._edit === node) {
      if (!node.id) vm.childs.removeOf(it);///отмена несохраненной новой позиции
      else {
        it._edit = undefined;
        Object.assign(it, node);
        if (vm.parent && vm.parent._childs.indexOf(it) == -1) vm.parent._childs.push(it);/// новая пошла в общий список
      }
      return true;
    }
    return false;
  });
},

ItemTitle(it){
  return it[this.param.titleField || 'title'];
},

}; /*конец методов*/

const computed = {

IsLastExpandedParent(){
  return this._shared.expanded[this._shared.expanded.length-1] === this.parent;
},

ExpandedTitle(){
  return this._shared.expanded.map(this.ItemTitle);
},
  
ULStyle(){
  if (this.level === 0) return this.param.ulStyle || {};
  return Object.assign({"margin-left":'0.5rem', /*'max-height': this.noScroll ? 'auto' : '10rem'*/}, this.param.ulStyle || {}, );
},
  
}; /*конец computed*/

const data = function(){
  let vm = this;
  //~ console.log("data param", vm.parent);
  //~ vm.defaultItem = {"parent": {"id": null, /*"parents_title":[]*/}};
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    //~ "noScroll": false,/// 
    //~ "newItem": undefined,
    "childs": [],
    "hasForm": vm._editForm,
  };
  //);
};

const mounted = function(){/// 
  var vm = this;
  //~ console.log("Mounted", vm);
  //~ if (!vm.param) vm.param = {};
  //~ if (vm.level === undefined) vm.level = 0;
  //~ if (vm.parent === undefined) vm.parent = vm.item.topParent || vm.default.parent;//!!!
  vm.Childs();
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
  "components": { /*в конструкторе*/ },
};


const $Конструктор = function (compForm/*компонент формы если добавлять/изменять/удалять*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('компонент/дерево/список');/// только в кострукторе
  //~ $Компонент.components = $Компонент.components || {};
  
  $Компонент.components["v-internal-tree-list"] = $Компонент;
  $Компонент.components["v-internal-tree-form"] = compForm || {/*заглушка*/ "props":['item', 'parents'], "template": '<div><h4 class="red-text">Заглушка компонента формы узла дерева</h4><div class="chip fs8">{{ item }}</div></div>'/*$emit('on-save-node', {сохраненный узел})*/,};
  if (compForm) $Компонент.props = Object.assign({}, $Компонент.props, { "_editForm":  {"type": Boolean,"default": true,},})
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;
//~ return $Компонент;

}// end Factory
/**********************************************************************/
);

}());