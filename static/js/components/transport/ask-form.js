(function () {'use strict';
/*
  Форма заявки транспорта
*/

var moduleName = "TransportAskForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'ProjectItem', 'Куда/объект или адрес', 'TransportItem', 'Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes, TransportAskData, Util) {
  var $ctrl = this;
    
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    $scope.categoryData = TransportAskData.category();
    $scope.categoryParam = {"не добавлять новые позиции": true, "placeholder": 'поиск'};
    $scope.payType = [
      {title:'за час', val:1},
      {title:'за км', val:2},
      {title:'вся сумма', val:0},
    ];
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        if(!newValue && !oldValue) return;
        if (newValue) {
          $ctrl.Open(newValue);
        } else {
          $ctrl.data = undefined;
        }
      }
    );
      
    
    
  };
  $ctrl.Open = function(data){// новая или редактирование
    if(data) $ctrl.data = data;
    else $ctrl.data = TransportAskData.InitAskForm();//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
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
      });
  };
  $ctrl.Cancel = function(){
    //~ if($ctrl.data) $ctrl.data['позиции'].map(function(it){it['обработка']=false;});
    $ctrl.data=undefined;
    $ctrl.param.edit = undefined;
  };
  /*
  $ctrl.OnSelectContragent1 = function(it){//перевозчик
    //~ console.log("OnSelectContragent", it);
    if(!$ctrl.addressField) $ctrl.addressField = $('input[name="адрес отгрузки"]', $($element[0]));
    if (!$ctrl.addressComplete) $ctrl.addressComplete = [];
    $ctrl.addressComplete.length = 0;
    if(!it) return $ctrl.addressField.autocomplete().dispose();
    
    $http.get(appRoutes.url_for('транспорт/техника', it.id)).then(function(resp){
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
      //~ formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        //~ return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      //~ },
      //~ onSelect: function (suggestion) {
        //~ $timeout(function(){
          //~ $ctrl.data.title=suggestion.data.title;
          //~ $ctrl.data.id=suggestion.data.id;
          //~ $ctrl.showListBtn = false;
          //~ if($ctrl.onSelect) $ctrl.onSelect({"item": suggestion.data});
          //~ $ctrl.textField.autocomplete().dispose();
        //~ });
        
      //~ },
      //~ onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      //~ onHide: function (container) {}
      
      });
    });
    
  };*/
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
      //~ if(!item) $ctrl.data.project.title = '';
    }
  };
  $ctrl.OnSelectCategory = function(item){
    //~ console.log("OnSelectCategory", item);
  };
  $ctrl.OnSelectTransport = function(item){
    if (item) {
      $ctrl.data.contragent1._fromItem = item;
      $ctrl.data.contragent1.id = item['перевозчик/id'];
      $ctrl.data.category._fromItem = item;
      $ctrl.data.category.id = item['категория/id'];
      //~ if(!item) $ctrl.data.project.title = '';
    }
    
    
  };
  $ctrl.FormatNumeric = function(name){
    if(!$ctrl.data[name]) return;
    var dot = /[,.]/.test($ctrl.data[name]);
    var num = parseFloat(Util.numeric($ctrl.data[name]));
    if (num) {
      $ctrl.data[name] = num.toLocaleString('ru');
      $ctrl.data[name] += !/[,.]/.test($ctrl.data[name]) && dot ? ',' : '';
      if($ctrl.data['стоимость'] && $ctrl.data['факт']) {
        var sum = parseFloat(Util.numeric($ctrl.data['стоимость'])) * parseFloat(Util.numeric($ctrl.data['факт']));
        if(sum) $ctrl.data['сумма'] = (Math.round(sum*100)/100).toLocaleString('ru');
        else $ctrl.data['сумма'] = undefined;
      } else {
        $ctrl.data['сумма'] = undefined;
      }
      return;
    }
    $ctrl.data[name] = undefined;
    $ctrl.data['сумма'] = undefined;
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
        if(resp.data.success1111) {
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