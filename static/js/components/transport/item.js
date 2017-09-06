(function () {'use strict';
/*
  Позиции фильтруются перевозчиком и категорией:
  $ctrl.param.contragent и $ctrl.param.category
  Слушатель сбрасывает позицию если они меняются
  При установке позиции транспорта выставляются соответствующие перевозчик и категория
*/

var moduleName = "TransportItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, TransportData) {
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
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return TransportData.Load()
      .then(function(resp){
        $ctrl.dataList = resp.data;//
      });
    
  };
  
  $ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.param._watch) $scope.$watch(//console.log("set watcher $ctrl.data", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        //~ console.log(" TransportItem watch data ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $ctrl.data.id) 
        //~ if ( newValue['категория'] !== $ctrl.param['категория'])
        var c_old = oldValue['категория'].selectedItem && oldValue['категория'].selectedItem.id;
        var c_new = newValue['категория'].selectedItem && newValue['категория'].selectedItem.id;
        var per_old = oldValue['перевозчик'].id;//_fromItem;
        var per_new = newValue['перевозчик'].id;//_fromItem;
        var zak_old = oldValue['заказчик'].id;//_fromItem;
        var zak_new = newValue['заказчик'].id;//_fromItem;
        if( c_old != c_new || per_old != per_new || zak_new != zak_old ) $timeout(function(){
          $ctrl.InitInput(true);
        });
        //~ else if (!newValue['перевозчик'].id) $ctrl.ClearInput();
      },
      true// !!!!
    );
    $ctrl.param._watch = true;
  };
  
  $ctrl.FilterData = function(item){
    var pid = $ctrl.param['перевозчик'].id;
    var zid = $ctrl.param['заказчик'].id;
    var cid = $ctrl.param['категория'].selectedItem.id;
    return ((!pid && (!zid ||  item['перевозчик/id'] === null) ) || item['перевозчик/id'] == pid) && (!cid || item['категория/id'] == cid || item['категории/id'].some(function(id){return id == cid;}));
  };
  
  $ctrl.InitInput = function(skip_set){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $ctrl.param['перевозчик'].id;
    var cid = $ctrl.param['категория'].selectedItem.id;
    
    //~ console.log("InitInput", $ctrl.param)
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.dataList.filter($ctrl.FilterData).map(function(val) {
      
      //~ if(pid && val['проект/id'] != pid ) return;
      var title = '';
      if(pid) title += val.title;
      else if (val['перевозчик']) title += val['перевозчик']+': '+ val.title;
      else title += val.title2;
      //~ if(!cid) 
      title += ' ('+val['категории'].slice(1).join(' ∙ ')+')';
      //~ if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = name;
      return {value: title, data:val};
    }).sort(function (a, b) { if(!a.data['перевозчик/id'] && !!b.data['перевозчик/id']) { return -1; } if(!!a.data['перевозчик/id'] && !b.data['перевозчик/id']) { return 1; } if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;}));
   
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
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
    
    $ctrl.WatchParam();
    
    if(!skip_set && $ctrl.data.id) {
      var item = $ctrl.dataList.filter(function(item){ return item.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item, $ctrl.onSelect);
      
    }
    
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearInput();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      $ctrl.data._fromItem = undefined;
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
    $ctrl.data.title=item.title2;
    $ctrl.data.id=item.id;
    $ctrl.data._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if($ctrl.onSelect) $ctrl.onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ClearInput = function(onSelect){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._fromItem = undefined;
    $ctrl.data._suggestCnt = 0;
    if($ctrl.param['перевозчик'].id === null )$ctrl.param['перевозчик'].id = undefined;
    //~ $ctrl.showListBtn = true;
    
    
    $timeout(function(){
      if(onSelect) onSelect({"item": undefined});
      $ctrl.InitInput();
    });
  };
  
  
};

/*----------------------------------------------------------------------------------*/
var Data  = function($http, appRoutes){
  var data, $this = {
    Load: function() { return data; },
    Refresh: function() { data = $http.get(appRoutes.url_for('список транспорта', [0,0])); return $this; } // TransportData.Refresh().Load().then...
  };
  
  return $this.Refresh();
};

/*=============================================================*/

module

.factory("TransportData", Data)

.component('transportItem', {
  templateUrl: "transport/item",
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