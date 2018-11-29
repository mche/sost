(function () {'use strict';
/*
  Перемещения с объекта на объект
*/

var moduleName = "ТМЦ форма перемещения";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [/*'Util',*/ 'appRoutes', 'TMCFormLib', 'Номенклатура', 'ТМЦ текущие остатки']);//'ngSanitize',, 'dndLists','ТМЦ снабжение'

var Ctrl = function  ($scope, $rootScope, $q, $timeout, $http, $element, Util, appRoutes, $TMCFormLib, $Номенклатура, $ТМЦТекущиеОстатки) {///, TMCSnabData
  var $c = this;
  var $ctrl = this;
  
  new $TMCFormLib($c, $scope, $element);
  
  $scope.$on('Редактировать перемещение ТМЦ', function(event, ask){
    //~ console.log("$on Редактировать перемещение ТМЦ", ask)
    $c.Cancel();
    $timeout(function(){ $c.Open(ask); });
  });
  
  $scope.$on('ТМЦ в перемещение/открыть или добавить в форму', function(event, ask){// 
    //~ console.log("ТМЦ в перемещение/открыть или добавить в форму", ask);
    /***if (!pos['количество/принято'] && !$c.data) return;
    var pos2 = {"объект/id": pos['объект/id'], "номенклатура/id": pos['номенклатура/id'], "количество": pos['количество/принято'], "коммент": pos['коммент'], "$тмц/заявка": pos['$тмц/заявка']};
    if ( !$c.data) return $c.Open({"дата1": pos['дата/принято'], "@позиции тмц":[pos2]}, {'не прокручивать': true,});
    if (pos['количество/принято']) $timeout(function(){ $c.data['@позиции тмц'].push(pos2); });****/
   $timeout(function(){
     var data = angular.copy(ask);
     //~ console.log("on ТМЦ в перемещение", data);
     data.id = undefined;
     data['$с объекта'] = undefined;
     data['@грузоотправители'] = undefined;
      data['@позиции тмц'] = data['@позиции тмц'].filter(data['фильтр тмц'] || function(){ return true; });
      data['@позиции тмц'].map(function(pos){
        //~ pos['$тмц/заявка'] = undefined;///
        pos['количество'] = pos['количество/принято'];
        //~ if (pos['$объект'] && pos['$объект'].id && pos['$объект'].id == $c.param["объект"].id) {
          //~ pos['$объект'] = {};
          pos['объект/id'] = undefined;
      //~ pos['$на объект'] = 
          //~ pos['$объект'] = undefined;
        
          pos['$тмц/заявка'] = {};
          pos['тмц/заявка/id'] = undefined;
          //~ pos['$тмц/заявка']['$объект']  = {};///
        //~ }
        pos.id = undefined;
        pos.uid = undefined;
        pos['коммент'] = undefined;
        pos['цена']=undefined;
        pos['количество/принято'] = undefined;
        pos['дата/принято'] = undefined;
        pos['принял'] = undefined;
        pos['$профиль заказчика'] = undefined;
      });
      data['коммент'] = undefined;
      data['снабженец'] =   undefined;
      if ( !$c.data) $c.Open(data);
      else Array.prototype.push.apply($c.data['@позиции тмц'], data['@позиции тмц']);
     
    });
    
  });
    
  $c.$onInit = function(){
    if(!$c.param) $c.param = {};
    $c.param['перемещение'] = true;///не тут
    $scope.param=$c.param;
    $scope.paramObject={"placeholder": 'указать объект-получатель', 'без проекта': true, 'только объекты':true,};
    var async = [];
    async.push($c.NomenData());
    async.push($ТМЦТекущиеОстатки.Load($c.param).then(function(resp){
      //~ Array.prototype.push.apply($c['Остатки'], resp.data);
      $c.$Остатки = $ТМЦТекущиеОстатки.$DataByNomenId($c.param['объект'].id);
    }));
    $q.all(async).then(function(){
      $c.ready = true;
      
    });
    
  };
  
  $c.NomenData = function(){
    if (!$c['@номенклатура']) $c['@номенклатура'] = [];
    $c['@номенклатура'].splice(0, $c['@номенклатура'].length);
    return $Номенклатура/*.Refresh(0)*/.Load(0).then(function(data){
      Array.prototype.push.apply($c['@номенклатура'], $Номенклатура.Data());
    });//$http.get(appRoutes.url_for('номенклатура/список', 0));
    //~ $Номенклатура['Список без потомков/обновить'](0)['Список без потомков']().then(function(data){
      //~ Array.prototype.push.apply($c['@номенклатура'], data);
      //~ $c.ready = true;
    //~ });
    
  };
  
    /*в компонент tree-item*/
  $c.NomenAutocompleteFilter = function(item){///фильтровать номенклатуру которая на остатках
    //~ console.log("NomenAutocompleteFilter");
    //~ return !item.childs || !item.childs.length;///финальные позиции
    return !!$c.$Остатки[item.id];
    
  };

  
  $c.Open = function(data, param){// новая или редактирование
    //~ if($c.data && $c.data._open) return;
    data = angular.copy(data) || {};
    //~ if(data) $c.data = $c.InitData(data);
    //~ if(!$c.data) $c.data = $c.InitData();
    //~ console.log("Open ", data);
    $c.data = $c.InitData({
      id: data.id,
      "объект": $c.param["объект"].id,
      "дата1": new Date(data['дата1'] || Date.now()),// || Util.dateISO(0),
      "$с объекта": data['$с объекта'],
      //~ "@грузоотправители/id": data['@грузоотправители/id'] || (data['@грузоотправители'] ? data['@грузоотправители'].map(function(it){ console.log("@грузоотправители map ", it); return it.id; }) : [$c.param['объект']['$контрагент']]),///
      "@грузоотправители/id": data.id ? data['@грузоотправители/id'] : [$c.param['объект']['$контрагент'].id],
      "@грузоотправители": data.id ? data['@грузоотправители'] : [$c.param['объект']['$контрагент']],
      "@позиции тмц": data['@позиции тмц'],
      "коммент": data['коммент'],
      " перемещение": true,
      "без транспорта": data['без транспорта'],
      
    });
    
    if(!$c.data.id && !$c.data['@позиции тмц'] || $c.data['@позиции тмц'].length ===0) $c.AddPos();

    $c.data['дата1'] = Util.dateISO(0, $c.data['дата1']);
    $timeout(function(){
        $('input[name="дата1"].datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
          clear: '',
          formatSkipYear: true,// доп костыль - дописывать год при установке
          onSet: function(context){ var s = this.component.item.select; $timeout(function(){ $c.data['дата1'] = [s.year, s.month+1, s.date].join('-'); }); },//$(this._hidden).val().replace(/^\s*-/, this.component.item.select.year+'-');},//$c.SetDate,
          //~ min: $c.data.id ? undefined : new Date()
          //~ editable: $c.data.transport ? false : true
        });//{closeOnSelect: true,}
        
        if(!param || !param['не прокручивать']) $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);// - container.offset().top + container.scrollTop()}, ms);
        $('textarea').keydown();
         $('.modal').modal();
      });
  };
  
  $c.FilterValidPosNomen = function(row){
    var id = row.nomen && row.nomen.selectedItem && row.nomen.selectedItem.id;
    //~ var n = row.nomen && row.nomen.newItems && row.nomen.newItems[0] && row.nomen.newItems[0].title;
    return  !!id;
  };
  
  $c.FilterValidPos = function(row){
    var object = $c.FilterValidPosObject(row);
    var nomen = $c.FilterValidPosNomen(row);
    var kol = $c.FilterValidPosKol(row);
    //~ var cena = $c.FilterValidPosCena(row);
    return object && nomen && kol;// && cena;
  };
  
  $c.Save = function(event, dontClose){///dontClose - флажок не закрывать форму
    if(!event) {// проверка
      if(!$c.data["@позиции тмц"].length) return false;
      return $c.data['дата1']
        //~ && ask.contragent4.filter(function(item){ return item.id || item.title; }).length
        //~ && $c.ValidAddress1()//ask.address1.some(function(arr){ return arr.some(function(it){ return !!it.title; }); }) // адрес!
        && $c.ValidPos($c.data);
    }
    //~ $c.data['объект'] = $c.param["объект"].id;
    if (!$c.data.id) $c.data['@позиции тмц'].map(function(tmc){ tmc['дата1'] = $c.data['дата1']; });
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = 1;
    delete $c.error;
    
    return $http.post(appRoutes.url_for('тмц/сохранить перемещение'), $c.data/*, {timeout: $c.cancelerHttp.promise}*/)
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        $c.cancelerHttp=undefined;
        if (resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'fw500 red-text text-darken-3 red lighten-5 border');
        }
        //~ console.log("Save", resp.data);
        if (resp.data.success) {
          if (!dontClose) {
            $c.Cancel(!0);//$c.data = undefined;
            Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          }
          //~ $c.ready = false;
          $rootScope.$broadcast('Сохранено поставка/перемещение ТМЦ', resp.data.success);
          ///обновить номенклатуру и контрагентов
          //~ $Номенклатура.Refresh(0);//.Load(0).then(function(){  });
          //~ $c.NomenData();
          //~ $Контрагенты.RefreshData();
        }
        console.log("Сохранено перемещение:", resp.data);
        return resp.data;
      });
  };
  
  $c.Delete = function(event){
    //~ if (!confirm) return $('#modal-confirm-delete').modal('open');
    //~ console.log("Delete", $c.data);
    
    $c.cancelerHttp = 1;
    delete $c.error;
    
    return $http.post(appRoutes.url_for('тмц/удалить перемещение'), $c.data)
      .then(function(resp){
        $c.cancelerHttp = undefined;
        if (resp.data.error) {
          $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'fw500 red-text text-darken-3 red lighten-5 border');
        }

        if (resp.data.remove) {
          $c.Cancel(!0);//$c.data = undefined;
          Materialize.toast('Удалено успешно', 3000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp slow');
          //~ $c.ready = false;
          //~ window.location.href = window.location.pathname;
          $rootScope.$broadcast('Удалено поставка/перемещение ТМЦ', $c.data.id);///resp.data.remove
        }
        console.log("Удалено перемещение:", resp.data);
        return resp.data;
      });
  };
};

/*=============================================================*/

module

.component('tmcBazaForm', {
  controllerAs: '$c',
  //~ templateUrl: "tmc/baza/form",
  templateUrl: "tmc/form/lib",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Ctrl,
})

;

}());