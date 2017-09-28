(function () {'use strict';
/*
*/

var moduleName = "ContragentItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, ContragentData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.item) $ctrl.item = {};
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.autocomplete = [];
    
    if ($ctrl.data && $ctrl.data.then) $ctrl.data.then(function(resp){ $ctrl.data=resp.data; $ctrl.ready = true; });
    else $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return ContragentData.Load()
      .then(function(resp){
        $ctrl.data=resp.data;
      });
    
  };
  
  /*$ctrl.WatchItem = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl._watchItem) $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.item; },
      function(newValue, oldValue) {
        
        if(newValue && !oldValue.id && newValue.id && newValue._fromItem && newValue._fromItem !== oldValue._fromItem && newValue.id != oldValue.id) $timeout(function(){
          console.log(" ContragentItem watch data SetItem", newValue, oldValue);
          if (angular.isArray(newValue.id)) {
            //~ var array_id = newValue.id;
            //~ $ctrl.item = {};
            $ctrl.InitInput();//function(item) { return array_id.some(function(id){ return item.id==id; }); });
          } else {
            var item = $ctrl.data.filter(function(it){return it.id == newValue.id;}).pop();
            if(item) $ctrl.SetItem(item);
          }
          
          //~ else console.log("None project SetItem");
          
        });
      },
      true// !!!!
    );
    $ctrl._watchItem = true;
  };*/
  /*$ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl._watchParam) $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        console.log("ContragentItem WatchParam", newValue, oldValue);
        if(newValue.filter != oldValue.filter) $ctrl.InitInput();
      },
      true// !!!!
    );
    $ctrl._watchParam = true;
  };*/
  
  $ctrl.InitInput = function(filterData){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    //~ console.log("ContragentItem InitInput", $ctrl.item, filterData);
    
    var array_id;
    if ($ctrl.item.id && angular.isArray($ctrl.item.id)) {
      array_id =  $ctrl.item.id;
      $ctrl.item.id = undefined;
    }
    
    if(!filterData) filterData = function(item){
      if (!array_id) return true;
      return array_id.some(function(id){ return id == item.id; });
      
    };
   
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data.filter(filterData).map(function(val) {
      //~ var title = (!!val['проект/id'] ?  '★' : '')+val.title;
      if (!!val['проект/id'] && !/^★/.test(val.title)) val.title = '★'+val.title;
      return {value: val.title, data:val};
    }).sort(function (a, b) {
      if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
      if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
      return 0;
    }));
    
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $ctrl.item=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.item._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.item.id = undefined;},
      onHide: function (container) {}
      
    });
    
    //~ $ctrl.WatchItem();
    //~ $ctrl.WatchParam();
    
    if($ctrl.item.id) {
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id}).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
    }
    
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.item.title.length === 0) $ctrl.ClearInput();
    else if($ctrl.item.id) {
      $ctrl.item.id = undefined;
      $ctrl.item._fromItem = undefined;
      //~ $ctrl.showListBtn = true;
      $ctrl.InitInput();
      //~ $ctrl.textField.blur().focus();
      
    }
    if($ctrl.onSelect) $ctrl.onSelect({"item": $ctrl.item});
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
    console.log("ContragentItem SetItem", item);
    //~ var title = (!!item['проект/id'] ?  '★' : '') + item.title;
    $ctrl.item.title = item.title;
    $ctrl.item.id=item.id;
    $ctrl.item._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ClearInput = function(event){
    $ctrl.item.title = '';
    $ctrl.item.id = undefined;
    $ctrl.item._fromItem = undefined;
    $ctrl.item._suggestCnt = 0;
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
  
};

/*=============================================================*/

module

.factory("ContragentData", Data)

.component('contragentItem', {
  templateUrl: "contragent/item",
  //~ scope: {},
  bindings: {
    item:'<',
    data: '<',
    param:'<',
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());