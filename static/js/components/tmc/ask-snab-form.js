(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для снабженца
*/

var moduleName = "TMCAskSnabForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'NomenItem', 'ContragentItem', 'Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes, TMCAskSnabData, Util) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param=$ctrl.param;
    $ctrl.ready = true;
    
    $scope.$watch(
      function(scope) { return $ctrl.param.edit; },
      function(newValue, oldValue) {
        if (newValue) {
          //~ console.log("watch edit newValue", newValue);
          $ctrl.Open(newValue);
        }
        //~ else console.log("watch edit oldValue", oldValue);
      }
    );
    
  };
  $ctrl.Open = function(data){// новая или редактирование
    if(data) $ctrl.data = data;
    else $ctrl.data = TMCAskSnabData.InitAskForm();//{"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    $ctrl.param.edit = $ctrl.data;
    $ctrl.data._open = true;
    $timeout(function(){
        $('input[name="дата отгрузки"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          //~ setData: function(val){ $ctrl.data['дата отгрузки'] = val;},
          //~ setDataField: ,
          //~ row_idx: $index,
          onSet: function(context){ var s = this.component.item.select; $ctrl.data['дата отгрузки'] = [s.year, s.month+1, s.date].join('-'); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$ctrl.SetDate,
          //~ min: $ctrl.data.id ? undefined : new Date()
          //~ editable: $ctrl.data.transport ? false : true
        });//{closeOnSelect: true,}
      });
  };
  $ctrl.Cancel = function(){
    if($ctrl.data) $ctrl.data['позиции'].map(function(it){it['обработка']=false;});
    $ctrl.data=undefined;
    $ctrl.param.edit = undefined;
  };
  $ctrl.InitForm = function(){
    
    
  };
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
      
    }
    
  };
  $ctrl.SetDate = function (context) {// переформат
    //~ console.log("SetDate", this.component.settings, $(this._hidden).val());
    var d = $(this._hidden).val();
    var row = this.component.settings.setData;
    var key = this.component.settings.setDataField;
    //~ var row = $ctrl.data['позиции'][this.component.settings.row_idx];
    row[key] = d;
    //~ console.log("SetDate", row);
  };
  $ctrl.ChangeRow = function(row){
    //~ p '455.66.66.23' =~ s/(\.)(?=.*\1)//gr;
    //~ row['количество'] = parseFloat((row['количество'] || '').replace(/[,\-]/, '.'));//replace(/[^\d.,]/, '');
    //~ row['цена'] = parseFloat((row['цена'] || '').replace(/[,\-]/, '.'));
    row['количество'] = (row['количество'] || '').replace(/[^\d.,\-]/g, '');
    row['цена'] = (row['цена'] || '').replace(/[^\d.,\-]/g, '');
    var k = parseFloat(Util.numeric(row['количество']));
    var c = parseFloat(Util.numeric(row['цена']));
    var s = Math.round(k*c*100)/100;
    if(s) row['сумма']=Util.money(s.toLocaleString('ru-RU'));//Util.money(s);
    
  };
  $ctrl.OnSelectContragent = function(it){
    console.log("OnSelectContragent", it);
    
    
  };
  
  var filterValidPos = function(row){
    var id = row.nomen && row.nomen.selectedItem && row.nomen.selectedItem.id;
    var newNom = row.nomen && row.nomen.newPath && row.nomen.newPath[0] && row.nomen.newPath[0].title;
    var kol = parseInt(row["количество"]);
    var cena = parseInt(row["цена"]);
    //~ console.log("filterValidPos", this, id, newItem, row["количество"]);
    if(this) return !!id || !!newNom || !!kol || !!cena;
    return (!!id || !!newNom) & !!kol & !!cena;
  };
  $ctrl.Save = function(ask){
    if(!ask) {
      //~ var edit = $ctrl.data["позиции"].filter(filterValidPos, true);
      var valid = $ctrl.data["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return $ctrl.data['дата отгрузки'] && $ctrl.data.contragent && ($ctrl.data.contragent.id || $ctrl.data.contragent.title) && valid.length == $ctrl.data["позиции"].length;//edit.length;
    }
    ask['объект'] = $ctrl.param["объект"].id;
    //~ return console.log("Save", ask);
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить заявку/оплата'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        console.log("Save", resp.data);
      });
  };
  
  $ctrl.ChangeKol=function($last, row){// автовставка новой строки
    if($last && row['количество']) $ctrl.AddPos(true);
  };
  
  $ctrl.DeleteRow = function($index){
    $ctrl.data['позиции'][$index]['обработка'] = false;
    $ctrl.data['позиции'].splice($index, 1);
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

  
};

/*=============================================================*/

module

.component('tmcAskSnabForm', {
  templateUrl: "tmc/ask/snab/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());