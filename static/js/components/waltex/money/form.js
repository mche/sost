(function () {'use strict';
/*
  движение ДС
*/

var moduleName = "WaltexMoney";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'loadTemplateCache', 'CategoryItem', 'WalletItem', 'MoneyTable', 'ProjectList'])//'ngSanitize',

var Controll = function($scope, $element, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};
    $scope.Projects = [{id:1, title:'Проект №1'}];
    $('ul.tabs', $($element[0])).tabs();
    //~ $scope.paramTable = {};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money/form.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
  };
  
  ctrl.SelectProject = function(p){
    $scope.param["проект/id"] = undefined;
    $timeout(function(){$scope.param["проект/id"] = p.id;});
    
    
  };
  
};

var Component = function($scope, $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(data){// data  - при редактировании
    if(!$ctrl.param) $ctrl.param = {};
    if(data) $ctrl.data = data;
    
    delete $scope.Category;
    delete $scope.Wallet;
    delete $ctrl.ready;
    
    if(!$ctrl.data) $ctrl.LoadData().then(function(){
      $ctrl.InitData();
      $ctrl.ready = true;
      
    });
    else $timeout(function(){
      $ctrl.InitData();
      $ctrl.ready = true;
    });
    
  };
  
  $ctrl.InitData = function(){
    $scope.Category = {};
    if ($ctrl.data["категория/id"]) $scope.Category.selectedItem = {"id":$ctrl.data["категория/id"]};// "finalCategory":{},"selectedIdx":[]
    
    $scope.Wallet = {};
    if ($ctrl.data["кошелек/id"]) $scope.Wallet.id= $ctrl.data["кошелек/id"];
    
    if ($ctrl.param["проект/id"]) $scope.Wallet["проект"]= $ctrl.param["проект/id"];
    if ($ctrl.data["проект/id"]) $scope.Wallet["проект"]= $ctrl.data["проект/id"];
    
    $ctrl.parseSum();
    
    $ctrl.InitDate();
    
    $timeout(function(){$('.modal', $($element[0])).modal();});
    
  };
  
  $ctrl.LoadData = function(){
    return $http.get(appRoutes.url_for('строка движения ДС', $ctrl.param.id || 0)).then(function(resp){
      $ctrl.data= resp.data;
      
    });
    
  };
  
  $ctrl.SetDate = function (context) {// переформат
    var d = $('input[name="date"]', $($element[0]));
    $ctrl.data['дата'] = d.val();
    d.attr('title', d.val());
  };
  
  $ctrl.InitDate = function(){
    if(!$ctrl.data['дата']) $ctrl.data['дата'] = new Date();
    $timeout(function() {

      $('.datepicker').pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        onClose: $ctrl.SetDate,
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
      
      if(!$ctrl.data['дата']) $ctrl.SetDate();// переформат
      
    });
    
  };
  
  $ctrl.SaveBtn = function(){
    
    delete $ctrl.error;
    $ctrl.data["категория"] = $scope.Category;
    $ctrl.data["кошелек"] = $scope.Wallet;
    
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
            delete $ctrl.param.new;
          } else {// новая запись
            delete $ctrl.param.edit;
            $ctrl.param.new = resp.data.success;
            $ctrl.param.new._newInit = true;
            
            
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
    $('html, body').animate({
        scrollTop: $(".card", $($element[0])).offset().top
    }, 1500);
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
    var data = $ctrl.param.edit || $ctrl.param.new || $ctrl.param.delete;
    //~ delete $ctrl.param.edit._init;// уже!
    delete data._sum;// раньше!
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
  
  
};

module

.controller('Controll', Controll)

.component('waltexMoneyForm', {
  templateUrl: "waltex/money/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());