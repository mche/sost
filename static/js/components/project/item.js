(function () {'use strict';
/*
  
*/

var moduleName = "ProjectItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ProjectData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.WatchData = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.data._watch) $scope.$watch(//console.log("set watcher $ctrl.data", 
      function(scope) { return $ctrl.data; },
      function(newValue, oldValue) {
        
        //~ console.log(" ProjectItem watch data ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $ctrl.data.id) 
        if (newValue.id) $timeout(function(){
          var item = $ctrl.dataList.filter(function(it){return it.id == newValue.id;}).pop();
          
          if(item) $ctrl.SetItem(item);
          //~ else console.log("None project SetItem");
          
        });
      },
      true// !!!!
    );
    $ctrl.data._watch = true;
  };
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = {};
    $ctrl.autocomplete = [];

    $ctrl.LoadData().then(function(){
      $ctrl.showListBtn = (!$ctrl.data.name || $ctrl.data.name.length === 0);
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return ProjectData.Load()
      .then(function(resp){
          $ctrl.dataList = resp.data;
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
   
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.dataList/*.filter($ctrl.FilterData)*/.map(function(val) {
      return {value: val.name, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      onHide: function (container) {}
      
    });
    $ctrl.WatchData();
    if($ctrl.data.id) {
      var item = $ctrl.dataList.filter(function(item){ return item.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
    }
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.name.length === 0) $ctrl.ClearItem();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      $ctrl.showListBtn = true;
      $ctrl.InitInput();
      //~ $ctrl.textField.blur().focus();
    }
  };
  /*var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };*/
  $ctrl.ToggleListBtn = function(){
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.toggleAll();
    //~ if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.SetItem = function(item, onSelect) {
     //~ $ctrl.data=suggestion.data;
    $ctrl.data.name=item.name;
    $ctrl.data.id=item.id;
    //~ $ctrl.data._fromItem = item;
    $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
    
  };
  $ctrl.ClearItem = function(event){
    $ctrl.data.name = '';
    $ctrl.data.id = undefined;
    $ctrl.data._fromItem = undefined;
    $ctrl.data._suggestCnt = 0;
    $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(event && $ctrl.onSelect) $ctrl.onSelect({"item": undefined});
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var data = $http.get(appRoutes.url_for('список проектов'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("ProjectData", Data)

.component('projectItem', {
  templateUrl: "project/item",
  //~ scope: {},
  bindings: {
    data: '<',
    onSelect: '&', // data-on-select="$ctrl.OnSelectPrpoject(item)"

  },
  controller: Component
})

;

}());