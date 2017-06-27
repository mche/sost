(function () {'use strict';
/*
*/

var moduleName = "ProfileItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
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
    return $http.get(appRoutes.url_for('список профилей'))
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
          if($ctrl.onSelect) $ctrl.onSelect();
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ChangeInput = function(){
    if ( $ctrl.data.id) $ctrl.data.id = undefined;
    $ctrl.showListBtn = ($ctrl.data.title.length === 0);
    return true;
  };
  
  
  $ctrl.ToggleListBtn = function(){
    var ac = $ctrl.textField.autocomplete();
    ac.toggleAll();
  };
  
  $ctrl.ClearInputBtn = function(){
    $ctrl.data.title = '';
    $ctrl.ChangeInput();
    $ctrl.data._suggestCnt = 0;
    
  };
  
  
};

/*=============================================================*/

module

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