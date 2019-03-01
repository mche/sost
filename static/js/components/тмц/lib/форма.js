(function () {'use strict';
/*
  общие методы для формы ТМЦ с позициями
  USAGE:
  var parentCtrl = new $TMCFormLib($c, $scope, $element);
*/
var moduleName = "TMCFormLib";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ /*'Util', */ 'Номенклатура', ]);

var Lib = function($timeout, $window , /*$http, *$compile,*/ appRoutes, Util, $Номенклатура) {// factory
  
return function /*конструктор*/($c, $scope, $element){
  $scope.$element = $element;
  
  //~ console.log('$TMCFormLib конструктор', angular.copy(this));
  
  const FilterAskRow = function(tmc){ return tmc['$тмц/заявка'].id == this.id; };
  
  $scope.$on('Добавить/убрать позицию ТМЦ в форму', function(event, row){
    if (!$c.__data) $c.__data = {};
    if (!$c.__data['@позиции тмц']) $c.__data['@позиции тмц'] = [];
    var n = { '$тмц/заявка': row };
    //~ if (!$c.data)      $c.Open({'@позиции тмц':[n]});
    //~ else {
      var idx = $c.__data['@позиции тмц'].indexOf($c.__data['@позиции тмц'].filter(FilterAskRow, row).shift());
      if(idx >= 0) {/// убрать
        $c.__data['@позиции тмц'].splice(idx, 1);
        Materialize.toast('Заявка удалена из списка закупки/перемещения', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp fast');
      }
      else {
        $c.__data['@позиции тмц'].push(n);
        Materialize.toast('Заявка добавлена в список закупки/перемещения', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp fast');
      }
  });
  
  this.NomenData = function(refresh){
    if (!$c['@номенклатура']) $c['@номенклатура'] = [];
    $c['@номенклатура'].splice(0, $c['@номенклатура'].length);
    if (!$c.$Номенклатура ) $c.$Номенклатура = $Номенклатура;
    if (refresh) $Номенклатура.Refresh(0);
    return $Номенклатура.Load(0).then(function(data){
      Array.prototype.push.apply($c['@номенклатура'], $Номенклатура.Data());
    });
  };
  
  this.Cancel = function(event){///event - просто флаг анимации
    if ($c.param.modal)   $('.modal', $($element[0])).first().modal('close');
    if ($c._param) {///восстановить прежние параметры
      $c.param = $scope.param= $c._param;
      $c._param = undefined;
    }
    if (event) {
      $('.card:first', $element[0]).removeClass('animated').addClass('animated zoomOut');
      
      $timeout(function(){
        $c.Cancel();
      }, 500);///для анимации
      return;
    }
    
    //~ if($c.StopWatchAddress1) $c.StopWatchAddress1();
    //~ if($c.data && $c.data['@позиции тмц']) $c.data['@позиции тмц'].map(function(it){ if(it['$тмц/заявка']) it['$тмц/заявка']['обработка']=false;});
    //~ if (!$c.data.id) $c.data.address1=[];
    
    var data = $c.data;
    $c.data=undefined;
    if ($c.onCancel) $timeout(function(){ $c.onCancel({data: data}); });
    
  };
  
  this.InitData = function(data){
    //~ console.log("InitData", angular.copy(data));
    $c.error = undefined;
    if(!data) data = {};
    //~ data.contragent={id:data['контрагент/id']};
    data["дата1"] = new Date(data['дата1'] || Date.now()),// || Util.dateISO(0),
    data["дата1формат"] = $c.DateFormat(data["дата1"]);
    data["дата1"] = Util.dateISO(0, data["дата1"]);
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
    if (/*!data.id && */$c.param['перемещение'] || data['перемещение']) data.address1 = [[ {id: (data['$с объекта'] && data['$с объекта'].id) || $c.param['объект'].id} ]];
    
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
    //~ data['перемещение'] = $c.param['перемещение'];
    //~ console.log("InitForm", data);
    return data;
  };
  
  this.DateFormat = function(date){
    if (!date) return;
    return dateFns.format(date ? new Date(date) : new Date(), 'ytt dd, D MMMM YYYY', {locale: dateFns.locale_ru});
    
  }
  this.FocusPickerDate = function(elem){
    if ($(elem).data('pickadate')) return;
    $(elem).data('value', $c.data['дата1']);
    
    $timeout(function(){
      $(elem).pickadate({
        clear: '',
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $c.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
      });
      
    });
    
  };
  
  this.OnSelectAddress = function(adr, param){
    //~ console.log("OnSelectAddress", adr, param);
    
    if(adr && adr.id) {///объект
      $c.data.contragent4[param['индекс1 в массиве']] = adr['$контрагент']; 
      if (!$c.param['перемещение']) $timeout(function(){
        $c.OnSelectContragent4(adr['$контрагент']);
        //~ $c.data['перемещение'] = $c.data.address1.some(function(a1){ return a1.some(function(a2){ return !!a2.id; }); });
      });
    }
      
  };
  
  var new_address = {title:''};
  this.OnChangeAddress = function(item, param){///отловить переключение поставка/перемещение
    //~ console.log("OnChangeAddress", item, param);
    if ($c.param['перемещение']) return;
    //~ $timeout(function(){
        //~ $c.data['перемещение'] = $c.data.address1.some(function(a1){ return a1.some(function(a2){ return !!a2.id; }); });
      //~ });
    // в массиве адресов найти индексы эл-тов с пустыми title
    var emp = $c.data.address1.filter(function(arr){
      var emp2 = arr.filter(function(it){ return !it.title; });///сначала проиндексировать*//*.map(function(it, idx){ var ti = angular.copy(it); ti._idx = idx; return ti; })
      //~ console.log(" WatchAddress ", emp2);
      if (emp2.length > 1) arr.splice(arr.indexOf(emp2.shift()), 1);
      //~ else if (emp2.length == 1 && )
      else if (emp2.length === 0) arr.push(angular.copy(new_address));
      
      return arr.every(function(it){ return !it.title; });
      
    });
    // если два эл-та - один почикать
    if (emp.length > 1) $c.data.address1.splice($c.data.address1.indexOf(emp.pop()), 1);
    // если нет пустых - добавить
    else if (emp.length === 0 ) $c.data.address1.push([angular.copy(new_address)]);
    
  };
  
  this.InitRow = function(row, $index){
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
  
  this.DatePickerRow = function(id, row){
    $timeout(function(){ 
      $('#'+id, $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          formatSkipYear: true,
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },
          //~ min: $c.data.id ? undefined : new Date()
          //~ editable: $c.data.transport ? false : true
        });//{closeOnSelect: true,}
    });
  };
  
  this.EditNomenRow = function(row, bool){///bool - 
    //~ OK if (row['количество/принято']) return;
    if (row['номенклатура/не изменять']) return;
    
    var toggle = bool || !row.nomen._edit;
    /**/ row.nomen._edit = undefined; /*});*/
    $timeout(function(){ row.nomen._edit = toggle; delete row.ts;/*иногда нужно*/ });
    
  };

  var timeoutChangeSum;
  this.ChangeSum = function(row){
    if (timeoutChangeSum) $timeout.cancel(timeoutChangeSum);
    timeoutChangeSum = $timeout(function(){
      timeoutChangeSum = undefined;
      row['количество'] = parseFloat(Util.numeric(row['количество'] || ''));//(row['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      row['цена'] = parseFloat(Util.numeric(row['цена'] || ''));//(row['цена'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      var s = Math.round(row['количество']*row['цена']*100)/100;
      if(s) row['сумма']= s.toLocaleString('ru-RU');//Util.money(s);
      
    }, 1500);
    
  };
  
  this.ChangeKol=function($last, row){// автовставка новой строки
    //~ if($last && row['количество']) $c.AddPos();
    $c.ChangeSum(row);
  };
  
  this.DeleteRow = function($index){
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
  this.AddPos = function(idx, data){// индекс вставки, если undefined или -1 - вставка в конец
    
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
  
  this.FilterPos  = function(row){
    return !row._refresh;
  };
  
  const AllPos2Object = function(row){
    if (row['$тмц/заявка'] && row['$тмц/заявка'].id ) return;
    var item = this;
    row['$объект'].id = item.id;
    row['$объект']._refresh = true;
    $timeout(function(){ delete row['$объект']._refresh; });
  };
  ///колбак из <object-address>
  this.AllPos2Object = function(item, param){///все строки позиций на один объект
    //~ console.log("AllPos2Object", item, $c.data["@позиции тмц"]);
    if (!item) return;
    $timeout(function(){ $c.data["@позиции тмц"].map(AllPos2Object, item); });
  };

  this.FilterValidPosDate1 = function(row){
    return !(row['$тмц/заявка'] && row['$тмц/заявка'].id) || !!row['дата1'];
  };
  this.FilterValidPosObject = function(row){
    return row["$объект"] && !!row['$объект'].id;
  };
  
  const FilterNotNull = function(it){ return Object.prototype.toString.call(it) == "[object Object]" ? !!it.title : !!it; };
  
  this.FilterValidPosNomen = function(row){///обязательно иметь корень
    var nomen = row.nomen;
    if (!nomen) return false;
    var selItem = nomen.selectedItem;
    var finalItem = selItem && selItem.id && !(selItem.childs && selItem.childs.length);
    if (finalItem) return true; ///конечный элемент дерева пусть
    var nomenOldLevels = (selItem && selItem.id && ((selItem.parents_id && selItem.parents_id.filter(FilterNotNull).length) + 1 )) || 0;
    var nomenNewLevels = (nomen.newItems && nomen.newItems && nomen.newItems.filter(FilterNotNull).length) || 0;
    //~ console.log("FilterValidPosNomen", nomenOldLevels, nomenNewLevels, nomen);
    return nomenOldLevels && (nomenOldLevels+nomenNewLevels) >= 4;/// 4 уровня
  };
  
  this.FilterValidPosKol = function(row){
    return !!Util.numeric(row["количество"]);
  };
  this.FilterValidPosCena = function(row){
    return /*!(row['$тмц/заявка'] && row['$тмц/заявка'].id) || */ !!Util.numeric(row["цена"]);
  };
  this.FilterValidPos = function(row){
    var data = this;
    var date1 = !!data['перемещение'] || $c.FilterValidPosDate1(row);
    var object = $c.FilterValidPosObject(row);
    var nomen = $c.FilterValidPosNomen(row);
    var kol = $c.FilterValidPosKol(row);
    var cena = !!data['перемещение'] || $c.FilterValidPosCena(row);
    return date1 && object && nomen && kol && cena;
  };
  /*** Валидация по количеству пустых полей не пошла. а сравнение заполненных с заявленными - ИДЕТ! ***/
  this.ValidDate1 = function(data) {
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPosDate1);///.length == data["@позиции тмц"].length;
  };
  this.ValidObject = function(data) {
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPosObject);///.length == data["@позиции тмц"].length;
  };
  this.ValidNomen = function(data){
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPosNomen);///.length == data["@позиции тмц"].length;
  };
  this.ValidKol = function(data){
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPosKol);///.length == data["@позиции тмц"].length;
  };
  this.ValidCena = function(data){
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPosCena);///.length == data["@позиции тмц"].length;
  };
  this.ValidPos = function(data){
    if (!data["@позиции тмц"].length) return false;
    return data["@позиции тмц"].every($c.FilterValidPos, data);///.length == data["@позиции тмц"].length;
  };
  
  this.ValidAddress1 = function(){
    //~ return $c.data.address1[idx].filter(function(it){ return !!it; }).length;
    return $c.data.address1.some(function(arr){ return arr.some(function(it){ return $c.data['перемещение'] ? !!it.id : /*!!it.title*/ $c.data['без транспорта']; }); }); // адрес!
  };
  
  this.Copy = function(data) {
    //~ data._copy_id = data.id;
    var copy = angular.copy(data);
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
  
  this.InitAddressParam = function(objOrAddr, idx1, idx2){
    //~ if ($c.data.addressParam[idx1]) return $c.data.addressParam[idx1];
    var param= $c.data.addressParam[idx1] || {};///этот парам может уст в OnSelectContragent4
    //~ if(!$c.data.addressParam[idx1]) $c.data.addressParam[idx1] = param;
    //~ var param = {};
    param['индекс1 в массиве'] = idx1;
    param['без объектов'] = !$c.data['перемещение'];
    param['только объекты'] = $c.data['перемещение'];
    param.inputClass4Object = param.autocompleteClass4Object = 'blue-text text-darken-4';
    //~ if (idx2 === 0) return param;
    //~ $c.data.addressParam[idx1] = angular.copy(param);
    param.placeholder = $c.data['перемещение'] ? ' выбрать из списка' : 'указать адрес (строки)';
    if ($c.param['объект'].id && objOrAddr && objOrAddr.id == $c.param['объект'].id) param['не изменять'] = !0;
    //~ console.log('InitAddressParam', param, objOrAddr);
    //~ $c.data.addressParam[idx1] = param;
    return param;
    
  };
  
  this.PrintDocx = function(event){
    if(!event) return $c.Valid();///проверка
    
    //~ $c.Save(event, true).then(function(data){
      //~ if(data.success) 
    $timeout(function(){
      window.location.href = appRoutes.url_for('тмц/накладная.docx', $c.data.id);
      //~ $window.open(appRoutes.url_for('тмц/накладная.docx', $c.data.id), '_blank');
    });
  };
  
  
  const WindowScoll = function(event){
    if ($c.windowScroll) $timeout.cancel($c.windowScroll);
    $c.windowScroll = $timeout(function(){
      var pos = $($element[0]).offset();
      if (window.pageYOffset >= (pos.top -200)) $c['кнопка открытия формы'] = 'fixed';///
      else $c['кнопка открытия формы'] = 'absolute';
      //~ console.log("WindowScoll "+$c['кнопка открытия формы'],  window.pageYOffset, pos);
    }, 100);
    
      
  };
  this.EventWindowScroll = function(){
    $(window).on('scroll', WindowScoll);
    
  };
  
  $scope.$on('$destroy', function() {
    //~ console.log("$destroy:  $(window).off('scroll', WindowScoll);");
    $(window).off('scroll', WindowScoll);
  });
  
  angular.extend($c, this);


  //~ return Lib;
  return this;
};

};
  
/**********************************************************************/
module

.factory('$TMCFormLib', Lib)
;

}());
