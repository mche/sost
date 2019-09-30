(function () {'use strict';
/*
*/
var moduleName = "Отчет::Управляющая компания";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache',  'ReportTable', 'Отчет::Управляющая компания/Форма',]);//'ngSanitize',

module.controller('Controll',  function(/*$scope, $attrs, $element,*/ $timeout, /*$q,*/  TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    ctrl.param = {};

    //~ if($attrs.projectId) ctrl.param["проект"] ={"id": parseInt($attrs.projectId)};
    ctrl.param["дата"] = {"values":[dateFns.startOfMonth(new Date()), dateFns.endOfMonth(new Date())], "margin":"0"};
    //~ ctrl.param['интервал'] = '';
    ctrl.param['интервал'] = 'YYYYmm/TMMon YY';
    ctrl.param.ready = false;
    //~ ctrl.param['кошелек'] = {"без сохранения": true, "проект": {"id":0, "ready":true}};
    //~ ctrl.param['кошелек2'] = {"без сохранения": true,};
    //~ ctrl.param['контрагент'] = {"без сохранения": true};
    //~ ctrl.param['профиль'] = {};
    //~ ctrl.param['объект'] = {"проект": {"id":0, "ready":true}};
    //~ ctrl.param['все проекты'] = true;
    
    
    TemplateCache.split(appRoutes.url_for('assets', 'деньги/отчет/ук.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
      });
  };
  
  ctrl.Refresh = function(){
    ctrl.param.ready = false;
    $timeout(function(){
      ctrl.param.ready = true;
    });
    
  };
  
});

})();