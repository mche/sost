(function () {'use strict';
/*
  общие методы для списков снабжения и на объектах
  USAGE:
  new TMCTablesLib($ctrl, $scope, $element); ///без присвоения нового объекта
*/
var moduleName = "TMCTablesLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes','Util'*/ 'Контрагенты', ]);

var Lib = function($timeout, /*$http, $compile, appRoutes, Util*/ Контрагенты) {// factory
  
return function /*конструктор*/($ctrl, $scope, $element){
  
  $ctrl.RefreshTab = function(loadData){/// loadData - например $ctrl.LoadDataAsk
    var tab = $ctrl.tab;
    $ctrl.tab = undefined;
    var then = function(){
      if ( tab._parent && tab._parent.childs ) $ctrl.tab = tab._parent.childs[tab._parent.childs.indexOf(tab) || 0];
    else $ctrl.tab = tab;
      //~ item._hide = undefined;
    };
    if (loadData) loadData().then( then );///$ctrl.LoadDataAsk().then( then );///обновить заявки
    else $timeout(then);
  };

  $scope.$on('Сохранено поставка/перемещение ТМЦ', function(event, save){
    //~ save._hide = true;
    //~ Контрагенты.Load().then(function(){///только после обновления контрагентов
      
      var ka = Контрагенты.$Data();
      save['@грузоотправители'] = save['@грузоотправители/id'].map(function(kid){ return ka[kid] || {title:""}; });
      var item = $ctrl.data.$снаб[save.id];
      if (item) Object.keys(save).map(function(key){ item[key] = save[key]; });
      else {
        $ctrl.data['снаб'].unshift(save);
        item = $ctrl.data.$снаб[save.id] = save;
      }
      if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();
      $ctrl.RefreshTab($ctrl.LoadDataAsk);
    //~ });
    
    
  });
  
  $scope.$on('Удалено поставка/перемещение ТМЦ', function(event, remId){
    var item = $ctrl.data.$снаб[remId];
    $ctrl.data.$снаб[remId] = undefined;
    var idx = $ctrl.data['снаб'].indexOf(item);
    if(idx !== undefined) $ctrl.data['снаб'].splice(idx, 1);
    if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();
    $ctrl.RefreshTab($ctrl.LoadDataAsk);
    
  });
  
    /*** остатки **/
  $ctrl.LoadDataOst = function(append){

    if (!$ctrl.data['остатки']) $ctrl.data['остатки']=[];
    if (append === undefined) $ctrl.data['остатки'].splice(0, $ctrl.data['остатки'].length);
    
    //~ return $http.post(appRoutes.url_for('тмц/текущие остатки'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      //~ .then(function(resp){
        //~ if(resp.data.error) $scope.error = resp.data.error;
        //~ else {
          //~ Array.prototype.push.apply($ctrl.data['остатки'], resp.data);//
        //~ }
      //~ });
    
  };
  
  $ctrl.OrderByTab1 = function(tab, idx){
    if (!$ctrl.tab) return idx;
    if (tab.childs.some(function(t2){ return t2 === $ctrl.tab; })) return idx;
    else return 1000;
  };
  
  $ctrl.SelectTab = function(tab, n1, n2){
    if (!tab) tab = $ctrl.tabs.map(function(t1){ return t1.title == n1 && t1.childs.filter(function(t2){ t2._parent=t1; return t2.title == n2;}).pop(); }).filter(function(t){ return !!t; }).pop();
    
    $ctrl.tab = undefined;
    $timeout(function(){
      $ctrl.tab = tab;
    });
    
  };
  
  $ctrl.TabLiClass = function(tab) {
    var c = tab.liClass || '';
    if(tab === $ctrl.tab) c += ' active';
    return c;
  }
  $ctrl.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $ctrl.tab) c += ' active fw500 '+(tab.aClassActive || '');
    return c;
  }
  
  return Lib;
};
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());