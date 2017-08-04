(function () {'use strict';
/*
*/

var moduleName = "NomenItem";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'NomenTree']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes, NomenData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if ($ctrl.level === undefined) $ctrl.level = 0;
      $ctrl.isTopLevel = ($ctrl.level === 0);
      if (!$ctrl.data) $ctrl.data = {};
      
      if (!$ctrl.data.newPath) $ctrl.data.newPath=[];
      //~ if(!$ctrl.data.selectedIdx) $ctrl.data.selectedIdx =[];
      //~ if($ctrl.data.selectedIdx.length) $ctrl.showTree = true;
      if (!$ctrl.param) $ctrl.param = {};
      $scope.item = {title: ''};
      $ctrl.data.newPath.push($scope.item);
     
      if ($ctrl.isTopLevel) $ctrl.LoadData().then(function(){$ctrl.ready = true;});
      else $ctrl.ready = true;
      
    });
      //~ $timeout(function(){$ctrl.InitInput();});
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('номенклатура/список'))//, [3], {"_":new Date().getTime()}
    return NomenData.Load()
      .then(function(resp){
          $ctrl.autocomplete = [];
          var id = $ctrl.data.id || ($ctrl.data.selectedItem && $ctrl.data.selectedItem.id);
          angular.forEach(resp.data, function(item) {
            if( id && id == item.id) $ctrl.SelectTreeItem(item);//angular.forEach(val, function(v,key){ $ctrl.data[key]  = v;});
            var val = item.parents_title.slice();
            val.push(item.title);
            $ctrl.autocomplete.push({value: val.join(' '), data:item});
          });
          //~ console.log(suggestions);
          //~ $ctrl.textField.autocomplete().setOptions({lookup: suggestions});
          $ctrl.dataTree = resp.data;
          
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if (!$ctrl.isTopLevel) return true;
    $ctrl.showTreeBtn = true;
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      //~ preserveInput: false,
      appendTo: $ctrl.textField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var arr = suggestion.data.parents_title.slice();
        arr.push(suggestion.data.title);
        return arguments[3].options.formatResultsArray(arr, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
          //~ console.log('selected: ', suggestion);
        $scope.item.title='';
        $ctrl.SelectTreeItem(suggestion.data);
        
      },
      onSearchComplete: function(query, suggestions){
        //~ console.log("onSearchComplete", suggestions);
        //~ $ctrl.EnableSubItem(suggestions.length === 0);
        $scope.item.suggestionsCnt = suggestions.length;
      },
      onHide: function (container) {
        $scope.item.suggestionsCnt = 1;
        $timeout(function(){$scope.item.suggestionsCnt = 0;});
        $ctrl.ShowTree(false);
      }
      
    });
    //~ $ctrl.textField.autocomplete().getSuggestions();// вызов lookup и там подмена его; // end if level === 0
    //~ }
    //~ else // level > 0
      //~ $ctrl.textField.on('change', function(ev){
        
      //~ });
    //~ console.log($ctrl.textField.get(0));
    
  };
  
  $ctrl.ChangeInput = function(val){//
    //~ if ($ctrl.level === 0) return true;
    //~ console.log("ChangeInput", $scope.item.title.length);
    if(val !== undefined) $scope.item.title = val;
    var bool = $scope.item.title.length !== 0;
    if(!bool) $ctrl.data.newPath.splice($ctrl.level+1, 1000);//);
    $ctrl.EnableSubItem(bool);
    $ctrl.showTreeBtn = !bool;
    return true;
  };
  
  $ctrl.ToggleTreeBtn = function(event){// кнопка
    //~ console.log("ShowSubTree");
    $timeout(function(){$ctrl.ShowTree(!$ctrl.showTree, event);});
    //~ if($ctrl.data.selectedItem && $ctrl.data.selectedItem._hide) {
      //~ $ctrl.showTree = true;
      //~ delete $ctrl.data.selectedItem._hide;
    //~ }
    //~ $timeout(function(){$('nomen-tree', $($element[0])).focus();});
  };
  /*
  $ctrl.BlurTree = function(event) {
    //~ $timeout(function(){$ctrl.showTree = false;});
    
  };*/
  /*
  $ctrl.ClearInputBtn = function(){
    $scope.item.title = '';
    //~ Object.keys($ctrl.data).map(function(key){delete $ctrl.data[key];});
    //~ $ctrl.$onInit();
    //~ console.log("ClearInputBtn", $ctrl.level, 
    $ctrl.data.newPath.splice($ctrl.level+1, 1000);//);
    $ctrl.EnableSubItem(false);
    if($ctrl.isTopLevel) $ctrl.showTreeBtn = true;
    
  };*/
  
  
  $ctrl.SelectTreeItem = function(item){
    //~ console.log("SelectTreeItem", item);
    //~ if ($ctrl.data.selectedItem === item) return;
    $ctrl.data.selectedItem = item;
    $ctrl.ChangeInput();
    if(!item.childs || !item.childs.length) $ctrl.ShowTree(false);
  };
  
  $ctrl.SelectedItemClear = function(){
    //~ $timeout(function(){
      
    $ctrl.data.selectedItem = {};
    if($ctrl.data.newPath) $ctrl.data.newPath.length = 0;
    $ctrl.data.newPath.push($scope.item);
    //~ $ctrl.data.selectedIdx = [];
    //~ $ctrl.data.selectedPath = [];
    //~ $ctrl.data.finalItem = {};
    $scope.item.title = '';
    
    
      
    $ctrl.EnableSubItem(false);
    $ctrl.showTreeBtn = true;
    $ctrl.ShowTree(false);// передернуть компонент
    $ctrl.textField.focus();
    //~ });
    //~ $timeout(function(){$ctrl.showTree = true;});
  };
  /*
  $ctrl.CheckFinalItem = function(){
    //~ if (!$ctrl.isTopLevel) return false;
    //~ if ($ctrl.showTree) return true;
    //~ if($ctrl.EnableSubItem()) return false;
    if ($ctrl.showTree && $ctrl.data.finalItem && $ctrl.data.finalItem.id) {$ctrl.showTreeBtn = false; $ctrl.showTree = false;}//{$timeout(function(){$ctrl.showTree = false;});};//return false
    //~ if ($ctrl.showTree) return true;
    return true;
    
    
  };*/
  
  var event_hide_tree = function(event){
    var tree = $(event.target).closest('nomen-tree').eq(0);
    if(tree.length) return;
    $ctrl.ShowTree(false);
    $timeout(function(){$(document).off('click', event_hide_tree);});
    return false;
  };
  $ctrl.ShowTree=function(bool, event){
    if (bool === undefined ) return $ctrl.showTree;
    $ctrl.showTree = bool;
    if(bool) $timeout(function(){$(document).on('click', event_hide_tree);});
  };
  
  $ctrl.EnableSubItem = function(bool){
    if (bool === undefined ) return $ctrl.enableSubItem;
    //~ $timeout(function(){
    $ctrl.enableSubItem = bool;//});
    
    
  };
  /*
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
    
  });*/
  
};

/******************************************************/
var NomenData  = function($http, appRoutes){
  //~ var srv = this;
  //~ var f = {};
  var data = $http.get(appRoutes.url_for('номенклатура/список'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("NomenData", NomenData)

.component('nomenItem', {
  templateUrl: "nomen/item",
  //~ scope: {},
  bindings: {
    level: '<',
    param: '<',
    data: '<',// newPath: '<', // массив новых подкатегорий
    onFocusField:'&',

  },
  controller: Component
})

;

}());