(function () {
'use strict';

var moduleName = "TransportList";
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'User', 'load.templateCache', 'TransportStatus']);

//~ var templateCache = ["/assets/transport/list.html"];// AssetPack::CombineFile!

var tabs= [
  {title: "Рабочие", icon:"icon-ok-2"},//check_box
  {title: "Скрытые", icon:"icon-eye-off"}//visibility_off
  //~ {title: "В принятых заявках", icon:"thumbs_up"},
  //~ {title: "Завершенные"}
];

var Controll = function  ($scope, $attrs, loadTemplateCache, appRoutes) {
  var ctrl = this;
  
  $scope.listParam = {"header": true, "tabIdx": $attrs.tabIdx || 1};
  
  loadTemplateCache.split(appRoutes.url_for('assets', 'transport/list.html'), 1)
  .then(function(proms){
    ctrl.ready = true;
  });
  
};

String.prototype.RE = function() {
    return this.replace(/([\$\^\*\(\)\+\[\]\{\}\|\.\/\?\\])/g, '\\$1');
};

var Component = function ($scope, $http, $q, $timeout, $window, appRoutes, User) {
  var $ctrl = this;
  $scope.tabs = tabs;
  
  $ctrl.Init = function(){
  
    $http.get(appRoutes.url_for('список транспорта')).then(function (resp) {//$attrs.listUrl
      $ctrl.data = resp.data;
    //~ if (ctrl.data.length == 0) $window.location.href = appRoutes.url_for('форма нового транспорта');
    //~ if (ctrl.data.length == 1) $window.location.href = appRoutes.url_for('форма транспорта', [ctrl.data[0].id]);
      try {$ctrl.initTabs();}
      catch (err) { console.log(err.trace); }
      //~ console.log("initTabs done");
      $ctrl.param = $ctrl.param || {};
      $ctrl.ready = true;
    });
    
  };
  
  var tabsCnt = function (tab, idx) {// this - data item
    if (this._tabs === undefined) this._tabs = '';
    if (tab.cnt === undefined) tab.cnt = 0;
    if (tab.idx === undefined) tab.idx = idx+1;
    
    var title = 'Рабочие';
    if (this.disabled) title = 'Скрытые';
    this._tabs += title;
    if (tab.title == title) tab.cnt++;
    return false;
  };
  $ctrl.initTabs = function() {
    $ctrl.ClearTabsCount(); // для мобил!
    angular.forEach($ctrl.data, function(item, idx) {
      tabs.filter(tabsCnt, item);// просто второй цикл
    });
    
    // перекинуть на вкладку, если нет позиций
    var tab = tabs[$ctrl.param.tabIdx-1]  ||  tabs[0];
    if ( tab && tab.cnt ) $ctrl.tab = tab;
    else $ctrl.tab = tabs.filter(function (t) {return t.cnt && t.cnt > 0;}).shift();
    if ( !$ctrl.tab ) return;
    
    $timeout(function() {
      $('main ul.tabs').tabs();
      $ctrl.tabsReady = true;
      $ctrl.selectTransport();
    });
    
  };
  
  $ctrl.ClearTabsCount = function () {
    angular.forEach(tabs, function(item, idx) {
      delete item.cnt;
    });
    
    angular.forEach($ctrl.data, function(item, idx) {
      delete item._tabs;
      delete item._idx;
    });
    
  };
  
  $ctrl.Filter = function (item) {// ng-repeat
    //~ var tab = tabs[$ctrl.tab -1];
    //~ if (!tab.re) tab.re = new RegExp(tab.title,"i");
    //~ return tab.re.test(item._tabs);//, tab.title
    
    var tab = $ctrl.tab;//tabs[$ctrl.tab - 1];
    if (!tab || !item._tabs) return false;
    if (!tab.re) tab.re = new RegExp(tab.title,"i");
    return tab.re.test(item._tabs);//, tab.title
  };
  
  $ctrl.FilterTab = function(tab, idx) {//ng-repeat
    return !!tab.cnt;
  };
  
  $ctrl.showTab = function (tab, check) {
    if (check) return tab === $ctrl.tab;
    $ctrl.tab = tab;
  };
  
  $ctrl.selectTransport = function () {
    $ctrl.selectedTransport = $window.location.href.match(/transport(\d+)$/);
    if($ctrl.selectedTransport) {
      $ctrl.selectedTransport = $ctrl.selectedTransport.pop();
      $timeout(function() {$('#transport'+$ctrl.selectedTransport + ' a').first().focus();}, 1);
    }
  };
  
  $ctrl.OpenTransport = function(it) {
    if($ctrl.onOpenTransportCallback) return $ctrl.onOpenTransportCallback(it);
    $window.location.href = appRoutes.url_for('форма транспорта', it.id);
  };
  
  var img_category_right = function(prev, curr){//для it['категории'].reduceRight найти первую картинку справа списка категорий
    if(prev) return prev;
    return curr.img;
  };
  $ctrl.ImgSrc = function(it){
    if(it.img && it.img.length) return appRoutes.url_for('картинка транспорта', [User.id(), it.img[0]]);
    var img_category = it['категории'].reduceRight(img_category_right, null);
    if (img_category) return appRoutes.url_for('картинка категории', [img_category]);
    return appRoutes.url_for('картинка категории', ['default.png']);
  };
  
};

module

.controller('Controll'+moduleName, Controll)

.component('transportList', {
  templateUrl: "transport/list",
  bindings: {
    data: '<',
    param: '<',// {header: true , tabIdx: индекс какую вкладку открыть
    onOpenTransportCallback: '<'

  },
  controller: Component
})

;

}());
