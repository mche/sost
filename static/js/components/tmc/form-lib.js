(function () {'use strict';
/*
  общие методы для формы ТМЦ с позициями
  USAGE:
  new TMCFormLib($c, $scope, $element);
  без присвоения нового объекта
*/
var moduleName = "TMCFormLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'appRoutes',*/ 'Util']);

var Lib = function($timeout, $window , $http, /*$compile,*/ appRoutes, Util) {// factory
  
return function /*конструктор*/($c, $scope, $element){
  $scope.$element = $element;
  
  $c.Cancel = function(event){
    
    if (event) {
      $('.card.animated:first', $element[0]).removeClass('zoomIn').addClass('zoomOut');
      $timeout(function(){
        $c.Cancel();
      }, 400);
      return;
    }
    
    //~ if($c.StopWatchAddress1) $c.StopWatchAddress1();
    if($c.data && $c.data['@позиции тмц']) $c.data['@позиции тмц'].map(function(it){ if(it['$тмц/заявка']) it['$тмц/заявка']['обработка']=false;});
    //~ if (!$c.data.id) $c.data.address1=[];
    $c.data=undefined;
  };
  
  $c.InitData = function(data){
    //~ console.log("InitData", angular.copy(data));
    if(!data) data = {};
    //~ data.contragent={id:data['контрагент/id']};
    if(!data['@грузоотправители/id']) data['@грузоотправители/id']=[undefined];
    data.contragent4Param = [];
    data.contragent4 = data['@грузоотправители/id'].map(function(id, idx){//, "проект/id": data['заказчик/проект/id'], "проект": data['заказчик/проект']
      data.contragent4Param.push({});
      return {"id": id};
    });
    data.contact4Param = [];
    if(!data['контакты грузоотправителей']) data['контакты грузоотправителей'] = [[]];
    data.contact4 = data['контакты грузоотправителей'].map(function(item, idx){
      data.contact4Param.push({"контрагент": data.contragent4[idx], "контакт":"грузоотправитель"});//контакт4
      return {"title":  item[0], "phone": item[1]};
    });
    
    //~ console.log("InitAskForm", data['откуда']);
    if (!data['откуда']) data['откуда'] = '[[""]]';
    data['откуда'] = angular.isString(data['откуда']) ? JSON.parse(data['откуда']) : data['откуда'];
    if (data['откуда'].length === 0) data['откуда'].push(['']);
    data.address1 =  data['откуда'].map(function(arr){ return arr.map(function(title, idx){ return {id: (/^#(\d+)$/.exec(title) || [])[1], title: title, }; }); });
    
    
    if(!data['$на объект']) data['$на объект'] = {};
    /*if(data['$с объекта'] && data['$с объекта'].id)*/ 
    //~ data['перемещение'] = !!(data['$с объекта'] && data['$с объекта'].id);
    if (!data.id || $c.param['перемещение']) data.address1 = [[ {id: (data['$с объекта'] && data['$с объекта'].id) || $c.param['объект'].id} ]];
    
    //~ if(!data.address1) data.address1 = [[{}]];
    //~ data.addressParam = {"контрагенты": data.contragent4, "sql":{"only": 'откуда'}, "без объектов":true, placeholder:'адрес'};
    data.addressParam = [];
    data.address1.map(function(item, idx){
      data.addressParam.push({"контрагенты": [data.contragent4[idx]], "sql":{"column": 'откуда'},/* "без объектов":true,  placeholder: data['$с объекта'] ? 'объект' : 'адрес'*/});
    });
    
    
    //~ if((data['позиции'] && angular.isString(data['позиции'][0])) || (data['позиции тмц'] && angular.isString(data['позиции тмц'][0])))
      //~ data['позиции тмц'] = data['позиции'] = ((!!data['позиции'] && angular.isString(data['позиции'][0]) && data['позиции']) || (!!data['позиции тмц'] && angular.isString(data['позиции тмц'][0]) && data['позиции тмц'])).map(function(row){ return JSON.parse(row); });
    if(!data["@позиции тмц"]) data["@позиции тмц"] = [];
    //~ if(!data["$позиции заявок"]) data["$позиции заявок"] = [];
    //~ if(!data["дата1"]) data["дата1"]=Util.dateISO(1);//(new Date(d.setDate(d.getDate()+1))).toISOString().replace(/T.+/, '');
    data["без транспорта"] = !!data['без транспорта'] || data['без транспорта'] === null || data['без транспорта'] === undefined ? true : false;
    data['перемещение'] = $c.param['перемещение'];
    //~ console.log("InitAskForm", data);
    return data;
  };
  
  $c.InitRow = function(row, $index){
    row['номенклатура/id'] = row['номенклатура/id'] || row['$тмц/заявка'] && row['$тмц/заявка']['номенклатура/id'];
    //~ row['номенклатура'] = row['номенклатура'] || row['$тмц/заявка']['наименование']
    row.nomen={selectedItem:{id:row['номенклатура/id']}, newItems:[{title: row['номенклатура/id'] ? '' : row['$тмц/заявка'] && row['$тмц/заявка']['наименование']}]};
    row['количество'] = row['количество'] || (row['$тмц/заявка'] && row['$тмц/заявка']['количество']);
    row['$объект'] = row['$объект'] || (row['$тмц/заявка'] && row['$тмц/заявка']['$объект']) || {};
    //~ if (!row['$объект'].id )
    //~ if (!row['$объект'].id && $c.param['объект'] && $c.param['объект'].id && $c.data['$на объект'] && $c.data['$на объект'].id && !($c.data['$с объекта'] && $c.data['$с объекта'].id == $c.param['объект'].id) ) row['$объект'].id = ($c.data['$на объект'] && $c.data['$на объект'].id) || $c.param['объект'].id;
    row['дата1'] = row['дата1'] || (row['$тмц/заявка'] && row['$тмц/заявка']['дата1']) || Util.dateISO(2);// два дня вперед
    $c.DatePickerRow('row-index-'+$index+' .datepicker', row);
    $c.ChangeSum(row);
  };
  
  $c.DatePickerRow = function(id, row){
    $timeout(function(){ 
      $('#'+id, $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          formatSkipYear: true,
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },
          //~ min: $c.data.id ? undefined : new Date()
          //~ editable: $c.data.transport ? false : true
        });//{closeOnSelect: true,}
    });
  };
  
  $c.EditNomenRow = function(row, bool){///bool - 
    //~ OK if (row['количество/принято']) return;
    
    var toggle = bool || !row.nomen._edit;
    /**/ row.nomen._edit = undefined; /*});*/
    $timeout(function(){ row.nomen._edit = toggle; delete row.ts;/*иногда нужно*/ });
    
  };

  var timeoutChangeSum;
  $c.ChangeSum = function(row){
    if (timeoutChangeSum) $timeout.cancel(timeoutChangeSum);
    timeoutChangeSum = $timeout(function(){
      timeoutChangeSum = undefined;
      row['количество'] = parseFloat(Util.numeric(row['количество'] || ''));//(row['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      row['цена'] = parseFloat(Util.numeric(row['цена'] || ''));//(row['цена'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      var s = Math.round(row['количество']*row['цена']*100)/100;
      if(s) row['сумма']= s.toLocaleString('ru-RU');//Util.money(s);
      
    }, 1500);
    
  };
  
  $c.ChangeKol=function($last, row){// автовставка новой строки
    //~ if($last && row['количество']) $c.AddPos();
    $c.ChangeSum(row);
  };
  
  $c.DeleteRow = function($index){
    if($c.data['@позиции тмц'][$index]['$тмц/заявка']) $c.data['@позиции тмц'][$index]['$тмц/заявка']['обработка'] = false;
    //~ $c.data['позиции тмц'][$index]['связь/тмц/снаб'] = undefined;
    //~ $c.data['позиции тмц'][$index]['тмц/снаб/id'] = undefined;
    //~ $c.data['@позиции тмц'][$index]['$тмц/заявка']['индекс позиции в тмц'] = undefined;
    $c.data['@позиции тмц'].splice($index, 1);
    
    //~ console.log("DeleteRow", $c.data['позиции'][$index]);
  };
  
  /*$c.FocusRow000= function(row){
    //~ console.log("FocusRow", row);
    $c.lastFocusRow = row;
  };*/
  $c.AddPos = function(idx, data){// индекс вставки, если undefined или -1 - вставка в конец
    
    if (!data) data = $c.data;
    
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
  
  $c.FilterPos  = function(row){
    return !row._refresh;
  };
  
  var AllPos2Object = function(row){
    if (row['$тмц/заявка'] && row['$тмц/заявка'].id ) return;
    var item = this;
    row['$объект'].id = item.id;
    row['$объект']._refresh = true;
    $timeout(function(){ delete row['$объект']._refresh; });
  };
  ///колбак из <object-address>
  $c.AllPos2Object = function(item, param){///все строки позиций на один объект
    //~ console.log("AllPos2Object", item, $c.data["@позиции тмц"]);
    if (!item) return;
    $timeout(function(){ $c.data["@позиции тмц"].map(AllPos2Object, item); });
  };

  $c.FilterValidPosDate1 = function(row){
    return !(row['$тмц/заявка'] && row['$тмц/заявка'].id) || !!row['дата1'];
  };
  $c.FilterValidPosObject = function(row){
    return row["$объект"] && !!row['$объект'].id;
  };
                                                                             var FilterNotNull = function(id){ return !!id; };
  $c.FilterValidPosNomen = function(row){///обязательно иметь корень
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
  
  $c.FilterValidPosKol = function(row){
    return !!Util.numeric(row["количество"]);
  };
  $c.FilterValidPosCena = function(row){
    return /*!(row['$тмц/заявка'] && row['$тмц/заявка'].id) || */ !!Util.numeric(row["цена"]);
  };
  $c.FilterValidPos = function(row){
    var ask = this;
    var date1 = !!ask['перемещение'] || $c.FilterValidPosDate1(row);
    var object = $c.FilterValidPosObject(row);
    var nomen = $c.FilterValidPosNomen(row);
    var kol = $c.FilterValidPosKol(row);
    var cena = !!ask['перемещение'] || $c.FilterValidPosCena(row);
    return date1 && object && nomen && kol && cena;
  };
  /*** Валидация по количеству пустых полей не пошла. а сравнение заполненных с заявленными - ИДЕТ! ***/
  $c.ValidDate1 = function(ask) {
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPosDate1);///.length == ask["@позиции тмц"].length;
  };
  $c.ValidObject = function(ask) {
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPosObject);///.length == ask["@позиции тмц"].length;
  };
  $c.ValidNomen = function(ask){
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPosNomen);///.length == ask["@позиции тмц"].length;
  };
  $c.ValidKol = function(ask){
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPosKol);///.length == ask["@позиции тмц"].length;
  };
  $c.ValidCena = function(ask){
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPosCena);///.length == ask["@позиции тмц"].length;
  };
  $c.ValidPos = function(ask){
    if (!ask["@позиции тмц"].length) return false;
    return ask["@позиции тмц"].every($c.FilterValidPos, ask);///.length == ask["@позиции тмц"].length;
  };
  
  $c.ValidAddress1 = function(){
    //~ return $c.data.address1[idx].filter(function(it){ return !!it; }).length;
    return $c.data.address1.some(function(arr){ return arr.some(function(it){ return $c.data['перемещение'] ? !!it.id : /*!!it.title*/ $c.data['без транспорта']; }); }); // адрес!
  };
  
  $c.Copy = function(ask) {
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
    //~ $c.data=undefined;
    //~ $timeout(function(){ $c.data=copy; });
    $c.Cancel();
    $timeout(function(){ $c.Open(copy); Materialize.toast('Это копия', 2000, 'green fw500'); });
    
  };
  
  $c.InitAddressParam = function(objOrAddr, idx1, idx2){
    //~ if ($c.data.addressParam[idx1]) return $c.data.addressParam[idx1];
    var param= $c.data.addressParam[idx1] || {};///этот парам может уст в OnSelectContragent4
    //~ if(!$c.data.addressParam[idx1]) $c.data.addressParam[idx1] = param;
    //~ var param = {};
    param['индекс1 в массиве'] = idx1;
    param['без объектов'] = !$c.data['перемещение'];
    param['только объекты'] = $c.data['перемещение'];
    param.inputClass4Object = 'orange-text text-darken-4';
    //~ if (idx2 === 0) return param;
    //~ $c.data.addressParam[idx1] = angular.copy(param);
    param.placeholder = $c.data['перемещение'] ? ' выбрать из списка' : 'указать адрес (строки)';
    if ($c.param['объект'].id && objOrAddr && objOrAddr.id == $c.param['объект'].id) param['не изменять'] = !0;
    //~ console.log('InitAddressParam', param, objOrAddr);
    //~ $c.data.addressParam[idx1] = param;
    return param;
    
  };
  
  $c.PrintDocx = function(event){
    if(!event) return $c.Save();///проверка
    $c.Save(event, true).then(function(data){
      if(data.success) window.location.href = appRoutes.url_for('тмц/накладная.docx', $c.data.id);
      //~ $window.open(appRoutes.url_for('тмц/накладная.docx', $c.data.id), '_blank');
    });
    
    
  };
  


  return Lib;
};

};
  
/**********************************************************************/
module

.factory('$TMCFormLib', Lib)
;

}());
