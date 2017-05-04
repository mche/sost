(function () {'use strict'; try {

var moduleName = "SearchTransport";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }
var module = angular.module(moduleName, ['appRoutes', 'AppTplCache', 'load.templateCache', 'phone.input', 'User', 'AskForm', 'TransportSearchResults', 'TransportItemDetail', 'TransportShowTel', 'States']);//, 'ArrayStorage'  ,

//~ var templateCache = ["/assets/transport/search.html"];

var Controll = function  ($scope, $attrs, $timeout, appRoutes, loadTemplateCache) {// , ArrayStorage
  //~ console.log("Controll searchTransport starting...", $attrs);
  var ctrl = this;
  //~ ctrl.$attrs = $attrs;
  $scope.param = {"id": parseInt($attrs.askId) || 0, "selectedCategory": parseInt($attrs.selectedCategory) || 0, "searchResults": undefined};
  
  loadTemplateCache.split(appRoutes.url_for('assets', 'transport/search.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
};

var Component = function  ($scope, $timeout, $window, SearchTransportLib) {// $sce, States, , AskFormData, ArrayStorage
  var $ctrl = this;
  //~ $ctrl.$attrs = $attrs;
  //~ $scope.User = User; // $('body').attr('data-my-auth-id');
  //~ $scope.States = States;
  var lib = new SearchTransportLib($ctrl, $scope);
  //~ lib.pushCtrlScope($ctrl, $scope);
  
  //~ if ($ctrl.ask === undefined ) {AskFormData.get($ctrl.askId, $ctrl.selectedCategory, function(resp) { $ctrl.ask = resp.data; $ctrl.ready = true;});}
  //~ else {$ctrl.ready = true;}
  
  $ctrl.Init = function() {
    //~ $ctrl.param = {"id": parseInt($ctrl.askId) || 0, "selectedCategory": parseInt($ctrl.selectedCategory) || 0, "searchResults": undefined};
    $ctrl.ready = true;
    $timeout(function() {
      $('#search-results-show').sideNav({menuWidth: $('body').innerWidth()*5/6, edge: 'left', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', '88%');}});
      $('.modal').modal();
    });
  };
  
  /*
  принятая заявка (у нее транспорт) не ищет
  признаком блокировки поиска будет пустой массив $scope.searchResults
  */
  $ctrl.SetSearchResults = function (res) {// callback для <ask-form>
    lib.SetSearchResults(res);
  };
  
  $ctrl.Search = function (ask) {// компонент ask-form передает данные заявки // callback для <ask-form>
    $ctrl.ask = ask;
    lib.Search(ask);
  };
  
  $ctrl.ShowSearchResults = function () {//без аргумента - покажет старый поиск если он есть
    //~ if ( res === 0 ) $scope.searchResults = undefined;
    //~ else if (res !== undefined) {$scope.searchResults = res;}
    if ( !$scope.searchResults || !$scope.searchResults.length ) return;
    $("#search-results-show").sideNav('show');
    $timeout(function() {
      $('htm, body, #right-side-search-results').animate({scrollTop: 0}, 1000);// тут вроде не работает
      $('#right-side-search-results a:visible:first').first().focus().blur();
      
    });
    //~ $timeout(function() {$("#search-results-show").css('width', '88%');}, 500);
  };
  $ctrl.HideSearchResults = function () {
    $("#search-results-show").sideNav('hide');
  };
  
  $ctrl.ClearSearchResults = function () {//callback для <transport-search-results>
    if($scope.searchResults) {
      $ctrl.SetSearchResults(0);//$scope.searchResults.length = 0;
      $ctrl.param.scrollToSave = true;
    }
    $timeout(function() {$("#search-results-show").sideNav('hide');});
    //~ scrollToSave();
  };
  
  //~ $ctrl.ScrollResults = function () {//callback для <transport-search-results>
    //~ $timeout(function() {$('#right-side-search-results a:visible:first').focus().blur(); });
  //~ };
  
  $ctrl.ShowItem = function (item) {// callback для <transport-search-results> ПЛЮС исп для  <ask-form>!!
    lib.ShowItem(item);
    $('#item-detail-modal').modal('open');
    //~ $timeout(function() {$('#item-detail-modal a:visible:first').focus().blur();}); не тут!!
    
  };
  $ctrl.HideItem = function () {
    $('#item-detail-modal').modal('close');
  };
  
  //~ $ctrl.mobile = jQuery.browser && jQuery.browser.mobile;
  $ctrl.ShowTel = function(idx) {//callback для <transport-item-detail>
    if (!$ctrl.ask || $ctrl.ask.transport) return;// не надо больше показов телефонов при стыкованных с транспортом заявок
    var curr = $ctrl.currentItem;
    if (!curr.showTel) curr.showTel = {"id": curr.id, "tel_idx": idx+1};
    $('#show-tel-modal').modal({dismissible: false}).modal('open'); // Modal can be dismissed by clicking outside of the modal
    
  };
  
  /*
  $ctrl.AskData = function(){//callback для <transport-show-tel>
    return $ctrl.ask;
  };*/
  
  $ctrl.ShowTelClose = function(resp_data) {//callback для <transport-show-tel>
    if (!resp_data || !resp_data.location) return $timeout(function() {$('#show-tel-modal').modal('close');});
    $window.location.href = resp_data.location;
    
  };
  
  $ctrl.ShowTransport = function (transport) {// callback для <ask-form>
    $ctrl.ShowItem(transport);
    
  };
  
};

/*
Разделяемая библиотека для сайта и приложения
*/
var Lib = function($http, $q, $timeout, appRoutes ) {
//~ console.log("SearchTransportLib starting...");

//~ var hidden_re = /^_/;
var methods = {
  SetSearchResults: function ($ctrl, $scope, res) {// callback для <ask-form>
    if ( res === 0 ) {
      if ($scope.searchResults) $scope.searchResults.length = 0;
      else $scope.searchResults = [];
      $ctrl.param.searchResults = 0;
    }
    else if(angular.isArray(res)) {
      $ctrl.param.searchResults = res.length;
      $scope.searchResults = res;
    }
    else {//undefined
      $ctrl.param.searchResults = res;
      $scope.searchResults = res;
    }
  },
  _search_http_then_cb: function($ctrl, $scope) {return function(resp){// self lib method return function!
    $ctrl.cancelerHttp = undefined;
    if (resp.data.err) {$ctrl.param.err= resp.data.err; return;}
    
    //~ $scope.searchResults = resp.data;
    
    $ctrl.SetSearchResults(resp.data);// пустые данные не отобразит
    $ctrl.ShowSearchResults();
    if (!resp.data.length) {///~ $ctrl.err = 'Предложений не найдено';
      $ctrl.param.scrollToSave = true;
    }
  };},
  
  Search: function ($ctrl, $scope, ask) {// компонент ask-form передает данные заявки // callback для <ask-form>
    if ($scope.searchResults && $scope.searchResults.length > 0) return $ctrl.ShowSearchResults();//без аргумента - покажет старый поиск если он есть
    if ( $scope.searchResults ) return; //пустой массив
    
    //~ var data = $ctrl.CollectData();
    if (!ask) return;
    
    $ctrl.SetSearchResults(undefined);
    $ctrl.param.err = undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    //$attrs.searchUrl
    
    //~ console.log("Search "+angular.toJson(data));
    
    $http.post(appRoutes.url_for('найти транспорт'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(methods._search_http_then_cb($ctrl, $scope));
    
  },
  
  _item_http_then_cb: function($ctrl, $scope) {return function (resp){// self lib method return function!
    delete $ctrl.cancelerHttp;
    if (resp.data.err) {$ctrl.currentItem.err= resp.data.err; return;}
    for (var name in resp.data) {
      $ctrl.currentItem[name] = resp.data[name];
    }
    $ctrl.currentItem._ready = true;
    $timeout(function() {
      $('#item-detail-modal').animate({scrollTop: 0}, 1000);
      $('#item-detail-modal a:visible:first').focus().blur();
    });
  };},
  ShowItem: function ($ctrl, $scope, item) {// callback для <transport-search-results>
    $ctrl.currentItem = item;
    if (!item._ready) {
      if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
      $ctrl.cancelerHttp = $q.defer();
      if (item.ask) $http.get( appRoutes.url_for('показ транспорта для заявки', [item.id, item.ask]) , {timeout: $ctrl.cancelerHttp.promise}) //$attrs.transportUrl+item.id
        .then(methods._item_http_then_cb($ctrl, $scope));
      else $http.get(appRoutes.url_for('показ транспорта', item.id), {timeout: $ctrl.cancelerHttp.promise}) //$attrs.transportUrl+item.id
        .then(methods._item_http_then_cb($ctrl, $scope));
    }
    //~ $('#item-detail-modal').modal('open');
    //~ $timeout(function() {$('#item-detail-modal a:visible:first').focus().blur();}); //тут!!
    
  }
  

  
};


return function($ctrl, $scope) {//constructor
  //~ console.log("SearchTransportLib new instance...");
  var lib = this;
  //~ var scopeDESTROY = function () {
  //~ };
  //~ $scope.$on('$destroy', scopeDESTROY);
  angular.forEach(methods, function(val, key) {
    //~ if(hidden_re.test(key)) return;
    lib[key] = function () {return val($ctrl, $scope, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);};
    //~ lib[key] = val;
  });
};
};

/*=============================================================*/

module
//~ angular.module('main')

.controller('Controll', Controll)

.factory(moduleName+'Lib', Lib)

.component('transportSearch', {
  templateUrl: "transport/search",
  bindings: {
    param: '<',
    //~ askData: '<',
    //~ askId: '<', // или данные заявки по ид
    //~ selectedCategory: '<' // предустановка выбранной категории
  },
  controller: Component
})


;

} catch(err) {console.log("Ошибка компиляции в поиске транспорта"+err.stack);}
}());