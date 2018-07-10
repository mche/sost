(function () {'use strict';
/*
  общие методы для формы ТМЦ с позициями
  USAGE:
  new TMCFormLib($ctrl, $scope, $element);
  без присвоения нового объекта
*/
var moduleName = "TMCFormLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes',*/ 'Util']);

var Lib = function($timeout, /*$http, $compile, appRoutes, */Util) {// factory
  
return function /*конструктор*/($ctrl, $scope, $element){
  
  
  $ctrl.Cancel = function(){
    if($ctrl.StopWatchAddress1) $ctrl.StopWatchAddress1();
    if($ctrl.data && $ctrl.data['@позиции тмц']) $ctrl.data['@позиции тмц'].map(function(it){ if(it['$тмц/заявка']) it['$тмц/заявка']['обработка']=false;});
    $ctrl.data=undefined;
    $scope.ask = undefined;
    $scope.$element = $element;
  };
  
  $ctrl.InitAsk = function(ask){
    $scope.ask = ask || $ctrl.data;
    $scope.ask['перемещение'] = $ctrl.param['перемещение'];
    return $scope.ask;
  };
  
  $ctrl.InitRow = function(row, $index){
    //~ console.log("InitRow", row);
    row['номенклатура/id'] = row['номенклатура/id'] || row['$тмц/заявка'] && row['$тмц/заявка']['номенклатура/id'];
    //~ row['номенклатура'] = row['номенклатура'] || row['$тмц/заявка']['наименование']
    row.nomen={selectedItem:{id:row['номенклатура/id']}, newItems:[{title: row['номенклатура/id'] ? '' : row['$тмц/заявка'] && row['$тмц/заявка']['наименование']}]};
    row['количество'] = row['количество'] || (row['$тмц/заявка'] && row['$тмц/заявка']['количество']);
    row['$объект'] = row['$объект'] || (row['$тмц/заявка'] && row['$тмц/заявка']['$объект']) || {};
    if (!row['$объект'].id && $ctrl.param['объект'] && $ctrl.param['объект'].id && !($ctrl.data['$с объекта'] && $ctrl.data['$с объекта'].id == $ctrl.param['объект'].id) ) row['$объект'].id = $ctrl.param['объект'].id;
    row['дата1'] = row['дата1'] || (row['$тмц/заявка'] && row['$тмц/заявка']['дата1']) || Util.dateISO(2);// два дня вперед
    $ctrl.DatePickerRow('row-index-'+$index+' .datepicker', row);
    //~ console.log("InitRow", row);
    $ctrl.ChangeSum(row);
  };
  
  $ctrl.DatePickerRow = function(id, row){
    $timeout(function(){ 
      $('#'+id, $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          formatSkipYear: true,
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
    });
  };
  
  $ctrl.EditNomenRow = function(row){
    /*$timeout(function(){*/ row._nomenEdit = true; /*});*/
    
  };

  var timeoutChangeSum;
  $ctrl.ChangeSum = function(row){
    if (timeoutChangeSum) $timeout.cancel(timeoutChangeSum);
    timeoutChangeSum = $timeout(function(){
      timeoutChangeSum = undefined;
      row['количество'] = parseFloat(Util.numeric(row['количество'] || ''));//(row['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      row['цена'] = parseFloat(Util.numeric(row['цена'] || ''));//(row['цена'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      var s = Math.round(row['количество']*row['цена']*100)/100;
      if(s) row['сумма']= s.toLocaleString('ru-RU');//Util.money(s);
      
    }, 1500);
    
  };
  
  $ctrl.ChangeKol=function($last, row){// автовставка новой строки
    //~ if($last && row['количество']) $ctrl.AddPos();
    $ctrl.ChangeSum(row);
  };
  
  $ctrl.DeleteRow = function($index){
    if($ctrl.data['@позиции тмц'][$index]['$тмц/заявка']) $ctrl.data['@позиции тмц'][$index]['$тмц/заявка']['обработка'] = false;
    //~ $ctrl.data['позиции тмц'][$index]['связь/тмц/снаб'] = undefined;
    //~ $ctrl.data['позиции тмц'][$index]['тмц/снаб/id'] = undefined;
    //~ $ctrl.data['@позиции тмц'][$index]['$тмц/заявка']['индекс позиции в тмц'] = undefined;
    $ctrl.data['@позиции тмц'].splice($index, 1);
    
    //~ console.log("DeleteRow", $ctrl.data['позиции'][$index]);
  };
  
  /*$ctrl.FocusRow000= function(row){
    //~ console.log("FocusRow", row);
    $ctrl.lastFocusRow = row;
  };*/
  $ctrl.AddPos = function(last){// last - в конец
    var n = {"номенклатура":{}, "$тмц/заявка":{}};
    if(!$ctrl.data["@позиции тмц"]) $ctrl.data["@позиции тмц"] = [];
    var lastRow = $ctrl.data["@позиции тмц"][$ctrl.data["@позиции тмц"].length-1];
    //~ console.log("lastRow", lastRow);
    if (lastRow) {
      if (lastRow['дата1']) n['дата1'] = Util.dateISO(0, new Date(lastRow['дата1']/* || Date.now()*/));
      if (lastRow['$объект'] && lastRow['$объект'].id) n['$объект'] = angular.copy(lastRow['$объект']);
    }
    //~ else n['дата1'] = Util.dateISO(0);
    /*if(last || !$ctrl.lastFocusRow) return*/
    $ctrl.data["@позиции тмц"].push(n);
    //~ var index = 1000;
    //~ if($ctrl.lastFocusRow) index = $ctrl.data['@позиции тмц'].indexOf($ctrl.lastFocusRow)+1;
    //~ $ctrl.data['@позиции тмц'].splice(index, 0, n);
  };
  
  $ctrl.FilterValidPosDate1 = function(row){
    return !(row['$тмц/заявка'] && row['$тмц/заявка'].id) || !!row['дата1'];
  };
  $ctrl.FilterValidPosObject = function(row){
    return row["$объект"] && !!row['$объект'].id;
  };
  $ctrl.FilterValidPosNomen = function(row){
    var id = row.nomen && row.nomen.selectedItem && row.nomen.selectedItem.id;
    var n = row.nomen && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title;
    return  !!id || !!n;
  };
  $ctrl.FilterValidPosKol = function(row){
    return !!Util.numeric(row["количество"]);
  };
  $ctrl.FilterValidPosCena = function(row){
    return /*!(row['$тмц/заявка'] && row['$тмц/заявка'].id) || */ !!Util.numeric(row["цена"]);
  };
  $ctrl.FilterValidPos = function(row){
    var ask = this;
    var date1 = !!ask['перемещение'] || $ctrl.FilterValidPosDate1(row);
    var object = $ctrl.FilterValidPosObject(row);
    var nomen = $ctrl.FilterValidPosNomen(row);
    var kol = $ctrl.FilterValidPosKol(row);
    var cena = !!ask['перемещение'] || $ctrl.FilterValidPosCena(row);
    return date1 && object && nomen && kol && cena;
  };
  /*** Валидация по количеству пустых полей не пошла. а сравнение заполненных с заявленными - ИДЕТ! ***/
  $ctrl.ValidDate1 = function(ask) {
    return ask["@позиции тмц"].filter($ctrl.FilterValidPosDate1).length == ask["@позиции тмц"].length;
  };
  $ctrl.ValidObject = function(ask) {
    return ask["@позиции тмц"].filter($ctrl.FilterValidPosObject).length == ask["@позиции тмц"].length;
  };
  $ctrl.ValidNomen = function(ask){
    return ask["@позиции тмц"].filter($ctrl.FilterValidPosNomen).length == ask["@позиции тмц"].length;
  };
  $ctrl.ValidKol = function(ask){
    return ask["@позиции тмц"].filter($ctrl.FilterValidPosKol).length == ask["@позиции тмц"].length;
  };
  $ctrl.ValidCena = function(ask){
    return ask["@позиции тмц"].filter($ctrl.FilterValidPosCena).length == ask["@позиции тмц"].length;
  };
  $ctrl.ValidPos = function(ask){
    return ask["@позиции тмц"].filter($ctrl.FilterValidPos, ask).length == ask["@позиции тмц"].length;
  };
  
  
  

  return Lib;
};

//~ return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
