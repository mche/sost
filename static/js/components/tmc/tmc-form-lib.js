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
    if($ctrl.data) $ctrl.data['$позиции тмц'].map(function(it){it['$тмц/заявка']['обработка']=false;});
    $ctrl.data=undefined;
    $scope.ask = undefined;
  };
  $ctrl.InitAsk = function(ask){
    //~ console.log("InitAsk", $ctrl.data);
    $scope.ask = ask || $ctrl.data;
    
  };
  $ctrl.InitRow = function(row, $index){
    row['номенклатура/id'] = row['номенклатура/id'] || row['$тмц/заявка']['номенклатура/id'];
    row['наименование'] = row['наименование'] || row['$тмц/заявка']['наименование']
    row.nomen={selectedItem:{id:row['номенклатура/id']}, newItems:[{title: row['номенклатура/id'] ? '' : row['наименование']}]};
    row['количество'] = row['количество'] || row['$тмц/заявка']['количество'];
    row['$объект'] = row['$объект'] || row['$тмц/заявка']['$объект'] || {};
    if (!row['$объект'].id && $ctrl.param['объект'] && $ctrl.param['объект'].id && !($ctrl.data['$с объекта'] && $ctrl.data['$с объекта'].id == $ctrl.param['объект'].id) ) row['$объект'].id = $ctrl.param['объект'].id;
    row['дата1'] = row['дата1'] || row['$тмц/заявка']['дата1'] || Util.dateISO(2);// два дня вперед
      $timeout(function(){
        $('#row-index-'+$index+' .datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          formatSkipYear: true,
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
      });
    //~ console.log("InitRow", row);
    $ctrl.ChangeSum(row);
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
    $ctrl.data['$позиции тмц'][$index]['$тмц/заявка']['обработка'] = false;
    //~ $ctrl.data['позиции тмц'][$index]['связь/тмц/снаб'] = undefined;
    //~ $ctrl.data['позиции тмц'][$index]['тмц/снаб/id'] = undefined;
    //~ $ctrl.data['$позиции тмц'][$index]['$тмц/заявка']['индекс позиции в тмц'] = undefined;
    $ctrl.data['$позиции тмц'].splice($index, 1);
    
    //~ console.log("DeleteRow", $ctrl.data['позиции'][$index]);
  };
  
  /*$ctrl.FocusRow000= function(row){
    //~ console.log("FocusRow", row);
    $ctrl.lastFocusRow = row;
  };*/
  $ctrl.AddPos = function(last){// last - в конец
    var n = {"номенклатура":{}, "$тмц/заявка":{}};
    if(!$ctrl.data["$позиции тмц"]) $ctrl.data["$позиции тмц"] = [];
    var lastRow = $ctrl.data["$позиции тмц"][$ctrl.data["$позиции тмц"].length-1];
    //~ console.log("lastRow", lastRow);
    if (lastRow) {
      n['дата1'] = Util.dateISO(0, new Date(lastRow['дата1']));
      if (lastRow['$объект'] && lastRow['$объект'].id) n['$объект'] = angular.copy(lastRow['$объект']);
    }
    /*if(last || !$ctrl.lastFocusRow) return*/
    $ctrl.data["$позиции тмц"].push(n);
    //~ var index = 1000;
    //~ if($ctrl.lastFocusRow) index = $ctrl.data['$позиции тмц'].indexOf($ctrl.lastFocusRow)+1;
    //~ $ctrl.data['$позиции тмц'].splice(index, 0, n);
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
    return !!Util.numeric(row["цена"]);
  };
  $ctrl.FilterValidPos = function(row){
    var object = $ctrl.FilterValidPosObject(row);
    var nomen = $ctrl.FilterValidPosNomen(row);
    var kol = $ctrl.FilterValidPosKol(row);
    var cena = $ctrl.FilterValidPosCena(row);
    return object && nomen && kol && cena;
  };
  /*** Валидация по количеству пустых полей не пошла. а сравнение заполненных с заявленными - ИДЕТ! ***/
  $ctrl.ValidObject = function(ask) {
    return ask["$позиции тмц"].filter($ctrl.FilterValidPosObject).length == ask["$позиции тмц"].length;
  };
  $ctrl.ValidNomen = function(ask){
    return ask["$позиции тмц"].filter($ctrl.FilterValidPosNomen).length == ask["$позиции тмц"].length;
  };
  $ctrl.ValidKol = function(ask){
    return ask["$позиции тмц"].filter($ctrl.FilterValidPosKol).length == ask["$позиции тмц"].length;
  };
  $ctrl.ValidCena = function(ask){
    return ask["$позиции тмц"].filter($ctrl.FilterValidPosCena).length == ask["$позиции тмц"].length;
  };
  $ctrl.ValidPos = function(ask){
    return ask["$позиции тмц"].filter($ctrl.FilterValidPos).length == ask["$позиции тмц"].length;
  };
  
};

//~ return Constr;
};
  
/**********************************************************************/
module

.factory(moduleName, Lib)
;

}());
