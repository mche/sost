(function () {'use strict';
/*
*/

var moduleName = "CategoryTree";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $element, $timeout) {
  var $ctrl = this;
  
  $ctrl.Init000 = function () {
    //~ console.log(moduleName+' onInit');
    //~ if ($ctrl.data === undefined) {
      //~ CategoryData.get($ctrl.staticData, function (resp) {
        //~ $ctrl.data = resp.data;
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
    if(!$ctrl.category) $ctrl.category =  {};
    if(!$ctrl.category.selectedIdx) $ctrl.category.selectedIdx =[];
    if(!$ctrl.category.selectedItem) $ctrl.category.selectedItem = {};
    if(!$ctrl.category.finalCategory) $ctrl.category.finalCategory = {};

    $ctrl.parentSelectedItem = $ctrl.category.selectedItem;
    
    if ($ctrl.level === undefined) $ctrl.level = 0;
    var selectedIdx = $ctrl.category.selectedIdx[$ctrl.level];
    if (selectedIdx !== undefined) {
      $ctrl.selectedItem = $ctrl.data[selectedIdx]; // индекс позиция на текущем уровне
      $ctrl.SetFinalCategory();
      $ctrl.category.selectedItem = $ctrl.selectedItem;
    }

    //~ if ($ctrl.data.length == 1 && $ctrl.data[0].newTitle !== undefined) $($element[0]).css('vertical-align', 'bottom');
    $ctrl.ready = true;
    //~ $ctrl.EmitEvent();
      
  };
    
  $ctrl.SetFinalCategory = function () {
      var final1 = $ctrl.selectedItem && (!$ctrl.selectedItem.childs || $ctrl.selectedItem.childs.length === 0);
      if ( final1 ) {// нет потомков - это финал в родительский контроллер
        $ctrl.category.finalCategory = $ctrl.selectedItem;
      } else {
        $ctrl.category.finalCategory = {};
      }
  };
  
  $ctrl.ToggleSelect = function (item, event) {
    if ($ctrl.param.disabled || item.disabled) return false;//
    var idx = $ctrl.data.indexOf(item);
    
    //~ if($ctrl.category.selectedItem.newChilds) $ctrl.category.selectedItem.newChilds.length = 0;
    
    if ($ctrl.selectedItem && $ctrl.selectedItem.id) {// сброс && $ctrl.selected == idx
      //~ $ctrl.EmitEvent('AddNewChild', $ctrl.newChild);// восстановить прежний новый узел
      $ctrl.selectedItem = undefined;
      $ctrl.category.selectedIdx.splice($ctrl.level, 1000);
      $ctrl.SetFinalCategory();// после $ctrl.selectedItem = undefined;
      $ctrl.category.selectedItem = $ctrl.parentSelectedItem;
      //~ return false;
    }
    else {
      // Выключил 16-01-2017
      //~ if (item.hasOwnProperty('_count') && !item._count) return;
      $ctrl.category.selectedIdx[$ctrl.level] = idx;
      $ctrl.selectedItem =  item;
      $ctrl.category.selectedItem = item;// item
      $ctrl.SetFinalCategory();
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
    var idx = $ctrl.data.indexOf(item);
    $ctrl.data.splice(idx, 1);
    
  };
  
  $ctrl.dndSelected = function(item){//dnd
    //~ console.log(moduleName+" Selected", item);
  };
  
  /*
  $ctrl.NewChild = function(){
    if(!$ctrl.ready) return;
    var nc = {"title":''};
    $ctrl.newChild = nc;
    //~ $ctrl.category.selectedItem.newChilds.push( nc);//[$ctrl.level]
    $ctrl.EmitEvent('AddNewChild', $ctrl.newChild);
  };
  
  $ctrl.onFocusNewChild = function () {//input field
    var item = $ctrl.newChild;
    $ctrl.selectedItem = item;
    $ctrl.category.selectedItem = $ctrl.parentSelectedItem;
  };
  
  $ctrl.onChangeNewChild = function () {//input field
    //~ item.childs = [{"newTitle2": ''}];
    
    var item = $ctrl.newChild;
    
    if ($ctrl.selectedItem !== item) {
      $ctrl.selectedItem = item;
      $ctrl.category.selectedItem = $ctrl.parentSelectedItem;
      return;
    }
    
    $ctrl.EmitEvent();
    
    if(item.title === '') {// сброс дочерние
      $ctrl.selectedItem = undefined;
      var idx = $ctrl.category.selectedItem.newChilds.indexOf(item);
      $ctrl.category.selectedItem.newChilds.splice(idx+1, 1000);
      
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
      $ctrl.category.selectedPath = $ctrl.SelectedPath();
    });
  });
  
  // событие только в нулевом уровне
  $scope.$on(moduleName+'AddNewChild', function (event, data) {// костыль не работало восстановление после ухода новой позиции и возврат к ней
    if($ctrl.level !== 0) return;
    $timeout(function(){
      if(!$ctrl.category.selectedItem.newChilds) $ctrl.category.selectedItem.newChilds = [];
      $ctrl.category.selectedItem.newChilds.push(data);
      $scope.selectedPath = $ctrl.SelectedPath();
    });
  });
  
  $ctrl.SelectedPath = function() {
    var data = [],
      path = [],
      curr = $ctrl.data;
    
    angular.forEach($ctrl.category.selectedIdx, function(idx){
      path.push(idx);
      curr[idx].selectedIdx = angular.copy(path);
      data.push(curr[idx]);
      curr = curr[idx].childs;
    });
    
    //~ angular.forEach($ctrl.category.selectedItem.newChilds, function(item, idx){
      //~ data.push(item.title);
    //~ });
    
    return data;
    
  };
  
  
  $ctrl.ulStyle = function(){
    if(!$ctrl.data || !$ctrl.data.length) return {"display": 'inherit', "vertical-align": 'middle', "margin-left":'0.5rem'};
    return {};
  };
  
};

/*=============================================================*/

module

.component('categoryTree', {
  templateUrl: "category/tree",
  scope: {},
  bindings: {
      //~ staticData: '<',// boolean влияет на получение корневых данных дерева (статика или с динамическим подсчетом)
    param: '<', // disabled: boolean не изменять
    data: '<', // массив-данные потомков для уровня
    level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
    category: '<', // {} внешние данные (нужен проброс) а именно:
          //~ selectedIdx: '=', // двунаправленный массив предустановленных позиций списков [1,0,2] - выбрать вторую поз на 0 уровне, первую - на 1 уровне, третью на третьем уровне
          //~ finalCategory: '=' // если дошел до вершины любой ветки - установить ее узел
      //~ , dataUrl: '<'
  },
  controller: Component
})

;

}());
