(function () {'use strict';
/*
  общие методы для списков снабжения и на объектах
  USAGE:
  new TMCTabsLib($ctrl, $scope, $element); ///без присвоения нового объекта
*/
var moduleName = "TMCTabsLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'appRoutes',/*'Util'*/ 'Контрагенты', 'ТМЦ текущие остатки']);

var Lib = function($rootScope, $timeout, $http, appRoutes, /*$compile, Util*/ $Контрагенты, $ТМЦТекущиеОстатки) {// factory
  
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
    //~ $Контрагенты.Load().then(function(){///только после обновления контрагентов
      
      var ka = $Контрагенты.$Data();
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
  
  $scope.$on('ТМЦ/крыжик позиций/событие', function(event, pos){// позиция тмц
    //~ console.log('ТМЦ/крыжик позиций/событие', angular.copy(pos));
    //~ $rootScope.$broadcast('Перемещение ТМЦ/форма/позиция', pos);
    $http.post(appRoutes.url_for('тмц/сохранить поступление'), pos/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        /*$ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;*/
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 2000, 'red');
          pos['крыжик количества'] = !pos['крыжик количества'];
          if (!pos['крыжик количества'])  row['количество/принято'] = null;
          else if (pos['количество/принято'] === undefined || pos['количество/принято'] === null) pos['количество/принято'] = pos['количество'];
        }
        else if(resp.data.success) {
          Materialize.toast((resp.data.success['количество/принято'] ? 'Принято' : 'Отменено') +' успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          //~ $timeout(function(){
          Object.keys(resp.data.success).map(function(key){ pos[key]=resp.data.success[key]; });
          //~ }, 300);
          //~ $ctrl.RefreshTab();
        }
        //~ console.log("Сохранил", resp.data);
      });
  });
  
  $scope.$on('ТМЦ/сменился статус', function(event, id, status) {/// id---ид снаб-заявки; для фиксации момента обработки промежуточной базы, автоматическое создание перемещения на конечный объект
    var ask = $ctrl.data.$снаб[id];
    if ( ask && status == 'входящие' && ask['@позиции тмц'] && ask['@позиции тмц'].some(function(pos){ return !!pos['количество/принято'] && pos['объект/id'] != $ctrl.param['объект'].id; })) $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    else /**if (status == 'входящие')*/ $timeout(function(){
      //~ $ctrl.data['остатки'].splice(0, $ctrl.data['остатки'].length);
      if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();
      //~ $ctrl.RefreshTab();
      //~ Materialize.toast("Позиция статус", 5000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      //~ $ctrl.tab = undefined;
      //~ $timeout(function(){
        //~ $ctrl.tab = $ctrl.tabs['Завершено']['Остатки'];
      //~ }, 1000);///пока костыль, не успевает сохранить поступление до обновления остатков
      
    });
    //~ console.log('ТМЦ/сменился статус', ask, $ctrl.param);
  });
  
  var save_inv = function(event, save){
    
    var item = $ctrl.data.$инвентаризации[save.id];
    //~ console.log("по событию сохр инв", save, item);
    if (item) {///стар
      var idx = $ctrl.data['инвентаризации'].Data().indexOf(item);
      $ctrl.data['инвентаризации'].Data().splice(idx, 1);
      delete $ctrl.data.$инвентаризации[save.id];
      Object.keys(save).map(function(key){ item[key] = save[key]; });
      if (!save['_удалено']) $timeout(function(){
        //~ console.log("инв обратно", item);
        $ctrl.data['инвентаризации'].Data().splice(idx, 0, item);
        $ctrl.data.$инвентаризации[item.id] = item;
      });
    } else { ///нов
      $ctrl.data['инвентаризации'].Data().unshift(save);
      item = $ctrl.data.$инвентаризации[save.id] = save;
    }
    if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();///обновить остатки
    $ctrl.RefreshTab();
    //~ });
    
  };
  $scope.$on('Сохранена инвентаризация ТМЦ', save_inv);
  
  $scope.$on('Удалена инвентаризация ТМЦ', function(event, remove){
    remove['_удалено'] = true;
    save_inv(undefined, remove);
  });
  
    /*** остатки **/
  $ctrl.LoadDataOst = function(append){

    if (!$ctrl.data['остатки']) $ctrl.data['остатки']=[];
    if (append === undefined) $ctrl.data['остатки'].splice(0, $ctrl.data['остатки'].length);
    $ТМЦТекущиеОстатки.Clear($ctrl.param);
    
    
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
  
  $ctrl.TabByName = function(n1, n2){
    return $ctrl.tabs.map(function(t1){ return t1.title == n1 && t1.childs.filter(function(t2){ t2._parent=t1; return t2.title == n2;}).pop(); }).filter(function(t){ return !!t; }).pop();
  };
  
  $ctrl.TabLen = function(tab){
    var data = $ctrl.data[tab.data];
    if (data    && data.length !== undefined) return tab['фильтр'] ? data.filter(tab['фильтр'], tab).length : data.length;
    else if (data  && data.Data) return tab['фильтр'] ? data.Data().filter(tab['фильтр'], tab).length : data.Data().length;
    return '↶';
  };
  
  $ctrl.SelectTab = function(tab, n1, n2){
    if (!tab) tab = $ctrl.TabByName(n1, n2);
    
    $ctrl.tab = undefined;
    $timeout(function(){
      $ctrl.tab = tab;
    });
    
  };
  
  $ctrl.TabLiClass = function(tab) {
    var c = tab.liClass || '';
    if(tab === $ctrl.tab) c += ' active';
    return c;
  };
  $ctrl.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $ctrl.tab) c += ' active fw500 '+(tab.aClassActive || '');
    return c;
  };
  
  $ctrl.EditMove = function(ask){//редактирование исходящего перемещения
    //~ console.log("EditMove", ask);
    $rootScope.$broadcast('Редактировать перемещение ТМЦ', ask);
    
  };
  
  return Lib;
};
};
  
/**********************************************************************/
module

.factory('$TMCTabsLib', Lib)
;

}());