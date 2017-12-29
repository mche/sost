(function () {'use strict';
/*
  Позиции фильтруются перевозчиком и категорией:
  $ctrl.param.contragent и $ctrl.param.category
  Слушатель сбрасывает позицию если они меняются
  При установке позиции транспорта выставляются соответствующие перевозчик и категория
*/

var moduleName = "TransportItem";
try {angular.module(moduleName); return;} catch(e) { } 
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
  /*$ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
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
  };*/
  $ctrl.FilterData = function(item){// this - $ctrl.param
    if (!this || !this['перевозчик']) return true;
    var pid = this['перевозчик'].id;
    //~ var our = !!(item['проект/id'] && item['проект/id'][0]) === !!this['наш транспорт'];
    if ( pid === null ) return false;//новый перевозчик
    //~ var zid = this['заказчик'].id;//&& (!zid ||  item['перевозчик/id'] === null) 
    var cid = [];
    if(this['категория'] && this['категория'].selectedItem && this['категория'].selectedItem.id) cid.push(this['категория'].selectedItem.id);
    else if(this['категория'] && angular.isArray(this['категория'])) cid = this['категория'];
    
    return ( !pid || item['перевозчик/id'].some(function(id){
        if (!angular.isArray(pid)) return id == pid;//'!'+id != pid && (/^!/.test(pid) || 
        return pid.some(function(_pid) { return id==_pid; });//'!'+id != _pid && (/^!/.test(_pid) || 
        
      }))
      && (!cid.length || cid.some(function(_cid){
        return item['категория/id'] == _cid || item['категории/id'].some(function(id){return id == _cid;});
        }))
  };
  //~ $ctrl.FormatData = function()
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $ctrl.param && $ctrl.param['перевозчик'] && $ctrl.param['перевозчик'].id;
    if (pid === null && $ctrl.item.id) {/// сброс уст машины при новом перевозчике
      $ctrl.item.id = undefined;
      $ctrl.item.title = undefined;
    }
    //~ var cid = $ctrl.param && $ctrl.param['категория'] && $ctrl.param['категория'].selectedItem.id;
    
    //~ console.log("TransportItem InitInput", $ctrl.param);
    //~ var filterData = $ctrl.param && $ctrl.param['перевозчик'] && $ctrl.param['перевозчик'].FilterTransport || $ctrl.FilterData;
    $ctrl.autocomplete.length = 0;
    //~ if($ctrl.param['наш транспорт']) 
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data.filter($ctrl.FilterData, $ctrl.param).map(function(tr) {
      var title = '';
      if(pid) title += (tr['проект/id'] && tr['проект/id'][0] ? '★' : '') + tr.title;
      else /* if (tr['перевозчик']) */ title += (tr['проект/id'] && tr['проект/id'][0] ? '★' : tr['перевозчик'] +': ')+ tr.title;
      //~ else title += tr.title2;
      //~ if(!cid) 
      title += ' {'+tr['категории'].slice(1).join(' ∙ ')+'}';
      //~ if($ctrl.item.id  && $ctrl.item.id == tr.id) $ctrl.item.title = name;
      return {value: title, data:tr};
    }).sort(function (a, b) {
      if (!(a.data['проект/id'] && !a.data['проект/id'][0]) && !!(b.data['проект/id'] && !b.data['проект/id'][0])) { return -1; }
      if (!!(a.data['проект/id'] && !a.data['проект/id'][0]) && !(b.data['проект/id'] && !b.data['проект/id'][0])) { return 1; }
      if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
      if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
      return 0;
    }));
    
    //~ if (pid) TransportData.Refresh(0, pid).Load().then(function(resp){ })
   
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
    
    //~ $ctrl.WatchParam();
    
    if($ctrl.item.id) {//!skip_set && 
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id}).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
      
    }
    
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.item.title.length === 0) $ctrl.ClearInput($ctrl.onSelect);
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
  $ctrl.ToggleListBtn = function(event){
    event.stopPropagation();
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.toggleAll();
    if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $ctrl.SetItem = function(item, onSelect){
    $ctrl.item.title=(item['проект/id'] && item['проект/id'][0] ? '★' : '') +item.title;
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
    if($ctrl.param['перевозчик'] && $ctrl.param['перевозчик'].id === null )$ctrl.param['перевозчик'].id = undefined;
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
    Refresh: function(cat_id, con_id) { data = $http.get(appRoutes.url_for('список транспорта', [cat_id || 0, con_id || 0])); return $this; } // TransportData.Refresh().Load().then...
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