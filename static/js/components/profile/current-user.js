(function () {'use strict';
/*
 
*/
var moduleName = "CurrentUser";
var module = angular.module(moduleName, []); //

/***********************************************************/
var Data = function(){
  var factory = {};
  factory.UID = function(){
    return  $('head meta[name="app:uid"]').attr('content');
  };
  return factory;
};
/*==========================================================*/
module

.factory(moduleName+"Data", Data)

;

}());