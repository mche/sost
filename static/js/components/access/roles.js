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
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',

var Controll = function($scope, $rootScope, $http, $q, $timeout, $element, appRoutes){
  var $c = this;
  //~ $scope.$timeout = $timeout;
  
  $c.$onInit = function() {
    
    if ($c.level === undefined) $c.level = 0;
    if ($c.parent === undefined) $c.parent = {"id": null, "name000": 'Группы', "parents_name":[]};//!!!
    //~ if ($c.parent.parents_name[0] === null)  $c.parent.parents_name[0] = 'Группы';
    //~ else $c.parent.parents_name.unshift('Группы');
    
    if (!$c.data) $c.LoadData().then(function(){
      $c.InitData();
      
    });
    else $timeout(function() {$c.InitData();});
    
    $c.InitEventsWatch();
    
  };
  
  $c.InitEventsWatch = function(){
    // слушаем событие в нужном нам $scope
    if($c.level !== 0) return;
    
    $scope.$on('RefreshData', function (event, data, item) {
      //~ console.log("RefreshData", data, item); // Данные, которые нам прислали
      //~ $c.data = [];
      //~ $timeout(function(){
        //~ $c.data = data;
        //~ $c.ready = false;
      $c.Refresh().then(function(){
        $c.InitData();
        $c.searchComplete.splice(0, $c.searchComplete.length);///тогда список обновится
        $c.InitSearch();
        //~ item = $c.data.filter(function(it){ return it.id === item.id}).pop();
        if(item) {
          //~ console.log("RefreshData", item);
          var it = $c.data.filter($c.FilterItem, item).pop();
          $c.data.filter($c.FilterItems, it.parents_id).map(function(it){it._expand=true;});//~ $c.ExpandItem(item);
          
          
          $timeout(function() {
             //~ $c.Scroll2Item(item);
            $c.SelectItem(it, true);
          }, 100);
          
        }
        
        $('.tabs', $($element[0])).tabs({"indicatorClass": 'red',});
        
      });
      
    });
    
    $scope.$watch(
      function(scope) { return $c.param.roles; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) $c.WatchParamRoles(newValue);
      }
    );
  };
  
  $c.Scroll2Item = function(item){
    $timeout(function() {
      var container = $('ul.roles', $($element[0]));
      var el = $('#role-'+item.id, container);
      container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1000);
    }, 100);
  };
  
  $c.WatchParamRoles = function(roles){///не всегда срабатывает $watch
    //~ $c.ExpandAll(false);
    var items = $c.data.filter($c.FilterItems, roles || []);
    //~ console.log("watch roles: ", items);
    $rootScope.$broadcast('Роли по $c.param.roles', items);
    angular.forEach($c.data, function(it){it._checked = false; it._selected = false;});// сбросить все it._expand=false;
    var parents = [];// развернуть по родителям
    items.map(function(it){
      it._checked = true;
      Array.prototype.push.apply(parents, it.parents_id);
    });
    //~ $c.CheckItems(items);
    $c.data.filter($c.FilterItems, parents).map(function(it){it._expand=true;});
    
  };
  
  $c.FilterItem = function(it){
    return this.id == it.id;
  };
  $c.FilterChecked = function(bool){//меню
    var checked = $c.filterChecked;
    $c.filterChecked = undefined;
    $timeout(function(){
      if (bool === undefined) bool = !checked;
      $c.filterChecked = bool;
      
    });
    if (bool === undefined) bool = !$c.filterChecked;
    $c.filterChecked = bool;
    
  };
  
  $c.FilterItems = function(it){// this -  массив ИДов
    return this.some(function(id){return id == it.id});
    
  };
  
  $c.InitData = function(){
    $scope.newItem = {"name":'', "descr":'', "parent": $c.parent.id};
    if(!$c.searchComplete) $c.searchComplete = [];
    //~ console.log("searchComplete", $c.searchComplete, $c.level);
    $c.ready = true;
    
    if($c.level === 0) $timeout(function() {
      var list = $('ul.roles', $($element[0]));
      var top = list.offset().top+5;
      list.css("height", 'calc(100vh - '+top+'px)');
      list.css("border",'1px solid #e0e0e0');
    });
    
  };
  
  $c.NewItem = function(item){
    //~ $scope.newItem = {"name":'', "parent": $c.parent.id};
    delete $c.error; 
    item._newItem = !item._newItem;
    item._expand = true;
    //~ item.name = $c.searchtField.val();
    if(item === $c.parent) $c.ExpandAll(false);
  };
  
  //~ $c.CloseNew = function(){
    //~ $c.parent._newItem = false;
  //~ };
  
  
  $c.LoadData = function (){
    if (!$c.data) $c.data = [];
    return $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.roles) || 'доступ/список ролей'))
      .then(function(resp){
        Array.prototype.push.apply($c.data, resp.data);
      });
    
  };
  
  $c.Refresh = function(){
    $c.data.splice(0, $c.data.length);
    return $c.LoadData();
    
  };
  
  $c.filterParent = function(item){
    //~ var len = item.parents_id && item.parents_id.length;
    //~ if (!len) return false;
    return item.parent === $c.parent.id;
    
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
  
  $c.SelectItem = function (item, select){// флаг req для запроса пользователей/маршрутов этой роли
    //~ item._expand = true;
    //~ $timeout(function(){$c.ExpandAll(true);});
    if (select === undefined) select = !item._selected;
    angular.forEach($c.data, function(it){it._selected = false; it._checked = false;});// сбросить
    item._selected = select;
    
    //~ $timeout(function(){
      if (!item._selected) {
        angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = null;});
      }
      
      else{// if (req) 
        
        angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = undefined;});
        $c.param.role = item;
        $c.ReqUsers(item);
        $c.ReqRoutes(item);
        //~ angular.forEach($c.data, function(it){it._checked = false;});// сбросить крыжики
        $c.Scroll2Item(item);
      }
    //~ });
    
    /*
    var parents = [];
    angular.forEach($c.data, function(it){
      it._selected = selected ? false : (it.id === item.id);
      if (it._selected) Array.prototype.push.apply(parents, it.parents_id);
    });
    
    if(parents.length) angular.forEach($c.data, function(it){
      angular.forEach(parents, function(parent_id){
        if (it.id === parent_id) it._expand = true;
      });
    });*/
    
  };
  
  $c.ExpandIf = function(item){
    if(item.parents1 && item.parents1.length > 1 && item.parents1[0] != item.parent) return false;
    return item._expand;
    
  };
  
  $c.ExpandAll = function(bool){
    if (bool === undefined) bool = !$c.expandAll;
    $c.expandAll = bool;
    angular.forEach($c.data, function(item){if(item.childs) item._expand=bool;});
    
  };
  
  //~ $c.searchComplete = [];в InitData
  $c.SortSearchComplete = function (a,b) {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  };
  
  $c.FilterThisId = function(it_id){return it_id === this.id; };
  //~ $c.FilterChilds = function(ch_id){return ch_id === this.id; };
  $c.FilterSearchComplete = function (data){// на разных уровнях своя фильтрация общего списка поиска
    var val = data.data;
    // запретить зацикливание веток
    if (val.id === $c.parent.id || $c.parent.parents_id && $c.parent.parents_id.filter($c.FilterThisId, val).length) return false;
    if ($c.parent.childs && $c.parent.childs.filter($c.FilterThisId, val).length) return false;
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
        $c.searchComplete.push({value: val.parents_name.join(' ')+' '+val.name, data:val});
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
        var vals = angular.copy(suggestion.data.parents_name);
        vals.push(suggestion.data.name);
        return arguments[3].options.formatResultsArray(vals, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        $c.searchtField.val('');
        $c.showBtnNewRole = false;
        $timeout(function(){
          if (item) {
            item.attach = suggestion.data;
            if (item._edit) item._edit.name = '';
            else item.name='';
          }
          else {
            //~ $c.ExpandItem(suggestion.data);
            $c.data.filter($c.FilterItems, suggestion.data.parents_id).map(function(it){it._expand=true;});
            $c.SelectItem(suggestion.data, true);//._selected = true;
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
  //~ });// timeoutсотрудники
    
  };
  
  $c.DelAttach = function(item, event){
    $timeout(function(){delete item.attach;});
  };
  
  //~ $c.CheckItem = function(item){
    //~ item._checked = !item._checked;
    
    //~ $c.SaveCheck(item);
  //~ };
  
  
  $c.Save = function(item, is_disable){
    if (is_disable) return item.name.length || item.attach;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    delete $c.error;
    
    //~ item.parent = $c.parent.id;
    
    $http.post(appRoutes.url_for(($c.param.URLs && $c.param.URLs.saveRole) || 'доступ/сохранить роль'), item, {timeout: $c.cancelerHttp.promise})
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
    
    
  };
  
  $c.Disable = function(item){
    if (item.disable) item.disable = 0;
    else item.disable = 1;
    $c.Save(item);
  };
  
  $c.Remove = function(item){
    item.remove = item.id;
    item.parent = $c.parent.id;
    $c.Save(item);
  };
  
  $c.ReqUsers = function(item){
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();

    
    
    $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.roleProfiles) || 'доступ/пользователи роли', item.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.users = resp.data;
      });
    
    //~ angular.forEach($c.data, function(it){it._checked = false;});// сбросить крыжики
  };

  $c.ReqRoutes = function(item){
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    if (!($c.param.URLs && $c.param.URLs.roleRoutes === null)) $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.roleRoutes) || 'доступ/маршруты роли', item.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.routes = resp.data;
        
      });
    
    //~ angular.forEach($c.data, function(it){it._checked = false;});// сбросить крыжики
  };
  /*
  $c.CheckItems = function(data){// data - массив ИДов
    
    angular.forEach($c.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(item_id){
        if (item.id === item_id) item._checked = true;
      });
      
    });
  };*/
  $c._FilterChecked = function(item){return item._checked;};
  $c.CheckItemsCount = function(){
    return $c.data.filter($c._FilterChecked).length;
    
  };
  
  ///связь
  $c.SaveCheck = function(item){
    item._checked = !item._checked;
    if (!($c.param.user || $c.param.route)) return;
    var id1 = ($c.param.route && $c.param.route.id) || item.id;
    var id2 = ($c.param.user && $c.param.user.id) || item.id;

    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    if (id1 && id2) $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.saveRef) || 'админка/доступ/сохранить связь', [id1, id2]), {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) $c.error = resp.data.error;
        else Materialize.toast('Успешно сохранено', 1000, 'green');
        console.log('Связь: ', resp.data);
        if ($c.param.roles) {
          if (resp.data.ref) $c.param.roles.push(item.id);
          else $c.param.roles.splice($c.param.roles.indexOf(item.id), 1);
          $c.WatchParamRoles($c.param.roles);
        }
        
      });
  };
  
  $c.ItemStyle = function(item){
    if ($c.level === 0) return {};
    return {"padding-left":'1.2rem'};
    
  };
  
  $c._FilterParent = function(it){ return it.id === this.id && it.parent == this.parents1[0]; };
  $c.PrimaryParent = function(item){ //для непервичной связи с родительской группой найти первичную группу
    var parent = $c.data.filter($c._FilterParent, item).pop();
    //~ console.log("PrimaryParent", parent);
    if (parent) return parent.parents_name;//.slice(1);
    return parent;
    
  };
  
};

/*=====================================================================*/

module

.component('rolesList', {
  controllerAs: '$c',
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