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
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.autocomplete = [];

    $ctrl.LoadData().then(function(){
      //~ $ctrl.showListBtn = (!$ctrl.data.title || $ctrl.data.title.length === 0);
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    if(!$ctrl.data.id) $ctrl.data.title = '';
    //~ return $http.get(appRoutes.url_for('список профилей'))
    return ProfileData.Load()
      .then(function(resp){
        $ctrl.dataList=resp.data;
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.dataList/*.filter($ctrl.FilterData)*/.map(function(val) {
      var title = val.names.join(' ');
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
   
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      //~ onHide: function (container) {}
      
    });
    
    if($ctrl.data.id) {
      var item = $ctrl.dataList.filter(function(item){ return item.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item, $ctrl.onSelect);
      
    }
    
  };

  $ctrl.SetItem = function(item, onSelect){
    $ctrl.data.title=item.names.join(' ');
    $ctrl.data.id=item.id;
    $ctrl.data._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearInput();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      $ctrl.data._fromItem = undefined;
      //~ $ctrl.showListBtn = true;
      $ctrl.InitInput();
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
    ac.toggleAll();
    if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.ClearInput = function(){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._suggestCnt = 0;
    //~ $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if($ctrl.onSelect) $ctrl.onSelect({"item": undefined});
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