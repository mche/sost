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
  $scope.$element = $element;
  
  $ctrl.Cancel = function(event){
    
    if (event) {
      $('.card.animated:first', $element[0]).removeClass('zoomIn').addClass('zoomOut');
      $timeout(function(){
        $ctrl.Cancel();
      }, 400);
      return;
    }
    
    if($ctrl.StopWatchAddress1) $ctrl.StopWatchAddress1();
    if($ctrl.data && $ctrl.data['@позиции тмц']) $ctrl.data['@позиции тмц'].map(function(it){ if(it['$тмц/заявка']) it['$тмц/заявка']['обработка']=false;});
    $ctrl.data=undefined;
    $scope.ask = undefined;
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
  
  $ctrl.EditNomenRow = function(row, bool){///bool - 
    if (row['количество/принято']) return;
    var toggle = bool || !row.nomen._edit;
    /**/ row.nomen._edit = undefined; /*});*/
    $timeout(function(){ row.nomen._edit = toggle; delete row.ts;/*иногда нужно*/ });
    
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
  $ctrl.AddPos = function(idx, data){// индекс вставки, если undefined или -1 - вставка в конец
    
    if (!data) data = $ctrl.data;
    
    var n = {"номенклатура":{}, "$тмц/заявка":{}};
    if(!data["@позиции тмц"]) data["@позиции тмц"] = [];
    if (idx === undefined) idx = data["@позиции тмц"].length + 1;
    var prevRow = data["@позиции тмц"][ idx === 0 ? idx : (idx < 0 ? data["@позиции тмц"].length - idx : idx-1) ];
    if (prevRow) {
      //~ if (lastRow['дата1']) n['дата1'] = Util.dateISO(0, new Date(lastRow['дата1']));///|| Date.now()
      if (prevRow['$объект'] && prevRow['$объект'].id) n['$объект'] = angular.copy(prevRow['$объект']);
    }
    data['@позиции тмц'].splice(idx, 0, n);
  };
  
  $ctrl.FilterPos  = function(row){
    return !row._refresh;
    
  };
  
  var AllPos2Object = function(row){
    if (row['$тмц/заявка']) return;
    var item = this;
    row['$объект'].id = item.id;
    row['$объект']._refresh = true;
    $timeout(function(){ row['$объект']._refresh = undefined; });
  };
  $ctrl.AllPos2Object = function(item){///все строки позиций на один объект
    //~ console.log("AllPos2Object", item, $ctrl.data["@позиции тмц"]);
    if (!item) return;
    $timeout(function(){ $ctrl.data["@позиции тмц"].map(AllPos2Object, item); });
  };

  $ctrl.FilterValidPosDate1 = function(row){
    return !(row['$тмц/заявка'] && row['$тмц/заявка'].id) || !!row['дата1'];
  };
  $ctrl.FilterValidPosObject = function(row){
    return row["$объект"] && !!row['$объект'].id;
  };
                                                                             var FilterNotNull = function(id){ return !!id; };
  $ctrl.FilterValidPosNomen = function(row){///обязательно иметь корень
    //~ var id = row.nomen && row.nomen.selectedItem && row.nomen.selectedItem.id;
    //~ var n = row.nomen && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title;
    
    //~ return  !!id;// || !!n;
    var nomen = row.nomen;
    if (!nomen) return false;
    if (!nomen._edit) return true;
    var nomenOldLevels = (nomen.selectedItem && nomen.selectedItem.id && ((nomen.selectedItem.parents_id && nomen.selectedItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    var nomenNewLevels = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    return nomenOldLevels &&  (nomenOldLevels+nomenNewLevels) > 4;/// 4 уровня
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
  
  $ctrl.ValidAddress1 = function(){
    //~ return $ctrl.data.address1[idx].filter(function(it){ return !!it; }).length;
    return $ctrl.data.address1.some(function(arr){ return arr.some(function(it){ return $ctrl.data['перемещение'] ? !!it.id : /*!!it.title*/ $ctrl.data['без транспорта']; }); }) // адрес!
  };
  
  $ctrl.Copy = function(ask) {
    //~ ask._copy_id = ask.id;
    var copy = angular.copy(ask);
    copy.id = undefined;
    copy.uid = undefined;
    copy['номер'] = undefined;
    copy['снабженец'] = undefined;
    copy['с объекта'] = undefined;
    copy['на объект'] = undefined;
    copy['без транспорта'] = undefined;
    copy['это копия'] = true;
    copy['@позиции тмц'].map(function(row){
      row.id=undefined;
      row['$тмц/заявка'] = {};
      row['тмц/заявка/id'] = undefined;
      
    });
    //~ copy['черновик'] = undefined;
    //~ $ctrl.data=undefined;
    //~ $timeout(function(){ $ctrl.data=copy; });
    $ctrl.Cancel();
    $timeout(function(){ $ctrl.Open(copy); Materialize.toast('Это копия', 2000, 'green fw500'); });
    
  };
  
  $ctrl.InitAddressParam = function(ask, idx1, idx2, objOrAddr){
    var param= ask.addressParam[idx1] || {};
    if(!ask.addressParam[idx1]) ask.addressParam[idx1] = param;
    param['индекс1 в массиве'] = idx1;
    param['без объектов'] = !ask['перемещение'];
    param['только объекты'] = ask['перемещение'];
    param.inputClass4Object = 'orange-text text-darken-4';
    //~ if (idx2 === 0) return param;
    //~ $ctrl.data.addressParam[idx1] = angular.copy(param);
    param.placeholder = ask['перемещение'] ? ' выбрать из списка' : 'указать адрес (строки)';
    if ($ctrl.param['объект'].id && objOrAddr && objOrAddr.id == $ctrl.param['объект'].id) param['не изменять'] = !0;
    //~ console.log('InitAddressParam', param, objOrAddr);
    return param;
    
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
