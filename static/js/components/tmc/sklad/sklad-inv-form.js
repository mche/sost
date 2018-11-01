(function () {'use strict';
/*
  Форма инвентаризации ТМЦ на складе
*/

var moduleName = "ТМЦ форма инвентаризации";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem',  'Util', 'TMCFormLib', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, $TMCFormLib, $Номенклатура) {
  var $c = this;
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  $scope.Util = Util;
  
  new $TMCFormLib($c, $scope, $element);
  
  $scope.$on('Редактировать инвентаризацию ТМЦ', function(event, data){
    //~ console.log("Редактировать инвентаризацию ТМЦ", data);
    $c.Cancel();
    //~ if(param) $scope.param=$c.param = param;
    $timeout(function(){ $c.Open(data); });
    
  });
  
  $scope.$on('Добавить/убрать позицию ТМЦ в инвентаризацию', function(event, row){
    //~ console.log("Добавить/убрать позицию ТМЦ в заявку снабжения", row);
    var n = { '$тмц/заявка': row };
    if (!$c.data) {
      $c.Open({'@позиции тмц':[n]});
      //~ row['индекс позиции в тмц'] = 0;
    }
    else {
      var idx = $c.data['@позиции тмц'].indexOf($c.data['@позиции тмц'].filter(function(tmc){ return tmc['$тмц/заявка'].id == row.id; }).shift());
      if(idx >= 0) {
        $c.data['@позиции тмц'].splice(idx, 1);// убрать
        //~ row['индекс позиции в тмц'] = undefined;
      }
      else {
        $c.data['@позиции тмц'].push(n);
        //~ row['индекс позиции в тмц'] = $c.data['@позиции тмц'].length-1;
      }
    }
    $c.data._success_save  = false;
  });
  
  $c.$onInit = function(){
    $timeout(function(){
      if(!$c.param) $c.param = {};
      $scope.param=$c.param;
      //~ $c['@номенклатура'] = [];
      $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){
        /*Array.prototype.push.apply($c['@номенклатура'], data);*/ 
        $c['@номенклатура'] = $Номенклатура.Data();
        $c.ready = true;
      });//$http.get(appRoutes.url_for('номенклатура/список', 0));
      
      //~ $timeout(function(){ $('.modal', $($element[0])).modal(); });
    });
  };
  
  $c.Open = function(data){// новая или редактирование
    //~ if ($c.data) return;
    if (data) $c.data = $c.InitForm(data);
    if (!$c.data) $c.data = $c.InitForm();
    
    if (!$c.data.id && !$c.data['@позиции тмц'] || $c.data['@позиции тмц'].length ===0/*$c.data['@позиции тмц']*/ /*$c.param['объект'].id !== 0*/) $c.AddPos(true);
    //~ $c.data._open = true;
    $timeout(function(){
        $('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $c.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
          //~ min: $c.data.id ? undefined : new Date()
          //~ editable: $c.data.transport ? false : true
        });//{closeOnSelect: true,}
        
        if (!Util.isElementInViewport($element[0])) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        //~ if(!param || !param['не прокручивать']) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea', $($element[0])).keydown();
        //~ if($c.param['перемещение']) 
        $('.modal', $($element[0])).modal();///условия для костыля $c.OpenConfirmDelete
        
      });
  };

  $c.InitForm = function(data){
    if(!data) data = {};
    if (!data['дата1']) data['дата1'] = Util.DateISO(0);
    if (data.id) $c.AddPos(undefined, data);
    data['$объект'] = {id: data['объект/id']};
    return data;
    
  };
  
  $c.InitRow = function(row, index){//строку тмц
    //~ console.log("InitRow", row);
    row.nomen = {selectedItem: {id: row['номенклатура/id'] }, };
  };
  ///override
  $c.FilterValidPos = function(row){/// - 
    var data = this;
    var nomen = $c.FilterValidPosNomen(row);
    var kol = $c.FilterValidPosKol(row);
    return nomen && kol;
  };
  
  $c.ChangeRow=function(row){///отобразить элемент сохранения
    //~ delete row.ts;
    $c.EditNomenRow(row, true);
  };
  
  ///построчное сохранение
  $c.SaveAddPos = function(row, idx) {///$index
    //~ return console.log("SaveAddPos");
    if(!$c.FilterValidPos(row)) return;
    //~ row['тмц/инвентаризация/id'] = $c.data.id;
    //~ row['тмц/инвентаризация/дата1'] = $c.data['дата1'];
    //~ row['тмц/инвентаризация/объект/id']=$c.param["объект"].id || $c.data['объект/id'];
    //~ row['тмц/инвентаризация/коммент']=$c.data['коммент'];
    
    row.cancelerSave = 1;
    delete row.error;
    $http.post(appRoutes.url_for('тмц/склад/сохранить позицию инвентаризации'), row/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        row.cancelerSave = undefined;
        if(resp.data.error) {
          row.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
        }
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          var idx = $c.data['@позиции тмц'].indexOf(row);
          $c.data['@позиции тмц'].splice(idx, 1);///сначала удалить
          $Номенклатура.Refresh().Load().then(function(){
            resp.data.success['$номенклатура'] = $Номенклатура.$Data()[resp.data.success['номенклатура/id']];
            $c.data['@позиции тмц'].splice(idx, 0, resp.data.success);///потом поставить
            //~ if ($c.data['@позиции тмц'].filter($c.FilterPos).length == idx+1 ) $c.AddPos(idx+1);
            });
          
          //~ if (resp.data.success['$тмц/инвентаризация']) Object.keys(resp.data.success['$тмц/инвентаризация']).map(function(key){ $c.data[key]=resp.data.success['$тмц/инвентаризация'][key]; });
          
        }
      });
    
  };
  
  $c.DeleteRow = function(row, idx){
    if (!row.id) return $c.data['@позиции тмц'].splice(idx, 1);
    row.cancelerDelete = 1;
    delete row.error;
    $http.post(appRoutes.url_for('тмц/склад/удалить позицию инвентаризации'), row/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        row.cancelerDelete = undefined;
        if(resp.data.error) {
          row.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'left red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
        }
        else if(resp.data.remove) {
          Materialize.toast('Удалено успешно', 3000, 'left green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          $c.data['@позиции тмц'].splice(idx, 1);
        }
      });
    
  };
  
  ///override
  $c.ValidNomen = function(data){///во всех строках
    return data["@позиции тмц"].every(function(row){ if (!row.nomen ) { return false;} else return !row.nomen._edit || $c.FilterValidPosNomen(row); });
    
  };

  $c.Valid = function(){///для полного сохранения
    
    var data = $c.data;
    if(!data["@позиции тмц"].length) return false;
    return data['дата1']
      &&  data['$объект'].id
      //~ && !data["@позиции тмц"].some(function(row){ return (row.id && !row.ts)/*старые поз не сохр потом новая*/ || (!row.id && ((row.nomen.selectedItem && row.nomen.selectedItem.id) || (row.nomen.newItems && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title)) /*&& !$c.FilterValidPosNomen(row)*/ ); }); //&& $c.ValidPos(data);
     && !data["@позиции тмц"].some(function(row){ return  !row.ts /*|| !$c.FilterValidPos(row)*/; }); //&& $c.ValidPos(data);
  };

  $c.Save = function() {///целиком долго
    //~ return console.log("Save");
    var data = $c.data;
    //~ data['объект/id'] = data['объект/id'] || $c.param["объект"].id;
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerSave = 1;
    delete $c.error;
    
    $http.post(appRoutes.url_for('тмц/склад/сохранить инвентаризацию'), data/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        $c.cancelerSave = undefined;
        if(resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 7000, 'center red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 3000, 'center green-text text-darken-3 green lighten-3 fw500 animated zoomInUp slow');
          //~ $c.Cancel2(resp.data.success);//$c.data = undefined;
          //~ $c.ready = false;
          //~ window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', angular.copy(resp.data.success));
          $c.Cancel(1);
          ///обновить номенклатуру и контрагентов
          //~ $c['@номенклатура'].length = 0;
          //$Номенклатура.Refresh(0);//.Load(0).then(function(data){  Array.prototype.push.apply($c['@номенклатура'], data); });
          //~ $Контрагенты.RefreshData().Load().then(function(){ $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success); });
        }
        
        console.log("Сохранено:", resp.data);
      });
  };
  
  var isRowEdit = function(row){ return !!row._edit; };
  /// кнопка Готово
  $c.Close = function(data){
    if(!data) {// проверка
      data = $c.data;
      if(!data["@позиции тмц"].length) return false;
      return data["@позиции тмц"].some(isRowEdit);
    }
    $c.Cancel2();
    
  };
  
  //~ var isRowSaved = function(row){ return !!row.id; };
  ///доп действия перед $c.Cancel
  $c.Cancel2 = function(data){
    data = angular.copy(data || $c.data);
    var i = data["@позиции тмц"].length;
    while (i--) {///почикать пустые
      if (!data["@позиции тмц"][i].ts)  data["@позиции тмц"].splice(i, 1);///ts - позиция создана/сохранена
    }
    if (data["@позиции тмц"].length ) {///&& data["@позиции тмц"].some(isRowSaved)
      $rootScope.$broadcast('Сохранена инвентаризация ТМЦ', data);
    } else if (data.id) return Materialize.toast("Указать позиции ТМЦ!", 5000, ' red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
    
    $c.Cancel();
    
  };
  
  /*$c.OpenConfirmDelete = function(){
    if (!$c.param['перемещение']) 
      $timeout(function(){ $('#modal-confirm-remove').modal().modal('open'); });///жесткий костыль, не всегда срабатывает модал
    
  };*/
  
  $c.Delete = function(data){
    data = data || $c.data;
    //~ data['объект/id'] = $c.param["объект"].id;
    
    $c.cancelerHttp = 1;
    delete $c.error;
    
    $http.post(appRoutes.url_for('тмц/склад/удалить инвентаризацию'), data/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        $c.cancelerHttp = undefined;
        if(resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500 animated zoomInUp slow');
        }
        else if(resp.data.remove) {
          $c.Cancel(2);//$c.data = undefined;
          Materialize.toast('Успешно удалено', 2000, 'green-text text-darken-3 green lighten-3 fw500 animated zoomInUp slow');
          $rootScope.$broadcast('Удалена инвентаризация ТМЦ', data);///resp.data.remove
        }
        
        console.log("Удалено:", resp.data);
        //~ $('#modal-confirm-remove').modal('close');///еще к костылю
      });
    
    
  };
  
  $c.ClearAddress = function(){
    $c.data['адрес отгрузки'] = undefined;
  };
  

  
};

/*=============================================================*/

module

.component('tmcSkladInvForm', {
  controllerAs: '$c',
  templateUrl: "tmc/sklad-inv-form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());