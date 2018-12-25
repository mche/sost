(function () {'use strict';
/*
 дерево компонент
  ничего не запрашивает и не сохраняет
выбор позиции на уровнях передается через $scope.$emit
  а на нулевом уровне это событие транслируется в передачу через биндинг компонента onSelectItem:'&', 
*/
var moduleName = "TreeList";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);//'appRoutes','ngSanitize', 'AuthTimer'

var Controll = function($scope, $timeout, $element){//$http, $q, , appRoutes
  var $c = this;
  //~ $scope.$timeout = $timeout;
  //~ var select_event = moduleName+'->SelectItem';
  
  $c.$onInit = function() {
    
    if(!$c.param) $c.param = {};
    
    //~ if (!$c.data) $c.LoadData().then(function(){
      //~ $c.InitData();
      
    //~ });
    //~ else 
    $timeout(function() {$c.InitData();});
    
    //~ $c.InitEventsWatch();
    
  };
  
  $c.InitEventsWatch = function(){
    // слушаем событие в нужном нам $scope
    if($c.level > 0) return;
    
    $scope.$on(select_event, function (event, item){
      console.log(select_event, item, $c.onSelectItem); // Данные, которые нам прислали
      if($c.onSelectItem) $c.onSelectItem({"item":item});
      //~ $c.data.map(function(it){ it._expand = false; });//свернуть дерево
      
    });

  };
  
  $c.InitData = function(){
    if ($c.level === undefined) $c.level = 0;
    if ($c.parent === undefined) $c.parent = $c.item.topParent || {"id": null, "parents_title":[]};//!!!
    //~ console.log("InitData", $c.parent);
    //~ if ($c.parent.parents_name[0] === null)  $c.parent.parents_name[0] = 'Группы';
    //~ else $c.parent.parents_name.unshift('Группы');
    //~ $scope.newItem = {"title":'', "descr":'', "parent": $c.parent.id};
    //~ if(!$c.searchComplete) $c.searchComplete = [];
    $c.ready = true;
  };
  
  $c.NewItem = function(item){
    //~ $scope.newItem = {"name":'', "parent": $c.parent.id};
    delete $c.error; 
    item._newItem = !item._newItem;
    item._expand = true;
    //~ item.name = $c.searchtField.val();
    if(item === $c.parent) $c.ExpandAll(false);
  };

  
  $c.FilterData = function(item){
    //~ var len = item.parents_id && item.parents_id.length;
    //~ if (!len) return false;
    return item.parent === $c.parent.id;
    
  };
  
  $c.ToggleSelect = function (item, event) {
    //~ console.log("ToggleSelect", item, $c.level, $c.onSelectItem);
    //~ if($c.onSelectItem) $c.onSelectItem({"item":item});
    if($c.selectItemEventName)  $scope.$emit($c.selectItemEventName, item);
    
    $timeout(function(){
        //~ $c.data.map(function(it){ it._expand = false; });//свернуть дерево
      });

      item._expand = !item._expand;
    
  };
  
  $c.ToggleEdit = function(item, $event){
    if (item._edit) item._edit = undefined;
    else item._edit = angular.copy(item);
    //~ if (item._edit) item._expand = true;
    $c.error = undefined;
  };
  
  $c.ToggleExpandItem = function (item, $event){
    item._expand = !item._expand;
    
  };
  
  /*
  $c.SelectExpandItem = function (item, req, selected){// флаг req для запроса пользователей/маршрутов этой роли
    //~ item._expand = true;
    //~ $timeout(function(){$c.ExpandAll(true);});
    if (selected === undefined) selected = item._selected;
    if (selected) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = null;});
    }
    
    else if (req) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = undefined;});
      $c.param.role = item;
      $c.ReqUsers(item);
      $c.ReqRoutes(item);
      angular.forEach($c.data, function(it){it._checked = false;});// сбросить крыжики
    }
    
    var parents = [];
    angular.forEach($c.data, function(it){
      it._selected = selected ? false : (it.id === item.id);
      if (it._selected) Array.prototype.push.apply(parents, it.parents_id);
    });
    
    if(parents.length) angular.forEach($c.data, function(it){
      angular.forEach(parents, function(parent_id){
        if (it.id === parent_id) it._expand = true;
      });
    });
    
  };*/
  
  $c.ExpandIf = function(item){
    //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
    var Item = $c.item && $c.item.selectedItem;
    if (Item && Item.parents_id && Item.parents_id.length && Item.parents_id.some(function(id){ return id == item.id; })) item._expand=true;
    //~ console.log("ExpandIf", Item);
    return item._expand;
    
  };
  
  $c.ExpandAll = function(bool){
    if (bool === undefined) bool = !$c.expandAll;
    $c.expandAll = bool;
    angular.forEach($c.data, function(item){if(item.childs) item._expand=bool;});
    
  };
  
  $c.IsHighLight = function(item){
    var Item = $c.item && $c.item.selectedItem;
    return Item && Item.id == item.id || (Item.parents_id && Item.parents_id.some(function(id){ return id == item.id; }));
  };
  
  //~ $c.searchComplete = [];в InitData
  /*
  $c.SortSearchComplete = function (a,b) {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  };
  $c.FilterParentsId = function(p_id){return p_id === this.id; };
  $c.FilterChilds = function(ch_id){return ch_id === this.id; };
  $c.FilterSearchComplete = function (data){// на разных уровнях своя фильтрация общего списка поиска
    var val = data.data;
    // запретить зацикливание веток
    if (val.id === $c.parent.id || $c.parent.parents_id && $c.parent.parents_id.filter($c.FilterParentsId, val).length) return false;
    if ($c.parent.childs && $c.parent.childs.filter($c.FilterChilds, val).length) return false;
    // запретить соседей атачить - последний элемент в parents_id совпадает
    if (this && val.parents_id[val.parents_id.length - 1] === $c.parent.id) return false;
    if (this && val.parents1 && val.parents1.length > 1 && val.parents1[0] != val.parent) return false; // показывать только первоначальную связь
    return true;
  };
  $c.InitSearch = function(item){// ng-init input searchtField
    //~ console.log(item && item._textField);
    //~ $timeout(function(){
    if(!$c.searchtField) $c.searchtField = item ? $('input.'+(item.id ? 'edit-item' : 'new-item')+'[type="text"]', $($element[0])) : $('input[name="search"]', $($element[0])); // : $('input.new-item[type="text"]', $($element[0]));
    //~ console.log("InitSearch", $c.parent.id);
    //~ if (searchtField.attr('autocomplete')) return;
    //~ searchtField.attr('autocomplete', true);
    
    if ($c.level === 0 && $c.searchComplete.length === 0) {
      angular.forEach($c.data, function(val) {
        $c.searchComplete.push({value: val.parents_title.join(' ')+' '+val.title, data:val});
      });
    }
    

    if($('.autocomplete-content', $($element[0])).get(0)) return $c.searchtField.autocomplete().setOptions({"lookup": $c.searchComplete.filter($c.FilterSearchComplete, item).sort($c.SortSearchComplete)});
    //~ console.log("InitSearch", autocomplete.length, searchtField);
    $c.searchtField.autocomplete({
      lookup: $c.searchComplete.filter($c.FilterSearchComplete, item).sort($c.SortSearchComplete),
      //~ preserveInput: false,
      appendTo: $c.searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {////arguments[3] объект Комплит
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var vals = angular.copy(suggestion.data.parents_title);
        vals.push(suggestion.data.title);
        return arguments[3].options.formatResultsArray(vals, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        $c.searchtField.val('');
        $c.showBtnNewRole = false;
        $timeout(function(){
          if (item) {
            item.attach = suggestion.data;
            if (item._edit) item._edit.title = '';
            else item.title='';
          }
          else {
            //~ $c.ExpandItem(suggestion.data);
            $c.SelectExpandItem(suggestion.data, true, false);//._selected = true;
            $c.searchtField.val('');
          }
          //~ $c.Edit(suggestion.data);
        });
        
      },
      onSearchComplete: function(query, suggestions){
        if(!suggestions.length) $c.searchtField.addClass('orange-text');
        else $c.searchtField.removeClass('orange-text');
        
        $timeout(function(){$c.showBtnNewRole = true;});
      },
      onHide: function (container) {if(!$c.searchtField.val().length) $timeout(function(){$c.showBtnNewRole = false;});}
      
    });
  //~ });// timeout
    
  };*/
  
  /*
  $c.Save = function(item, is_disable){
    if (is_disable) return item.title.length || item.attach;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    delete $c.error;
    
    //~ item.parent = $c.parent.id;
    
    $http.post(appRoutes.url_for('доступ/сохранить роль'), item, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data.error) $c.error = resp.data.error;
        if(resp.data.roles) {
          //~ $c.data = resp.data.success;
          // запускаем событие вверх
          $scope.$emit('RefreshData', resp.data.roles, resp.data.item);
          if ($c.level === 0 && item === $scope.newItem ) $timeout(function() {$c.NewItem($c.parent);}); //$c.parent._newItem = false;
          //~ // collapse

        }
        
        //~ $c.ready = true;
        
      });
    
    
  };*/
  /*
  $c.Disable = function(item){
    if (item.disable) item.disable = 0;
    else item.disable = 1;
    $c.Save(item);
  };
  
  $c.Remove = function(item){
    item.remove = item.id;
    item.parent = $c.parent.id;
    $c.Save(item);
  };*/
  
  
  $c.UlStyle = function(){
    if ($c.level === 0) return {};
    return {"margin-left":'0.5rem'};
    
  };
  /*
  $c._FilterParent = function(it){ return it.id === this.id && it.parent == this.parents1[0]; };
  $c.PrimaryParent = function(item){ //для непервичной связи с родительской группой найти первичную группу
    var parent = $c.data.filter($c._FilterParent, item).pop();
    //~ console.log("PrimaryParent", parent);
    if (parent) return parent.parents_title;//.slice(1);
    return parent;
    
  };*/
  
};

/*=====================================================================*/

module

.component('treeList', {
  controllerAs: '$c',
  templateUrl: "tree/list",
  //~ scope: {},
  bindings: {
    parent:'<',
    item:'<',
    param: '<', // 
    data: '<', //
    level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
    //~ searchComplete: '<',// для всех уровней одни данные поиска, но фильтруются с учетом критериев недопустимых зацикливаний
    //~ onSelectItem:'&',
    selectItemEventName: '<',

  },
  controller: Controll
})

;

}());