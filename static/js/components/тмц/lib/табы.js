(function () {'use strict';
/*
  общие методы для списков снабжения и на объектах
  USAGE:
  new TMCTabsLib($c, $scope, $element); ///без присвоения нового объекта
*/
var moduleName = "TMCTabsLib";
try {angular.module(moduleName); return;} catch(e) { }
//~ try {angular.module('Контрагенты');} catch(e) {  angular.injector(['Console']).get('$Console').log('Заглушка модуля "Контрагенты" ', angular.module('Контрагенты', []).factory("$Контрагенты", function(){})); }

var module = angular.module(moduleName, [ 'appRoutes', 'Util', 'Контрагенты', 'ТМЦ текущие остатки']);

const Lib = function($rootScope, $timeout, $http, appRoutes, /*$compile, Util*/ $Контрагенты, $ТМЦТекущиеОстатки, $Список) {// factory
  
return function /*конструктор*/($c, $scope, $element){
  
  $c.RefreshTab = function(loadData){/// loadData - например $c.LoadDataAsk
    var tab = $c.tab;
    $c.tab = undefined;
    var then = function(){
      if ( tab._parent && tab._parent.childs ) $c.tab = tab._parent.childs[tab._parent.childs.indexOf(tab) || 0];
    else $c.tab = tab;
      //~ item._hide = undefined;
    };
    if (loadData) loadData().then( then );///$c.LoadDataAsk().then( then );///обновить заявки
    else $timeout(then);
  };

  $scope.$on('Сохранено поставка/перемещение ТМЦ', function(event, save){
    //~ save._hide = true;
    //~ $Контрагенты.Load().then(function(){///только после обновления контрагентов
      
      var ka = $Контрагенты.$Data();
      save['@грузоотправители'] = save['@грузоотправители/id'].map(function(kid){ return ka[kid] || {title:""}; });
      var item = $c.data.$снаб[save.id];
      if (item) Object.keys(save).map(function(key){ item[key] = save[key]; });
      else {
        if ($c.data['снаб'].Data) $c.data['снаб'].Data().unshift(save);
        else $c.data['снаб'].unshift(save);
        item = $c.data.$снаб[save.id] = save;
      }
      //~ if ($c.LoadDataOst) $c.LoadDataOst();
      //~ $rootScope.$broadcast('Обновить остатки ТМЦ');
      $c.RefreshTab($c.LoadDataAsk);
    //~ });
  });
  
  $scope.$on('Удалено поставка/перемещение ТМЦ', function(event, remId){
    var item = $c.data.$снаб[remId];
    $c.data.$снаб[remId] = undefined;
    var data = $c.data['снаб'].Data ? $c.data['снаб'].Data() : $c.data['снаб'];
    var idx = data.indexOf(item);
    if(idx !== undefined) data.splice(idx, 1);
    //~ if ($c.LoadDataOst) $c.LoadDataOst();
    //~ $rootScope.$broadcast('Обновить остатки ТМЦ');
    $c.RefreshTab($c.LoadDataAsk);
    
  });
  
  $scope.$on('ТМЦ/крыжик позиций/событие', function(event, pos){// позиция тмц
    //~ console.log('ТМЦ/крыжик позиций/событие', angular.copy(pos));
    //~ $rootScope.$broadcast('Перемещение ТМЦ/форма/позиция', pos);
    $http.post(appRoutes.url_for('тмц/сохранить поступление'), pos/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        /*$c.cancelerHttp.resolve();
        delete $c.cancelerHttp;*/
        if(resp.data.error) {
          $c.error = resp.data.error;
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
          //~ $c.RefreshTab();
        }
        //~ console.log("Сохранил", resp.data);
      });
  });
  
  /***$scope.$on('ТМЦ/сменился статус', function(event, id, status) {/// id---ид снаб-заявки; для фиксации момента обработки промежуточной базы, автоматическое создание перемещения на конечный объект
    var ask = $c.data.$снаб[id];
    if ( ask && status == 'входящие' && ask['@позиции тмц'] && ask['@позиции тмц'].some(function(pos){ return !!pos['количество/принято'] && pos['объект/id'] != $c.param['объект'].id; })) $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    else  $timeout(function(){ ////**if (status == 'входящие')
      //~ $c.data['остатки'].splice(0, $c.data['остатки'].length);
      if ($c.LoadDataOst) $c.LoadDataOst();
      //~ $c.RefreshTab();
      //~ Materialize.toast("Позиция статус", 5000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      //~ $c.tab = undefined;
      //~ $timeout(function(){
        //~ $c.tab = $c.tabs['Завершено']['Остатки'];
      //~ }, 1000);///пока костыль, не успевает сохранить поступление до обновления остатков
      
    });
    //~ console.log('ТМЦ/сменился статус', ask, $c.param);
  });***/
  
  //~ $scope.$on('ТМЦ/сохранено в новое перемещение', function(event, data){
    //~ $timeout(function(){
      //~ $c.SelectTab(undefined, '', 'Перемещения');
    //~ }, 1000);
    
  //~ });
  
  const onSave = function($data, data, save){
    
    var item = $data[save.id];
    //~ console.log("по событию сохр инв", save, item);
    if (item) {///стар
      var idx = data.Data().indexOf(item);
      data.Data().splice(idx, 1);
      delete $data[save.id];
      Object.keys(save).map(function(key){ item[key] = save[key]; });
      if (!save['_удалено']) $timeout(function(){
        //~ console.log("инв обратно", item);
        data.Data().splice(idx, 0, item);
        $data[item.id] = item;
      });
    } else { ///нов
      data.Data().unshift(save);
      item = $data[save.id] = save;
    }
    //~ if ($c.LoadDataOst) $c.LoadDataOst();///обновить остатки
    //~ $rootScope.$broadcast('Обновить остатки ТМЦ');
    $c.RefreshTab();
    //~ });
    
  };
  $scope.$on('Сохранена инвентаризация ТМЦ', function(event, save){
    onSave($c.data.$инвентаризации, $c.data['инвентаризации'], save);
  });  
  $scope.$on('Удалена инвентаризация ТМЦ', function(event, remove){
    remove['_удалено'] = true;
    onSave($c.data.$инвентаризации, $c.data['инвентаризации'], remove);
  });
  $scope.$on('Сохранено списание ТМЦ', function(event, save){
    onSave($c.data.$списания, $c.data['списания'], save);
  });
  $scope.$on('Удалено списание ТМЦ', function(event, remove){
    remove['_удалено'] = true;
    onSave($c.data.$списания, $c.data['списания'], remove);
  });
  
  $scope.$on('Обновить поставку ТМЦ', function(event, item){/// через склад
    //~ console.log('Обновить поставку ТМЦ', item, $c.data.$снаб[item.id]);
    if ($c.data.$снаб[item.id]) $c.LoadItemSnab(item, $c.param).then(function(loader){
      var n = loader.Data()[0];
      Object.keys(n).map(function(key){ $c.data.$снаб[item.id][key] = n[key]; });
      $c.RefreshTab();
    });
    
  });
    /*** остатки **/
  $c.LoadDataOst = function(append){
    if (!$c.data['остатки']) $c.data['остатки']=[];
    if (append === undefined) $c.data['остатки'].splice(0, $c.data['остатки'].length);
    $ТМЦТекущиеОстатки.Clear();///$c.param
  };
  
  /*** завершенные заявки **/
  $c.LoadDataAskDone = function(){//param

    $c.data['завершенные заявки'] = new $Список(appRoutes.url_for('тмц/заявки/завершенные'), $c, $scope);
    return $c.data['завершенные заявки'].Load({"объект": $c.param['объект']}).then(function(){
      //~ if (!$c.data.$завершенные_заявки) $c.data.$завершенные_заявки = {};
      //~ $c.data['завершенные заявки'].$Data($c.data.$заявки);
    });
  };
  
  $c.OrderByTab1 = function(tab, idx){
    if (!$c.tab) return idx;
    if (tab.childs.some(function(t2){ return t2 === $c.tab; })) return idx;
    else return 1000;
  };
  
  $c.TabByName = function(n1, n2){
    return $c.tabs.map(function(t1){ return t1.title == n1 && t1.childs.filter(function(t2){ t2._parent=t1; return t2.title == n2;}).pop(); }).filter(function(t){ return !!t; }).pop();
  };
  
  $c.TabLen = function(tab){
    var data = $c.data[tab.data];
    if (data    && data.length !== undefined) return tab['фильтр'] ? data.filter(tab['фильтр'], tab).length : data.length;
    else if (data  && data.Data) return tab['фильтр'] ? data.Data().filter(tab['фильтр'], tab).length : data.Data().length;
    return '↶';
  };
  
  $c.SelectTab = function(tab, n1, n2){
    if (!tab) tab = $c.TabByName(n1, n2);
    if (!tab) return console.error("Не найден таб: ", n1, n2);
    $c.tab = undefined;
    //~ debugger;
    $timeout(function(){
      $c.tab = tab;
    });
    
  };
  
  $c.TabLiClass = function(tab) {
    var c = tab.liClass || '';
    if(tab === $c.tab) c += ' active';
    return c;
  };
  $c.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $c.tab) c += ' active fw500 '+(tab.aClassActive || '');
    return c;
  };
  
  const EditSnab = function(item, param){
    param = param || $c.param || {};
    if ($c.tab.title == 'Закупки' || $c.tab.title == 'Через склад') return $rootScope.$broadcast('Редактировать закупку ТМЦ', item, {'объект': param['объект'], 'перемещение': false, modal000: !0,});
    if ($c.tab.title == 'Перемещения') return $rootScope.$broadcast('Редактировать перемещение ТМЦ', item, {'объект': param['объект'], 'перемещение': true, modal000: !0,});
  };
  
  $c.EditSnab = function(item, param){
    //~ if (!item) return true;///показать кнопку редактирования
    //~ var data = [];/// в этот массив загрузится одна позиция
    //~ console.log("EditSnab", item, param || $c.param);
    if (param.where && param.where['тмц/номенклатура'] && param.where['тмц/номенклатура'].ready ) $c.LoadItemSnab(item, param).then(function(loader){
      EditSnab(loader.Data()[0], param);
    });
    else EditSnab(item, param);
  };
  
  $c.LoadItemSnab = function(item, param){/// загрузить для редактирования (фильтр мог убрать позиции)
    param = param || $c.param || {};
    var loader = new $Список(appRoutes.url_for('тмц/снаб/список поставок')/*, $c, $scope, $element*/);
    return loader.Load({"объект": param['объект'], "id": item.id}).then(function(){
      return loader;//.Data(data);
    });
    
  };
  
  $c.EditMove = function(item){//редактирование исходящего перемещения
    //~ console.log("EditMove", item);
    //~ if (!item) return true;///показать кнопку редактирования
    $rootScope.$broadcast('Редактировать перемещение ТМЦ', item, {'объект': $c.param['объект'], 'перемещение': true,});
    
  };
  
  $c.EditInv = function(item, param){
    //~ if (!item) return true;///показать кнопку редактирования
    //~ var data = [];/// в этот массив загрузится одна позиция
    if (param.where && param.where['тмц/номенклатура'] && param.where['тмц/номенклатура'].ready )
      $c.LoadItemInv(item, param).then(function(loader){ $rootScope.$broadcast('Редактировать инвентаризацию ТМЦ', loader.Data()[0]); });
    else $rootScope.$broadcast('Редактировать инвентаризацию ТМЦ', item);
  };
  $c.LoadItemInv = function(item, param){/// загрузить для редактирования (фильтр мог убрать позиции)
    param = param || $c.param || {};
    var loader = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций')/*, $c, $scope, $element*/);
    return loader.Load({"объект": param['объект'], "id": item.id}).then(function(){
      return loader;//.Data(data);
    });
  };
  
  $c.EditSpis = function(item, param){
    if (!item) return true;///показать кнопку редактирования
    //~ var data = [];/// в этот массив загрузится одна позиция
    if (param.where && param.where['тмц/номенклатура'] && param.where['тмц/номенклатура'].ready )
      $c.LoadItemSpis(item, param).then(function(loader){ $rootScope.$broadcast('Редактировать списание ТМЦ', loader.Data()[0]); });
    else $rootScope.$broadcast('Редактировать списание ТМЦ', item);
  };
  $c.LoadItemSpis = function(item, param){/// загрузить для редактирования (фильтр мог убрать позиции)
    param = param || $c.param || {};
    var loader = new $Список(appRoutes.url_for('тмц/список списаний')/*, $c, $scope, $element*/);
    return loader.Load({"объект": param['объект'], "id": item.id}).then(function(){
      return loader;//.Data(data);
    });
  };
  $c.InitRowSpis = function(row){///крыжик принятия списания
    row['принял'] = row['принял'] === null ? null : row['принял'] > 0 ? true : false;
  };
  
  return Lib;
};
};
  
/**********************************************************************/
module

.factory('$TMCTabsLib', Lib)
;

}());