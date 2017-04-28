(function () {'use strict';
/*
  движение ДС
*/

var moduleName = "WaltexMoneyForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'loadTemplateCache', 'CategoryItem', 'WalletItem'])//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {id: 144};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money/form.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
  };
  
  
};

var Component = function($scope, $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    
    $ctrl.LoadData().then(function(){
      $scope.Category = {};
      if ($ctrl.data["категория"]) $scope.Category.selectedItem = {id:$ctrl.data["категория"]};// "finalCategory":{},"selectedIdx":[]
      
      $scope.Wallet = {"проект":1,};
      if ($ctrl.data["кошелек"]) $scope.Wallet.id= $ctrl.data["кошелек"];
      if ($ctrl.data["проект"]) $scope.Wallet["проект"]= $ctrl.data["проект"];
      
      if ($ctrl.data["сумма"] < 0 ) $ctrl.data["расход"] = $ctrl.data["сумма"];
      else $ctrl.data["приход"] = $ctrl.data["сумма"];
      
      $ctrl.InitDate();
      $ctrl.ready = true;
      
    });
    
    //~ $scope.selectedCategory = [];
    //~ $scope.CategoryTree = [{id: 1, title:"Позиция111", childs:[{id: 1, title:"Позиция1-1", childs:[]}, {id: 1, title:"Позиция1-2", childs:[]}, {id: 1, title:"Позиция1-3", childs: []}]},{id: 1, title:"Позиция2", childs:[{id: 1, title:"Позиция2-1", childs:[{id: 1, title:"Позиция2-1-1", childs:[{id: 1, title:"Позиция2-1-1-1", childs:[]}, {id: 1, title:"Позиция1-2", childs:[]}]}]}, {id: 1, title:"Позиция2-2", childs:[]}]}];
    //~ $scope.CategoryTree.push({"newTitle": ''});
    //~ $scope.newCategory = [];
    
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
      
      $ctrl.SetDate();// переформат
      
    });
    
  };
  
  $ctrl.Save = function(){
    
    delete $ctrl.error;
    $ctrl.data["категория"] = $scope.Category;
    $ctrl.data["кошелек"] = $scope.Wallet;
    
    console.log($ctrl.data);
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('сохранить движение ДС'), $ctrl.data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        console.log(resp.data);
        
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