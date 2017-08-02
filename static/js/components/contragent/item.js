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

    $ctrl.LoadData().then(function(){
      $ctrl.showListBtn = (!$ctrl.data.title || $ctrl.data.title.length === 0);
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return ContragentData.Load()
      .then(function(resp){
          $ctrl.autocomplete = [];
          angular.forEach(resp.data, function(val) {
            if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = val.title;
            $ctrl.autocomplete.push({value: val.title, data:val});
          });
          
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    $ctrl.textField = $('input[type="text"]', $($element[0]));
   
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
         //~ console.log(suggestion.data);
        //~ 
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.data.title=suggestion.data.title;
          $ctrl.data.id=suggestion.data.id;
          $ctrl.showListBtn = false;
          if($ctrl.onSelect) $ctrl.onSelect();
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ChangeInput = function(){
    if ( $ctrl.data.id) $ctrl.data.id = undefined;
    $ctrl.showListBtn = ($ctrl.data.title.length === 0);
    return true;
  };
  
  var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    $ctrl.textField.autocomplete().hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };
  $ctrl.ToggleListBtn = function(){
    var ac = $ctrl.textField.autocomplete();
    ac.toggleAll();
    if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.ClearInputBtn = function(){
    $ctrl.data.title = '';
    $ctrl.ChangeInput();
    $ctrl.data._suggestCnt = 0;
    
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
    onSelect: '&',

  },
  controller: Component
})

;

}());