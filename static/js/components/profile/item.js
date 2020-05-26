(function () {'use strict';
/*
*/

var moduleName = "ProfileItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ProfileData) {
  var $c = this;
  //~ $scope.$timeout = $timeout;
  /*$c.WatchItem = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$c.item._watch) $scope.$watch(//console.log("set watcher $c.data", 
      function(scope) { return $c.item; },
      function(newValue, oldValue) {
        
        //~ console.log(" ProfileItem watch item ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $c.data.id) 
        if (newValue.id) $timeout(function(){
          var item = $c.data.filter(function(it){return it.id == newValue.id;}).pop();
          
          if(item) $c.SetItem(item);
          //~ else console.log("None project SetItem");
          
        });
        //~ else $c.ClearInput();
      },
      true// !!!!
    );
    $c.item._watch = true;
  };*/
  
  $c.$onInit = function(){
    if(!$c.item) $c.item = {};
    if(!$c.param) $c.param = {};
    $c.autocomplete = [];
    
    if(!$c.data) $c.data = ProfileData.Load();//$c.LoadData();
    
    if ($c.data && $c.data.then) $c.data.then(function(resp){
      $c.data=resp.data;
      $c.ready = true;
    })
    
  };
  
  /*$c.LoadData = function(){
    if(!$c.item.id) $c.item.title = '';
    //~ return $http.get(appRoutes.url_for('список профилей'))
    return ProfileData.Load()
      .then(function(resp){
        $c.data=resp.data;
      });
    
  };*/
  
  $c.InitInput = function(){// ng-init input textfield
    $c.textField = $('input[type="text"]', $($element[0]));
    
    $c.autocomplete.length = 0;
    //~ Array.prototype.push.apply(
    $c.autocomplete.push(...$c.data/*.filter($c.FilterData)*/.map(function(val) {
      var title = val.names.join(' ');
      return {value: title, data:val};
    }).sort(function (a, b) {
      if (a.data.disable && !b.data.disable) return 1;
      if (b.data.disable && !a.data.disable) return -1;
      if (a.value.toLowerCase() > b.value.toLowerCase())  return 1; 
      if (a.value.toLowerCase() < b.value.toLowerCase())  return -1; 
      return 0;
    }));
   
    $c.textField.autocomplete({
      "containerCss": $c.param.css && ($c.param.css['autocomplete container'] || $c.param.css['suggestions container']),
      lookup: $c.autocomplete,
      appendTo: $c.textField.parent(),
      formatResult: function (suggestion, currentValue) {
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        var html = arguments[3].options.formatResultsSingle(suggestion, currentValue /*,arguments[2],  arguments[3],*/);
        if (suggestion.data.id && !suggestion.data.disable && $c.param.autocompleteClass) return $(html).addClass($c.param.autocompleteClass).get(0).outerHTML;
        if (suggestion.data.id && suggestion.data.disable && $c.param.autocompleteClass) return $(html).addClass('grey-text').get(0).outerHTML;
        return html;
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          $c.SetItem(suggestion.data, $c.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$c.item._suggestCnt = suggestions.length; if(suggestions.length) $c.item.id = undefined;},
      //~ onHide: function (container) {}
      
    });
    
    //~ $c.WatchItem();
    
    if($c.item.id) {
      var item = $c.data.filter(function(item){ return item.id == $c.item.id}).pop();
      if(item) $c.SetItem(item);//, $c.onSelect
      
    }
    
  };

  $c.SetItem = function(item, onSelect){
    $c.item.title=item.names.join(' ');
    $c.item.id=item.id;
    $c.item._fromItem = angular.copy(item);
    //~ $c.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $c.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $c.ChangeInput = function(){
    if($c.item.title.length === 0) $c.ClearInput($c.onSelect);
    else if($c.item.id) {
      $c.item.id = undefined;
      $c.item._fromItem = undefined;
      //~ $c.showListBtn = true;
      $c.InitInput();
    }
  };
  /*var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = $c.textField.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };*/
  $c.ToggleListBtn = function(){
    $timeout(function(){
      var ac = $c.textField.autocomplete();
      if(ac) ac.toggleAll();
      
    });
    
    //~ if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $c.ClearInput = function(onSelect){
    $c.item.title = '';
    $c.item.id = undefined;
    $c.item._suggestCnt = 0;
    //~ $c.showListBtn = true;
    $c.InitInput();
    if(onSelect) onSelect({"item": undefined});
  };
  
  $c.InputClass = function(){
    //~ return {'deep-orange-text': !($c.item.id || !$c.item.title.length || $c.item._suggestCnt)}
    if ($c.item.id) return $c.param.inputClass || $c.param.textInputClass || '';
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
  controllerAs: '$c',
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