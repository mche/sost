(function () {'use strict';
/*
*/

var moduleName = "ProfileItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ProfileData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  /*$ctrl.WatchItem = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.item._watch) $scope.$watch(//console.log("set watcher $ctrl.data", 
      function(scope) { return $ctrl.item; },
      function(newValue, oldValue) {
        
        //~ console.log(" ProfileItem watch item ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $ctrl.data.id) 
        if (newValue.id) $timeout(function(){
          var item = $ctrl.data.filter(function(it){return it.id == newValue.id;}).pop();
          
          if(item) $ctrl.SetItem(item);
          //~ else console.log("None project SetItem");
          
        });
        //~ else $ctrl.ClearInput();
      },
      true// !!!!
    );
    $ctrl.item._watch = true;
  };*/
  
  $ctrl.$onInit = function(){
    if(!$ctrl.item) $ctrl.item = {};
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.autocomplete = [];
    
    if(!$ctrl.data) $ctrl.data = ProfileData.Load();//$ctrl.LoadData();
    
    if ($ctrl.data && $ctrl.data.then) $ctrl.data.then(function(resp){
      $ctrl.data=resp.data;
      $ctrl.ready = true;
    })
    
  };
  
  /*$ctrl.LoadData = function(){
    if(!$ctrl.item.id) $ctrl.item.title = '';
    //~ return $http.get(appRoutes.url_for('список профилей'))
    return ProfileData.Load()
      .then(function(resp){
        $ctrl.data=resp.data;
      });
    
  };*/
  
  $ctrl.InitInput = function(){// ng-init input textfield
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data/*.filter($ctrl.FilterData)*/.map(function(val) {
      var title = val.names.join(' ');
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;}));
   
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        var html = arguments[3].options.formatResultsSingle(suggestion, currentValue /*,arguments[2],  arguments[3],*/);
        if (suggestion.data.id && $ctrl.param.autocompleteClass) return $(html).addClass($ctrl.param.autocompleteClass).get(0).outerHTML;
        return html;
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.item._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.item.id = undefined;},
      //~ onHide: function (container) {}
      
    });
    
    //~ $ctrl.WatchItem();
    
    if($ctrl.item.id) {
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id}).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
      
    }
    
  };

  $ctrl.SetItem = function(item, onSelect){
    $ctrl.item.title=item.names.join(' ');
    $ctrl.item.id=item.id;
    $ctrl.item._fromItem = angular.copy(item);
    //~ $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.item.title.length === 0) $ctrl.ClearInput($ctrl.onSelect);
    else if($ctrl.item.id) {
      $ctrl.item.id = undefined;
      $ctrl.item._fromItem = undefined;
      //~ $ctrl.showListBtn = true;
      $ctrl.InitInput();
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
    $timeout(function(){
      var ac = $ctrl.textField.autocomplete();
      if(ac) ac.toggleAll();
      
    });
    
    //~ if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.ClearInput = function(onSelect){
    $ctrl.item.title = '';
    $ctrl.item.id = undefined;
    $ctrl.item._suggestCnt = 0;
    //~ $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(onSelect) onSelect({"item": undefined});
  };
  
  $ctrl.InputClass = function(){
    //~ return {'deep-orange-text': !($ctrl.item.id || !$ctrl.item.title.length || $ctrl.item._suggestCnt)}
    if ($ctrl.item.id) return $ctrl.param.inputClass || $ctrl.param.textInputClass || '';
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
    item: '<',
    data: '<', // then
    param: '<',
    onSelect: '&',

  },
  controller: Component
})

;

}());