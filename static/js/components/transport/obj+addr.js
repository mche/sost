(function () {'use strict';
/*
  Список объектов-проектов
  плюс адрес куда для заявки
  
  объекты фильтруются параметром project
  при установке объекта в родительском компоненте уст. проект
*/

var moduleName = "Объект или адрес";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $q, $http, appRoutes, $timeout, $element, ObjectAddrData) {
  var $c = this;
  var $ctrl = this;
  
  $c.$onInit = function(){
    if(!$c.data) $c.data = {};
    $c.lookup = [];
    
    var async = [];
    async.push($c.LoadObj());
    //~ async.push($c.LoadAddr());

    $q.all(async).then(function(){
      //~ $c.showListBtn = !$c.data.id;//(!$c.data.title || $c.data.title.length === 0);
      $c.ready = true;
      //~ if($c.onSelect) console.log("onSelect", $c.onSelect());
    });
    
    
    
  };
  
  $c.LoadObj = function(){
    //~ return $http.get(appRoutes.url_for('объекты и проекты'))//, [3], {"_":new Date().getTime()}
    return ObjectAddrData.Objects()
      .then(function(resp){
          $c.objList = resp.data;
      });
    
  };
  
  $c.FilterObj = function(item){//
  /*
    //~ var pid = $c.param["проект"].id;
    //~ var pid = this['проект/id'] || (this._fromItem && this._fromItem['проект/id']);
    
    var z = $c.param["заказчик"];
    if ( z.id === null ) return false;
    return !z.id || item['проект/id'] == this;
  */
    if (!$c.param['фильтр объектов']) return true;
    return $c.param['фильтр объектов'](item);
  };
  
  $c.InitInput = function(){// ng-init input textfield
    
    $c.lookup.length = 0;
    //~ var pid = $c.param["проект"].id;
    //~ var z = $c.param["заказчик"];
    //~ var pid = z['проект/id'] || (z._fromItem && z._fromItem['проект/id']);
    //~ if (!$c.param["заказчик"].title) 
    if (!$c.param['без объектов']) Array.prototype.push.apply($c.lookup, $c.objList.filter($c.FilterObj).map(function(val) {
      if ( !/^\s*★/.test(val.name)) val.name = ' ★ '+val.name;
      //~ if(pid && val['проект/id'] != pid ) return;
      //~ var title = pid ? val.name : (val['проект'] ?  ' ★ '+val['проект'] : '')+val.name;
      var title =  ($c.param['без проекта'] ? '' : (val['проект'] ?  ' ★ '+val['проект'] : '')) + val.name;
      //~ if($c.data.id  && $c.data.id == val.id) $c.data.title = name;
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    // запросить строки адресов по заказчикам
    if(!$c.param['только объекты'] && $c.param["контрагенты"] && $c.param["контрагенты"].filter(function(it){ return !!it.id; }).length) ObjectAddrData.Addr($c.param["контрагенты"], $c.param['sql']).then(function(resp){///$http.get(appRoutes.url_for('транспорт/заявки/куда', z.id))
      Array.prototype.push.apply($c.lookup, resp.data.map(function(val) {
        return {value: val.name, data:val};
      }).sort(function (a, b) { if (a.data.cnt > b.data.cnt ) { return -1; } if (a.data.cnt < b.data.cnt) { return 1; } if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;}));
      
      $c.Autocomplete();
    });
    else $c.Autocomplete();
    
    //~ $scope.inputClass = $c.InputClass();
  };
  
  $c.Autocomplete = function(){
    if(!$c.textField) $c.textField = $('input[type="text"]', $($element[0]));
    if(!$c.textField.length) return;

    $c.textField.autocomplete({
      //~ suggestionClass: "autocomplete-suggestion orange-text text-darken-4",
      lookup: $c.lookup,
      appendTo: $c.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        var html = arguments[3].options.formatResultsSingle(suggestion, currentValue /*,arguments[2],  arguments[3],*/);
        if (suggestion.data.id) return $(html).addClass($c.param.autocompleteClass4Object || 'orange-text text-darken-3').get(0).outerHTML;
        return html;
      },
      /***formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },***/
      onSelect: function (suggestion) {//this
         //~ console.log("onSelect", $c.textField.autocomplete());///$(this).autocomplete()
        //~ $scope.refreshInput = !0;///передернуть
        $timeout(function(){
          $c.SetItem(suggestion.data, $c.onSelect);//
          //~ delete $scope.refreshInput;///передернуть
        });
        
      },
      onSearchComplete: function(query, suggestions){$c.data._suggestCnt = suggestions.length;},// if(suggestions.length) $c.data.id = undefined;
      //~ onHide: function (container) {},
      //~ onInvalidateSelection: function(){ console.log("onInvalidateSelection", arguments); }
      
    });
    
    if($c.data.id) {//!noset && 
      var item = $c.objList.filter(function(item){ return item.id == $c.data.id}).pop();
      if(item) $c.SetItem(item);//, $c.onSelect
    } else if($c.data.title) {
      
    }
    //~ 
    
    //~ if(lookup.length == 1) $c.SetItem(lookup[0].data, $c.onSelect);
    //~ if(ac) ac.setOptions(options);
    //~ else $c.textField.autocomplete(options);
    
    //~ console.log("InitInput", $c.textField.autocomplete(), lookup);
    
    
  };
  
  $c.SetItem = function(item, onSelect){
    //~ console.log("SetItem", item, onSelect);
    $c.data.title=item.name+($c.param['без проекта'] || !item['проект'] ? '' : ' ('+ item['проект']+')');
    //~ if(item.id) {
      $c.data.id=item.id;
      $c.data._fromItem = item;
    //~ }
    if(onSelect) onSelect({"item": item, "param": $c.param});
    var ac = $c.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  
  $c.ChangeInput = function(){
    if ($c.changeInputTimeout) $timeout.cancel($c.changeInputTimeout);
    $c.changeInputTimeout = $timeout(function(){
      if($c.data.title.length === 0) $c.ClearItem();
      else if($c.data.id) {
        $c.data.id = undefined;
        //~ $c.showListBtn = true;
        $c.InitInput();
        //~ $c.textField.blur().focus();
      }
      if ($c.onChange) $c.onChange({"item": $c.data, "param": $c.param});
      
    }, 500);
    
  };
  $c.FocusInput = function(){
    if($c.onFocus) $c.onFocus({"ctrl": $c});
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
    if(event) event.stopPropagation();
    var ac = $c.textField.autocomplete();
    if(ac) ac.toggleAll();
    //~ if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);}, 500);
  };
  
  $c.ClearItem = function(event){
    $c.data.title = '';
    $c.data.id = undefined;
    $c.data._fromItem = undefined;
    $c.data._suggestCnt = 0;
    //~ $c.showListBtn = true;
    $c.InitInput();
    if(event && $c.onSelect) $c.onSelect({"item": undefined});
  };
  
  $c.InputClass = function(){
    //~ console.log("InputClass", $c.data, $c.param);
    if ($c.data.id) return $c.param.inputClass4Object || '';/// 'orange-text-darken-4';
    //~ : !!$c.data.id, 'deep-orange-text000': !($c.data.id || !$c.data.title.length || $c.data._suggestCnt)}
    
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var objects,
    addr = {},//кэш по запросам
    $this = {
    Objects: function() {return objects;},
    RefreshObjects: function(){ objects = $http.get(appRoutes.url_for('объекты и проекты')); return $this; },
    Addr: function(zak, param) /*контрагенты*/ {
      var zak_ids = zak.map(function(item){ return item.id; }).filter(function(id){ return !!id; }).sort().join(',');
      if(!addr[zak_ids] || param) addr[zak_ids] = $http.get(appRoutes.url_for('транспорт/заявки/адреса', zak_ids, param || {}));
      return addr[zak_ids];
    },
    RefreshAddr: function(){ addr = {} },
  };
  return $this.RefreshObjects();
  
};

/*=============================================================*/

module

.factory("ObjectAddrData", Data)

.component('objectAddress', {
  controllerAs: '$c',
  templateUrl: "object+address",
  //~ scope: {},
  bindings: {
    data: '<',
    param:'<', // следить за установкой проекта или внешнего получателя заявки
    onSelect: '&', // data-on-select="$c.OnSelectContragent(item)
    onFocus: '&', // фокусировка на поле
    onChange:'&', ///на поле ввода

  },
  controller: Component
})

;

}());