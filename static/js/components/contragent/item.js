(function () {'use strict';
/*
*/

var moduleAlias = ['ContragentItem',];/// 'Контрагент'
  
var moduleNames = moduleAlias.filter(angular.FilterFreeModuleName);/// app.js
if (!moduleNames.length) return;// все имена заняты
  

try {angular.module('Аренда::Договоры::Выбор');} catch(e) {  console.log("Заглушка [Аренда::Договоры::Выбор]", angular.module('Аренда::Договоры::Выбор', []).factory("$АрендаДоговорыДанные", function(){ return {}; })); }///заглушка!
  
//~ var module = angular.module(moduleName, ['Контрагенты', 'Util']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $element, $Контрагенты, Util, $АрендаДоговорыДанные) {
  var $c = this;
  //~ $scope.$timeout = $timeout;
  //~ $scope.$on('Конрагенты/обновить данные', function(event){
    //~ $c.ready = false;
    //~ $Контрагенты.Clear().Load().then(function(){
      //~ $c.data= $Контрагенты.Data();
      //~ $c.Ready();
    //~ });
    
  //~ });
  
  $c.$onInit = function(){
    $timeout(function(){
    if (!$c.item) $c.item = {};
    if (!$c.param) $c.param = {};
    //~ if (!$c.param.placeholder) $c.param.placeholder = 'ИП, ООО, ОАО, ПАО, ЗАО лучше писать в конце названия';
    //~ console.log("$onInit", $c.param);
    $c.autocomplete = [];
    
    if ($c.data && $c.data.then) $c.data.then(function(resp){ $c.data=resp.data; $c.Ready(); });
    else $Контрагенты.Load().then(function(){
        $c.data= $Контрагенты.Data();
        $c.Ready();
      });
    
    if ($c.param['договор аренды']) {
      $c.dataRentContracts = {};
      $АрендаДоговорыДанные.Load().then(function(){
        $АрендаДоговорыДанные.Data().forEach((item)=>{
          let kid = item['контрагент/id'] || item.$контрагент.id;
          if (!$c.dataRentContracts[kid]) $c.dataRentContracts[kid] = [];
          $c.dataRentContracts[kid].push(item);
        });
      });
      //~ console.log('dataRentContracts, ', $c.dataRentContracts);
    }
    
  });///$timeout
  };
  
  $c.Ready = function(){
    $c.ready = true;
    //~ if ($c.param['АТИ']) console.log("Ready", angular.copy($c.item));
    //~ if ($c.param['АТИ'] && $c.item.id && !$c.item['АТИ'])
      //~ $c.item['АТИ'] = $c.item['АТИ title'] || ( $c.item._fromItem && ($c.item._fromItem['АТИ'] || $c.item._fromItem['АТИ title']));
  };
  
  const re_ATI = /АТИ/i;
  const re_star = /^\s*★/;
  //~ const re1 = /[^\w\u0400-\u04FF]*(?:ип|ооо|зао)[^\w\u0400-\u04FF]*/gi; /// \b не работает
  const re_OOO = /(^|\s)(?:ип|ооо|зао|оао)($|\s)/gi; /// \b не работает
  //~ const re2 = /[^ \-\w\u0400-\u04FF]/gi;
  const re_trash = /[^ \.\-\w\u0400-\u04FF]/gi;
  const re_space2 = / {2,}/g;
  const re_space = / /;
  
  const FilterData = function(item){
    //~ if (!array_id) return true;
    return this.array_id.some(function(id){ return id == item.id; });// '!'+id != item.id && 
  };
  const MapData = function(item) {
    //~ if (!!item['проект/id'] && !re_star.test(item.title)) item.title = ' ★ ' + item.title;
    var value = item.title;
    if (!!item['проект/id'] && !re_star.test(item.title)) value = ' ★ ' + value;
    if ($c.param['АТИ'] && !re_ATI.test(value) && item['АТИ']) value = value + '(АТИ '+ item['АТИ'] + ')';
    return {value: value, data: item};
  };

  const CleanString = function(str){
    return str.toLowerCase().replace(re_trash, '').replace(re_OOO, '').replace(re_space2, ' ').trim();
  };
  const LookupFilter = function(suggestion, originalQuery, queryLowerCase, that) {
    /// без пробела по умолчанию
    if (!re_space.test(queryLowerCase)) return $.Autocomplete.defaults.lookupFilter(suggestion, originalQuery, queryLowerCase);
    var match = CleanString(queryLowerCase);
    //~ console.log(this, "lookupFilter", that.defaults);
    if(!match.length) return false;
    that.hightlight = match;
    return /*CleanString(suggestion.value)*/(suggestion.data._match || CleanString(suggestion.value)) .indexOf(match) !== -1;
  };
  const FormatAutocomplete = function (suggestion, currentValue) {//arguments[3] объект Комплит
    var html = arguments[3].options.formatResultsSingle(suggestion, currentValue);
    if (suggestion.data['проект/id']) return $(html).addClass('orange-text text-darken-3').get(0).outerHTML;
    return html;
  };
  $c.InitInput = function(filterData){// ng-init input textfield
    if(!$c.textField) $c.textField = $('input[type="text"]', $($element[0]));
    
    var array_id;
    if ($c.item.id && angular.isArray($c.item.id)) {
      array_id =  $c.item.id;
      $c.item.id = undefined;
    }
   
    $c.autocomplete.length = 0;
    Array.prototype.push.apply($c.autocomplete, (array_id ? $c.data.filter(FilterData, {"array_id": array_id}) : $c.data)
      .map(MapData)
      //~ .sort(SortData)
    );
    

    $c.textField.autocomplete({
      "containerCss": $c.param.css && ($c.param.css['autocomplete container'] || $c.param.css['suggestions container']),
      lookup: $c.autocomplete,
      lookupFilter: LookupFilter,
      appendTo: $c.textField.parent(),
      formatResult: FormatAutocomplete,
      onSelect: function (suggestion) {
        $timeout(function(){
          $c.SetItem(suggestion.data, $c.onSelect);
          Util.Scroll2El($c.textField.focus());
        });
      },
      onSearchComplete: function(query, suggestions){$c.item._suggests = suggestions; /***if(suggestions.length) $c.item.id = undefined;*/},
      onHide: function (container) {}
      
    });
    
    if($c.item.id && !angular.isArray($c.item.id)) {
      var item = $c.data.filter(function(item){ return item.id == $c.item.id; }).pop();
      if(item) $c.SetItem(item);//, $c.onSelect
    }
    
  };
  
  $c.ChangeInput = function(){
    //~ console.log("ChangeInput");
    if($c.item.title.length === 0) $c.ClearInput();
    else if ($c.item.id) {
      $c.item.id = undefined;
      $c.item._fromItem = undefined;
      if ($c.param['договор аренды']) {
        $c.item['договор аренды/id'] = undefined;
        $c['договоры аренды'] = undefined;
      }
    }
    //~ if($c.onSelect) $c.onSelect({"item": $c.item});
  };
  $c.InputClass = function(){
    //~ if (!!$c.item.id)
    return $c.param.textInputClass || '';/// 'orange-text text-darken-4';
  };

  $c.ToggleListBtn = function(event){
    //~ event.stopPropagation();
    var ac = $c.textField.autocomplete();
    if (ac) ac.toggleAll();
    //~ if(ac && ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
    
  };
  
  $c.SetItem = function(item, onSelect){
    //~ console.log("ContragentItem SetItem", item, $c.dataRentContracts[item.id]);///$АрендаДоговорыДанные.Data().filter($c.FilterRentContracts, item));
    //~ var title = (!!item['проект/id'] ?  '★' : '') + item.title;
    $c.item.title = item.title;
    $c.item.id=item.id;
    $c.item._fromItem = angular.copy(item);
    $c.item['проект/id'] = item['проект/id'];
    if ($c.param['АТИ'])
      $c.item['АТИ'] = item['АТИ'] || item['АТИ title'];//// || ( $c.item._fromItem && ($c.item._fromItem['АТИ'] || $c.item._fromItem['АТИ title']));
    //~ $c.showListBtn = false;
     if ($c.param['договор аренды']) $c['договоры аренды'] = $c.dataRentContracts[item.id];
    if (onSelect) onSelect({"item": $c.item});
    //~ var ac = $c.textField.autocomplete();
    //~ if (ac) ac.onBlur();//$timeout(function(){ ac.hide(); }, 100);///ac.dispose();
  };
  
  $c.ClearInput = function(event){
    $c.item.title = '';
    $c.item.id = undefined;
    $c.item._fromItem = undefined;
    $c.item._suggestCnt = 0;
    $c.item['проект/id'] = undefined;
    $c.item['АТИ'] = undefined;
    if ($c.param['договор аренды']) {
      $c.item['договор аренды/id'] = undefined;
      $c['договоры аренды'] = undefined;
    }
    
    if(event && $c.onSelect) $c.onSelect({"item": $c.item});
  };
  
  $c.PasteInput = function(event){
  event.preventDefault();
  return false;
  };
  
  $c.SelectContract = function(item){
    //~ console.log("SelectContract", item);
    $c.item['договор аренды/id'] = $c.item['договор аренды/id'] == item && item.id ? undefined : item && item.id;
    if ($c.onSelectContract) $c.onSelectContract({"item": item});
  };
  
};

/******************************************************/


/*=============================================================*/

moduleNames.map(function(name){
  var module = angular.module(name, ['Контрагенты', 'Util', 'Аренда::Договоры::Выбор']);
  module.component('contragentItem', {
    controllerAs: '$c',
    templateUrl: "contragent/item",
    //~ scope: {},
    bindings: {
      item:'<',
      data: '<',
      param:'<',
      onSelect: '&', // data-on-select="$c.OnSelectContragent(item)"
      onSelectContract: '&',

    },
    controller: Component
  });
  
});

}());