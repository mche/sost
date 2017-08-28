(function () {'use strict';
/*
*/

var moduleName = "ContragentItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ContragentData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = {};
    if(!$ctrl.param) $ctrl.param = {};

    $ctrl.LoadData().then(function(){
      //~ $ctrl.showListBtn = (!$ctrl.data.title || $ctrl.data.title.length === 0);
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return ContragentData.Load()
      .then(function(resp){
          $ctrl.autocomplete = [];
          angular.forEach(resp.data, function(val) {
            //~ if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = val.title;
            $ctrl.autocomplete.push({value: val.title, data:val});
          });
          
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
   
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      //~ preserveInput: false,
      appendTo: $ctrl.textField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      onHide: function (container) {}
      
    });
    
    if($ctrl.data.id) {
      var item = $ctrl.autocomplete.filter(function(item){ return item.data.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item.data, $ctrl.onSelect);
      
    }
    
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearInput();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      //~ $ctrl.showListBtn = true;
      $ctrl.InitInput();
      //~ $ctrl.textField.blur().focus();
    }
  };
  var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };
  $ctrl.ToggleListBtn = function(){
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.toggleAll();
    if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.SetItem = function(item, onSelect){
    $ctrl.data.title=item.title;
    $ctrl.data.id=item.id;
    $ctrl.data._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if($ctrl.onSelect) $ctrl.onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ClearInput = function(event){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._suggestCnt = 0;
    //~ $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(event && $ctrl.onSelect) $ctrl.onSelect({"item": undefined});
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var data = $http.get(appRoutes.url_for('список контрагентов'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("ContragentData", Data)

.component('contragentItem', {
  templateUrl: "contragent/item",
  //~ scope: {},
  bindings: {
    data: '<',
    param:'<',
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());