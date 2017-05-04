(function () {
'use strict';

var moduleName = 'formAuth';
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'load.templateCache', 'phone.input', 'ProfileLib']);//

//~ var templateCache = "/assets/profile/form-auth.html";

var Controll = function ($scope, loadTemplateCache, appRoutes) {//md5,
  var ctrl = this;

  loadTemplateCache.split(appRoutes.url_for("assets", "profile/form-auth.html"), 1)
    .then(function (proms) {
      ctrl.ready = true;
      
    }
  );
  

};

var ComponentAuth = function ($http, $window,  $q, appRoutes, phoneInput) {
  var $ctrl = this;
  
  //~ console.log("form auth "+$ctrl.parentCtrl);

  $ctrl.Init = function () {
    $ctrl.ready = true;
    
  };
  
  var send_http_cb = function (resp) {
    //~ console.log(resp.data);
    delete $ctrl.cancelerHttp;
    if (resp.data.error) $ctrl.error = resp.data.error;
    if (resp.data.success) $ctrl.success = resp.data.success;
    if (resp.data.digest) $ctrl.captcha = resp.data;
    if (resp.data.remem) $ctrl.remem = resp.data.remem; //$ctrl.forget = false; $ctrl.passwd='';}
    if (resp.data.id) {//успешный вход
      if ($ctrl.successCallback) return $ctrl.successCallback(resp.data);// мобильный вход parentCtrl.LoginSuccess
      if (resp.data.redirect) $window.location.href = resp.data.redirect;
    }
  };
  
  $ctrl.Send = function () {
    if ( !$ctrl.Validate() ) return false;
    var data = {"login": $ctrl.login};//md5.createHash($ctrl.passwd)
    if (!$ctrl.forget && !$ctrl.remem) data.passwd = $.md5($ctrl.passwd);
    if ($ctrl.captcha) data.captcha = $ctrl.captcha;
    if ($ctrl.remem) data.remem = $ctrl.remem;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    delete $ctrl.error;
    delete $ctrl.success;
    
    //~ console.log('Send login '+$ctrl.upCtrl);
    
    //~ var url = '';
    //~ if ($ctrl.baseUrl) url += $ctrl.baseUrl; // мобил
    //~ url += appRoutes.url_for("обычная авторизация/регистрация");
    
    $http.post(appRoutes.url_for("обычная авторизация/регистрация"), data, {timeout: $ctrl.cancelerHttp.promise}).then(send_http_cb,  function (error) {console.log("Ошибка запроса:"+angular.toJson(error, true));});
    
  };
  
  var re_email = /^.+@[\wа-я]+\.[\wа-я]{2,}$/i;
  $ctrl.Validate = function () {
    if ( !$ctrl.cancelerHttp && $ctrl.validLogin() && (($ctrl.remem && $ctrl.remem.code && $ctrl.remem.code.length) || $ctrl.forget || ($ctrl.passwd && $ctrl.passwd.length > 5))) return true;
    return false;
  };
  $ctrl.validLogin = function () {
    return ($ctrl.login_tel && phoneInput.validate($ctrl.login)) || (!$ctrl.login_tel && $ctrl.login && re_email.test($ctrl.login));
  };
  
  $ctrl.isCaptcha = function() {
    if($ctrl.captcha) delete $ctrl.captcha;
  };
  
  $ctrl.forgetClick = function() {
    if( $ctrl.validLogin() ) {
      $ctrl.forget=!$ctrl.forget;
      $ctrl.passwd='';
      //~ delete $ctrl.remem;
      //~ delete $ctrl.error;
      $ctrl.Send();
    }
  };
  $ctrl.enterSend = function (ev) {
    if (ev.keyCode == 13) $ctrl.Send();
  };
  
  $ctrl.captchaSrc = function(){
    return appRoutes.url_for("картинка капчи", $ctrl.captcha.digest);
  };
  
};

var ComponentOAuth = function ($scope, $http, $window,  $q, appRoutes, OAuthConnect) {
  var $ctrl = this;
  
  //~ console.log("form auth "+$ctrl.parentCtrl);

  $ctrl.Init = function() {
    $http.get(appRoutes.url_for("внешние профили")).then(function(resp){
      
      $scope.data = resp.data;
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.Connect = function(site) {
    //~ $oauth ? 'javascript:"только_одна_авторизация"' : $c->url_for('oauth-login', site=> $_->{name}),
    if(!$ctrl.param.mobile) {
      $window.location.href = appRoutes.url_for('oauth-login', site.name, {"redirect":'/'});
      return;
    }
    
    delete site.error;
    //~ site.authenticate = true;// получить главный профиль
    //~ $ctrl.ready
    new OAuthConnect(site)
      .Connect()
      .then(function(profile){// успешно получил внешний профиль
        //~ console.log(angular.toJson(profile));
        site.profile = profile;
        if ($ctrl.successCallback) $ctrl.successCallback();
      },
      function(err){
        //~ console.log(angular.toJson(err));
        site.error = err;
      });
    
  };
  
  $ctrl.imgSrc = function(site) {
    return appRoutes.url_for('site logo', site.site_name || site.name);
  };
  
  $ctrl.btnClass = function(site) {
    if(site.btn_class) return site.btn_class;
    return 'white';
  };
  
};


module
.controller('formAuthControll', Controll)

.component('formAuth', {
  templateUrl: "profile/form-auth",
  bindings: {
    successCallback: '<'// мобильное приложение указывает свой контроллер для своего перехода на страницу (вместо redirect)
    //~ baseUrl: '<' // мобил
  },
  controller: ComponentAuth
})

.component('formOauth', {
  templateUrl: "profile/form-oauth",
  bindings: {
    param: '<',
    successCallback: '<'// мобильное приложение указывает свой контроллер для своего перехода на страницу (вместо redirect)
    //~ baseUrl: '<' // мобил
  },
  controller: ComponentOAuth
})
;

}());