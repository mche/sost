(function () {'use strict';
/*
  Форма заявки транспорта
*/

var moduleName = "TransportAskForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem', 'ContragentItem', 'Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes, TransportAskData, Util) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    $scope.categoryData = $http.get(appRoutes.url_for('категории/список', 34708));
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
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
    
  };*/
  /*
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
    
  };*/
  $ctrl.OnSelectContragent = function(it){
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
  };
  
  $ctrl.Validate = function(ask){
    
    
  };

  $ctrl.Save = function(ask){
    if(!ask) {
      //~ console.log("Save", edit.length, valid.length);
      return $ctrl.data['дата отгрузки'] && $ctrl.data.contragent && ($ctrl.data.contragent.id || $ctrl.data.contragent.title) && valid.length == $ctrl.data["позиции"].length;//edit.length;
    }
    ask['объект'] = $ctrl.param["объект"].id;
    console.log("Save", ask);
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('транспорт/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        //~ console.log("Save", resp.data);
        if(resp.data.success) {
          window.location.reload(false);// сложно 
        }
          /*var n = []; // массив новых строк закинуть через watch
          var ID = 0; //ид строки тмц/снаб
          resp.data.success.forEach(function(it){
            ID=it["тмц/снаб/id"];
            $ctrl.data["позиции"].some(function(ed){
              if(ed._data && it.id == ed._data.id) { // старая позиция
                for (var prop in ed._data) delete ed._data[prop];// почикать все прежние жанные
                angular.forEach(it, function(val, name){
                  ed._data[name] = val;
                });
                return true;
              } else { // новая позиция - прокинуть в массив табличных данных
                n.push(it);
              }
            });
          });
        }
        if(n.length) $ctrl.param['новые данные'] = n; // подхватит watch в табличном компоненте
        $ctrl.Cancel();
        $timeout(function(){
          Util.Scroll2El($('#'+ID));
        });*/
      });
  };
  /*
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
  };*/

  
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