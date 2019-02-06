(function () {
'use strict';

var moduleName = 'formAuth';
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TemplateCache', 'Util']);//, 'phone.input'

module.value('formAuthTCache', {});
module.run(function(formAuthTCache, TemplateCache, appRoutes){
  formAuthTCache.load = TemplateCache.split(appRoutes.url_for("assets", "profile/form-auth.html"), 1);
    //~ .then(function(){console.log("formAuthTCache loaded");});
  //~ console.log("run", formAuthTCache);
});
//~ var templateCache = "/assets/profile/form-auth.html";

function parseUrlQuery() {
  var data = {};
  if(location.search) {
    var pair = (location.search.substr(1)).split('&');
    for(var i = 0; i < pair.length; i ++) {
      var param = pair[i].split('=');
      data[param[0]] = param[1];
    }
  }
  return data;
}

  
var Controll = function ($scope, formAuthTCache) {//md5,loadTemplateCache, appRoutes,
  var ctrl = this;
  //~ console.log("controller", formAuthTCache);

  //~ loadTemplateCache.split(appRoutes.url_for("assets", "profile/form-auth.html"), 1)
  formAuthTCache.load
    .then(function (proms) {
      var query = parseUrlQuery();
      $scope.param = {"from": query['from'] || query['r']};
      ctrl.ready = true;
      
    }
  );
  

};

var ComponentAuth = function ($http, $window,  $q, appRoutes) {//, phoneInput
  var $c = this;
  
  //~ console.log("form auth "+$c.parentCtrl);

  $c.$onInit = function () {
    $c.InitData();
    if (!$c.param) $c.param={};
    $c.ready = true;
    
  };
  
  $c.InitData = function(){
    $c.login = '';
    $c.passwd = '';
    
  };
  
  var send_http_cb = function (resp) {
    //~ console.log(resp.data);
    delete $c.cancelerHttp;
    if (resp.data.error) $c.error = resp.data.error;
    if (resp.data.success) $c.success = resp.data.success;
    if (resp.data.digest) $c.captcha = resp.data;
    if (resp.data.remem) $c.remem = resp.data.remem; //$c.forget = false; $c.passwd='';}
    if (resp.data.id) {//успешный вход
      $c.successLogin = !0;
      //~ console.log("ComponentAuth", $c.param);
      $c.InitData();
      Materialize.Toast('Успешный вход', 3000, 'green lighten-4 green-text text-darken-4 border fw500 animated zoomInUp');
      if ($c.successCallback) return $c.successCallback(resp.data);// мобильный вход parentCtrl.LoginSuccess
      if ($c.param.successCallback) return $c.param.successCallback(resp.data);
      if (resp.data.redirect) $window.location.href = appRoutes.url_for(resp.data.redirect);
      else if ($c.param.from) $window.location.href = $c.param.from;
      $c.ready = false;
    }
  };
  
  $c.Send = function () {
    if ( !$c.Validate() ) return false;
    var data = {"login": $c.login};//md5.createHash($c.passwd)
    if (!$c.forget && !$c.remem) data.passwd = ($.md5 && $.md5($c.passwd)) || md5($c.passwd);
    if ($c.captcha) data.captcha = $c.captcha;
    if ($c.remem) data.remem = $c.remem;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    delete $c.error;
    delete $c.success;
    
    //~ console.log('Send login '+$c.upCtrl);
    
    //~ var url = '';
    //~ if ($c.baseUrl) url += $c.baseUrl; // мобил
    //~ url += appRoutes.url_for("обычная авторизация/регистрация");
    
    $http.post(appRoutes.url_for("обычная авторизация/регистрация"), data, {timeout: $c.cancelerHttp.promise}).then(send_http_cb,  function (error) {console.log("Ошибка запроса:"+angular.toJson(error, true));});
    
  };
  
  var re_email = /^.+@[\wа-я]+\.[\wа-я]{2,}$/i;
  $c.Validate = function () {
    if ( !$c.cancelerHttp && $c.validLogin() && (($c.remem && $c.remem.code && $c.remem.code.length) || $c.forget || ($c.passwd && $c.passwd.length > 3))) return true;
    return false;
  };
  $c.validLogin = function () {
    return $c.login && $c.login.length;
    //~ return ($c.login_tel && phoneInput.validate($c.login)) || (!$c.login_tel && $c.login && re_email.test($c.login));
  };
  
  $c.isCaptcha = function() {
    if($c.captcha) delete $c.captcha;
  };
  
  $c.forgetClick = function() {
    if( $c.validLogin() ) {
      $c.forget=!$c.forget;
      $c.passwd='';
      //~ delete $c.remem;
      //~ delete $c.error;
      $c.Send();
    }
  };
  $c.enterSend = function (ev) {
    if (ev.keyCode == 13) $c.Send();
  };
  
  $c.captchaSrc = function(){
    return appRoutes.url_for("картинка капчи", $c.captcha.digest);
  };
  
};

/*
var ComponentOAuth = function ($scope, $http, $window,  $q, appRoutes, OAuthConnect) {
  var $c = this;
  
  //~ console.log("form auth "+$c.parentCtrl);

  $c.Init = function() {
    $http.get(appRoutes.url_for("внешние профили")).then(function(resp){
      
      $scope.data = resp.data;
      $c.param = $c.param || {};
      $c.ready = true;
      
    });
    
  };
  
  $c.Connect = function(site) {
    //~ $oauth ? 'javascript:"только_одна_авторизация"' : $c->url_for('oauth-login', site=> $_->{name}),
    if(!$c.param.mobile) {
      $window.location.href = appRoutes.url_for('oauth-login', site.name, {"redirect":'/'});
      return;
    }
    
    delete site.error;
    //~ site.authenticate = true;// получить главный профиль
    //~ $c.ready
    new OAuthConnect(site)
      .Connect()
      .then(function(profile){// успешно получил внешний профиль
        //~ console.log(angular.toJson(profile));
        site.profile = profile;
        if ($c.successCallback) $c.successCallback();
      },
      function(err){
        //~ console.log(angular.toJson(err));
        site.error = err;
      });
    
  };
  
  $c.imgSrc = function(site) {
    return appRoutes.url_for('site logo', site.site_name || site.name);
  };
  
  $c.btnClass = function(site) {
    if(site.btn_class) return site.btn_class;
    return 'white';
  };
  
};*/


module
.controller('formAuthControll', Controll)

.component('formAuth', {
  controllerAs: '$c',
  templateUrl: "profile/form-auth",
  bindings: {
    param: '<',
    successCallback: '<'// мобильное приложение указывает свой контроллер для своего перехода на страницу (вместо redirect)
    //~ baseUrl: '<' // мобил
  },
  controller: ComponentAuth
})

//~ .component('formOauth', {
  //~ templateUrl: "profile/form-oauth",
  //~ bindings: {
    //~ param: '<',
    //~ successCallback: '<'// мобильное приложение указывает свой контроллер для своего перехода на страницу (вместо redirect)
  //~ },
  //~ controller: ComponentOAuth
//~ })
;

}());