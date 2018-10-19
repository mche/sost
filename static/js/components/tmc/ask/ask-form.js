(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для нач участков
*/

var moduleName = "ТМЦ форма заявки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Util', 'appRoutes', 'TreeItem', 'Номенклатура']);//'ngSanitize',, 'dndLists'
var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, TMCAskData, Util, $Номенклатура) {
  var $ctrl = this;
  
  $scope.$on('Редактировать заявку ТМЦ', function (event, ask) {

    $ctrl.$onInit(ask);
    $timeout(function() {
      Util.Scroll2El($element[0]);
    });
  });
  
      
  $ctrl.$onInit = function(data){
    if(!$ctrl.param) $ctrl.param = {};
    $scope.param = $ctrl.param;
    //~ if(data) $ctrl.data = data;
    $ctrl.ready = false;
    $timeout(function(){
      $ctrl.InitData(data);
      $ctrl.ready = true;
      
      $('.modal', $($element[0])).modal({
        "noOverlay": true,///absolute!
      });
      
    });
  };
  $ctrl.InitData = function(data){
    if(data) $ctrl.data = data;
    if(!$ctrl.data) return;
    //~ $scope.Nomen = {selectedItem: {id: $ctrl.data['номенклатура/id']}, newItems:[{title:$ctrl.data['наименование'] || ''}]};
    $ctrl['@номенклатура']=[];
    $Номенклатура.Load(0).then(function(data){ Array.prototype.push.apply($ctrl['@номенклатура'], data); });//$http.get(appRoutes.url_for('номенклатура/список', 0));
    if($ctrl.data['количество']) $ctrl.data['количество'] = parseFloat($ctrl.data['количество']).toLocaleString('ru-RU');//($ctrl.data['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
    if (!$ctrl.data['наименование'] && $ctrl.data['номенклатура'] && $ctrl.data['номенклатура'].pop) $ctrl.data['наименование'] = $ctrl.data['номенклатура'].join(' ');
    
    $timeout(function() {
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {var s = this.component.item.select; $ctrl.data['дата1'] = [s.year, s.month+1, s.date].join('-'); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
        //~ min: $ctrl.data.id ? undefined : new Date()
        //~ editable: $ctrl.data.transport ? false : true
      });//{closeOnSelect: true,}
      $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
      $('textarea', $element[0]).keydown();
    });
    
    
  };
  $ctrl.New = function(){
    //~ var d = new Date();
    //~ var data  = {"дата1": (new Date(d.setDate(d.getDate()+2))).toISOString().replace(/T.+/, ''), "номенклатура":{}, "_new": true,};//, {"номенклатура":{}}]}; //});
    var data  = TMCAskData.NewAsk();
    //~ .then(function(resp){
      //~ angular.forEach(resp.data, function(val, key){data[key] = val;});
    $ctrl.InitData(data);
    //~ });
  };
  $ctrl.CancelBtn = function(){
    var id = $ctrl.data.id;
    $ctrl.data._edit = false;
    $ctrl.data = undefined;
    
    //~ $ctrl.param.edit = undefined;
    //~ delete $ctrl.param.id;
    //~ var data = $ctrl.param.edit || $ctrl.param.newX || $ctrl.param.delete;
    //~ if (data && !data._newInit && !data._delete) {
      
      //~ $timeout(function(){
        //~ $ctrl.param.edit = data;

      //~ });
      
      $timeout(function(){
        Util.Scroll2El($("#"+id));
      });
    //~ }
    
    //~ $ctrl.$onInit();
    
  };
  
  $ctrl.Validate = function(ask){
    //~ var id = $scope.Nomen.selectedItem.id; //ask["номенклатура"] && ask["номенклатура"].selectedItem && ask["номенклатура"].selectedItem.id;
    //~ var newItem = $scope.Nomen.newItems && $scope.Nomen.newItems[0] && $scope.Nomen.newItems[0].title; // ask["номенклатура"] && ask["номенклатура"].newItems && ask["номенклатура"].newItems[0] && ask["номенклатура"].newItems[0].title;
    var kol = parseInt(ask["количество"]);
    //~ console.log("filterValidPos", this, id, newItem, ask["количество"]);
    //~ if(this) return !!id || !!newItem || !!kol;
    return /*(!!id || !!newItem)*/ !!$ctrl.data['наименование'] && !!kol;
  };
  $ctrl.Save = function(ask){
    /*var edit = $ctrl.data["позиции"].filter(filterValidPos, true);
    if(!ask) {
      var valid = $ctrl.data["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return edit.length && valid.length == edit.length;
      
    }*/
    //~ ask["номенклатура"] = $scope.Nomen;
    ask['объект'] = $ctrl.param["объект"].id;
    //~ return console.log("Save", ask);
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerHttp = true;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить заявку'), ask)///, {timeout: $ctrl.cancelerHttp.promise}
      .then(function(resp){
        delete $ctrl.cancelerHttp;
        if(resp.data.error) {
          //~ $ctrl.cancelerHttp.reject();
          Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
          $ctrl.error = resp.data.error;
        }
        if(resp.data.success) {
          //~ $ctrl.cancelerHttp.resolve();
          if (!$ctrl.data.id) resp.data.success._new = true;///для сортировки пригодилось
          Materialize.toast('Сохранена заявка ТМЦ', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          $rootScope.$broadcast('Сохранена заявка ТМЦ', resp.data.success);
          /*
          if ($ctrl.data.id) {
            //~ $ctrl.parseSum(resp.data.success);
            $ctrl.param.edit._reinit = true;
            $timeout(function(){ angular.forEach(resp.data.success, function(val, key){$ctrl.param.edit[key]=val;}); $ctrl.param.edit._reinit = false; });
            
            //~ delete $ctrl.param.newX;
          } else {// новая запись
            //~ delete $ctrl.param.edit;
            //~ resp.data.success._append = true;
            $ctrl.param.append = resp.data.success;// прокинет через watch
          }*/
          $timeout(function(){$ctrl.CancelBtn();});
          $Номенклатура.Refresh(0)/*["Список без потомков"]*/.Load(0).then(function(data){ $ctrl['@номенклатура'].length=0; Array.prototype.push.apply($ctrl['@номенклатура'], data); });
        }
        delete $ctrl.cancelerHttp;
        //~ console.log("Сохранена заявка", resp.data);
      },
      function(resp){//rejection
        console.log("Ошибка", resp);
      }
      );
  };
  
  $ctrl.Delete = function(ask) {
    if(ask['тмц/снаб/id']) return;
    if (!ask.id) return;
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    $ctrl.cancelerHttp = !0;
    delete $ctrl.error;
    
    $http.post(appRoutes.url_for('тмц/удалить заявку'), ask)///, {timeout: $ctrl.cancelerHttp.promise}
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
        }
        if(resp.data.remove) {
          Materialize.toast('Удалена заявка ТМЦ', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
           $rootScope.$broadcast('Удалена заявка ТМЦ', resp.data.remove);
          //~ $ctrl.param.remove = ask;//resp.data.remove;  // прокинет через watch
          $timeout(function(){$ctrl.CancelBtn();});
        }
        console.log(" Удалена заявка", resp.data);
      });
  };
  
  //~ $ctrl.Edit = function(){
    //~ console.log("Edit", $ctrl.param);
    
  //~ };
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

/******************************************************/
var Data  = function($http, appRoutes){
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  return {
    NewAsk: function() {// новая заявка - форма
      var d = new Date();
      return {"дата1": (new Date(d.setDate(d.getDate()+7))).toISOString().replace(/T.+/, ''), "номенклатура":{}, "_new": true,};
    },
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory('TMCAskData', Data)

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