(function () {
'use strict';

var moduleName = 'formProfile';
var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache', 'appRoutes',  'phone.input', 'ProfileLib']);

var Controll = function ($scope, $q, $http, appRoutes, loadTemplateCache ) {//md5 md5.createHash(ctrl.passwd)
  var ctrl = this;
  
  var async = loadTemplateCache.split("/assets/profile/form.html");
  async.push($http.get(appRoutes.url_for("данные профиля")).then(function (resp) {//
    $scope.profile = resp.data;
  }));

  $q.all(async).then(function (proms) {
    ctrl.ready = true;
  });

};

var formProfileComp = function($scope, $attrs, $http, $q, $window, $timeout, appRoutes, phoneInput) {
  var $ctrl = this;
  //~ $ctrl.profile.names.push('%s')", $c->auth_user->{names}
  
  
  $ctrl.Init = function() {

    $ctrl.init_login = $ctrl.profile.login;
    $ctrl.profile.pw=[];
    if($ctrl.oldPw) ctrl.data.pw[0]=$ctrl.oldPw;
    if(!$ctrl.profile.names) $ctrl.profile.names = [];
    $ctrl.init_names = $ctrl.profile.names.join(';');
    $timeout(function() {$ctrl.login_tel = phoneInput.validate($ctrl.profile.login);});
    $ctrl.ready = true;
  };
  
  var http_then_cb = function (resp) {
    console.log(resp.data);
    delete $ctrl.cancelerHttp;
    $ctrl.profile.pw = [];
    if (resp.data.error) {
      $ctrl.error = resp.data.error;
      return;
    }
    
    $ctrl.init_names = $ctrl.profile.names.join(';');
    if (resp.data.success) $ctrl.success = resp.data.success;
    if (resp.data.login) $ctrl.init_login = resp.data.login;
    
    if (resp.data.redirect) {
      if ($ctrl.onRedirectCallback) return $ctrl.onRedirectCallback(resp.data);
      $window.location.href = resp.data.redirect;
    }
    
    
  };
  $ctrl.Send = function () {
    delete $ctrl.error;
    delete $ctrl.success;
    if($ctrl.profile.pw) angular.forEach($ctrl.profile.pw, function(val, idx) {$ctrl.profile.pw[idx] = $.md5(val);});
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    $http.post(appRoutes.url_for('профиль сохранить'), $ctrl.profile).then(http_then_cb); //$attrs.action
    
  };
  
  //~ console.log('formProfileComp', $scope.$parent.$parent, $ctrl.profile );
  //|| ($scope.$parent.$parent && $scope.$parent.$parent.formProfile.$pristine)
  $ctrl.Validate = function () {
    if ($ctrl.cancelerHttp) return false;
    else if ($ctrl.profile.names.join('') !== "" && $ctrl.init_names != $ctrl.profile.names.join(';')) return true; 
    else if ($ctrl.init_login && $ctrl.init_login != $ctrl.profile.login) return $ctrl.validLogin() && $ctrl.validPw(0);// старый пароль для изменнного логина
    else if ($ctrl.init_login) return $ctrl.validPw(0) && $ctrl.validPw(1) && $ctrl.profile.pw[0] != $ctrl.profile.pw[1]; // изменить пароль для логина
    else if ( $ctrl.validLogin() && $ctrl.validPw(1) ) return true; // новый пароль для нового логина
    //~ else if () return true;
    return false;
    
  };
  
  var re_email = /^.+@[\wа-я]+\.[\wа-я]{2,}$/i;
  $ctrl.validLogin = function() {
    //~ console.log("validLogin", $ctrl.init_login, $ctrl.profile.login);
    //~ if ($ctrl.init_login && $ctrl.validPw()) return true;
    //~ if ($ctrl.init_login && $ctrl.init_login == $ctrl.profile.login) return false;
    if ($ctrl.login_tel && phoneInput.validate($ctrl.profile.login)) return true;
    if (!$ctrl.login_tel && re_email.test($ctrl.profile.login)) return true;
    return false;
  };
  
  $ctrl.validPw = function(idx) {
    //~ console.log("validPw", $ctrl.profile.pw);
    //~ if ($ctrl.init_login) {
      //~ if ($ctrl.init_login != $ctrl.profile.login ) return $ctrl.profile.pw[0] && $ctrl.profile.pw[0].length > 5;
      //~ return  $ctrl.profile.pw[0] && $ctrl.profile.pw[0].length > 5 && $ctrl.profile.pw[1] && $ctrl.profile.pw[1].length > 5 && $ctrl.profile.pw[0] != $ctrl.profile.pw[1];
    //~ }
    //~ else // для нового логина - второй пароль
      return $ctrl.profile.pw[idx] && $ctrl.profile.pw[idx].length > 5;// && $ctrl.profile.pw[idx];
    //~ if ( (!$ctrl.init_login || $ctrl.profile.pw[0] && $ctrl.profile.pw[0].length > 5) && ($ctrl.init_login != $ctrl.profile.login || $ctrl.profile.pw[1] && $ctrl.profile.pw[1].length > 5 && $ctrl.profile.pw[0] != $ctrl.profile.pw[1]) ) return true;
    //~ return false;
  };
  
};


var OAuthComp = function ($scope, $http, $window, appRoutes, OAuthConnect) {
  var $ctrl = this;
  
  $ctrl.Init = function() {
    $http.get(appRoutes.url_for("внешние профили")).then(function(resp){
      
      $scope.data = resp.data;
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.Count = function () {
    return $scope.data.filter(function(site) { return site.profile; }).length;
    
  };
  
  $ctrl.btnClass = function(site) {
    if(site.profile) return 'disabled';
    if(site.btn_class) return site.btn_class;
    return 'white';
  };
  
  $ctrl.Connect = function(site) {
    //~ $oauth ? 'javascript:"только_одна_авторизация"' : $c->url_for('oauth-login', site=> $_->{name}),
    if (site.profile) return;
    
    if(!$ctrl.param.mobile) {
      $window.location.href = appRoutes.url_for('oauth-login', site.name);
      return;
    }
    
    if (!$ctrl.profile.auth_cookie) {
      var msg = "В профиле не сохранены куки авторизации";
      console.log(msg);
      site.error = msg;
      return;
    }
    
    delete site.error;
    //~ site.conflict = 'old';
    var oauth = new OAuthConnect(site, $ctrl.profile);
    oauth.Connect()
      .then(function(profile){// успешно получил внешний профиль
        //~ console.log(angular.toJson(profile));
        site.profile = profile;
      },
      function(err){
        //~ console.log(angular.toJson(err));
        if (err == 'CONFLICT') site.error_conflict = true;// уже используется
        else site.error = err;
        //~ console.log("Relogin now");
        //~ oauth.Relogin().then(function(){}, function(err){site.error = err});
      });
      //~ .then(function(){
        
      //~ });
    
  };
  
  $ctrl.imgSrc = function(site) {
    return appRoutes.url_for('site logo', site.site_name || site.name);
    //~ /img/logo/$_->{name}.png
    
  };
  
  $ctrl.avatarSrc = function(site){
    if (!site.profile_avatar && !site.profile[site.profile_avatar]) return '';
    var url;
    if (appRoutes.routes[site.name+' profile avatar']) {
      //~ appRoutes.baseURL('');
      var base = new RegExp("^"+appRoutes.baseURL(), "g");
      url = appRoutes.url_for(site.name+' profile avatar', site.profile[site.profile_avatar]).replace(base, "" );
      //~ appRoutes.baseURL(base);
    }
    else url = site.profile[site.profile_avatar];
    //~ console.log("Аватарка: "+url);
    return url;
    
  };
  
  $ctrl.Disconnect = function(site) {
    //~ $c->url_for('oauth-detach', site=> $_->{name}),},
    
    if(!$ctrl.param.mobile) {
      $window.location.href = appRoutes.url_for('oauth-detach', site.name);
      return;
    }
    
    var choose = ons.notification.confirm("Действительно отсоединить внешний профиль сайта "+site.name, {"title": "Внимание",
      "buttonLabels": ['Да', 'Отмена'], "cancelable": true,
      "callback": function (idx) {
        //~ console.log("confirm callback args "+angular.toJson(Array.prototype.slice.call(arguments)));
        if (idx !== 0) return;
        $http.post(appRoutes.url_for('oauth-detach', site.name))
          .then(function(resp){
            console.log("Успешно отсоединил внешний профиль "+angular.toJson(resp.data));
            delete site.profile;
          });
      }
    });
    
  };
  
  $ctrl.ReloginUrl = function(site) {
    return appRoutes.url_for('logout', undefined, {"redirect": appRoutes.url_for('oauth-login', site.name)});
    //~ /logout?redirect=@{[$c->url_for(, site=>$site->{name})]}
  };
  
};


module

.controller('formProfileControll', Controll)

//~ .factory('OAuthConnect', OAuthConnect)

.component(moduleName, {
  templateUrl: "profile/form",
  bindings: {
    profile: '<',
    oldPw: '<',
    onRedirectCallback: '<',
  },
  controller: formProfileComp
})

.component('oauthProfile', {
  templateUrl: "profile/oauth",
  bindings: {
    profile: '<',
    param:'<',
    //~ data: '<',
  },

  controller: OAuthComp
})
;
  
}());