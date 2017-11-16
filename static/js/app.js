(function () {
  'use strict';
  angular.module('AppTplCache', [])
  .run(function($templateCache) {
    //~ console.log("App config starting...", $templateCache);
    $templateCache.put('progress/load', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Загружается...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/save', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Сохраняется...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/search', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Поиск...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/check', '<div class="progress" style="height: inherit;"><div class="center teal-text text-darken-2">Проверка...</div><div class="indeterminate"></div></div>');
    //http://www.dailycoding.com/Utils/Converter/ImageToBase64.aspx
    //~ $templateCache.put('icon/block', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABB0lEQVR4Ab3OwUlcURiG4ecOeG4BgXQwiEVkkRYERVHcuBhEO9AiEhhID4qWooOQrXJRWwjObL7AIFc8eLY+//b94PflekduDFZWBtcO9bTteZHqnu361MQfEbdmpooNUzN3IuYmauv8n2MfdS7eJpW9df5D7bu/ImKHd70XcdzIF87Fk2J0JG6b+TedhTgwuhGzZg4n4spoENN2jk3xaLQSpZ2jiOXHwUY7Ry+W9UvtnC3xYHQtZu0cZ+LS6FDc6Zp5517sG/WexUUj51QMCu92RRr5T69iW2Uu4lxXPXO6zn9Tm7xNFk5sKnpbztyL+GXiUzuepLrBNm3FgSuPlpYeXNpXfLH/Cj6QJVPd+u0AAAAASUVORK5CYII=" alt="icon block" />');
    //~ $templateCache.put('img-src/driver', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABmUlEQVRoge2Y7XGDMAyGNUJG0AgdgQ3KCB2FDcgGyQbJBmED2IBskG6Q2Id8VVKCbfFhyOm5e//4jPxKtsEGQFEU5dNAo9KoNrqTamrDZK4CsSbvHpXJ3HngFfepTuTxLXsIN++0T+K0B4R48064uNseJNVf1SzErP1V7gWpeafkbD6BBuTmmwR+/7H5TYyw8deoZdMfMkfMXljF2u8jZCZWV/lXEDqTfEYaasNkrhRF8fIN3XXxQmrhbxO3rL2kvqsgMzqB/Et8ohiLYwcdcw94VQ0LJbKDsD8PUpU0xmzmp6z60GxMnsRS5mdL4rCgeafDVObzBOad8rHm7TS2EQNejQro3ijI4iC1FdQnNF4LI5dSEWE8plp5RCKF1Dwa3QIGOIKsSjt61hf/BsJjeMjl5NzznD0m2C8sX3ottfUdIaqAcUSXIF/gX3iu/Bd0Zx2fmQv1dSDFGnqmkiRw9gTlVbEmQpYbXxY8ed9sixKwVRqqTMb6HiPM873jyDx9xa9TW6XqTVBOrHk3C74YV6MfqXlFUZT5eQCJZUOijKdjWwAAAABJRU5ErkJggg==');
  });
  
  /*
  доступа к кукам не будет https://stackoverflow.com/a/27863299
  поэтому отслеживать время запросов
  !внимание! default_expiration должен соотв сервеной куки просрочке!
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  */
  angular.module('AuthTimer', ['appRoutes', 'formAuth'])
    .config(function ($httpProvider, $provide) {//, $cookies
      var default_expiration = 1800;
      $provide.factory('httpAuthTimer', function ($q, $rootScope, $injector, $window, $timeout, appRoutes) {//$rootScope, $location
        var lastResTime;//, stopReqs;
        return {
          //~ "request": function (config) {
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            //~ return config || $q.when(config);
          //~ },
          "response": function (resp) {
            //~ var $cookies = $injector.get('$cookies');
            //~ console.log("httpAuthTimer", resp);
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              lastResTime = new Date();
              console.log("httpAuthTimer last response", lastResTime, resp.config.method, resp.config.url);//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
            }
            return resp || $q.when(resp);
          },
          //~ "requestError": function (rejection) {
            //~ return $q.reject(rejection);
          //~ },
          "responseError": function (resp) {
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            var expires = dateFns.differenceInSeconds(new Date(), lastResTime);
            if((!cache || !cache.put) && resp.status == 404 && expires > default_expiration) {
              //~ stopReqs = true;
              //~ console.log("httpAuthTimer responseError 404 auth expires", expires);//response.headers()
              $timeout(function(){
                if($('auth-timer-login').length) $('.modal', $('auth-timer-login')).modal('open');
                else {
                  var $compile = $injector.get('$compile');
                  //~ $window.location.href = appRoutes.url_for('вход', undefined, {"from": $window.location.pathname});
                  $('body').append($compile('<auth-timer-login></auth-timer-login>')($rootScope)[0]);//$scope
                  //~ $scope.$digest();
                }
              });
            }
            return $q.reject(resp);
          }
        };
      });
      $httpProvider.interceptors.push('httpAuthTimer');
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
/*
    Утилиты
  */
  angular.module('Util', [])
  .factory('Util', function(){
    var RE = {
      inner_minus: /(\S\s*)-+/g, // минусы внутри 
      non_digit: /[^\d,.\-]/g, // почикать буквы пробелы
      dots: /,/g, // только точки
      left_dots: /(\.)(?=.*\1)/g, // останется только одна точка справа
    };
    var factory = {};
    /*перевод для parseFloat(Util.numeric(...)).toLocaleString('ru')*/
    factory.numeric = function(val){
      return (val+'').replace(RE.inner_minus, '$1').replace(RE.non_digit, '').replace(RE.dots, '.').replace(RE.left_dots, ''); // только одна правая точка
    };
    factory.text2numeric = factory.numeric; // как в перле
    /*денежное представление
    
    */
    factory.money = function(val){
      if(!val) return val;
      return (val+'').replace(/\./, ',').replace(/\s*(?:руб|₽)/, '') + (/(\.|,)(\d*)/.test(val+'') ? '' : ',00');
      
    };
    /*
    вернуть строку даты в ИСО формате '2017-12-31'
     параметр целое число смещения дней относительно сегодня, отрицат - в прошлое, положит - в будущее
    */
    factory.dateISO = function(a){
      var d = new Date();
      return (new Date(d.setDate(d.getDate()+a))).toISOString().replace(/T.+/, '');
    };
    
    // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    factory.isElementInViewport = function(el) {
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
    factory.Scroll2El = function(el, container,ms){
      if (!el.length) return;
      //~ if (!container)
      cont = container || $('html, body');
      if (!ms) ms =1500;
      if(factory.isElementInViewport(el)) return;
      if(!(el instanceof jQuery)) el = $(el);
      if(!(cont instanceof jQuery)) cont = $(cont);
      //~ if (!container) $('html, body').animate({scrollTop: el.offset().top}, ms);
      cont.animate({scrollTop: el.offset().top - (container ? (cont.offset().top + cont.scrollTop()) : 0)}, ms);
    };
    
    factory.paramFromLocation = function() {
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
    
    return factory;
    
  });
  
  /******/
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
