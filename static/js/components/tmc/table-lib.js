(function () {'use strict';
/*
  общие методы для списков снабжения и на объектах
  USAGE:
  new TMCTableLib($ctrl, $scope, $element); ///без присвоения нового объекта
*/
var moduleName = "TMCTableLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes','Util'*/ 'ContragentData', ]);

var Lib = function($timeout, /*$http, $compile, appRoutes, Util*/ ContragentData) {// factory
  
return function /*конструктор*/($ctrl, $scope, $element){
  
  var refresh = function(){
    var tab = $ctrl.tab;
    $ctrl.tab = undefined;
    var then = function(){
        if ( tab._parent.childs) $ctrl.tab = tab._parent.childs[0];
      else $ctrl.tab = tab;
        //~ item._hide = undefined;
      };
    if ($ctrl.LoadDataAsk) $ctrl.LoadDataAsk().then( then );///обновить заявки
    else $timeout(then);
    
  };

  $scope.$on('Сохранено поставка/перемещение ТМЦ', function(event, save){
    //~ save._hide = true;
    //~ ContragentData.Load().then(function(){///только после обновления контрагентов
      
      var ka = ContragentData.$Data();
      save['@грузоотправители'] = save['@грузоотправители/id'].map(function(kid){ return ka[kid] || {title:""}; });
      var item = $ctrl.data.$снаб[save.id];
      if (item) Object.keys(save).map(function(key){ item[key] = save[key]; });
      else {
        $ctrl.data['снаб'].unshift(save);
        item = $ctrl.data.$снаб[save.id] = save;
      }
      refresh();
      
    //~ });
    
    
  });
  
  $scope.$on('Удалено поставка/перемещение ТМЦ', function(event, remId){
    var item = $ctrl.data.$снаб[remId];
    $ctrl.data.$снаб[remId] = undefined;
    var idx = $ctrl.data['снаб'].indexOf(item);
    if(idx !== undefined) $ctrl.data['снаб'].splice(idx, 1);
    refresh();
    
  });
  
  return Lib;
};
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());