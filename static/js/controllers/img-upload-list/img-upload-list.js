(function () {
'use strict';

var moduleName = 'img.upload.list';

var Controll = function ($scope, $element, Upload, $timeout, $http) {//, appRoutes, User
  var $ctrl = this;
  
  $ctrl.Init = function () {
    console.log(moduleName, $ctrl.sendParam);
    $ctrl.ready = true;
    
  };
  
  $scope.$on('click-select-image', function(event, arg) {
    //~ console.log($element);
    $timeout(function () {
      angular.element($($element[0]).find('li:last-child a[ngf-select]').get(0)).triggerHandler('click');
    });
  });
  
  $ctrl.uploadImg = function (img) {
    var file = img.uploadFile;
    var idx = $ctrl.data.indexOf(img);
    var data = {"img": file, "idx": idx, "param": $ctrl.sendParam};
    if (img.name) data.remove_img = img.name;
    
    file.upload = Upload.upload({
      "url": $ctrl.imgUploadUrl, //$attrs.uploadUrl, //'https://angular-file-upload-cors-srv.appspot.com/upload',
      "data": data,
    });

    file.upload.then(function (resp) {
      $timeout(function () {
        for (var key in resp.data) img[key] = resp.data[key];
        img.uploadFile = null;
        //~ console.log($ctrl.img);
      });
    }, function (resp) {
      if (resp.status > 0)
        file.errorMsg = resp.status + ': ' + angular.toJson(resp.data);
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    
  };
  
  $ctrl.deleteImg = function (img) {
    //~ console.log(img.name);
    var idx = $ctrl.data.indexOf(img);
    if (img.name)
      $http.post($ctrl.imgUploadUrl, {"remove_img": img.name, "idx":idx, "param": $ctrl.sendParam}).then(function (resp) {//$attrs.uploadUrl
        console.log(resp.data);
        if (idx >= 0) $ctrl.data.splice(idx, 1);
      });//
    if (img.uploadFile)  $ctrl.data.splice(idx, 1);
  };
  
  $ctrl.ImgUrl = function (img) {
    if (!img.name) return;
    if($ctrl.imgUrlCallback) return $ctrl.imgUrlCallback(img.name);
    return img.name;
    //~ return appRoutes.url_for('картинка транспорта', [User.id() || 0, img.name]);
  };
  
};


angular.module(moduleName, ['ngFileUpload', ])//'appRoutes', 'User'
.component('imgUploadList', {
  //~ templateUrl: "/controllers/transport/img-list.html",
  templateUrl: "img.upload.list",
  bindings: {
    data: '<', // массив картинок
    //~ id: '<', // ид объекта,
    imgUploadUrl: '<',
    sendParam: '<', //{id:  ид объекта,  что угодно
    imgUrlCallback: '<' // получение урла по имени картинки

  },
  controller: Controll
})
;

}());