(function () {'use strict';
/*
  движение ДС
*/

var moduleName = "WaltexMoney";

var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache',  'appRoutes', 'MoneyWork' ]);//'ngSanitize',

var Controll = function($scope, $attrs, $element, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};
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
  
  ctrl.WorkIf = function(){
    return ctrl.ready && $scope.param['проект'] && $scope.param['проект'].id !== 0;
    
  };
    
    
  
  
};

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(data){// data  - при редактировании
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param = $ctrl.param;
    if(data) $ctrl.data = data;
    
    delete $scope.Category;
    delete $scope.Wallet;
    delete $ctrl.ready;
    
    
    //~ $ctrl.project =  $ctrl.param["проект/id"];
    
    if(!$ctrl.data && $ctrl.param.id) $ctrl.LoadData().then(function(){
      $ctrl.InitData();
      $ctrl.ready = true;
      
    });
    else $timeout(function(){
      $ctrl.InitData();
      $ctrl.ready = true;
    });
    
  };
  
  $ctrl.InitData = function(){
    if (!$ctrl.data) $ctrl.data= {};
    var Category = {};
    if ($ctrl.data["категория/id"]) Category.selectedItem = {"id": $ctrl.data["категория/id"]};// "finalCategory":{},"selectedIdx":[]
    $scope.Category = Category;
    
    var Wallet = {};
    if ($ctrl.data["кошелек/id"]) Wallet.id= $ctrl.data["кошелек/id"];
    
    if ($ctrl.param["проект"]) Wallet["проект"]= $ctrl.param["проект"].id;
    if ($ctrl.data["проект/id"]) Wallet["проект"]= $ctrl.data["проект/id"];
    $scope.Wallet = Wallet;
    
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

      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
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
          scrollTop: $("project-list").offset().top
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
  
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit && newVal.edit._init)  return $ctrl.Edit();
  });
  
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