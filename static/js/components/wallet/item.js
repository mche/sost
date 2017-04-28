(function () {'use strict';
/*
*/

var moduleName = "WalletItem";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'


var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.data) $ctrl.data = {};
    //~ console.log($ctrl.data);
    $ctrl.LoadData().then(function(){$ctrl.showListBtn = (!$ctrl.data.title || $ctrl.data.title.length === 0); $ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    return $http.get(appRoutes.url_for('список кошельков',$ctrl.data['проект']))//, [3], {"_":new Date().getTime()}
      .then(function(resp){
          $ctrl.autocomplete = [];
          angular.forEach(resp.data, function(val) {
            if($ctrl.data.id  && $ctrl.data.id == val.id) $ctrl.data.title = val.title;
            $ctrl.autocomplete.push({value: val.title, data:val});
          });
          
      });
    
  };
  
  $ctrl.InitInput = function(){// ng-init input textfield
    $ctrl.textField = $('input[type="text"]', $($element[0]));
   
    $ctrl.textField.autocomplete({
      lookup: $ctrl.autocomplete,
      preserveInput: false,
      appendTo: $ctrl.textField.parent(),
      containerClass: 'autocomplete-content dropdown-content',
      formatResult: function (suggestion, currentValue) {
        if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
        var ret = [];
        var pattern = new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
        var replace = suggestion.data.title
            .replace(pattern, '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
        return '<span class="teal-text">'+replace+'</span>';
      },
      triggerSelectOnValidInput: false,
      onSelect: function (suggestion) {
         //~ console.log(suggestion.data);
        //~ 
        $timeout(function(){
          //~ $ctrl.data=suggestion.data;
          $ctrl.data.title=suggestion.data.title;
          $ctrl.data.id=suggestion.data.id;
          $ctrl.showListBtn = false;
        });
        
      },
      onSearchComplete: function(query, suggestions){$ctrl.data._suggestCnt = suggestions.length; if(suggestions.length) $ctrl.data.id = undefined;},
      onHide: function (container) {}
      
    });
    
  };
  
  $ctrl.ChangeInput = function(){
    if ( $ctrl.data.id) $ctrl.data.id = undefined;
    $ctrl.showListBtn = ($ctrl.data.title.length === 0);
    return true;
  };
  
  
  $ctrl.ToggleListBtn = function(){
    var ac = $ctrl.textField.autocomplete();
    ac.toggleAll();
    //~ $(document).off('click.autocomplete', $ctrl.EvHideList);
    //~ if ($ctrl.toggleList) ac.hide();
    //~ else {// show
      //~ ac.toggleAll();
      //~ $(document).on('click.autocomplete', $ctrl.EvHideList);
    //~ }
    
    //~ $ctrl.toggleList = ! $ctrl.toggleList;
  };
  
  $ctrl.ClearInputBtn = function(){
    $ctrl.data.title = '';
    $ctrl.ChangeInput();
    $ctrl.data._suggestCnt = 0;
    
  };
  
  
};

/*=============================================================*/

module

.component('walletItem', {
  templateUrl: "wallet/item",
  scope: {},
  bindings: {
    data: '<',

  },
  controller: Component
})

;

}());