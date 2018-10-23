(function () {'use strict';
/*
  Заявки ТМЦ
  /// создать объект $Список (Util) по 4 спискам заявок:
/// Заявки на объектах
/// Заявки снабжению
/// Заявки на резерв остатков
/// Заявки с выполненными простыми поставками
*/

///возможные заглушки модулей
//~ var lib = function(){ return lib; };
var stubs = ['ТМЦ/простая форма снабжения', 'ТМЦ/заявки/номенклатура и резерв остатка', 'ТМЦ/заявки/ответ по резерву остатка'];
stubs.map(function(stub){
  try {angular.module(stub);}
  catch(e) {
    //~ console.log("Заглушка модуля", stub, e);
    angular.module(stub, []); /*.factory(stub, lib);*//**/
    
  }
});


var moduleName = "ТМЦ список заявок";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',].pushSelf(stubs));//'ngSanitize',, 'dndLists'
//~ module.config(function($rootScopeProvider){
  //~ $rootScopeProvider.digestTtl(100);
  
//~ });

var Component = function ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util) {//TMCAskTableData
  var $c = this;
  
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    var $ask;
    //~ console.log('Сохранена заявка ТМЦ', ask);
    if(ask._new) return $c.Append(ask);// новая строка
    // старая строка
    var idx = $c.data.indexOf(ask);
    if (idx != -1) $ask = $c.data[idx];
    if(!$ask) $ask = $c.data.filter(function(it) { return it.id == ask.id; }).pop();
    //~ console.log('Сохранена заявка ТМЦ', $ask);
    if($ask) angular.forEach(ask, function(val, key){$ask[key]=val;});
    //~ $ask._init = false;
    //~ $c.InitAsk($ask);

  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    var $ask;
    var idx = $c.data.indexOf(ask);
    if (idx != -1) $ask = $c.data[idx];
    if(!$ask) $ask = $c.data.filter(function(it) { return it.id == ask.id; }).pop();
    $c.Delete($ask);
  });
  
  
  $c.$onInit = function(){
    if (!$c.param) $c.param = {};
    if (!$c.param.theadClass) $c.param.theadClass = 'orange lighten-3';
    if (!$c.param.tbodyClass) $c.param.tbodyClass = 'orange lighten-5';
    $scope.param = $c.param;
    $c['обратно сортировать'] =  !!$c.param['список простых закупок'];
    
    
    $c.LoadData().then(function(){ $c.Ready(); });
  };
  
  $c.LoadData = function(param){
    var p = angular.extend({'объект': $c.param['объект'],}, param);
    $c.cancelerHttp = 1;
    if (p.$Список && p.$Список.append) 
      return $c.$data.Load(angular.extend(p, { "offset":$c.data.length, }))
        .then(function(){
          $c.cancelerHttp = undefined;
          
        });
    
    if ($c.data.Load)
      return $c.data.Load(p)
        .then(function(){
          $c.cancelerHttp = undefined;
          $c.$data = $c.data;///это Util.$Список
          $c.data = $c.$data.Data();///не копия массива
          $c.where = angular.extend({"дата1":{"values":[]}, "наименование":{}}, $c.$data.Where());// фильтры
        });
    
    return $timeout(function(){ $c.cancelerHttp = undefined; });///уже массив
    
  };
  
  $c.Ready = function(){
    $c.ready = true;
    
    $timeout(function(){
      $('.show-on-ready', $($element[0])).slideToggle( /*"slow"*/ );
      
      $('.modal', $($element[0])).modal({
          endingTop: '0%',
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $c.modal_trigger = trigger;
          },
        });
        
        //~ $c.tab = $c.tabs[0]; 
        //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
        //~ $c.tabsReady = true;
      });
    
  };
  
  $c.FilterData = function(it){
    //~ var tab = this || $c.tab;
    //~ if(!tab) return false;
    //~ return tab.filter(it, tab);
    var filter = $c.param['фильтр'];
    if(!filter) return !it._hide;
    return !it._hide  && filter(it);
  };
  $c.OrderByData = function(it){// для необработанной таблицы
    if (it._new) return '';
    return it["дата1"]+'/'+it.id;//["объект/id"];
  };
  
  $c.FilterEasy= function(it){///this - тип строки строка 
    return it['строки тмц']==this;
  };
  
  $c.InitRow = function(it){//необработанные позиции тмц + простая поставка
    //~ if(it['$дата1'] && angular.isString(it['$дата1'])) it['$дата1'] = JSON.parse(it['$дата1']);
    
    /***if (!it['$простая обработка заявки'])***/ it['$простая обработка заявки'] = {};
    var easy = it['$простая обработка заявки'];
    if (!easy['$номенклатура']) easy['$номенклатура'] = {"selectedItem":{id: it['номенклатура/id']}, /*"topParent000":{id:0}*/};
    easy['$тмц/заявка'] = angular.copy(it);
    
    
    
    it['заявка/количество/остаток'] = (parseFloat(Util.numeric(it["количество"])) - parseFloat(Util.numeric(it["тмц/количество"]) || 0));
    var rowsEasy = it['@тмц/строки простой поставки'] || [];
    rowsEasy.map(function(row){  it['заявка/количество/остаток'] -= parseFloat(Util.numeric(row['количество']) || 0);  });
    easy['$тмц/заявка']['количество'] = it['заявка/количество/остаток'];
    
    
    if (!easy['$строка тмц/поставщик']) easy['$строка тмц/поставщик'] = rowsEasy.filter($c.FilterEasy, 'поставщик').pop() || {"количество":undefined,"коммент":undefined,};
    if (!easy['$строка тмц/поставщик']['количество'] && parseFloat(easy['$тмц/заявка']['количество'] || 0) > 0) easy['$строка тмц/поставщик']['количество'] = easy['$тмц/заявка']['количество'];///уже вычтены частичные поставки
    if (!easy['$строка тмц/с базы']) easy['$строка тмц/с базы'] =  rowsEasy.filter($c.FilterEasy, 'с базы').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    if (!easy['$строка тмц/на базу']) easy['$строка тмц/на базу'] = rowsEasy.filter($c.FilterEasy, 'на базу').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    
  };
  
  $c.ClickAsk = function(ask){// клик на строке
    $timeout(function(){
      if(!$c.param['в закупку'] && !$c.param['список простых закупок']) return ask._edit = true;///angular.copy(ask);
    
      if($c.param['обработать номенклатуру'] && !ask['$номенклатура'] && !(ask['@тмц/резервы остатков'] && ask['@тмц/резервы остатков'].length))  {
        ask['$номенклатура'] = {"id": ask['номенклатура/id'], "selectedItem":{id: ask['номенклатура/id']}, /*"topParent000":{id: 0},*/};
        return;
      }
    if (ask['@тмц/резервы остатков'] && ask['@тмц/резервы остатков'].length) Materialize.toast('Уже есть запрос резерва, можно отменить', 3000, 'left red-text text-darken-3 red lighten-3 fw500 border animated flash-one fast');
    });
    
  };
  
  /**** постановка/снятие позиции в обработку ****/
  $c.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    $rootScope.$broadcast('Добавить/убрать позицию ТМЦ в заявку снабжения', it);
  };
  
  $c.CheckedEasy = function(easy, bLabel){// bLabel boolean click label
    console.log("CheckedEasy", angular.copy(easy));
    var edit = !(easy._edit && bLabel);
    $timeout(function(){ easy._edit = edit;});
    //~ console.log("CheckedEasy", it);
    //~ $c['$простая обработка заявки'] = undefined;
    //~ if (!it['простая обработка'])  $timeout(function(){ $c['$простая обработка заявки'] = it['$простая обработка заявки']; });
    //~ if(bLabel) it['простая обработка'] = !it['простая обработка'];
    
  };
  
  
  $c.Delete = function(it){
    //~ var it = $c.param.delete;
    //~ delete $c.param.delete;
    var idx = $c.data.indexOf(it);
    $c.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $c.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $c.param.newX;
    //~ delete $c.param.newX;
    //~ delete it._new;
    //~ n._new = true;
    //~ if (!$c.data.length) return $window.location.reload();
    $c.data.unshift(it);
    //~ $timeout(function(){
    //~ $c['обновить'] = true;
    //~ $c.ready = false;
    
  };

  
  $c.CancelWhere = function(name){
    if(!$c.where[name].ready) return;
    $c.where[name].ready = 0;
    $c.data = $c.$data.Clear();
    angular.extend($c.$data.Where(), $c.where);
    $c.ready = undefined;
    $c.LoadData(/*{where: $c.where}*/).then(function(){ $c.Ready(); });
  };
  
  $c.SendWhere = function(name){
    $c.where[name].ready = 1;
    $c.data = $c.$data.Clear();
    $c.ready = undefined;
    angular.extend($c.$data.Where(), $c.where);
    $c.LoadData(/*{where: $c.where}*/).then(function(){ $c.Ready(); });//
  };

  
};

/******************************************************/



/*=============================================================*/

module

.component('tmcAskTable', {
  controllerAs: '$c',
  templateUrl: "tmc/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',/// или массив или объект new $Список(appRoutes.url_for(url), ....)

  },
  controller: Component
})

;

}());