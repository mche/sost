(function () {'use strict';
/*
  Список объектов-проектов
  плюс адрес куда для заявки
  
  объекты фильтруются параметром project
  при установке объекта в родительском компоненте уст. проект
*/

var moduleName = "Объект или адрес";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $q, $http, appRoutes, $timeout, $element, ObjectAddrData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  /*Следить за изменениями проекта или внешнего получателя*/
  /*$ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(0 && !$ctrl.param._watch) $scope.$watch( //console.log("set watcher $ctrl.param", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        
        if (newValue["заказчик"].id != oldValue["заказчик"].id && (!newValue["заказчик"]._fromItem || newValue["заказчик"]._fromItem != $ctrl.data._fromItem)) {// 
          //~ console.log("Куда watch param set", "data ", $ctrl.data, "new ", newValue, "old ", oldValue);
          $ctrl.InitInput();//console.log("Куда skip ClearItem");
          
        }
        //~ else if (newValue["заказчик"].title) 
        //~ $ctrl.InitInput();
        else if (!newValue["заказчик"]._fromItem && $ctrl.data.id) {
          //~ console.log("Куда watch param clear", "data ", $ctrl.data, "new ", newValue, "old ", oldValue);
        //~ else if($ctrl.param._watch && (!$ctrl.param["проект"]._fromItem || $ctrl.param["проект"]._fromItem !== $ctrl.data._fromItem)) //$timeout(function(){
          $ctrl.ClearItem();//});// && (!$ctrl.param["заказчик"]._fromItem || $ctrl.param["заказчик"]._fromItem !== $ctrl.data._fromItem)
        //~ else console.log("Куда skip ClearItem");
        }
      },
      true// !!!!
    );
    //~ $timeout(function(){
      $ctrl.param._watch = true;//});
  };*/
  /*$ctrl.WatchData = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.data._watch) $scope.$watch(
      function(scope) { return $ctrl.data; },
      function(newValue, oldValue) {
        
        //~ console.log(" ProjectItem watch data ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $ctrl.data.id) 
        if( newValue && newValue.id) $timeout(function(){
          var item = $ctrl.lookup.filter(function(it){return it.data.id == newValue.id;}).pop();
          
          if(item) $ctrl.SetItem(item.data);
          //~ else console.log("None project SetItem");
          
        });
        else if (newValue && newValue.id === undefined) {
          $ctrl.ClearItem();
        }
      },
      true// !!!!
    );
    $ctrl.data._watch = true;
  };*/
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = {};
    $ctrl.lookup = [];
    
    var async = [];
    async.push($ctrl.LoadObj());
    //~ async.push($ctrl.LoadAddr());

    $q.all(async).then(function(){
      //~ $ctrl.showListBtn = !$ctrl.data.id;//(!$ctrl.data.title || $ctrl.data.title.length === 0);
      $ctrl.ready = true;
      
    });
    
    
    
  };
  
  $ctrl.LoadObj = function(){
    //~ return $http.get(appRoutes.url_for('объекты и проекты'))//, [3], {"_":new Date().getTime()}
    return ObjectAddrData.Objects()
      .then(function(resp){
          $ctrl.objList = resp.data;
      });
    
  };
  
  /*$ctrl.FilterObj = function(item){// this - возможный проект у нашего заказчика
    //~ var pid = $ctrl.param["проект"].id;
    //~ var pid = this['проект/id'] || (this._fromItem && this._fromItem['проект/id']);
    
    var z = $ctrl.param["заказчик"];
    if ( z.id === null ) return false;
    return !z.id || item['проект/id'] == this;
  };*/
  
  $ctrl.InitInput = function(){// ng-init input textfield
    
    $ctrl.lookup.length = 0;
    //~ var pid = $ctrl.param["проект"].id;
    //~ var z = $ctrl.param["заказчик"];
    //~ var pid = z['проект/id'] || (z._fromItem && z._fromItem['проект/id']);
    //~ if (!$ctrl.param["заказчик"].title) 
    if (!$ctrl.param['без объектов']) Array.prototype.push.apply($ctrl.lookup, $ctrl.objList/*.filter($ctrl.FilterObj, pid)*/.map(function(val) {
      if ( !/^\s*★/.test(val.name)) val.name = ' ★ '+val.name;
      //~ if(pid && val['проект/id'] != pid ) return;
      //~ var title = pid ? val.name : (val['проект'] ?  ' ★ '+val['проект'] : '')+val.name;
      var title =   (val['проект'] ?  ' ★ '+val['проект'] : '') + val.name;
      //~ if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = name;
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    // запросить строки адресов по заказчикам
    if($ctrl.param["контрагенты"] && $ctrl.param["контрагенты"].filter(function(it){ return !!it.id; }).length) ObjectAddrData.Addr($ctrl.param["контрагенты"], $ctrl.param['sql']).then(function(resp){///$http.get(appRoutes.url_for('транспорт/заявки/куда', z.id))
      Array.prototype.push.apply($ctrl.lookup, resp.data.map(function(val) {
        return {value: val.name, data:val};
      }).sort(function (a, b) { if (a.data.cnt > b.data.cnt ) { return -1; } if (a.data.cnt < b.data.cnt) { return 1; } if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;}));
      
      $ctrl.Autocomplete();
    });
    else $ctrl.Autocomplete();
    
    
  };
  
  $ctrl.Autocomplete = function(){
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    if(!$ctrl.textField.length) return;

    $ctrl.textField.autocomplete({
      lookup: $ctrl.lookup,
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {//this
         //~ console.log("onSelect", $(this).autocomplete());
        //~ 
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);//
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length;},// if(suggestions.length) $ctrl.data.id = undefined;
      onHide: function (container) {}
      
    });
    //~ $ctrl.WatchParam();// только тут
    
    if($ctrl.data.id) {//!noset && 
      var item = $ctrl.objList.filter(function(item){ return item.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
    } else if($ctrl.data.title) {
      
    }
    //~ 
    
    //~ if(lookup.length == 1) $ctrl.SetItem(lookup[0].data, $ctrl.onSelect);
    //~ if(ac) ac.setOptions(options);
    //~ else $ctrl.textField.autocomplete(options);
    
    //~ console.log("InitInput", $ctrl.textField.autocomplete(), lookup);
    
    
  };
  
  $ctrl.SetItem = function(item, onSelect){
    $ctrl.data.title=item.name+' ('+ item['проект']+')';
    //~ if(item.id) {
      $ctrl.data.id=item.id;
      $ctrl.data._fromItem = item;
    //~ }
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearItem();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
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
  
  $ctrl.ClearItem = function(event){
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._fromItem = undefined;
    $ctrl.data._suggestCnt = 0;
    //~ $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(event && $ctrl.onSelect) $ctrl.onSelect({"item": undefined});
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
  };
  return $this.RefreshObjects();
  
};

/*=============================================================*/

module

.factory("ObjectAddrData", Data)

.component('objectAddress', {
  templateUrl: "object+address",
  //~ scope: {},
  bindings: {
    data: '<',
    param:'<', // следить за установкой проекта или внешнего получателя заявки
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());