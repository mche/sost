(function () {'use strict';
/*
  Заявки ТМЦ
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
  var $ctrl = this;
  
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    var $ask;
    //~ console.log('Сохранена заявка ТМЦ', ask);
    if(ask._new) return $ctrl.Append(ask);// новая строка
    // старая строка
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    //~ console.log('Сохранена заявка ТМЦ', $ask);
    if($ask) angular.forEach(ask, function(val, key){$ask[key]=val;});
    //~ $ask._init = false;
    //~ $ctrl.InitAsk($ask);

  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    var $ask;
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    $ctrl.Delete($ask);
  });
  

  
  /*$scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.append) {
      $ctrl.Append(newVal.append);
      delete newVal.append;
      return;
    }
    if (newVal.remove) {
      $ctrl.Delete(newVal.remove);
      delete newVal.remove;
      return;
    }
  }, true);*/
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if (!$ctrl.param.where) $ctrl.param.where={"дата1":{"values":[]}, "наименование":{}};// фильтры
      if (!$ctrl.param) $ctrl.param = {};
      if (!$ctrl.param.theadClass) $ctrl.param.theadClass = 'orange lighten-3';
      if (!$ctrl.param.tbodyClass) $ctrl.param.tbodyClass = 'orange lighten-5';
      $scope.param = $ctrl.param;
      $ctrl['обратно сортировать'] =  !!$ctrl.param['список простых закупок'];
      
      $ctrl.Show();
      
      //~ $ctrl.data = $ctrl.data.filter($ctrl.FilterData);
      
      //~ if($ctrl.data) $timeout(function(){ });
        
      //~ else  $ctrl.LoadData().then(function(){  $ctrl.Show(); });
    
    });
  };
  
  $ctrl.Show = function(){
    $ctrl.ready = true;
    
    $timeout(function(){
      $('.show-on-ready', $($element[0])).slideToggle( /*"slow"*/ );
      
      $('.modal', $($element[0])).modal({
          endingTop: '0%',
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $ctrl.modal_trigger = trigger;
          },
        });
        
        //~ $ctrl.tab = $ctrl.tabs[0]; 
        //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
        //~ $ctrl.tabsReady = true;
      });
    
  };
  
  /***$ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    //$http.post(appRoutes.url_for('тмц/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //
    return TMCAskTableData($ctrl.param)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };***/
  
  $ctrl.FilterData = function(it){
    //~ var tab = this || $ctrl.tab;
    //~ if(!tab) return false;
    //~ return tab.filter(it, tab);
    var filter = $ctrl.param['фильтр'];
    if(!filter) return !it._hide;
    return !it._hide  && filter(it);
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    return it["дата1"]+'/'+it.id;//["объект/id"];
  };
  
  $ctrl.FilterEasy= function(it){///this - тип строки строка 
    return it['строки тмц']==this;
  };
  
  $ctrl.InitRow = function(it){//необработанные позиции тмц + простая поставка
    //~ if(it['$дата1'] && angular.isString(it['$дата1'])) it['$дата1'] = JSON.parse(it['$дата1']);
    
    /***if (!it['$простая обработка заявки'])***/ it['$простая обработка заявки'] = {};
    var easy = it['$простая обработка заявки'];
    if (!easy['$номенклатура']) easy['$номенклатура'] = {"selectedItem":{id: it['номенклатура/id']}, /*"topParent000":{id:0}*/};
    easy['$тмц/заявка'] = angular.copy(it);
    
    
    
    it['заявка/количество/остаток'] = (parseFloat(Util.numeric(it["количество"])) - parseFloat(Util.numeric(it["тмц/количество"]) || 0));
    var rowsEasy = it['@тмц/строки простой поставки'] || [];
    rowsEasy.map(function(row){  it['заявка/количество/остаток'] -= parseFloat(Util.numeric(row['количество']) || 0);  });
    easy['$тмц/заявка']['количество'] = it['заявка/количество/остаток'];
    
    
    if (!easy['$строка тмц/поставщик']) easy['$строка тмц/поставщик'] = rowsEasy.filter($ctrl.FilterEasy, 'поставщик').pop() || {"количество":undefined,"коммент":undefined,};
    if (!easy['$строка тмц/поставщик']['количество'] && parseFloat(easy['$тмц/заявка']['количество'] || 0) > 0) easy['$строка тмц/поставщик']['количество'] = easy['$тмц/заявка']['количество'];///уже вычтены частичные поставки
    if (!easy['$строка тмц/с базы']) easy['$строка тмц/с базы'] =  rowsEasy.filter($ctrl.FilterEasy, 'с базы').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    if (!easy['$строка тмц/на базу']) easy['$строка тмц/на базу'] = rowsEasy.filter($ctrl.FilterEasy, 'на базу').pop() || {"количество":undefined,"$объект":{},"коммент":undefined,};
    
  };
  
  $ctrl.ClickAsk = function(ask){// клик на строке
    $timeout(function(){
      if(!$ctrl.param['в закупку'] && !$ctrl.param['список простых закупок']) return ask._edit = true;///angular.copy(ask);
    
      if($ctrl.param['обработать номенклатуру'] && !ask['$номенклатура'] && !(ask['@тмц/резервы остатков'] && ask['@тмц/резервы остатков'].length))  {
        ask['$номенклатура'] = {"id": ask['номенклатура/id'], "selectedItem":{id: ask['номенклатура/id']}, /*"topParent000":{id: 0},*/};
        return;
      }
    if (ask['@тмц/резервы остатков'] && ask['@тмц/резервы остатков'].length) Materialize.toast('Уже есть запрос резерва, можно отменить', 1000, 'left red-text text-darken-3 red lighten-3 fw500 border');
    });
    
  };
  
  /**** постановка/снятие позиции в обработку ****/
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    $rootScope.$broadcast('Добавить/убрать позицию ТМЦ в заявку снабжения', it);
  };
  
  $ctrl.CheckedEasy = function(easy, bLabel){// bLabel boolean click label
    console.log("CheckedEasy", angular.copy(easy));
    var edit = !(easy._edit && bLabel);
    $timeout(function(){ easy._edit = edit;});
    //~ console.log("CheckedEasy", it);
    //~ $ctrl['$простая обработка заявки'] = undefined;
    //~ if (!it['простая обработка'])  $timeout(function(){ $ctrl['$простая обработка заявки'] = it['$простая обработка заявки']; });
    //~ if(bLabel) it['простая обработка'] = !it['простая обработка'];
    
  };
  
  
  $ctrl.Delete = function(it){
    //~ var it = $ctrl.param.delete;
    //~ delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    delete it._new;
    //~ n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(it);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    
  };

  
  $ctrl.CancelWhere = function(name){
    if(!$ctrl.param.where[name].ready) return;
    $ctrl.param.where[name].ready = 0;
    //~ $ctrl.LoadData();//$ctrl.param.where
    if ($ctrl.onWhere) $ctrl.onWhere();
  };
  
  $ctrl.SendWhere = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.where['сумма'].sign = abs;
    //~ }
    $ctrl.param.where[name].ready = 1;
    //~ $ctrl.LoadData();//$ctrl.param.where
    if ($ctrl.onWhere) $ctrl.onWhere();
  };

  
};

/******************************************************/
/***var Data  = function($http, appRoutes){
  var  $this = {
    Load: function(param){ return $http.post(appRoutes.url_for('тмц/список заявок'), param); },
  };
  return $this;
  
};***/


/*=============================================================*/

module
//~ .factory("TMCAskTableData", Data)
.component('tmcAskTable', {
  templateUrl: "tmc/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',
    onWhere: '&', ///фильтрация записей $ctrl.param.where

  },
  controller: Component
})

;

}());