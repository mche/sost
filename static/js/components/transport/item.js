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
    if(!$ctrl.item) $ctrl.item = {};
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.autocomplete = [];

    $ctrl.LoadData().then(function(){
      //~ $ctrl.showListBtn = (!$ctrl.item.title || $ctrl.item.title.length === 0);
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return TransportData.Load()
      .then(function(resp){
        $ctrl.data = resp.data;//
      });
    
  };
  /*слушать изменения категории и перевозчика*/
  $ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.param._watch) $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        //~ 
        //~ if(newValue && newValue.id && newValue.id != $ctrl.item.id) 
        //~ if ( newValue['категория'] !== $ctrl.param['категория'])
        var c_old = oldValue['категория'].selectedItem && oldValue['категория'].selectedItem.id;
        var c_new = newValue['категория'].selectedItem && newValue['категория'].selectedItem.id;
        var per_old = oldValue['перевозчик'].id;//_fromItem;
        var per_new = newValue['перевозчик'].id;//_fromItem;
        //~ var zak_old = oldValue['заказчик'].id;//_fromItem;
        //~ var zak_new = newValue['заказчик'].id;//_fromItem;
        if( c_old != c_new || per_old != per_new  ) $timeout(function(){//|| zak_new != zak_old
          //~ console.log(" TransportItem WatchParam ", newValue, oldValue);
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
    var zid = $ctrl.param['заказчик'].id;//&& (!zid ||  item['перевозчик/id'] === null) 
    var cid = $ctrl.param['категория'].selectedItem.id;
    return ( !pid  || item['перевозчик/id'] == pid) && (!cid || item['категория/id'] == cid || item['категории/id'].some(function(id){return id == cid;}));
  };
  
  $ctrl.InitInput = function(skip_set){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $ctrl.param['перевозчик'].id;
    var cid = $ctrl.param['категория'].selectedItem.id;
    
    //~ console.log("InitInput", $ctrl.param)
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data.filter($ctrl.FilterData).map(function(val) {
      
      //~ if(pid && val['проект/id'] != pid ) return;
      var title = '';
      if(pid) title += val.title;
      else if (val['перевозчик']) title += val['перевозчик']+': '+ val.title;
      else title += val.title2;
      //~ if(!cid) 
      title += ' ('+val['категории'].slice(1).join(' ∙ ')+')';
      //~ if($ctrl.item.id  && $ctrl.item.id == val.id) $ctrl.item.title = name;
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
          //~ $ctrl.item=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.item._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.item.id = undefined;},
      onHide: function (container) {}
      
    });
    
    $ctrl.WatchParam();
    
    if(!skip_set && $ctrl.item.id) {
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id}).pop();
      if(item) $ctrl.SetItem(item, $ctrl.onSelect);//
      
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
    $ctrl.item.title=item.title;
    $ctrl.item.id=item.id;
    $ctrl.item._fromItem = item;
    //~ $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ClearInput = function(onSelect){
    $ctrl.item.title = '';
    $ctrl.item.id = undefined;
    $ctrl.item._fromItem = undefined;
    $ctrl.item._suggestCnt = 0;
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
    item:'<',
    data: '<',// список
    param:'<',
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());