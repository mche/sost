(function () {
  'use strict';

angular.module('categoryTree', ['appRoutes', 'ui.tree', 'ngFileUpload'])//'ngSanitize'

.controller('CategoryTreeControll', function  ($scope, $attrs, $http, Upload, $timeout, $window, $sce, appRoutes) {
  var $ctrl = this;

  
  $scope.data = [{"id": 0, "title": "Структура категорий транспорта", "childs": null}];//{'title': "Дерево", "_enable_drag": false, 'childs': []}];
  $http.get(appRoutes.url_for('категории транспорта'), {"cache": true}).then(function (resp) {$scope.data[0].childs = resp.data;});
  
  $scope.debug = {};
  
  $scope.ImgUrl = function(node){
    return appRoutes.url_for('картинка категории', node._img_url || 'default.png');
  };
  
  $scope.treeOptions = {
    
    defaultCollapsed: true, // collapse nodes by default
    accept000: function(sourceNodeScope, destNodesScope, destIndex) {
      console.log("current dragging node can be dropped:  "+Object.keys(sourceNodeScope).join("; "));
      
      return true;
    },
    beforeDrag000: function (sourceNodeScope) {
      var node = sourceNodeScope.$parent.node;
      if (node.id && node._selected) return true;
      //~ console.log("current selected node can be dragged: "+Object.keys(s).join("; "));
      return false;
    },
    beforeDrop: function (event) {
      return !!event.dest.nodesScope.$parentNodesScope;
      
    },
    dropped: function(event) {
      var node = event.source.nodeScope.$parent.node;
      var id = node.id;
      var fromParentScope = event.source.nodeScope.$parentNodeScope;
      var fromParentNode = fromParentScope && fromParentScope.$parent.node;
      var fromParentId = fromParentNode === null ? 0 : fromParentNode.id;
      
      var toParentScope = event.dest.nodesScope;
      var toParentNode = toParentScope && toParentScope.$parent.node;
      var toParentId = toParentNode === null ? 0 : toParentNode.id;
      var fromIndex = event.source.index;//The position when it began to drag.
      var toIndex = event.dest.index;//: The position which you just dropped in.

      
      if (fromParentNode === toParentNode && fromIndex == toIndex) return; // 
      
      console.log("Кинул: #"+ id + " из родителя: #"+ fromParentId + " позиции: " + fromIndex + " => в родителя: #" + toParentId + " на позицию: " + toIndex);//source; dest; elements; pos
      /// 
      var order_childs = [];
      if(toParentNode) angular.forEach(toParentNode.childs, function (node, i) {order_childs.push(node.id); });
      console.log("sort childs: "+ order_childs);
      
      //~ $http.post("https://calculate/js/main.js", {parentId: toParentId, sort_childs: order_childs}).then(function() {}, function() {});
      
      //Object.keys(event.source.nodeScope).join("; ")
      //~ $scope.debug = event.source;
      //+ Object.keys(event.pos).join("; ") + " --- " 
      return true;
    },
    removed: function(node) {
      //~ console.log("Удалил: "+node.$parent.node.id + " из родителя: "+node.$parentNodeScope.$parent.node.id);
      //~ Object.keys().join("; ")
      //~ $scope.debug = node;
      
      
    }
  };
  
  $scope.getTplUrl = function (str) {
    return str || $attrs.templateUrl;
  };
  
  $scope.nodeId000 = function (scope) {
    var li = scope.$element;
    //~ if (li[0].attributes['id']) {
      //~ li.removeAttr('data-id');
      //~ return;
    //~ }
    li.attr('id', scope.node.$$hashKey);
    li.removeAttr('_id');
    console.log(scope.node.$$hashKey);
    //~ return 123;
  };
  
  
  $scope.remove = function (scope) {
    scope.remove();
  };

  $scope.toggle = function (scope) {
    scope.toggle();
  };
  
  $scope.selectedNode = null;
  $scope.toggleSelect = function (scope) {
    var node = scope.$parent.node;
    //~ node._enable_drag = !node._enable_drag;
    //~ scope.$nodeScope.dragEnabled = function () {return true;};
    //~ console.log($(scope.$nodeScope.$element[0]).attr('data-nodrag', 'true'));//$$childTail; $$childHead; $$nextSibling; $$watchers; $$listeners; $$listenerCount; $$watchersCount; $id; $$ChildScope; $parent; $$prevSibling; $element; $nodeScope; $type
    
    //~ 
    
    
    if($scope.selectedNode) {// отключить выбор позиции
      $scope.selectedNode._selected = !$scope.selectedNode._selected;
    }
    if ($scope.selectedNode === node) {
      $scope.selectedNode = null;
      return;
    } else {
      node._selected = true;
      $scope.selectedNode = node;
      $timeout(function () {$(scope.$nodeScope.$element[0]).find('input').first().focus();});
      //~ console.log("Включил позицию: ", );
    }
  };
  
  
  $scope.save =  function (scope) {
    var node = scope.$parent.node;
    //~ if (node._selected) {
      //~ var parent = scope.$nodeScope && scope.$nodeScope.$parentNodeScope && scope.$nodeScope.$parentNodeScope.$parent.node;
      //~ var parent_childs = [];
      //~ if(parent) angular.forEach(parent.childs, function (node, i) {parent_childs.push(node.id || 0); });
      //~ console.log("sort childs: "+ order_childs);
      //~ var node_childs = [];
      //~ if(1) angular.forEach(node.childs, function (node, i) {node_childs.push(node.id || 0); });
      // node, " childs: ",  && parent.id, " childs: ", parent_childs
      //~ console.log("Закрыл узел: ",  node, " элемент: ", scope.$element[0], " файл: ", scope.imgFile, " parent: ", parent);//+Object.keys(parent).join("; ")
      if (scope.imgFile) return $scope.uploadImg(scope);
      $scope.toggleSelect(scope);
    
      $timeout(function () {
        var el = $(scope.$element[0]);
        $('html, body').animate({scrollTop: el.offset().top}, 1000);
      });

      return;
    //~ }
  };
  
  $scope.uploadImg = function (scope) {
    var file = scope.imgFile;
    var node = scope.$parent.node;
    if (file.result) {
      $scope.toggleSelect(scope);
      return;
    }
    var data = {img: file};
    if (node.img) data.remove_img = node.img;
    file.upload = Upload.upload({
      url: $attrs.saveUrl, //'https://angular-file-upload-cors-srv.appspot.com/upload',
      data: data,
    });

    file.upload.then(function (response) {
      $timeout(function () {
        file.result = response.data;
        node._img_url = $attrs.imgPath+'/'+response.data.name;
        node.img = response.data.name;
        $scope.toggleSelect(scope);
      });
    }, function (response) {
      if (response.status > 0)
        file.errorMsg = response.status + ': ' + response.data;
    }, function (evt) {
      // Math.min is to fix IE which reports 200% sometimes
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
    
  };
  
  $scope.isDsbl = function (node) {
    //~ var node = scope.$parent.node;
    return !!(node.disabled || parseInt(node.disabled));
  };
  
  $scope.toggleDisabled = function (scope) {
    var node = scope.$parent.node;
    node.disabled = ! $scope.isDsbl(node);// ? 1 : 0;
    node._selected = false;
    $scope.selectedNode = null;
  };

  $scope.moveLastToTheBeginning000 = function () {
    var a = $scope.data.pop();
    $scope.data.splice(0, 0, a);
  };

  $scope.newSubItem = function (scope) {
    var nodeData = scope.$modelValue;
    var newNode = {
      id: null, //nodeData.id * 10 + nodeData.childs.length + 1,
      title: "Без заголовка", //nodeData.title + '.' + (nodeData.childs.length + 1),
      childs: []
    };
    nodeData.childs.push(newNode);
    $timeout(function () {
      var newLi = $(scope.$childNodesScope.$parent.$element[0]).find('ol > li').last();
      $('html, body').animate({scrollTop: newLi.offset().top}, 1000);
      angular.element(newLi.find('a.edit').get(0)).triggerHandler('click');
    });//$(scope.$nodeScope.$element[0]).find('input').first().focus()
    
    //~ $timeout(function () {console.log("new node: ", angular.element($(scope.$childNodesScope.$parent.$element[0]).find('li:last-child a.right').get(0)). triggerHandler('click'));});//$(scope.$parent.$childNodesScope.$element[0]).find('li:last-child')
    //~  //Object.keys().join("; "));
  };
  
  $scope.parentsNav = function (scope) {
    //~ console.log(scope);
    var curr = scope,
      parents = [],
      render = '';
    while (curr.$parentNodeScope) {
      curr = curr.$parentNodeScope;
      parents.push(curr.node);
    }
    
    parents[parents.length - 1].title = 'Корень';
    //~ console.log(parents);
    angular.forEach(parents.reverse(), function (parent, i) { render += '<a ng-click="" class="breadcrumb blue-text">'+parent.title+'<a>'; });
    return $sce.trustAsHtml(render);
  };

  $scope.collapseAll = function () {
    $scope.$broadcast('angular-ui-tree:collapse-all');
    $scope.collapsed = !$scope.collapsed;
  };

  $scope.expandAll = function () {
    $scope.$broadcast('angular-ui-tree:expand-all');
    $scope.collapsed = !$scope.collapsed;
  };
  
  $scope.saveAll = function () {
    $http.post($attrs.saveUrl, $scope.data[0].childs)
      .then(function (resp) {
        $scope.debug = resp.data;
        $window.location.reload();
      });
  };


  
});

}());
