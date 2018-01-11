(function () {'use strict';
/*
  Форма заявки транспорта
  Минимальная заявка:
  1. Дата начала (можно переносить)
  2. Получатель (на сторону или наш проект-объект)
  3. Адрес (если не объект - строка)
  4. Груз
  Можно указать категорию
  
  Заявка в работе:
  5. Машина (категория и перевозчик)
  6. Стоимость (опционально)
  
  Заявка завершена:
  7. Дата завершения
  8. Факт (оплата)
  
*/
  
var moduleName = "TransportAskForm";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'TransportAskContact', 'Объект или адрес', 'TransportItem', 'Util', 'SVGCache']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $interval, $http, $element, $q, $window, appRoutes, TransportAskData, Util) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  var categoryParam, categoryData;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param= $ctrl.param;
    $scope.categoryData = categoryData = TransportAskData.category();
    $scope.categoryData.then(function(resp){
      $scope.categoryDataP20t = resp.data.filter(function(item){ return TransportAskData["категории прицепов для тягачей"].some(function(cid){ return cid == item.id; }); });// категории прицепов 20т для сцепок
    });
    
    $scope.categoryParam = categoryParam = {"не добавлять новые позиции": true, "placeholder": 'поиск', treeTitle: 'Выбор категории'};
    
    $scope.payType = TransportAskData.payType();
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        if(!newValue && !oldValue) return;
        if (newValue) {
          $ctrl.Cancel($ctrl.data);
          $timeout(function(){$ctrl.Open(newValue);});
        } else {
          $ctrl.data = undefined;
        }
      }
    );
    
  };
  $ctrl.Open = function(data){// новая или редактирование
    //~ if(data) $ctrl.data = data;
    //~ else 
    //~ console.log("Open", data);
    $ctrl.data = data && data.draft_id ? data : TransportAskData.InitAskForm(data);//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    //~ $ctrl.param.edit = $ctrl.data;
    //~ $ctrl.data._open = true;
    $timeout(function(){
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        //~ Util.Scroll2El($element[0]);
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
        
        $ctrl.StopWatchContragent1 = $ctrl.WatchContragent1();
        $ctrl.StopWatchContragent2 = $ctrl.WatchContragent2();
        $ctrl.StopWatchAddress2 = $ctrl.WatchAddress2();
        $ctrl.StopWatchAddress1 = $ctrl.WatchAddress1();
        $ctrl.StopWatchDraft = $ctrl.WatchDraft();
        
        if ($ctrl.data.OnSelectTransport) $ctrl.OnSelectTransport($ctrl.data.OnSelectTransport);// из свободного транспорта
      });
  };
  $ctrl.WatchDraft  = function(){//автосохранение черновика
    //~ var form = $('form', $element[0]);
    var save_tm;
    return $scope.$watch(//console.log(
      'ask',  //~ function(scope) { return $ctrl.data; },
      function(newValue, oldValue) {
    //~ $ctrl.watch('data', function(){ console.log("watch ask ", arguments) });
    //~ WatchObject.watch($ctrl, 'data', function (newVal, oldVal) {
        
        if (newValue === undefined || oldValue === undefined || !newValue['черновик']) return;
        if (newValue.id) return;
        if (save_tm === undefined) { // костыль - подождать в перый момент запуска новой заявки
          $timeout(function(){ save_tm = 0 }, 2000);
          return;
        }
        //~ console.log("watch ask ", newValue, );
        
        //~ if ( ) {//} && form.hasClass('ng-dirty') ) {
          
          //~ if(oldVal === undefined) return;
        if (save_tm) $timeout.cancel(save_tm);
        save_tm = $timeout(function(){
          //~ console.log("черновик на сохранение", newValue);
          //~ newValue.save_tm = undefined;
          $ctrl.Save(newValue);
          save_tm = 0;
        }, 10000);
      },
      true);
  };
  
  /*сделал через ng-init для очистки дат*/
  $ctrl.InitPikerDate = function(name){// name input field
    $timeout(function(){
      $('input.datepicker[name="'+name+'"]', $($element[0])).each(function(){
        var input = $(this);
        //~ var name = input.attr('name');
        input.pickadate({// все настройки в файле русификации ru_RU.js
          //~ clear: 'очистить',//name == 'дата2' ? '<i class="material-icons red-text">remove_circle_outline</i>' : '',
          //~ closeOnClear: true,
          formatSkipYear: true,// доп костыль - дописывать год при установке
          //~ onClose: function(context) { console.log("onClose: this, context, arguments", this, context, arguments); },
          onSet: function(context){
             console.log("datepicker.onSet: this, context", this, context);
            var s = this.component.item.select;
            $timeout(function(){
              if(s) $ctrl.data[name] = [s.year, s.month+1, s.date].join('-');
              else $ctrl.data[name] = undefined;
              
            });
            
            //~ $(this._hidden).val($ctrl.data[name]);
          },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
        });
      });
      
    });
    
  };
  
  $ctrl.ClearDate = function(name){
    $ctrl.data[name] = 0;
    //~ if(!$ctrl.clearDate) $ctrl.clearDate = {};
    //~ $ctrl.clearDate[name] = 0;
    $timeout(function(){ $ctrl.data[name] = null; });
    
  };
  $ctrl.Cancel = function(ask){
    //~ if($ctrl.data) $ctrl.data['позиции'].map(function(it){it['обработка']= false;});
    if (ask && ask._copy_id) ask.id = ask._copy_id;
    $ctrl.data= undefined;
    $scope.ask = undefined;
    $ctrl.param.edit = undefined;
    if($ctrl.StopWatchContragent1) $ctrl.StopWatchContragent1();
    if($ctrl.StopWatchContragent2) $ctrl.StopWatchContragent2();
    if($ctrl.StopWatchAddress1) $ctrl.StopWatchAddress1();
    if($ctrl.StopWatchAddress2) $ctrl.StopWatchAddress2();
    if($ctrl.StopWatchDraft) $ctrl.StopWatchDraft();
    //~ if($ctrl.intervalSaveDraft) $interval.cancel($ctrl.intervalSaveDraft);
  };
  
  $ctrl.InitForm = function (){
    $scope.ask = $ctrl.data;
      ['стоимость', 'факт'].map(function(name){$ctrl.FormatNumeric(name);});
    
  };
  
  /*$ctrl['крыжик наш транспорт/onChange'] = function(){
    /*логика переключения 
    перевозчик: останина/капитал или стронний
    заголовки заказчик-грузополучатель
    *
    if ($ctrl.data['наш транспорт']) {
      //~ $ctrl.data.contragent1.FilterTransport = undefined;
      $ctrl.data.contragent1.id = TransportAskData['наши ТК'];
      $ctrl.OnSelectContragent1();
      
    } else {
      
      //~ $ctrl.data.contragent1.FilterTransport = function(item){ return  !item['перевозчик/id'].some(function(id){ return TransportAskData['наши ТК'].some(function(_id){ return id == _id; }); }); };//фильтрация транспорта
      $ctrl.OnSelectContragent1();//{notId:  ['1393']}
      //~ var contragent1Param = $ctrl.data.contragent1Param;
      //~ $ctrl.data.contragent1Param = undefined;
      //~ $timeout(function(){// передернуть компонент
        //~ $ctrl.data.contragent1Param = contragent1Param;
        
      //~ });
    }
    
  };*/

  $ctrl.WatchContragent2 = function(){
    return $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.data.contragent2; },
      function(newValue, oldValue) {
        //~ if (!newValue.id && newValue.id !== null && newValue.title ) {// передернуть адрес
          //~ newValue.id = null;// особо сбросить собственные объекты
        if (!$ctrl.data.addressParam) return;
        var addressParam = $ctrl.data.addressParam;
          $ctrl.data.addressParam = undefined;
          $timeout(function(){
            addressParam["контрагенты"] = newValue;
            $ctrl.data.addressParam = addressParam;
          }, 10);
        //~ }
        //~ else if (!newValue.id && oldValue.id) {
        //~ }
      },
      true// !!!!
    );
  };
  $ctrl.OnSelectContragent2 = function(item){// заказчик
    //~ console.log("OnSelectContragent2", item);
    //~ if(item) $ctrl.data.contragent2._fromItem = item;
    /*if (!item) {
      if ($ctrl.data.address2.id)  $ctrl.data.address2.title= undefined;
      $ctrl.data.address2.id = undefined;
    }*/
    var idx = item && item['индекс в массиве'];
    //~ $ctrl.data.contragent2[idx].id = item && item.id;
    //~ $ctrl.data.contragent2[idx].title = item && item.title;
    //~ $ctrl.data.contragent2[idx]['проект/id'] = item && item['проект/id'];
    var addressParam = $ctrl.data.addressParam;
    $ctrl.data.addressParam = undefined;
    $ctrl.data.contact2Param[idx] = undefined;
    //~ $ctrl.data.address1Param = undefined;
    $timeout(function(){
      addressParam["контрагенты"] = $ctrl.data.contragent2;
      $ctrl.data.addressParam = addressParam;
      $ctrl.data.contact2Param[idx] = {"контрагент": $ctrl.data.contragent2[idx], "контакт":"заказчик"};//контакт2
      //~ $ctrl.data.address1Param = {"заказчик": $ctrl.data.contragent2};
      
    }, 10);
    
  };
  $ctrl.PushContragent2 = function(){
    var data = $ctrl.data;
    data.contragent2.push({"id": undefined});
    data.contragent2Param.push({});
    data.contact2.push({"title":  '', "phone": ''});
    data.contact2Param.push({"контрагент": data.contragent2[data.contragent2.length-1], "контакт":"заказчик"});
    data['сумма/посреднику'].push(null);
  };
  $ctrl.SpliceContragent2 = function(idx){
    var data = $ctrl.data;
    data.contragent2.splice(idx, 1);
    data.contragent2Param.splice(idx, 1);
    data.contact2.splice(idx, 1);
    data.contact2Param.splice(idx, 1);
    data['сумма/посреднику'].splice(idx, 1);
  };
  
  $ctrl.WatchContragent1 = function(){// перевозчик
    return $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.data.contragent1; },
      function(newValue, oldValue) {
        
        if ($ctrl.resetTransportTimeout) return;
        if (!newValue.id && !newValue.title) return;
        if (newValue.id === null && !oldValue.id) return;
        if (newValue.id && !oldValue.id || newValue.id && oldValue.id && newValue.id == oldValue.id) return;
        
        //~ console.log("WatchContragent1 begin");
        if (!newValue.title) {
          newValue.id = undefined;
        } else if (!newValue.id && newValue.id !== null && newValue.title ) {// сбросить транспорт для нового перевозчика
          newValue.id = null;// особо сбросить собственный транспорт
          //~ if($ctrl.data.transport.id) $ctrl.data.transport = {};
          if ($ctrl.data.driver.id) $ctrl.data.driver.title = undefined;//  сбросить нашего водилу
          $ctrl.data.driver.id = undefined;
          $ctrl.data['наш транспорт'] = false;
          //~ console.log(" WatchContragent1 new! ", angular.copy(newValue), angular.copy(oldValue));
        } //else 
        //~ if (resetTransportTimeout && resetTransportTimeout.cancel) resetTransportTimeout.cancel();
        $ctrl.data.transportParam = undefined;
        $ctrl.resetTransportTimeout = $timeout(function(){
          $ctrl.resetTransportTimeout = undefined;
          $ctrl.data.transportParam = {"заказчик000": $ctrl.data.contragent2, "перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category,  };//"наш транспорт": $ctrl.data['наш транспорт']
          //~ console.log(" WatchContragent1 resetTransport", $ctrl.data.contragent1, angular.copy(newValue), angular.copy(oldValue));
        }, 300);//
        
        //~ console.log("WatchContragent1 done");
        
      },
      true// !!!!
    );
  };
  $ctrl.OnSelectContragent1 = function(item){// перевозчик
    //~ console.log("OnSelectContragent1", item);
    //~ if(item) $ctrl.data.contragent1._fromItem = item;
    //~ else {
    if (!item || !item.id) {
      if ($ctrl.data.transport.id) $ctrl.data.transport.title= undefined;
      $ctrl.data.transport.id = undefined;
      $ctrl.data['наш транспорт'] = undefined;
      $ctrl.data.contragent3.id=undefined;
      $ctrl.data.contragent3.title=undefined;
    } else {
      $ctrl.data['наш транспорт'] = item && !!item['проект/id'];
    }
    
      //~ $ctrl.data.transport._fromItem = undefined;
      if ($ctrl.data.driver.id) $ctrl.data.driver.title = undefined;
      $ctrl.data.driver.id = undefined;
      $ctrl.data.contact1.title = undefined;
      $ctrl.data.contact1.phone = undefined;
      $ctrl.data.director1.title = undefined;
      $ctrl.data.director1.phone = undefined;
    //~ } //else {
    $ctrl.data.driverParam = undefined;//передернуть компонент водителя
    $ctrl.data.contact1Param = undefined;//передернуть компонент 
    $ctrl.data.director1Param = undefined;//передернуть компонент 
    //~ $ctrl.data.contact2Param = undefined;//передернуть компонент 
      /*if (item && item.id)*/ $ctrl.data.transportParam = undefined;
      $timeout(function(){
        //~ $ctrl.data.contragent1.id = item && item.id;
        //~ $ctrl.data.contragent1.title = item && item.title;
        $ctrl.data.driverParam = {"контрагент": $ctrl.data.contragent1, "контакт":"водитель"};
        $ctrl.data.transportParam = {"заказчик000": $ctrl.data.contragent2, "перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category,};// "наш транспорт": $ctrl.data['наш транспорт']
        $ctrl.data.contact1Param = {"контрагент": $ctrl.data.contragent1, "контакт":"перевозчик"};//контакт1
        $ctrl.data.director1Param = {"контрагент": $ctrl.data.contragent1, "контакт":"директор1"};
        //~ $ctrl.data.contact2Param = {"контрагент": $ctrl.data.contragent2, "контакт":"заказчик"};//контакт2
        //~ $ctrl.data.contragent1['проект/id'] = item && item['проект/id'];
      });
    //}
  };
  $ctrl.OnSelectContragent4 = function(item){//грузоотправитель
    var idx = item && item['индекс в массиве'];
    $ctrl.data.contact4Param[idx] = undefined;//передернуть компонент
    $timeout(function(){
      $ctrl.data.contact4Param[idx] = {"контрагент": $ctrl.data.contragent4[idx], "контакт":"грузоотправитель"};//контакт4
    });
  };
  $ctrl.PushContragent4 = function(){// еще грузоотправитель
    var data = $ctrl.data;
    data.contragent4.push({"id": undefined});
    data.contragent4Param.push({});
    data.contact4.push({"title":  '', "phone": ''});
    data.contact4Param.push({"контрагент": data.contragent4[data.contragent4.length-1], "контакт":"грузоотправитель"});
  };
  $ctrl.SpliceContragent4 = function(idx){
    var data = $ctrl.data;
    data.contragent4.splice(idx, 1);
    data.contragent4Param.splice(idx, 1);
    data.contact4.splice(idx, 1);
    data.contact4Param.splice(idx, 1);
  };
  
  var new_address = {title:''};
  var watch_address = function(newValue, oldValue) {
    //~ console.log(" WatchAddress ", newValue, oldValue);
    // в массиве адресов найти индексы эл-тов с пустыми title
    var emp = newValue.filter(function(arr){
      var emp2 = arr/*сначала проиндексировать*//*.map(function(it, idx){ var ti = angular.copy(it); ti._idx = idx; return ti; })*/.filter(function(it){ return !it.title; });
      //~ console.log(" WatchAddress ", emp2);
      if (emp2.length > 1) arr.splice(arr.indexOf(emp2.shift()), 1);
      else if (emp2.length === 0) arr.push(angular.copy(new_address));
      
      return arr.every(function(it){ return !it.title; });
      
    });
    // если два эл-та - один почикать
    if (emp.length > 1) newValue.splice(newValue.indexOf(emp.shift()), 1);
    // если нет пустых - добавить
    else if (emp.length === 0 ) newValue.push([angular.copy(new_address)]);//, _idx: newValue.length
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
        }, 700);
      },
      true// !!!!
    );
  };
  $ctrl.WatchAddress2 = function(){// куда
    var tm;
    return $scope.$watch(
      function(scope) { return $ctrl.data.address2; },
      function(newValue, oldValue) {
        if (tm) $timeout.cancel(tm);
        tm = $timeout(function(){
          tm = undefined;
          watch_address(newValue, oldValue);
        }, 700);
      },
      true// !!!!
    );
  };
  $ctrl.OnSelectAddress = function(item){
    //~ console.log("OnSelectAddress2", item);
    if($ctrl.data.contragent2[$ctrl.data.contragent2.length - 1].title) return;
    if (item) {
      //~ $ctrl.data.contragent2._fromItem = item;
      if(item['контрагент/id']) $ctrl.data.contragent2[$ctrl.data.contragent2.length - 1].id = item['контрагент/id'];
    }
    var contragent2Param = $ctrl.data.contragent2Param;
    $ctrl.data.contragent2Param = undefined;// передернуть компонент заказчика
    $timeout(function(){
      $ctrl.data.contragent2Param = contragent2Param;
    });
    
  };
  $ctrl.Address2OK = function(){
    return $ctrl.data.address2.some(function(arr){ return arr.some(function(it){ return !!it.title; })});
  };
  $ctrl.InitAddressParam = function(idx1, idx2){
    //~ console.log("InitAddressParam", idx1, idx2);
    if (idx2 === 0) return $ctrl.data.addressParam;
    var addressParam = angular.copy($ctrl.data.addressParam);
    addressParam.placeholder = 'адрес в городе/области';
    return addressParam;
    
  };
  
  $ctrl.OnSelectCategory = function(item){//
    //~ console.log("OnSelectCategory", item);
    $ctrl.data.category.selectedItem = item;
    if (!item || !item.id) {
      if ($ctrl.data.transport.id) $ctrl.data.transport = {};
        //~ $ctrl.data.transport.id= undefined;
        //~ $ctrl.data.transport.title= undefined;
      //~ }
      
      //~ 
      $ctrl.data.transport1Param = undefined;
      $scope.categoryParam = undefined;
      $scope.categoryData = categoryData;
      $timeout(function(){
        $scope.categoryParam = categoryParam;
      });
      
      if (!$ctrl.data.contragent1.id) {// передернуть перевозчика
        var contragent1Param = $ctrl.data.contragent1Param;
        $ctrl.data.contragent1Param = undefined;
        $timeout(function(){
          $ctrl.data.contragent1Param = contragent1Param;
        });
      }
    }
    var transportParam = $ctrl.data.transportParam;
    $ctrl.data.transportParam = undefined;
    $timeout(function(){
      $ctrl.data.transportParam = transportParam;//{"перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category, };//"наш транспорт": $ctrl.data['наш транспорт']
    }, 10);
  };
  $ctrl.OnSelectTransport = function(item){
    //~ console.log("OnSelectTransport", item);
    if (item) {
      if (item['перевозчик/id'].length == 1) {
        $ctrl.data.contragent1.id = item['перевозчик/id'][0];
        $ctrl.data['наш транспорт'] = !!item['проект/id'][0];
      }
      else if (!$ctrl.data.contragent1.id) $ctrl.data.contragent1.id = item['перевозчик/id'];

      $ctrl.data.category.selectedItem.id = item['категория/id'];
      if (item['категории']) $ctrl.data.category.selectedItem.title = item['категории'][1];
      if (item['водитель/id'] && !$ctrl.data.driver.id) $ctrl.data.driver.id = item['водитель/id'];
      if (item['водитель'] &&  !$ctrl.data.driver.id) {
        
        $ctrl.data.driver.id = undefined;
        $ctrl.data.driver.title = item['водитель'][0];
        $ctrl.data.driver.phone = item['водитель'][1];
        $ctrl.data.driver.doc = item['водитель'][2];
        
      }
      
      // два условия сцепки двух НАШИХ транспортов
      // первое - выбран тягач
      if (item['проект/id'] && item['проект/id'][0] && TransportAskData["категории для прицепов"].some(function(cid){ return cid == item['категория/id']; })) {///^тягач/i.test(item.title)
        $ctrl.data.transport1Param = undefined;
        $ctrl.data.transportParam = undefined;
        $ctrl.data.transport1 = $ctrl.data.transport;// перестановка строк
        $ctrl.data.transport = {};
        var categoryParam = $scope.categoryParam;
        $scope.categoryParam = undefined;
        $scope.categoryData = $scope.categoryDataP20t;
        
        $timeout(function(){
          $ctrl.data.transport1Param = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории для прицепов"], "placeholder": 'тягач'};
          $ctrl.data.transportParam = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории прицепов для тягачей"], "placeholder": 'прицеп'};
          $ctrl.data.category.selectedItem = {};
          $scope.categoryParam = categoryParam;
          //~ Array.prototype.push.apply($scope.categoryData, $scope.categoryDataP20t);
          
          //~ console.log("categoryDataP20t", $scope.categoryData);
        });
      }//console.log("^тягач!!!");
      // 20т прицепы
      else if (item['проект/id'] && item['проект/id'][0] && !$ctrl.data.transport1Param && TransportAskData["категории прицепов для тягачей"].some(function(cid){ return cid == item['категория/id']; })) {
        $ctrl.data.transport1Param = undefined;
        $ctrl.data.transport1 = {};
        $scope.categoryParam.disabled= true;
        $timeout(function(){
          $ctrl.data.transport1Param = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории для прицепов"], "placeholder": 'тягач'};
          //~ $ctrl.data.transport2Param = {"перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category, };
        });
        
      }
      else $scope.categoryParam.disabled= true;
    } else {//сброс транспорта
      $ctrl.data.transport1Param = undefined;
      $ctrl.data.transport1 = undefined;
      $scope.categoryParam.disabled= false;
      $ctrl.data['наш транспорт'] = undefined;
      
    }
    //~ if (!$ctrl.data.contragent1.id) {// передернуть перевозчика
      $ctrl.data.contragent1Param = undefined;
      $timeout(function(){
        $ctrl.data.contragent1Param = {};
      });
    //~ }
    
    
  };
  /*$ctrl.OnSelectTransport1 = function(item){//для тягача сцепки
    if(item) {
      
      
    } else {
      
      
    }
    
  };*/
  var num_timeout;
  $ctrl.FormatNumeric = function(name, idx){
    //~ if(!$ctrl.data[name]) return;
    //~ var dot = /[,.]/.test($ctrl.data[name]);
    if (num_timeout && num_timeout.cancel) num_timeout.cancel();
    num_timeout = $timeout(function(){
      num_timeout = undefined;//.resolve()
      
      if(idx !== undefined) {
        var num = parseFloat(Util.numeric($ctrl.data[name][idx]));
        if (num) $ctrl.data[name][idx] = num.toLocaleString('ru');
        else $ctrl.data[name][idx] = null;
      } else {
        var num = parseFloat(Util.numeric($ctrl.data[name]));
        if (num) $ctrl.data[name] = num.toLocaleString('ru');
        else $ctrl.data[name] = null;
      }
      
        
        //~ $ctrl.data[name] += !/[,.]\d/.test($ctrl.data[name]) && dot ? ',' : '';
        //~ $ctrl.data[name] = Util.money($ctrl.data[name]);
      if($ctrl.data['стоимость'] && $ctrl.data['факт']) {
        var sum = parseFloat(Util.numeric($ctrl.data['стоимость'])) * parseFloat(Util.numeric($ctrl.data['факт']));
        //~ console.log("сумма", sum);
        if(sum) $ctrl.data['сумма'] = (Math.round(sum*100)/100).toLocaleString();
        //~ else $ctrl.data['сумма'] = undefined;
      } else  if ($ctrl.data['стоимость'] && $ctrl.data['тип стоимости'] === 0) {
        $ctrl.data['сумма'] = $ctrl.data['стоимость'];
      } else $ctrl.data['сумма'] = null;
    
      //~ console.log("FormatNumeric сумма", $ctrl.data);
    }, 1000);
  };
  
  $ctrl.ChangePayType = function(){// тип стоимости
    if($ctrl.data['тип стоимости'] === 0) $ctrl.data['факт'] = undefined;
    $ctrl.FormatNumeric('стоимость');
  };
  $ctrl.ChangeGruzOff = function(){
    if($ctrl.data['без груза']) $ctrl.data['груз'] = undefined;
  };
  
  $ctrl.Validate4Date2 = function(){
    var ask = $ctrl.data;
    if (!ask.transport) return false;
    
    return !!(
      ask.transport.title && $ctrl.Validate(ask)
      && ask['стоимость'] && (ask['тип стоимости'] === 0 || (ask['тип стоимости'] && ask['факт']))
      //~ && (ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])
      //~ && ask['дата оплаты']
      //~ && ask['док оплаты']
    );
  };
  
  $ctrl.Validate = function(ask){// минимальная заявка
    if (!ask.transport) return false;
    if(ask.transport1Param && (!(ask.transport1 && ask.transport1.id) || !ask.transport.id) )  return false;
    
    return !!(
      (ask['наш транспорт'] === undefined || ask['наш транспорт'] || ask.contragent3.id)
      && ask.contragent2.filter(function(item){ return item.id || item.title; }).length // заказчик! || ask.project.id
      && ask.address2.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // куда
      && (!ask.transport.title || ((ask.category.selectedItem && ask.category.selectedItem.id) && ask.contragent1.title && ask.driver.title)) // транспорт с категорией и перевозчиком || (ask.category.newItems[0].title))
      //~ && (!ask.transport.title  || !ask.contragent1['проект/id'] ||  ask.driver.title) // водитель
      && (ask['без груза'] || ask['груз'] || !!ask['позиции тмц'])
      //~ && (!ask['стоимость'] || ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])// || ask['тип стоимости'] && ask['факт'])
    );// return true;
    //~ return false;
    
  };
  $ctrl.Save = function(ask, event){// event -- click
    //~ console.log("Save", ask);
    var draft;
    if(event) {
      draft = ask['черновик'];
      ask['черновик'] = undefined;
    }
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    return $http.post(appRoutes.url_for('транспорт/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        
        console.log("Сохранено", resp.data);
        if(resp.data.error || (resp.data.success && !resp.data.success.id)) {
          if (draft) ask['черновик'] = draft;
          $ctrl.error = resp.data.error || resp.data.success;
        }
        else if(resp.data.success && resp.data.success.id) {
          ask.id = resp.data.success.id;
          //~ window.location.reload(false);// сложно
          window.location.href = window.location.pathname+'?id='+ask.id;
        }
        else if (resp.data.draft) {
          //~ Materialize.toast('Черновик сохранен', 1000, 'grey')
          ask.draft_id = resp.data.draft.id;
          
        }
      });
  };
  
  $ctrl.Copy = function(ask) {
    ask._copy_id = ask.id;
    ask.id = undefined;
    
  };
  
  $ctrl.Draft = function(ask){// из черновика
    $http.get(appRoutes.url_for('транспорт/черновик заявки')).then(function(resp){
      if (resp.data && resp.data.val) {
        var draft = JSON.parse(resp.data.val);
        if (draft) {
          draft.draft_id = resp.data.id;
          draft.id=undefined;
          //~ $ctrl.data = undefined;
          $ctrl.param.edit = draft;
          //~ console.log("Из  черновика", draft);
        }
      } 
      //~ else
      
      
    });
    
  };
  
  $ctrl.Print = function(ask){
    $window.open(appRoutes.url_for('транспорт/заявка.docx', ask.id), '_blank');
    
  };
  
  $ctrl.Disable = function(ask, event) {// отмена-отзыв заявки из работы
    ask['отозвать'] = !ask['отозвать'];
    $ctrl.Save(ask, event);
    
  };
  
};

/*=============================================================*/

module

.component('transportAskForm', {
  templateUrl: "transport/ask/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());