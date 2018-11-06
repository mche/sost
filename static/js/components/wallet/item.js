(function () {'use strict';
/*
*/

var moduleName = "WalletItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, WalletData) {
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
    //~ return $http.get(appRoutes.url_for('список кошельков', project || 0))//, [3], {"_":new Date().getTime()}
    return WalletData.Load()
      .then(function(resp){
        $ctrl.dataList=WalletData.Data();
      });
    
  };
  
  $ctrl.ProjectId = function(){
    var pid = $ctrl.data['проект'];
    if(pid && pid.id !== undefined) pid = pid.id;
    if (!pid) pid = $ctrl.param['проект'];
    if(pid && pid.id !== undefined) pid = pid.id;// 0 - все проекты
    //~ if (pid === undefined ) pid = $ctrl.data['проект'] || $ctrl.param['проект'];
    //~ console.log("ProjectId", pid);
    return pid;
  };
  
  $ctrl.FilterData = function(item){//this - проект id
    //~ var pid = $ctrl.ProjectId();
    return !this || item['проект/id'] == this;
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $ctrl.ProjectId();
    //~ console.log("Wallet InitInput", pid);
   
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.dataList.filter($ctrl.FilterData, pid).map(function(val) {
      var title = pid ? val.title : val['проект'] + ': '+ val.title;
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {
        if (pid) return arguments[3].options.formatResultsSingle(suggestion, currentValue);
        return arguments[3].options.formatResultsArray([suggestion.data['проект'], suggestion.data.title], currentValue);
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
    
    if($ctrl.data.id) {
      var item = $ctrl.dataList.filter(function(item){ return item.id == $ctrl.data.id; }).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
      
    }
    
  };
  $ctrl.SetItem = function(item, onSelect){
    var pid = $ctrl.ProjectId();
    $ctrl.data.title=pid ? item.title : item['проект'] + ': '+ item.title;
    $ctrl.data.id=item.id;
    $ctrl.data._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if($ctrl.onSelect) $ctrl.onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearInput();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      $ctrl.data._fromItem = undefined;
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
    ac.toggleAll();
    //~ if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.ClearInput = function(){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._suggestCnt = 0;
    $ctrl.InitInput();
    if($ctrl.onSelect) $ctrl.onSelect({"item": undefined});
  };
  
  $ctrl.InputClass = function(){
    //~ if (!!$ctrl.item.id)
    return $ctrl.param.textInputClass || '';/// 'orange-text text-darken-4';
    //~ : !!$ctrl.data.id, 'deep-orange-text000': !($ctrl.data.id || !$ctrl.data.title.length || $ctrl.data._suggestCnt)}
    
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

.factory("WalletData", Data)

.component('walletItem', {
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