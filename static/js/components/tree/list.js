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
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  //~ var select_event = moduleName+'->SelectItem';
  
  $ctrl.$onInit = function() {
    
    if(!$ctrl.param) $ctrl.param = {};
    
    //~ if (!$ctrl.data) $ctrl.LoadData().then(function(){
      //~ $ctrl.InitData();
      
    //~ });
    //~ else 
    $timeout(function() {$ctrl.InitData();});
    
    //~ $ctrl.InitEventsWatch();
    
  };
  
  $ctrl.InitEventsWatch = function(){
    // слушаем событие в нужном нам $scope
    if($ctrl.level > 0) return;
    
    $scope.$on(select_event, function (event, item){
      console.log(select_event, item, $ctrl.onSelectItem); // Данные, которые нам прислали
      if($ctrl.onSelectItem) $ctrl.onSelectItem({"item":item});
      //~ $ctrl.data.map(function(it){ it._expand = false; });//свернуть дерево
      
    });
    /*
    $scope.$on('RefreshData', function (event, data, item) {
      //~ console.log("RefreshData", data); // Данные, которые нам прислали
      $ctrl.data = [];
      $timeout(function(){
        $ctrl.data = data;
        $ctrl.ready = false;
        $ctrl.InitData();
        $ctrl.InitSearch();
        //~ item = $ctrl.data.filter(function(it){ return it.id === item.id}).pop();
        //~ $ctrl.ExpandItem(item);
        if(item) $ctrl.SelectExpandItem(item, true);
        
      });
      
    });*/
    
    //~ $scope.$watch(
      //~ function(scope) { return $ctrl.param.roles; },
      //~ function(newValue, oldValue) {
        
        //~ if ( newValue !== undefined ) {
          //~ $ctrl.ExpandAll(true);
          //~ $ctrl.CheckItems(newValue);
        //~ }
      //~ }
    //~ );
  };
  
  $ctrl.InitData = function(){
    if ($ctrl.level === undefined) $ctrl.level = 0;
    if ($ctrl.parent === undefined) $ctrl.parent = $ctrl.item.topParent || {"id": null, "parents_title":[]};//!!!
    //~ console.log("InitData", $ctrl.parent);
    //~ if ($ctrl.parent.parents_name[0] === null)  $ctrl.parent.parents_name[0] = 'Группы';
    //~ else $ctrl.parent.parents_name.unshift('Группы');
    //~ $scope.newItem = {"title":'', "descr":'', "parent": $ctrl.parent.id};
    //~ if(!$ctrl.searchComplete) $ctrl.searchComplete = [];
    $ctrl.ready = true;
  };
  
  $ctrl.NewItem = function(item){
    //~ $scope.newItem = {"name":'', "parent": $ctrl.parent.id};
    delete $ctrl.error; 
    item._newItem = !item._newItem;
    item._expand = true;
    //~ item.name = $ctrl.searchtField.val();
    if(item === $ctrl.parent) $ctrl.ExpandAll(false);
  };

  
  $ctrl.FilterData = function(item){
    //~ var len = item.parents_id && item.parents_id.length;
    //~ if (!len) return false;
    return item.parent === $ctrl.parent.id;
    
  };
  
  $ctrl.ToggleSelect = function (item, event) {
    //~ console.log("ToggleSelect", item, $ctrl.level, $ctrl.onSelectItem);
    //~ if($ctrl.onSelectItem) $ctrl.onSelectItem({"item":item});
    if($ctrl.selectItemEventName)  $scope.$emit($ctrl.selectItemEventName, item);
    
    $timeout(function(){
        //~ $ctrl.data.map(function(it){ it._expand = false; });//свернуть дерево
      });

      item._expand = !item._expand;
    
  };
  
  $ctrl.ToggleEdit = function(item, $event){
    if (item._edit) item._edit = undefined;
    else item._edit = angular.copy(item);
    //~ if (item._edit) item._expand = true;
    $ctrl.error = undefined;
  };
  
  $ctrl.ToggleExpandItem = function (item, $event){
    item._expand = !item._expand;
    
  };
  
  /*
  $ctrl.SelectExpandItem = function (item, req, selected){// флаг req для запроса пользователей/маршрутов этой роли
    //~ item._expand = true;
    //~ $timeout(function(){$ctrl.ExpandAll(true);});
    if (selected === undefined) selected = item._selected;
    if (selected) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = null;});
    }
    
    else if (req) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = undefined;});
      $ctrl.param.role = item;
      $ctrl.ReqUsers(item);
      $ctrl.ReqRoutes(item);
      angular.forEach($ctrl.data, function(it){it._checked = false;});// сбросить крыжики
    }
    
    var parents = [];
    angular.forEach($ctrl.data, function(it){
      it._selected = selected ? false : (it.id === item.id);
      if (it._selected) Array.prototype.push.apply(parents, it.parents_id);
    });
    
    if(parents.length) angular.forEach($ctrl.data, function(it){
      angular.forEach(parents, function(parent_id){
        if (it.id === parent_id) it._expand = true;
      });
    });
    
  };*/
  
  $ctrl.ExpandIf = function(item){
    //~ if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
    var Item = $ctrl.item && $ctrl.item.selectedItem;
    if (Item && Item.parents_id && Item.parents_id.length && Item.parents_id.some(function(id){ return id == item.id; })) item._expand=true;
    //~ console.log("ExpandIf", Item);
    return item._expand;
    
  };
  
  $ctrl.ExpandAll = function(bool){
    if (bool === undefined) bool = !$ctrl.expandAll;
    $ctrl.expandAll = bool;
    angular.forEach($ctrl.data, function(item){if(item.childs) item._expand=bool;});
    
  };
  
  $ctrl.IsHighLight = function(item){
    var Item = $ctrl.item && $ctrl.item.selectedItem;
    return Item && Item.id == item.id || (Item.parents_id && Item.parents_id.some(function(id){ return id == item.id; }));
  };
  
  //~ $ctrl.searchComplete = [];в InitData
  /*
  $ctrl.SortSearchComplete = function (a,b) {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  };
  $ctrl.FilterParentsId = function(p_id){return p_id === this.id; };
  $ctrl.FilterChilds = function(ch_id){return ch_id === this.id; };
  $ctrl.FilterSearchComplete = function (data){// на разных уровнях своя фильтрация общего списка поиска
    var val = data.data;
    // запретить зацикливание веток
    if (val.id === $ctrl.parent.id || $ctrl.parent.parents_id && $ctrl.parent.parents_id.filter($ctrl.FilterParentsId, val).length) return false;
    if ($ctrl.parent.childs && $ctrl.parent.childs.filter($ctrl.FilterChilds, val).length) return false;
    // запретить соседей атачить - последний элемент в parents_id совпадает
    if (this && val.parents_id[val.parents_id.length - 1] === $ctrl.parent.id) return false;
    if (this && val.parents1 && val.parents1.length > 1 && val.parents1[0] != val.parent) return false; // показывать только первоначальную связь
    return true;
  };
  $ctrl.InitSearch = function(item){// ng-init input searchtField
    //~ console.log(item && item._textField);
    //~ $timeout(function(){
    if(!$ctrl.searchtField) $ctrl.searchtField = item ? $('input.'+(item.id ? 'edit-item' : 'new-item')+'[type="text"]', $($element[0])) : $('input[name="search"]', $($element[0])); // : $('input.new-item[type="text"]', $($element[0]));
    //~ console.log("InitSearch", $ctrl.parent.id);
    //~ if (searchtField.attr('autocomplete')) return;
    //~ searchtField.attr('autocomplete', true);
    
    if ($ctrl.level === 0 && $ctrl.searchComplete.length === 0) {
      angular.forEach($ctrl.data, function(val) {
        $ctrl.searchComplete.push({value: val.parents_title.join(' ')+' '+val.title, data:val});
      });
    }
    

    if($('.autocomplete-content', $($element[0])).get(0)) return $ctrl.searchtField.autocomplete().setOptions({"lookup": $ctrl.searchComplete.filter($ctrl.FilterSearchComplete, item).sort($ctrl.SortSearchComplete)});
    //~ console.log("InitSearch", autocomplete.length, searchtField);
    $ctrl.searchtField.autocomplete({
      lookup: $ctrl.searchComplete.filter($ctrl.FilterSearchComplete, item).sort($ctrl.SortSearchComplete),
      //~ preserveInput: false,
      appendTo: $ctrl.searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {////arguments[3] объект Комплит
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var vals = angular.copy(suggestion.data.parents_title);
        vals.push(suggestion.data.title);
        return arguments[3].options.formatResultsArray(vals, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        $ctrl.searchtField.val('');
        $ctrl.showBtnNewRole = false;
        $timeout(function(){
          if (item) {
            item.attach = suggestion.data;
            if (item._edit) item._edit.title = '';
            else item.title='';
          }
          else {
            //~ $ctrl.ExpandItem(suggestion.data);
            $ctrl.SelectExpandItem(suggestion.data, true, false);//._selected = true;
            $ctrl.searchtField.val('');
          }
          //~ $ctrl.Edit(suggestion.data);
        });
        
      },
      onSearchComplete: function(query, suggestions){
        if(!suggestions.length) $ctrl.searchtField.addClass('orange-text');
        else $ctrl.searchtField.removeClass('orange-text');
        
        $timeout(function(){$ctrl.showBtnNewRole = true;});
      },
      onHide: function (container) {if(!$ctrl.searchtField.val().length) $timeout(function(){$ctrl.showBtnNewRole = false;});}
      
    });
  //~ });// timeout
    
  };*/
  
  /*
  $ctrl.Save = function(item, is_disable){
    if (is_disable) return item.title.length || item.attach;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    
    //~ item.parent = $ctrl.parent.id;
    
    $http.post(appRoutes.url_for('доступ/сохранить роль'), item, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.roles) {
          //~ $ctrl.data = resp.data.success;
          // запускаем событие вверх
          $scope.$emit('RefreshData', resp.data.roles, resp.data.item);
          if ($ctrl.level === 0 && item === $scope.newItem ) $timeout(function() {$ctrl.NewItem($ctrl.parent);}); //$ctrl.parent._newItem = false;
          //~ // collapse

        }
        
        //~ $ctrl.ready = true;
        
      });
    
    
  };*/
  /*
  $ctrl.Disable = function(item){
    if (item.disable) item.disable = 0;
    else item.disable = 1;
    $ctrl.Save(item);
  };
  
  $ctrl.Remove = function(item){
    item.remove = item.id;
    item.parent = $ctrl.parent.id;
    $ctrl.Save(item);
  };*/
  
  
  $ctrl.UlStyle = function(){
    if ($ctrl.level === 0) return {};
    return {"margin-left":'0.5rem'};
    
  };
  /*
  $ctrl._FilterParent = function(it){ return it.id === this.id && it.parent == this.parents1[0]; };
  $ctrl.PrimaryParent = function(item){ //для непервичной связи с родительской группой найти первичную группу
    var parent = $ctrl.data.filter($ctrl._FilterParent, item).pop();
    //~ console.log("PrimaryParent", parent);
    if (parent) return parent.parents_title;//.slice(1);
    return parent;
    
  };*/
  
};

/*=====================================================================*/

module

.component('treeList', {
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