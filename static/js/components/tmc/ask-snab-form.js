(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для снабженца
*/

var moduleName = "TMCAskSnabForm";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem',  'TransportAskContact', 'Объект или адрес', 'Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $timeout, $http, $element, $q, appRoutes, TMCAskSnabData, Util) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    $scope.nomenData = $http.get(appRoutes.url_for('номенклатура/список', 0));
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        if (newValue /*&& !newValue._success_save*/ && !newValue._open) {
          //~ console.log("watch edit newValue", newValue);
          $ctrl.Open(newValue);
        }
        //~ else {
          //~ $ctrl.data = undefined;
        //~ }
        //~ else console.log("watch edit oldValue", oldValue);
      }
    );
    
  };
  $ctrl.Open = function(data){// новая или редактирование
    if(data) $ctrl.data = data;
    else $ctrl.data = TMCAskSnabData.InitAskForm();//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    $ctrl.param.edit = $ctrl.data;
    $ctrl.data._open = true;
    //~ $ctrl.data._success_save = false;
    $timeout(function(){
        $('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          //~ setData: function(val){ $ctrl.data['дата1'] = val;},
          //~ setDataField: ,
          //~ row_idx: $index,
          onSet: function(context){ var s = this.component.item.select; $ctrl.data['дата1'] = [s.year, s.month+1, s.date].join('-'); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
        
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
        
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        $ctrl.StopWatchAddress1 = $ctrl.WatchAddress1();
      });
  };
  $ctrl.Cancel = function(){
    if($ctrl.StopWatchAddress1) $ctrl.StopWatchAddress1();
    if($ctrl.data) $ctrl.data['позиции'].map(function(it){it['обработка']=false;});
    $ctrl.data=undefined;
    $scope.ask = undefined;
    //~ if(!save_param) 
    $ctrl.param.edit = undefined;
  };
  $ctrl.InitAsk = function(){
    $scope.ask = $ctrl.data;
    
  };
  $ctrl.InitRow = function(row, $index){
    //~ console.log("InitDate1", row);
    row.nomen={selectedItem:{id:row['номенклатура/id']}};
    if (!row.id) {
      //~ row['объект/id']=$ctrl.param['объект'].id;
      row['дата1'] = Util.dateISO(2);// два дня вперед
      $timeout(function(){
        $('#row-index-'+$index+' .datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          formatSkipYear: true,
          onSet: function(context){ var s = this.component.item.select; row['дата1'] = [s.year, s.month+1, s.date].join('-'); },
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
      });
      
    } else {
      row['количество'] = (row['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      row['цена'] = (row['цена'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
      
    }
    
  };
  /*$ctrl.SetDate = function (context) {// переформат
    //~ console.log("SetDate", this.component.settings, $(this._hidden).val());
    var d = $(this._hidden).val();
    var row = this.component.settings.setData;
    var key = this.component.settings.setDataField;
    //~ var row = $ctrl.data['позиции'][this.component.settings.row_idx];
    row[key] = d;
    //~ console.log("SetDate", row);
  };*/
  $ctrl.ChangeRow = function(row){
    //~ p '455.66.66.23' =~ s/(\.)(?=.*\1)//gr;
    //~ row['количество'] = parseFloat((row['количество'] || '').replace(/[,\-]/, '.'));//replace(/[^\d.,]/, '');
    //~ row['цена'] = parseFloat((row['цена'] || '').replace(/[,\-]/, '.'));
    row['количество'] = (row['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
    row['цена'] = (row['цена'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
    var k = parseFloat(Util.numeric(row['количество']));
    var c = parseFloat(Util.numeric(row['цена']));
    var s = Math.round(k*c*100)/100;
    if(s) row['сумма']=Util.money(s.toLocaleString('ru-RU'));//Util.money(s);
    //~ if(k) row['количество'] = Util.money(k.toLocaleString('ru-RU'));
    //~ if(c) row['цена'] = Util.money(c.toLocaleString('ru-RU'));
    
  };
  /*
  $ctrl.OnSelectContragent = function(it){
    //~ console.log("OnSelectContragent", it);
    if(!$ctrl.addressField) $ctrl.addressField = $('input[name="адрес отгрузки"]', $($element[0]));
    if (!$ctrl.addressComplete) $ctrl.addressComplete = [];
    $ctrl.addressComplete.length = 0;
    if(!it) return $ctrl.addressField.autocomplete().dispose();
    
    $http.get(appRoutes.url_for('тмц/снаб/адреса отгрузки', it.id)).then(function(resp){
      if (resp.data.error) return  Materialize.toast(resp.data.error, 3000, 'red');
      
      if (resp.data.length == 1 && !($ctrl.data["адрес отгрузки"] && $ctrl.data["адрес отгрузки"].length)) {
        $ctrl.data["адрес отгрузки"] = resp.data[0];
        //~ return;
      }
      
      resp.data.forEach(function(val) {
            //~ if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = val.title;
            $ctrl.addressComplete.push({value: val, data:val});
          });
      
      $ctrl.addressField.autocomplete({
      lookup: $ctrl.addressComplete,
      appendTo: $ctrl.addressField.parent(),
      
      });
    });
    
  };
  var event_hide_list = function(event){
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = $ctrl.addressField.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_list);});
    return false;
  };
  $ctrl.ToggleAddressList = function(){
    var ac = $ctrl.addressField.autocomplete();
    ac.toggleAll();
    if(ac.visible) $timeout(function(){$(document).on('click', event_hide_list);});
  };*/
  
  $ctrl.OnSelectContragent4 = function(item){//грузоотправитель
    var idx = item && item['индекс в массиве'];
    $ctrl.data.contact4Param[idx] = undefined;//передернуть компонент
    var addressParam = $ctrl.data.addressParam[idx];
    $ctrl.data.addressParam[idx] = undefined;
    $timeout(function(){
      $ctrl.data.contact4Param[idx] = {"контрагент": $ctrl.data.contragent4[idx], "контакт":"грузоотправитель"};//контакт4
      addressParam["контрагенты"].length = 0;
      addressParam["контрагенты"].push($ctrl.data.contragent4[idx]);
      $ctrl.data.addressParam[idx] = addressParam;
    });
  };
  $ctrl.PushContragent4 = function(){// еще грузоотправитель
    var data = $ctrl.data;
    data.contragent4.push({"id": undefined});
    data.contragent4Param.push({});
    data.contact4.push({"title":  '', "phone": ''});
    data.contact4Param.push({"контрагент": data.contragent4[data.contragent4.length-1], "контакт":"грузоотправитель"});
    data.address1.push([{"title":  '',}]);// на каждого контрагента своя пачка адресов
    var addressParam = angular.copy(data.addressParam[0]);
    addressParam["контрагенты"].length = 0;
    data.addressParam.push(addressParam);
  };
  $ctrl.SpliceContragent4 = function(idx){
    var data = $ctrl.data;
    data.contragent4.splice(idx, 1);
    data.contragent4Param.splice(idx, 1);
    data.contact4.splice(idx, 1);
    data.contact4Param.splice(idx, 1);
    data.address1.splice(idx, 1);
    data.addressParam.splice(idx, 1);
  };
  var new_address = {title:''};
  var watch_address = function(newValue, oldValue) {
    //~ console.log(" WatchAddress ", newValue, oldValue);
    // в массиве адресов найти индексы эл-тов с пустыми title
    var emp = newValue.filter(function(arr){
      var emp2 = arr/*сначала проиндексировать*//*.map(function(it, idx){ var ti = angular.copy(it); ti._idx = idx; return ti; })*/.filter(function(it){ return !it.title; });
      //~ console.log(" WatchAddress ", emp2);
      if (emp2.length > 1) arr.splice(arr.indexOf(emp2.shift()), 1);
      //~ else if (emp2.length == 1 && )
      else if (emp2.length === 0) arr.push(angular.copy(new_address));
      
      return arr.every(function(it){ return !it.title; });
      
    });
    // если два эл-та - один почикать
    //~ if (emp.length > 1) newValue.splice(newValue.indexOf(emp.pop()), 1);
    // если нет пустых - добавить
    //~ else if (emp.length === 0 ) newValue.push([angular.copy(new_address)]);//, _idx: newValue.length
  };
  $ctrl.WatchAddress1 = function(){// куда
    var tm;
    return $scope.$watch(
      function(scope) { return $ctrl.data.address1; },
      function(newValue, oldValue) {
        if (tm) $timeout.cancel(tm);
        tm = $timeout(function(){
          tm = undefined;
          watch_address(newValue, oldValue);
        }, 500);
      },
      true// !!!!
    );
  };
  $ctrl.InitAddressParam = function(idx1, idx2){
    if (idx2 === 0) return $ctrl.data.addressParam[idx1];
    var addressParam = angular.copy($ctrl.data.addressParam[idx1]);
    addressParam.placeholder = 'еще адрес';
    return addressParam;
    
  };
  $ctrl.Address1Ok = function(idx) {
    return $ctrl.data.address1[idx].filter(function(it){ return !!it; }).length;
  };
  
  var filterValidPos = function(row){
    var id = row.nomen && row.nomen.selectedItem && row.nomen.selectedItem.id;
    var newNom = row.nomen && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title;
    var kol = parseInt(row["количество"]);
    var cena = parseInt(row["цена"]);
    //~ console.log("filterValidPos", this, id, newItem, row["количество"]);
    if(this) return !!id || !!newNom || !!kol || !!cena;
    return (!!id || !!newNom) & !!kol & !!cena;
  };
  $ctrl.Save = function(ask){
    if(!ask) {// проверка
      ask = $ctrl.data;
      //~ var edit = $ctrl.data["позиции"].filter(filterValidPos, true);
      if(!ask["позиции"].length) return false;
      var valid = ask["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return ask['дата1']
        && ask.contragent4.filter(function(item){ return item.id || item.title; }).length
        && ask.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
        && valid.length == ask["позиции"].length;//edit.length;
    }
    ask['объект'] = $ctrl.param["объект"].id;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/снаб/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        //~ console.log("Save", resp.data);
        if(resp.data.success) {
          //~ 
          //~ var edit = $ctrl.param.edit;
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green');
          //~ window.location.reload(false);// сложно
          window.location.href = window.location.pathname+'?id='+resp.data.success.id;
          //~ $rootScope.$broadcast('ТМЦ/снаб сохранена заявка', resp.data.success);
          //~ if(!edit.id) edit = resp.data.success;
          //~ edit._success_save = true;
          
        }
        console.log("Saved:", resp.data);
      });
  };
  
  $ctrl.ChangeKol=function($last, row){// автовставка новой строки
    if($last && row['количество']) $ctrl.AddPos(true);
  };
  
  $ctrl.DeleteRow = function($index){
    $ctrl.data['позиции'][$index]['обработка'] = false;
    $ctrl.data['позиции'][$index]['связь/тмц/снаб'] = undefined;
    $ctrl.data['позиции'][$index]['тмц/снаб/id'] = undefined;
    $ctrl.data['позиции'].splice($index, 1);
    //~ console.log("DeleteRow", $ctrl.data['позиции'][$index]);
  };
  
  $ctrl.FocusRow000= function(row){
    //~ console.log("FocusRow", row);
    $ctrl.lastFocusRow = row;
  };
  $ctrl.AddPos = function(last){// last - в конец
    var n = {"номенклатура":{}};
    if(last || !$ctrl.lastFocusRow) return $ctrl.data["позиции"].push(n);
    var index = 1000;
    if($ctrl.lastFocusRow) index = $ctrl.data['позиции'].indexOf($ctrl.lastFocusRow)+1;
    $ctrl.data['позиции'].splice(index, 0, n);
  };
  
  $ctrl.ClearAddress = function(){
    $ctrl.data['адрес отгрузки'] = undefined;
  };

  
};

/*=============================================================*/

module

.component('tmcAskSnabForm', {
  templateUrl: "tmc/ask/snab/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());