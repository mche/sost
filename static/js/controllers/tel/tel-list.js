(function () {
'use strict';

var Controll = function ($scope, $element, $filter) {
  var self = this;
  
};

angular.module('tel.list', ['phone.input'])
.component('telList', {
  //~ templateUrl: "/controllers/transport/img-list.html",
  templateUrl: "tel.list",
  bindings: {
      data: '=' // массив картинок

  },
  controller: Controll
})
;

}());