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
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'SVGCache']);//'ngSanitize',

var Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function() {
    
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
      $timeout(function() {
        $('.tabs', $($element[0])).tabs({"indicatorClass": 'red',});
        $ctrl.tabsReady = true;
        $ctrl.ShowTab(0);
        $timeout(function() {
          var list = $('ul.users', $($element[0]));
          var top = list.offset().top+5;
          list.css("height", 'calc(100vh - '+top+'px)');
        });
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
    $ctrl.searchComplete.length = 0;
    return $http.get(appRoutes.url_for('доступ/список пользователей'))
      .then(function(resp){
        $ctrl.data = resp.data;
        $ctrl.searchComplete.length = 0;
        //~ $ctrl.InitSearch();
      });
    
  };
  
  $ctrl.New = function(flag){
    //~ if(flag) return $ctrl.data[0] && $ctrl.data[0].id;
    if(flag) return $ctrl.showBtnNewUser;
    //~ if(names === undefined) names = [];
    $ctrl.showBtnNewUser = false;
    $ctrl.filterChecked = false;
    var n = {"names":[$ctrl.searchtField.val()], "login":'', "pass":''};
    $ctrl.data.unshift(n);
    $timeout(function(){
      $ctrl.Edit(n);
      $ctrl.ShowTab(0);
      $timeout(function() {
        var container = $('ul.users', $($element[0]));
        var el = $('.card.edit', container);
        container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
      });
    });
    
  };
  
  
  $ctrl.Edit = function(user){
    if(user._edit) return $ctrl.CloseEdit(user);
    $timeout(function(){
      user._edit = angular.copy(user);
    });
    $ctrl.Scroll2User(user);
    
  };
  
  $ctrl.ToggleSelect = function(user, select){// bool
    if (select === undefined) select = !user._selected;
    user._selected = select;
    
    if (user._selected) {
      //~ $ctrl.FilterChecked(false);
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = undefined;});
      $ctrl.param.user = user;
      $ctrl.ReqRoles(user);
      $ctrl.ReqRoutes(user);
      angular.forEach($ctrl.data, function(it){it._checked = false; if(it.id !== user.id) it._selected=false;});// сбросить крыжики
      user._checked = true;
    }
    else {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$ctrl.param[n] = null;});
    }
    
    if (arguments.length == 2) $ctrl.Scroll2User(user);
    
  };
  
  $ctrl.Scroll2User = function(user){
    if(user && !user.id) return;
    $timeout(function() {
      var container = $('ul.users', $($element[0]));
      var el = user ? $('#user-'+user.id, container) : $('li.edit', container);
      container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
      
    });
    
  };
  
  $ctrl.DeleteLogin = function(user) {
    var edit = user._edit;
    edit.login = '';
    edit.pass = '';
    if(edit['login/id']) $ctrl.Save(user);
  };
  
  $ctrl.SaveActive  = function(user) {
    var edit = user._edit;
    if (edit.login && edit.login.length && (edit.login.length < 3 || !edit.pass || edit.pass.length < 4)) return false;
    return edit.names[0] && edit.names[0].length;// && (edit.login && edit.login.length > 2 && edit.pass.length >3);
    
  };
  
  $ctrl.Save = function(user, b_close){// b_close - флажок закрытия редактирования
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('доступ/сохранить пользователя'), user._edit, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          Materialize.toast('Успешно сохранен пользователь', 1000, 'green');
          angular.forEach(resp.data.success, function(val, key){
            user[key] = val;
          });
          //~ $ctrl.searchComplete.length = 0;
          if (!user._edit.id) {//новый польз
            /*$ctrl.LoadData().then(function(){
              //~ $ctrl.Scroll2User(user);
              //~ user._selected = true;
              $ctrl.ToggleSelect(user, true);
            });//refresh$ctrl.ToggleSelect(user)
            */
            //~ $ctrl.data.unshift(user);
            $ctrl.searchComplete.unshift({value: user.names.join(' ')+'  ('+user.login+')', data:user});
            $ctrl.ToggleSelect(user, true);
            
          }
          if (b_close) $ctrl.CloseEdit(user);
        }
        
      });
    
    
  };
  
  $ctrl.Disable = function(user){
    user._edit.disable = !user._edit.disable;
    $ctrl.Save(user, true);
    
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
    else if($ctrl.filterProfile) {
      var re = new RegExp($ctrl.filterProfile,"i");
      //~ return function(row, idx){
        //~ var profile = $ctrl.RowProfile(row);
        return re.test(item.names.join(' '));
      //~ };
      
    }
    if (tab  === undefined ) return false;
    return !item.disable === !tab;
  };
  $ctrl._FilterChecked = function(item){return item._checked;};
  $ctrl.FilterCheckedCount = function(){
    if($ctrl.filterChecked) return $ctrl.data.filter($ctrl._FilterChecked).length;
    else return "";
  };
  
  
  $ctrl.ShowTab = function(idx){
    idx = idx || 0;
    $('.tabs li:eq('+idx+') a', $($element[0])).click();
    $ctrl.tab = idx;
  };
  
  $ctrl.searchComplete = [];
  //~ $ctrl.SearchFocus = function(event){
    //~ if(!$ctrl.searchtField) $ctrl.searchtField = $(event.target);
    //~ $ctrl.InitSearch();
  //~ };
  $ctrl.InitSearch = function(event){// ng-init input searchtField
    //~ $timeout(function(){
    if(event && !$ctrl.searchtField) $ctrl.searchtField = $(event.target);
    else if(!$ctrl.searchtField) $ctrl.searchtField = $('input[name="search"]', $($element[0]));
    
    
    if ($ctrl.searchComplete.length === 0) {
      angular.forEach($ctrl.data, function(val) {
        $ctrl.searchComplete.push({value: val.names.join(' ')+'  ('+val.login+')', data:val});
      });
    }
    
    if(true) return;
    //~ var ac = $ctrl.searchtField.autocomplete();
    //~ console.log("complete test", ac);
    //~ if($('.autocomplete-content', $($element[0])).get(0)) 
    //~ if(ac) return console.log("complete found", ac.clear().setOptions({"lookup": $ctrl.searchComplete}) || ac);
    
    
    //~ $ctrl.searchtField.autocomplete('dispose');
    $ctrl.searchtField.autocomplete({
      lookup: $ctrl.searchComplete,
      //~ preserveInput: false,
      appendTo: $ctrl.searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ showNoSuggestionNotice: true,
      //~ noSuggestionNotice: $ctrl.searchNewUser,
      //~ lastChild: function(value, that){return $ctrl.searchNewUser;},
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ $ctrl.tab = !!suggestion.data.disable;
        $ctrl.searchtField.val('');
        $ctrl.showBtnNewUser = false;
        $timeout(function(){
          //~ $ctrl.filterChecked = true;
          $ctrl.ShowTab(suggestion.data.disable ? 1 : 0);
          $ctrl.ToggleSelect(suggestion.data, true);
        });
        
      },
      onSearchComplete: function(query, suggestions){$timeout(function(){$ctrl.showBtnNewUser = true;});},
      onHide: function (container) {if(!$ctrl.searchtField.val().length) $timeout(function(){$ctrl.showBtnNewUser = false;});}
      
    });
    
    //~ });//timeout
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
  
  $ctrl.FilterChecked = function(bool){//меню
    if (bool === undefined) bool = !$ctrl.filterChecked;
    $ctrl.filterChecked = bool;
    
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
        else {
          console.log(resp.data);
           Materialize.toast('Успешно сохранена связь с пользователем', 1000, 'green');
        }
        
      });
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
    
   $http.post(appRoutes.url_for('админка/доступ/загрузить пользователей'), {"data": $ctrl.upload}, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data && resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          console.log("Успешно загрузил список", resp.data.success);
          //~ $ctrl.upload = angular.toJson(resp.data.success);
          $ctrl.upload = undefined;
          $ctrl.LoadData().then(function(){$ctrl.ShowTab(0)});
        }
        
      });
    
  };
  $ctrl.Download = function(){
    $ctrl.upload = undefined;
    if($ctrl.download !== undefined) return $ctrl.download = undefined;
    
    $ctrl.error = undefined;

    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('админка/доступ/выгрузить пользователей'), {timeout: $ctrl.cancelerHttp.promise})
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
    //~ $ctrl.ready = false;
    
    $ctrl.LoadData().then(function(){
      //~ $ctrl.ready = true;
      //~ $ctrl.ShowTab(2);
      
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