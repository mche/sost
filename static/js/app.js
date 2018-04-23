undef = undefined;
(function () {
  'use strict';
  angular.module('AppTplCache', [])
  .run(function($templateCache) {
    //~ console.log("App config starting...", $templateCache);
    $templateCache.put('progress/load', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Загружается...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/save', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Сохраняется...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/search', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Поиск...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/check', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Проверка...</div><div class="indeterminate"></div></div>');
    $templateCache.put('preloader-circular-small', '<div class="preloader-wrapper small active"><div class="spinner-layer"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
    //http://www.dailycoding.com/Utils/Converter/ImageToBase64.aspx
    //~ $templateCache.put('icon/block', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABB0lEQVR4Ab3OwUlcURiG4ecOeG4BgXQwiEVkkRYERVHcuBhEO9AiEhhID4qWooOQrXJRWwjObL7AIFc8eLY+//b94PflekduDFZWBtcO9bTteZHqnu361MQfEbdmpooNUzN3IuYmauv8n2MfdS7eJpW9df5D7bu/ImKHd70XcdzIF87Fk2J0JG6b+TedhTgwuhGzZg4n4spoENN2jk3xaLQSpZ2jiOXHwUY7Ry+W9UvtnC3xYHQtZu0cZ+LS6FDc6Zp5517sG/WexUUj51QMCu92RRr5T69iW2Uu4lxXPXO6zn9Tm7xNFk5sKnpbztyL+GXiUzuepLrBNm3FgSuPlpYeXNpXfLH/Cj6QJVPd+u0AAAAASUVORK5CYII=" alt="icon block" />');
    //~ $templateCache.put('img-src/driver', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABmUlEQVRoge2Y7XGDMAyGNUJG0AgdgQ3KCB2FDcgGyQbJBmED2IBskG6Q2Id8VVKCbfFhyOm5e//4jPxKtsEGQFEU5dNAo9KoNrqTamrDZK4CsSbvHpXJ3HngFfepTuTxLXsIN++0T+K0B4R48064uNseJNVf1SzErP1V7gWpeafkbD6BBuTmmwR+/7H5TYyw8deoZdMfMkfMXljF2u8jZCZWV/lXEDqTfEYaasNkrhRF8fIN3XXxQmrhbxO3rL2kvqsgMzqB/Et8ohiLYwcdcw94VQ0LJbKDsD8PUpU0xmzmp6z60GxMnsRS5mdL4rCgeafDVObzBOad8rHm7TS2EQNejQro3ijI4iC1FdQnNF4LI5dSEWE8plp5RCKF1Dwa3QIGOIKsSjt61hf/BsJjeMjl5NzznD0m2C8sX3ottfUdIaqAcUSXIF/gX3iu/Bd0Zx2fmQv1dSDFGnqmkiRw9gTlVbEmQpYbXxY8ed9sixKwVRqqTMb6HiPM873jyDx9xa9TW6XqTVBOrHk3C74YV6MfqXlFUZT5eQCJZUOijKdjWwAAAABJRU5ErkJggg==');
  });
  
  /*
  доступа к кукам не будет https://stackoverflow.com/a/27863299
  поэтому отслеживать время запросов
  !внимание! DEFAULT_EXPIRATION должен соотв сервеной куки просрочке!
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  */
  angular.module('AuthTimer', [/*'appRoutes',*/ 'formAuth'])
  /*
  AutoJSON - автоматически парсинг полей с суффиксом `/json` (см re)
  **/
    .provider('AutoJSON', function(){ // провайдер потому что нужен в конфиге (фактори и сервисы не инъектятся)
      var re = /\/json$/i;
      var is = function(data, type) { return Object.prototype.toString.call(data).toLowerCase() == '[object '+type.toLowerCase()+']'; };
      var AutoJSON = function(data, over){ // over - логич параметр перезаписи существующего поля после удаления из имени хвоста `/json`
        //~ if (angular.isObject(data)) { не работает
        if ( is(data, 'Object') ) Object.keys(data).map(function(key){
          if (key == 'row_to_json') {
            data =  AutoJSON(JSON.parse(data[key]));
            return;
          }
          var jkey = key.replace(re, '');
          if (jkey != key && (!!over || !data.hasOwnProperty(jkey))) {
           if (/*angular.isString(data[key])*/ is(data[key], 'String') )  data[jkey] = AutoJSON(JSON.parse(data[key]));
           else if ( /*angular.isArray(data[key])*/ is(data[key], 'Array') )   data[jkey] = data[key].map(function(val){ return AutoJSON( is(val, 'String') ? JSON.parse(val) : val ); });
           else if (/*angular.isObject(data[key])*/ is(data[key], 'Object') ) data[jkey] = AutoJSON( is(data[key], 'String') ? JSON.parse(data[key]) : data[key] );
          }
          ///else  data[key] = AutoJSON(data[key]);
        });
        //~ else if (angular.isArray(data)) {
        else if (is(data, 'Array')) data.map(function(val, idx) {
          data[idx] = AutoJSON(val);
          //~ data.splice(idx, 1, AutoJSON(val));
        }); 
        
        return data;
      };
      this.$get = function() {
        return {"parse": AutoJSON}; // для инъектов
      };
      this.parse = AutoJSON;// для конфига
      
    })// end provider AutoJSON
    
    .config(function ($httpProvider, $provide, AutoJSONProvider) {//, $cookies
      var el_default_expiration = $('#session-default-expiration'),
        exp_active = $('<span class="chip">').appendTo(el_default_expiration.parent()),
        DEFAULT_EXPIRATION = parseInt(el_default_expiration.text() || 1800),
        expires,
        i = setInterval(function(){
          if(expires === undefined) return;
          var c=DEFAULT_EXPIRATION-(expires++),m=(c/60)>>0,s=(c-m*60)+'';
          c == 0 && clearInterval(i);
          exp_active.text(m+':'+(s.length>1?'':'0')+s);
          },1000)
      ;
      $provide.factory('httpAuthTimer', function ($q, $injector, $rootScope, $window, $timeout /*, appRoutes*/) {//$rootScope, $location
        var lastResTime = new Date();//, stopReqs;
        var jsonTypeRE = /application\/json;/
        return {
          "request": function (config) {
            
            //~ expires = (new Date() - lastResTime)/1000;
            //~ if(expires > DEFAULT_EXPIRATION && Materialize && Materialize.toast) Materialize.toast("", )
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            return config || $q.when(config);
          },
          "response": function (resp) {
            //~ var $cookies = $injector.get('$cookies');
            //~ console.log("httpAuthTimer", arguments);
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              lastResTime = new Date();
              expires = (new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              var contentType = resp.headers()['content-type'];
              var isJSON = jsonTypeRE.test(contentType);
              if(isJSON) resp.data = /*console.log("AutoJSONProvider",)*/ AutoJSONProvider.parse(resp.data);// провайдер(дописывается к имени!) потому что в конфиге (фактори и сервисы не инъектятся)
              //~ if (resp.data['data/json']) resp.data = resp.data.data;
              //~ console.trace();
              //~ var stack = new Error().stack;
              console.log("http AuthTimer+AutoJSONProvider: response: ",  lastResTime, resp.config.method, resp.config.url, isJSON ? resp.data : contentType );//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
            }
            return resp || $q.when(resp);
          },
          //~ "requestError": function (rejection) {
            //~ return $q.reject(rejection);
          //~ },
          "responseError": function (resp) {
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            if((!cache || !cache.put) && resp.status == 404) {
              var exp = (new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              if(exp > DEFAULT_EXPIRATION) $timeout(function(){
                if($('auth-timer-login').length) $('.modal', $('auth-timer-login')).modal('open');
                else {
                  var $compile = $injector.get('$compile');
                  $('body').append($compile('<auth-timer-login></auth-timer-login>')($rootScope)[0]);//$scope
                  $timeout(function(){
                    if($('auth-timer-login').length) $('.modal', $('auth-timer-login')).modal('open');
                    else $window.location.href = '/profile';///appRoutes.url_for('вход', undefined, {"from": $window.location.pathname});
                  });
                  //~ $scope.$digest();
                }
              });
            }
            return $q.reject(resp);
          }
        };
      });
      $httpProvider.interceptors.push('httpAuthTimer');
      //~ $httpProvider.useApplyAsync(true);
      //~ $httpProvider.defaults.transformResponse = function(data, headers) {
        //~ console.log("$httpProvider.defaults.transformResponse", data, headers());
        //~ return data;
      //~ };
    })
    
    .component('authTimerLogin', {
      template: '<div id="modal-AuthTimer" ng-if="$ctrl.ready" class="modal"><div class="modal-content"><h3 class="red-text">Истекло время бездействия. Войдите снова.</h3><div class="input-field"><input type="checkbox" ng-model="param.reload" ng000-true-value=" $window.location.pathname " ng000-false-value=" false " ng000-checked=" true " id="крыжик обновления страницы"><label for="крыжик обновления страницы"><h4>Обновить страницу после входа (рекомендуется)</h4></label></div><form-auth data-param="param"></form-auth></div></div>',
      //~ bindings: {
      //~ },
      controller: function($scope, $element, $timeout, $window, formAuthTCache){
        var $ctrl = this;
        //~ $scope.$window = $window;
        //~ console.log("component 'authTimerLogin'", formAuthTCache);

        $ctrl.$onInit = function () {
          //~ $scope.from = $window.location.pathname;
          $scope.param = {"reload": true,"successCallback": function(resp_data){
            if($scope.param.reload) return $window.location.reload();
            $('.modal', $($element[0])).modal('close');
          }};
          formAuthTCache.load.then(function (proms) {
            $ctrl.ready = true;
            $timeout(function() {
              $('.modal', $($element[0])).modal({"dismissible": false,}).modal('open');
            });
          });
          
        };
      }
    })
    ;
  /************************
    Утилиты разные
  *************************/
  angular.module('Util', [])
  .config(function($compileProvider){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|javascript):/);
})
  .factory('Util', function(){
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
    Util.dateISO = function(a, d){
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
    */
    var _reduce = function(prev,curr) {
      //~ if(curr[0] !==)
      prev[curr[0]]=curr[1];
      return prev;
    };
    var _reduce2 = function(map, key, idx, arr){
      if (idx % 2) return;
      if (map[key]) {///привести к массиву
        if (Object.prototype.toString.call(map[key]).toLowerCase() == "[object array]") map[key].push(arr[idx+1]);
        else map[key] = [map[key], arr[idx+1]];
      }
      else map[key] = arr[idx+1];///пока не массив
      return map;
    };
    Util.Pairs2Object = function(arrArr, obj) {//arrArr=[['hgffh', 2], ["asdc", 0]] obj=
      obj = obj || {};
      if (Object.prototype.toString.call(arrArr).toLowerCase() == "[object array]") {
        if (Object.prototype.toString.call(arrArr[0]).toLowerCase() == "[object array]") return arrArr.reduce(_reduce, obj);
        return  arrArr.reduce(_reduce2, obj);
      }
      obj = {};///в этом варианте невозможно передать мап-объект
      return Array.prototype.slice.call(arguments).reduce(_reduce2, obj);
    };
    /********* end Util.ArrayPairs2Object ************/
    
    return Util;
    
  });
  
  /********** конец Util  *************/
  /*angular.module('OO', [])._ = (function() {
    var main = {};
    main.mixin = function (c, p) {
      for(var k in p) if(p.hasOwnProperty(k)) c[k] = p[k];
    };

    main.bind = function (o, f) {
        return function() { return f.apply(o, arguments); };
    };

    main.inherits = function (c, p) {
      main.mixin(c, p);
      function f() { this.constructor = c; }
      f.prototype = c.__super__ = p.prototype;
      c.prototype = new f();
    };
    return main;

  })();*/
  
  /**********/
  /*angular.module('Components', [])['комп1'] = (function() {
    //~ var $ctrl;
    function main($scope, $http, $timeout) {///
      var $ctrl = this;
      //~ var args = Array.prototype.slice.call(arguments);
      //~ console.log("комп1 constr", $ctrl, arguments);
      $ctrl.foo = 123;
      $ctrl.OrderByData = function(row){ /// !!! prototype не катит
        console.log("комп1 OrderByData!");
        var profile = $ctrl.RowProfile(row);
        return profile.names.join();
      };
    }
    main.prototype.getFoo = function() {//
      console.log("getFoo", this);
      return this.foo;
    };
    return main;
  })();*/

})();
