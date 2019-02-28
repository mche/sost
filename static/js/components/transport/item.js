(function () {'use strict';
/*
  Позиции фильтруются перевозчиком и категорией:
  $c.param.contragent и $c.param.category
  Слушатель сбрасывает позицию если они меняются
  При установке позиции транспорта выставляются соответствующие перевозчик и категория
*/

var moduleName = "TransportItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, TransportData) {
  var $c = this;
  //~ $scope.$timeout = $timeout;
  
  $c.$onInit = function(){
    if(!$c.item) $c.item = {};
    if(!$c.param) $c.param = {};
    $c.autocomplete = [];

    $c.LoadData().then(function(){
      //~ $c.showListBtn = (!$c.item.title || $c.item.title.length === 0);
      $c.ready = true;
      
    });
    
  };
  
  $c.LoadData = function(){
    //~ return $http.get(appRoutes.url_for('список контрагентов'))//, [3], {"_":new Date().getTime()}
    return TransportData.Load()
      .then(function(resp){
        $c.data = resp.data;//
      });
    
  };
  /*слушать изменения категории и перевозчика*/
  /*$c.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$c.param._watch) $scope.$watch(//console.log("set watcher $c.item", 
      function(scope) { return $c.param; },
      function(newValue, oldValue) {
        //~ 
        //~ if(newValue && newValue.id && newValue.id != $c.item.id) 
        //~ if ( newValue['категория'] !== $c.param['категория'])
        var c_old = oldValue['категория'].selectedItem && oldValue['категория'].selectedItem.id;
        var c_new = newValue['категория'].selectedItem && newValue['категория'].selectedItem.id;
        var per_old = oldValue['перевозчик'].id;//_fromItem;
        var per_new = newValue['перевозчик'].id;//_fromItem;
        //~ var zak_old = oldValue['заказчик'].id;//_fromItem;
        //~ var zak_new = newValue['заказчик'].id;//_fromItem;
        if( c_old != c_new || per_old != per_new  ) $timeout(function(){//|| zak_new != zak_old
          //~ console.log(" TransportItem WatchParam ", newValue, oldValue);
          $c.InitInput(true);
        });
        //~ else if (!newValue['перевозчик'].id) $c.ClearInput();
      },
      true// !!!!
    );
    $c.param._watch = true;
  };*/
  $c.FilterData = function(item){// this - $c.param
    if (!this || !this['перевозчик']) return true;
    var pid = this['перевозчик'].id;
    //~ var our = !!(item['проект/id'] && item['проект/id'][0]) === !!this['наш транспорт'];
    if ( pid === null ) return false;//новый перевозчик
    //~ var zid = this['заказчик'].id;//&& (!zid ||  item['перевозчик/id'] === null) 
    var cid = [];
    if(this['категория'] && this['категория'].selectedItem && this['категория'].selectedItem.id) cid.push(this['категория'].selectedItem.id);
    else if(this['категория'] && angular.isArray(this['категория'])) cid = this['категория'];
    
    return ( !pid || !item['перевозчик/id'] ||  item['перевозчик/id'].some(function(id){
        if (!angular.isArray(pid)) return id == pid;//'!'+id != pid && (/^!/.test(pid) || 
        return pid.some(function(_pid) { return id==_pid; });//'!'+id != _pid && (/^!/.test(_pid) || 
        
      }))
      && (!cid.length || cid.some(function(_cid){
        return item['категория/id'] == _cid || item['категории/id'].some(function(id){return id == _cid;});
        }))
  };
  //~ $c.FormatData = function()
  
  $c.InitInput = function(){// ng-init input textfield
    if(!$c.textField) $c.textField = $('input[type="text"]', $($element[0]));
    
    var pid = $c.param && $c.param['перевозчик'] && $c.param['перевозчик'].id;
    if (pid === null && $c.item.id) {/// сброс уст машины при новом перевозчике
      $c.item.id = undefined;
      $c.item.title = undefined;
    }
    //~ var cid = $c.param && $c.param['категория'] && $c.param['категория'].selectedItem.id;
    
    //~ console.log("TransportItem InitInput", $c.param);
    //~ var filterData = $c.param && $c.param['перевозчик'] && $c.param['перевозчик'].FilterTransport || $c.FilterData;
    $c.autocomplete.length = 0;
    //~ if($c.param['наш транспорт']) 
    Array.prototype.push.apply($c.autocomplete, $c.data.filter($c.FilterData, $c.param).map(function(tr) {
      var title = '';
      //~ tr['наш транспорт'] = tr['проект/id'] && !!tr['проект/id'][0];///в sql
      if(pid) title += (tr['наш транспорт'] ? '★' : '') + tr.title;
      else /* if (tr['перевозчик']) */ title += (tr['наш транспорт'] ? '★' : tr['перевозчик'] +': ')+ tr.title;
      //~ else title += tr.title2;
      //~ if(!cid) 
      title += ' {'+tr['категории'].slice(1).join(' ∙ ')+'}';
      //~ if($c.item.id  && $c.item.id == tr.id) $c.item.title = name;
      return {value: title, data:tr};
    }).sort(function (a, b) {
      if (a.data['наш транспорт'] && !b.data['наш транспорт']) { return -1; }
      if (!a.data['наш транспорт'] && b.data['наш транспорт']) { return 1; }
      if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
      if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
      return 0;
    }));
    
    //~ if (pid) TransportData.Refresh(0, pid).Load().then(function(resp){ })
   
    $c.textField.autocomplete({
      "containerCss": $c.param.css && ($c.param.css['autocomplete container'] || $c.param.css['suggestions container']),
      suggestionClass: "autocomplete-suggestion blue-text text-darken-2",
      lookup: $c.autocomplete,
      appendTo: $c.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        var res = arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (suggestion.data['наш транспорт']) return $(res).addClass('orange-text text-darken-3').get(0).outerHTML;
        return res;
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $c.item=suggestion.data;
          $c.SetItem(suggestion.data, $c.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$c.item._suggests = suggestions; /**if(suggestions.length) $c.item.id = undefined;**/},
      onHide: function (container) {}
      
    });
    
    //~ $c.WatchParam();
    
    if($c.item.id) {//!skip_set && 
      var item = $c.data.filter(function(item){ return item.id == $c.item.id}).pop();
      if(item) $timeout(function(){ $c.SetItem(item); })//, $c.onSelect
      
    }
    
  };
  
  $c.ChangeInput = function(){
    if($c.item.title.length === 0) $c.ClearInput($c.onSelect);
    else if($c.item.id) {
      $c.item.id = undefined;
      $c.item._fromItem = undefined;
      //~ $c.showListBtn = true;
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
  $c.ToggleListBtn = function(event){
    event.stopPropagation();
    var ac = $c.textField.autocomplete();
    if(ac) ac.toggleAll();
    //~ if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };
  
  $c.SetItem = function(item, onSelect){
    $c.item.title=(item['проект/id'] && item['проект/id'][0] ? '★' : '') +item.title;
    $c.item.id=item.id;
    $c.item._fromItem = item;
    //~ $c.showListBtn = false;
    if(onSelect) onSelect({"item": item});
    var ac = $c.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $c.ClearInput = function(onSelect){
    $c.item.title = '';
    $c.item.id = undefined;
    $c.item._fromItem = undefined;
    $c.item._suggestCnt = 0;
    if($c.param['перевозчик'] && $c.param['перевозчик'].id === null )$c.param['перевозчик'].id = undefined;
    //~ $c.showListBtn = true;
    
    
    $timeout(function(){
      if(onSelect) onSelect({"item": undefined});
      $c.InitInput();
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
  controllerAs: '$c',
  templateUrl: "transport/item",
  //~ scope: {},
  bindings: {
    item:'<',
    data: '<',// список
    param:'<',
    onSelect: '&', // data-on-select="$c.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());