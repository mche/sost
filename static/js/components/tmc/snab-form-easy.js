(function () {'use strict';
/*
  Форма простой обработки снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ/простая форма снабжения";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem',  'Util', 'Номенклатура', 'Объект или адрес',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, NomenData) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if (!$ctrl.param) $ctrl.param = {};
    /***if (!$ctrl.data['$номенклатура']) $ctrl.data['$номенклатура'] = {};
    if (!$ctrl.data['$строка тмц/поставщик']) $ctrl.data['$строка тмц/поставщик'] = $ctrl.data['@строки тмц'].filter($ctrl.FilterTMC, 'поставщик').pop() || {"количество":undefined,"коммент":undefined,};
    if (!$ctrl.data['$строка тмц/поставщик']['количество']) $ctrl.data['$строка тмц/поставщик']['количество'] = $ctrl.data['$тмц/заявка']['количество'];///уже вычтены частичные поставки
    if (!$ctrl.data['$строка тмц/с базы']) $ctrl.data['$строка тмц/с базы'] =  $ctrl.data['@строки тмц'].filter($ctrl.FilterTMC, 'с базы').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    if (!$ctrl.data['$строка тмц/на базу']) $ctrl.data['$строка тмц/на базу'] = $ctrl.data['@строки тмц'].filter($ctrl.FilterTMC, 'на базу').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};***/
    
    $scope.nomenData = [];
    NomenData/*.Refresh(0)*/.Load(0).then(function(data){  Array.prototype.push.apply($scope.nomenData, data); });
    
    $ctrl.ready = true;
  };
  
  $ctrl.OnFocusBase1 = function(ctrl){//возврат из компонента object-address для базы
    //~ console.log("OnFocusBase1", ctrl.data, ctrl.ToggleListBtn);
    if(!ctrl.data.title) ctrl.ToggleListBtn();
    
  };
  
  $ctrl.Valid = function(){
    var nomen = $ctrl.data['$номенклатура'];
    var kolP = parseFloat(Util.numeric($ctrl.data['$строка тмц/поставщик']['количество']) || 0);
    var kolOb1 = parseFloat(Util.numeric($ctrl.data['$строка тмц/с базы']['количество']) || 0);
    var kolOb2 = parseFloat(Util.numeric($ctrl.data['$строка тмц/на базу']['количество']) || 0);
    var kolZ = parseFloat(Util.numeric($ctrl.data['$тмц/заявка']['количество']));
    var ob1 =  $ctrl.data['$строка тмц/с базы']['$объект'];
    var ob2 = $ctrl.data['$строка тмц/на базу']['$объект'];
    return  ((nomen.selectedItem && nomen.selectedItem.id) || (nomen.newItems && nomen.newItems[0] && nomen.newItems[0].title))
      && (!kolOb1 || ob1.id) && (!kolOb2 || ob2.id)
      && (!ob1.id || kolOb1) && (!ob2.id || kolOb2)
      && (kolP+ kolOb1 >= kolZ )
    
    ;
  };
  
  $ctrl.Save = function(){
    $ctrl.cancelerHttp = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/снабжение/сохранить простую поставку'), $ctrl.data/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green');
          //~ window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          $rootScope.$broadcast('Сохранено/простая поставка ТМЦ', resp.data.success);
          ///обновить номенклатуру
          $scope.nomenData.length = 0;
          NomenData.Refresh(0).Load(0).then(function(data){  Array.prototype.push.apply($scope.nomenData, data); });
        }
        
        console.log("Сохранено/простая поставка ТМЦ:", resp.data);
      });
    
  };
  
  $ctrl.Cancel = function(){
    $ctrl.data._edit = false;
    
  };
  
};

/*=============================================================*/

module

.component('tmcSnabFormEasy', {
  templateUrl: "tmc/snab/form-easy",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Component
})

;

}());