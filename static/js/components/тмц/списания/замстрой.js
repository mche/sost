(function () {'use strict';
/*
  Модуль ТМЦ для для принятия/отклонения списаний
*/

var moduleName = "ТМЦ замстрой";
try {angular.module(moduleName); return;} catch(e) { }

var module = angular.module(moduleName, ['Util', 'appRoutes', 'TemplateCache',/*без этого не шло*/ 'Объекты', 'Номенклатура', 'ТМЦ замстрой табы'/*'Контрагенты'*/]);//'ngSanitize',, 'dndLists'

const Ctrl = function($scope, $timeout, TemplateCache, appRoutes, $Номенклатура) {///$Контрагенты
  var ctrl = this;
  
  ctrl.$onInit = function(){
    
    $scope.param = {"where":{}};
    $scope.paramObj = {/*"фильтр объектов": ctrl.ParamFilterObj, */"placeholder": 'Указать объект', /*"без проекта": true,*/ };
    TemplateCache.split(appRoutes.url_for('assets', 'тмц/замстрой.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        $Номенклатура/*.Refresh(0)*/.Load(0);
        //~ $Контрагенты.Load();
      });
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
    });
    
  };

};
/******************************************************/


module
.controller('Controll', Ctrl)

;

}());