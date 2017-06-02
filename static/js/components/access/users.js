(function () {'use strict';
/*
  Пользователи/сотрудники
  Список
  Выбор позиции
  Добавление
  Изменение
  Удаление
*/
var moduleName = "Users";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',

var Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function() {
    
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
      $timeout(function() {
        $('.tabs', $($element[0])).tabs();
        $ctrl.tabsReady = true;
        $ctrl.ShowTab(0);
      });
      
    });
    
    $scope.$watch(
      function(scope) { return $ctrl.param.users; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) {
          $ctrl.CheckUserS(newValue);
          //~ $ctrl.ShowTab(0);
        }
      }
    );
    $scope.$watch(
      function(scope) { return $ctrl.param.route; },
      function(newValue, oldValue) {
        
        if ( newValue === null ) $ctrl.filterChecked = false;
      }
    );
    
  };
  
  
  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for('доступ/список пользователей'))
      .then(function(resp){
        $ctrl.data = resp.data;
      });
    
  };
  
  $ctrl.New = function(flag){
    if(flag) return $ctrl.data[0] && $ctrl.data[0].id;
    $ctrl.filterChecked = false;
    var n = {"names":[], "login":'', "pass":''};
    $ctrl.data.unshift(n);
    $timeout(function(){
      $ctrl.Edit(n);
      $ctrl.ShowTab(0);
    });
    
  };
  
  
  $ctrl.Edit = function(user){
    if(user._edit) return $ctrl.CloseEdit(user);
    $timeout(function(){
      user._edit = angular.copy(user);
    });
    
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $('ul.users li.edit', $($element[0])).offset().top //project-list
      }, 1500);
    });
    
    
  };
  
  $ctrl.ToggleSelect = function(user, select){// bool
    if (select === undefined) select = !user._selected;
    user._selected = select;
    
    if (user._selected) {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = undefined;});
      $ctrl.param.user = user;
      $ctrl.ReqRoles(user);
      $ctrl.ReqRoutes(user);
      angular.forEach($ctrl.data, function(it){it._checked = false; if(it.id !== user.id) it._selected=false;});// сбросить крыжики
    }
    else {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = null;});
    }
    
    if (arguments.length == 2) $timeout(function() {
      $('html, body').animate({
          scrollTop: $('#user-'+user.id, $($element[0])).offset().top //project-list
      }, 1500);
    });
    
  };
  
  
  $ctrl.SaveActive  = function(user) {
    var edit = user._edit;
    return edit.names[0] && edit.names[0].length && (!edit.login.length || edit.login.length > 3 && edit.pass.length >3);
    
  };
  
  $ctrl.Save = function(user){
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('доступ/сохранить пользователя'), user._edit, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          angular.forEach(resp.data.success, function(val, key){
            user[key] = val;
          });
          $ctrl.CloseEdit(user);
        }
        
      });
    
    
  };
  
  $ctrl.Disable = function(user){
    user._edit.disable = !user._edit.disable;
    $ctrl.Save(user);
    
  };
  
  $ctrl.CloseEdit = function(user, idx){
    if(!user.id) $ctrl.data.splice(idx || 0, 1);
    user._edit = undefined;
    delete $ctrl.error;
  };
  
  $ctrl.ShowPass = function(user){
    user._edit._showPass = !user._edit._showPass;
  };
  
  $ctrl.SelectTab = function(index) {
    $ctrl.tab = index;
    
  };
  
  $ctrl.FilterData = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    var tab = $ctrl.tab;
    if (this !== undefined) tab = this;// это подсчет
    else if ($ctrl.filterChecked) return item._checked; //
    if (tab  === undefined ) return false;
    return !item.disable === !tab;
  };
  
  $ctrl.ShowTab = function(idx){
    idx = idx || 0;
    $('.tabs li:eq('+idx+') a', $($element[0])).click();
    $ctrl.tab = idx;
  };
  
  $ctrl.InitSearch = function(){// ng-init input searchtField
    
    var autocomplete = [];
    angular.forEach($ctrl.data, function(val) {
      autocomplete.push({value: val.names.join(' ')+'  ('+val.login+')', data:val});
    });
    
    var searchtField = $('input[name="search"]', $($element[0]));
   
    searchtField.autocomplete({
      lookup: autocomplete,
      //~ preserveInput: false,
      appendTo: searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ $ctrl.tab = !!suggestion.data.disable;
        searchtField.val('');
        $timeout(function(){
          $ctrl.filterChecked = false;
          $ctrl.ShowTab(suggestion.data.disable ? 1 : 0);
          $ctrl.ToggleSelect(suggestion.data, true);
        });
        
      },
      onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ReqRoles = function(user){
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('доступ/роли пользователя', user.id))//, {timeout: $ctrl.cancelerHttp.promise})
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
  
  $ctrl.ReqRoutes = function(user){
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('доступ/маршруты пользователя', user.id))//, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.routes = resp.data;
        
      });
  };
  
  $ctrl.CheckUserS = function(data){
    
    angular.forEach($ctrl.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(user_id){
        if (item.id === user_id) item._checked = true;
      });
      
    });
    
    $ctrl.filterChecked = true;// сразу отфильтровать список
    
    //~ if ($ctrl.param.route)  $ctrl.filterChecked = true;// сразу отфильтровать список
    //~ else $ctrl.filterChecked = false;
    
  };
  
  $ctrl.ToggleFilterChecked = function(){//меню
    $ctrl.filterChecked = !$ctrl.filterChecked;
    
  };
  
  $ctrl.SaveCheck = function(user){
    if($ctrl.param.route) return;
    user._checked = !user._checked;
    if (!$ctrl.param.role) return;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    
    $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [$ctrl.param.role.id, user.id]), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) $ctrl.error = resp.data.error;
        console.log(resp.data);
        
      });
  };
  
  
};

/*=====================================================================*/

module

.component('usersList', {
  templateUrl: "access/users/list",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Controll
})

;

}());