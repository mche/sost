(function () {'use strict';
/*
  движение ДС
*/

var moduleName = "WaltexMoneyForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'loadTemplateCache', 'CategoryItem', 'WalletItem'])//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};
    loadTemplateCache.split(appRoutes.url_for('assets', 'waltex/money/form.html'), 1)
    .then(function(proms){ ctrl.ready= true; });// массив
  };
  
  
};

var Component = function($scope, $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $scope.param = {};
    $ctrl.data= {};
    //~ $scope.selectedCategory = [];
    $scope.CategoryTree = [{id: 1, title:"Позиция111", childs:[{id: 1, title:"Позиция1-1", childs:[]}, {id: 1, title:"Позиция1-2", childs:[]}, {id: 1, title:"Позиция1-3", childs: []}]},{id: 1, title:"Позиция2", childs:[{id: 1, title:"Позиция2-1", childs:[{id: 1, title:"Позиция2-1-1", childs:[{id: 1, title:"Позиция2-1-1-1", childs:[]}, {id: 1, title:"Позиция1-2", childs:[]}]}]}, {id: 1, title:"Позиция2-2", childs:[]}]}];
    //~ $scope.CategoryTree.push({"newTitle": ''});
    //~ $scope.newCategory = [];
    $scope.Category = {"selectedIdx000":[0,1], "selectedItem":{id:100,}};// "finalCategory":{},"selectedIdx":[]
    $scope.Wallet = {"проект":1,id:128,};
    $ctrl.InitDate();
    $ctrl.ready = true;
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
    var data = {"категория":$scope.Category, "кошелек":$scope.Wallet};
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('сохранить движение ДС'), data, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        console.log(resp.data);
        
      });
    
  };
  
  //~ $ctrl.onFinalCategory = function(a) {
    //~ console.log(a);
    
  //~ };
  
  //~ $scope.$watch('Category.selectedItem', function(newValue, oldValue) {
    //~ console.log(newValue);
    
  //~ });
  
  //~ $ctrl.Path = function(path){
    //~ $scope.selectedCategory = path;
    //~ console.log(path);
    
  //~ };
  
  
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