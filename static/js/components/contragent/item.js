(function () {'use strict';
/*
*/

var moduleAlias = ['ContragentItem',];/// 'Контрагент'
  
var moduleNames = moduleAlias.filter(angular.FilterFreeModuleName);/// app.js
if (!moduleNames.length) return;// все имена заняты
  
//~ var module = angular.module(moduleName, ['Контрагенты', 'Util']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, $Контрагенты, Util) {
  var $c = this;
  //~ $scope.$timeout = $timeout;
  
  $c.$onInit = function(){
    if(!$c.item) $c.item = {};
    if(!$c.param) $c.param = {};
    $c.autocomplete = [];
    
    if ($c.data && $c.data.then) $c.data.then(function(resp){ $c.data=resp.data; $c.Ready(); });
    else $Контрагенты.Load().then(function(){
        $c.data= $Контрагенты.Data();
        $c.Ready();
      });
    
  };
  
  $c.Ready = function(){
    $c.ready = true;
    //~ if ($c.param['АТИ']) console.log("Ready", angular.copy($c.item));
    //~ if ($c.param['АТИ'] && $c.item.id && !$c.item['АТИ'])
      //~ $c.item['АТИ'] = $c.item['АТИ title'] || ( $c.item._fromItem && ($c.item._fromItem['АТИ'] || $c.item._fromItem['АТИ title']));
  };
  
  const re_ATI = /АТИ/i;
  const re_star = /^\s*★/;
  
  $c.InitInput = function(filterData){// ng-init input textfield
    if(!$c.textField) $c.textField = $('input[type="text"]', $($element[0]));
    
    var array_id;
    if ($c.item.id && angular.isArray($c.item.id)) {
      array_id =  $c.item.id;
      $c.item.id = undefined;
    }
    
    if(!filterData) filterData = function(item){
      if (!array_id) return true;
      return array_id.some(function(id){ return id == item.id; });// '!'+id != item.id && 
      
    };
   
    $c.autocomplete.length = 0;
    Array.prototype.push.apply($c.autocomplete, $c.data.filter(filterData).map(function(item) {
      if (!!item['проект/id'] && !re_star.test(item.title)) item.title = ' ★ ' + item.title;
      var value = item.title;
      if ($c.param['АТИ'] && !re_ATI.test(value) && item['АТИ']) value = value + '(АТИ '+ item['АТИ'] + ')';
      return {value: value, data: item};
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
    $c.textField.autocomplete({
      "containerCss": $c.param.css && ($c.param.css['autocomplete container'] || $c.param.css['suggestions container']),
      lookup: $c.autocomplete,
      lookupFilter: function(suggestion, originalQuery, queryLowerCase, that) {
        var match = (' '+queryLowerCase+' ').replace(re1, '').replace(re2, '').replace(re3, ' ').trim();
        //~ console.log(this, "lookupFilter", match,  suggestion.value.toLowerCase());
        if(!match.length) return false;
        that.hightlight = match;
        return suggestion.value.toLowerCase().replace(re2, '').replace(re3, ' ').trim().indexOf(match) !== -1;
      },
      appendTo: $c.textField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        var html = arguments[3].options.formatResultsSingle(suggestion, currentValue);
        if (suggestion.data['проект/id']) return $(html).addClass('orange-text text-darken-3').get(0).outerHTML;
        return html;
      },
      onSelect: function (suggestion) {
        $timeout(function(){
          //~ $c.item=suggestion.data;
          $c.SetItem(suggestion.data, $c.onSelect);
          Util.Scroll2El($c.textField.focus());
        });
        
      },
      onSearchComplete: function(query, suggestions){$c.item._suggests = suggestions; /***if(suggestions.length) $c.item.id = undefined;*/},
      onHide: function (container) {}
      
    });
    
    //~ $c.WatchItem();
    //~ $c.WatchParam();
    
    if($c.item.id && !angular.isArray($c.item.id)) {
      var item = $c.data.filter(function(item){ return item.id == $c.item.id; }).pop();
      if(item) $c.SetItem(item);//, $c.onSelect
    }
    
  };
  
  $c.ChangeInput = function(){
    if($c.item.title.length === 0) $c.ClearInput();
    else if ($c.item.id) {
      $c.item.id = undefined;
      $c.item._fromItem = undefined;
      //~ $c.item['АТИ'] = undefined;
      //~ $c.showListBtn = true;
      $c.InitInput();
      //~ $c.textField.blur().focus();
      
    }
    //~ if($c.onSelect) $c.onSelect({"item": $c.item});
  };
  $c.InputClass = function(){
    //~ if (!!$c.item.id)
    return $c.param.textInputClass || '';/// 'orange-text text-darken-4';
    //~ : !!$c.data.id, 'deep-orange-text000': !($c.data.id || !$c.data.title.length || $c.data._suggestCnt)}
    
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
    //~ console.log("ContragentItem SetItem", item);
    //~ var title = (!!item['проект/id'] ?  '★' : '') + item.title;
    $c.item.title = item.title;
    $c.item.id=item.id;
    $c.item._fromItem = angular.copy(item);
    $c.item['проект/id'] = item['проект/id'];
    if ($c.param['АТИ'])
      $c.item['АТИ'] = item['АТИ'] || item['АТИ title'];//// || ( $c.item._fromItem && ($c.item._fromItem['АТИ'] || $c.item._fromItem['АТИ title']));
    //~ $c.showListBtn = false;
    if(onSelect) onSelect({"item": $c.item});
    var ac = $c.textField.autocomplete();
    if(ac) ac.dispose();
  };
  
  $c.ClearInput = function(event){
    $c.item.title = '';
    $c.item.id = undefined;
    $c.item._fromItem = undefined;
    $c.item._suggestCnt = 0;
    $c.item['проект/id'] = undefined;
    $c.item['АТИ'] = undefined;
    //~ $c.showListBtn = true;
    $c.InitInput();
    if(event && $c.onSelect) $c.onSelect({"item": $c.item});
  };
  
  
};

/******************************************************/


/*=============================================================*/

/*var module = angular.module(moduleName, ['Контрагенты', 'Util']);//'ngSanitize',, 'dndLists'

module
.component('contragentItem', {
  templateUrl: "contragent/item",
  //~ scope: {},
  bindings: {
    item:'<',
    data: '<',
    param:'<',
    onSelect: '&', // data-on-select="$c.OnSelectContragent(item)"

  },
  controller: Component
})

;*/

moduleNames.map(function(name){
  var module = angular.module(name, ['Контрагенты', 'Util']);
  module.component('contragentItem', {
    controllerAs: '$c',
    templateUrl: "contragent/item",
    //~ scope: {},
    bindings: {
      item:'<',
      data: '<',
      param:'<',
      onSelect: '&', // data-on-select="$c.OnSelectContragent(item)"

    },
    controller: Component
  });
  
});

}());