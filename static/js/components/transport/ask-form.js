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
  5. Машина (категория и перевозчик, без перевозчика машина будет собственная)
  6. Стоимость (опционально)
  
  Заявка завершена:
  7. Дата завершения
  8. Факт (оплата)
  
*/
  
var moduleName = "TransportAskForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'ProjectItem', 'ProfileItem', 'Куда/объект или адрес', 'TransportItem', 'Util']);//'ngSanitize',, 'dndLists'

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
    $ctrl.data = TransportAskData.InitAskForm(data);//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    $ctrl.param.edit = $ctrl.data;
    $ctrl.data._open = true;
    $timeout(function(){
        $('input.datepicker', $($element[0])).each(function(){
            var input = $(this);
            var name = input.attr('name');
            input.pickadate({// все настройки в файле русификации ru_RU.js
            clear: '',
            formatSkipYear: true,// доп костыль - дописывать год при установке
            onSet: function(context){ var s = this.component.item.select; $ctrl.data[name] = [s.year, s.month+1, s.date].join('-'); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          });
        });
        //~ if($ctrl.data && $ctrl.data.contragent && $ctrl.data.contragent.id) $ctrl.OnSelectContragent($ctrl.data.contragent);
        //~ Util.Scroll2El($element[0]);
        $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
      });
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
    
  };
  
  $ctrl.OnSelectContragent1 = function(item){// заказчик
    //~ console.log("OnSelectContragent1", item);
    if(item) $ctrl.data.contragent1._fromItem = item;
    else {
      $ctrl.data.transport.id = undefined;
      $ctrl.data.transport.title= undefined;
    }
    $ctrl.data.contragent1.id = item && item.id;
    $ctrl.data.contragent1.title = item && item.title;
    
    
  };
  
  $ctrl.OnSelectProject = function(item) {
    //~ console.log("OnSelectProject", item);
    //~ $ctrl.data.project._fromItem = undefined;
  };
  $ctrl.OnSelectAddress2 = function(item){
    //~ console.log("OnSelectAddress2", item);
    if (item) {
      $ctrl.data.project._fromItem = item;
      $ctrl.data.project.id = item['проект/id'];
    }
  };
  $ctrl.OnSelectCategory = function(item){//
    //~ console.log("OnSelectCategory", item);
    $ctrl.data.category.selectedItem = item;
    //~ Object.keys(item).each(function(key){$ctrl.data.category.selectedItem[key]=item[key];})
  };
  $ctrl.OnSelectTransport = function(item){
    //~ console.log("OnSelectTransport", item);
    //~ var prev = $ctrl.data.contragent1._fromItem;
    if (item) {
      $ctrl.data.contragent1.id = item['перевозчик/id'];
      $ctrl.data.category.selectedItem.id = item['категория/id'];
      if (item['водитель/id'] && !$ctrl.data.driver.id) $ctrl.data.driver.id = item['водитель/id'];
    }
    //~ else {//if (prev) { в компоненте транспорт transport-item
      //~ $ctrl.data.contragent1.id = null;
    //~ }
    //~ else $ctrl.data.contragent1.id = undefined;
    
    $ctrl.data.contragent1._fromItem = item;
    $ctrl.data.category._fromItem = item;
    
    
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
      } else {
        //~ $ctrl.data['сумма'] = undefined;
      }
    });
    else $timeout(function(){
      $ctrl.data[name] = null;
      $ctrl.data['сумма'] = null;
    });
  };
  
  $ctrl.ChangePayType = function(){// тип стоимости
    if($ctrl.data['тип стоимости'] === 0) $ctrl.data['факт'] = undefined;
    
  };
  $ctrl.ChangeGruzOff = function(){
    if($ctrl.data['без груза']) $ctrl.data['груз'] = undefined;
  };
  
  $ctrl.Validate = function(ask){
    if (
          (ask.contragent2.id || ask.contragent2.title || ask.project.id)
      && (ask.address2.id || ask.address2.title)
      && (!ask.transport.title || (ask.category.selectedItem && ask.category.selectedItem.id)) // || (ask.category.newItems[0].title))
      && (!ask.transport.title || ask.contragent1.id || ask.driver.id)
      && (ask['без груза'] || ask['груз'])
      && (!ask['стоимость'] || ask['тип стоимости'] !== undefined)
    ) return true;
    return false;
    
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