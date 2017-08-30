(function () {'use strict';
/*
  Список объектов-проектов
  плюс адрес куда для заявки
  
  объекты фильтруются параметром project
  при установке объекта в родительском компоненте уст. проект
*/

var moduleName = "Куда/объект или адрес";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $q, $http, appRoutes, $timeout, $element, ObjectData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  /*Следить за изменениями проекта или внешнего получателя*/
  $ctrl.WatchParam = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.param._watch) $scope.$watch( //console.log("set watcher $ctrl.param", 
      function(scope) { return $ctrl.param; },
      function(newValue, oldValue) {
        //~ console.log("watch param", newValue, oldValue);
        if($ctrl.param._watch && (!$ctrl.param.project._fromItem || $ctrl.param.project._fromItem !== $ctrl.data._fromItem)) $timeout(function(){$ctrl.ClearItem();});// && (!$ctrl.param.contragent._fromItem || $ctrl.param.contragent._fromItem !== $ctrl.data._fromItem)
      },
      true// !!!!
    );
    $timeout(function(){$ctrl.param._watch = true;});
  };
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
      $ctrl.showListBtn = !$ctrl.data.id;//(!$ctrl.data.title || $ctrl.data.title.length === 0);
      $ctrl.ready = true;
      
    });
    
    
    
  };
  
  $ctrl.LoadObj = function(){
    //~ return $http.get(appRoutes.url_for('объекты и проекты'))//, [3], {"_":new Date().getTime()}
    return ObjectData.Load()
      .then(function(resp){
          $ctrl.objList = resp.data;
      });
    
  };
  
  $ctrl.FilterObj = function(item){
    var pid = $ctrl.param.project.id;
    return !pid || item['проект/id'] == pid;
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    if(!$ctrl.textField.length) return;
    
    $ctrl.lookup.length = 0;
    if (!$ctrl.param.contragent.id) Array.prototype.push.apply($ctrl.lookup, $ctrl.objList.filter($ctrl.FilterObj).map(function(val) {
      var pid = $ctrl.param.project.id;
      //~ if(pid && val['проект/id'] != pid ) return;
      var title = pid ?  val.name : val['проект']+': '+val.name;
      //~ if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = name;
      return {value: title, data:val};
    }).sort(function (a, b) { if (a.value > b.value) { return 1; } if (a.value < b.value) { return -1; } return 0;}));
    
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
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      onHide: function (container) {}
      
    });
    $ctrl.WatchParam();// только тут
    
    if($ctrl.data.id) {
      var item = $ctrl.lookup.filter(function(item){ return item.data.id == $ctrl.data.id}).pop();
      if(item) $ctrl.SetItem(item.data, $ctrl.onSelect);
    } else if($ctrl.data.title) {
      
    }
    //~ 
    
    //~ if(lookup.length == 1) $ctrl.SetItem(lookup[0].data, $ctrl.onSelect);
    //~ if(ac) ac.setOptions(options);
    //~ else $ctrl.textField.autocomplete(options);
    
    //~ console.log("InitInput", $ctrl.textField.autocomplete(), lookup);
  };
  
  $ctrl.SetItem = function(item, onSelect){
    $ctrl.data.title=item.name;
    $ctrl.data.id=item.id;
    $ctrl.data._fromItem = item;
    $ctrl.showListBtn = false;
    if($ctrl.onSelect) $ctrl.onSelect({"item": item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ChangeInput = function(){
    if($ctrl.data.title.length === 0) $ctrl.ClearItem();
    else if($ctrl.data.id) {
      $ctrl.data.id = undefined;
      $ctrl.showListBtn = true;
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
    //~ console.log("ClearItem", $ctrl.data);
    $ctrl.data.title = '';
    $ctrl.data.id = undefined;
    $ctrl.data._fromItem = undefined;
    $ctrl.data._suggestCnt = 0;
    $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(event && $ctrl.onSelect) $ctrl.onSelect({"item": undefined});
  };
  
  
};

/******************************************************/
var Data  = function($http, appRoutes){
  var data = $http.get(appRoutes.url_for('объекты и проекты'));
  return {
    Load: function() {return data;}
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory("ObjectData", Data)

.component('objectAddress2', {
  templateUrl: "object+address2",
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