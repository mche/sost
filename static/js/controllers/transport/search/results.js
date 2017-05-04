(function () {
'use strict';
/*
*/
  
var moduleName = 'TransportSearchResults';


try {
  if (angular.module(moduleName)) return;
} catch(err) { /* failed to require */ }


var Controll = function ($scope, $timeout, appRoutes) {
  var $ctrl = this;
  //~ $ctrl.$attrs = $attrs;
  
  $ctrl.Init = function() {
    $ctrl.ready = true;
  };
  
  $ctrl.ItemTitle = function(tr){
     return tr['категории'].reduce(function(r,x){ return r+' > '+x.title;},'Транспорт');
  };
  
  var img_category_right = function(prev, curr){//для it['категории'].reduceRight найти первую картинку справа списка категорий
    if(prev) return prev;
    return curr.img;
  };
  $ctrl.ItemImgUrl = function(item){
    //~ if (!item.img || item.img.length === 0) return appRoutes.url_for('картинка категории', ['default.png']);
    //~ return appRoutes.url_for('картинка транспорта', [item.uid, item.img[0]]);
    //~ tr.img_url
    
    if(item.img && item.img.length) return appRoutes.url_for('картинка транспорта', [item.uid, item.img[0]]);
    var img_category = item['категории'].reduceRight(img_category_right, null);
    if (img_category) return appRoutes.url_for('картинка категории', [img_category]);
    return appRoutes.url_for('картинка категории', ['default.png']);
    
  };
  
  $ctrl.ShowItem = function (item){
    $ctrl.onShowItemCallback(item);
  };
  
  $ctrl.ClearResults = function() {
    var cb = $ctrl.onClearResultsCallback;
     //~ console.log('ClearResults '+typeof(cb));
    if (cb) cb();
    $ctrl.data.length = 0;
  };
  
};


angular.module(moduleName, ['appRoutes'])//

.component("transportSearchResults", {
  templateUrl: "transport/search/results",
  bindings: {
    data: '<',
    onShowItemCallback: '<',
    onClearResultsCallback: '<'

  },
  controller: Controll
})
;


}());