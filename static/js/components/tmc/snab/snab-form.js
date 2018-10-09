(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для снабженца
*/
var moduleName = "ТМЦ снабжение форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem', 'ContragentItem',  'TransportAskContact', 'Объект или адрес', 'Util', 'TMCFormLib', 'Номенклатура', 'ТМЦ снабжение']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, TMCSnabData, Util, TMCFormLib, $Номенклатура, $Контрагенты) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  new TMCFormLib($ctrl, $scope, $element);
  
  $scope.$on('Редактировать заявку ТМЦ снабжения', function(event, ask, param){
    $ctrl.Cancel();
    if(param) $scope.param=$ctrl.param = param;
    $timeout(function(){ $ctrl.Open(ask); });
    
  });
  
  $scope.$on('Добавить/убрать позицию ТМЦ в заявку снабжения', function(event, row){
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
      // для промежуточной базы фильтровать некоторые объекты
      $scope.paramBase1={"фильтр объектов": function(item){ return [90152, 4169].some(function(id){ return item.id == id; }); }, "placeholder": 'указать склад', 'без проекта': true, 'inputClass4Object': 'blue-text text-darken-3'};
      $ctrl['@номенклатура'] = [];
      $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){  Array.prototype.push.apply($ctrl['@номенклатура'], data); });//$http.get(appRoutes.url_for('номенклатура/список', 0));
      $ctrl.ready = true;
      //~ $timeout(function(){ $('.modal', $($element[0])).modal(); });
    });
  };
  
  $ctrl.Open = function(data){// новая или редактирование
    if ($ctrl.data && $ctrl.data._open) return;
    if (data) $ctrl.data = /*$ctrl.data['перемещение'] ? TMCSnabData.InitMoveForm(data) :*/ TMCSnabData.InitForm(data);
    if (!$ctrl.data) $ctrl.data = /*$ctrl.data['перемещение'] ? TMCSnabData.InitMoveForm() :*/ TMCSnabData.InitForm();
    if (!$ctrl.data.id && !$ctrl.data['@позиции тмц'] || $ctrl.data['@позиции тмц'].length ===0/*$ctrl.data['@позиции тмц']*/ /*$ctrl.param['объект'].id !== 0*/) $ctrl.AddPos(true);
    //~ if ($ctrl.data['без транспорта'] === null || $ctrl.data['без транспорта'] === undefined)  $ctrl.data['без транспорта']=true;
    //~ if ($ctrl.data['без транспорта'] ) $ctrl.data['без транспорта'] = true;
    $ctrl.data._open = true;
    //~ $ctrl.data._success_save = false;
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
        
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        $ctrl.StopWatchAddress1 = $ctrl.WatchAddress1();
      });
  };

  
  $ctrl.OnSelectContragent4 = function(item){//грузоотправитель
    var idx = item && item['индекс в массиве'];
    var addressParam = $ctrl.data.addressParam[idx] || {"контрагенты": []};
    //~ 
    $ctrl.data.addressParam[idx] = undefined;
    $ctrl.data.contact4Param[idx] = undefined;//передернуть компонент
    $timeout(function(){
      $ctrl.data.contact4Param[idx] = {"контрагент": item, "контакт":"грузоотправитель"}; //контакт4
      addressParam["контрагенты"].length = 0;
      addressParam["контрагенты"].push(item);
      //~ console.log("OnSelectContragent4", addressParam);
      $ctrl.data.addressParam[idx] = addressParam;
    }, 100);
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
    if($ctrl.data['перемещение']) return;
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
  
  $ctrl.OnSelectAddress = function(adr, param){
    //~ console.log("OnSelectAddress", adr, param);
    
    if(adr && adr.id) {
      $ctrl.data.contragent4[param['индекс1 в массиве']] = adr['$контрагент']; 
      $timeout(function(){
        $ctrl.OnSelectContragent4(adr['$контрагент']);
        //~ $ctrl.data['перемещение'] = $ctrl.data.address1.some(function(a1){ return a1.some(function(a2){ return !!a2.id; }); });
      });
    }
      
  };
  
  $ctrl.OnChangeAddress = function(item, param){///отловить переключение поставка/перемещение
    $timeout(function(){
        //~ $ctrl.data['перемещение'] = $ctrl.data.address1.some(function(a1){ return a1.some(function(a2){ return !!a2.id; }); });
      });
    
  };
  
  $ctrl.OnFocusBase1 = function(ctrl){//возврат из компонента object-address для промежуточной базы
    //~ console.log("OnFocusBase1", ctrl.data, ctrl.ToggleListBtn);
    if(!ctrl.data.title) ctrl.ToggleListBtn();
    
  };
  
  $ctrl.InitRow = function(row, index){//строку тмц
    //~ console.log("InitRow", row);
    row['дата1'] = row['дата1'] || row['$тмц/заявка'] && row['$тмц/заявка']['дата1'];
    row['$объект'] = row['$объект'] || row['$тмц/заявка']['$объект'] || {};
    row.nomen = {selectedItem: {id: row['номенклатура/id'] || row['$тмц/заявка'] && row['$тмц/заявка']['номенклатура/id'] }, };
    row['количество'] = row['количество'] || row['$тмц/заявка']['количество'];
    if (row['цена']) row['сумма'] = (parseFloat(Util.numeric(row['цена']))*parseFloat(Util.numeric(row['количество']))).toLocaleString();
    if (row['$тмц/заявка'] && row['$тмц/заявка']['тмц/количество'] ) row['количество'] -= row['$тмц/заявка']['тмц/количество'];
    
    $timeout(function(){
      $('table.tmc input.datepicker', $($element[0])).eq(index).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
    });
  }
  


  $ctrl.Save = function(ask){
    if(!ask) {// проверка
      ask = $ctrl.data;
      if(!ask["@позиции тмц"].length) return false;
      return ask['дата1']
        && ask.contragent4.filter(function(item){ return item && item.id || item.title; }).length
        && $ctrl.ValidAddress1()//ask.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
        && $ctrl.ValidPos(ask);
    }
    ask['объект/id'] = $ctrl.param["объект"].id;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerHttp = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/снаб/сохранить заявку'), ask/*, {timeout: $ctrl.cancelerHttp.promise}*/)
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
          
          ///обновить номенклатуру и контрагентов
          $ctrl['@номенклатура'].length = 0;
          $Номенклатура.Refresh(0).Load(0).then(function(data){  Array.prototype.push.apply($ctrl['@номенклатура'], data); });
          $Контрагенты.RefreshData().Load().then(function(){ $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success); });
        }
        
        console.log("Сохранено поставка/перемещение:", resp.data);
      });
  };
  
  $ctrl.OpenConfirmDelete = function(){
    if (!$ctrl.param['перемещение']) 
      $timeout(function(){ $('#modal-confirm-remove').modal().modal('open'); });///жесткий костыль, не всегда срабатывает модал
    
  };
  
  $ctrl.Delete = function(ask){
    ask = ask || $ctrl.data;
    ask['объект/id'] = $ctrl.param["объект"].id;
    
    $ctrl.cancelerHttp = 1;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/снаб/удалить'), ask/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500');
        }
        else if(resp.data.remove) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Удалено успешно', 2000, 'green fw500');
          $rootScope.$broadcast('Удалено поставка/перемещение ТМЦ', ask.id);///resp.data.remove
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

.component('tmcSnabForm', {
  templateUrl: "tmc/snab/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());