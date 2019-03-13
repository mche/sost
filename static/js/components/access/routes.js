(function () {'use strict';
/*
  Маршруты
*/
var moduleName = "Routes";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes']);//'ngSanitize',

var Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $c = this;
  
  $c.$onInit = function() {
    $c.LoadData().then(function(){
      $c.ready = true;
      
      $timeout(function() {
        $('.tabs', $($element[0])).tabs({"indicatorClass": 'red',});
        $c.tabsReady = true;
        $c.ShowTab(2);
        $('.modal').modal();

      });
      
    });
    
    $scope.$watch(
      function(scope) { return $c.param.routes; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) {
          $c.CheckRoutes(newValue);
          //~ $c.ShowTab(0);
        }
      }
    );
    $scope.$watch(
      function(scope) { return $c.param.user; },
      function(newValue, oldValue) {
        
        if ( newValue === null ) $c.filterChecked = false;
      }
    );
    
  };

  $c.LoadData = function (){
    $c.searchComplete.length = 0;
    $c.searchNavComplete.length = 0;
    return $http.get(appRoutes.url_for('доступ/список маршрутов'))
      .then(function(resp){
        if (resp.data) $c.data = resp.data;
        else $c.data = [];
      });
    
  };
  
  $c.FilterData = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    //~ return true;
    var tab = $c.tab;
    if (this !== undefined) tab = this;// это подсчет
    else if ($c.filterChecked) return !!item._checked || !! item._selected; //
    else if ($c.filterDisable) return !!item.disable; //
    
    var only = item.auth && (item.auth.toLowerCase() === 'only');
    if (tab  === undefined || tab === 0) return true;//
    else if (tab === 1 && item.roles)  return !!item.auth && !only;//
    else if (tab === 2 && !item.roles)  return !!item.auth && !only;//
    else if (tab === 3) return only;
    else if (tab === 4) return !item.auth;
    return false;
    //~ return item.auth && !only && !!item.roles === !tab;
  };
  $c._FilterChecked = function(item){return item._checked || item._selected;};
  $c.FilterCheckedCount = function(){
    if($c.filterChecked) return $c.data.filter($c._FilterChecked).length;
    else return "";
  };
  
  $c.ShowTab = function(idx){
    idx = idx || 0;
    $('.tabs li:eq('+idx+') a', $($element[0])).click();
    $c.tab = idx;
  };
  
  $c.searchComplete = [];
  $c.InitSearch = function(){// ng-init input searchtField
    if($c.searchComplete.length === 0) angular.forEach($c.data, function(val) {
      $c.searchComplete.push({value: ['request', 'to', 'name'].map(function(f){return val[f];}).join(' '), data:val});
    });
    
    var searchtField = $('input[name="search"]', $($element[0]));
   
    searchtField.autocomplete({
      lookup: $c.searchComplete,
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
          $c.filterChecked = false;
          $c.filterDisable = false;
          $c.ShowTab(suggestion.data.roles ? 1 : 2);
          $c.ToggleSelect(suggestion.data, true);
        });
        
      },
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $c.New = function(flag){
    if(flag) return !$c.data || !$c.data[0] || $c.data[0].id;
    $c.filterChecked = false;
    var n = {"request": '', "to": '', "name": '', "descr":'', "auth":'', "host_re": ''};
    $c.data.unshift(n);
    $timeout(function(){
      $c.Edit(n);
      $c.ShowTab(0);
    });
    
  };
  
  $c.Edit = function(route){
    if(route._edit) return $c.CloseEdit(route);
    $timeout(function(){
      route._edit = angular.copy(route);
      $timeout(function(){$('textarea', $element[0]).keydown();});
    });
    
    //~ $timeout(function() {
      //~ $('html, body').animate({
          //~ scrollTop: $('ul.routes li.edit', $($element[0])).offset().top //project-list
      //~ }, 1500);
    //~ });
    
    
  };
  
  $c.Save = function(route, is_disable){// второй   bool
    var edit = route._edit;
    if (is_disable) return edit.request && edit.request.length && edit.name && edit.name.length;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    delete $c.error;
    if(!edit.id && $c.param.role && $c.param.role.id) edit.role=$c.param.role.id;
    
    $http.post(appRoutes.url_for('доступ/сохранить маршрут'), edit, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data.error) $c.error = resp.data.error;
        else if (edit.remove) {
          $c.data.splice($c.data.indexOf(route), 1);
        }
        else if (resp.data.success) {
          angular.forEach(resp.data.success, function(val, key){
            route[key] = val;
          });
          $c.searchComplete.length = 0;
          $c.searchNavComplete.length = 0;
          if (!edit.id) {
            //~ $c.data.unshift(user);
            $c.LoadData();//refresh
          }
          $c.CloseEdit(route);
        }
        
      });
    
    
  };
  
  $c.Disable = function(route){
    route._edit.disable = !route._edit.disable;
    $c.Save(route);
    
  };
  
  $c.Remove = function(route, confirmed){
    if (!confirmed) return $c.confirmRemoveRoute = route;
    route._edit.remove = route.id;
    $c.Save(route);
    
  };
  
  $c.CloseEdit = function(route, idx){
    if(!route.id) $c.data.splice(idx || 0, 1);
    route._edit = undefined;
    delete $c.error;
  };
  
  $c.CheckRoutes = function(data){
    angular.forEach($c.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(id){
        if (item.id === id) item._checked = true;
      });
      
    });
    $c.filterChecked = true;// сразу отфильтровать список
    //~ if ($c.param.user)  $c.filterChecked = true;// сразу отфильтровать список
    //~ else $c.filterChecked = false;

    
  };

  $c.ToggleFilterChecked = function(){//меню
    $c.filterChecked = !$c.filterChecked;
    
  };
  
  $c.ToggleFilterDisable = function(){
    $c.filterDisable = !$c.filterDisable;
    
  };

  $c.SaveCheck = function(route){
    if($c.param.user) return;
    route._checked = !route._checked;
    if (!$c.param.role) return;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [route.id, $c.param.role.id]), {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) $c.error = resp.data.error;
        console.log(resp.data);
        
      });
  };

  $c.ToggleSelect = function(route, select){// bool
    if (select === undefined) select = !route._selected;
    route._selected = select;
    
    if (route._selected) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = undefined;});
      $c.param.route = route;
      $c.ReqRoles(route);
      $c.ReqUsers(route);
      // еще польз
      angular.forEach($c.data, function(it){it._checked = false; if(it.id !== route.id) it._selected=false;});// сбросить крыжики
    }
    else {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = null;});
    }
    
    if (arguments.length == 2) $timeout(function() {
      $('html, body').animate({
          scrollTop: $('#route-'+route.id, $($element[0])).offset().top //project-list
      }, 1500);
    });
    
  };
  
  $c.ReqRoles = function(route){
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('доступ/роли маршрута', route.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.roles = resp.data;
        
      });
  };
  
  $c.ReqUsers = function(route){
  
    
    $http.get(appRoutes.url_for('доступ/пользователи маршрута', route.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.users = resp.data;
      });
    
    //~ angular.forEach($c.data, function(it){it._checked = false;});// сбросить крыжики
  };
  
   $c.RouteFormatPerl = function(route){
     var s = route.request.split(/\s+/);
     if (s.length == 1) s.unshift('route');
     return "[{0}=>'{1}', {2}{3} to=>'{4}', name=>'{5}'{6}],".format(
        s[0].toLocaleLowerCase(), s[1],
      (route.auth || '') && " over=>{access=>{auth=>q|{0}|}}, ".format(route.auth),
      (route.host_re || '') && " over=>{host => {0}}, ".format(route.host_re),
      route.to, route.name,
      (route.descr || '') && ", descr=>q|{0}|, ".format(route.descr),
     
     );
     
     
  };
  
  $c.ToggleUpload = function(){
    if($c.upload !== undefined) $c.upload = undefined;
    else $c.upload = '';
    //~ var bool = !$c.upload;
    //~ $timeout(function(){ $c.upload = bool;});
    $c.download = undefined;
    
  };
  $c.Upload = function(){
    
    $c.error = undefined;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
   $http.post(appRoutes.url_for('админка/доступ/загрузить маршруты'), {"data": $c.upload, "role":$c.param.role && $c.param.role.id}, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          console.log("Upload success ", resp.data.success);
          //~ $c.upload = angular.toJson(resp.data.success);
          $c.upload = undefined;
          $c.LoadData().then(function(){$c.ShowTab(2)});
        }
        
      });
    
  };
  
  //~ $c.ToggleDownload = function(){
  //~ };
  
  $c.Download = function(){
    $c.upload = undefined;
    if($c.download !== undefined) return $c.download = undefined;
    
    var ids = $c.data.filter($c.FilterData).map(function(item){ return item.id; });
    //~ console.log("Download", ids);
    if(!ids.length) return;
    
    $c.error = undefined;

    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('админка/доступ/выгрузить маршруты'), {"ids": ids}, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          $c.download = resp.data.success;
          $timeout(function(){$('textarea', $element[0]).keydown();});
        }
        
      });
    
  };
  
  $c.Refresh = function(){
    $c.refresh = true;
    
    $c.LoadData().then(function(){
      $c.refresh = undefined;
      $c.ShowTab(2);
      
    });
    
  };
  
  $c.searchNavComplete = [];
  $c.InitSearchNav = function(){// ng-init input searchtField
    if($c.searchNavComplete.length === 0) angular.forEach($c.data, function(val) {
      $c.searchNavComplete.push({value: ['request', 'to', 'name'].map(function(f){return val[f];}).join(' '), data:val});
    });
    
    var searchtField = $('input[name="search-nav"]', $($element[0]));
   
    searchtField.autocomplete({
      lookup: $c.searchNavComplete,
      appendTo: searchtField.parent(),
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      onSelect: function (suggestion) {
        searchtField.val('');
        /*связь наоборот от роли к маршруту*/
        $c.SaveRef($c.param.role, suggestion.data).then(function(){
          $c.param.role['навигационный маршрут'] = suggestion.data;
        });
        
      },
      //~ onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      //~ onHide: function (container) {}
      
    });
    
  };
  
  $c.SaveRef = function(r1, r2){// и удаляет связь если она есть
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [r1.id, r2.id]), {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) $c.error = resp.data.error;
        console.log(resp.data);
        
      });
  };
  
  $c.DelNavRef = function(){
    $c.SaveRef($c.param.role, $c.param.role['навигационный маршрут'])
      .then(function(resp){ $c.param.role['навигационный маршрут'] = undefined; });
  };
  
};


/*=====================================================================*/

module

.component('routesList', {
  controllerAs: '$c',
  templateUrl: "access/routes/list",
  //~ scope: {},
  bindings: {
    param: '<', // 

  },
  controller: Controll
})

;

}());