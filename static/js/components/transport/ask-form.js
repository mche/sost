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
var module = angular.module(moduleName, ['appRoutes', 'TreeItem', 'ContragentItem', 'TransportAskContact', 'Объект или адрес', 'TransportItem', 'Util', 'SVGCache', 'ТМЦ таблица позиций' /*для заявки снабжения*/]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $interval, $http, $element, $q, $window, appRoutes, TransportAskData, Util, $Контрагенты, TransportData,ObjectAddrData) {
  var $c = this;
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  //~ $scope.reLetter = new RegExp('.', 'g');
  $scope.Util = Util;
  //~ $scope.TransportAskData = TransportAskData;
  var categoryParam, categoryData;
  
  $c.$onInit = function(){
    if(!$c.param) $c.param = {};
    $scope.param= $c.param;
    $scope.categoryData = categoryData = TransportAskData.category();
    $scope.categoryData.then(function(resp){
      $scope.categoryDataP20t = resp.data.filter(function(item){ return TransportAskData["категории прицепов для тягачей"].some(function(cid){ return cid == item.id; }); });// категории прицепов 20т для сцепок
    });
    
    $scope.categoryParam = categoryParam = {"не добавлять новые позиции": true, "placeholder": 'поиск', treeTitle: 'Выбор категории'};
    
    $scope.payType = TransportAskData.payType();
    $c.ready = true;
    
    $scope.$on('Редактировать заявку на транспорт', function(event, ask){
      $c.Cancel();
      $timeout(function(){ $c.Open(angular.copy(ask)); });
      
    });

    
  };
  $c.Open = function(data){// новая или редактирование
    //~ if(data) $c.data = data;
    //~ else 
    //~ console.log("Open", data);
    $c.data = data && data.draft_id ? data : TransportAskData.InitAskForm(data);//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    //~ $c.param.edit = $c.data;
    //~ $c.data._open = true;
    
    $c.StopWatchContragent1 = $c.WatchContragent1();
    $c.StopWatchContragent2 = $c.WatchContragent2();
    $c.StopWatchAddress2 = $c.WatchAddress2();
    $c.StopWatchAddress1 = $c.WatchAddress1();
    //~ $c.StopWatchDraft = $c.WatchDraft();///косячит
    
    $timeout(function(){
        //~ if($c.data && $c.data.contragent && $c.data.contragent.id) $c.OnSelectContragent($c.data.contragent);
        //~ Util.Scroll2El($element[0]);
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
        
        
        //~ console.log("Open timeout", $c.data);
        if ($c.data.OnSelectTransport) $c.OnSelectTransport($c.data.OnSelectTransport);// из свободного транспорта
        
      });
  };
  $c.WatchDraft  = function(){//автосохранение черновика
    //~ var form = $('form', $element[0]);
    $c.timeoutSaveDraft = undefined;
    return $scope.$watch(//console.log(
      'ask',  //~ function(scope) { return $c.data; },
      function(newValue, oldValue) {
        
        if (newValue === undefined || oldValue === undefined || !newValue['черновик']) return;
        if (newValue.id) return;
        if ($c.timeoutSaveDraft === undefined) { // костыль - подождать в перый момент запуска новой заявки
          $timeout(function(){ $c.timeoutSaveDraft = 0 }, 10000);
          return;
        }
        else if ($c.timeoutSaveDraft) $timeout.cancel($c.timeoutSaveDraft);
        $c.timeoutSaveDraft = $timeout(function(){
          //~ console.log("черновик на сохранение", newValue);
          $c.timeoutSaveDraft = 0;
          $c.Save(newValue).then(function(){
            
          });
          
        }, 3000);
      },
      true);
  };
  
  /*сделал через ng-init для очистки дат*/
  $c.InitPickerDate = function(name){// name input field
    $timeout(function(){
      $('input.datepicker[name="'+name+'"]', $($element[0])).each(function(){
        var input = $(this);
        //~ var name = input.attr('name');
        input.pickadate({// все настройки в файле русификации ru_RU.js
          //~ clear: 'очистить',//name == 'дата2' ? '<i class="material-icons red-text">remove_circle_outline</i>' : '',
          //~ closeOnClear: true,
          //~ selectYears: true,
          formatSkipYear: true,// доп костыль - дописывать год при установке
          //~ onClose: function(context) { console.log("onClose: this, context, arguments", this, context, arguments); },
          onSet: function(context){
             //~ console.log("datepicker.onSet: this, context", this, context);
            var s = this.component.item.select;
            $timeout(function(){
              if(s) $c.data[name] = [s.year, s.month+1, s.date].join('-');
              else $c.data[name] = undefined;
              
            });
            
            //~ $(this._hidden).val($c.data[name]);
          },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
        });
      });
      
    });
    
  };
  
  $c.ClearDate = function(name){
    $c.data[name] = 0;
    //~ if(!$c.clearDate) $c.clearDate = {};
    //~ $c.clearDate[name] = 0;
    $timeout(function(){ $c.data[name] = null; });
    
  };
  $c.Cancel = function(ask){
    //~ if (!$c.data) return;
    //~ console.log("$c.Cancel", ask);
    //~ if($c.data) $c.data['позиции'].map(function(it){it['обработка']= false;});
    //~ if (ask && ask._copy_id) ask.id = ask._copy_id;
    
    if (ask) {///просто анимация
      $('.card:first', $element[0]).addClass('animated zoomOutDown');
      return $timeout(function(){
        $c.Cancel();
      }, 300);
    }
    
     //~ if ($c.timeoutSaveDraft)  $timeout.cancel($c.timeoutSaveDraft);
      if($c.StopWatchContragent1) $c.StopWatchContragent1();
      if($c.StopWatchContragent2) $c.StopWatchContragent2();
      if($c.StopWatchAddress1) $c.StopWatchAddress1();
      if($c.StopWatchAddress2) $c.StopWatchAddress2();
      //~ if($c.StopWatchDraft) $c.StopWatchDraft();
    
    $timeout(function(){
      $c.data= undefined;
      $scope.ask = undefined;
      
    });
    
  };
  
  $c.InitForm = function (){
    $scope.ask = $c.data;
      ['стоимость', 'факт'].map(function(name){$c.FormatNumeric(name);});
    
  };
  
  /*$c['крыжик наш транспорт/onChange'] = function(){
    /*логика переключения 
    перевозчик: останина/капитал или стронний
    заголовки заказчик-грузополучатель
    *
    if ($c.data['наш транспорт']) {
      //~ $c.data.contragent1.FilterTransport = undefined;
      $c.data.contragent1.id = TransportAskData['наши ТК'];
      $c.OnSelectContragent1();
      
    } else {
      
      //~ $c.data.contragent1.FilterTransport = function(item){ return  !item['перевозчик/id'].some(function(id){ return TransportAskData['наши ТК'].some(function(_id){ return id == _id; }); }); };//фильтрация транспорта
      $c.OnSelectContragent1();//{notId:  ['1393']}
      //~ var contragent1Param = $c.data.contragent1Param;
      //~ $c.data.contragent1Param = undefined;
      //~ $timeout(function(){// передернуть компонент
        //~ $c.data.contragent1Param = contragent1Param;
        
      //~ });
    }
    
  };*/

  $c.WatchContragent2 = function(){
    return $scope.$watch(//console.log("set watcher $c.item", 
      function(scope) { return $c.data.contragent2; },
      function(newValue, oldValue) {
        //~ if (!newValue.id && newValue.id !== null && newValue.title ) {// передернуть адрес
          //~ newValue.id = null;// особо сбросить собственные объекты
        if (!$c.data.addressParam) return;
        var addressParam = $c.data.addressParam;
          $c.data.addressParam = undefined;
          $timeout(function(){
            addressParam["контрагенты"] = newValue;
            $c.data.addressParam = addressParam;
          }, 10);
        //~ }
        //~ else if (!newValue.id && oldValue.id) {
        //~ }
      },
      true// !!!!
    );
  };
  $c.OnSelectContragent2 = function(item){// заказчик
    //~ console.log("OnSelectContragent2", item);
    //~ if(item) $c.data.contragent2._fromItem = item;
    /*if (!item) {
      if ($c.data.address2.id)  $c.data.address2.title= undefined;
      $c.data.address2.id = undefined;
    }*/
    var idx = item && item['индекс в массиве'];
    //~ $c.data.contragent2[idx].id = item && item.id;
    //~ $c.data.contragent2[idx].title = item && item.title;
    //~ $c.data.contragent2[idx]['проект/id'] = item && item['проект/id'];
    var addressParam = $c.data.addressParam;
    $c.data.addressParam = undefined;
    $c.data.contact2Param[idx] = undefined;
    //~ $c.data.address1Param = undefined;
    $timeout(function(){
      addressParam["контрагенты"] = $c.data.contragent2;
      $c.data.addressParam = addressParam;
      $c.data.contact2Param[idx] = {"контрагент": $c.data.contragent2[idx], "контакт":"заказчик"};//контакт2
      //~ $c.data.address1Param = {"заказчик": $c.data.contragent2};
      
    }, 10);
    
  };
  $c.PushContragent2 = function(){
    var data = $c.data;
    data.contragent2.push({"id": undefined});
    data.contragent2Param.push({});
    data.contact2.push({"title":  '', "phone": ''});
    data.contact2Param.push({"контрагент": data.contragent2[data.contragent2.length-1], "контакт":"заказчик"});
    data['сумма/посреднику'].push(null);
  };
  $c.SpliceContragent2 = function(idx){
    var data = $c.data;
    data.contragent2.splice(idx, 1);
    data.contragent2Param.splice(idx, 1);
    data.contact2.splice(idx, 1);
    data.contact2Param.splice(idx, 1);
    data['сумма/посреднику'].splice(idx, 1);
  };
  
  $c.WatchContragent1 = function(){// перевозчик
    return $scope.$watch(//console.log("set watcher $c.item", 
      function(scope) { return $c.data.contragent1; },
      function(newValue, oldValue) {
        
        if ($c.resetTransportTimeout) return;
        if (newValue.id === null && !oldValue.id) return;
        if (!newValue.id && !newValue.title) return;
        if (newValue.id && !oldValue.id || newValue.id && oldValue.id && newValue.id == oldValue.id) return;
        
        //~ console.log("WatchContragent1 begin");
        if (!newValue.title) {
          newValue.id = undefined;
          
        } else if (!newValue.id && newValue.id !== null && newValue.title ) {// сбросить транспорт для нового перевозчика
          newValue.id = null;// особо сбросить собственный транспорт
                if ( $c.data.transport1 ) $c.data.transport1.id = undefined;
                $c.data.transport1Param = undefined;
          //~ if($c.data.transport.id) $c.data.transport = {};
          if ($c.data.driver.id) $c.data.driver.title = undefined;//  сбросить нашего водилу
          $c.data.driver.id = undefined;
          $c.data['наш транспорт'] = false;
          //~ $c.data.category.selectedItem = {};
          
        } //else 
        //~ if (resetTransportTimeout && resetTransportTimeout.cancel) resetTransportTimeout.cancel();
        
        $c.data.transportParam = undefined;
        $c.resetTransportTimeout = $timeout(function(){
          $c.resetTransportTimeout = undefined;
          $c.data.transportParam = {"заказчик000": $c.data.contragent2, "перевозчик": $c.data.contragent1, "категория": $c.data.category,  };//"наш транспорт": $c.data['наш транспорт']
          //~ console.log(" WatchContragent1 resetTransport", $c.data.contragent1, angular.copy(newValue), angular.copy(oldValue));
        }, 300);//
        
        //~ console.log("WatchContragent1 done");
        
      },
      true// !!!!
    );
  };
  $c.OnSelectContragent1 = function(item){// перевозчик
    //~ console.log("OnSelectContragent1", item);
    //~ if(item) $c.data.contragent1._fromItem = item;
    //~ else {
    //~ $rootScope.$broadcast('Транспорт/заявка/форма: установка перевозчика', item);
    if (!item || !item.id) {
      if ($c.data.transport.id) $c.data.transport.title= undefined;
      $c.data.transport.id = undefined;
      if ($c.data.transport1) {
        $c.data.transport1 = {};
        $c.data.transport1Param = undefined;
      }
      $c.data['наш транспорт'] = undefined;
      $c.data.contragent3.id=undefined;
      $c.data.contragent3.title=undefined;
      $c.data.category.selectedItem = {};
      $scope.categoryParam.disabled=false;
    } else {
      $c.data['наш транспорт'] = item && !!item['проект/id'];
    }
    
      //~ $c.data.transport._fromItem = undefined;
      if ($c.data.driver.id) $c.data.driver.title = undefined;
      $c.data.driver.id = undefined;
      $c.data.contact1.title = undefined;
      $c.data.contact1.phone = undefined;
      $c.data.director1.title = undefined;
      $c.data.director1.phone = undefined;
    //~ } //else {
    $c.data.driverParam = undefined;//передернуть компонент водителя
    $c.data.contact1Param = undefined;//передернуть компонент 
    $c.data.director1Param = undefined;//передернуть компонент 
    //~ $c.data.contact2Param = undefined;//передернуть компонент 
      /*if (item && item.id)*/ $c.data.transportParam = undefined;
      $timeout(function(){
        //~ $c.data.contragent1.id = item && item.id;
        //~ $c.data.contragent1.title = item && item.title;
        $c.data.driverParam = {"контрагент": $c.data.contragent1, "контакт":"водитель"};
        $c.data.transportParam = {"заказчик000": $c.data.contragent2, "перевозчик": $c.data.contragent1, "категория": $c.data.category,};// "наш транспорт": $c.data['наш транспорт']
        $c.data.contact1Param = {"контрагент": $c.data.contragent1, "контакт":"перевозчик"};//контакт1
        $c.data.director1Param = {"контрагент": $c.data.contragent1, "контакт":"директор1"};
        //~ $c.data.contact2Param = {"контрагент": $c.data.contragent2, "контакт":"заказчик"};//контакт2
        //~ $c.data.contragent1['проект/id'] = item && item['проект/id'];
      });
    //}
  };
  $c.OnSelectContragent4 = function(item){//грузоотправитель
    //~ console.log("OnSelectContragent4", item);
    var idx = item && item['индекс в массиве'];
    $c.data.contact4Param[idx] = undefined;//передернуть компонент
    $timeout(function(){
      $c.data.contact4Param[idx] = {"контрагент": $c.data.contragent4[idx], "контакт":"грузоотправитель"};//контакт4
    });
  };
  $c.PushContragent4 = function(){// еще грузоотправитель
    var data = $c.data;
    data.contragent4.push({"id": undefined});
    data.contragent4Param.push({});
    data.contact4.push({"title":  '', "phone": ''});
    data.contact4Param.push({"контрагент": data.contragent4[data.contragent4.length-1], "контакт":"грузоотправитель"});
  };
  $c.SpliceContragent4 = function(idx){
    var data = $c.data;
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
  $c.WatchAddress1 = function(){// куда
    var tm;
    return $scope.$watch(
      function(scope) { return $c.data.address1; },
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
  $c.WatchAddress2 = function(){// куда
    var tm;
    return $scope.$watch(
      function(scope) { return $c.data.address2; },
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
  $c.OnSelectAddress = function(item){
    //~ console.log("OnSelectAddress2", item);
    if($c.data.contragent2[$c.data.contragent2.length - 1].title) return;
    if (item) {
      //~ $c.data.contragent2._fromItem = item;
      if(item['контрагент/id']) $c.data.contragent2[$c.data.contragent2.length - 1].id = item['контрагент/id'];
    }
    var contragent2Param = $c.data.contragent2Param;
    $c.data.contragent2Param = undefined;// передернуть компонент заказчика
    $timeout(function(){
      $c.data.contragent2Param = contragent2Param;
    });
    
  };
  $c.Address2OK = function(){
    return $c.data.address2.some(function(arr){ return arr.some(function(it){ return !!it.title; })});
  };
  $c.InitAddressParam = function(idx1, idx2){
    //~ console.log("InitAddressParam", idx1, idx2);
    if (idx2 === 0) return $c.data.addressParam;
    var addressParam = angular.copy($c.data.addressParam);
    addressParam.placeholder = 'адрес в городе/области';
    return addressParam;
    
  };
  
  $c.OnSelectCategory = function(item){//
    //~ console.log("OnSelectCategory", item);
    $c.data.category.selectedItem = item;
    if (!item || !item.id) {
      if ($c.data.transport.id) $c.data.transport = {};
        //~ $c.data.transport.id= undefined;
        //~ $c.data.transport.title= undefined;
      //~ }
      
      //~ 
      $c.data.transport1Param = undefined;
      $scope.categoryParam = undefined;
      //~ $scope.categoryData = categoryData;
      $timeout(function(){
        $scope.categoryParam = categoryParam;
      });
      
      if (!$c.data.contragent1.id) {// передернуть перевозчика
        var contragent1Param = $c.data.contragent1Param;
        $c.data.contragent1Param = undefined;
        $timeout(function(){
          $c.data.contragent1Param = contragent1Param;
        });
      }
    }
    var transportParam = $c.data.transportParam;
    $c.data.transportParam = undefined;
    $timeout(function(){
      $c.data.transportParam = transportParam;//{"перевозчик": $c.data.contragent1, "категория": $c.data.category, };//"наш транспорт": $c.data['наш транспорт']
    }, 10);
  };
  $c.OnSelectTransport = function(item){
    //~ console.log("OnSelectTransport", item);
    if (item) {
      if (item['перевозчик/id'].length == 1) {
        $c.data.contragent1.id = item['перевозчик/id'][0];
        $c.data['наш транспорт'] = !!item['проект/id'][0];
      }
      else if (!$c.data.contragent1.id) $c.data.contragent1.id = item['перевозчик/id'];

      $c.data.category.selectedItem.id = item['категория/id'];
      if (item['категории']) $c.data.category.selectedItem.title = item['категории'][1];
      if (item['водитель/id'] && !$c.data.driver.id) $c.data.driver.id = item['водитель/id'];
      if (item['водитель'] &&  !$c.data.driver.id) {
        
        $c.data.driver.id = undefined;
        $c.data.driver.title = item['водитель'][0];
        $c.data.driver.phone = item['водитель'][1];
        $c.data.driver.doc = item['водитель'][2];
        
      }
      
      // два условия сцепки двух НАШИХ транспортов
      // первое - выбран тягач
      if (item['проект/id'] && item['проект/id'][0] && TransportAskData["категории для прицепов"].some(function(cid){ return cid == item['категория/id']; })) {///^тягач/i.test(item.title)
        $c.data.transport1Param = undefined;
        //~ $c.data.transportParamAll = $c.data.transportParam;
        $c.data.transportParam = undefined;
        $c.data.transport1 = $c.data.transport;// перестановка строк
        $c.data.transport = {};
        var categoryParam = $scope.categoryParam;
        $scope.categoryParam = undefined;
        $scope.categoryDataAll = $scope.categoryData;
        $scope.categoryData = $scope.categoryDataP20t;
        
        $timeout(function(){
          $c.data.transport1Param = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории для прицепов"], "placeholder": 'тягач'};
          $c.data.transportParam = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории прицепов для тягачей"], "placeholder": 'прицеп'};
          $c.data.category.selectedItem = {};
          $scope.categoryParam = categoryParam;
        });
      }//console.log("^тягач!!!");
      // 20т прицепы
      else if (item['проект/id'] && item['проект/id'][0] && !$c.data.transport1Param && TransportAskData["категории прицепов для тягачей"].some(function(cid){ return cid == item['категория/id']; })) {
        $c.data.transport1Param = undefined;
        $c.data.transport1 = {};
        $scope.categoryParam.disabled= true;
        $timeout(function(){
          $c.data.transport1Param = {"перевозчик": {id: TransportAskData["наши ТК"]}, "категория": TransportAskData["категории для прицепов"], "placeholder": 'тягач'};
          //~ $c.data.transport2Param = {"перевозчик": $c.data.contragent1, "категория": $c.data.category, };
        });
        
      }
      else $scope.categoryParam.disabled= true;
    } else {//сброс транспорта
      $c.data.transport1Param = undefined;
      $c.data.transport1 = undefined;
      $scope.categoryParam.disabled= false;
      $c.data['наш транспорт'] = undefined;
      
    }
    //~ if (!$c.data.contragent1.id) {// передернуть перевозчика
      $c.data.contragent1Param = undefined;
      $timeout(function(){
        $c.data.contragent1Param = {};
      });
    //~ }
    
    
  };
  $c.OnSelectTransport1 = function(item){//для тягача сцепки
    //~ console.log("OnSelectTransport1", item === $c.data.transport1);
    if(item) {
      
      
    } else {//сброс тягача
      
      var categoryParam = $scope.categoryParam;
      $scope.categoryParam = undefined;
      $c.data.category.selectedItem = {};
      if ($scope.categoryDataAll) $scope.categoryData = /*TransportAskData.category()*/$scope.categoryDataAll;
      $c.data.transportParam =undefined;
      
      $timeout(function(){
        $c.data.transport = {};
        $c.data.transport1 = {};
        $scope.categoryParam=categoryParam;
        $c.data.transportParam = {"перевозчик": angular.copy($c.data.contragent1), "категория": $c.data.category,};
        $c.OnSelectTransport();
      });
    }
    
  };
  var num_timeout;
  $c.FormatNumeric = function(name, idx){
    //~ if(!$c.data[name]) return;
    //~ var dot = /[,.]/.test($c.data[name]);
    if (num_timeout && num_timeout.cancel) num_timeout.cancel();
    num_timeout = $timeout(function(){
      num_timeout = undefined;//.resolve()
      
      if(idx !== undefined) {
        var num = parseFloat(Util.numeric($c.data[name][idx]));
        if (num) $c.data[name][idx] = num.toLocaleString('ru');
        else $c.data[name][idx] = null;
      } else {
        var num = parseFloat(Util.numeric($c.data[name]));
        if (num) $c.data[name] = num.toLocaleString('ru');
        else $c.data[name] = null;
      }
      
        
        //~ $c.data[name] += !/[,.]\d/.test($c.data[name]) && dot ? ',' : '';
        //~ $c.data[name] = Util.money($c.data[name]);
      if($c.data['стоимость'] && $c.data['факт']) {
        var sum = parseFloat(Util.numeric($c.data['стоимость'])) * parseFloat(Util.numeric($c.data['факт']));
        //~ console.log("сумма", sum);
        if(sum) $c.data['сумма'] = (Math.round(sum*100)/100).toLocaleString();
        //~ else $c.data['сумма'] = undefined;
      } else  if ($c.data['стоимость'] && $c.data['тип стоимости'] === 0) {
        $c.data['сумма'] = $c.data['стоимость'];
      } else $c.data['сумма'] = null;
    
      //~ console.log("FormatNumeric сумма", $c.data);
    }, 1000);
  };
  
  $c.ChangePayType = function(){// тип стоимости
    if($c.data['тип стоимости'] === 0) $c.data['факт'] = undefined;
    $c.FormatNumeric('стоимость');
  };
  $c.ChangeGruzOff = function(){
    if($c.data['без груза']) $c.data['груз'] = undefined;
  };
  
  $c.Validate4Date2 = function(){
    var ask = $c.data;
    if (!ask.transport) return false;
    
    return !!(
      ask.transport.title && $c.Validate(ask)
      && ask['стоимость'] && (ask['тип стоимости'] === 0 || (ask['тип стоимости'] && ask['факт']))
      //~ && (ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])
      //~ && ask['дата оплаты']
      //~ && ask['док оплаты']
    );
  };
  
  $c.ValidTransport = function(ask){
    return (!ask['номер'] || ask.transport.title )
      && (!ask.transport1 || (!!ask.transport1.title && !!ask.transport.title) )
      && (!TransportAskData["наши ТК"].some(function(id){ return ask.contragent1.id == id;}) || ask.transport.id);///наш транспорт не новый
    
  };
  
  $c.Validate = function(ask){// минимальная заявка
    if ((ask['номер'] && !ask.transport.title ) || (ask.transport1 && !ask.transport1.title && !ask.transport.title) ) return false;
    
    return !!(
      (ask['наш транспорт'] === undefined || ask['наш транспорт'] || ask.contragent3.id)
      && ask.contragent2.filter(function(item){ return item.id || item.title; }).length // заказчик! || ask.project.id
      && ask.address2.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // куда
      && $c.ValidTransport(ask)
      && (!ask.transport.title || ((ask.category.selectedItem && ask.category.selectedItem.id) && ask.contragent1.title && ask.driver.title)) // транспорт с категорией и перевозчиком || (ask.category.newItems[0].title))
      //~ && (!ask.transport.title  || !ask.contragent1['проект/id'] ||  ask.driver.title) // водитель
      && (ask['без груза'] || ask['груз'] || !!ask['@позиции тмц'])
      //~ && (!ask['стоимость'] || ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])// || ask['тип стоимости'] && ask['факт'])
      && ask['дата3']
    );// return true;
    //~ return false;
    
  };
  $c.Save = function(ask, event){// event -- click
    //~ console.log("Save", ask);
    var draft;
    if(event) {
      draft = ask['черновик'];
      ask['черновик'] = undefined;
    }
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    delete $c.error;
    
    return $http.post(appRoutes.url_for('транспорт/сохранить заявку'), ask, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        console.log("Сохранено", resp.data);
        if(resp.data.error || (resp.data.success && !resp.data.success.id)) {
          if (draft) ask['черновик'] = draft;
          $c.error = resp.data.error || resp.data.success;
          return $c.error;
        }
        else if(resp.data.success && resp.data.success.id) {
          ask['черновик'] = undefined;
          //~ window.location.reload(false);// сложно
          if (event) {
            //~ ask.id = resp.data.success.id;
            var click = $(event.target);
            if(!((click.is('a') && click) || click.closest('a')).text().match(/Сохранить/) ) return 'OK'; // не кнопка сохранить
          }
          ///window.location.href = window.location.pathname+'?id='+ask.id;
          
          $c.Cancel(1).then(function(){ $rootScope.$broadcast('Сохранена заявка на транспорт', resp.data.success); });
          Materialize.toast('Сохранено успешно', 3000, 'card green-text text-darken-4 green lighten-4 fw500 border  animated zoomInUp');
          $Контрагенты.RefreshData();
          TransportData.Refresh();
          ObjectAddrData.RefreshAddr();
        }
        else if (resp.data.draft) {
          //~ Materialize.toast('Черновик сохранен', 1000, 'grey')
          ask.draft_id = resp.data.draft.id;
          return 'Черновик';
        }
      });
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
    copy['дата2'] = undefined;
    copy['это копия'] = true;
    //~ copy['черновик'] = undefined;
    //~ $c.data=undefined;
    //~ $timeout(function(){ $c.data=copy; });
    $c.Cancel();
    $timeout(function(){
      $c.Open(copy);
      Materialize.toast('Это копия', 2000, 'green fw500');
    });
    
  };
  
  $c.Draft = function(ask){// из черновика
    $http.get(appRoutes.url_for('транспорт/черновик заявки')).then(function(resp){
      if (resp.data && resp.data.val) {
        var draft = /*JSON.parse(*/resp.data.data;//);
        if (draft) {
          draft.draft_id = resp.data.id;
          draft.id=undefined;
          //~ $c.param.edit = draft;
          $c.Cancel();
          $timeout(function(){ $c.Open(draft) });
          //~ $c.data = draft;
        }
      } 
      //~ else
      
      
    });
    
  };
  
  $c.PrintDocx = function(ask, check, event){
    if(!check) return TransportAskData["наши ТК"].some(function(id){ return ask.contragent1.id == id || ask.contragent3.id == id });
    $c.Save(ask, event).then(function(val){
      if(val == 'OK') $window.open(appRoutes.url_for('транспорт/заявка.docx', ask.id), '_blank');
    });
    
    
  };
  
  $c.Disable = function(ask, event) {// отмена-отзыв заявки из работы
    ask['отозвать'] = !ask['отозвать'];
    $c.Save(ask, event);
    
  };
  
};

/*=============================================================*/

module

.component('transportAskForm', {
  controllerAs: '$c',
  templateUrl: "transport/ask/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());