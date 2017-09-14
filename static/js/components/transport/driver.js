(function () {'use strict';
/*
  Водитель 
  наши профили + из заявок поле водитель
*/

var moduleName = "TransportDriver";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $q, $http, appRoutes, $timeout, $element, TransportDriverData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  /*Следить за изменениями перевозчика*/
  $ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl._watchParam) $scope.$watch( //console.log("set watcher $ctrl.param", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        
        if (newValue["перевозчик"].id != oldValue["перевозчик"].id && (!newValue["перевозчик"]._fromItem || newValue["перевозчик"]._fromItem != $ctrl.item._fromItem)) {// 
          //~ console.log("driver watch param set", "data ", $ctrl.item, "new ", newValue, "old ", oldValue);
          $ctrl.InitInput(true);
          
        }
        //~ else if (!newValue["перевозчик"]._fromItem && $ctrl.item.id) {
          //~ $ctrl.ClearItem();//});// && (!$ctrl.param["перевозчик"]._fromItem || $ctrl.param["перевозчик"]._fromItem !== $ctrl.item._fromItem)
        //~ }
      },
      true// !!!!
    );
    //~ $timeout(function(){
      $ctrl._watchParam = true;//});
  };
  /*Следить за установкой водителя*/
  $ctrl.WatchItem = function(){// проблема инициализировать один раз и не запускать при инициализации
    if( !$ctrl._watchItem) $scope.$watch( //console.log("set watcher $ctrl.param", 
      function(scope) { return $ctrl.item; },
      function(newValue, oldValue) {
        //~ console.log("dRIVER WatchItem ", newValue);
        if (newValue.id && newValue.id != oldValue.id) {// 
          var item = $ctrl.data.filter(function(item){ return  item.id && item.id == newValue.id }).pop();
          if (item) $ctrl.SetItem(item);
        }
        //~ else console.log("dRIVER WatchItem ", newValue);
      },
      true// !!!!
    );
    //~ $timeout(function(){
      $ctrl._watchItem = true;//});
  };
  
  
  $ctrl.$onInit = function(){
    if(!$ctrl.item) $ctrl.item = {};
    $ctrl.lookup = [];
    
    //~ var async = [];
    //~ async.push($ctrl.LoadData());
    //~ async.push($ctrl.LoadAddr());

    //~ $q.all(async).
    $ctrl.LoadData().then(function(){
      //~ $ctrl.showListBtn = !$ctrl.item.id;//(!$ctrl.item.title || $ctrl.item.title.length === 0);
      $ctrl.ready = true;
      
    });
    
    
    
  };
  
  $ctrl.LoadData = function(){
    return TransportDriverData.Load()
      .then(function(resp){
          $ctrl.data = resp.data;//.map(function(item){ item['проект'] = true; return item; });
      });
    
  };
  
  $ctrl.FilterData = function(item){// this - перевозчик
    //~ var pid = $ctrl.param["проект"].id;
    //~ var pid = this['проект/id'] || (this._fromItem && this._fromItem['проект/id']);
    return this && this.id && !!this['проект/id'];//item['проект'] == 
  };
  
  $ctrl.InitInput = function(noset){// ng-init input textfield
    $ctrl.lookup.length = 0;
    var p = $ctrl.param["перевозчик"];
    if(!p['проект/id']) p['проект/id'] = p._fromItem && p._fromItem['проект/id'];
    Array.prototype.push.apply($ctrl.lookup, $ctrl.data.filter($ctrl.FilterData, p).map(function(val) {
      val.title =  '★'+val.names.join(' ');
      //~ var title = '★'+( pid ? val.title : val['проект']+': '+val.title);
      //~ if($ctrl.item.id  && $ctrl.item.id == val.id) $ctrl.item.title = name;
      return {value: val.title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
    //~ console.log("driver InitInput", $ctrl.item);//, p, $ctrl.lookup
    // запросить строки водителей по перевозчику
    if(p && p.id) $http.get(appRoutes.url_for('транспорт/заявки/водители', p.id)).then(function(resp){
      Array.prototype.push.apply($ctrl.lookup, resp.data.map(function(val) {
          return {value: val.title, data:val};
        }).sort(function (a, b) { if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;})
      );
      
      $ctrl.Autocomplete(noset);
    });
    else $ctrl.Autocomplete(noset);
    
    
  };
  
  $ctrl.Autocomplete = function(noset){
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
          //~ $ctrl.item=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.item._suggestCnt = suggestions.length; },//if(suggestions.length) $ctrl.item.id = undefined;
      onHide: function (container) {}
      
    });
    $ctrl.WatchParam();// только тут
    $ctrl.WatchItem();
    
    //~ console.log("driver Autocomplete", $ctrl.item);
    
    if(!noset && $ctrl.item.id) {
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id}).pop();
      if(item) $ctrl.SetItem(item, $ctrl.onSelect);
    } else if($ctrl.item.title) {
      
    }
    //~ 
    
    //~ if(lookup.length == 1) $ctrl.SetItem(lookup[0].data, $ctrl.onSelect);
    //~ if(ac) ac.setOptions(options);
    //~ else $ctrl.textField.autocomplete(options);
    
    //~ console.log("InitInput", $ctrl.textField.autocomplete(), lookup);
    
    
  };
  
  $ctrl.SetItem = function(item, onSelect){
    //~ console.log("drivr SetItem", item);
    $ctrl.item.title=item.title;
    //~ if(item.id) {
      $ctrl.item.id=item.id;
      $ctrl.item._fromItem = item;
    //~ }
    if(onSelect) onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
    //~ console.log("Address2 SetItem autocomplete", $ctrl.textField.autocomplete());
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.item.title.length === 0) $ctrl.ClearItem();
    else if($ctrl.item.id) {
      $ctrl.item.id = undefined;
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
  
  $ctrl.ClearItem = function(event){
    //~ console.log("ClearItem", $ctrl.item);
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
  var data = $http.get(appRoutes.url_for('водители'));
  return {
    Load: function() {return data;}
  };

};

/*=============================================================*/

module

.factory(moduleName+"Data", Data)

.component('transportDriver', {
  templateUrl: "transport/driver",
  //~ scope: {},
  bindings: {
    item:'<',
    data: '<',
    param:'<', // следить за установкой перевозчика
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());