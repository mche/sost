(function () {'use strict';
/*
*/

var moduleName = "CategoryItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'CategoryTree']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $element, CategoryData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if ($ctrl.level === undefined) $ctrl.level = 0;
      $ctrl.isTopLevel = ($ctrl.level === 0);
      if (!$ctrl.data) $ctrl.data = {};
      
      if (!$ctrl.data.newPath) $ctrl.data.newPath=[];
      if(!$ctrl.data.selectedIdx) $ctrl.data.selectedIdx =[];
      //~ if($ctrl.data.selectedIdx.length) $ctrl.showTree = true;
      if (!$ctrl.param) $ctrl.param = {};
      if (!$ctrl.param.rootCategory) $ctrl.param.rootCategory= 3;
      $scope.item = {title: ''};
      $ctrl.data.newPath.push($scope.item);
     
      if ($ctrl.isTopLevel && !$ctrl.dataTree) $ctrl.LoadData().then(function(){$ctrl.ready = true;});
      else $ctrl.ready = true;
      
    });
      //~ $timeout(function(){$ctrl.InitInput();});
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('категории/дерево и поиск'))//, [3], {"_":new Date().getTime()}
    return CategoryData.Fresh()
      .then(function(resp){
          $ctrl.autocomplete = [];
          var id = $ctrl.data.id || ($ctrl.data.selectedItem && $ctrl.data.selectedItem.id);
          angular.forEach(resp.data.search, function(val) {
            if( id && id == val.id) $ctrl.selectedPathClick(val);//angular.forEach(val, function(v,key){ $ctrl.data[key]  = v;});
            $ctrl.autocomplete.push({value: val.parents_title.join(' '), data:val});
          });
          //~ console.log(suggestions);
          //~ $ctrl.textField.autocomplete().setOptions({lookup: suggestions});
          $ctrl.dataTree = resp.data.tree;
          
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if (!$ctrl.isTopLevel) return true;
    $ctrl.showTreeBtn = true;
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    $ctrl.textField.autocomplete({
      //~ serviceUrl: 
      //~ lookup: function (query, done) {// однократно вызовется ниже .getSuggestions();
        //~ $http.get(appRoutes.url_for('поиск категории'), {"cache":false}).then(function(resp){
          //~ var suggestions = [];
          //~ angular.forEach(resp.data, function(val) {
            //~ suggestions.push({value: val.parents_title.join('/'), data:val})
          //~ });
          //~ $ctrl.textField.autocomplete().setOptions({lookup: suggestions});
          
          
        //~ });
      //~ },
      lookup: $ctrl.autocomplete,
      transformResult000: function(response, originalQuery) {
        //~ return typeof response === 'string' ? $.parseJSON(response) : response;
        //~ console.log(response);
        return response;
        
      },
      //~ preserveInput: false,
      appendTo: $ctrl.textField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        return arguments[3].options.formatResultsArray(suggestion.data.parents_title, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
          //~ console.log('selected: ', suggestion);
        $scope.item.title='';
        $ctrl.selectedPathClick(suggestion.data);
        
      },
      onSearchComplete: function(query, suggestions){
        //~ console.log("onSearchComplete", suggestions);
        //~ $ctrl.EnableSubItem(suggestions.length === 0);
        $scope.item.suggestionsCnt = suggestions.length;
      },
      onHide: function (container) {
        $scope.item.suggestionsCnt = 1;
        $timeout(function(){$scope.item.suggestionsCnt = 0;});
        $ctrl.showTree = false;
      }
      
    });
    //~ $ctrl.textField.autocomplete().getSuggestions();// вызов lookup и там подмена его; // end if level === 0
    //~ }
    //~ else // level > 0
      //~ $ctrl.textField.on('change', function(ev){
        
      //~ });
    //~ console.log($ctrl.textField.get(0));
    
  };
  
  $ctrl.ChangeInput = function(){
    //~ if ($ctrl.level === 0) return true;
    //~ console.log("ChangeInput", $scope.item.title.length);
    var bool = $scope.item.title.length !== 0;
    $ctrl.EnableSubItem(bool);
    $ctrl.showTreeBtn = !bool;
    return true;
  };
  
  var event_hide_tree = function(event){
    var tree = $(event.target).closest('category-tree').eq(0);
    if(tree.length) return;
    $ctrl.showTree=false;
    $timeout(function(){$(document).off('click', event_hide_tree);});
    return false;
  };
  $ctrl.ToggleTreeBtn = function(){// кнопка
    //~ console.log("ShowSubTree");
    $ctrl.showTree = !$ctrl.showTree;
    if($ctrl.showTree) $timeout(function(){$(document).on('click', event_hide_tree);});
    //~ else $(document).off('click', event_hide_tree);
    //~ if (!$scope.dataTree) {
      //~ $scope.dataTree = [];
      //~ $http.get(appRoutes.url_for('дерево категорий'), {"cache":false}).then(function(resp){Array.prototype.push.apply($scope.dataTree, resp.data);});
      
    //~ }
    
  };
  
  $ctrl.ClearInputBtn = function(){
    $scope.item.title = '';
    $ctrl.data = undefined;
    $ctrl.$onInit();
    $ctrl.EnableSubItem(false);
    if($ctrl.isTopLevel) $ctrl.showTreeBtn = true;
    
  };
  
  $ctrl.selectedPathClick = function(item){
    if ($ctrl.data.selectedItem === item) return;
    $ctrl.data.selectedItem = item;
    $ctrl.data.selectedIdx = item.selectedIdx;
    if(item.selectedPath) {
      //~ var len = item.selectedIdx.length;
      //~ if(len) item.selectedPath.splice(len-1, 1000);
      $ctrl.data.selectedPath = item.selectedPath;
      
    }
    //~ if(item['#']) $ctrl.showTree = false;// это поисковая строка
    //~ else $ctrl.showTree = false;// это выбор из дерева
    
    //~ $timeout(function(){$ctrl.ToggleTreeBtn();});//$ctrl.showTree = true;
    $ctrl.EnableSubItem(false);
    // финальной категории нет в списке поиска?
    //!!!($ctrl.data.finalItem && $ctrl.data.finalItem.id);
    $ctrl.showTreeBtn = true;
    $ctrl.showTree = false;
    
    //~ $ctrl.ToggleTreeBtn();
    
    
  };
  
  $ctrl.SelectedItemClear = function(){
    //~ $timeout(function(){
      
    $ctrl.data.selectedItem = {};
    $ctrl.data.selectedIdx = [];
    $ctrl.data.selectedPath = [];
    $ctrl.data.finalItem = {};
    $scope.item.title = '';
    
    
      
    $ctrl.EnableSubItem(false);
    $ctrl.showTreeBtn = true;
    $ctrl.showTree = false;// передернуть компонент
    $ctrl.textField.focus();
    //~ });
    //~ $timeout(function(){$ctrl.showTree = true;});
  };
  
  $ctrl.CheckFinalItem = function(){
    //~ if (!$ctrl.isTopLevel) return false;
    //~ if ($ctrl.showTree) return true;
    //~ if($ctrl.EnableSubItem()) return false;
    if ($ctrl.showTree && $ctrl.data.finalItem && $ctrl.data.finalItem.id) {$ctrl.showTreeBtn = false; $ctrl.showTree = false;}//{$timeout(function(){$ctrl.showTree = false;});};//return false
    //~ if ($ctrl.showTree) return true;
    return true;
    
    
  };
  
  $ctrl.EnableSubItem = function(bool){
    if (bool === undefined ) return $ctrl.enableSubItem;
    $timeout(function(){$ctrl.enableSubItem = bool;});
    
    
  };
  
  $ctrl.RemoveItem = function(){//input text
    var item = $scope.item;
    //~ console.log("RemoveItem", item, $ctrl.level);
    $ctrl.EnableSubItem(false);
    //~ if(item.title === '') {// сброс дочерние
    var idx = $ctrl.data.newPath.indexOf(item);
    if(idx === undefined) return;
    //~ $ctrl.data.newPath.splice(idx+1, 1000);
    $timeout(function(){
        
      if ($ctrl.data.newPath.length > 1) $ctrl.data.newPath.splice(idx, 1000);
      else if ($ctrl.data.newPath.length === 1) $ctrl.data.newPath[0].title='';
      //~ if () $ctrl.data.newPath.push({"title": ''});
    });
    //~ }
    //~ else $scope.subItem = true;
    
  };
  
  
  $scope.$on('$destroy', function() {
    if( !$ctrl.isTopLevel ) $ctrl.RemoveItem();
    
  });
  
};

/******************************************************/
var CategoryData  = function($http, appRoutes){
  var fresh = function() {
    return $http.get(appRoutes.url_for('категории/дерево и поиск'));
  };
  var data = fresh();
  return {
    Load: function() {return data;},
    Fresh: fresh,
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("CategoryData", CategoryData)

.component('categoryItem', {
  templateUrl: "category/item",
  //~ scope: {},
  bindings: {
    level: '<',
    param: '<',
    data: '<',// newPath: '<', // массив новых подкатегорий

  },
  controller: Component
})

;

}());