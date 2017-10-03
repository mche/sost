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

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'TransportAskContact', 'Объект или адрес', 'TransportItem', 'Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes, TransportAskData, Util) {
  var $ctrl = this;
    
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param= $ctrl.param;
    $scope.categoryData = TransportAskData.category();
    $scope.categoryParam = {"не добавлять новые позиции": true, "placeholder": 'поиск'};
    $scope.payType = TransportAskData.payType();
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        if(!newValue && !oldValue) return;
        if (newValue) {
          $ctrl.data = undefined;
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
    $ctrl.data = TransportAskData.InitAskForm(data);//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    //~ $ctrl.param.edit = $ctrl.data;
    //~ $ctrl.data._open = true;
    $timeout(function(){
        $('input.datepicker', $($element[0])).each(function(){
            var input = $(this);
            var name = input.attr('name');
            input.pickadate({// все настройки в файле русификации ru_RU.js
            clear: '',//name == 'дата2' ? '<i class="material-icons red-text">remove_circle_outline</i>' : '',
            formatSkipYear: true,// доп костыль - дописывать год при установке
            //~ onClose: function(context) { console.log("onClose: this, context, arguments", this, context, arguments); },
            onSet: function(context){
               //~ console.log("onSet: this, context", this, context);
              var s = this.component.item.select;
              if(s) $ctrl.data[name] = [s.year, s.month+1, s.date].join('-');
              else $ctrl.data[name] = undefined;
              //~ $(this._hidden).val($ctrl.data[name]);
            },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          });
        });
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        //~ Util.Scroll2El($element[0]);
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        
        $ctrl.StopWatchContragent1 = $ctrl.WatchContragent1();
        $ctrl.StopWatchContragent2 = $ctrl.WatchContragent2();
        $ctrl.StopWatchAddress2 = $ctrl.WatchAddress2();
        $ctrl.StopWatchAddress1 = $ctrl.WatchAddress1();
        
        if (data.OnSelectTransport) $ctrl.OnSelectTransport(data.OnSelectTransport);// из свободного транспорта
      });
      
      
  };
  $ctrl.ClearDate = function(name){
    $ctrl.data[name] = 0;
    //~ if(!$ctrl.clearDate) $ctrl.clearDate = {};
    //~ $ctrl.clearDate[name] = 0;
    $timeout(function(){ $ctrl.data[name] = null; });
    
  };
  $ctrl.Cancel = function(){
    //~ if($ctrl.data) $ctrl.data['позиции'].map(function(it){it['обработка']= false;});
    $ctrl.data= undefined;
    $ctrl.param.edit = undefined;
    $ctrl.StopWatchContragent1();
    $ctrl.StopWatchContragent2();
    $ctrl.StopWatchAddress1();
    $ctrl.StopWatchAddress2();
  };
  
  $ctrl.InitForm = function (){
      ['стоимость', 'факт'].map(function(name){$ctrl.FormatNumeric(name);});
    
  };

  $ctrl.WatchContragent2 = function(){
    return $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.data.contragent2; },
      function(newValue, oldValue) {
        if (!newValue.id && newValue.id !== null && newValue.title ) {// передернуть адрес
          newValue.id = null;// особо сбросить собственные объекты
          $ctrl.data.addressParam = undefined;
          //~ $ctrl.data.address1Param = undefined;
          $timeout(function(){
            $ctrl.data.addressParam = {"заказчик": newValue};
            //~ $ctrl.data.address1Param = {"заказчик": newValue};
          }, 10);
        }
        else if (!newValue.id && oldValue.id) {
          $ctrl.data.address2 = [{title: ''}];
          $ctrl.data.address1 = [{title: ''}];
        }
      },
      true// !!!!
    );
  };
  $ctrl.OnSelectContragent2 = function(item){// заказчик
    //~ console.log("OnSelectContragent2", item);
    //~ if(item) $ctrl.data.contragent2._fromItem = item;
    if (!item) {
      if ($ctrl.data.address2.id)  $ctrl.data.address2.title= undefined;
      $ctrl.data.address2.id = undefined;
    }
    
    $ctrl.data.contragent2.id = item && item.id;
    $ctrl.data.contragent2.title = item && item.title;
    $ctrl.data.contragent2['проект/id'] = item && item['проект/id'];
    $ctrl.data.addressParam = undefined;
    //~ $ctrl.data.address1Param = undefined;
    $timeout(function(){
      $ctrl.data.addressParam = {"заказчик": $ctrl.data.contragent2};
      //~ $ctrl.data.address1Param = {"заказчик": $ctrl.data.contragent2};
      
    }, 10);
    
  };
  
  $ctrl.WatchContragent1 = function(){// перевозчик
    return $scope.$watch(//console.log("set watcher $ctrl.item", 
      function(scope) { return $ctrl.data.contragent1; },
      function(newValue, oldValue) {
        //~ console.log(" WatchContragent1 ", newValue, oldValue);
        if (newValue.id && !oldValue.id || newValue.id && oldValue.id && newValue.id == oldValue.id) return;
        if (!newValue.title) {
          newValue.id = undefined;
        } else if (!newValue.id && newValue.id !== null && newValue.title ) {// передернуть транспорт
          newValue.id = null;// особо сбросить собственный транспорт
          if ($ctrl.data.driver.id) $ctrl.data.driver.title = undefined;//  сбросить нашего водилу
          $ctrl.data.driver.id = undefined;
        } //else 
        $ctrl.data.transportParam = undefined;
        $timeout(function(){
          $ctrl.data.transportParam = {"заказчик": $ctrl.data.contragent2, "контрагент": newValue, "категория": $ctrl.data.category};
        });
        
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
      //~ $ctrl.data.transport._fromItem = undefined;
      if ($ctrl.data.driver.id) $ctrl.data.driver.title = undefined;
      $ctrl.data.driver.id = undefined;
      $ctrl.data.contact1.title = undefined;
      $ctrl.data.contact1.phone = undefined;
    } //else {
      $ctrl.data.driverParam = undefined;//передернуть компонент водителя
      $ctrl.data.contact1Param = undefined;//передернуть компонент 
    $ctrl.data.contact2Param = undefined;//передернуть компонент 
      /*if (item && item.id)*/ $ctrl.data.transportParam = undefined;
      $timeout(function(){
        $ctrl.data.contragent1.id = item && item.id;
        $ctrl.data.contragent1.title = item && item.title;
        $ctrl.data.driverParam = {"контрагент": $ctrl.data.contragent1, "контакт":"водитель"};
        /*if (item && item.id)*/ 
        $ctrl.data.transportParam = {"заказчик": $ctrl.data.contragent2, "перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category};
        $ctrl.data.contact1Param = {"контрагент": $ctrl.data.contragent1, "контакт":"контакт1"};
        $ctrl.data.contact2Param = {"контрагент": $ctrl.data.contragent2, "контакт":"контакт2"};
        //~ $ctrl.data.contragent1['проект/id'] = item && item['проект/id'];
      });
    //}
  };
  
  var func_address = function(newValue, oldValue) {
    //~ console.log(" WatchAddress ", newValue, oldValue);
    // в массиве адресов найти индексы эл-тов с пустыми title
    var emp = newValue.filter(function(it){  return !it.title; });
    // если два эл-та - один почикать
    if (emp.length == 2) {
      newValue.splice(newValue.indexOf(emp.pop()), 1);
      newValue.splice(newValue.indexOf(emp.pop()), 1);
    }
    // если нет пустых - добавить
    else if (emp.length === 0 ) newValue.push({title:'', _idx: newValue.length});
  };
  $ctrl.WatchAddress1 = function(){// куда
    return $scope.$watch(
      function(scope) { return $ctrl.data.address1; },
      func_address,
      true// !!!!
    );
  };
  $ctrl.WatchAddress2 = function(){// куда
    return $scope.$watch(
      function(scope) { return $ctrl.data.address2; },
      func_address,
      true// !!!!
    );
  };
  $ctrl.OnSelectAddress = function(item){
    //~ console.log("OnSelectAddress2", item);
    if($ctrl.data.contragent2.title) return;
    if (item) {
      //~ $ctrl.data.project._fromItem = item;
      //~ $ctrl.data.project.id = item['проект/id'];
      $ctrl.data.contragent2._fromItem = item;
      if(item['контрагент/id']) $ctrl.data.contragent2.id = item['контрагент/id'];
      //~ $ctrl.data.contragent2.title = item['контрагент'];
    }
    $ctrl.data.contragent2Param = undefined;// передернуть компонент заказчика
    $timeout(function(){
      $ctrl.data.contragent2Param = {};
    });
    
  };
  $ctrl.Address2Hide = function(){
    return $ctrl.data.address2.filter(function(item){ return !!item.title;}).pop();
    
  };
  
  $ctrl.OnSelectCategory = function(item){//
    //~ console.log("OnSelectCategory", item);
    $ctrl.data.category.selectedItem = item;
    if ((!item || !item.id) && $ctrl.data.transport.id) {
      $ctrl.data.transport.id= undefined;
      $ctrl.data.transport.title= undefined;
    }
    $ctrl.data.transportParam = undefined;
    $timeout(function(){
      $ctrl.data.transportParam = {"заказчик": $ctrl.data.contragent2, "перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category};
    });
  };
  $ctrl.OnSelectTransport = function(item){
    //~ console.log("OnSelectTransport", item);
    if (item) {
      if (item['перевозчик/id'].length == 1) $ctrl.data.contragent1.id = item['перевозчик/id'][0];
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
    }
    //~ if (!$ctrl.data.contragent1.id) {// передернуть перевозчика
      $ctrl.data.contragent1Param = undefined;
      $timeout(function(){
        $ctrl.data.contragent1Param = {};
      });
    //~ }
    
    
    //~ else {//if (prev) { в компоненте транспорт transport-item
      //~ $ctrl.data.contragent1.id = null;
    //~ }
    //~ else $ctrl.data.contragent1.id = undefined;
    
    //~ $ctrl.data.contragent1._fromItem = item;
    //~ $ctrl.data.category._fromItem = item;
    
    
  };
  var num_timeout;
  $ctrl.FormatNumeric = function(name){
    //~ if(!$ctrl.data[name]) return;
    //~ var dot = /[,.]/.test($ctrl.data[name]);
    if (num_timeout && num_timeout.cancel) num_timeout.cancel();
    num_timeout = $timeout(function(){
      num_timeout = undefined;//.resolve()
      var num = parseFloat(Util.numeric($ctrl.data[name]));
      if (num) $ctrl.data[name] = num.toLocaleString('ru');
      else $ctrl.data[name] = null;
        
        //~ $ctrl.data[name] += !/[,.]\d/.test($ctrl.data[name]) && dot ? ',' : '';
        //~ $ctrl.data[name] = Util.money($ctrl.data[name]);
      if($ctrl.data['стоимость'] && $ctrl.data['факт']) {
        var sum = parseFloat(Util.numeric($ctrl.data['стоимость'])) * parseFloat(Util.numeric($ctrl.data['факт']));
        //~ console.log("сумма", sum);
        if(sum) $ctrl.data['сумма'] = (Math.round(sum*100)/100).toLocaleString('ru');
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
    return !!(
      ask.transport.title && $ctrl.Validate(ask)
      && ask['стоимость']
      //~ && (ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])
      //~ && ask['дата оплаты']
      //~ && ask['док оплаты']
    );
  };
  
  $ctrl.Validate = function(ask){// минимальная заявка
    return !!(
          (ask.contragent2.id || ask.contragent2.title) // заказчик! || ask.project.id
      && ( ask.address2.filter(function(it){ return !!it.title; }).pop() ) // куда
      && (!ask.transport.title || ((ask.category.selectedItem && ask.category.selectedItem.id) && ask.contragent1.title)) // транспорт с категорией и перевозчиком || (ask.category.newItems[0].title))
      && (!ask.transport.title  || !ask.contragent1['проект/id'] ||  ask.driver.title) // водитель
      && (ask['без груза'] || ask['груз'])
      && (!ask['стоимость'] || ask['тип стоимости'] === 0 || ask['тип стоимости'] && ask['факт'])// || ask['тип стоимости'] && ask['факт'])
    );// return true;
    //~ return false;
    
  };
  $ctrl.Save = function(ask){
    console.log("Save", ask);
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('транспорт/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        console.log("Сохранено", resp.data);
        if(resp.data.success) {
          window.location.reload(false);// сложно 
        }
      });
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