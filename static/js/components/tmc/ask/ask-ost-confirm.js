(function () {'use strict';
/*
  ответ на  запрос по резерву остатков
  к модулю списка заявок ТМЦ
*/
var moduleName = "ТМЦ/заявки/ответ по резерву остатка";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', /*'DateBetween',*/ 'Номенклатура', 'ТМЦ текущие остатки', 'Объекты']);

var Component = function  ($scope, /*$rootScope,*/ $timeout, $http, $element, $q, appRoutes, Util, $Номенклатура, ТМЦТекущиеОстатки, $Объекты) {
  var $ctrl = this;
  $scope.isNan = isNaN;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $ctrl.$onInit = function(){
    if (!$ctrl.param) $ctrl.param = {};
    
    //~ var async = [];
    
    $Объекты["все объекты без доступа"]().then(function(resp){ $ctrl.$Объекты = resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});});
    
    $ctrl['номенклатура']=[];/// для tree-item
     
    $Номенклатура.Load(0).then(function(data){
      Array.prototype.push.apply($ctrl['номенклатура'], data);
      $ctrl.$Номенклатура = $Номенклатура.$Data();
    });//$http.get(appRoutes.url_for('номенклатура/список', 0));
    
    $ctrl['Остатки'] = [];
    ТМЦТекущиеОстатки.Load($ctrl.param).then(function(resp){
      Array.prototype.push.apply($ctrl['Остатки'], resp.data);
      $ctrl.$Остатки = resp.data.reduce(function(result, item, index, array) {
        if (!result[item['номенклатура/id']]) result[item['номенклатура/id']] = [];
        result[item['номенклатура/id']].push(item);
        return result;
      }, {});
      //~ console.log('$Остатки', $ctrl.$Остатки, );
    });
    
    //~ $q.all(async).then(function(){
      $ctrl.ready = true;
      
    //~ })
    
  };

  $ctrl.ChangeConfirmChb = function(row, chb){/// chb - объект созданный для чекбокса в разметке
    row['количество/резерв'] = Util.numeric(row['количество/резерв']);
    if (isNaN(parseFloat(row['количество/резерв']))) {
      delete row['количество/резерв'];
      $timeout(function(){
        row['количество/резерв'] = undefined;
        
      });
      chb.val = false;
      return;
    }
    
    $http.post(appRoutes.urlFor('тмц/заявки/подтвердить резерв остатка'), row)
      .then(function(resp){
        if (resp.data.error) return Materialize.toast(resp.data.error, 5000, 'left red-text text-darken-3 red lighten-3 fw500 border');
        if (resp.data.success) {
          Materialize.toast("Подтверждение остатка сохранено", 3000, 'left green-text text-darken-3 green lighten-3 fw500 border');
          
        }
        
      });
    
    //~ console.log("ChangeConfirmChb", row);
  };

};

  
/*=============================================================*/

module

.component('tmcAskOstConfirm', {
  templateUrl: "tmc/ask/ost-confirm",
  //~ scope: {},
  bindings: {
    param: '<',
    ask: '<',///вся заявка

  },
  controller: Component
})

;

}());