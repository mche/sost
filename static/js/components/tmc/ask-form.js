(function () {'use strict';
/*
*/

var moduleName = "TMC-Ask-Form";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'NomenItem']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $q, appRoutes) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(data){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param = $ctrl.param;
    if(data) $ctrl.data = data;
    delete $ctrl.ready;
    $timeout(function(){
      $ctrl.InitData();
    });
  };
  $ctrl.InitData = function(){
    var d = new Date();
    if(!$ctrl.data) $ctrl.data = {"дата1": (new Date(d.setDate(d.getDate()+2))).toISOString().replace(/T.+/, ''), "номенклатура":{}};//, {"номенклатура":{}}]}; //});
    
    $timeout(function() {
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        clear: '',
        onSet: $ctrl.SetDate,
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
    });
    $ctrl.ready = true;
    
  };
  $ctrl.CancelBtn = function(){
    $ctrl.data = undefined;
    delete $ctrl.param.id;
    var data = $ctrl.param.edit || $ctrl.param.newX || $ctrl.param.delete;
    //~ delete $ctrl.param.edit._init;// уже!
    if (data && !data._newInit && !data._delete) {
      //~ data['обновить'] = true;//передернуть строку
      
      $timeout(function(){
        //~ delete data['обновить'];// передернуть строку
        $ctrl.param.edit = data;

      });
      
      $timeout(function(){
        $('html, body').animate({
            scrollTop: $("#"+data.id).offset().top
        }, 1500);
        
      });
    }
    
    //~ $ctrl.$onInit();
    
  };
  $ctrl.SetDate = function (context) {// переформат
    var d = $('input[name="date"]', $($element[0]));
    $ctrl.data['дата1'] = d.val();
    //~ d.attr('title', d.val());
  };
  
  $ctrl.Validate = function(ask){
    var id = ask["номенклатура"] && ask["номенклатура"].selectedItem && ask["номенклатура"].selectedItem.id;
    var newItem = ask["номенклатура"] && ask["номенклатура"].newPath && ask["номенклатура"].newPath[0] && ask["номенклатура"].newPath[0].title;
    var kol = parseInt(ask["количество"]);
    //~ console.log("filterValidPos", this, id, newItem, ask["количество"]);
    //~ if(this) return !!id || !!newItem || !!kol;
    return (!!id || !!newItem) & !!kol;
  };
  $ctrl.Save = function(ask){
    /*var edit = $ctrl.data["позиции"].filter(filterValidPos, true);
    if(!ask) {
      var valid = $ctrl.data["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return edit.length && valid.length == edit.length;
      
    }*/
    ask['объект'] = $ctrl.param["объект"].id;
    //~ return console.log("Save", ask);
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить заявку'), ask, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $ctrl.error = resp.data.error;
        if(resp.data.success) {
          if ($ctrl.data.id) {
            $ctrl.parseSum(resp.data.success);
            angular.forEach(resp.data.success, function(val, key){$ctrl.param.edit[key]=val;});
            delete $ctrl.param.newX;
          } else {// новая запись
            delete $ctrl.param.edit;
            resp.data.success._append = true;
            $ctrl.param.newX = resp.data.success;
          }
          $ctrl.CancelBtn();
        }
        console.log("Сохранена заявка", resp.data);
      });
  };
  
  $ctrl.Edit = function(){
    //~ console.log("Edit", $ctrl.param);
    var data = $ctrl.param.edit;
    delete $ctrl.param.edit._init;
    $ctrl.$onInit(data);
    $timeout(function() {
      $('html, body').animate({
          scrollTop: $($element[0]).offset().top //project-list
      }, 1500);
    });
  };
  /*
  $ctrl.ChangeKol=function($last, row){// автовставка новой строки
    if($last && row['количество']) $ctrl.AddRow(true);
  };*/
  /*
  $ctrl.DeleteRow = function($index){
    $ctrl.data['позиции'].splice($index, 1);
  };*/
  
  $ctrl.FocusRow= function(row){
    //~ console.log("FocusRow", row);
    $ctrl.lastFocusRow = row;
  };
  /*
  $ctrl.AddRow = function(last){// last - в конец
    var n = {"номенклатура":{}};
    if(last || !$ctrl.lastFocusRow) return $ctrl.data["позиции"].push(n);
    var index = 1000;
    if($ctrl.lastFocusRow) index = $ctrl.data['позиции'].indexOf($ctrl.lastFocusRow)+1;
    $ctrl.data['позиции'].splice(index, 0, n);
  };*/

  
};

/*=============================================================*/

module

.component('tmcAskForm', {
  templateUrl: "tmc/ask/form",
  //~ scope: {},
  bindings: {
    param: '<',
    data:'<',

  },
  controller: Component
})

;

}());