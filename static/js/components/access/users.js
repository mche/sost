(function () {'use strict';
/*
  Пользователи/сотрудники
  Список
  Выбор позиции
  Добавление
  Изменение
  Удаление
*/
var moduleName = "Users";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $c = this;
  //~ $scope.$c = this;
  $scope.urlFor = appRoutes.url_for;
  
  $scope.$on('Роли по $c.param.roles', function(event, roles){
    //~ console.log('Роли по $c.param.roles', roles, $scope._editUser);
    if($scope._editUser /*&& $scope._editUser._selected*/) $scope._editUser['группы'] = roles;
    
  });
  
  $c.$onInit = function() {
    if(!$c.searchComplete) $c.searchComplete = [];
    

    
    $c.LoadData().then(function(){
      $c.ready = true;
      
      $timeout(function() {
        $('.tabs', $($element[0])).tabs({"indicatorClass": 'red',});
        $c.tabsReady = true;
        $c.ShowTab(0);
        $timeout(function() {
          $c.searchtField = $('input[name="search"]', $($element[0]))
          var list = $('ul.users', $($element[0]));
          var top = list.offset().top+5;
          list.css("height", 'calc(100vh - '+top+'px)');
        });
      });
      
    });
    
    $scope.$watch(
      function(scope) { return $c.param.users; },
      function(newValue, oldValue) {
        
        if ( newValue !== undefined ) {
          $c.CheckUserS(newValue);
          //~ $c.ShowTab(0);
        }
      }
    );
    $scope.$watch(
      function(scope) { return $c.param.route; },
      function(newValue, oldValue) {
        
        if ( newValue === null ) $c.filterChecked = false;
      }
    );
    
    
  };
  
  
  $c.LoadData = function (){
    $c.searchComplete.length = 0;
    return $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profiles) || 'доступ/список пользователей'))
      .then(function(resp){
        $c.data = resp.data;
        $c.searchComplete.length = 0;
        //~ $c.InitSearch();
      });
    
  };
  
  $c.New = function(flag){
    //~ if(flag) return $c.data[0] && $c.data[0].id;
    if(flag) return $c.showBtnNewUser;
    //~ if(names === undefined) names = [];
    $c.showBtnNewUser = false;
    $c.filterChecked = false;
    var n = {"names":[$c.searchtField.val()],};
    if ($c.data[0] && $c.data[0].hasOwnProperty('login')) {n.login=''; n.pass='';}
    $c.data.unshift(n);
    $timeout(function(){
      $c.Edit(n);
      $c.ShowTab(0);
      $timeout(function() {
        var container = $('ul.users', $($element[0]));
        var el = $('.card.edit', container);
        container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
      });
    });
    
  };
  
  
  $c.Edit = function(user){
    if(user._edit) return $c.CloseEdit(user);
    $timeout(function(){
      user._edit = angular.copy(user);
      $scope._editUser = user._edit;
      $timeout(function(){$('textarea', $element[0]).keydown();});
      //~ $timeout(function(){ $c.InitFileUpload($scope._editUser); });
    });
    $c.Scroll2User(user);
    $c.ToggleSelect(user, true);
  };
  
  $c.ToggleSelect = function(user, select){// bool
    if (select === undefined) select = !user._selected;
    user._selected = select;
    if ($scope._editUser) $scope._editUser._selected = select;
    
    if (user._selected) {
      //~ $c.FilterChecked(false);
      ['role', 'roles', 'user', 'users', 'route', 'routes'].map(function(n){$c.param[n] = undefined;});
      $c.param.user = user;
      $c.ReqRoles(user);
      $c.ReqRoutes(user);
      $c.data.map(function(it){it._checked = false; if(it.id !== user.id) it._selected=false;});// сбросить крыжики
      user._checked = true;
    }
    else {
      angular.forEach(['role', 'roles', 'user', 'users', 'route', 'routes'], function(n){$c.param[n] = null;});
    }
    
    if (arguments.length == 2) $c.Scroll2User(user);
    
  };
  
  $c.Scroll2User = function(user){
    if(user && !user.id) return;
    $timeout(function() {
      var container = $('ul.users', $($element[0]));
      var el = user ? $('#user-'+user.id, container) : $('li.edit', container);
      container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
      
    });
    
  };
  
  $c.OrderByUserGroup = function(g){///группы 
    return g['parents/name'].join('')+g.name;
    
  }
  
  $c.DeleteLogin = function(user) {
    var edit = user._edit;
    edit.login = '';
    edit.pass = '';
    if(edit['login/id']) $c.Save(user);
  };
  
  $c.Valid  = function(edit) {
    //~ var edit = user._edit;
    if (edit.login && edit.login.length && (edit.login.length < 3 || !edit.pass || edit.pass.length < 4)) return false;
    return edit.names[0] && edit.names[0].length;// && (edit.login && edit.login.length > 2 && edit.pass.length >3);
    
  };
  
  $c.Save = function(user, b_close){// b_close - флажок закрытия редактирования
    
    if(!$c.Valid(user._edit)) return;
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    $c.cancelerHttp = !0;
    delete $c.error;
    
    $http.post(appRoutes.url_for(($c.param.URLs && $c.param.URLs.saveProfile) || 'доступ/сохранить пользователя'), user._edit)//, {timeout: $c.cancelerHttp.promise}
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        $c.cancelerHttp = undefined;
        delete $c.cancelerHttp;
        if(resp.data.error) {
          //~ $c.error = resp.data.error;
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border animated slideInUp fast000');
        }
        else if(resp.data.success) {
          Materialize.toast('Успешно сохранено', 3000, 'fw500 green-text text-darken-3 green lighten-4 border animated zoomInUp slow');
          angular.forEach(resp.data.success, function(val, key){
            user[key] = val;
          });
          //~ $c.searchComplete.length = 0;
          if (!user._edit.id) {//новый польз
            /*$c.LoadData().then(function(){
              //~ $c.Scroll2User(user);
              //~ user._selected = true;
              $c.ToggleSelect(user, true);
            });//refresh$c.ToggleSelect(user)
            */
            //~ $c.data.unshift(user);
            $c.searchComplete.unshift({value: user.names.join(' ')+'  ('+user.login+')', data:user});
            $c.ToggleSelect(user, true);
            
          }
          if (b_close) $c.CloseEdit(user);
          
          $c.SelectTab(user.disable ? 1 : 0);
          $timeout(function(){  $c.Scroll2User(user); });
        }
        
      });
    
    
  };
  
  $c.Disable = function(user){
    user._edit.disable = !user._edit.disable;
    $c.Save(user, true);
    
  };
  
  $c.CloseEdit = function(user, idx){
    if(!user.id) $c.data.splice(idx || 0, 1);
    $scope._editUser = user._edit = undefined;
    delete $c.error;
    
  };
  
  $c.ShowPass = function(user){
    user._edit._showPass = !user._edit._showPass;
  };
  
  $c.SelectTab = function(index) {
    $c.tab = index;
    $c.upload = $c.download = undefined;
    
  };
  
  const re2Num = /\D/g;
  const FilterTel = function(tel){ return this.test(tel.replace(re2Num, '')); };
  $c.FilterData = function (item) {//ng-repeat
    //~ console.log("FilterTab", this);
    var tab = $c.tab;
    if (this !== undefined) tab = this;// это подсчет
    if (tab  === undefined ) return false;
    var checked = $c.filterChecked ? item._checked : !0;
    //~ else if ($c.filterChecked) return item._checked; //
    var re = new RegExp($c.filterProfile,"i");
    var filterProfile = $c.filterProfile ? (re.test(item.names.join(' ')) || item.tel.some(FilterTel, re)) : !0;
      
      //~ return function(row, idx){
        //~ var profile = $c.RowProfile(row);
      //~ };
      
    //~ }
    
    return checked && filterProfile && !item.disable === !tab;
  };
  $c._FilterChecked = function(item){return item._checked;};
  $c.FilterCheckedCount = function(){
    if($c.filterChecked) return $c.data.filter($c._FilterChecked).length;
    else return "";
  };
  
  
  $c.ShowTab = function(idx){
    idx = idx || 0;
    $('.tabs li:eq('+idx+') a', $($element[0])).click();
    $c.tab = idx;
  };
  
  
  //~ $c.SearchFocus = function(event){
    //~ if(!$c.searchtField) $c.searchtField = $(event.target);
    //~ $c.InitSearch();
  //~ };
  $c.InitSearch = function(event){// ng-init input searchtField
    //~ $timeout(function(){
    
    if(event && !$c.searchtField) $c.searchtField = $(event.target);
    else if(!$c.searchtField) $c.searchtField = $('input[name="search"]', $($element[0]));
    
    
    if ($c.searchComplete.length === 0) {
      angular.forEach($c.data, function(val) {
        $c.searchComplete.push({value: val.names.join(' ')+ (val.hasOwnProperty('login') ? '  ('+val.login+')' : ''), data:val});
      });
    }
    
    //~ if(true) return;
    //~ var ac = $c.searchtField.autocomplete();
    //~ console.log("complete test", ac);
    //~ if($('.autocomplete-content', $($element[0])).get(0)) 
    //~ if(ac) return console.log("complete found", ac.clear().setOptions({"lookup": $c.searchComplete}) || ac);
    
    
    //~ $c.searchtField.autocomplete('dispose');
    ///отключил, фильрация через ng-model="$c.filterProfile"
    if (0) $c.searchtField.autocomplete({
      lookup: $c.searchComplete,
      //~ preserveInput: false,
      appendTo: $c.searchtField.parent(),
      //~ containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {//arguments[3] объект Комплит
        return arguments[3].options.formatResultsSingle(suggestion, currentValue);
      },
      //~ showNoSuggestionNotice: true,
      //~ noSuggestionNotice: $c.searchNewUser,
      //~ lastChild: function(value, that){return $c.searchNewUser;},
      //~ triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ $c.tab = !!suggestion.data.disable;
        $c.searchtField.val('');
        $c.showBtnNewUser = false;
        $timeout(function(){
          //~ $c.filterChecked = true;
          $c.ShowTab(suggestion.data.disable ? 1 : 0);
          $c.ToggleSelect(suggestion.data, true);
        });
        
      },
      onSearchComplete: function(query, suggestions){$timeout(function(){$c.showBtnNewUser = true;});},
      onHide: function (container) {if(!$c.searchtField.val().length) $timeout(function(){$c.showBtnNewUser = false;});}
      
    });
  };
  
  $c.ReqRoles = function(user){
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    
    if(user.id) $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profileRoles) || 'доступ/роли пользователя', user.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.roles = resp.data;
        
      });
  };
  
  $c.ReqRoutes = function(user){
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    
    if (!($c.param.URLs && $c.param.URLs.profileRoutes === null)) $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profileRoutes) || 'доступ/маршруты пользователя', user.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        //~ $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.routes = resp.data;
        
      });
    else $timeout(function(){ $c.param.routes = null; });
  };
  
  $c.CheckUserS = function(data){
    
    angular.forEach($c.data, function(item){
      item._checked = false;
      item._selected = false;
      if (!data) return;
      angular.forEach(data, function(user_id){
        if (item.id === user_id) item._checked = true;
      });
      
    });
    
    $c.filterChecked = true;// сразу отфильтровать список
    
    //~ if ($c.param.route)  $c.filterChecked = true;// сразу отфильтровать список
    //~ else $c.filterChecked = false;
    
  };
  
  $c.FilterChecked = function(bool){//меню
    if (bool === undefined) bool = !$c.filterChecked;
    $c.filterChecked = bool;
    
  };
  
  $c.InitForm = function(edit){
    if (!edit.tel) edit.tel = [''];
    //~ if (edit.tel.length == 0) 
    edit.tel.push('');
    //~ if (edit.tel.length == 1) edit.tel.push('');
    
    if(!edit['@приемы-увольнения']) edit['@приемы-увольнения']=[{"дата приема": null, "дата увольнения": null, "причина увольнения": null,},];
    var prevPU = edit['@приемы-увольнения'][edit['@приемы-увольнения'].length-2];
    if(prevPU && !prevPU["дата увольнения"]) edit['@приемы-увольнения'].pop();
    
    return edit;
  };
  
  $c.InitPickerDate = function(name, profile, superName){/// row - строка приемов-увольнений name input field
    $timeout(function(){
      //~ for (var name in ['дата приема', 'дата увольнения']) 
      var input = $('input.datepicker[name="'+name+'"]', $($element[0]));///.each(function(){
      input.pickadate({// все настройки в файле русификации ru_RU.js
          //~ clear: 'очистить',//name == 'дата2' ? '<i class="material-icons red-text">remove_circle_outline</i>' : '',
          //~ closeOnClear: true,
          //~ selectYears: true,
          //~ formatSkipYear: true,// доп костыль - дописывать год при установке
          //~ onClose: function(context) { console.log("onClose: this, context, arguments", this, context, arguments); },
          onSet: function(context){
            var row;
            if (superName) row = profile[superName][this.component.$node.closest('tr').index()];
            else row = profile;
            var s = this.component.item.select;
            //~ console.log("onSet", row);
            $timeout(function(){
              if(s) row[name] = [s.year, s.month+1, s.date].join('-');
              else row[name] = null;
              
            });
            //~ $(this._hidden).val($c.data[name]);
          },
        });
      });
      
    //~ });
    
  };
  $c.ClearDate = function(row, name){///row - строка приемов-увольнений
    row[name] = 0;
    //~ if(!$c.clearDate) $c.clearDate = {};
    //~ $c.clearDate[name] = 0;
    $timeout(function(){
      row[name] = null;
      if (name == 'дата приема') $c.ClearDate(row, 'дата увольнения');
    });
    
  };
  
  $c.ChangeTel = function(edit, event){
    edit.tel.map(function(t, idx){
      if (!t && edit.tel.length > 2) edit.tel.splice(idx, 1);
    });
    if (!!edit.tel[edit.tel.length-1]) {
      edit.tel.push('');
      if (event) $timeout(function(){ $(event.target).focus(); });
    }
  };
  
  $c.SaveCheck = function(user){
    if($c.param.route) return;
    user._checked = !user._checked;
    if (!$c.param.role) return;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    
    $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [$c.param.role.id, user.id]), {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) $c.error = resp.data.error;
        else {
          console.log("Связь: ", resp.data);
           Materialize.toast('Успешно сохранена связь', 1000, 'green');
        }
        
      });
  };
  
  $c.ShowUpload = function(){
    if($c.upload !== undefined) $c.upload = undefined;
    else $c.upload = '';
    $c.download = $c.tab = undefined;
    
  };
  $c.Upload = function(){
    
    $c.error = undefined;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
   $http.post(appRoutes.url_for('админка/доступ/загрузить пользователей'), {"data": $c.upload}, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          console.log("Успешно загрузил список", resp.data.success);
          //~ $c.upload = angular.toJson(resp.data.success);
          $c.upload = undefined;
          $c.LoadData().then(function(){$c.ShowTab(0)});
        }
        
      });
    
  };
  $c.Download = function(){
    $c.upload = $c.tab = undefined;
    if($c.download !== undefined) return $c.download = undefined;
    
    $c.error = undefined;

    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    $http.get(appRoutes.url_for('админка/доступ/выгрузить пользователей'), {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (resp.data.success) {
          $c.download = resp.data.success;
          $timeout(function(){$('textarea', $element[0]).keydown();});
        }
        
      });
    
  };
  
  $c.Refresh = function(){
    //~ $c.ready = false;
    
    $c.LoadData().then(function(){
      //~ $c.ready = true;
      //~ $c.ShowTab(2);
      
    });
    
  };
  
  /**ФОТО***/
  $c.profileImg = function(profile){///ng-init
    profile._imgUrl = '/i/p/'+profile.id + '?' + Math.random();//new Date().getTime();
  };
  $c.profileImgError = function(img){///еще нет фото профиля
    //~ console.log("profileImgError", img, $scope._editUser);
    $scope._editUser._noFoto = true;
    this.onerror=null;
    $timeout(function(){
      $(img).hide();
      $scope._editUser._noFoto = true;
    });
  };
  $c.InitFileUpload = function(profile){///который открыли для ред
    profile._noFoto = undefined;
    var progress = $('.progress-file-upload .determinate');
    var upload = $('#fileupload');
    var errDiv = upload.parent().siblings('.error');
    upload.fileupload({
      "dataType": 'json',
      "url": appRoutes.urlFor('кадры/сотрудники/фото'),
      ////singleFileUploads: false,
      ////formData: function(){ return filenames; },
      "add": function (e, data) {
        //~ console.log("add ", data);
        //~ data.context = 
        data.submit();
        //~ data.files.map(function (file, idx) {    });
      },/// end add file
      "progressall": function (e, data) {
        var ex = parseInt(data.loaded / data.total * 100, 10);
        progress.css('width',  ex + '%');
      },
      "done": function (e, data) {///Upload finished
        //~ console.log("done", data);
        if(data.result.error) return errDiv.html(data.result.error);
        progress.css('width',  '0%');
        var id = profile.id;
        $timeout(function(){ profile.id = undefined; $timeout(function(){ profile.id = id; }); });///передернуть и обновит картинку
      },
      "fail": function (e, data) {
        //~ console.log("fail", upload.parent());
        errDiv.html("Ошибка сохранения файла");
      }
    }).bind('fileuploadsubmit', function (e, data) {
      data.formData = {};//files: JSON.stringify(data.files)
      //~ console.log("fileuploadsubmit", data);
      data.formData.profile_id=profile.id;
      errDiv.html("");
      //~ data.files.map(function(file, idx){
      //~ });
      //~ return true;
    });/// end fileupload
    
  };
  
};

/*=====================================================================*/

module

.component('usersList', {
  controllerAs: '$c',
  templateUrl: "access/users/list",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Controll
})

;

}());