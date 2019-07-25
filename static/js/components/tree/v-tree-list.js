(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентДеревоСписок({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Дерево::Список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

const Factory = function($templateCache, $timeout,  /*$http, $rootScope, /**$compile, appRoutes, Util*/) {// factory

let meth = {/*методы*/};
let comp = {/** computed **/};
meth.Mounted = function(){/// метод
  var vm = this;
  if (!vm.param) vm.param = {};
  if (vm.level === undefined) vm.level = 0;
  if (vm.parent === undefined) vm.parent = vm.destItem.topParent || {"id": null, "parents_title":[]};//!!!
  vm.ready = true;
  
};
const SortList = function (a, b) {
  if (a.sortBy > b.sortBy) return 1;
  if (a.sortBy < b.sortBy) return -1; 
  return 0;
};
const FilterList = function(item){
  return item.parent === this.parent.id;
};
const MapListToSort = function(item){
  return {"sortBy": item[this.param.sortBy || 'title'].toLowerCase(), "data": item};
};
const MapListFromSort = function(item){
  return item.data;
};
comp.FilteredList = function(){
  let vm = this;
  return vm.list.filter(FilterList, vm).map(MapListToSort, vm).sort(SortList).map(MapListFromSort);
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};

  return {
    "template": $templateCache.get('компонент/дерево/список'),
    "props": {
      "destItem": 'Object',
      "list": 'Array',
      "level": 'Number',
      "parent": 'Object',
      "param": 'Object',
      "selectItemEventName": 'String',
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
    "components": {
      "v-internal-tree-list": new $Конструктор(),
    },
  };
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентДеревоСписок', Factory);

}());