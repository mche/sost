/***
    обновление скриптов работает за счет очистки/пересоздания ассет|пак кэша
    обновление шаблонов через смену ВЕРСИИ (используется в сервисе LoadTemplateCache для добавления к урлам) static/js/controllers/template-cache/script.js
***/
window.undef = undefined;
//~ Vue.use(Vuex);///необязательно
(function () {
  'use strict';
  //~ Vue.config.productionTip = true;
  //~ angular.FilterFreeModuleName = function(name) в global-modules.js
  
  angular.module('AppTplCache', [])///(название любое уникальное - этот модуль автоматически вставляется всегда с помощью global-modules.js)
  .run(function($templateCache) {
    //~ console.log("AppTplCache...", $templateCache);
    $templateCache.put('progress/load', '<div class="progress z-depth-1 teal-lighten-4" style="height: inherit;"><div class="center teal-text text-darken-2">Загружается...</div><div class="indeterminate teal"></div></div>');
    if (Vue) Vue.component('v-progress-indeterminate', { "props": ['color', 'message'], /*"data": function () { return { }},*/ "template": '<div :class="`progress z-depth-1 ${ color }-lighten-4`" style="height: inherit;"><div :class="`center ${ color }-text text-darken-2`">{{ message }}</div><div :class="`indeterminate ${ color }`"></div></div>',});
    $templateCache.put('progress/save', '<div class="progress z-depth-1 teal-lighten-4" style="height: inherit;"><div class="center teal-text text-darken-2">Сохраняется...</div><div class="indeterminate teal"></div></div>');
    $templateCache.put('progress/search', '<div class="progress z-depth-1 teal-lighten-4" style="height: inherit;"><div class="center teal-text text-darken-2">Поиск...</div><div class="indeterminate teal"></div></div>');
    $templateCache.put('progress/check', '<div class="progress z-depth-1 teal-lighten-4" style="height: inherit;"><div class="center teal-text text-darken-2">Проверка...</div><div class="indeterminate teal"></div></div>');
    $templateCache.put('preloader-circular-small', '<div class="preloader-wrapper small active"><div class="spinner-layer"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>');
    $templateCache.put('preloader-circular-small-red-darken-3', '<div><div class="preloader-wrapper small active"><div class="spinner-layer red-border border-darken-3"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
    if (Vue) Vue.component('v-preloader-circular-small', { "props": ['color'], "template": '<div><div class="preloader-wrapper small active"><div class="spinner-layer  " :class=" `border-${ color }` "><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>',});
    if (Vue) Vue.component('v-runtime-template', vRuntimeTemplate);
    
    //http://www.dailycoding.com/Utils/Converter/ImageToBase64.aspx
    //~ $templateCache.put('icon/block', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABB0lEQVR4Ab3OwUlcURiG4ecOeG4BgXQwiEVkkRYERVHcuBhEO9AiEhhID4qWooOQrXJRWwjObL7AIFc8eLY+//b94PflekduDFZWBtcO9bTteZHqnu361MQfEbdmpooNUzN3IuYmauv8n2MfdS7eJpW9df5D7bu/ImKHd70XcdzIF87Fk2J0JG6b+TedhTgwuhGzZg4n4spoENN2jk3xaLQSpZ2jiOXHwUY7Ry+W9UvtnC3xYHQtZu0cZ+LS6FDc6Zp5517sG/WexUUj51QMCu92RRr5T69iW2Uu4lxXPXO6zn9Tm7xNFk5sKnpbztyL+GXiUzuepLrBNm3FgSuPlpYeXNpXfLH/Cj6QJVPd+u0AAAAASUVORK5CYII=" alt="icon block" />');
    //~ $templateCache.put('img-src/driver', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABmUlEQVRoge2Y7XGDMAyGNUJG0AgdgQ3KCB2FDcgGyQbJBmED2IBskG6Q2Id8VVKCbfFhyOm5e//4jPxKtsEGQFEU5dNAo9KoNrqTamrDZK4CsSbvHpXJ3HngFfepTuTxLXsIN++0T+K0B4R48064uNseJNVf1SzErP1V7gWpeafkbD6BBuTmmwR+/7H5TYyw8deoZdMfMkfMXljF2u8jZCZWV/lXEDqTfEYaasNkrhRF8fIN3XXxQmrhbxO3rL2kvqsgMzqB/Et8ohiLYwcdcw94VQ0LJbKDsD8PUpU0xmzmp6z60GxMnsRS5mdL4rCgeafDVObzBOad8rHm7TS2EQNejQro3ijI4iC1FdQnNF4LI5dSEWE8plp5RCKF1Dwa3QIGOIKsSjt61hf/BsJjeMjl5NzznD0m2C8sX3ottfUdIaqAcUSXIF/gX3iu/Bd0Zx2fmQv1dSDFGnqmkiRw9gTlVbEmQpYbXxY8ed9sixKwVRqqTMb6HiPM873jyDx9xa9TW6XqTVBOrHk3C74YV6MfqXlFUZT5eQCJZUOijKdjWwAAAABJRU5ErkJggg==');
  });

  
  /******************************************************************************
  
  Глобальный модуль App (название любое уникальное - этот модуль автоматически вставляется всегда с помощью global-modules.js)
  две его задачи:
  1. (Перенес в Cвелт-модуль auth.js) Отслеживать и продлевать сессию (если задан элемент $('#session-default-expiration') с текстом количества секунд жизни куков сессии)
  2. AutoJSON - автоматически парсинг полей данных JSON-запросов с суффиксом `/json` (см re)
  
  доступа к кукам не будет https://stackoverflow.com/a/27863299
  поэтому отслеживать время запросов
  
  хорошо тут http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
  *******************************************************************************/
  

  
  /// копия из Util инъекция в provider не катит
  const IsType = function(data, type) { return Object.prototype.toString.call(data).toLowerCase() == '[object '+type.toLowerCase()+']'; };

  const AppOptions = function(){ return JSON.parse($('head meta[name="app:options"]').attr('content') || '{}'); };

  
  angular.module('App', [/*'Форма авторизации'*/])///
    //~ .run(function($http) {
      //~ if (Vue) Vue/*.prototype*/.$http = $http;
      //~ if (parcelRequire) parcelRequire.register('$http', $http);
      
    //~ })
    
    .provider('AutoJSON', function(){ // провайдер потому что нужен в конфиге (фактори и сервисы не инъектятся)
      var re = /\/json$/i;
      //~ console.log("provider 'AutoJSON' ",  angular.injector(['Util']).get('Util')); не катит
      const SomeKey = function(key) { return key == this;}
      const AutoJSON = function(data, over){ // over - логич параметр перезаписи существующего поля после удаления из имени хвоста `/json`
        //~ if (angular.isObject(data)) { не работает
        if ( IsType(data, 'Object') ) Object.keys(data).map(function(key){
          if (['row_to_json', 'row_to_jsonb', 'jsonb_agg', 'json_agg'].some(SomeKey, key)) {
            data =  AutoJSON(JSON.parse(data[key]));
            return;
          }
          var jkey = key.replace(re, '');
          if (jkey != key && (!!over || !data.hasOwnProperty(jkey))) {
            if (/*angular.isString(data[key])*/ IsType(data[key], 'String') )  data[jkey] = AutoJSON(JSON.parse(data[key]));
            else if ( /*angular.isArray(data[key])*/ IsType(data[key], 'Array') )   data[jkey] = data[key].map(function(val){ return AutoJSON( IsType(val, 'String') ? JSON.parse(val) : val ); });
           //~ else if (/*angular.isObject(data[key])*/ IsType(data[key], 'Object') ) data[jkey] = AutoJSON( IsType(data[key], 'String') ? JSON.parse(data[key]) : data[key] );
            else  data[jkey] = AutoJSON(data[key]); ///объект
            delete data[key];/// поле долой
          }
          else  data[key] = AutoJSON(data[key]);
        });
        else if (IsType(data, 'Array')) data.map(function(val, idx) {
          data[idx] = AutoJSON(val);
        }); 
        
        return data;
      };
      this.$get = function() {
        return {"parse": AutoJSON}; // для инъектов
      };
      this.parse = AutoJSON;// для конфига
      
    })/// end provider AutoJSON
    
    .config(function ($httpProvider, $provide, /*$injector,*/ $compileProvider, AutoJSONProvider) {//, $cookies
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|javascript):/);
      
      //~ Vue.$injector = $injector;///.get('$http');
      
      $provide.factory('httpInterceptor', function ($q /*,$injector, $rootScope, $window, $timeout /*, appRoutes*/) {//$rootScope, $location
        let jsonTypeRE = /application\/json/;
        
        return {
          "request": function (config) {
            //~ AuthExpiration.nowReqs++;
            //~ expires = (new Date() - lastResTime)/1000;
            //~ if(expires > defaultExpiration() && Materialize && Materialize.toast) Materialize.toast("", )
            //~ //var $cookies = $injector.get('$cookies');
            //~ var cache = config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && stopReqs) return $q.reject(config);//console.log("httpInterceptor request", $cookies);
            return config || $q.when(config);
          },
          "requestError": function (rejection) {
            return $q.reject(rejection);
          },
          "response": function (resp) {
            //~ AuthExpiration.nowReqs--;
            //~ var $cookies = $injector.get('$cookies');
            //~ console.log("httpAuthTimer", arguments);
            var cache = resp.config.cache; // тут же $templateCache
            if(!cache || !cache.put) {
              //~ lastResTime = new Date();
              var contentType = resp.headers()['content-type'];
              var isJSON = jsonTypeRE.test(contentType);
              if(isJSON) resp.data = /*console.log("AutoJSONProvider",)*/ AutoJSONProvider.parse(resp.data);// провайдер(дописывается к имени!) потому что в конфиге (фактори и сервисы не инъектятся)
              console.log(/*"response 200: ", */ /*lastResTime.toLocaleString(),*/ resp.config.method, resp.config.url, isJSON ? resp.data : contentType );//dateFns.differenceInSeconds(new Date(), lastResTime));//response.headers()
            }
            return resp || $q.when(resp);
          },
          
          "responseError": function (resp) {
            if(!resp.config) return $q.reject(resp);
            var cache = resp.config.cache; // тут же $templateCache
            //~ if((!cache || !cache.put) && resp.status == 404) {
              //~ var exp = (new Date() - lastResTime)/1000;//dateFns.differenceInSeconds(new Date(), lastResTime);
              //~ if(exp > AuthExpiration.defaultExpiration()) $timeout(AuthExpiration.ToastLogin);///ShowLoginForm
            //~ }
            return $q.reject(resp);
          }
        };
      });/// factory 'httpInterceptor'
      
      //~ console.log("закинул $httpProvider.interceptors.push('httpAuthTimer') ");
      $httpProvider.interceptors.push('httpInterceptor');
      //~ $httpProvider.interceptors.push(function($injector) {
        //~ console.log("app config $http", $injector.get('$http'));
      //~ });
      
    })
    
    .factory('$AppOptions', function($http, appRoutes){
      var $this = {};
      $this.Get = AppOptions;
      $this.Save = function(){
        
      };
      return $this;
    })
    
    .factory('$AppUser', function(){
      return {
        ID(){
          return $('head meta[name="app:uid"]').attr('content');
        },
        
      };
    })
    ;
/***
    Usage $Console.log(...);
***/
    const MyConsole = function(){
      //~ console.log("NewConsole");
      //~ var newConsole = {};
      window.console.enable = function(bool){
        //~ if (bool === undefined) return enable;
        //~ enable = bool;
      };
      window.console.log = function(){
        //~ enable && origConsole.log && origConsole.log.apply(origConsole, arguments);
      };
      window.console.info = function () {
        //~ enable && origConsole.log && origConsole.info.apply(origConsole, arguments);
      };
      window.console.warn = function () {
        //~ enable && origConsole.log && origConsole.warn.apply(origConsole, arguments);
      };
      //~ window.console.error = function () {
        //~ enable && origConsole.log && origConsole.error.apply(origConsole, arguments);
      //~ };
      //~ return newConsole;
    };
    
    angular.module('Console', [])/*autoinject*/
    .provider('NewConsole', function(){
      //~ const origConsole = window.console;
      var headOptions = AppOptions();
      if (!headOptions.jsDebug) MyConsole();
      this.$get = function(){
        return window.console;
      };
    })/* end provider NewConsoleProvider*/
    .config(function(NewConsoleProvider){ /*просто вызвали провайдера*/ })
    //~ .factory('$Console', function(NewConsole){///$window, $timeout
      //~ return NewConsole;
    //~ })
    ;
    /** тупо всегда активировать**/
    angular.injector(['Console']);///.get('$Console')
  
    /**
    ** $EventBus.$emit("мое событие", data);
    ** $EventBus.$on('мое событие', function(data){ ... });
    */
  angular.module('EventBus', [])
    .factory('$EventBus', function(){
      return new Vue();
    });
    
    //~ angular.element(document).ready(function() { angular.bootstrap(document, ["App"]); });
    angular.GlobalModules('App', 'TemplateCache', 'appRoutes', 'AppTplCache', 'SVGCache');///, 'Console'





})();
