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
      });
      
    });
    
    $scope.$watch(
      function(scope) { return $ctrl.param.users; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) {
          // Only increment the counter if the value changed
          //~ console.log("$scope.$watch users", oldValue, newValue);
          $ctrl.CheckUserS(newValue);
          $ctrl.ShowTab(0);
        }
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
    var n = {"names":[], "login":'', "pass":''};
    $ctrl.data.unshift(n);
    $timeout(function(){
      $ctrl.Edit(n);
      $ctrl.ShowTab(0);
    });
    
  };
  
  
  $ctrl.Edit = function(user){
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
    //~ if ($ctrl.param.user) $ctrl.param.user._selected = false;
    
    if (user._selected) $ctrl.ReqRoles(user);
    else $ctrl.param.user = undefined;
    
    if (arguments.length == 2) $timeout(function() {
      $('html, body').animate({
          scrollTop: $('#user-'+user.id, $($element[0])).offset().top //project-list
      }, 1500);
    });
    
  };
  
  $ctrl.CheckUser = function(user){
    user._checked = !user._checked;
    
    if ($ctrl.param.role) $ctrl.SaveCheckUser(user);
    
    
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
  };
  
  $ctrl.ShowPass = function(user){
    user._edit._showPass = !user._edit._showPass;
  };
  
  $ctrl.SelectTab = function(index) {
    $ctrl.tab = index;
    
  };
  
  $ctrl.FilterTab = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    var tab = $ctrl.tab;
    if (this !== undefined) tab = this;// это подсчет
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
      preserveInput: false,
      appendTo: searchtField.parent(),
      containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var ret = [];
        var pattern = new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
        //~ var title = suggestion.data.names.join(' ')+'  ('+suggestion.data.login+')'
        var replace =  suggestion.value//suggestion.data.title
            .replace(pattern, '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
        return '<span class="teal-text">'+replace+'</span>';
      },
      triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ $ctrl.tab = !!suggestion.data.disable;
        searchtField.val('');
        $timeout(function(){
          $ctrl.ShowTab(suggestion.data.disable ? 1 : 0);
          $ctrl.ToggleSelect(suggestion.data, true);
        });
        
      },
      onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ReqRoles = function(user){
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $ctrl.param.user = user;
    $ctrl.param.role = undefined;
    $ctrl.param.roles = undefined;
    $ctrl.param.users = undefined;
    
    $http.get(appRoutes.url_for('доступ/роли пользователя', user.id), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.param.roles = resp.data;
        $ctrl.param.user = user;
        $ctrl.param.role = undefined;
        $ctrl.param.users = undefined;
        
      });
    
    angular.forEach($ctrl.data, function(it){it._checked = false; if(it.id !== user.id) it._selected=false;});// сбросить крыжики
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
    
    
  };
  
  $ctrl.SaveCheckUser = function(user){
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