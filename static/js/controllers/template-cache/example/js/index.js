angular.module('myApp', ['load.templateCache'])
.controller('MyCtrl', function($scope, loadTemplateCache) {
    loadTemplateCache.split(["/templates.html"]);
})
;
