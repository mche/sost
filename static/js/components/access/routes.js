(function () {'use strict';
/*
  Маршруты
*/
var moduleName = "Routes";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes']);//'ngSanitize',

var Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function() {
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
      $timeout(function() {
        $('.tabs', $($element[0])).tabs();
        $ctrl.tabsReady = true;
        $ctrl.ShowTab(2);

      });
      
    });
    
    $scope.$watch(
      function(scope) { return $ctrl.param.routes; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) {
          $ctrl.CheckRoutes(newValue);
          //~ $ctrl.ShowTab(0);
        }
      }
    );
    $scope.$watch(
      function(scope) { return $ctrl.param.user; },
      function(newValue, oldValue) {
        
        if ( newValue === null ) $ctrl.filterChecked = false;
      }
    );
    
  };

  $ctrl.LoadData = function (){
    $ctrl.searchComplete.length = 0;
    $ctrl.searchNavComplete.length = 0;
    return $http.get(appRoutes.url_for('доступ/список маршрутов'))
      .then(function(resp){
        if (resp.data) $ctrl.data = resp.data;
        else $ctrl.data = [];
      });
    
  };
  
  $ctrl.FilterData = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    //~ return true;
    var tab = $ctrl.tab;
    if (this !== undefined) tab = this;// это подсчет
    else if ($ctrl.filterChecked) return !!item._checked; //
    else if ($ctrl.filterDisable) return !!item.disable; //
    
    var only = item.auth && (item.auth.toLowerCase() === 'only');
    if (tab  === undefined || tab === 0) return true;//
    else if (tab === 1 && item.roles)  return !!item.auth && !only;//
    else if (tab === 2 && !item.roles)  return !!item.auth && !only;//
    else if (tab === 3) return only;
    else if (tab === 4) return !item.auth;
    return false;
    //~ return item.auth && !only && !!item.roles === !tab;
  };
  $ctrl.FilterCheckedCount = function(){
    if($ctrl.filterChecked) return $ctrl.data.filter(function(item){return item._checked;}).length;
    else return "";
  };
  
  $ctrl.ShowTab = function(idx){
    idx = idx || 0;
    $('.tabs li:eq('+idx+') a', $($element[0])).click();
    $ctrl.tab = idx;
  };
  
  $ctrl.searchComplete = [];
  $ctrl.InitSearch = function(){// ng-init input searchtField
    if($ctrl.searchComplete.length === 0) angular.forEach($ctrl.data, function(val) {
      $ctrl.searchComplete.push({value: ['request', 'to', 'name'].map(function(f){return val[f];}).join(' '), data:val});
    });
    
    var searchtField = $('input[name="search"]', $($element[0]));
   
    searchtField.autocomplete({
      lookup: $ctrl.searchComplete,
      //~ preserveInput: false,
      appendTo: searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
        searchtField.val('');
        $timeout(function(){
          $ctrl.filterChecked = false;
          $ctrl.filterDisable = false;
          $ctrl.ShowTab(suggestion.data.roles ? 1 : 2);
          $ctrl.ToggleSelect(suggestion.data, true);
        });
        
      },
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.New = function(flag){
    if(flag) return !$ctrl.data || !$ctrl.data[0] || $ctrl.data[0].id;
    $ctrl.filterChecked = false;
    var n = {"request": '', "to": '', "name": '', "descr":'', "auth":'', "host_re": ''};
    $ctrl.data.unshift(n);
    $timeout(function(){
      $ctrl.Edit(n);
      $ctrl.ShowTab(0);
    });
    
  };
  
  $ctrl.Edit = function(route){
    if(route._edit) return $ctrl.CloseEdit(route);
    $timeout(function(){
      route._edit = angular.copy(route);
    });
    
    //~ $timeout(function() {
      //~ $('html, body').animate({
          //~ scrollTop: $('ul.routes li.edit', $($element[0])).offset().top //project-list
      //~ }, 1500);
    //~ });
    
    
  };
  
  $ctrl.Save = function(route, is_disable){// второй   bool
    var edit = route._edit;
    if (is_disable) return edit.request && edit.request.length && edit.name && edit.name.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('доступ/сохранить маршрут'), edit, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        else if (edit.remove) {
          $ctrl.data.splice($ctrl.data.indexOf(route), 1);
        }
        else if (resp.data.success) {
          angular.forEach(resp.data.success, function(val, key){
            route[key] = val;
          });
          $ctrl.searchComplete.length = 0;
          $ctrl.searchNavComplete.length = 0;
          if (!edit.id) {
            //~ $ctrl.data.unshift(user);
            $ctrl.LoadData();//refresh
          }
          $ctrl.CloseEdit(route);
        }
        
      });
    
    
  };
  
  $ctrl.Disable = function(route){
    route._edit.disable = !route._edit.disable;
    $ctrl.Save(route);
    
  };
  
  $ctrl.Remove = function(route){
    route._edit.remove = route.id;
    $ctrl.Save(route);
    
  };
  
  $ctrl.CloseEdit = function(route, idx){
    if(!route.id) $ctrl.data.splice(idx || 0, 1);
    route._edit = undefined;
    delete $ctrl.error;
  };
  
  $ctrl.CheckRoutes = function(data){
    angular.forEach($ctrl.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(id){
        if (item.id === id) item._checked = true;
      });
      
    });
    $ctrl.filterChecked = true;// сразу отфильтровать список
    //~ if ($ctrl.param.user)  $ctrl.filterChecked = true;// сразу отфильтровать список
    //~ else $ctrl.filterChecked = false;

    
  };

  $ctrl.ToggleFilterChecked = function(){//меню
    $ctrl.filterChecked = !$ctrl.filterChecked;
    
  };
  
  $ctrl.ToggleFilterDisable = function(){
    $ctrl.filterDisable = !$ctrl.filterDisable;
    
  };

  $ctrl.SaveCheck = function(route){
    if($ctrl.param.user) return;
    route._checked = !route._checked;
    if (!$ctrl.param.role) return;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [route.id, $ctrl.param.role.id]), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) $ctrl.error = resp.data.error;
        console.log(resp.data);
        
      });
  };

  $ctrl.ToggleSelect = function(route, select){// bool
    if (select === undefined) select = !route._selected;
    route._selected = select;
    
    if (route._selected) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = undefined;});
      $ctrl.param.route = route;
      $ctrl.ReqRoles(route);
      $ctrl.ReqUsers(route);
      // еще польз
      angular.forEach($ctrl.data, function(it){it._checked = false; if(it.id !== route.id) it._selected=false;});// сбросить крыжики
    }
    else {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = null;});
    }
    
    if (arguments.length == 2) $timeout(function() {
      $('html, body').animate({
          scrollTop: $('#route-'+route.id, $($element[0])).offset().top //project-list
      }, 1500);
    });
    
  };
  
  $ctrl.ReqRoles = function(route){
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('доступ/роли маршрута', route.id))//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.roles = resp.data;
        
      });
  };
  
  $ctrl.ReqUsers = function(route){
  
    
    $http.get(appRoutes.url_for('доступ/пользователи маршрута', route.id))//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.users = resp.data;
      });
    
    //~ angular.forEach($ctrl.data, function(it){it._checked = false;});// сбросить крыжики
  };
  
  $ctrl.ShowUpload = function(){
    if($ctrl.upload !== undefined) $ctrl.upload = undefined;
    else $ctrl.upload = '';
    $ctrl.download = undefined;
    
  };
  $ctrl.Upload = function(){
    
    $ctrl.error = undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
   $http.post(appRoutes.url_for('админка/доступ/загрузить маршруты'), {"data": $ctrl.upload}, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          console.log("Upload success ", resp.data.success);
          //~ $ctrl.upload = angular.toJson(resp.data.success);
          $ctrl.upload = undefined;
          $ctrl.LoadData().then(function(){$ctrl.ShowTab(2)});
        }
        
      });
    
  };
  
  $ctrl.Download = function(){
    $ctrl.upload = undefined;
    if($ctrl.download !== undefined) return $ctrl.download = undefined;
    
    $ctrl.error = undefined;

    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('админка/доступ/выгрузить маршруты'), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        if (resp.data.success) $ctrl.download = resp.data.success;
        
      });
    
  };
  
  $ctrl.Refresh = function(){
    $ctrl.refresh = true;
    
    $ctrl.LoadData().then(function(){
      $ctrl.refresh = undefined;
      $ctrl.ShowTab(2);
      
    });
    
  };
  
  $ctrl.searchNavComplete = [];
  $ctrl.InitSearchNav = function(){// ng-init input searchtField
    if($ctrl.searchNavComplete.length === 0) angular.forEach($ctrl.data, function(val) {
      $ctrl.searchNavComplete.push({value: ['request', 'to', 'name'].map(function(f){return val[f];}).join(' '), data:val});
    });
    
    var searchtField = $('input[name="search-nav"]', $($element[0]));
   
    searchtField.autocomplete({
      lookup: $ctrl.searchNavComplete,
      appendTo: searchtField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        searchtField.val('');
        /*связь наоборот от роли к маршруту*/
        $ctrl.SaveRef($ctrl.param.role, suggestion.data).then(function(){
          $ctrl.param.role['навигационный маршрут'] = suggestion.data;
        });
        
      },
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.SaveRef = function(r1, r2){// и удаляет связь если она есть
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [r1.id, r2.id]), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) $ctrl.error = resp.data.error;
        console.log(resp.data);
        
      });
  };
  
  $ctrl.DelNavRef = function(){
    $ctrl.SaveRef($ctrl.param.role, $ctrl.param.role['навигационный маршрут'])
      .then(function(resp){ $ctrl.param.role['навигационный маршрут'] = undefined; });
  };
  
};


/*=====================================================================*/

module

.component('routesList', {
  templateUrl: "access/routes/list",
  //~ scope: {},
  bindings: {
    param: '<', // 

  },
  controller: Controll
})

;

}());