(function () {
'use strict';

/*
  используется для авторизации и для изменений внешних профилей в редактировании профиля
  
  */

var moduleName = 'ProfileLib';
var module = angular.module(moduleName, ['appRoutes']);

try {angular.module('ngCordovaOauth');}
catch (err) {///заглушка для сайта
  module.factory('$cordovaOauth', function(){return {};});
}

var OAuthConnect = function($http, $q, $timeout, appRoutes, $cordovaOauth){
  
return function(site, profile) {//constructor
  var oauth = this;
  
  oauth.Connect = function() {
    if (oauth[site.name])
      return oauth[site.name]()
      .then(oauth.success_token, oauth.error_token);
    
    return $q(function(resolve, reject) {
      $timeout(function() {
        reject({error:"Нет коннектора для сайта "+angular.toJson(site)});
      });
    });
  };
  
  oauth.getProfile = function(data) {// получить внешний профиль указанного сайта и автоматическая  авторизация если не авторизован
    //~ console.log("Получить внешний профиль сайта " +site.name+ " по данным: "+angular.toJson(data));
    if (profile && profile.auth_cookie) data.auth_cookie = profile.auth_cookie;
    return $http.post(appRoutes.url_for("oauth profile", site.name), data);
    
  };
  /*костыль для мобил, после ngCordovaOauth получения токена теряются куки*/
  /* auth_cookie передаю сразу в oauth.getProfile
  oauth.Relogin = function () {// 
    return $q(function(resolve, reject) {
      if (profile)
        $http.post(appRoutes.url_for('релогин'), {cookie: profile.auth_cookie})
          .then(function(resp){
            var new_profile = resp.data.profile;
            if (!new_profile) {
              console.log("Ошибка перелогина, нет профиля ЛГ: "+angular.toJson(resp.data));
              return reject(resp.data);
            }
            angular.forEach(new_profile, function(val, key){ profile[key] = val; });
            return resolve();
          },
          function(err) {
            console.log("Ошибка перелогина "+angular.toJson(err));
            return reject(err);
          }
          );
      
      
      return resolve();
    });
  };*/
  
  oauth.success_token = function(result) {
    
    return $q(function(resolve, reject) {
    
    if (!result.access_token) {
      console.log("Успешный редирект с внешнего сайта, но нету access_token " + angular.toJson(result));
      return reject(result);
    }
    
    //~ return oauth.Relogin(0)
      //~ .then(function(resp){
    return    oauth.getProfile(result)
          .then(function(resp){
            if (resp.data.error) {
              //~ site.error = resp.data.error;
              return reject(resp.data.error);
            }
            //~ console.log("Успешно получен внешний профиль "+angular.toJson(resp.data));
            //~ site.profile=resp.data;
            return resolve(resp.data);
          },
          function(err) {
            console.log("Ошибка получения внешнего профиля по access_token="+result.access_token+angular.toJson(err));
            //~ site.error = err;
            return reject(err);
          }
          );
        
      //~ },
      //~ function(err) {
        //~ console.log("Ошибка перелогина после получения access_token="+result.access_token+angular.toJson(err));
        //~ return reject(err);
      //~ }
      //~ );
    
    });
    
  };
  
  oauth.error_token = function(err) {
    return $q(function(resolve, reject) {
      //~ $timeout(function() {
        console.log("Ошибка получения access_token" + angular.toJson(err));
        //~ site.error = err;
        return reject(err);
        
      //~ });
    });
    
  };
  
  oauth.google = function() {
    return $cordovaOauth.google(site.key, ['profile']); //"email"
  };
  
  oauth.vkontakte = function() {
    return $cordovaOauth.vkontakte(site.key, []); //"email"
  };
  
  oauth.yandex = function() {
    return $cordovaOauth.yandex(site.key, {redirect_uri:"https://lovigazel.ru/oauth/login/yandex"});
  };
  
  oauth.mailru = function(){
    return $cordovaOauth.mailru(site.key, [], {redirect_uri:"http://connect.mail.ru/oauth/success.html", browserWindow: 'location=no,clearsessioncache=yes,clearcache=yes'});
  };
  
}; // end constructor

  //~ var factory = {
    //~ google: google,
    //~ "vkontakte": vkontakte,
    
  //~ };
  
  //~ return factory;
  
};

module
.factory('OAuthConnect', OAuthConnect)

;
  
}());