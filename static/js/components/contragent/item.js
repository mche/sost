(function () {'use strict';
/*
*/

var moduleName = "ContragentItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Контрагенты', 'Util']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, $Контрагенты, Util) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.item) $ctrl.item = {};
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.autocomplete = [];
    
    if ($ctrl.data && $ctrl.data.then) $ctrl.data.then(function(resp){ $ctrl.data=resp.data; $ctrl.ready = true; });
    else $Контрагенты.Load().then(function(){
        $ctrl.data= $Контрагенты.Data();
        $ctrl.ready = true;
      });
    
  };
  
  $ctrl.InitInput = function(filterData){// ng-init input textfield
    if(!$ctrl.textField) $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    var array_id;
    if ($ctrl.item.id && angular.isArray($ctrl.item.id)) {
      array_id =  $ctrl.item.id;
      $ctrl.item.id = undefined;
    }
    
    if(!filterData) filterData = function(item){
      if (!array_id) return true;
      return array_id.some(function(id){ return id == item.id; });// '!'+id != item.id && 
      
    };
   
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data.filter(filterData).map(function(val) {
      //~ var title = (!!val['проект/id'] ?  '★' : '')+val.title;
      if (!!val['проект/id'] && !/^\s*★/.test(val.title)) val.title = ' ★ '+val.title;
      return {value: val.title, data:val};
    }).sort(function (a, b) {
      if (!!a.data['проект/id'] && !b.data['проект/id']) { return -1; }
      if (!a.data['проект/id'] && !!b.data['проект/id']) { return 1; }
      if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; }
      if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; }
      return 0;
    }));
    
    var re1=/[^\w\u0400-\u04FF](?:ип|ооо)[^\w\u0400-\u04FF]/gi; /// \b не работает
    var re2=/[^ \-\w\u0400-\u04FF]/gi;
    var re3=/ {2,}/g;
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      lookupFilter: function(suggestion, originalQuery, queryLowerCase, that) {
        var match = (' '+queryLowerCase+' ').replace(re1, '').replace(re2, '').replace(re3, ' ').trim();
        //~ console.log(this, "lookupFilter", match,  suggestion.value.toLowerCase());
        if(!match.length) return false;
        that.hightlight = match;
        return suggestion.value.toLowerCase().replace(re2, '').replace(re3, ' ').trim().indexOf(match) !== -1;
      },
      appendTo: $ctrl.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        var html = arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (suggestion.data['проект/id']) return $(html).addClass('orange-text text-darken-3').get(0).outerHTML;
        return html;
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $ctrl.item=suggestion.data;
          $ctrl.SetItem(suggestion.data, $ctrl.onSelect);
          Util.Scroll2El($ctrl.textField.focus());
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.item._suggests = suggestions; /***if(suggestions.length) $ctrl.item.id = undefined;*/},
      onHide: function (container) {}
      
    });
    
    //~ $ctrl.WatchItem();
    //~ $ctrl.WatchParam();
    
    if($ctrl.item.id && !angular.isArray($ctrl.item.id)) {
      var item = $ctrl.data.filter(function(item){ return item.id == $ctrl.item.id; }).pop();
      if(item) $ctrl.SetItem(item);//, $ctrl.onSelect
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
    //~ if($ctrl.onSelect) $ctrl.onSelect({"item": $ctrl.item});
  };
  $ctrl.InputClass = function(){
    //~ if (!!$ctrl.item.id)
    return $ctrl.param.textInputClass || '';/// 'orange-text text-darken-4';
    //~ : !!$ctrl.data.id, 'deep-orange-text000': !($ctrl.data.id || !$ctrl.data.title.length || $ctrl.data._suggestCnt)}
    
  };
  /*var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };*/
  $ctrl.ToggleListBtn = function(event){
    event.stopPropagation();
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.toggleAll();
    //~ if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
    
  };
  
  $ctrl.SetItem = function(item, onSelect){
    //~ console.log("ContragentItem SetItem", item);
    //~ var title = (!!item['проект/id'] ?  '★' : '') + item.title;
    $ctrl.item.title = item.title;
    $ctrl.item.id=item.id;
    $ctrl.item._fromItem = item;
    $ctrl.item['проект/id'] = item['проект/id'];
    //~ $ctrl.showListBtn = false;
    if(onSelect) onSelect({"item": $ctrl.item});
    var ac = $ctrl.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $ctrl.ClearInput = function(event){
    $ctrl.item.title = '';
    $ctrl.item.id = undefined;
    $ctrl.item._fromItem = undefined;
    $ctrl.item._suggestCnt = 0;
    $ctrl.item['проект/id'] = undefined;
    //~ $ctrl.showListBtn = true;
    $ctrl.InitInput();
    if(event && $ctrl.onSelect) $ctrl.onSelect({"item": $ctrl.item});
  };
  
  
};

/******************************************************/


/*=============================================================*/

module

.component('contragentItem', {
  templateUrl: "contragent/item",
  //~ scope: {},
  bindings: {
    item:'<',
    data: '<',
    param:'<',
    onSelect: '&', // data-on-select="$ctrl.OnSelectContragent(item)"

  },
  controller: Component
})

;

}());