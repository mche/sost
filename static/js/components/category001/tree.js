(function () {'use strict';
/*
*/

var moduleName = "CategoryTree";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $element, $timeout) {
  var $ctrl = this;
  
  $ctrl.Init000 = function () {
    //~ console.log(moduleName+' onInit');
    //~ if ($ctrl.childs === undefined) {
      //~ CategoryData.get($ctrl.staticData, function (resp) {
        //~ $ctrl.childs = resp.data;
        //~ $ctrl.InitData();
      //~ });
    //~ } else {
      //~ $ctrl.Init();
    //~ }
    $timeout(function(){$ctrl.InitData();});
  };
  
  $ctrl.$onInit = function() {
    
    //~ console.log("$onInit");
    
    if(!$ctrl.param) $ctrl.param =  {};
    if(!$ctrl.data) $ctrl.data =  {};
    if(!$ctrl.data.selectedIdx) $ctrl.data.selectedIdx =[];
    if(!$ctrl.data.selectedItem) $ctrl.data.selectedItem = {};
    if(!$ctrl.data.finalItem) $ctrl.data.finalItem = {};

    $ctrl.parentSelectedItem = $ctrl.data.selectedItem;
    
    if ($ctrl.level === undefined) $ctrl.level = 0;
    var selectedIdx = $ctrl.data.selectedIdx[$ctrl.level];
    if (selectedIdx !== undefined) {
      $ctrl.selectedItem = $ctrl.childs[selectedIdx]; // индекс позиция на текущем уровне
      $ctrl.SetFinalItem();
      $ctrl.data.selectedItem = $ctrl.selectedItem;
    }

    //~ if ($ctrl.childs.length == 1 && $ctrl.childs[0].newTitle !== undefined) $($element[0]).css('vertical-align', 'bottom');
    $ctrl.ready = true;
    //~ $ctrl.EmitEvent();
      
  };
    
  $ctrl.SetFinalItem = function () {
      var final1 = $ctrl.selectedItem && (!$ctrl.selectedItem.childs || $ctrl.selectedItem.childs.length === 0);
      if ( final1 ) {// нет потомков - это финал в родительский контроллер
        $ctrl.data.finalItem = $ctrl.selectedItem;
      } else {
        $ctrl.data.finalItem = {};
      }
  };
  
  $ctrl.ToggleSelect = function (item, event) {
    if ($ctrl.param.disabled || item.disabled) return false;//
    var idx = $ctrl.childs.indexOf(item);
    
    //~ if($ctrl.data.selectedItem.newChilds) $ctrl.data.selectedItem.newChilds.length = 0;
    
    if ($ctrl.selectedItem && $ctrl.selectedItem.id) {// сброс && $ctrl.selected == idx
      //~ $ctrl.EmitEvent('AddNewChild', $ctrl.newChild);// восстановить прежний новый узел
      $ctrl.selectedItem = undefined;
      $ctrl.data.selectedIdx.splice($ctrl.level, 1000);
      $ctrl.SetFinalItem();// после $ctrl.selectedItem = undefined;
      $ctrl.data.selectedItem = $ctrl.parentSelectedItem;
      //~ return false;
    }
    else {
      // Выключил 16-01-2017
      //~ if (item.hasOwnProperty('_count') && !item._count) return;
      $ctrl.data.selectedIdx[$ctrl.level] = idx;
      $ctrl.selectedItem =  item;
      $ctrl.data.selectedItem = item;// item
      $ctrl.SetFinalItem();
    }
    
    $ctrl.EmitEvent();// поменять сборку пути
    
    return true;
  };
  
  $ctrl.filterSelected = function(item, index, array) {
    //~ console.log("фильрация списка", item);
    if (!!item.disabled) return false;
    //~ if (item['new']) console.log("new!");//return true;
    if ($ctrl.selectedItem === undefined || $ctrl.selectedItem === item || $ctrl.selectedItem === $ctrl.newChild) return true;
    return false;
  };
  
  $ctrl.ExpandIf = function(item){
    if (!$ctrl.ready) return false;
    if (($ctrl.selectedItem && $ctrl.selectedItem === item) || $ctrl.param.expandAll) return true;// && $ctrl.selectedItem.childs && $ctrl.selectedItem.childs.length
    return false;
  };
  
  
  $ctrl.dndMoved = function(item){//dnd
    var idx = $ctrl.childs.indexOf(item);
    $ctrl.childs.splice(idx, 1);
    
  };
  
  $ctrl.dndSelected = function(item){//dnd
    //~ console.log(moduleName+" Selected", item);
  };
  
  /*
  $ctrl.NewChild = function(){
    if(!$ctrl.ready) return;
    var nc = {"title":''};
    $ctrl.newChild = nc;
    //~ $ctrl.data.selectedItem.newChilds.push( nc);//[$ctrl.level]
    $ctrl.EmitEvent('AddNewChild', $ctrl.newChild);
  };
  
  $ctrl.onFocusNewChild = function () {//input field
    var item = $ctrl.newChild;
    $ctrl.selectedItem = item;
    $ctrl.data.selectedItem = $ctrl.parentSelectedItem;
  };
  
  $ctrl.onChangeNewChild = function () {//input field
    //~ item.childs = [{"newTitle2": ''}];
    
    var item = $ctrl.newChild;
    
    if ($ctrl.selectedItem !== item) {
      $ctrl.selectedItem = item;
      $ctrl.data.selectedItem = $ctrl.parentSelectedItem;
      return;
    }
    
    $ctrl.EmitEvent();
    
    if(item.title === '') {// сброс дочерние
      $ctrl.selectedItem = undefined;
      var idx = $ctrl.data.selectedItem.newChilds.indexOf(item);
      $ctrl.data.selectedItem.newChilds.splice(idx+1, 1000);
      
    }
    
  };
  */
    
  $ctrl.EmitEvent = function(name, data){
    name = moduleName+(name || '');
    $scope.$emit(name, data);
  };
  
  // событие только в нулевом уровне
  $scope.$on(moduleName, function (event, data) {
    if($ctrl.level !== 0) return;
    $timeout(function(){
      $ctrl.data.selectedPath = $ctrl.SelectedPath();
    });
  });
  
  // событие только в нулевом уровне
  $scope.$on(moduleName+'AddNewChild', function (event, data) {// костыль не работало восстановление после ухода новой позиции и возврат к ней
    if($ctrl.level !== 0) return;
    $timeout(function(){
      if(!$ctrl.data.selectedItem.newChilds) $ctrl.data.selectedItem.newChilds = [];
      $ctrl.data.selectedItem.newChilds.push(data);
      $scope.selectedPath = $ctrl.SelectedPath();
    });
  });
  
  $ctrl.SelectedPath = function() {
    var data = [],
      path = [],
      curr = $ctrl.childs;
    
    angular.forEach($ctrl.data.selectedIdx, function(idx){
      path.push(idx);
      curr[idx].selectedIdx = angular.copy(path);
      data.push(curr[idx]);
      curr = curr[idx].childs;
    });
    
    //~ angular.forEach($ctrl.data.selectedItem.newChilds, function(item, idx){
      //~ data.push(item.title);
    //~ });
    
    return data;
    
  };
  
  
  $ctrl.UlStyle = function(){
    //~ if(!$ctrl.childs || !$ctrl.childs.length) return {"display": 'inherit', "vertical-align": 'middle', "margin-left":'0.5rem'};
    //~ return {};
    if ($ctrl.level === 0) return {};
    return {"margin-left":'0.5rem'};
  };
  
};

/*=============================================================*/

module

.component('categoryTree', {
  templateUrl: "category/tree",
  scope: {},
  bindings: {
    param: '<', // disabled: boolean не изменять
    childs: '<', // массив-данные потомков для уровня
    level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
    data: '<', // {} внешние данные (нужен проброс) а именно:
          //~ selectedIdx: '=', // двунаправленный массив предустановленных позиций списков [1,0,2] - выбрать вторую поз на 0 уровне, первую - на 1 уровне, третью на третьем уровне
          //~ finalItem: '=' // если дошел до вершины любой ветки - установить ее узел
  },
  controller: Component
})

;

}());
