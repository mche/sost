(function () {'use strict';
/*
  Форма инвентаризации ТМЦ на складе
*/

var moduleName = "ТМЦ форма инвентаризации";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem',  'Util', 'TMCFormLib', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, $TMCFormLib, $Номенклатура) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  $scope.Util = Util;
  
  new $TMCFormLib($ctrl, $scope, $element);
  
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
      //~ $ctrl['@номенклатура'] = [];
      $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){
        /*Array.prototype.push.apply($ctrl['@номенклатура'], data);*/ 
        $ctrl['@номенклатура'] = $Номенклатура.Data();
        $ctrl.ready = true;
      });//$http.get(appRoutes.url_for('номенклатура/список', 0));
      
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
    if (data.id) $ctrl.AddPos(undefined, data);
    return data;
    
  };
  
  $ctrl.InitRow = function(row, index){//строку тмц
    //~ console.log("InitRow", row);
    row.nomen = {selectedItem: {id: row['номенклатура/id'] }, };
  }
  ///override
  $ctrl.FilterValidPos = function(row){/// - 
    var data = this;
    var nomen = $ctrl.FilterValidPosNomen(row);
    var kol = $ctrl.FilterValidPosKol(row);
    return nomen && kol;
  };
  
  $ctrl.ChangeRow=function(row){///отобразить элемент сохранения
    //~ delete row.ts;
    $ctrl.EditNomenRow(row, true);
  };
  
  ///построчное сохранение
  $ctrl.SaveAddPos = function(row, idx) {///$index
    if(!$ctrl.FilterValidPos(row)) return;
    row['тмц/инвентаризация/id'] = $ctrl.data.id;
    row['тмц/инвентаризация/дата1'] = $ctrl.data['дата1'];
    row['тмц/инвентаризация/объект/id']=$ctrl.param["объект"].id || $ctrl.data['объект/id'];
    row['тмц/инвентаризация/коммент']=$ctrl.data['коммент'];
    
    row.cancelerSave = 1;
    delete row.error;
    $http.post(appRoutes.url_for('тмц/склад/сохранить позицию инвентаризации'), row/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        row.cancelerSave = undefined;
        if(resp.data.error) {
          row.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
        }
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          var idx = $ctrl.data['@позиции тмц'].indexOf(row);
          $ctrl.data['@позиции тмц'].splice(idx, 1);///сначала удалить
          $Номенклатура.Refresh().Load().then(function(){
            resp.data.success['$номенклатура'] = $Номенклатура.$Data()[resp.data.success['номенклатура/id']];
            $ctrl.data['@позиции тмц'].splice(idx, 0, resp.data.success);///потом поставить
            if ($ctrl.data['@позиции тмц'].filter($ctrl.FilterPos).length == idx+1 ) $ctrl.AddPos(idx+1);
            //~ $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', angular.copy($ctrl.data));
            });
          
          if (resp.data.success['$тмц/инвентаризация']) Object.keys(resp.data.success['$тмц/инвентаризация']).map(function(key){ $ctrl.data[key]=resp.data.success['$тмц/инвентаризация'][key] });
          //~  row.id=resp.data.success.id;
          //~ row['номенклатура/id'] = resp.data.success.id;
          
        }
      });
    
  };
  
  $ctrl.DeleteRow = function(row, idx){
    if (!row.id) return $ctrl.data['@позиции тмц'].splice(idx, 1);
    row.cancelerDelete = 1;
    delete row.error;
    $http.post(appRoutes.url_for('тмц/склад/удалить позицию инвентаризации'), row/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        row.cancelerDelete = undefined;
        if(resp.data.error) {
          row.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'left red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
        }
        else if(resp.data.remove) {
          Materialize.toast('Удалено успешно', 3000, 'left green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          $ctrl.data['@позиции тмц'].splice(idx, 1);
        }
      });
    
  };

  $ctrl.Valid = function(){
    var data = $ctrl.data;
    if(!data["@позиции тмц"].length) return false;
    return data['дата1']
        && !data["@позиции тмц"].some(function(row){ return (row.id && !row.ts)/*старые поз не сохр потом новая*/ || (!row.id && ((row.nomen.selectedItem && row.nomen.selectedItem.id) || (row.nomen.newItems && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title)) /*&& !$ctrl.FilterValidPosNomen(row)*/ ); }) //&& $ctrl.ValidPos(data);
  }

  $ctrl.Save = function() {///целиком долго
    var data = $ctrl.data;
    data['объект/id'] = data['объект/id'] || $ctrl.param["объект"].id;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerSave = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/склад/сохранить инвентаризацию'), data/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        $ctrl.cancelerSave = undefined;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'center red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 3000, 'center green-text text-darken-3 green lighten-3 fw500 animated zoomInUp slow');
          //~ $ctrl.Cancel2(resp.data.success);//$ctrl.data = undefined;
          //~ $ctrl.ready = false;
          //~ window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', angular.copy(resp.data.success));
          $ctrl.Cancel();
          ///обновить номенклатуру и контрагентов
          //~ $ctrl['@номенклатура'].length = 0;
          //$Номенклатура.Refresh(0);//.Load(0).then(function(data){  Array.prototype.push.apply($ctrl['@номенклатура'], data); });
          //~ $Контрагенты.RefreshData().Load().then(function(){ $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success); });
        }
        
        console.log("Сохранено:", resp.data);
      });
  };
  
  var isRowEdit = function(row){ return !!row._edit; };
  /// кнопка Готово
  $ctrl.Close = function(data){
    if(!data) {// проверка
      data = $ctrl.data;
      if(!data["@позиции тмц"].length) return false;
      return !!data["@позиции тмц"].some(isRowEdit);
    }
    $ctrl.Cancel2();
    
  };
  
  //~ var isRowSaved = function(row){ return !!row.id; };
  ///доп действия перед $ctrl.Cancel
  $ctrl.Cancel2 = function(data){
    data = angular.copy(data || $ctrl.data);
    var i = data["@позиции тмц"].length;
    while (i--) {///почикать пустые
      if (!data["@позиции тмц"][i].id)  data["@позиции тмц"].splice(i, 1);///id - позиция создана/сохранена
    }
    if (data["@позиции тмц"].length ) {///&& data["@позиции тмц"].some(isRowSaved)
      $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', data);
    } else if (data.id) return Materialize.toast("Указать позиции ТМЦ!", 5000, ' red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
    
    $ctrl.Cancel();
    
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
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
        }
        else if(resp.data.remove) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Успешно удалено', 2000, 'green-text text-darken-3 green lighten-3 fw500 animated zoomInUp slow');
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