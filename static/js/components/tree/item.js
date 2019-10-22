(function () {'use strict';
/*
  Компонент ничего не запрашивает с сервера и ничего не сохраняет
  
*/

var moduleName = "TreeItem";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'TreeList']);//'ngSanitize',, 'dndLists''AuthTimer', 'appRoutes',

var Component = function  ($scope, $timeout,  $element) {//
  var $c = this;
  //~ console.log("TreeItem controller starting...");
  $c.selectItemEventName = moduleName+'->SelectItem';
  //~ $scope.$timeout = $timeout;
  
  $scope.$on($c.selectItemEventName, function (event, item){
    //~ console.log($c.selectItemEventName, item, $c.onSelectItem); // Данные, которые нам прислали
    $c.item.selectedItem = item;
    if ($c.onSelectItem) $c.onSelectItem({"item":item, "param": $c.param});
    if (item && (item.childs === null || item.childs.length === 0))
      /*$timeout(function(){ */ $c.ShowTree(false);//});//свернуть дерево
  });
  
  $c.$onInit = function(){
    //~ if ($c.level === undefined || $c.level === 0) console.log(" treeItem.$onInit: start...");
    //~ console.trace();
    if (!$c.param.selectedItemClass) $c.param.selectedItemClass = 'chip padd-0-05 brown lighten-4 shadow-inset-10  brown-text text-darken-3 nowrap';
    if ($c.data && $c.data.then) $c.data.then(function(resp){$c.data = resp.data || resp; $c.InitData();});
    else $timeout(function(){ $c.InitData(); });
  };
  
  $c.InitData = function(){
    
    if ($c.level === undefined) $c.level = 0;
    $c.isTopLevel = ($c.level === 0);
    if (!$c.item) $c.item = {selectedItem:{id:null,},};
    if (!$c.item.selectedItem) $c.item.selectedItem = {id:null,};
    if (!$c.item.topParent) $c.item.topParent = {"id":null};// абсолютный корень
    if (!$c.item.newItems) $c.item.newItems=[];
    if ($c.item.newItems.length === 0) $c.item.newItems.push({title: ''});
    else if ($c.level !== 0 ) $c.item.newItems.push({title: ''});
    $scope.item = $c.item.newItems[$c.level ];
    if (!$c.param) $c.param = {};
    
    $c.InitLookupComplete();
    
    $c.ready = true;
    $timeout(function(){
      $c.InitInput();
    });
    //~ if ($c.level === 0) console.log("Init treeItem: ready");
  };
  
  $c.FilterAutocomplete = function(item){
    //~ console.log("FilterAutocomplete");
    if ($c.param.autocompleteFilter) return $c.param.autocompleteFilter(item);
    if ($c.param.autocompleteOnlyFinalItems) return !item.childs || !item.childs.length;
    
    return true;
    //~ 
  };
  
  const MapAutocomplete = function(item) {
    //~ if( id && id == item.id) $c.SelectTreeItem(item);//angular.forEach(val, function(v,key){ $c.item[key]  = v;});
    var val = item.parents_title.slice(item.parents_id[0] == $c.item.topParent.id ? 1 : 0);// копия
    val.push(item.title);
    return {value: val.join('〉'), data:item, _title: (item._title || '') + item.id ? '(поз. #'+item.id+')' : '',};
  };
  
  const SortAutocomplete = function (a, b) {
    if (a.value.toLowerCase() > b.value.toLowerCase()) return 1;
    if (a.value.toLowerCase() < b.value.toLowerCase()) return -1; 
    return 0;
  };
  
  $c.InitLookupComplete = function(){
    //~ console.log("InitLookupComplete", $c.lookupComplete && $c.lookupComplete.length, $c.level);
    if ($c.lookupComplete && $c.lookupComplete.length) return;/// console.log("InitLookupComplete", $c.lookupComplete);
    $c.lookupComplete = [];
    $c.dataFiltered = $c.data.filter($c.FilterAutocomplete);
    Array.prototype.push.apply($c.lookupComplete, $c.dataFiltered.map(MapAutocomplete).sort(SortAutocomplete));
    //~ ;
  };
  
  $c.InitInput = function(){/// ng-init input textfield
    //~ $c.InitLookupComplete();
  
  //~ $timeout(function(){
    $c.textField = /*$c.textField || нет*/$('input[type="text"]', $($element[0]));
    
    var id = $c.item.id || ($c.item.selectedItem && $c.item.selectedItem.id);
    
    //~ if (!$c.isTopLevel) console.log("autocomplete", $c.autocomplete);
    
    var options =  {
      //~ preserveInput: !0,глобально
      "lookup": $c.lookupComplete,//.sort(function(a, b){  if (a.value.toLowerCase() > b.value) {return 1;} if (a.value < b.value) {return -1;} return 0;}),
      //~ preserveInput: false,
      "appendTo": $c.textField.parent(),
      "containerClass": (styles[$c.param['стиль']] && styles[$c.param['стиль']]['autocomplete container'] && styles[$c.param['стиль']]['autocomplete container'].class) || 'autocomplete-content dropdown-content',
      "containerCss": $c.param.css && ($c.param.css['autocomplete container'] || $c.param.css['suggestions container']),
      "formatResult": $c.param.autocompleteFormat || function (suggestion, currentValue) {
        //~ if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var arr = suggestion.data.parents_title.slice(suggestion.data.parents_id[0] == $c.item.topParent.id ? 1 : 0);
        arr.push(suggestion.data.title);
        if (suggestion.data.id && !(suggestion.data.childs && suggestion.data.childs.length)) arr.push({"title": '#'+suggestion.data.id, "addClass": 'fs7 grey-text right000'});
        return arguments[3].options.formatResultsArray(arr, currentValue, suggestion);
      },
      //~ triggerSelectOnValidInput: false,
      "onSelect": function (suggestion) {
        $scope.item.title='';
        $c.SelectTreeItem(suggestion.data, $c.onSelectItem);
        
      },
      "onSearchComplete": function(query, suggestions){
        $scope.item.suggestionsCnt = suggestions.length;
      },
      "onHide": function (container) {
        if (!$scope.item) return;
        $scope.item.suggestionsCnt = 1;
        $timeout(function(){$scope.item.suggestionsCnt = 0;});
        $c.ShowTree(false);
      }
      
    };
    if ($c.param.autocomplete) angular.extend(options, $c.param.autocomplete);
    $c.textField.autocomplete(options);
    
    if(id && $c.data) {
      var item = $c.data.filter(function(item){ return item.id == id; }).pop();
      if(item) $c.SelectTreeItem(item); //$c.SetItem(item, $c.onSelect);
    }
    //~ });
  };
  
  $c.ChangeInput = function(val, onSelectItem){//
    //~ if ($c.level === 0) return true;
    //~ console.log("ChangeInput", $scope.item);
    if(val !== undefined) $scope.item.title = val;
    var emp = $scope.item.title.length === 0;
    if(emp) {
      $c.item.newItems.splice($c.level+1, 1000);//);
       $c.textField.autocomplete().hide();
    }
    $c.EnableSubItem(!emp);
    if(onSelectItem) onSelectItem({"item": $c.item, "param": $c.param});
    //~ $c.showTreeBtn = !bool;
    return true;
  };
  
  $c.FocusInput = function(){
    if ($c.onFocusField) $c.onFocusField({'row':$c.item});
    if ($c.onFocusInput) $c.onFocusInput({'row':$c.item});
  };
  
  $c.ToggleTreeBtn = function(event){// кнопка
    //~ console.log("ShowSubTree");
    if ($c.param['не добавлять новые позиции']) $timeout(function(){
      var ac = $c.textField.autocomplete();
      ac.toggleAll();
      //~ $c.textField.autocomplete().suggest(true);
    });
    else $timeout(function(){
      $c.ShowTree(!$c.showTree, event);
    });
    //~ if($c.item.selectedItem && $c.item.selectedItem._hide) {
      //~ $c.showTree = true;
      //~ delete $c.item.selectedItem._hide;
    //~ }
    //~ $timeout(function(){$('nomen-tree', $($element[0])).focus();});
  };
  /*
  $c.BlurTree = function(event) {
    //~ $timeout(function(){$c.showTree = false;});
    
  };*/
  /*
  $c.ClearInputBtn = function(){
    $scope.item.title = '';
    //~ Object.keys($c.item).map(function(key){delete $c.item[key];});
    //~ $c.$onInit();
    //~ console.log("ClearInputBtn", $c.level, 
    $c.item.newItems.splice($c.level+1, 1000);//);
    $c.EnableSubItem(false);
    if($c.isTopLevel) $c.showTreeBtn = true;
    
  };*/
  
  
  $c.SelectTreeItem = function(item, onSelectItem){
    //~ console.log("SelectTreeItem", angular.copy(item), onSelectItem);
    //~ if ($c.item.selectedItem === item) return;
    $c.item.selectedItem = item;
    $c.item.id = item.id;
    $c.ChangeInput();
    if(!item.childs || !item.childs.length) $c.ShowTree(false);
    if(onSelectItem) onSelectItem({"item": item, "param": $c.param});
  };
  
  $c.SelectedItemClear = function(){
    //~ $timeout(function(){
      
    $c.item.selectedItem = {};
    $c.item.id = undefined;
    if($c.item.newItems) $c.item.newItems.length = 0;
    //~ $scope.item = undefined;
    $scope.item.title = '';
    //~ $timeout(function(){
      //~ $scope.item = {title: ''};
      $c.item.newItems.push($scope.item);
        
      $c.EnableSubItem(false);
      //~ $c.showTreeBtn = true;
      $c.ShowTree(false);// передернуть компонент
      $c.textField.focus();
      if($c.onSelectItem) $c.onSelectItem({"item": $c.item.selectedItem, "param": $c.param});
      
    //~ });
    
    //~ });
    //~ $timeout(function(){$c.showTree = true;});
  };
  
  $c.SelectedItemUp = function(index){/// в топе переход на уровни выше в выбранной позиции
    //~ console.log("SelectedItemUp", $c.data.indexOf($c.item)); 
    var id = $c.item.selectedItem.parents_id[index];
    var item = $c.data.find(function(it){ return it.id == id; }); 
    //~ var item = {"id": id, selectedItem:{"id": id}, "newItems": $c.item.newItems};
    $timeout(function(){
      $c.SelectedItemClear();
      $timeout(function(){ $c.SelectTreeItem(item, $c.onSelectItem); });
      
    });
    
    
  };
  /*
  $c.CheckFinalItem = function(){
    //~ if (!$c.isTopLevel) ret  //~ var event_hide_tree = function(event){
    //~ var tree = $(event.target).closest('tree-list').eq(0);
    //~ if(tree.length) return;
    //~ $c.ShowTree(false);
    //~ $timeout(function(){$(document).off('click', event_hide_tree);});
    //~ return false;
  //~ };urn false;
    //~ if ($c.showTree) return true;
    //~ if($c.EnableSubItem()) return false;
    if ($c.showTree && $c.item.finalItem && $c.item.finalItem.id) {$c.showTreeBtn = false; $c.showTree = false;}//{$timeout(function(){$c.showTree = false;});};//return false
    //~ if ($c.showTree) return true;
    return true;
    
    
  };*/
  
  const event_hide_tree = function(event){
    var tree = $(event.target).closest('tree-list').eq(0);
    if(tree.length) return;
    $c.ShowTree(false);
    $timeout(function(){$(document).off('click', event_hide_tree);});
    return false;
  };
  $c.ShowTree=function(bool, event){
    if (bool === undefined ) return $c.showTree;
    $c.showTree = bool;
    if(bool) $timeout(function(){$(document).on('click', event_hide_tree);});
  };
  
  $c.EnableSubItem = function(bool){
    if($c.param['не добавлять новые позиции'] || $c.param.disabled) bool = false;
    
    if (bool === undefined ) return $c.enableSubItem;
    //~ $timeout(function(){
    $c.enableSubItem = bool;//});
    return bool;
  };
  
  $c.FilterTopParent = function(title, index){//не покаывать корень выбранной позиции
    //~ if (!($c.item.topParent && $c.item.topParent.id)) return true;
    if (index > 0) return true;
    if ($c.item.selectedItem.parents_id[index] != $c.item.topParent.id) return true;
    return false;
    
  };
  $c.NewItemsULStyle = function(){
    if(!$c.isTopLevel) return;
    var style = {};
    if ($c.item.selectedItem && $c.item.selectedItem.id) style['margin-left']='2rem';
    else if ($c.param['стиль'] != 'справа') style['padding-right']='1.5rem';
    return style;
  };
  var styles = {
    "default": {
      "top level ul": {"class": '', "style": {"padding-right": '3rem'}},//'padding-right': '4rem'
      "arrow drop down li": {"style": {"right": '0', "position": 'absolute', "top":'0.2rem', "z-index":'1',},},
      //~ "arrow drop down li topLevel": {"style": {"right": '1.5rem', "position": 'absolute', "top":'0.2rem', "z-index":'1',},},
      "input field cancel": {"style": {"right": '0', "position": 'absolute', "top":'0.2rem',},},
      //~ "input field cancel topLevel": {"style": {"right": '1.5rem', "position": 'absolute', "top":'0.2rem',},},
      'отменить выбранную позицию': {style: {"top":'0', "right": '1.7rem', "position": 'absolute'}},
    },
    "справа": {
      "top level ul": {"class": 'right-align', "style": {"padding-right": '2rem', }},//'padding-right': '4rem'
      "top level ul disabled": {"class": 'right-align', "style": {"padding-right": '0', }},//'padding-right': '4rem'
      "input field": {"class": 'right-align', "style": {}},
      "arrow drop down li": {"style": {"left": '0.2rem', "position": 'absolute', "top":'0.2rem', "z-index":'1',},},
      "input field cancel": {"style": {"left": '1.5rem', "position": 'absolute', "top":'0.2rem',},},
      //~ "input field cancel topLevel": {"style": {"left": '0.2rem', "position": 'absolute', "top":'0.2rem',},},
      "autocomplete container":{"class": 'autocomplete-content dropdown-content right-align'},
      'отменить выбранную позицию':{style:{"top":'0', "right": '0', "position": 'absolute'}},
      "top level li new items":{"class": 'right-align',},
    },
  };
  $c.StyleFor = function(name, type){/*менять стилевые стили элементов 'top level ul'*/
    var topLevel = $c.isTopLevel ? ' topLevel' : '';
    var disabled = $c.param.disabled ? ' disabled' : '';
    //~ else if (name == 'input field cancel' && $c.isTopLevel) name += ' topLevel';
    var conf = styles[$c.param['стиль'] || 'default'];
    conf = conf[name+topLevel+disabled] || conf[name] || {};
    if (type == 'class') return conf.class;
    var style = conf.style || {};
    //~ if (name == 'top level ul' && $c.item.selectedItem && $c.item.selectedItem.id && $c.param['не добавлять новые позиции']) style['border-bottom'] = '1px dotted grey';
    return style;
  };
  
  $c.NewItemsJoinTitle = function(){
    return $c.item.newItems.map(function(it){ return it.title || ''; }).join('/');
    
  };
  
  //~ $c.SelectedItemClass = function(){
    //~ return $c.param.selectedItemClass || '';
    
  //~ };
  /*
  $c.RemoveItem = function(){//input text
    var item = $scope.item;
    //~ console.log("RemoveItem", item, $c.level);
    $c.EnableSubItem(false);
    //~ if(item.title === '') {// сброс дочерние
    var idx = $c.item.newItems.indexOf(item);
    if(idx === undefined) return;
    //~ $c.item.newItems.splice(idx+1, 1000);
    $timeout(function(){
        
      if ($c.item.newItems.length > 1) $c.item.newItems.splice(idx, 1000);
      else if ($c.item.newItems.length === 1) $c.item.newItems[0].title='';
      //~ if () $c.item.newItems.push({"title": ''});
    });
    //~ }
    //~ else $scope.subItem = true;
    
  };
  
  
  $scope.$on('$destroy', function() {
    if( !$c.isTopLevel ) $c.RemoveItem();
    
  });*/
  
};

/******************************************************/

/*=============================================================*/

module

.component('treeItem', {
  controllerAs: '$c',
  templateUrl: "tree/item",
  //~ scope: {},
  bindings: {
    level: '<',
    param: '<',
    item:'<',
    data: '<',// массив списка или обещание
    lookupComplete: '<', /// фильтрованный и обработанный массив для lookup параметра (тогда data не нужен)
    onFocusField:'&',
    onFocusInput:'&',///синоним onFocusField
    onSelectItem: '&',

  },
  controller: Component
})

;

}());