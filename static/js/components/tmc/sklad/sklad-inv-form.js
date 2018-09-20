(function () {'use strict';
/*
  Форма инвентаризации ТМЦ на складе
*/

var moduleName = "ТМЦ форма инвентаризации";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem',  'Util', 'TMCFormLib', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, TMCFormLib, NomenData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  $scope.Util = Util;
  
  new TMCFormLib($ctrl, $scope, $element);
  
  $scope.$on('Редактировать инвентаризацию ТМЦ', function(event, data){
    //~ console.log("Редактировать инвентаризацию ТМЦ", data);
    $ctrl.Cancel();
    //~ if(param) $scope.param=$ctrl.param = param;
    $timeout(function(){ $ctrl.Open(data); });
    
  });
  
  $scope.$on('Добавить/убрать позицию ТМЦ в инвентаризацию', function(event, row){
    //~ console.log("Добавить/убрать позицию ТМЦ в заявку снабжения", row);
    var n = { '$тмц/заявка': row };
    if (!$ctrl.data) {
      $ctrl.Open({'@позиции тмц':[n]});
      //~ row['индекс позиции в тмц'] = 0;
    }
    else {
      var idx = $ctrl.data['@позиции тмц'].indexOf($ctrl.data['@позиции тмц'].filter(function(tmc){ return tmc['$тмц/заявка'].id == row.id }).shift());
      if(idx >= 0) {
        $ctrl.data['@позиции тмц'].splice(idx, 1);// убрать
        //~ row['индекс позиции в тмц'] = undefined;
      }
      else {
        $ctrl.data['@позиции тмц'].push(n);
        //~ row['индекс позиции в тмц'] = $ctrl.data['@позиции тмц'].length-1;
      }
    }
    $ctrl.data._success_save  = false;
  });
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param) $ctrl.param = {};
      $scope.param=$ctrl.param;
      $scope.nomenData = [];
      NomenData/*.Refresh(0)*/.Load(0).then(function(data){  Array.prototype.push.apply($scope.nomenData, data); });//$http.get(appRoutes.url_for('номенклатура/список', 0));
      $ctrl.ready = true;
      //~ $timeout(function(){ $('.modal', $($element[0])).modal(); });
    });
  };
  
  $ctrl.Open = function(data){// новая или редактирование
    if ($ctrl.data && $ctrl.data._open) return;
    if (data) $ctrl.data = $ctrl.InitForm(data);
    if (!$ctrl.data) $ctrl.data = $ctrl.InitForm();
    
    if (!$ctrl.data.id && !$ctrl.data['@позиции тмц'] || $ctrl.data['@позиции тмц'].length ===0/*$ctrl.data['@позиции тмц']*/ /*$ctrl.param['объект'].id !== 0*/) $ctrl.AddPos(true);
    $ctrl.data._open = true;
    $timeout(function(){
        $('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $ctrl.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
        
        if (!Util.isElementInViewport($element[0])) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        //~ if(!param || !param['не прокручивать']) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea', $($element[0])).keydown();
        //~ if($ctrl.param['перемещение']) 
        $('.modal', $($element[0])).modal();///условия для костыля $ctrl.OpenConfirmDelete
        
      });
  };

  $ctrl.InitForm = function(data){
    if(!data) data = {};
    if (!data['дата1']) data['дата1'] = Util.DateISO(0);
    return data;
    
  };
  
  $ctrl.InitRow = function(row, index){//строку тмц
    //~ console.log("InitRow", row);
    row.nomen = {selectedItem: {id: row['номенклатура/id'] }, };
  }
  
  $ctrl.FilterValidPos = function(row){///override
    var data = this;
    var nomen = $ctrl.FilterValidPosNomen(row);
    var kol = $ctrl.FilterValidPosKol(row);
    return nomen && kol;
  };


  $ctrl.Save = function(data){
    if(!data) {// проверка
      data = $ctrl.data;
      if(!data["@позиции тмц"].length) return false;
      return data['дата1']
        && $ctrl.ValidPos(data);
    }
    data['объект/id'] = $ctrl.param["объект"].id;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerHttp = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/склад/сохранить инвентаризацию'), data/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green fw500');
          //~ $ctrl.ready = false;
          //~ window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', angular.copy(resp.data.success));
          ///обновить номенклатуру и контрагентов
          $scope.nomenData.length = 0;
          NomenData.Refresh(0).Load(0).then(function(data){  Array.prototype.push.apply($scope.nomenData, data); });
          //~ ContragentData.RefreshData().Load().then(function(){ $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success); });
        }
        
        console.log("Сохранено:", resp.data);
      });
  };
  
  $ctrl.OpenConfirmDelete = function(){
    if (!$ctrl.param['перемещение']) 
      $timeout(function(){ $('#modal-confirm-remove').modal().modal('open'); });///жесткий костыль, не всегда срабатывает модал
    
  };
  
  $ctrl.Delete = function(data){
    data = data || $ctrl.data;
    data['объект/id'] = $ctrl.param["объект"].id;
    
    $ctrl.cancelerHttp = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/склад/удалить инвентаризацию'), data/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500');
        }
        else if(resp.data.remove) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Успешно удалено', 2000, 'green fw500');
          $rootScope.$broadcast('Удалена инвентаризация ТМЦ', data);///resp.data.remove
        }
        
        console.log("Удалено поставка/перемещение:", resp.data);
        $('#modal-confirm-remove').modal('close');///еще к костылю
      });
    
    
  };
  
  $ctrl.ClearAddress = function(){
    $ctrl.data['адрес отгрузки'] = undefined;
  };
  

  
};

/*=============================================================*/

module

.component('tmcSkladInvForm', {
  templateUrl: "tmc/sklad-inv-form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());