(function () {'use strict';
/*
  Форма заявки снабжения ТМЦ для нач участков
*/

var moduleName = "ТМЦ форма заявки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Util', 'appRoutes', 'TreeItem', 'Номенклатура']);//'ngSanitize',, 'dndLists'
var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, TMCAskData, Util, $Номенклатура) {
  var $c = this;
  
  $scope.$on('Редактировать заявку ТМЦ', function (event, ask) {

    $c.$onInit(ask);
    $timeout(function() {
      Util.Scroll2El($element[0]);
    });
  });
  
      
  $c.$onInit = function(data){
    if(!$c.param) $c.param = {};
    $scope.param = $c.param;
    //~ if(data) $c.data = data;
    $c.ready = false;
    $timeout(function(){
      $c.InitData(data);
      $c.ready = true;
      
      $('.modal', $($element[0])).modal({
        //~ "noOverlay": true,///absolute!
      });
      
    });
  };
  $c.InitData = function(data){
    if(data) $c.data = data;
    if(!$c.data) return;
    //~ $scope.Nomen = {selectedItem: {id: $c.data['номенклатура/id']}, newItems:[{title:$c.data['наименование'] || ''}]};
    $c['@номенклатура']=[];
    $Номенклатура.Load(0).then(function(data){ Array.prototype.push.apply($c['@номенклатура'], data); });//$http.get(appRoutes.url_for('номенклатура/список', 0));
    if($c.data['количество']) $c.data['количество'] = parseFloat($c.data['количество']).toLocaleString('ru-RU');//($c.data['количество'] || '').replace(/[^\d.,\-]/g, '').replace(/\./, ',');
    if (!$c.data['наименование'] && $c.data['номенклатура'] && $c.data['номенклатура'].pop) $c.data['наименование'] = $c.data['номенклатура'].join(' ');
    
    $timeout(function() {
      $('.datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        formatSkipYear: true,// доп костыль - дописывать год при установке
        onSet: function (context) {var s = this.component.item.select; $c.data['дата1'] = [s.year, s.month+1, s.date].join('-'); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-'); },
        //~ min: $c.data.id ? undefined : new Date()
        //~ editable: $c.data.transport ? false : true
      });//{closeOnSelect: true,}
      $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
      $('textarea', $element[0]).keydown();
    });
    
    
  };
  $c.New = function(){
    //~ var d = new Date();
    //~ var data  = {"дата1": (new Date(d.setDate(d.getDate()+2))).toISOString().replace(/T.+/, ''), "номенклатура":{}, "_new": true,};//, {"номенклатура":{}}]}; //});
    var data  = TMCAskData.NewAsk();
    //~ .then(function(resp){
      //~ angular.forEach(resp.data, function(val, key){data[key] = val;});
    $c.InitData(data);
    //~ });
  };
  $c.CancelBtn = function(){
    
    $('.card:first', $element[0]).removeClass('zoomOutUp').addClass('zoomOutUp');
    //~ $c.param.edit = undefined;
    //~ delete $c.param.id;
    //~ var data = $c.param.edit || $c.param.newX || $c.param.delete;
    //~ if (data && !data._newInit && !data._delete) {
      
      
      $timeout(function(){
        var id = $c.data.id;
        $c.data._edit = false;
        $c.data = undefined;
        
        ///нельзя скролл перефильтровывается список заявок
        //~ Util.Scroll2El($("#"+id));
        //~ $('html,body').animate({scrollTop: $("#"+id).offset().top}, 1500);
      }, 0);/// 400
    
  };
  
  $c.Validate = function(ask){
    //~ var id = $scope.Nomen.selectedItem.id; //ask["номенклатура"] && ask["номенклатура"].selectedItem && ask["номенклатура"].selectedItem.id;
    //~ var newItem = $scope.Nomen.newItems && $scope.Nomen.newItems[0] && $scope.Nomen.newItems[0].title; // ask["номенклатура"] && ask["номенклатура"].newItems && ask["номенклатура"].newItems[0] && ask["номенклатура"].newItems[0].title;
    var kol = parseInt(ask["количество"]);
    //~ console.log("filterValidPos", this, id, newItem, ask["количество"]);
    //~ if(this) return !!id || !!newItem || !!kol;
    return /*(!!id || !!newItem)*/ !!$c.data['наименование'] && !!kol;
  };
  $c.Save = function(ask){
    /*var edit = $c.data["позиции"].filter(filterValidPos, true);
    if(!ask) {
      var valid = $c.data["позиции"].filter(filterValidPos);
      //~ console.log("Save", edit.length, valid.length);
      return edit.length && valid.length == edit.length;
      
    }*/
    //~ ask["номенклатура"] = $scope.Nomen;
    ask['объект'] = $c.param["объект"].id;
    //~ return console.log("Save", ask);
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = true;
    delete $c.error;
    
    $http.post(appRoutes.url_for('тмц/сохранить заявку'), ask)///, {timeout: $c.cancelerHttp.promise}
      .then(function(resp){
        delete $c.cancelerHttp;
        if(resp.data.error) {
          //~ $c.cancelerHttp.reject();
          Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
          $c.error = resp.data.error;
        }
        if(resp.data.success) {
          //~ $c.cancelerHttp.resolve();
          if (!$c.data.id) resp.data.success._new = true;///для сортировки пригодилось
          Materialize.toast('Сохранена заявка ТМЦ', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          $rootScope.$broadcast('Сохранена заявка ТМЦ', resp.data.success);
          /*
          if ($c.data.id) {
            //~ $c.parseSum(resp.data.success);
            $c.param.edit._reinit = true;
            $timeout(function(){ angular.forEach(resp.data.success, function(val, key){$c.param.edit[key]=val;}); $c.param.edit._reinit = false; });
            
            //~ delete $c.param.newX;
          } else {// новая запись
            //~ delete $c.param.edit;
            //~ resp.data.success._append = true;
            $c.param.append = resp.data.success;// прокинет через watch
          }*/
          $timeout(function(){$c.CancelBtn();}, 0);
          $Номенклатура.Refresh(0)/*["Список без потомков"]*/.Load(0).then(function(data){ $c['@номенклатура'].length=0; Array.prototype.push.apply($c['@номенклатура'], data); });
        }
        delete $c.cancelerHttp;
        //~ console.log("Сохранена заявка", resp.data);
      },
      function(resp){//rejection
        console.log("Ошибка", resp);
      }
      );
  };
  
  $c.Delete = function(ask) {
    if(ask['тмц/снаб/id']) return;
    if (!ask.id) return;
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = !0;
    delete $c.error;
    
    $http.post(appRoutes.url_for('тмц/удалить заявку'), ask)///, {timeout: $c.cancelerHttp.promise}
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data.error) {
          $c.error = resp.data.error;
        }
        if(resp.data.remove) {
          Materialize.toast('Удалена заявка ТМЦ', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
           $rootScope.$broadcast('Удалена заявка ТМЦ', resp.data.remove);
          //~ $c.param.remove = ask;//resp.data.remove;  // прокинет через watch
          $timeout(function(){$c.CancelBtn();});
        }
        console.log(" Удалена заявка", resp.data);
      });
  };
  
  //~ $c.Edit = function(){
    //~ console.log("Edit", $c.param);
    
  //~ };
  /*
  $c.ChangeKol=function($last, row){// автовставка новой строки
    if($last && row['количество']) $c.AddRow(true);
  };*/
  /*
  $c.DeleteRow = function($index){
    $c.data['позиции'].splice($index, 1);
  };*/
  
  $c.FocusRow= function(row){
    //~ console.log("FocusRow", row);
    $c.lastFocusRow = row;
  };
  /*
  $c.AddRow = function(last){// last - в конец
    var n = {"номенклатура":{}};
    if(last || !$c.lastFocusRow) return $c.data["позиции"].push(n);
    var index = 1000;
    if($c.lastFocusRow) index = $c.data['позиции'].indexOf($c.lastFocusRow)+1;
    $c.data['позиции'].splice(index, 0, n);
  };*/

  
};

/******************************************************/
var Data  = function(){///$http, appRoutes
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  return {
    "NewAsk": function() {// новая заявка - форма
      var d = new Date();
      return {"дата1": (new Date(d.setDate(d.getDate()+7))).toISOString().replace(/T.+/, ''), "номенклатура":{}, "_new": true,};
    },
  };
  
};

/*=============================================================*/

module

.factory('TMCAskData', Data)

.component('tmcAskForm', {
  controllerAs: '$c',
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