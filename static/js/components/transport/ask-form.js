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

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'TransportDriver', 'Куда/объект или адрес', 'TransportItem', 'Util']);//'ngSanitize',, 'dndLists'

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
  };
  
  $ctrl.InitForm = function (){
      ['стоимость', 'факт'].map(function(name){$ctrl.FormatNumeric(name);});
    
  };

  /*var event_hide_list = function(event){
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
      //~ $ctrl.data.driver._fromItem = undefined;
    } //else {
      $ctrl.data.driverParam = undefined;//передернуть компонент водителя
      /*if (!$ctrl.data.transport.id) */$ctrl.data.transportParam = undefined;
      $timeout(function(){
        $ctrl.data.contragent1.id = item && item.id;
        $ctrl.data.contragent1.title = item && item.title;
        $ctrl.data.driverParam = {"перевозчик": $ctrl.data.contragent1};
        /*if (!$ctrl.data.transport.id)*/ $ctrl.data.transportParam = {"заказчик": $ctrl.data.contragent2, "перевозчик": $ctrl.data.contragent1, "категория": $ctrl.data.category};
        //~ $ctrl.data.contragent1['проект/id'] = item && item['проект/id'];
      });
    //}
    
    
    
    
  };
  /*
  $ctrl.OnSelectProject = function(item) {
    //~ console.log("OnSelectProject", item);
    //~ $ctrl.data.project._fromItem = undefined;
  };*/
  $ctrl.OnSelectAddress2 = function(item){
    //~ console.log("OnSelectAddress2", item);
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
        $ctrl.data.driver.title = item['водитель'].join(' ');
        
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
  $ctrl.FormatNumeric = function(name){
    //~ if(!$ctrl.data[name]) return;
    var dot = /[,.]/.test($ctrl.data[name]);
    var num = parseFloat(Util.numeric($ctrl.data[name]));
    if (num) $timeout(function(){
      $ctrl.data[name] = num.toLocaleString('ru');
      $ctrl.data[name] += !/[,.]/.test($ctrl.data[name]) && dot ? ',' : '';
      if($ctrl.data['стоимость'] && $ctrl.data['факт']) {
        var sum = parseFloat(Util.numeric($ctrl.data['стоимость'])) * parseFloat(Util.numeric($ctrl.data['факт']));
        //~ console.log("сумма", sum);
        if(sum) $ctrl.data['сумма'] = (Math.round(sum*100)/100).toLocaleString('ru');
        //~ else $ctrl.data['сумма'] = undefined;
      } else  if ($ctrl.data['стоимость'] && $ctrl.data['тип стоимости'] === 0) {
        $ctrl.data['сумма'] = $ctrl.data['стоимость'];
      } else $ctrl.data['сумма'] = undefined;
    });
    else $timeout(function(){
      $ctrl.data[name] = null;
      $ctrl.data['сумма'] = null;
    });
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
      && ask['дата оплаты']
      && ask['док оплаты']
    );
  };
  
  $ctrl.Validate = function(ask){// минимальная заявка
    return !!(
          (ask.contragent2.id || ask.contragent2.title) // заказчик! || ask.project.id
      && (ask.address2.id || ask.address2.title) // куда
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