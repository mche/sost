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
    
  };
  
  
  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for('список пользователей'))
      .then(function(resp){
        $ctrl.data = resp.data;
        $ctrl.autocomplete = [];
        angular.forEach(resp.data, function(val) {
          $ctrl.autocomplete.push({value: val.names.join(' ')+'  ('+val.login+')', data:val});
        });
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
    if($ctrl.param.user) {
      $ctrl.Close($ctrl.param.user);
      //~ $ctrl.param.user._edit = false;
      //~ $ctrl.param.user = undefined;
      
    }
    
    $timeout(function(){
      user._edit = angular.copy(user);
      $ctrl.param.user=user;
      
      
      
    });
    
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $('ul.users li.edit', $($element[0])).offset().top //project-list
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
    
    $http.post(appRoutes.url_for('сохранить пользователя'), user._edit, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          angular.forEach(resp.data.success, function(val, key){
            user[key] = val;
          });
          $ctrl.Close(user);
        }
        
      });
    
    
  };
  
  $ctrl.Disable = function(user){
    user._edit.disable = !user._edit.disable;
    $ctrl.Save(user);
    
  };
  
  $ctrl.Close = function(user, idx){
    if(!user.id) $ctrl.data.splice(idx || 0, 1);
    user._edit = undefined;
    $ctrl.param.user = undefined;
    
    
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
    $ctrl.searchtField = $('input[name="search"]', $($element[0]));
   
    $ctrl.searchtField.autocomplete({
      lookup: $ctrl.autocomplete,
      preserveInput: false,
      appendTo: $ctrl.searchtField.parent(),
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
        $timeout(function(){
          $ctrl.ShowTab(suggestion.data.disable ? 1 : 0);
          $ctrl.Edit(suggestion.data);
        });
        
      },
      onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      onHide: function (container) {}
      
    });
    
  };
  
  
};

/*=====================================================================*/

module

.component('usersList', {
  templateUrl: "users/list",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Controll
})

;

}());