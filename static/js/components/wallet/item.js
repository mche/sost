(function () {'use strict';
/*
*/

var moduleName = "WalletItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, $WalletData) {
  var $c = this;
  //~ $scope.$timeout = $timeout;
  
  $c.$onInit = function(){
    if(!$c.data) $c.data = {};
    if(!$c.param) $c.param = {};
    $c.autocomplete = [];

    $c.LoadData().then(function(){
      //~ $c.showListBtn = (!$c.data.title || $c.data.title.length === 0);
      $c.ready = true;
      
    });
    
  };
  
  $c.LoadData = function(){
    
    if(!$c.data.id) $c.data.title = '';
    //~ return $http.get(appRoutes.url_for('список кошельков', project || 0))//, [3], {"_":new Date().getTime()}
    return $WalletData.Load()
      .then(function(resp){
        $c.dataList=$WalletData.Data();
      });
    
  };
  
  $c.ProjectId = function(){
    var pid = $c.data['проект'];
    if(pid && pid.id !== undefined) pid = pid.id;
    if (!pid) pid = $c.param['проект'];
    if(pid && pid.id !== undefined) pid = pid.id;// 0 - все проекты
    //~ if (pid === undefined ) pid = $c.data['проект'] || $c.param['проект'];
    //~ console.log("ProjectId", pid);
    return pid;
  };
  
  $c.FilterData = function(item){//this - проект id
    //~ var pid = $c.ProjectId();
    return !this || item['проект/id'] == this;
  };
  
  $c.InitInput = function(){// ng-init input textfield
    $c.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $c.ProjectId();
    //~ console.log("Wallet InitInput", pid);
   
    $c.autocomplete.length = 0;
    Array.prototype.push.apply($c.autocomplete, $c.dataList.filter($c.FilterData, pid).map(function(val) {
      var title = pid ? val.title : val['проект'] + ': '+ val.title;
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    $c.textField.autocomplete({
      lookup: $c.autocomplete,
      appendTo: $c.textField.parent(),
      formatResult: function (suggestion, currentValue) {
        if (pid) return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        return arguments[3].options.formatResultsArray([suggestion.data['проект'], suggestion.data.title], currentValue);
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $c.data=suggestion.data;
          $c.SetItem(suggestion.data, $c.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$c.data._suggestCnt = suggestions.length; if(suggestions.length) $c.data.id = undefined;},
      onHide: function (container) {}
      
    });
    
    if($c.data.id) {
      var item = $c.dataList.filter(function(item){ return item.id == $c.data.id; }).pop();
      if(item) $c.SetItem(item);//, $c.onSelect
      
    }
    
  };
  $c.SetItem = function(item, onSelect){
    var pid = $c.ProjectId();
    $c.data.title=pid ? item.title : item['проект'] + ': '+ item.title;
    $c.data.id=item.id;
    $c.data._fromItem = angular.copy(item);
    //~ $c.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $c.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $c.ChangeInput = function(){
    if($c.data.title.length === 0) $c.ClearInput();
    else if($c.data.id) {
      $c.data.id = undefined;
      $c.data._fromItem = undefined;
      $c.InitInput();
      //~ $c.textField.blur().focus();
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
    var ac = $c.textField.autocomplete();
    ac.toggleAll();
    //~ if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $c.ClearInput = function(){
    $c.data.title = '';
    $c.data.id = undefined;
    $c.data._suggestCnt = 0;
    $c.data._fromItem = undefined;
    $c.InitInput();
    if($c.onSelect) $c.onSelect({"item": undefined});
  };
  
  $c.InputClass = function(){
    //~ if (!!$c.item.id)
    return $c.param.textInputClass || '';/// 'orange-text text-darken-4';
    //~ : !!$c.data.id, 'deep-orange-text000': !($c.data.id || !$c.data.title.length || $c.data._suggestCnt)}
    
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  //~ var data = $http.get(appRoutes.url_for('список кошельков', 0));
  //~ return {
    //~ Load: function() {return data;}
  //~ };
  var then, data = [], $data = {},
    $this = {
    Load: function() {return then;},
    Refresh: function(){
      then = $http.get(appRoutes.url_for('список кошельков', 0))
        .then(function(resp){
          data.splice(0, data.length);
          for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
          Array.prototype.push.apply(data, resp.data);
        });
      
      return $this;
    },
    Data: function(){ return data; },
    "$Data": function(){///хэш
      if (Object.keys($data).length === 0 ) data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $data);
      return $data;
    },
  };
  return $this.Refresh();
  
};

/*=============================================================*/

module

.factory("$WalletData", Data)

.component('walletItem', {
  controllerAs: '$c',
  templateUrl: "wallet/item",
  //~ scope: {},
  bindings: {
    data: '<',
    param: '<',
    onSelect: '&',

  },
  controller: Component
})

;

}());