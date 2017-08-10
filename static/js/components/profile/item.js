(function () {'use strict';
/*
*/

var moduleName = "ProfileItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ProfileData) {
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
    if(!$ctrl.data.id) $ctrl.data.title = '';
    //~ return $http.get(appRoutes.url_for('список профилей'))
    return ProfileData.Load()
      .then(function(resp){
          $ctrl.autocomplete = [];
          angular.forEach(resp.data, function(val) {
            var title = val.names.join(' ');
            if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = title;
            $ctrl.autocomplete.push({value: title, data:val});
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
      formatResult: function (suggestion, currentValue) {
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ 
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.data.title=suggestion.data.names.join(' ');
          $ctrl.data.id=suggestion.data.id;
          $ctrl.showListBtn = false;
          if($ctrl.onSelect) $ctrl.onSelect({"item":suggestion.data});
          $ctrl.textField.autocomplete().dispose();
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearInput();
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
    ac.toggleAll();
    if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.ClearInput = function(){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._suggestCnt = 0;
    $ctrl.showListBtn = true;
    $ctrl.InitInput();
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var data = $http.get(appRoutes.url_for('список профилей'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};


/*=============================================================*/

module

.factory("ProfileData", Data)

.component('profileItem', {
  templateUrl: "profile/item",
  //~ scope: {},
  bindings: {
    data: '<',
    onSelect: '&',

  },
  controller: Component
})

;

}());