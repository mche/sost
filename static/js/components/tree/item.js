(function () {'use strict';
/*
  Компонент ничего не запрашивает с сервера и ничего не сохраняет
  
*/

var moduleName = "TreeItem";

var module = angular.module(moduleName, [ 'TreeList']);//'ngSanitize',, 'dndLists''AuthTimer', 'AppTplCache', 'appRoutes',

var Component = function  ($scope, $timeout,  $element) {//, NomenData$http,, appRoutes
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    $ctrl.autocomplete = [];
    if ($ctrl.data && $ctrl.data.then) $ctrl.data.then(function(resp){$ctrl.data = resp.data; $ctrl.InitData();});
    else $timeout(function(){ $ctrl.InitData(); });    
  };
  
  $ctrl.InitData = function(){
      if ($ctrl.level === undefined) $ctrl.level = 0;
      $ctrl.isTopLevel = ($ctrl.level === 0);
      if (!$ctrl.item) $ctrl.item = {};
      if (!$ctrl.item.topParent) $ctrl.item.topParent = {"id":null};// абсолютный корень
      if (!$ctrl.item.newItems) $ctrl.item.newItems=[];
      //~ if(!$ctrl.item.selectedIdx) $ctrl.item.selectedIdx =[];
      //~ if($ctrl.item.selectedIdx.length) $ctrl.showTree = true;
      if (!$ctrl.param) $ctrl.param = {};
      $scope.item = {title: ''};
      $ctrl.item.newItems.push($scope.item);
     
      //~ if ($ctrl.isTopLevel) $ctrl.LoadData().then(function(){$ctrl.ready = true;});
      //~ else 
      $ctrl.ready = true;
    
  };
  
  /*$ctrl.WatchItem = function(){// проблема инициализировать один раз и не запускать при инициализации
    if(!$ctrl.item._watch) $scope.$watch(//console.log("set watcher $ctrl.data", 
      function(scope) { return $ctrl.item; },
      function(newValue, oldValue) {
        //~ console.log(" TreeItem watch item ", newValue, oldValue);
        //~ if(newValue && newValue.id && newValue.id != $ctrl.data.id) 
        var id = newValue.id || (newValue.selectedItem && newValue.selectedItem.id);
        var old = oldValue.id || (oldValue.selectedItem && oldValue.selectedItem.id);
        if(id && id != old ) $timeout(function(){
          var item = $ctrl.data.filter(function(it){return it.id == id;}).pop();
          if(item) $ctrl.SelectTreeItem(item);
          
        });
        //~ else $ctrl.SelectedItemClear();
      },
      true// !!!!
    );
    $ctrl.item._watch = true;
  };*/
  
  $ctrl.InitInput = function(){// ng-init input textfield
    if (!$ctrl.isTopLevel) return true;
    //~ $ctrl.showTreeBtn = true;
    $ctrl.textField = $('input[type="text"]', $($element[0]));
    
    
    var id = $ctrl.item.id || ($ctrl.item.selectedItem && $ctrl.item.selectedItem.id);
    $ctrl.autocomplete.length = 0;
    Array.prototype.push.apply($ctrl.autocomplete, $ctrl.data/*.filter($ctrl.FilterData)*/.map(function(item) {
      //~ if( id && id == item.id) $ctrl.SelectTreeItem(item);//angular.forEach(val, function(v,key){ $ctrl.item[key]  = v;});
      var val = item.parents_title.slice(item.parents_id[0] == $ctrl.item.topParent.id ? 1 : 0);// копия
      val.push(item.title);
      return {value: val.join(' '), data:item};
    }).sort(function (a, b) { if (a.value.toLowerCase() > b.value.toLowerCase()) { return 1; } if (a.value.toLowerCase() < b.value.toLowerCase()) { return -1; } return 0;}));
    
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,//.sort(function(a, b){  if (a.value.toLowerCase() > b.value) {return 1;} if (a.value < b.value) {return -1;} return 0;}),
      //~ preserveInput: false,
      appendTo: $ctrl.textField.parent(),
      containerClass: (styles[$ctrl.param['стиль']] && styles[$ctrl.param['стиль']]['autocomplete container'] && styles[$ctrl.param['стиль']]['autocomplete container'].class) || 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var arr = suggestion.data.parents_title.slice(suggestion.data.parents_id[0] == $ctrl.item.topParent.id ? 1 : 0);
        arr.push(suggestion.data.title);
        //~ if (suggestion.data.parents_id[0] == $ctrl.item.topParent.id) {
          //~ arr.shift();
        //~ }
        return arguments[3].options.formatResultsArray(arr, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
          //~ console.log('selected: ', suggestion);
        $scope.item.title='';
        $ctrl.SelectTreeItem(suggestion.data);
        
      },
      onSearchComplete: function(query, suggestions){
        //~ console.log("onSearchComplete", suggestions);
        //~ $ctrl.EnableSubItem(suggestions.length === 0);
        $scope.item.suggestionsCnt = suggestions.length;
      },
      onHide: function (container) {
        $scope.item.suggestionsCnt = 1;
        $timeout(function(){$scope.item.suggestionsCnt = 0;});
        $ctrl.ShowTree(false);
      }
      
    });
    
    //~ $ctrl.WatchItem();
    
    if(id) {
      var item = $ctrl.data.filter(function(item){ return item.id == id}).pop();
      if(item) $ctrl.SelectTreeItem(item); //$ctrl.SetItem(item, $ctrl.onSelect);
    }
    //~ $ctrl.textField.autocomplete().getSuggestions();// вызов lookup и там подмена его; // end if level === 0
    //~ }
    //~ else // level > 0
      //~ $ctrl.textField.on('change', function(ev){
        
      //~ });
    //~ console.log($ctrl.textField.get(0));
    
  };
  
  $ctrl.ChangeInput = function(val){//
    //~ if ($ctrl.level === 0) return true;
    //~ console.log("ChangeInput", $scope.item.title.length);
    if(val !== undefined) $scope.item.title = val;
    var emp = $scope.item.title.length === 0;
    if(emp) $ctrl.item.newItems.splice($ctrl.level+1, 1000);//);
    $ctrl.EnableSubItem(!emp);
    //~ $ctrl.showTreeBtn = !bool;
    return true;
  };
  
  $ctrl.ToggleTreeBtn = function(event){// кнопка
    //~ console.log("ShowSubTree");
    $timeout(function(){$ctrl.ShowTree(!$ctrl.showTree, event);});
    //~ if($ctrl.item.selectedItem && $ctrl.item.selectedItem._hide) {
      //~ $ctrl.showTree = true;
      //~ delete $ctrl.item.selectedItem._hide;
    //~ }
    //~ $timeout(function(){$('nomen-tree', $($element[0])).focus();});
  };
  /*
  $ctrl.BlurTree = function(event) {
    //~ $timeout(function(){$ctrl.showTree = false;});
    
  };*/
  /*
  $ctrl.ClearInputBtn = function(){
    $scope.item.title = '';
    //~ Object.keys($ctrl.item).map(function(key){delete $ctrl.item[key];});
    //~ $ctrl.$onInit();
    //~ console.log("ClearInputBtn", $ctrl.level, 
    $ctrl.item.newItems.splice($ctrl.level+1, 1000);//);
    $ctrl.EnableSubItem(false);
    if($ctrl.isTopLevel) $ctrl.showTreeBtn = true;
    
  };*/
  
  
  $ctrl.SelectTreeItem = function(item){
    //~ console.log("SelectTreeItem", item);
    //~ if ($ctrl.item.selectedItem === item) return;
    $ctrl.item.selectedItem = item;
    $ctrl.ChangeInput();
    if(!item.childs || !item.childs.length) $ctrl.ShowTree(false);
    if($ctrl.onSelectItem) $ctrl.onSelectItem({item: item});
  };
  
  $ctrl.SelectedItemClear = function(){
    //~ $timeout(function(){
      
    $ctrl.item.selectedItem = {};
    if($ctrl.item.newItems) $ctrl.item.newItems.length = 0;
    $ctrl.item.newItems.push($scope.item);
    $scope.item.title = '';
      
    $ctrl.EnableSubItem(false);
    //~ $ctrl.showTreeBtn = true;
    $ctrl.ShowTree(false);// передернуть компонент
    $ctrl.textField.focus();
    if($ctrl.onSelectItem) $ctrl.onSelectItem({item: $ctrl.item.selectedItem});
    //~ });
    //~ $timeout(function(){$ctrl.showTree = true;});
  };
  /*
  $ctrl.CheckFinalItem = function(){
    //~ if (!$ctrl.isTopLevel) return false;
    //~ if ($ctrl.showTree) return true;
    //~ if($ctrl.EnableSubItem()) return false;
    if ($ctrl.showTree && $ctrl.item.finalItem && $ctrl.item.finalItem.id) {$ctrl.showTreeBtn = false; $ctrl.showTree = false;}//{$timeout(function(){$ctrl.showTree = false;});};//return false
    //~ if ($ctrl.showTree) return true;
    return true;
    
    
  };*/
  
  var event_hide_tree = function(event){
    var tree = $(event.target).closest('tree-list').eq(0);
    if(tree.length) return;
    $ctrl.ShowTree(false);
    $timeout(function(){$(document).off('click', event_hide_tree);});
    return false;
  };
  $ctrl.ShowTree=function(bool, event){
    if (bool === undefined ) return $ctrl.showTree;
    $ctrl.showTree = bool;
    if(bool) $timeout(function(){$(document).on('click', event_hide_tree);});
  };
  
  $ctrl.EnableSubItem = function(bool){
    if($ctrl.param['не добавлять новые позиции'] || $ctrl.param.disabled) bool = false;
    
    if (bool === undefined ) return $ctrl.enableSubItem;
    //~ $timeout(function(){
    $ctrl.enableSubItem = bool;//});
    return bool;
  };
  
  $ctrl.FilterTopParent = function(title, index){//не покаывать корень выбранной позиции
    //~ if (!($ctrl.item.topParent && $ctrl.item.topParent.id)) return true;
    if (index > 0) return true;
    if ($ctrl.item.selectedItem.parents_id[index] != $ctrl.item.topParent.id) return true;
    return false;
    
  };
  $ctrl.ULStyle = function(){
    if(!$ctrl.isTopLevel || !$ctrl.item.selectedItem || !$ctrl.item.selectedItem.id) return '';
    return {'margin-left': '2rem'};
  };
  var styles = {
    "default": {
      "arrow drop down li": {"style": {"right": '0', "position": 'absolute', "top":'0.2rem', "z-index":'1',},},
      "input field cancel": {"style": {"right": '0', "position": 'absolute', "top":'0.2rem',},},
    },
    "справа": {
      "top level ul": {"class": 'right-align', "style": {}},//'padding-right': '4rem'
      "input field": {"class": 'right-align', "style": {}},
      "arrow drop down li": {"style": {"left": '0', "position": 'absolute', "top":'0.2rem', "z-index":'1',},},
      "input field cancel": {"style": {"left": '0', "position": 'absolute', "top":'0.2rem',},},
      "autocomplete container":{"class": 'autocomplete-content dropdown-content right-align'},
    },
  };
  $ctrl.ClassFor = function(name){/*менять стилевые классы элементов 'top level ul'*/
    if (!$ctrl.param['стиль']) return;
    return styles[$ctrl.param['стиль']] && styles[$ctrl.param['стиль']][name] && styles[$ctrl.param['стиль']][name].class;
  };
  $ctrl.StyleFor = function(name){/*менять стилевые стили элементов 'top level ul'*/
    var style = {};
    if (name == 'top level ul' && $ctrl.item.selectedItem.id && $ctrl.param['не добавлять новые позиции']) style['border-bottom'] = '1px solid grey';
    var conf = (styles[$ctrl.param['стиль']] && styles[$ctrl.param['стиль']][name] && styles[$ctrl.param['стиль']][name].style)
      || (styles.default[name] && styles.default[name].style);
    $.each(conf, function(k,v){ style[k] = v; });
    return style;
  };
  /*
  $ctrl.RemoveItem = function(){//input text
    var item = $scope.item;
    //~ console.log("RemoveItem", item, $ctrl.level);
    $ctrl.EnableSubItem(false);
    //~ if(item.title === '') {// сброс дочерние
    var idx = $ctrl.item.newItems.indexOf(item);
    if(idx === undefined) return;
    //~ $ctrl.item.newItems.splice(idx+1, 1000);
    $timeout(function(){
        
      if ($ctrl.item.newItems.length > 1) $ctrl.item.newItems.splice(idx, 1000);
      else if ($ctrl.item.newItems.length === 1) $ctrl.item.newItems[0].title='';
      //~ if () $ctrl.item.newItems.push({"title": ''});
    });
    //~ }
    //~ else $scope.subItem = true;
    
  };
  
  
  $scope.$on('$destroy', function() {
    if( !$ctrl.isTopLevel ) $ctrl.RemoveItem();
    
  });*/
  
};

/******************************************************/
/*
var NomenData  = function($http, appRoutes){
  //~ var srv = this;
  //~ var f = {};
  var fresh  = function(topParent){return $http.get(appRoutes.url_for('номенклатура/список', (topParent && topParent.id) || 0));};
  //~ var data = fresh();
  return {
    //~ Load: function() {return data;},
    Fresh: fresh,
  };
  //~ f.get = function (){
  //~ };
  
};
*/
/*=============================================================*/

module

//~ .factory("NomenData", NomenData)

.component('treeItem', {
  templateUrl: "tree/item",
  //~ scope: {},
  bindings: {
    level: '<',
    param: '<',
    item:'<',
    data: '<',// массив списка или обещание
    onFocusField:'&',
    onSelectItem: '&',

  },
  controller: Component
})

;

}());