(function () {'use strict';
/*
  движение ДС
*/

try {angular.module('MoneyTable');}
catch(e) {  angular.module('MoneyTable', []);}// тупая заглушка
  
var moduleName = "WaltexMoney";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'loadTemplateCache',  'appRoutes', 'ProjectList', 'CategoryItem', 'WalletItem', 'ContragentItem', 'ProfileItem', 'MoneyTable']);//'MoneyWork' 

var Controll = function($scope, $attrs, $element, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {"создавать проект":true};
    $scope.moves = [
      {"id":1, "title": 'Внешние платежи', "icon": 'all_out'},
      {"id":2, "title": 'Внутренние перемещения', "icon": 'swap_horiz'},
      {"id":3, "title": 'Расчеты по сотрудникам', "icon": 'group'}
    ];
    //~ ctrl.param = $scope.param;
    if($attrs.projectId) $scope.param["проект"] ={"id": parseInt($attrs.projectId)};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
  };
  
  ctrl.SelectProject = function(p){
    //~ console.log("SelectProject");
    $scope.param["проект"] = undefined;
    if(!p) return;
    $timeout(function(){
      $scope.param["проект"] = p;
    });
  };
  
  ctrl.SelectMove = function(m){
    $scope.param.move  = undefined;
    $scope.param.id = undefined;
    $timeout(function(){$scope.param.move  = m;});
  };
  
  ctrl.ReadyIf = function(){
    return ctrl.ready && $scope.param['проект'] && $scope.param['проект'].id !== 0 && $scope.param.move;
    
  };
  
  
};

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(data){// data  - при редактировании
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param = $ctrl.param;
    if(data) $ctrl.data = data;
    
    delete $scope.Contragent;
    delete $scope.Category;
    delete $scope.Wallet;
    delete $scope.Wallet2;
    delete $scope.Profile;
    delete $ctrl.ready;
    
    
    //~ $ctrl.project =  $ctrl.param["проект/id"];
    $timeout(function(){
    if(!$ctrl.data && $ctrl.param.id) $ctrl.LoadData().then(function(){
      $ctrl.InitData();
      //~ $ctrl.ready = true;
      
    });
    else 
      $ctrl.InitData();
      //~ $ctrl.ready = true;
    });
    
  };
  
  
  $ctrl.LoadData = function(){//param
    //~ param = param || {};
    //~ if (param['кошелек2'] === undefined) param['кошелек2'] = $ctrl.param['кошелек2'];
    //~ if (param['кошелек2'] === undefined) param['кошелек2'] = $ctrl.param.move && $ctrl.param.move.id == 2;
    
    //~ console.log("строка движения ДС", param);
    return $http.post(appRoutes.url_for('строка движения ДС', $ctrl.param.id || 0), $ctrl.param)//, {"params": param}
      .then(function(resp){
        $ctrl.data= resp.data;
        
      }
      //~ function(resp) {
        //~ $ctrl.data= undefined;
      //~ }
      );
    
  };
  
  $ctrl.InitData = function(){
    if (!$ctrl.data) $ctrl.data= {};
    //~ console.log("WaltexMoney InitData", $ctrl.data);
    var Category = {};
    if ($ctrl.data["категория/id"]) Category.selectedItem = {"id": $ctrl.data["категория/id"]};// "finalCategory":{},"selectedIdx":[]
    $scope.Category = Category;
    
    var Wallet = {};
    if ($ctrl.data["кошелек/id"]) Wallet.id= $ctrl.data["кошелек/id"];
    
    if ($ctrl.param["проект"]) Wallet["проект"]= $ctrl.param["проект"].id;
    if ($ctrl.data["проект/id"]) Wallet["проект"]= $ctrl.data["проект/id"];
    $scope.Wallet = Wallet;
    
    if ($ctrl.param['контрагент'] || $ctrl.data["контрагент/id"] || ($ctrl.param.move && $ctrl.param.move.id == 1)) {
      var Contragent = {};
      if ($ctrl.data["контрагент/id"]) Contragent.id= $ctrl.data["контрагент/id"];
      $scope.Contragent = Contragent;
    }
    
    if ($ctrl.param['кошелек2'] || $ctrl.data["кошелек2/id"] || ($ctrl.param.move && $ctrl.param.move.id == 2)) {// кошельки всех проектов
      var Wallet2 = {};
      if ($ctrl.data["кошелек2/id"]) Wallet2.id= $ctrl.data["кошелек2/id"];
      $scope.Wallet2 = Wallet2;
    }
    
    if ($ctrl.param['профиль'] || $ctrl.data["профиль/id"] || ($ctrl.param.move && $ctrl.param.move.id == 3)) {// сотрудники
      var Profile = {};
      if ($ctrl.data["профиль/id"]) Profile.id= $ctrl.data["профиль/id"];
      $scope.Profile = Profile;
      
      $timeout(function(){// костыль доступа в начислении табеля ЗП
        var l = $('profile-item').eq(0).contents().length;
        if(l < 4) $ctrl.ready = 'нет доступа'; /// не показывать форму
        
      });
    }
    
    $ctrl.parseSum();
    
    $ctrl.ready = true;
    $ctrl.InitDate();
    
    //~ $timeout(function(){});
    
  };

  
  $ctrl.SetDate = function (context) {// переформат
    var d = $('input[name="date"]', $($element[0]));
    $ctrl.data['дата'] = d.val();
    //~ d.attr('title', d.val());
  };
  
  $ctrl.InitDate = function(){
    if(!$ctrl.data['дата']) {
      var d = new Date();
      $ctrl.data['дата'] = (new Date(d.setDate(d.getDate()-1))).toISOString().replace(/T.+/, '');// вчера
      
    }
    
    $timeout(function() {
      
      $('.modal', $($element[0])).modal();

      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        onSet: $ctrl.SetDate,
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
      
      //~ if(!$ctrl.data['дата']) $ctrl.SetDate();// переформат
      
    });
    
  };
  
  $ctrl.SaveBtn = function(){
    
    delete $ctrl.error;
    $ctrl.data["категория"] = $scope.Category;
    $ctrl.data["кошелек"] = $scope.Wallet;
    if ($scope.Wallet2) $ctrl.data["кошелек2"] = $scope.Wallet2;
    if ($scope.Contragent) $ctrl.data["контрагент"] = $scope.Contragent;
    if ($scope.Profile) $ctrl.data["профиль"] = $scope.Profile;// сотрудник
    if(!$ctrl.data["проект/id"]) $ctrl.data["проект/id"] = $ctrl.param["проект"].id || $ctrl.param["проект"];
    $ctrl.data.move = $ctrl.param.move;
    
    //~ console.log($ctrl.data);
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('сохранить движение ДС'), $ctrl.data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          if ($ctrl.data.id) {
            $ctrl.parseSum(resp.data.success);
            angular.forEach(resp.data.success, function(val, key){$ctrl.param.edit[key]=val;});
            delete $ctrl.param.newX;
          } else {// новая запись
            //~ $timeout(function(){
            delete $ctrl.param.edit;
            resp.data.success._append = true;
            $ctrl.param.newX = resp.data.success;
            //~ });
            
            
          }
          $ctrl.CancelBtn();
        }
        console.log("Редактирование сохранено: ", resp.data);
        
      });
    
  };
  
  $ctrl.Edit = function(){
    //~ console.log("Edit", $ctrl.param);
    var data = $ctrl.param.edit;
    delete $ctrl.param.edit._init;
    $ctrl.$onInit(data);
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $($element[0]).offset().top //project-list
      }, 1500);
    });
  };
  
  $ctrl.parseSum = function(it) {//
    it = it || $ctrl.data;
    if(!it['сумма']) return '';
    delete it["приход"];
    delete it["расход"];
    var sum = parseFloat(it['сумма']);
    
    if(sum > 0) it["приход"] = it['сумма'];
    else it["расход"] = it['сумма'].replace(/-/g, "");
  };
  
  $ctrl.CancelBtn = function(){
    $ctrl.data = undefined;
    delete $ctrl.param.id;
    var data = $ctrl.param.edit || $ctrl.param.newX || $ctrl.param.delete;
    //~ delete $ctrl.param.edit._init;// уже!
    if (!data._newInit && !data._delete) {
      data['обновить'] = true;//передернуть строку
      
      $timeout(function(){
        delete data['обновить'];// передернуть строку
        $ctrl.param.edit = data;

      });
      
      $timeout(function(){
        $('html, body').animate({
            scrollTop: $("#money"+data.id).offset().top
        }, 1500);
        
      });
    }
    
    $ctrl.$onInit();
    
  };
  
  $ctrl.DeleteBtn =function(){
    //~ console.log("DeleteBtn");
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('удалить запись движения ДС', $ctrl.data.id), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.success) {
          //~ $ctrl.data['удалить']=true;
          $ctrl.param.delete = $ctrl.param.edit;
          $ctrl.param.delete._delete = true;
          delete $ctrl.param.edit;
          //~ $ctrl.$onInit();
          $ctrl.CancelBtn();
        }
        console.log("Удалено: ", resp.data);
        
      });
  };
  
  $ctrl.ClearSum = function(){
    delete $ctrl.data['приход'];
    delete $ctrl.data['расход'];
    
  };
  
  /*
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit && newVal.edit._init)  return $ctrl.Edit();
  });*/
  
};

module

.controller('Controll', Controll)

.component('moneyForm', {
  templateUrl: "money/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());