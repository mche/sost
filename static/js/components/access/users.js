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
var module = angular.module(moduleName, [ 'Uploader::Файлы','Util']);//'ngSanitize',appRoutes

const Controll = function($scope, $http, $q, $timeout, $element, appRoutes, Util, $Список, $КомпонентФайлы){
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
          //~ $c.searchtField = $('input[name="search"]', $($element[0]))
          var list = $('ul.users', $($element[0]));
          if(!list.length) return;
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
    $c.loader = $c.loader || new $Список(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profiles) || 'доступ/список пользователей'));
    return $c.loader.Load()
    //~ return $http.get(appRoutes.url_for)
      .then(function(){
        $c.data = $c.loader.Data();
        $c.$data = $c.loader.$Data();
        $c.searchComplete.length = 0;
        $c.LoadRoles();///  всех польз
        $c.LoadDop();
      });
    
  };
  
  $c.LoadRoles = function(userID){///хэш профиль.id => [массив ролей/id]
    return $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profileRoles) || 'доступ/роли пользователя', userID || 0))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        if (userID) $c.$roles[userID]=resp.data;
        else $c.$roles = resp.data;
        
      });
  }
  
  const MapDop = function(dop){
    var p = $c.$data[dop.id];
    p['@доп'] = dop['@доп/id'].map(function(pid){ var d = $c.$data[pid]; d['профиль1/id'] = dop.id; return d; });
    return p;
  };
  $c.LoadDop = function(){
    if (!$c.param.URLs || !$c.param.URLs['доп. сотрудники']) return;
    return $http.get(appRoutes.url_for($c.param.URLs['доп. сотрудники']))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c['доп. сотрудники'] = resp.data.map(MapDop);
        
        
      });
  };
  
  $c.New = function(flag){
    //~ if(flag) return $c.data[0] && $c.data[0].id;
    if(flag) return $c.showBtnNewUser;
    //~ if(names === undefined) names = [];
    $c.showBtnNewUser = false;
    $c.filterChecked = false;
    var n = {
      "names":[$c.filterProfile],
      "login":'',
      "pass":'',
    };///$c.searchtField.val()
    //if ($c.data[0] && $c.data[0].hasOwnProperty('login')) {n.login=''; n.pass='';}
    $c.data.unshift(n);
    $timeout(function(){
      $c.Edit(n);
      $c.ShowTab(0);
      $timeout(function() {
        var container = $('ul.users', $($element[0]));
        var el = $('.card.edit', container);
        container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
        n.login='';
        n.pass='';
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
  
  const MapParamValue = function(name){$c.param[name] = this.val;};
  const paramNames = ['role', 'roles', 'user', 'users', 'route', 'routes'];
  $c.ToggleSelect = function(user, select){// bool
    if (select === undefined) select = !user._selected;
    user._selected = select;
    if ($scope._editUser) $scope._editUser._selected = select;
    
    if (user._selected) {
      //~ $c.FilterChecked(false);
      paramNames.map(MapParamValue, {"val": undefined});
      $c.param.user = user;
      $c.ReqRoles(user);
      $c.ReqRoutes(user);
      $c.data.map(function(it){it._checked = false; if(it.id !== user.id) it._selected=false;});// сбросить крыжики
      user._checked = true;
    }  else {
      paramNames.map(MapParamValue, {"val": null});
    }
    
    if (arguments.length == 2) $c.Scroll2User(user);
    
  };
  
  $c.Scroll2User = function(user){
    if(user && !user.id) return;
    $timeout(function() {
      var container = $('ul.users', $($element[0]));
      var el = user ? $('#user-'+user.id, container) : $('li.edit', container);
      if (el.length) container.animate({scrollTop: el.offset().top - container.offset().top + container.scrollTop()}, 1500);
      
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
          $timeout(function(){  $c.Scroll2User(user); user._selected = false; delete user._edit; });
          $c.LoadRoles();///обновить роли user.id - не пошло
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
    $c.upload = $c.download = $c.bdUsers = $c.dop = $c.sql = undefined;
    
  };
  
  $c.ProfileRE = function(){
    $c.filterProfileRE = new RegExp($c.filterProfile, 'i');
  };
  const re2Num = /\D/g;
  const FilterTel = function(tel){ return this.re.test(tel.replace(re2Num, '')); };
  $c.FilterData = function (item) {//ng-repeat
    var tab = $c.tab;
    if (this !== undefined) tab = this;// это подсчет
    if (tab  === undefined ) return false;
    var checked = $c.filterChecked ? item._checked : !0;
    //~ else if ($c.filterChecked) return item._checked; //
    var re = $c.filterProfileRE;// ? new RegExp($c.filterProfile,"i") : undefined;
    var filterProfile = re ? (re.test(item.names.join(' ')) || item.tel.some(FilterTel, {"re": re})) : !0;
    
    let last_disable = item['@приемы-увольнения'] && item['@приемы-увольнения'][item['@приемы-увольнения'].length -2];
    return checked && filterProfile && !/*item.disable*/(last_disable && last_disable['дата увольнения'])  === !tab;
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
  /***$c.InitSearch = function(event){// ng-init input searchtField
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
  };***/
  
  $c.ReqRoles = function(user){
    if(!user.id) return;
    if ($c.$roles && $c.$roles[user.id]) return $timeout(function(){
      $c.param.roles = $c.$roles[user.id]['@роли/id'];
      //~ console.log("roles", $c.$roles[user.id]);
    });
    return $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profileRoles) || 'доступ/роли пользователя', user.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        if(resp.data && resp.data.error) {
          $c.error = resp.data.error;
          return;
        }
        $c.param.roles = resp.data;
        
      });
  };
  
  $c.ReqRoutes = function(user){
    if (user && user.id && !($c.param.URLs && $c.param.URLs.profileRoutes === null)) $http.get(appRoutes.url_for(($c.param.URLs && $c.param.URLs.profileRoutes) || 'доступ/маршруты пользователя', user.id))//, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
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
    
    if (edit.id) $timeout(function(){
        edit._uploads = [];
        new Vue(new $КомпонентФайлы({
          "el": $('#edit-'+edit.id+' v-uploads', $($element[0]))[0],
          "props": {"parent": {"default": function(){ return {"id": edit.id, "_uploads": edit._uploads}; }}},/// такая передача пропса из ангуляра в вуй
          
        }));
      });
    
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
  $c.ClearDate = function(row, name, arr){///row - строка приемов-увольнений
    row[name] = 0;
    //~ if(!$c.clearDate) $c.clearDate = {};
    //~ $c.clearDate[name] = 0;
    $timeout(function(){
      row[name] = null;
      if (name == 'дата приема') $c.ClearDate(row, 'дата увольнения');
      if (name == 'дата увольнения' && arr) arr.pop();
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
    
    return $c.SaveRef($c.param.role.id, user.id);
  };
  
  $c.SaveRef = function(id1, id2){
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    
    return $http.get(appRoutes.url_for('админка/доступ/сохранить связь', [id1, id2]), {timeout: $c.cancelerHttp.promise})
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
    $c.download = $c.tab = $c.bdUsers = $c.dop = $c.sql = undefined;
    
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
    $c.upload = $c.tab = $c.bdUsers = $c.dop = $c.sql = undefined;
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
  
  const IsRole = function(id){
    return id == this.id;
  };
  const FilterBDays = function(user){
    //~ console.log("FilterBDays", user, this.month);
    var d, n, g;
    return !user.disable && user['дата рождения']
      && (d = new Date(user['дата рождения']))
      && (d.getMonth() == this.month)
      /*крыж иностранцы*/
      && (g = $c.$roles[user.id] && $c.$roles[user.id] && $c.$roles[user.id]['@роли/id'])
      && ($c.nonRussians ? g.some(IsRole, {"id": 57516}) : !g.some(IsRole, {"id": 57516}))
      /*конец фильтров*/
      && (user['дата рождения/формат'] = dateFns.format(d, 'D MMMM', {locale: dateFns.locale_ru}))
      /* хэш по дням месяца */
      && (n = d.getDate())
      && (this.bdays[n] ? this.bdays[n].push(user) : (this.bdays[n] = [user]));
  };
  
  $c.BDays = function(){///дни рожднения в месяце
    $c.tab = $c.upload = $c.download = $c.dop = $c.sql = undefined;
    if (!$c.month) $c.month =  Util.dateISO(0);//dateFns.format(new Date(), 'YYYY-MM-DD');
    $c.bdays = {};
    $c.bdUsers = $c.data.filter(FilterBDays, {"month": (new Date($c.month)).getMonth(), "bdays": $c.bdays});
    //~ console.log("BDay", $c.bdays);
    
    if ($c.param.user) $c.ToggleSelect($c.param.user, false);
    
    $timeout(function(){
      $('.picker-month > .datepicker', $($element[0])).pickadate({// все настройки в файле русификации ru_RU.js
        //~ clear: '',
        onClose: function(context){
          var s = this.component.item.select;
          $c.month = [s.year, s.month+1, s.date].join('-');
          $c.bdUsers.splice(0, $c.bdUsers.length);
          $c.bdays = {};
          $timeout(function(){
            Array.prototype.push.apply($c.bdUsers, $c.data.filter(FilterBDays, {"month": (new Date($c.month)).getMonth(), "bdays": $c.bdays}));
          });
        },
        //~ onSet: $c.SetDate,
        monthsFull: [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ],
        format: 'mmmm',
        monthOnly: 'OK',// кнопка
        //~ selectYears: false,
        //~ formatSubmit: 'yyyy-mm',
      });//{closeOnSelect: true,}
    });
  };
  
  $c.TakeUser = function(user){
    $c.userDop = user;
    $c.userDop['группы'] = new Array(...user._edit['группы'] || []);
    //~ $timeout(()=>{ console.log("TakeUser", user); }, 100);
    
  };
  
  $c.Dop = function(){/// двойники
    $c.tab = $c.upload = $c.download = $c.bdUsers = $c.sql = undefined;
    $c.dop  =$c['доп. сотрудники'];
    
  };
  
  $c.FilterDop = function(dop){
    if (!$c.filterProfileRE) return true;
    var re = $c.filterProfileRE;
    var filter = re.test(dop.names.join(' '));
    if (dop['@доп']) return filter || dop['@доп'].some($c.FilterDop);
    else return filter;
  };
  $c.SaveDop = function(user){
    if (!$c.userDop || !$c.userDop.id) return;
    return $c.SaveRef(user.id, $c.userDop.id).then(function(){
      if(!user['@доп']) user['@доп'] = [];
      user['@доп'].push($c.$data[$c.userDop.id]);
      $c.userDop['профиль1/id'] = user.id;
      $c.userDop = undefined;
      if ($c.dop) $c.dop.push(user);
      $c['доп. сотрудники'].push(user);
    });
    
  };
  
  $c.DopGroups = function(user, remove){/// группы от доп 
    if (remove) return user._edit['группы2'].splice(user._edit['группы2'].indexOf(remove), 1);
    user._edit['группы2'] = new Array(...$c.userDop['группы'] || []);
    
  };
  
  $c.SQL = function(sql){
    
    if (sql) {
      $c.sql.cancelerHttp  = 1;
      $c.sql.error = undefined;
      $c.sql.success = undefined;
      return $http.post(appRoutes.url_for($c.param.URLs['SQL']), {"sql": sql})
      .then(function(resp){
        delete $c.sql.cancelerHttp;
        if(resp.data && resp.data.error) {
          $c.sql.error = resp.data.error;
        }
        if (resp.data.success) {
          $c.sql.success = resp.data.success;
        }
      });
    }
    if($c.sql !== undefined) $c.sql = undefined;
    else $c.sql = {"text": ''};
    $c.upload = $c.download = $c.bdUsers = $c.dop = $c.tab = undefined;
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