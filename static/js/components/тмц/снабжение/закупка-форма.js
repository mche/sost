(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для снабженца
*/
var moduleName = "ТМЦ форма закупки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'TreeItem', 'ContragentItem',  'TransportAskContact', 'Объект или адрес', 'Util', 'ТМЦ форма',]);//'ngSanitize',, 'dndLists''ТМЦ снабжение'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, $ТМЦФорма,  $Контрагенты) {///TMCSnabData
  var $c = this;
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  new $ТМЦФорма($c, $scope, $element);
  
  $scope.$on('Редактировать закупку ТМЦ', function(event, ask, param){
    $c.Cancel();
    if (param) {
      $c._param = angular.copy($c.param);
      angular.extend($c.param, param);
    }
    //~ $timeout(function(){ 
      $c.Open(ask); ///});
    
  });
  
  $c.$onInit = function(){
    $timeout(function(){
      if(!$c.param) $c.param = {};
      //~ $c.param['перемещение'] = !1;///не тут
      $scope.param=$c.param;
      // для промежуточной базы фильтровать некоторые объекты
      $c.paramBase1={"фильтр объектов": function(item){ return [90152, 4169].some(function(id){ return item.id == id; }); }, "placeholder": 'указать склад', 'только объекты': true, 'без проекта': true, 'inputClass4Object': 'navy-text text-lighten-1', 'autocompleteClass4Object': 'navy-text text-lighten-1'};
      //~ $c['@номенклатура'] = [];
      //~ $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){  Array.prototype.push.apply($c['@номенклатура'], data); });//$http.get(appRoutes.url_for('номенклатура/список', 0));
      var async = [];
      async.push($c.NomenData());
      $q.all(async).then(function(){
        $c.ready = true;
        //~ $timeout(function(){ $('.modal', $($element[0])).modal(); });
        $c.EventWindowScroll();///для кнопки открытия формы
      });
      
    });
  };
  
  $c.Open = function(data){// новая или редактирование
    $c.param['закупка']=!0;
    $c.param['перемещение']=!1;
    $c.data = undefined;
    $timeout(function(){
      data = angular.copy(data) || {};
      $c.data = $c.InitData(data);
      if ($c.__data && $c.__data['@позиции тмц'] && $c.__data['@позиции тмц'].length) Array.prototype.push.apply($c.data['@позиции тмц'], $c.__data['@позиции тмц']);
      //~ $c.__data['@позиции тмц'].map(function(item){ $c.data['@позиции тмц'].push(item); });
      if (!$c.data.id && !$c.data['@позиции тмц'] || $c.data['@позиции тмц'].length ===0/*$c.data['@позиции тмц']*/ /*$c.param['объект'].id !== 0*/) $c.AddPos(true);
      $c.posNomenHasInstrument = $c.data["@позиции тмц"].some($c.IsNomenInstr);
      
      $c.data.contragent4.map(function(k, idx){
        if (k.id) {
          if (!$c.data.addressParam) $c.data.addressParam = [];
          $c.data.addressParam[idx] = {"контрагенты": [k]};
        }
      });
      
      if (!$c.data.id && $c.param['перемещение'] && $c.param['объект'].id) console.log('???');///$c.data['$с объекта'] = $c.param['объект'];
      

      $timeout(function(){
          /*$('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
            clear: '',
            formatSkipYear: true,// доп костыль - дописывать год при установке
            onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $c.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
            //~ min: $c.data.id ? undefined : new Date()
            //~ editable: $c.data.transport ? false : true
          });//{closeOnSelect: true,}
        */
          
          if (!Util.isElementInViewport($element[0])) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
          //~ if(!param || !param['не прокручивать']) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
          $('textarea', $($element[0])).keydown();
          //~ if($c.param['перемещение']) 
          $('.modal', $($element[0])).modal();///условия для костыля $c.OpenConfirmDelete
          if ($c.param.modal) $timeout(function(){ $('.card', $($element[0])).first().modal('open'); });
          //~ if($c.data && $c.data.contragent && $c.data.contragent.id) $c.OnSelectContragent($c.data.contragent);
          //~ $c.StopWatchAddress1 = $c.WatchAddress1();
        });
    });
  };

  
  $c.OnSelectContragent4 = function(item){//грузоотправитель
    var idx = item && item['индекс в массиве'];
    var addressParam = $c.data.addressParam[idx] || {"контрагенты": []};
    //~ 
    addressParam["контрагенты"].length = 0;
    if(item.id) addressParam["контрагенты"].push(item);
    $c.data.addressParam[idx] = undefined;
    $c.data.contact4Param[idx] = undefined;//передернуть компонент
    $timeout(function(){
      $c.data.contact4Param[idx] = {"контрагент": item, "контакт":"грузоотправитель"}; //контакт4
      
      
      //~ console.log("OnSelectContragent4", addressParam);
      //~ 
      $c.data.addressParam[idx] = addressParam;
    });
  };
  $c.PushContragent4 = function(){// еще грузоотправитель
    var data = $c.data;
    data.contragent4.push({"id": undefined});
    data.contragent4Param.push({});
    data.contact4.push({"title":  '', "phone": ''});
    data.contact4Param.push({"контрагент": data.contragent4[data.contragent4.length-1], "контакт":"грузоотправитель"});
    data.address1.push([{"title":  '',}]);// на каждого контрагента своя пачка адресов
    var addressParam = angular.copy(data.addressParam[0]);
    addressParam["контрагенты"].length = 0;
    data.addressParam.push(addressParam);
  };
  $c.SpliceContragent4 = function(idx){
    var data = $c.data;
    data.contragent4.splice(idx, 1);
    data.contragent4Param.splice(idx, 1);
    data.contact4.splice(idx, 1);
    data.contact4Param.splice(idx, 1);
    data.address1.splice(idx, 1);
    data.addressParam.splice(idx, 1);
  };
  
  
  var new_address = {title:''};
  /*var watch_address = function(newValue, oldValue) {
    //~ console.log(" WatchAddress ", newValue, oldValue);
    // в массиве адресов найти индексы эл-тов с пустыми title
    var emp = newValue.filter(function(arr){
      var emp2 = arr.filter(function(it){ return !it.title; });///сначала проиндексировать*//*.map(function(it, idx){ var ti = angular.copy(it); ti._idx = idx; return ti; })
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
  $c.WatchAddress1 = function(){// куда
    if($c.data['перемещение']) return;
    var tm;
    return $scope.$watch(
      function(scope) { return $c.data.address1; },
      function(newValue, oldValue) {
        if (tm) $timeout.cancel(tm);
        tm = $timeout(function(){
          tm = undefined;
          watch_address(newValue, oldValue);
        }, 500);
      },
      true// !!!!
    );
  };*/
  

  
  $c.OnFocusBase1 = function(ctrl){//возврат из компонента object-address для промежуточной базы
    //~ console.log("OnFocusBase1", ctrl.data, ctrl.ToggleListBtn);
    if(!ctrl.data.title) ctrl.ToggleListBtn();
    
  };
  
  $c.InitRow = function(row, index){//строку тмц
    //~ console.log("InitRow", row);
    row['дата1'] = row['дата1'] || (row['$тмц/заявка'] && row['$тмц/заявка']['дата1']);
    row['$объект'] = row['$объект'] || (row['$тмц/заявка'] && row['$тмц/заявка']['$объект']) || {id: $c.param['закупка на складе']};
    row.nomen = {selectedItem: {id: row['номенклатура/id'] || (row['$тмц/заявка'] && row['$тмц/заявка']['номенклатура/id']) }, /*newItems: (row['наименование'] || []).map(function(it){ return {title: it}; })*/ };
    row['количество'] = row['количество'] || (row['$тмц/заявка'] && row['$тмц/заявка']['количество']);
    if (row['цена']) row['сумма'] = (parseFloat(Util.numeric(row['цена']))*parseFloat(Util.numeric(row['количество']))).toLocaleString();
    if (row['$тмц/заявка'] && row['$тмц/заявка']['тмц/количество'] ) row['количество'] -= row['$тмц/заявка']['тмц/количество'];
    
    $timeout(function(){
      $('table.tmc input.datepicker', $($element[0])).eq(index).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function(context){ var s = this.component.item.select; $timeout(function(){ row['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
        //~ min: $c.data.id ? undefined : new Date()
        //~ editable: $c.data.transport ? false : true
      });//{closeOnSelect: true,}
    });
  };

  ///инструмент на СКЛАД
  $c.IsNomenInstr = function(row){
    //~ if (row['наименование'] && row['наименование'].length) return true;///снабженец не стал переделывать временное наименование
    var n = row.nomen && row.nomen.selectedItem; return n  && (n.id == 154997 || (n.parents_id && n.parents_id[0] == 154997));
  };
  $c.OnSelectItemNomen = function(item, param){
    console.log("OnSelectItemNomen", item);
    //~ if ($c.param['перемещение']) return;
    if ($c.param['закупка на складе']) return;
    //~ if (item.id == 154997 || (item.parents_id && item.parents_id[0] == 154997)) {///это инструмент
    $c.posNomenHasInstrument = $c.data["@позиции тмц"].some($c.IsNomenInstr);
    if ($c.posNomenHasInstrument && !($c.data['$на объект'] && $c.data['$на объект'].id)) 
      Materialize.toast('<sup class="chip red white-text" style="padding:0.5rem;"></sup>Инструмент закупается обязательно через склад Фоминская!', 3000, 'navy-text text-darken-1 navy lighten-5 fw500 border animated zoomInUp fast');
  };
  
  $c.ValidPosNomenInstrument = function(data){
    return $c.param['закупка на складе'] || !$c.posNomenHasInstrument || (data['$на объект'] && data['$на объект'].id);
  }
  
  $c.Valid = function(){
    if(!$c.data["@позиции тмц"].length) return false;
    return $c.data['дата1']
      && $c.data.contragent4.some(function(item){ return item && item.id || item.title; })
      && $c.ValidAddress1()//$c.data.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
      && $c.ValidPos($c.data)
      && $c.ValidPosNomenInstrument($c.data)
    ;
  };


  $c.Save = function(event, dontClose){///dontClose - флажок не закрывать форму
    $c.data['объект/id'] = $c.param["объект"].id;
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = 1;
    delete $c.error;
    
   
    var save = angular.copy($c.data);
    save['$на объект']._fromItem = undefined;
    save['закупка на складе'] = $c.param['закупка на складе'];
     //~ console.log('тмц/снаб/сохранить заявку', save);
    $c.data._successSave = !1;
    
    return $http.post(appRoutes.url_for('тмц/снаб/сохранить заявку'), save/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        $c.cancelerHttp = undefined;
        if (resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'fw500 red-text text-darken-3 red lighten-5 border animated zoomInUp fast');
        }
        //~ console.log("Save", resp.data);
        else if (resp.data.success) {
          $c.data._successSave = !0;
          if (!dontClose) {
            $c.Cancel(!0);//$c.data = undefined;
            Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp fast');
          }
          //~ $c.ready = false;
          ///обновить номенклатуру и контрагентов
          $c['@номенклатура'].length = 0;
          //~ $c.$Номенклатура.Refresh(0).Load(0).then(function(data){  Array.prototype.push.apply($c['@номенклатура'], data); });
          $c.NomenData(true);///обновить
          $Контрагенты.RefreshData().Load().then(function(){ $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success); });
        }
        console.log("Сохранена закупка", resp.data);
        return resp.data;
      }, function(){
        $c.cancelerHttp = undefined;
        $c.error = 'Ошибка сохранения, косяк программиста';
      });
  };
  
  /*$c.OpenConfirmDelete = function(){
    if (!$c.param['перемещение']) 
      $timeout(function(){ $('#modal-confirm-remove').modal().modal('open'); });///жесткий костыль, не всегда срабатывает модал
    
  };*/
  
  $c.Delete = function(event){
    $c.data['объект/id'] = $c.param["объект"].id;
    
    $c.cancelerHttp = 1;
    delete $c.error;
    $c.data._successRemove = !1;
    
    return $http.post(appRoutes.url_for('тмц/снаб/удалить'), {'объект/id': $c.data['объект/id'] || $c.param["объект"].id, "id": $c.data.id,}/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        $c.cancelerHttp = undefined;
        if (resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'fw500 red-text text-darken-3 red lighten-5 border animated zoomInUp fast');
        }
        else if (resp.data.remove) {
          $c.data._successRemove = !0;
          $c.Cancel(!0);//$c.data = undefined;
          Materialize.toast('Удалено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp fast');
          $rootScope.$broadcast('Удалено поставка/перемещение ТМЦ', $c.data.id);///resp.data.remove
          $c.NomenData(true);///обновить
        }
        console.log("Удалено:", resp.data);
        //~ $('#modal-confirm-remove').modal('close');///еще к костылю
        return resp.data;
      });
    
    
  };
  
  $c.OnSelectAddress = function(adr, param){
    //~ console.log("OnSelectAddress", adr, $c.data.address1);
    if ($c.param['перемещение'] && adr) $c.data.contragent4 = [adr.$контрагент || adr._fromItem.$контрагент];
    //~ else delete adr._fromItem;
    $c.OnChangeAddress(adr, param);
  };
  
  $c.ClearAddress = function(){
    $c.data['адрес отгрузки'] = undefined;
  };
  

  
};

/*=============================================================*/

module

.component('tmcSnabForm', {
  controllerAs: '$c',
  templateUrl: "tmc/form/lib",
  //~ scope: {},
  bindings: {
    param: '<'

  },
  controller: Component
})

;

}());