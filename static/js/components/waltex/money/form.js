(function () {'use strict';
/*
  движение ДС
*/

var moduleName = "WaltexMoneyForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'loadTemplateCache', 'CategoryItem', 'WalletItem', 'MoneyTable'])//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {"проект/id": 1};
    //~ $scope.paramTable = {};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money/form.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
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
    
    if ($ctrl.parseSum($ctrl.data)) $ctrl.data["приход"] = $ctrl.data["сумма"];
    else $ctrl.data["расход"] = $ctrl.parseSum($ctrl.data, true);
    
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
            angular.forEach(resp.data.success, function(val, key){$ctrl.param.edit[key]=val;});
            delete $ctrl.param.new;
          } else {// новая запись
            delete $ctrl.param.edit;
            $ctrl.param.new = resp.data.success;
            $ctrl.param.new._new = true;
            
            
          }
          $ctrl.CancelBtn();
        }
        console.log("Редактирование сохранено: ", resp.data);
        
      });
    
  };
  
  $ctrl.Edit = function(){
    console.log("Edit", $ctrl.param);
    var data = $ctrl.param.edit;
    delete $ctrl.param.edit._init;
    $ctrl.$onInit(data);
  };
  
  $ctrl.parseSum = function(it, flagReplace) {// flagMinus для возврата расхода // flagReplace=true для удаления минуса из строки
    if(!it['сумма']) return '';
    if(!it._sum) it._sum = parseFloat(it['сумма']);
    
    if(!flagReplace) return it._sum > 0;
    
    return it['сумма'].replace(/-/g, "");
  };
  
  $ctrl.CancelBtn = function(){
    $ctrl.data = undefined;
    delete $ctrl.param.id;
    var data = $ctrl.param.edit || $ctrl.param.new;
    //~ delete $ctrl.param.edit._init;// уже!
    delete data._sum;// раньше!
    if (data._new) {
      $ctrl.$onInit();
      return;
    }
      
    data['обновить'] = true;//передернуть строку
    
    $timeout(function(){
      //~ if (!data._new) {
      delete data['обновить'];// передернуть строку
      $ctrl.param.edit = data;
      
      $('html, body').animate({
          scrollTop: $("#money"+data.id).offset().top
      }, 1500);
      //~ }
    });
    
    //~ $timeout(function(){
      
      
    //~ });
    
    $ctrl.$onInit();
    
  };
  
  $ctrl.DeleteBtn =function(){
    console.log("DeleteBtn");
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('удалить запись движения ДС', $ctrl.data.id), {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.success) {
          $ctrl.data['удалить']=true;
          delete $ctrl.param.edit;
          $ctrl.$onInit();
        }
        console.log("Удалено: ", resp.data);
        
      });
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