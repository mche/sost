(function () {'use strict';
/*
  Маршруты
*/
var moduleName = "Routes";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',

var Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function() {
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
      //~ $timeout(function() {
        //~ $('.tabs', $($element[0])).tabs();
        //~ $ctrl.tabsReady = true;
      //~ });
      
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
    
  };

  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for('доступ/список маршрутов'))
      .then(function(resp){
        $ctrl.data = resp.data;
      });
    
  };
  
  $ctrl.FilterTab = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    return true;
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
      autocomplete.push({value: ['request', 'to', 'name'].map(function(f){return val[f];}).join(' '), data:val});
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
        searchtField.val('');
        $timeout(function(){
          //~ $ctrl.ShowTab(suggestion.data.disable ? 1 : 0);
          //~ $ctrl.ToggleSelect(suggestion.data, true);
        });
        
      },
      onSearchComplete: function(query, suggestions){if(suggestions.length) return;},
      onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.New = function(flag){
    if(flag) return !$ctrl.data[0] || $ctrl.data[0].id;
    var n = {"request": '', "to": '', "name": '', "descr":'', "auth":'', "host_re": ''};
    $ctrl.data.unshift(n);
    $timeout(function(){
      $ctrl.Edit(n);
      //~ $ctrl.ShowTab(0);
    });
    
  };
  
  $ctrl.Edit = function(route){
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
    
    
  };
  
  $ctrl.CheckRoute = function(route){
    
    
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