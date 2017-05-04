(function () {'use strict'; try{

var moduleName = "AskForm";
try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }

var module = angular.module(moduleName, ['appRoutes', 'AppTplCache', 'transport.category.list', 'address.select', 'AddressType',  'phone.input', 'User', 'ngSanitize', 'States']); //

var Component = function  ($scope, $attrs, $http, $q, $timeout, $window, appRoutes, User, AskFormData) {//
  var $ctrl = this;
  $scope.category = {"selectedIdx": [], "finalCategory": null, selected: null};//, current: {}
  $scope.User = User; // $('body').attr('data-my-auth-id');
  
  $ctrl.SetSearchResults = function (res) {
    //~ console.log("SetSearchResults: "+res);
    $ctrl.param.searchResults = res;
    if ($ctrl.onSetSearchResultsCallback) $ctrl.onSetSearchResultsCallback (res);
    //~ $ctrl.parentShowSearchResults({res: res === undefined ? 0 : res});
  };
  
  var SetDate = function (context) {$scope.date[0] = $('input[name="date"]').val(); $ctrl.btnSearchActive();};
  var SetTime = function(context) {$scope.date[1] = $('input[name="time"]').val(); $ctrl.btnSearchActive();};
  
  $ctrl.Init = function () {
    
    $timeout(function(){
      $ctrl.param = $ctrl.param || {};
      if ($ctrl.data === undefined ) {
        AskFormData.get($ctrl.param.id || 0, $ctrl.param.selectedCategory || 0, function(resp) {
          $ctrl.data = resp.data;
          //~ console.log("заявка в поиске: "+angular.toJson($ctrl.data));
          $ctrl.InitData(); //~ $ctrl.ready = true; ниже
        });
      } else {$ctrl.InitData();}
    });
  };
  
  $ctrl.InitData = function () {
    if ($ctrl.data._selected_category || $ctrl.data._selectedCategory) {
      $scope.category.selectedIdx = $ctrl.data._selected_category || $ctrl.data._selectedCategory;
      delete $ctrl.data._selected_category;
    }
    
    if ($ctrl.param.selectedCategoryIdx) $scope.category.selectedIdx = $ctrl.param.selectedCategoryIdx;
    
    if ($ctrl.data.address) {
      $scope.address = $ctrl.data.address;
      delete $ctrl.data.address;
    }
  
    if ($ctrl.data.date) {
      $scope.date = $ctrl.data.date.split(' ');
      delete $ctrl.data.date;
    }
    else { $scope.date = [new Date(), new Date()]; }
    
  
    if($ctrl.data.transport) $ctrl.SetSearchResults(0);// $ctrl.searchResults = [];// принятая заявка не ищет
  
    $ctrl.ready = true;
    
    $timeout(function() {

      $('.datepicker').pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        onClose: SetDate,
        min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
      $('.timepicker').pickatime({
        onClose: SetTime
        //~ editable: $ctrl.data.transport ? false : true
      });
      
      SetDate();// переформат
      SetTime();// переформат
      
      $ctrl.btnSearchActive();
      
    });
  };
  
  
  var prevCategoryId;
  $ctrl.isCategorySelect = function () {
    
    //~ var data = $ctrl.data.categoryTreeData,
      //~ curr;
    //~ angular.forEach($scope.category.selectedIdx, function(idx) {
      //~ curr = data[idx];
      //~ data = curr.childs;
    //~ });
    //~ $scope.category.current = curr;
    
    var curr = $scope.category.selected;
    //~ console.log("CategorySelected", $scope.category);
    
    if (!curr) return false;
    if (prevCategoryId == curr.id) {
      $ctrl.addr_type = true;
      return true;
      
    }
    prevCategoryId = curr.id;
    $ctrl.addr_type = false;
    return false;
  };
  
  var last_check4search;
  $ctrl.CollectData = function () {// данные для отправки
    $ctrl.data.address = $scope.address[0].uuid;
    $ctrl.data.category = $scope.category.selected && $scope.category.selected.id;
    $ctrl.data.date = $scope.date[0]+' '+ $scope.date[1];
    var check = [0];
    angular.forEach(['category', 'addr_type', 'address', 'date'], function(key) {
      check.push($ctrl.data[key]);
      if ($ctrl.data[key]) check[0] += 1;
    });
    last_check4search = check.join(':');
    
    if (check[0] == 4) return $ctrl.data;
    return undefined;
  };
  
  //~ $ctrl.addr_type = [];
  $ctrl.btnSearchActive = function () {
    if ($ctrl.cancelerHttp) return false;
    if ($ctrl.data.transport) return false;
    
    var data = $ctrl.CollectData();
    if (!data) {//($ctrl.data.hasOwnProperty('_addr_type_count') && 
      //~ last_check4search = undefined;
      //~ delete $ctrl._check4search;
      return false;
    }
    
    //~ if (!$ctrl.hasOwnProperty('_check4search')) return false;
    
    if ($ctrl._check4search != last_check4search ) {// сброс результатов
      //~ console.log("Сбросил результаты", $ctrl.searchResults);
      //~ $('#notfound-card').addClass('ng-hide');// жесткий костыль, не отслеживался ng-show
      $timeout(function() {//вылечил костыль
        //~ $ctrl.searchResults = undefined;
        $ctrl.SetSearchResults(undefined);
        //~ $ctrl.param.searchResults = un
        $ctrl.param.err = undefined;
      });
      
      $ctrl._check4search = last_check4search;
      //~ console.log("сборка полей: "+last_check4search);
    }
    
    if ( $ctrl.param.searchResults === 0 ) return false; // пустой массив 
    
    //~ var t = $ctrl.addr_type[$ctrl.data.addr_type - 1];
    //~ if (t && !t.cnt) {////нет предложений
    if (! $ctrl._addr_type_count ) {
      //~ $timeout(function() {$ctrl.SetSearchResults(0);});//$ctrl.searchResults = []
      return false;
    }
    
    return true;
  };
  
  $ctrl.AddrTypeCount = function (cnt) {
    //~ if (cnt) $ctrl.SetSearchResults(undefined);
    //~ else $ctrl.SetSearchResults(0);
    $ctrl._addr_type_count = cnt;
    //~ console.log("Вернулось типов: ", cnt);
    
  };
  
  $ctrl.Search = function () {
    var data = $ctrl.CollectData();
    if (!data) return console.log("AskForm.Search нет данных для поиска");
    $ctrl.onSearchCallback(data);
    
  };
  
  $ctrl.ScrollToSave = function () {
    if ( $ctrl.param.searchResults !== 0 && !$ctrl.data.id ) return false;
    
    if ($ctrl.param.scrollToSave) {
      $timeout(function () {
        var card = $('#notfound-card');
        $('html, body').animate({scrollTop: card.offset().top}, 1000);
        card.focus();
        delete $ctrl.param.scrollToSave;
      });
    }
    return true;
  };
  

  
  $ctrl.ToLogin = function () {
    if ($ctrl.toLoginCallback) return $ctrl.toLoginCallback();
    $window.location.href = appRoutes.url_for('profile');
    
  };
  
  var last_check4save;
  $ctrl.btnStoreActive = function() {
    if ( !User.id() ) return false;
    if ($ctrl.param.searchResults !== 0 && !$ctrl.data.id ) return false; // только если пустой список поиска
    var data = $ctrl.CollectData();
    if (!data) return false;
    //~ var check = [];
    //~ angular.forEach(['category', 'addr_type', 'address', 'date', 'tel', 'comment'], function(key) {
      //~ check.push($ctrl.data[key]);
    //~ });
    //~ last_check4save = check.join(':');
    //~ if (!$ctrl.last_check4save) $ctrl.last_check4save = last_check4save;
    //~ if ($ctrl.last_check4save == last_check4save) return false;
    //~ $ctrl.last_check4save = last_check4save;
    
    if(data.tel && data.tel.length == 10) return true;
    return false;
  };
  
  $ctrl.SaveAsk = function() {
    var data = $ctrl.CollectData();
    //~ console.log("Сохранить заявку: "+angular.toJson(data));
    //~ return;
    //~ if (!data) return;
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
          if ($ctrl.onSaveAskCallback) return $ctrl.onSaveAskCallback(resp.data);
          $window.location.href = resp.data.location;
          //~ $ctrl.parentGoUrl({url: resp.data.location});
        }
        
      });
    
  };
  
  $ctrl.ShowTransport = function () {
    //~ $ctrl.askData=ask;// имитация данных формы для разделяемого шаблона controllers/transport/search-item-detail.html
    if (!$ctrl.data.transport) return;
    $ctrl.data['транспорт'] = $ctrl.data['транспорт'] || {id: $ctrl.data.transport, ask: $ctrl.data.id};
    $ctrl.onShowTransportCallback($ctrl.data['транспорт']);
    
  };
  
  $ctrl.SetState = function(states_list){//resp.data['состояния'] новые
    if($ctrl.onSetState) return $ctrl.onSetState(states_list);
    $window.location.href = appRoutes.url_for('мои заявки');
  };
  
};


var serviceData = function($http, appRoutes) {//$q, 
  
  this.get = function(askId, selectedCategory, http_then_cb) {
    return $http.get(appRoutes.url_for("данные формы заявки", askId || 0)+'?c='+(selectedCategory || 0)).then(http_then_cb);
  };
  
};



module

//~ .controller('Controll', Controll)

.component('askForm', {
  templateUrl: "ask/form",
  bindings: {
    data: '<',
    param: '<', //параматеры заявки {id, selectedCategory, searchResults - количество найденных позиций}
    onSetSearchResultsCallback: '<',
    onShowTransportCallback: '<',
    //~ onShowTelCallback: '<',
    toLoginCallback: '<',// мобил передает ссылку на выполнение входа
    onSearchCallback: '<', //мобил и сайт
    onSaveAskCallback: '<', // мобил передает функцию
    onSetState: '<',//мобил

  },
  controller: Component
})

.service('AskFormData', serviceData)

;

} catch(err){console.log("Ошибка компиляции в форме заявки "+err.stack);}
}());