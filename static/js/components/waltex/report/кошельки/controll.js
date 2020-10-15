(function () {'use strict';
/*
  Отчет по кошелькам
*/

//~ try {angular.module('MoneyTable');} catch(e) {  /*angular.injector(['Console']).get('$Console')*/console.log("Заглушка модуля 'MoneyTable' ", angular.module('MoneyTable', []));}// тупая заглушка
  
var moduleName = "Отчет по кошелькам";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'ProjectList', 'Таблица поступлений/расходов по кошелькам']); ///'TreeItem', 'WalletItem', 'ContragentItem', 'Контрагенты', 'Объект или адрес', 'ProfileItem', 'MoneyTable', 'Категории'

const Controll = function($scope, $attrs, $element, $timeout, Util, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};

    TemplateCache.split(appRoutes.url_for('assets', 'деньги/отчет/кошельки.html'), 1)
      .then(function(proms){
        
        ctrl.InitDate();
        ctrl.ready= true;
        
      });// массив
  };
  
  ctrl.SelectProject = function(p){
    //~ console.log("SelectProject");
    $scope.param["проект"] = undefined;
    if(!p) return;
    $timeout(function(){
      $scope.param["проект"] = p;
    });
  };
  
  ctrl.InitDate = function(){
    //~ if ($c.param['дата'] && !$c.data['дата']) $c.data['дата'] = $c.param['дата'];
    if(!$scope.param['дата']) $scope.param['дата'] = Util.dateISO(0);
    
    $timeout(function() {
      
      $('.modal', $($element[0])).modal();

      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        onClose: function(context){
          var s = this.component.item.select;
          var d = [s.year, s.month+1, s.date].join('-');
          //~ if (new Date($scope.param['дата']) == new Date(d)) return;
          $scope.param['дата'] = d;
          $timeout(function(){
            ctrl.Refresh();/// двойной!!
          });
          
        }
        //~ min: $c.data.id ? undefined : new Date()
        //~ editable: $c.data.transport ? false : true
      });//{closeOnSelect: true,}
      
    });
    
  };
  
  ctrl.Refresh = function(){
    var param = $scope.param;
    $scope.param = undefined;
    $timeout(function(){
      $scope.param = param;
    });
    
  };
  
};

module
.controller('Controll', Controll)
;

}());