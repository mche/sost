(function () {'use strict';
/***

***/

var moduleName = "Номенклатура::Справочник";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Номенклатура', 'TreeList']);//'ngSanitize',, 'dndLists'

var Controll = function($scope, $timeout, $q, $http, $element, TemplateCache, appRoutes, $Номенклатура){
  var ctrl = this;
  ctrl.selectItem1EventName = moduleName+'/event:SelectItem1';
  ctrl.selectItem2EventName = moduleName+'/event:SelectItem2';
  
  $scope.$on(ctrl.selectItem1EventName, function (event, item){
    ctrl.selectedItem1 = item;
  });
  $scope.$on(ctrl.selectItem2EventName, function (event, item){
    ctrl.selectedItem2 = item;
  });
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    var async = TemplateCache.split(appRoutes.url_for('assets', 'номенклатура/справочник.html'));
    async.push($Номенклатура.Load(0));
    $q.all(async).then(function(){
      ctrl.data1 = $Номенклатура.Data();
      ctrl.$data1 = $Номенклатура.$Data();
      ctrl.data2 = angular.copy($Номенклатура.Data());
      ctrl.$data2 = $Номенклатура.$Data(ctrl.data2);
      ctrl.item1 = {selectedItem:{id:0}};
      ctrl.item2 = {selectedItem:{id:0}};
      ctrl.ready= true;
      
      $timeout(function() {
        [1,2].map(function(i){
          var list = $('div.tree'+i, $($element[0]));
          var top = list.offset().top+40;
          list.css("height", 'calc(100vh - '+top+'px)');
          
        });
        
        
      });
      
    });
    
  };
  
  //~ ctrl.IsMoveDisabled = function(){
    //~ return !(ctrl.selectedItem && ctrl.selectedItem2 && ctrl.selectedItem1.id && ctrl.selectedItem2.id && ctrl.selectedItem1.parent != ctrl.selectedItem2.id);
  //~ };
  
  ctrl.Save = function(){
    ctrl.cancelerHttp = !0;
    return $http.post(appRoutes.url_for('номенклатура/переместить позицию'), {"id1":ctrl.selectedItem1.id, "id2":ctrl.selectedItem2.id})
      .then(function(resp){
        ctrl.cancelerHttp = undefined;
        if (resp.data.error) 
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border animated zoomInUp fast');
        else if (resp.data.success) {
          Materialize.toast('Успешно сохранено', 3000, 'fw500 green-text text-darken-3 green lighten-4 border animated zoomInUp slow');
          ctrl.Move();
        }
      });
    
  };
  
  ctrl.Move = function(){
    //~ console.log("Move item1", ctrl.selectedItem1,  ctrl.$data1[ctrl.selectedItem1.id]);
    //~ ctrl.selectedItem1.title = ctrl.selectedItem1.title+' 0';
    ctrl.selectedItem1.parent = ctrl.selectedItem2.id;
    ctrl.selectedItem1.parents_id = angular.copy(ctrl.selectedItem2.parents_id);
    ctrl.selectedItem1.parents_id[0] === null ? ctrl.selectedItem1.parents_id.splice(0,1, ctrl.selectedItem2.id) : ctrl.selectedItem1.parents_id.push(ctrl.selectedItem2.id);
    ctrl.selectedItem1.parents_title = angular.copy(ctrl.selectedItem2.parents_title);
    ctrl.selectedItem1.parents_title[0] === null ? ctrl.selectedItem1.parents_title.splice(0,1, ctrl.selectedItem2.title) : ctrl.selectedItem1.parents_title.push(ctrl.selectedItem2.titl);
    ctrl.selectedItem1.parents_id.map(function(id){ ctrl.$data1[id]._expand = true; });
    ctrl.selectedItem1._expand = true;
    
    Object.keys(ctrl.selectedItem1).map(function(key){ ctrl.$data2[ctrl.selectedItem1.id][key] = ctrl.selectedItem1[key]; });
    //~ console.log("Move item2", ctrl.selectedItem2,  ctrl.$data1[ctrl.selectedItem2.id]);
    
  };
  
  ctrl.Edit = function(item){
    if (item._edit) item._edit = undefined;
    $timeout(function(){
      item._edit = {title: item.title};
    });
    
  };
  
  ctrl.SaveTitle = function(item){
    if (!item._edit || !item._edit.title) return;
    ctrl.cancelerHttp = !0;
    return $http.post(appRoutes.url_for('номенклатура/изменить название'), {"id": item.id, "title": item._edit.title})///, "parent": item.parent
      .then(function(resp){
        ctrl.cancelerHttp = undefined;
        if (resp.data.error) 
          Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 border animated zoomInUp fast');
        else if (resp.data.success) {
          Materialize.toast('Успешно сохранено', 3000, 'fw500 green-text text-darken-3 green lighten-4 border animated zoomInUp slow');
          item.title = item._edit.title;
          item._edit = undefined;
          ctrl.data1.map(function(it){ var idx = it.parents_id.indexOf(item.id); if (idx != -1) it.parents_title[idx]=item.title; else if (it.id == item.id) it.title=item.title; });
          ctrl.data2.map(function(it){ var idx = it.parents_id.indexOf(item.id); if (idx != -1) it.parents_title[idx]=item.title; else if (it.id == item.id) it.title=item.title; });
        }
      });
    
  };
  
};
/*=============================================================*/


module
  .controller('Controll', Controll)

;

;

}());