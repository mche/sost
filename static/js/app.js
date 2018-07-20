undef = undefined;
(function () {
  'use strict';
  
  angular.module('AppTplCache', [])///(название любое уникальное - этот модуль автоматически вставляется всегда с помощью global-modules.js)
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
    
    .config(function ($httpProvider, $provide, AutoJSONProvider) {//, $cookies
      //~ console.log("module('AuthTimer').config()...");
      var el_default_expiration = $('#session-default-expiration'),
        Config = {
          "el_default_expiration": el_default_expiration,
          "exp_active": $('<span class="chip right" style="padding: 0 0.5rem; margin:0;">').appendTo(el_default_expiration.parent()),
          "DEFAULT_EXPIRATION": parseInt(el_default_expiration.text() || 10),///!внимание! DEFAULT_EXPIRATION должен соотв серверной куки просрочке!
          "expires": undefined,///тут счетчик секунд
          "interval": 1000,///итервал изменения счетчика
          "toast": function(){ Materialize.toast($('<a href="/profile" target="_blank" class="hover-shadow3d white-text bold">').html('Завершилась сессия авторизации, нужно войти заново <i class="material-icons">arrow_forward</i>'), 30*1000, 'red darken-2'); },
          "intervalCallback" : function(){
            if(Config.expires === undefined) return;
            var c=Config.DEFAULT_EXPIRATION-(Config.expires++),
              m=(c/60)>>0,
              s=(c-m*60)+'';
            Config.exp_active.text(m+':'+(s.length>1?'':'0')+s);
            c == 0 && clearInterval(Config.interval) | Config.toast();
          },
          "nowReqs": 0,///счетчик текущих запросов данных (отложить запрос в /keepalive)
        };
      if(Config.el_default_expiration.length) Config.interval = setInterval(Config.intervalCallback, Config.interval);
      
      $provide.factory('httpAuthTimer', function ($q, $injector, $rootScope, $window, $timeout /*, appRoutes*/) {//$rootScope, $location
        
        if(Config.el_default_expiration.length) (function(config){ /*** поддержка сессии по движениям мыши ***/
          var deferred,
            reset = function(){
              deferred = undefined;
            },
            deferred = $timeout(reset, 60*1000),
            done = function(xhr, status, msg ){
              //~ console.log("keepalive done", arguments);
              if (status == 'error' && msg.toLowerCase() != 'not found') return console.log("keepalive fail", arguments);
              if (status != 'success') Config.toast();
              config.expires = 0;
              $timeout(reset, 60*1000);
            },
            eventCallback = function(){
              if (deferred || config.nowReqs) return;///$timeout.cancel(timeout);
              //~ timeout = $timeout(mouseMoveCallback, 30*1000);
              deferred = $.get('/keepalive'/*, success*/).always(done);
            }
          ;
          $(document).on('mousemove', eventCallback);
          $(document).on('scroll', eventCallback);
        }(Config));
        
        var lastResTime = new Date();//, stopReqs;
        var jsonTypeRE = /application\/json/
        return {
          "request": function (config) {
            Config.nowReqs++;
            //~ expires = (new Date() - lastResTime)/1000;
            //~ if(expires > DEFAULT_EXPIRATION && Materialize && Materialize.toast) Materialize.toast("", )
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            return config || $q.when(config);
          },
          "requestError": function (rejection) {
            Config.nowReqs--;
            return $q.reject(rejection);
          },
          "response": function (resp) {
            Config.nowReqs--;
            //~ var $cookies = $injector.get('$cookies');
            //~ console.log("httpAuthTimer", arguments);
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              lastResTime = new Date();
              Config.expires = 0;//(new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              var contentType = resp.headers()['content-type'];
              var isJSON = jsonTypeRE.test(contentType);
              if(isJSON) resp.data = /*console.log("AutoJSONProvider",)*/ AutoJSONProvider.parse(resp.data);// провайдер(дописывается к имени!) потому что в конфиге (фактори и сервисы не инъектятся)
              console.log("http AuthTimer+AutoJSONProvider: response 200: ",  lastResTime, resp.config.method, resp.config.url, isJSON ? resp.data : contentType );//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
            }
            return resp || $q.when(resp);
          },
          
          "responseError": function (resp) {
            Config.nowReqs--;
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            if((!cache || !cache.put) && resp.status == 404) {
              var exp = (new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              if(exp > Config.DEFAULT_EXPIRATION) $timeout(function(){
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
      //~ console.log("закинул $httpProvider.interceptors.push('httpAuthTimer') ");
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
    })///конец component('authTimerLogin'
    ;
    /** тупо всегда активировать этот модуль**/
    //~ angular.element(document).ready(function() { angular.bootstrap(document, ["AuthTimer"]); });
    angular.GlobalModules('AuthTimer', 'AppTplCache');





})();
