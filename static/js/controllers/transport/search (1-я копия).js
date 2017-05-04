(function () {
'use strict';

var moduleName = "SearchTransport";

//~ var templateCache = ["/assets/transport/search.html"];

var Controll = function  ($scope, $attrs, $http, $timeout, $q, appRoutes, loadTemplateCache) {// , ArrayStorage
  //~ console.log("Controll searchTransport starting...", $attrs);
  var ctrl = this;
  ctrl.$attrs = $attrs;
  
  loadTemplateCache.split(appRoutes.url_for('assets', 'transport/search.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
};


var Component = function  ($scope, $attrs, $http, $timeout, $q, $filter, $window, appRoutes, States, User ) {// $sce, , ArrayStorage
  //~ console.log("Controll searchTransport starting...", $attrs);
  var $ctrl = this;
  $ctrl.$attrs = $attrs;
  $scope.category = {"selectedIdx": [], "finalCategory": null};//, current: {}
  
  $scope.data = {};// данные для отправки
  $scope.User = User; // $('body').attr('data-my-auth-id');
  $scope.States = States;
  $scope.appRoutes = appRoutes;
  //~ $scope.category = {};
  
  var async = [];
  async.push($http.get(appRoutes.url_for("данные формы заявки", $attrs.askId || 0)+'?c='+($attrs.selectedCategory || 0)).then(function (resp) {//$attrs.formDataUrl
    
    if (resp.data._selected_category) 
      $scope.category.selectedIdx = resp.data._selected_category;
    delete resp.data._selected_category;
    
    //~ if (resp.data.category) 
      //~ $scope.category.current.id = resp.data.category;
    //~ delete resp.data.category;
    
    if (resp.data.address)
      $scope.address = resp.data.address;
    delete resp.data.address;
    
    if (resp.data.date) { $scope.date = resp.data.date.split(' '); }
    else { $scope.date = [new Date(), new Date()]; }
    delete resp.data.date;
    
    if(resp.data.transport) $scope.searchResults = [];// принятая заявка не ищет
    
    $scope.data = resp.data;
  }));
  
  var SetDate = function (context) {$scope.date[0] = $('input[name="date"]').val(); $ctrl.btnSearchActive();};
  var SetTime = function(context) {$scope.date[1] = $('input[name="time"]').val(); $ctrl.btnSearchActive();};
  
  $q.all(async).then(function (proms) {
    $http.get($scope.data.transport ? appRoutes.url_for('категории транспорта') : appRoutes.url_for('данные категорий транспорта'))
    .then(function (resp) {//$attrs.categoryTreeDataUrl
      $scope.categoryTreeData = resp.data;
      
      $ctrl.ready = true;
      
      $timeout(function() {
        $('#search-results-show').sideNav({menuWidth: $('body').innerWidth()*5/6, edge: 'left', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', '88%');}});
        $('.modal').modal();
        $('.datepicker').pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          onClose: SetDate,
          min: $scope.data.id ? undefined : new Date()
        });//{closeOnSelect: true,}
        $('.timepicker').pickatime({
          onClose: SetTime
        });
        
        SetDate();// переформат
        SetTime();// переформат
        
      });
      
    });
    
  });
  
  
  var scrollToSave = function () {
    $timeout(function () {
      $('html, body').animate({scrollTop: $('#notfound-card').offset().top}, 1000);
    });
  };
  
  //~ var addr_type_http_then_cb = function(resp) {
    //~ $ctrl.cancelerHttp = undefined;
    //~ $ctrl.addr_type = resp.data;
  //~ };
  
  var search_http_then_cb = function(resp) {
    $ctrl.cancelerHttp = undefined;
    if (resp.data.err) {$ctrl.err= resp.data.err; return;}
    $scope.searchResults = resp.data;
      
    if (resp.data.length > 0) {//
      $ctrl.showSearchResults();
    }  else {
      //~ $ctrl.err = 'Предложений не найдено';
      scrollToSave();
    }
    
  };
  
  var item_http_then_cb = function(resp) {
    $ctrl.cancelerHttp = undefined;
    if (resp.data.err) {$ctrl.err= resp.data.err; return;}
    for (var name in resp.data) {
      $ctrl.currentItem[name] = resp.data[name];
    }
    $ctrl.currentItem._ready = true;
  };
  
  $ctrl.prevCategoryId = null;
  $ctrl.isCategorySelect = function () {
    
    var data = $scope.categoryTreeData,
      curr;
    angular.forEach($scope.category.selectedIdx, function(idx) {
      curr = data[idx];
      data = curr.childs;
    });
    $scope.category.current = curr;
    if (!curr) return false;
    if ($ctrl.prevCategoryId == curr.id) {
      $ctrl.addr_type = true;
      return true;
      
    }
    $ctrl.prevCategoryId = curr.id;
    
    //~ var query = {c: curr.id};
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    //~ var config = {params: $scope.data.transport ? null :query, timeout: $ctrl.cancelerHttp.promise};
    //~ $http.get(appRoutes.url_for('количество адресных типов'), config) //$attrs.addressTypeUrl,
      //~ .then(addr_type_http_then_cb);
    $ctrl.addr_type = false;
    return false;
  };
  
  var last_check4search;
  $ctrl.CollectData = function () {// данные для отправки
    $scope.data.address = $scope.address[0].uuid;
    $scope.data.category = $scope.category.current && $scope.category.current.id;
    $scope.data.date = $scope.date[0]+' '+ $scope.date[1];
    var check = [0];
    angular.forEach(['category', 'addr_type', 'address', 'date'], function(key) {
      check.push($scope.data[key]);
      if ($scope.data[key]) check[0] += 1;
    });
    last_check4search = check.join(':');
    
    if (check[0] == 4) return $scope.data;
    return undefined;
  };
  
  //~ $ctrl.addr_type = [];
  $ctrl.btnSearchActive = function () {
    if ($ctrl.cancelerHttp) return false;
    if ($scope.data.transport) return false;
    
    var data = $ctrl.CollectData();
    
    if ( $ctrl._check4search != last_check4search ) {// сброс результатов
      //~ console.log("Сбросил результаты", $scope.searchResults);
      //~ $('#notfound-card').addClass('ng-hide');// жесткий костыль, не отслеживался ng-show
      $timeout(function() {//вылечил костыль
        $scope.searchResults = undefined;
        $ctrl.err = undefined;
      });
      
      $ctrl._check4search = last_check4search;
      
    }
    
    if ($scope.searchResults && $scope.searchResults.length ==0) return false;
    
    //~ var t = $ctrl.addr_type[$scope.data.addr_type - 1];
    //~ if (t && !t.cnt) {////нет предложений
    if (! $scope.data._addr_type_count ) {
      $timeout(function() {$scope.searchResults = []});
      return false;
    }
    
    return data;
  };
  
  $ctrl.Search = function () {
    if ($scope.searchResults && $scope.searchResults.length > 0) return $ctrl.showSearchResults();
    if ( $scope.searchResults ) return; //пустой массив
    
    var data = $ctrl.CollectData();
    if (!data) return;
    
    $scope.searchResults = undefined;
    $ctrl.err = undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    //$attrs.searchUrl
    $http.post(appRoutes.url_for('найти транспорт'), data, {timeout: $ctrl.cancelerHttp.promise})
      .then(search_http_then_cb);
    
  };
  
  $ctrl.showSearchResults = function () {
    $("#search-results-show").sideNav('show');
    $timeout(function() {$('#right-side-search-results a').first().focus().blur(); });
    //~ $timeout(function() {$("#search-results-show").css('width', '88%');}, 500);
  };
  $ctrl.hideSearchResults = function () {
    $("#search-results-show").sideNav('hide');
  };
  
  $ctrl.clearSearchResults = function () {
    $scope.searchResults = [];
    $("#search-results-show").sideNav('hide');
    scrollToSave();
  };
  
  $ctrl.showItem = function (item) {
    $ctrl.currentItem = item;
    if (!item._ready) {
      if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
      $ctrl.cancelerHttp = $q.defer();
      if (item.ask) $http.get( appRoutes.url_for('показ транспорта для заявки', [item.id, item.ask]) , item, {timeout: $ctrl.cancelerHttp.promise}) //$attrs.transportUrl+item.id
        .then(item_http_then_cb);
      else $http.get(appRoutes.url_for('показ транспорта', item.id), {timeout: $ctrl.cancelerHttp.promise}) //$attrs.transportUrl+item.id
        .then(item_http_then_cb);
    }
    $('#item-detail-modal').modal('open');
    $timeout(function() {$('#item-detail-modal a').first().focus().blur();});
    
  };
  $ctrl.hideItem = function () {
    $('#item-detail-modal').modal('close');
  };
  //~ $ctrl.showItemFromState = function (state) {//показать транспорт из состояния заявки
    //~ state["показ транспорта"] = state["показ транспорта"] || {"id": state['транспорт'] || state.transport, "ask": $scope.data.id};
    //~ $ctrl.showItem(state["показ транспорта"]);
  //~ };
  
  $ctrl.mobile = jQuery.browser && jQuery.browser.mobile;
  $ctrl.ShowTel = function(idx) {
    //~ if(!$attrs.showTelUrl) return;
    if ($scope.data.transport) return;// не надо больше показов телефонов при стыкованных с транспортом заявок
    
    var curr = $ctrl.currentItem;
    
    if (!curr.showTel) curr.showTel = {};

    if (curr.showTel._cancelerHttp) curr.showTel._cancelerHttp.resolve();
    curr.showTel._cancelerHttp = $q.defer();
    
    var data = {"object":curr.id, "tel_idx": idx+1};
    //~ $attrs.showTelUrl
    $http.post(appRoutes.url_for('телефон транспорта'), data, {headers: {"X-AngularJS": angular.version.full}, timeout: curr.showTel._cancelerHttp.promise})
      .then(function(resp) {
        curr.showTel._cancelerHttp = undefined;
        curr.showTel = resp.data;
        curr.showTel.ready = true;
        $timeout(function(){$('#show-tel-modal a').focus();});
        
        //~ if ($ctrl.mobile && $ctrl.showTel.tel) $window.location.href = "tel:+7"+$ctrl.showTel.tel;
        
        //~ $timeout(function(){
          //~ var link = $('#show-tel-modal a.tel');
          //~ link.trigger("click");
          //~ console.log(link);
          //~ angular.element(link).triggerHandler('click');
        //~ });
        
      });
    
    $('#show-tel-modal').modal({dismissible: false}).modal('open'); // Modal can be dismissed by clicking outside of the modal
    
  };
  
  $ctrl.showTelResults = States.data.filter(function(item, idx){ return !!item["ид кнопки"] });
  $ctrl.telResultsSort = function(item) {
    return item["ид кнопки"];
  };//ng-repeat
  $ctrl.ShowTelResult = function(result) {
    var curr = $ctrl.currentItem;
    curr.showTel.result = result.id;
    delete curr.showTel.ready;
    
    if (curr.showTel._cancelerHttp) curr.showTel._cancelerHttp.resolve();
    curr.showTel._cancelerHttp = $q.defer();
    
    //~ var data = $ctrl.CollectData();idx == 0
    if ( curr.showTel.result == 60 ) curr.showTel.ask = $ctrl.CollectData();// принятая заявка должна сохраниться
    //, {headers: {"X-AngularJS": angular.version.full}
    $http.post(appRoutes.url_for('телефон транспорта'), curr.showTel, {timeout: curr.showTel._cancelerHttp.promise})//$attrs.showTelUrl
      .then(function(resp) {
        delete curr.showTel._cancelerHttp;
        if(resp.data.location) {
          $window.location.href = resp.data.location;
        } else {curr.showTel.ready = true;}
        $('#show-tel-modal').modal('close');
      });
    
    
  };
  
  $ctrl.ShowTelClose = function() {
    $('#show-tel-modal').modal('close');
  };
  
  $ctrl.ShowTransport = function () {
    //~ $scope.data=ask;// имитация данных формы для разделяемого шаблона controllers/transport/search-item-detail.html
    if (!$scope.data.transport) return;
    $scope.data['транспорт'] = $scope.data['транспорт'] || {id: $scope.data.transport, ask: $scope.data.id};
    $ctrl.showItem($scope.data['транспорт']);
    
  };
  
  $ctrl.btnStoreActive = function() {
    if (!$scope.searchResults || $scope.searchResults.length > 0) return false;
    var data = $ctrl.CollectData();
    if(data && data.tel && data.tel.length == 10) return true;
    return false;
  };
  
  $ctrl.SaveAsk = function() {
    var data = $ctrl.CollectData();
    //~ if (!data) return;
    //~ if (data.transport) angular.forEach(['addr_type', 'category', 'address'], function(del) {console.log(delete data[del])});
    //~ return console.log("save: ",data);
    
    $scope.saveAskErr=undefined;
    
    if ($ctrl.cancelerHttpSaveAsk) $ctrl.cancelerHttpSaveAsk.resolve();
    $ctrl.cancelerHttpSaveAsk = $q.defer();
    $http.post(appRoutes.url_for('сохранить заявку'), data, {timeout: $ctrl.cancelerHttpSaveAsk.promise})//$attrs.saveAskUrl
      .then(function(resp) {
        console.log(resp.data);
        $ctrl.cancelerHttpSaveAsk = undefined;
        if (resp.data.err) {$scope.saveAskErr= resp.data.err; return;}
        if(resp.data.location) {
          delete $ctrl.ready;
          $window.location.href = resp.data.location;
        }
        
      });
    
  };
  
  //~ $ctrl.stateClass = function (state, key) {
    //~ return States.get(state['код состояния'], key);//, 111
  //~ };
  //~ var reIcon = new RegExp('^icon-');
  //~ $ctrl.IconClass = function(icon) {// ng-repeat=" result in $ctrl.showTelResults 
    //~ return reIcon.test(icon);
  //~ };
  
  //~ $ctrl.btnState = function (state) {//boolean
    //~ var states = $scope.data['состояния'];
    //~ if (!state) return states;
    //~ return state == states[states.length - 1]["код состояния"]; 
  //~ };
  
  //~ $ctrl.btnStateSave = function (state) {
    
  //~ };
  
};

/*=============================================================*/

angular.module(moduleName, ['appRoutes', 'AppTplCache', 'transport.category.list', 'load.templateCache', 'address.select', 'AddressType', 'phone.input', 'ngSanitize', 'States', 'User', 'tel-show-list', 'TransportItemDetail'])//, 'ArrayStorage'
//~ angular.module('main')

.controller('Controll', Controll)

.component('transportSearch', {
  templateUrl: "transport/search",
  controller: Component
})


;

}());