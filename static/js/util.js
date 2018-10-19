(function () {
  'use strict';
/************************
  Утилиты разные
*************************/
  angular.module('Util', [])
  .config(function($compileProvider){
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|javascript):/);
  })
  
  .factory('Util', function($timeout){
    
    var IsType = function(data, type) {
      return Object.prototype.toString.call(data).toLowerCase() == '[object '+type.toLowerCase()+']';
    };
    
    var RE = {
      inner_minus: /(\S\s*)-+/g, // минусы внутри 
      non_digit: /[^\d,.\-]/g, // почикать буквы пробелы
      dots: /,/g, // только точки
      left_dots: /(\.)(?=.*\1)/g, // останется только одна точка справа
    };
    var Util = {};
    /*перевод для parseFloat(Util.numeric(...)).toLocaleString('ru')*/
    Util.numeric = function(val){
      return (val+'').replace(RE.inner_minus, '$1').replace(RE.non_digit, '').replace(RE.dots, '.').replace(RE.left_dots, ''); // только одна правая точка
    };
    Util.text2numeric = Util.numeric; // как в перле
    /*денежное представление
    
    */
    Util.money = function(val){
      if(!val) return val;
      return (val+'').replace(/\./, ',').replace(/\s*(?:руб|₽)/, '') + (/(\.|,)(\d*)/.test(val+'') ? '' : ',00');
      
    };
    /********* end Util.money ************/
    /*
    вернуть строку даты в ИСО формате '2017-12-31'
     параметр целое число смещения дней относительно сегодня, отрицат - в прошлое, положит - в будущее
    */
    Util.dateISO = Util.DateISO = function(a, d){
      d = new Date(d || Date.now());
      a = a || 0;
      return new Date(d.setDate(d.getDate()+a)).toISOString().replace(/T.+/, '');
    };
    /********* end Util.dateISO ************/
    // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    Util.isElementInViewport = function(el) {
      //special bonus for those using jQuery
      if (typeof jQuery !== 'undefined' && el instanceof jQuery) el = el[0];

      var rect = el.getBoundingClientRect();
      var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

      return (
             (rect.left >= 0)
          && (rect.top >= 0)
          && ((rect.left + rect.width) <= windowWidth)
          && ((rect.top + rect.height) <= windowHeight)
      );
    };
    /********* end Util.isElementInViewport ************/
    /*
    $('html,body').animate({scrollTop: $($element[0]).offset().top}, 1500);//
    */
    Util.Scroll2El = function(el, container,ms){
      if (!el.length) return;
      //~ if (!container)
      var cont = container || $('html, body');
      if (!ms) ms =1500;
      if(Util.isElementInViewport(el)) return;
      if(!(el instanceof jQuery)) el = $(el);
      if(!(cont instanceof jQuery)) cont = $(cont);
      //~ if (!container) $('html, body').animate({scrollTop: el.offset().top}, ms);
      cont.animate({scrollTop: el.offset().top - (container ? (cont.offset().top + cont.scrollTop()) : 0)}, ms);
    };
     /********* end Util.Scroll2El ************/
    Util.paramFromLocation = function() {
      var query = location.search.substr(1);
      var result = {};
      query.split("&").forEach(function(part) {
        var item = part.split("=");
        var val = decodeURIComponent(item[1]);
        var key = item[0];
        if (!result[key]) result[key] = [];
        if(/^(undef|undefined)$/.test(val)) result[key].push(undefined);
        else if(/^null$/.test(val)) result[key].push(null);
        else if(/^true$/.test(val)) result[key].push(true);
        else if(/^false$/.test(val)) result[key].push(false);
        else result[key].push(val);
      });
      return result;
    };
     /********* end Util.paramFromLocation ************/
    /*
    не работает для цифровых ключей
    не нужно
    */
    var _reduce = function(prev,curr) {
      //~ if(curr[0] !==)
      prev[curr[0]]=curr[1];
      return prev;
    };
    var _reduce2 = function(map, key, idx, arr){
      if (idx % 2) return;
      if (map[key]) {///привести к массиву
        if (IsType(map[key], "array")) map[key].push(arr[idx+1]);
        else map[key] = [map[key], arr[idx+1]];
      }
      else map[key] = arr[idx+1];///пока не массив
      return map;
    };
    Util.Pairs2Object = function(arrArr, obj) {//arrArr=[['hgffh', 2], ["asdc", 0]] obj=
      obj = obj || {};
      if (IsType(arrArr, "array")) {
        if (IsType(arrArr[0], "array")) return arrArr.reduce(_reduce, obj);
        return  arrArr.reduce(_reduce2, obj);
      }
      obj = {};///в этом варианте невозможно передать мап-объект
      return Array.prototype.slice.call(arguments).reduce(_reduce2, obj);
    };
    /********* end Util.ArrayPairs2Object ************/
    
    /*****/
    Util.ScrollTable = function(tb){///не идет
      var parent = tb.parent();
      //~ var prev = parent.prev();
      //~ if (tb.parent('div.scroll-table-wrapper-body').length) return;
      //~ var wrapper = $('<div class="scroll-table-wrapper-body">').css({'overflow-y':'scroll',});
      //~ var top = parent.offset().top+50;
      //~ parent.css({"height": 'calc(100vh - '+top+'px)', 'overflow-y':'scroll',});
      //~ prev.empty().append($('<table>').append($('thead', tb).clone(true)));
      
      //~ var tbThead = $('thead', tb);
      
      //~ var th = [];
      //~ $('th', tbThead).each(function( index ) {
        //~ th.push(this);
      //~ });
      $timeout(function(){
        
        
        $('tbody tr', tb.clone(true).insertBefore(tb)).css('visibility', 'collapse');///норм, но     при изменении фильтров строк не отследить когда переклонировать (MutationObserver применять)
        //~ var newThead = tbThead.clone(true);
        //~ $('<table class="timework-report">').append(newThead).insertBefore(tb);
        
        //~ $('th', newThead).each(function( index ) {
          //~ $( this ).width($(th[index]).outerWidth(true));
        //~ });
        
      });
      
      //~ console.log('Util.ScrollTable', wrapper.insertBefore(tb).append(tb));//;
      
    };
    /********* end Util.ScrollTable ************/
    
    /**********************************/
    Util.IsType = IsType;
    /********* end Util.IsType ************/
    return Util;
    
  })
  /********** конец Util  *************/
  
  /***
  Загрузка различных списков
  $ctrl.$data = new $Список()
  ***/
  .factory('$Список',  function($http){
  
  return function /*конструктор*/(url, $ctrl, $scope, $element){
    var $this = this;
    var Data = [], $Data = {}, Then = undefined, LoadStatus = undefined;
    function Del(key) { delete $Data[key]; }
    function Set(key){ this[key] = $Data[key]; }
    function Reduce(result, item, index, array) {  result[item.id] = item; return result; }
    /// метод
    $this.Clear = function(){
      Data.splice(0, Data.length);
      Object.keys($Data).map(Del, this);
      Then = undefined;
      LoadStatus = undefined;
    };
    ///метод
    $this.Load = function(param) {//
      //~ this.Clear();
      //~ param = angular.copy(param);
      //~ if (!param.offset) param.offset = Data.length;
      if (!Then) Then = $http.post(url, param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) 
          .then(function(resp){
            LoadStatus = 'success';
            if(resp.data.error) {
              Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
              if ($scope) $scope.error = resp.data.error;
            }
            else {
              Array.prototype.push.apply(Data, resp.data);
              
              return resp.data;
            }
          });
      return Then;
    };
    ///метод
    $this.LoadStatus = function(){
      return LoadStatus;
      
    }
    ///метод
    $this.Data = function(arr){///если передан массив - в него закинуть позиции
      if (!arr) return Data;
      Array.prototype.push.apply(arr, Data);
      return arr;
    };
    ///метод
    $this.DataLen = function(){///
      return Data.length;
    };
    ///метод
    $this.$Data = function(obj){///если передан объект - в него закинуть позиции
      if (Object.keys($Data).length === 0) Data.reduce(Reduce, $Data);
      if (!obj) return $Data;
      Object.keys($Data).map(Set, obj);
      return obj;
    };
    return this;
  };
  })
  ;
  
  
  
})();