(function () {'use strict';
/*
  Роли для доступа
  Список
  Выбор позиции
  Добавление
  Изменение
  Удаление
*/
var moduleName = "Roles";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'AuthTimer']);//'ngSanitize',

var Controll = function($scope, $rootScope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function() {
    
    if ($ctrl.level === undefined) $ctrl.level = 0;
    if ($ctrl.parent === undefined) $ctrl.parent = {"id": null, "name000": 'Группы', "parents_name":[]};//!!!
    //~ if ($ctrl.parent.parents_name[0] === null)  $ctrl.parent.parents_name[0] = 'Группы';
    //~ else $ctrl.parent.parents_name.unshift('Группы');
    
    if (!$ctrl.data) $ctrl.LoadData().then(function(){
      $ctrl.InitData();
      
    });
    else $timeout(function() {$ctrl.InitData();});
    
    $ctrl.InitEventsWatch();
    
  };
  
  $ctrl.InitEventsWatch = function(){
    // слушаем событие в нужном нам $scope
    if($ctrl.level !== 0) return;
    
    $scope.$on('RefreshData', function (event, data, item) {
      //~ console.log("RefreshData", data); // Данные, которые нам прислали
      $ctrl.data = [];
      $timeout(function(){
        $ctrl.data = data;
        $ctrl.ready = false;
        $ctrl.InitData();
        $ctrl.InitSearch();
        //~ item = $ctrl.data.filter(function(it){ return it.id === item.id}).pop();
        if(item) {
          //~ console.log("RefreshData", item);
          var it = $ctrl.data.filter($ctrl.FilterItem, item).pop();
          $ctrl.data.filter($ctrl.FilterItems, it.parents_id).map(function(it){it._expand=true;});//~ $ctrl.ExpandItem(item);
          $ctrl.SelectItem(item, true);
        }
        
        $('.tabs', $($element[0])).tabs({"indicatorClass": 'red',});
        
      });
      
    });
    
    $scope.$watch(
      function(scope) { return $ctrl.param.roles; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) $ctrl.WatchParamRoles(newValue);
      }
    );
  };
  $ctrl.WatchParamRoles = function(roles){///не всегда срабатывает $watch
    //~ $ctrl.ExpandAll(false);
    var items = $ctrl.data.filter($ctrl.FilterItems, roles || []);
    //~ console.log("watch roles: ", items);
    $rootScope.$broadcast('Роли по $ctrl.param.roles', items);
    angular.forEach($ctrl.data, function(it){it._checked = false; it._selected = false;});// сбросить все it._expand=false;
    var parents = [];// развернуть по родителям
    items.map(function(it){
      it._checked = true;
      Array.prototype.push.apply(parents, it.parents_id);
    });
    //~ $ctrl.CheckItems(items);
    $ctrl.data.filter($ctrl.FilterItems, parents).map(function(it){it._expand=true;});
    
  };
  
  $ctrl.FilterItem = function(it){
    return this.id == it.id;
  };
  
  $ctrl.FilterItems = function(it){// this -  массив ИДов
    return this.some(function(id){return id == it.id});
    
  };
  
  $ctrl.InitData = function(){
    $scope.newItem = {"name":'', "descr":'', "parent": $ctrl.parent.id};
    if(!$ctrl.searchComplete) $ctrl.searchComplete = [];
    //~ console.log("searchComplete", $ctrl.searchComplete, $ctrl.level);
    $ctrl.ready = true;
    
    if($ctrl.level === 0) $timeout(function() {
      var list = $('ul.roles', $($element[0]));
      var top = list.offset().top+5;
      list.css("height", 'calc(100vh - '+top+'px)');
      list.css("border",'1px solid #e0e0e0');
    });
    
  };
  
  $ctrl.NewItem = function(item){
    //~ $scope.newItem = {"name":'', "parent": $ctrl.parent.id};
    delete $ctrl.error; 
    item._newItem = !item._newItem;
    item._expand = true;
    //~ item.name = $ctrl.searchtField.val();
    if(item === $ctrl.parent) $ctrl.ExpandAll(false);
  };
  
  //~ $ctrl.CloseNew = function(){
    //~ $ctrl.parent._newItem = false;
  //~ };
  
  
  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for(($ctrl.param.URLs && $ctrl.param.URLs.roles) || 'доступ/список ролей'))
      .then(function(resp){
        $ctrl.data = resp.data;
      });
    
  };
  
  $ctrl.filterParent = function(item){
    //~ var len = item.parents_id && item.parents_id.length;
    //~ if (!len) return false;
    return item.parent === $ctrl.parent.id;
    
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
  
  $ctrl.SelectItem = function (item, select){// флаг req для запроса пользователей/маршрутов этой роли
    //~ item._expand = true;
    //~ $timeout(function(){$ctrl.ExpandAll(true);});
    if (select === undefined) select = !item._selected;
    angular.forEach($ctrl.data, function(it){it._selected = false; it._checked = false;});// сбросить
    item._selected = select;
    
    //~ $timeout(function(){
      if (!item._selected) {
        angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = null;});
      }
      
      else{// if (req) 
        angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = undefined;});
        $ctrl.param.role = item;
        $ctrl.ReqUsers(item);
        $ctrl.ReqRoutes(item);
        //~ angular.forEach($ctrl.data, function(it){it._checked = false;});// сбросить крыжики
      }
    //~ });
    
    /*
    var parents = [];
    angular.forEach($ctrl.data, function(it){
      it._selected = selected ? false : (it.id === item.id);
      if (it._selected) Array.prototype.push.apply(parents, it.parents_id);
    });
    
    if(parents.length) angular.forEach($ctrl.data, function(it){
      angular.forEach(parents, function(parent_id){
        if (it.id === parent_id) it._expand = true;
      });
    });*/
    
  };
  
  $ctrl.ExpandIf = function(item){
    if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
    return item._expand;
    
  };
  
  $ctrl.ExpandAll = function(bool){
    if (bool === undefined) bool = !$ctrl.expandAll;
    $ctrl.expandAll = bool;
    angular.forEach($ctrl.data, function(item){if(item.childs) item._expand=bool;});
    
  };
  
  //~ $ctrl.searchComplete = [];в InitData
  $ctrl.SortSearchComplete = function (a,b) {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  };
  $ctrl.FilterThisId = function(it_id){return it_id === this.id; };
  //~ $ctrl.FilterChilds = function(ch_id){return ch_id === this.id; };
  $ctrl.FilterSearchComplete = function (data){// на разных уровнях своя фильтрация общего списка поиска
    var val = data.data;
    // запретить зацикливание веток
    if (val.id === $ctrl.parent.id || $ctrl.parent.parents_id && $ctrl.parent.parents_id.filter($ctrl.FilterThisId, val).length) return false;
    if ($ctrl.parent.childs && $ctrl.parent.childs.filter($ctrl.FilterThisId, val).length) return false;
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
        $ctrl.searchComplete.push({value: val.parents_name.join(' ')+' '+val.name, data:val});
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
        var vals = angular.copy(suggestion.data.parents_name);
        vals.push(suggestion.data.name);
        return arguments[3].options.formatResultsArray(vals, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        $ctrl.searchtField.val('');
        $ctrl.showBtnNewRole = false;
        $timeout(function(){
          if (item) {
            item.attach = suggestion.data;
            if (item._edit) item._edit.name = '';
            else item.name='';
          }
          else {
            //~ $ctrl.ExpandItem(suggestion.data);
            $ctrl.data.filter($ctrl.FilterItems, suggestion.data.parents_id).map(function(it){it._expand=true;});
            $ctrl.SelectItem(suggestion.data, true);//._selected = true;
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
  //~ });// timeoutсотрудники
    
  };
  
  $ctrl.DelAttach = function(item, event){
    $timeout(function(){delete item.attach;});
  };
  
  //~ $ctrl.CheckItem = function(item){
    //~ item._checked = !item._checked;
    
    //~ $ctrl.SaveCheck(item);
  //~ };
  
  
  $ctrl.Save = function(item, is_disable){
    if (is_disable) return item.name.length || item.attach;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    
    //~ item.parent = $ctrl.parent.id;
    
    $http.post(appRoutes.url_for(($ctrl.param.URLs && $ctrl.param.URLs.saveRole) || 'доступ/сохранить роль'), item, {timeout: $ctrl.cancelerHttp.promise})
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
    
    
  };
  
  $ctrl.Disable = function(item){
    if (item.disable) item.disable = 0;
    else item.disable = 1;
    $ctrl.Save(item);
  };
  
  $ctrl.Remove = function(item){
    item.remove = item.id;
    item.parent = $ctrl.parent.id;
    $ctrl.Save(item);
  };
  
  $ctrl.ReqUsers = function(item){
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();

    
    
    $http.get(appRoutes.url_for(($ctrl.param.URLs && $ctrl.param.URLs.roleProfiles) || 'доступ/пользователи роли', item.id))//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.users = resp.data;
      });
    
    //~ angular.forEach($ctrl.data, function(it){it._checked = false;});// сбросить крыжики
  };

  $ctrl.ReqRoutes = function(item){
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    if (!($ctrl.param.URLs && $ctrl.param.URLs.roleRoutes === null)) $http.get(appRoutes.url_for(($ctrl.param.URLs && $ctrl.param.URLs.roleRoutes) || 'доступ/маршруты роли', item.id))//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.routes = resp.data;
        
      });
    
    //~ angular.forEach($ctrl.data, function(it){it._checked = false;});// сбросить крыжики
  };
  /*
  $ctrl.CheckItems = function(data){// data - массив ИДов
    
    angular.forEach($ctrl.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(item_id){
        if (item.id === item_id) item._checked = true;
      });
      
    });
  };*/
  $ctrl._FilterChecked = function(item){return item._checked;};
  $ctrl.CheckItemsCount = function(){
    return $ctrl.data.filter($ctrl._FilterChecked).length;
    
  };
  
  ///связь
  $ctrl.SaveCheck = function(item){
    item._checked = !item._checked;
    if (!($ctrl.param.user || $ctrl.param.route)) return;
    var id1 = ($ctrl.param.route && $ctrl.param.route.id) || item.id;
    var id2 = ($ctrl.param.user && $ctrl.param.user.id) || item.id;

    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    if (id1 && id2) $http.get(appRoutes.url_for(($ctrl.param.URLs && $ctrl.param.URLs.saveRef) || 'админка/доступ/сохранить связь', [id1, id2]), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) $ctrl.error = resp.data.error;
        else Materialize.toast('Успешно сохранено', 1000, 'green');
        console.log('Связь: ', resp.data);
        if ($ctrl.param.roles) {
          if (resp.data.ref) $ctrl.param.roles.push(item.id);
          else $ctrl.param.roles.splice($ctrl.param.roles.indexOf(item.id), 1);
          $ctrl.WatchParamRoles($ctrl.param.roles);
        }
        
      });
  };
  
  $ctrl.ItemStyle = function(item){
    if ($ctrl.level === 0) return {};
    return {"padding-left":'1.2rem'};
    
  };
  
  $ctrl._FilterParent = function(it){ return it.id === this.id && it.parent == this.parents1[0]; };
  $ctrl.PrimaryParent = function(item){ //для непервичной связи с родительской группой найти первичную группу
    var parent = $ctrl.data.filter($ctrl._FilterParent, item).pop();
    //~ console.log("PrimaryParent", parent);
    if (parent) return parent.parents_name;//.slice(1);
    return parent;
    
  };
  
};

/*=====================================================================*/

module

.component('rolesList', {
  templateUrl: "access/roles/list",
  //~ scope: {},
  bindings: {
    param: '<', // 
    data: '<', //
    level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
    parent: '<',
    searchComplete: '<',// для всех уровней одни данные поиска, но фильтруются с учетом критериев недопустимых зацикливаний

  },
  controller: Controll
})

;

}());