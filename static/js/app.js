undef = undefined;
(function () {
  'use strict';
  
  angular.module('AppTplCache', [])///(название любое уникальное - этот модуль автоматически вставляется всегда с помощью global-modules.js)
  .run(function($templateCache) {
    //~ console.log("App config starting...", $templateCache);
    $templateCache.put('progress/load', '<div class="progress z-depth-1" style="height: inherit;"><div class="center teal-text text-darken-2">Загружается...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/save', '<div class="progress z-depth-1" style="height: inherit;"><div class="center teal-text text-darken-2">Сохраняется...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/search', '<div class="progress z-depth-1" style="height: inherit;"><div class="center teal-text text-darken-2">Поиск...</div><div class="indeterminate"></div></div>');
    $templateCache.put('progress/check', '<div class="progress z-depth-1" style="height: inherit;"><div class="center teal-text text-darken-2">Проверка...</div><div class="indeterminate"></div></div>');
    $templateCache.put('preloader-circular-small', '<div class="preloader-wrapper small active"><div class="spinner-layer"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
    $templateCache.put('preloader-circular-small-red-darken-3', '<div><!---div class="absolute" style="top: 6px; left: 12px"}><i class="material-icons fs8 red-text-darken-3">save</i></div---><div class="preloader-wrapper small active"><div class="spinner-layer red-border border-darken-3"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
    //http://www.dailycoding.com/Utils/Converter/ImageToBase64.aspx
    //~ $templateCache.put('icon/block', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABB0lEQVR4Ab3OwUlcURiG4ecOeG4BgXQwiEVkkRYERVHcuBhEO9AiEhhID4qWooOQrXJRWwjObL7AIFc8eLY+//b94PflekduDFZWBtcO9bTteZHqnu361MQfEbdmpooNUzN3IuYmauv8n2MfdS7eJpW9df5D7bu/ImKHd70XcdzIF87Fk2J0JG6b+TedhTgwuhGzZg4n4spoENN2jk3xaLQSpZ2jiOXHwUY7Ry+W9UvtnC3xYHQtZu0cZ+LS6FDc6Zp5517sG/WexUUj51QMCu92RRr5T69iW2Uu4lxXPXO6zn9Tm7xNFk5sKnpbztyL+GXiUzuepLrBNm3FgSuPlpYeXNpXfLH/Cj6QJVPd+u0AAAAASUVORK5CYII=" alt="icon block" />');
    //~ $templateCache.put('img-src/driver', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABmUlEQVRoge2Y7XGDMAyGNUJG0AgdgQ3KCB2FDcgGyQbJBmED2IBskG6Q2Id8VVKCbfFhyOm5e//4jPxKtsEGQFEU5dNAo9KoNrqTamrDZK4CsSbvHpXJ3HngFfepTuTxLXsIN++0T+K0B4R48064uNseJNVf1SzErP1V7gWpeafkbD6BBuTmmwR+/7H5TYyw8deoZdMfMkfMXljF2u8jZCZWV/lXEDqTfEYaasNkrhRF8fIN3XXxQmrhbxO3rL2kvqsgMzqB/Et8ohiLYwcdcw94VQ0LJbKDsD8PUpU0xmzmp6z60GxMnsRS5mdL4rCgeafDVObzBOad8rHm7TS2EQNejQro3ijI4iC1FdQnNF4LI5dSEWE8plp5RCKF1Dwa3QIGOIKsSjt61hf/BsJjeMjl5NzznD0m2C8sX3ottfUdIaqAcUSXIF/gX3iu/Bd0Zx2fmQv1dSDFGnqmkiRw9gTlVbEmQpYbXxY8ed9sixKwVRqqTMb6HiPM873jyDx9xa9TW6XqTVBOrHk3C74YV6MfqXlFUZT5eQCJZUOijKdjWwAAAABJRU5ErkJggg==');
  });
  
  /***
    функционал обратного отсчета времени авторизации
  
  ***/
  var AuthExpiration = {
    "DefaulExpiration$": function(){ return $('#session-default-expiration'); },//el_default_expiration,
    "SpanExpiration$": function(){
      var span = $('span.expiration', AuthExpiration.DefaulExpiration$().parent());
      if (span.length) return span;
      return $('<span class="expiration chip right" style="padding: 0 0.5rem; margin:0;">').appendTo(AuthExpiration.DefaulExpiration$().parent());
    },
    "defaultExpiration": function(){ return parseInt(AuthExpiration.DefaulExpiration$().text() || 10); },///!внимание! defaultExpiration() должен соотв серверной куки просрочке!
    "expires": 0,///тут счетчик секунд
    "intervalDelay": 1000,///итервал изменения счетчика
    "ToastLogin": function(){
      clearInterval(AuthExpiration.intervalID);
      AuthExpiration.expires = 0;
      AuthExpiration.intervalID = undefined;
      Materialize.Toast($('<a href-000="/profile" target-000="_blank" href="javascript:" class="hover-shadow3d white-text bold">').click(function(){  AuthExpiration.ShowLoginForm(); document.getElementById('toast-container').remove(); }).html('Завершилась авторизация, войти заново <i class="icon-login"></i>'), 30*1000, 'red darken-2');
    },
    ///ShowLoginForm: function(){тут не катит $injector}
    "intervalCallback" : function(){
      if(AuthExpiration.expires === undefined) return;
      var c=AuthExpiration.defaultExpiration()-(AuthExpiration.expires++),
        m=(c/60)>>0,
        s=(c-m*60)+'';
      AuthExpiration.SpanExpiration$().text(m+':'+(s.length>1?'':'0')+s);
      c == 0 && AuthExpiration.ToastLogin();
    },
    "nowReqs": 0,///счетчик текущих запросов данных (отложить запрос в /keepalive)
  };
  
  /***
  
  Глобальный модуль AuthTimer (название любое уникальное - этот модуль автоматически вставляется всегда с помощью global-modules.js)
  две его задачи:
  1. Отслеживать и продлевать сессию (если задан элемент $('#session-default-expiration') с текстом количества секунд жизни куков сессии)
  2. AutoJSON - автоматически парсинг полей данных JSON-запросов с суффиксом `/json` (см re)
  
  доступа к кукам не будет https://stackoverflow.com/a/27863299
  поэтому отслеживать время запросов
  
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  ***/
  angular.module('AuthTimer', [/*'appRoutes',*/ 'formAuth'])
    .provider('AutoJSON', function(){ // провайдер потому что нужен в конфиге (фактори и сервисы не инъектятся)
      //~ console.log("provider 'AutoJSON' initing... ");
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
           //~ else if (/*angular.isObject(data[key])*/ is(data[key], 'Object') ) data[jkey] = AutoJSON( is(data[key], 'String') ? JSON.parse(data[key]) : data[key] );
            else  data[jkey] = AutoJSON(data[key]);
          }
          else  data[key] = AutoJSON(data[key]);
        });
        //~ else if (angular.isArray(data)) {
        else if (is(data, 'Array')) data.map(function(val, idx) {
          data[idx] = AutoJSON(val);
        }); 
        
        return data;
      };
      this.$get = function() {
        return {"parse": AutoJSON}; // для инъектов
      };
      this.parse = AutoJSON;// для конфига
      
    })/// end provider AutoJSON
    
    .config(function ($httpProvider, $provide,/* $injector,*/ $compileProvider, AutoJSONProvider) {//, $cookies
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|javascript):/);
      //~ console.log("module('AuthTimer').config()...");
      //~ var el_default_expiration = $('#session-default-expiration'),
        
      if(AuthExpiration.DefaulExpiration$().length) AuthExpiration.intervalID = setInterval(AuthExpiration.intervalCallback, AuthExpiration.intervalDelay);
      
      $provide.factory('httpAuthTimer', function ($q, $injector, $rootScope, $window, $timeout /*, appRoutes*/) {//$rootScope, $location
        
        AuthExpiration.ShowLoginForm = function(){///в самом Config не идет
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
        };
        
        if(AuthExpiration.DefaulExpiration$().length) {//}(function(config){ /*** поддержка сессии по движениям мыши ***/
          var deferred,
            reset = function(){
              deferred = undefined;
            },
            deferred = $timeout(reset, 60*1000),
            done = function(msg, status, xhr ){/// msg - версия (!!!косяки в порядке аргументов при разных ответах)
              //~ console.log("keepalive done", arguments);
              if (status.toLowerCase() == 'error' && Object.prototype.toString.call(xhr) == "[object String]"  && xhr.toLowerCase() != 'not found') 
                console.log("keepalive fail", arguments);
              else if (status.toLowerCase() != 'success') /*нет return*/ AuthExpiration.ToastLogin();
              else {/// сессия живая
                AuthExpiration.expires = 0;///счетчик заново
                if (msg && Object.prototype.toString.call(msg) == "[object String]" && document.UniOST.VersionChanged(msg))
                  Materialize.Toast($('<a href="javascript:" class="hover-shadow3d red-text text-darken-4">').click(function(){ $window.location.reload(true); }).html('Обновление программы. Желательно обновить [F5] страницу <i class="material-icons" style="">refresh</i> версия '+msg), 30000, 'red lighten-4 red-text text-darken-4 border fw500 animated zoomInUp');
                if(!AuthExpiration.intervalID && AuthExpiration.DefaulExpiration$().length)
                  AuthExpiration.intervalID = setInterval(AuthExpiration.intervalCallback, AuthExpiration.intervalDelay);
              }
              $timeout(reset, 60*1000);
            },
            eventCallback = function(){
              if (deferred || AuthExpiration.nowReqs) return;///$timeout.cancel(timeout);
              //~ timeout = $timeout(mouseMoveCallback, 30*1000);
              deferred = $.get('/keepalive'/*, success*/).always(done);
            }
          ;
          $(document).on('mousemove', eventCallback);
          $(document).on('scroll', eventCallback);
        }//(Config));
        
        var lastResTime = new Date();//, stopReqs;
        var jsonTypeRE = /application\/json/
        return {
          "request": function (config) {
            AuthExpiration.nowReqs++;
            //~ expires = (new Date() - lastResTime)/1000;
            //~ if(expires > defaultExpiration() && Materialize && Materialize.toast) Materialize.toast("", )
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            return config || $q.when(config);
          },
          "requestError": function (rejection) {
            AuthExpiration.nowReqs--;
            return $q.reject(rejection);
          },
          "response": function (resp) {
            AuthExpiration.nowReqs--;
            //~ var $cookies = $injector.get('$cookies');
            //~ console.log("httpAuthTimer", arguments);
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              lastResTime = new Date();
              AuthExpiration.expires = 0;//(new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              var contentType = resp.headers()['content-type'];
              var isJSON = jsonTypeRE.test(contentType);
              if(isJSON) resp.data = /*console.log("AutoJSONProvider",)*/ AutoJSONProvider.parse(resp.data);// провайдер(дописывается к имени!) потому что в конфиге (фактори и сервисы не инъектятся)
              console.log(/*"response 200: ", */ /*lastResTime.toLocaleString(),*/ resp.config.method, resp.config.url, isJSON ? resp.data : contentType );//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
            }
            return resp || $q.when(resp);
          },
          
          "responseError": function (resp) {
            AuthExpiration.nowReqs--;
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            if((!cache || !cache.put) && resp.status == 404) {
              var exp = (new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              if(exp > AuthExpiration.defaultExpiration()) $timeout(AuthExpiration.ToastLogin);///ShowLoginForm
            }
            return $q.reject(resp);
          }
        };
      });
      //~ console.log("закинул $httpProvider.interceptors.push('httpAuthTimer') ");
      $httpProvider.interceptors.push('httpAuthTimer');
      //~ $httpProvider.useApplyAsync(true);
      //~ $httpProvider.defaults.transformResponse = function(data, headers) {
        //~ console.log("$httpProvider.defaults.transformResponse", data, headers());
        //~ return data;
      //~ };
    })
    
    .component('authTimerLogin', {
      template: '<div id="modal-AuthTimer" ng-if="$ctrl.ready" class="modal"  data-overlay-in="animated fade-in-05" data-overlay-out="animated  fade-out-05 fast" data-modal-in="animated zoomInDown" data-modal-out="animated zoomOutUp"  style="top:10%; width:90vw;"><div class="modal-content"><h2 class="red-text center">Истекло время бездействия. Войдите снова.</h2><div class="input-field center"><input type="checkbox" ng-model="param.reload" ng000-true-value=" $window.location.pathname " ng000-false-value=" false " ng000-checked=" true " id="крыжик обновления страницы"><label for="крыжик обновления страницы" class="before-yellow-lighten-4 teal-text text-darken-3"><h4>Обновить страницу после входа</h4></label></div><form-auth data-param="param"></form-auth></div></div>',
      //~ bindings: {
      //~ },
      controller: function($scope, $element, $timeout, $window, formAuthTCache){
        var $ctrl = this;
        $ctrl.$onInit = function () {
          //~ $scope.from = $window.location.pathname;
          $scope.param = {"reload": false,"successCallback": function(resp_data){
            $('.modal', $($element[0])).modal('close');
            Materialize.Toast('Успешный вход', 3000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
            if ($scope.param.reload) $window.location.reload();
            else if (resp_data.version && document.UniOST.VersionChanged(resp_data.version))
              Materialize.Toast($('<a href="javascript:" class="hover-shadow3d red-text text-darken-4">').click(function(){ $window.location.reload(true); }).html('Получено обновление программы. Нужно обновить [F5] <i class="material-icons" style="">refresh</i> версия '+resp_data.version), 10000, 'red lighten-4 red-text text-darken-4 border fw500 animated zoomInUp');
            AuthExpiration.expires = 0;
            if(!AuthExpiration.intervalID && AuthExpiration.DefaulExpiration$().length) AuthExpiration.intervalID = setInterval(AuthExpiration.intervalCallback, AuthExpiration.intervalDelay);
          }};
          formAuthTCache.load.then(function (proms) {
            $ctrl.ready = true;
            $timeout(function() {
              var modal = $('.modal', $($element[0]));
              //~ if (window.innerWidth < 1200) modal.css({'width': '90vw'});
              modal.modal({"dismissible": false,}).modal('open');
              
            });
          });
          
        };
      }
    })///конец component('authTimerLogin'
    ;
    /** тупо всегда активировать этот модуль**/
    //~ angular.element(document).ready(function() { angular.bootstrap(document, ["AuthTimer"]); });
    angular.GlobalModules('AuthTimer', 'AppTplCache', 'SVGCache');





})();
