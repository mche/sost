(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ снабжение форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem',  'TransportAskContact', 'Объект или адрес', 'Util', 'TMCFormLib', 'Номенклатура',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $timeout, $http, $element, $q, appRoutes, TMCSnabData, Util, TMCFormLib, NomenData) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  new TMCFormLib($ctrl, $scope, $element);
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    // для промежуточной базы фильтровать некоторые объекты
    $scope.paramBase1={"фильтр объектов": function(item){ return [90152, 4169].some(function(id){ return item.id == id; }); }, "placeholder": 'указать базу', 'без проекта': true,};
    $scope.nomenData = NomenData.Load(0)//$http.get(appRoutes.url_for('номенклатура/список', 0));
    $ctrl.ready = true;
    
    $scope.$on('Редактировать заявку ТМЦ снабжения', function(event, ask){
      $ctrl.Cancel();
      $timeout(function(){ $ctrl.Open(ask); });
      
    });
    
    $scope.$on('Добавить/убрать позицию ТМЦ в заявку снабжения', function(event, row){
      var n = {'$тмц/заявка': row};
      if (!$ctrl.data) {
        $ctrl.Open({'$позиции тмц':[n]});
        //~ row['индекс позиции в тмц'] = 0;
      }
      else {
        var idx = $ctrl.data['$позиции тмц'].indexOf($ctrl.data['$позиции тмц'].filter(function(tmc){ return tmc['$тмц/заявка'] === row }).shift());
        if(idx >= 0) {
          $ctrl.data['$позиции тмц'].splice(idx, 1);// убрать
          //~ row['индекс позиции в тмц'] = undefined;
        }
        else {
          $ctrl.data['$позиции тмц'].push(n);
          //~ row['индекс позиции в тмц'] = $ctrl.data['$позиции тмц'].length-1;
        }
      }
      $ctrl.data._success_save  = false;
    });
    
  };
  $ctrl.Open = function(data){// новая или редактирование
    if($ctrl.data && $ctrl.data._open) return;
    if(data) $ctrl.data = TMCSnabData.InitAskForm(data);
    if(!$ctrl.data) $ctrl.data = TMCSnabData.InitAskForm();
    if(!$ctrl.data.id && !$ctrl.data['$позиции тмц'] || $ctrl.data['$позиции тмц'].length ===0/*$ctrl.data['$позиции тмц']*/ /*$ctrl.param['объект'].id !== 0*/) $ctrl.AddPos(true);
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
        
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
        
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        $ctrl.StopWatchAddress1 = $ctrl.WatchAddress1();
      });
  };

  
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
  
  $ctrl.OnFocusBase1 = function(ctrl){//возврат из компонента object-address для промежуточной базы
    //~ console.log("OnFocusBase1", ctrl.data, ctrl.ToggleListBtn);
    if(!ctrl.data.title) ctrl.ToggleListBtn();
    
  };
  
  $ctrl.ValidAddress1 = function(){
    //~ return $ctrl.data.address1[idx].filter(function(it){ return !!it; }).length;
    return $ctrl.data.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
  };

  $ctrl.Save = function(ask){
    if(!ask) {// проверка
      ask = $ctrl.data;
      if(!ask["$позиции тмц"].length) return false;
      return ask['дата1']
        && ask.contragent4.filter(function(item){ return item.id || item.title; }).length
        && $ctrl.ValidAddress1()//ask.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
        && $ctrl.ValidPos(ask);
    }
    ask['объект'] = $ctrl.param["объект"].id;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/снаб/сохранить заявку'), ask/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3');
        }
        //~ console.log("Save", resp.data);
        else if(resp.data.success) {
          $ctrl.Cancel();//$ctrl.data = undefined;
          Materialize.toast('Сохранено успешно', 2000, 'green');
          $ctrl.ready = false;
          window.location.href = window.location.pathname+'?id='+resp.data.success.id;
        }
        console.log("Saved:", resp.data);
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