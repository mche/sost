(function () {
'use strict';
/*
Адресный компонент
*/

//~ var materializeTpl = ["/lib/angular-ui-select/dist/materialize.tpl.html"];
//~ var materializeTpl = ["/controllers/address/ui-select.tpls.html"]; # убрал в AssetPack
  
var regExp = {
  tokens: /"[^"]+"|[^"]+/g,
  quote: /\s*"\s*/g,
  space: /\s+/g,
  space_bound: /^\s+|\s+$/g,
  //~ latin: /[a-z]/i,
  clean: /[^\s\dа-я-"]+/gi
};

var Controll = function ($scope, $http, $attrs, $q, appRoutes) {//loadTemplateCache
  var $ctrl = this;
  $ctrl.$attrs = $attrs;

  //~ loadTemplateCache.split(materializeTpl, 1).then(function (proms) {$ctrl.ready = true;});
  $ctrl.Init = function() {
    $ctrl.ready = true;
  };
  
  
  var addr_http_then_cb = function(resp) {
    $ctrl.select.choices = resp.data;
    $ctrl.cancelerHttp = undefined;
  };
  
  $ctrl.searchAddress = function(select) {
    var text = select.search;
    //~ $ctrl.data = [];
    if (text.length === 0) select.choices = [];
    var token, data = [];
    while ((token = regExp.tokens.exec(text))  !== null ) {
      var str = token[0].replace(regExp.space_bound, "");
      str = str.replace(regExp.space, " ");
      str = str.replace(regExp.clean, "");
      if (regExp.quote.test(str)) {
        data.push(str.replace(regExp.quote, ""));
      } else {
        Array.prototype.push.apply(data, str.split(regExp.space));
      }
      
    }

    if (!data[0] || data[0].length < 3) return;// || !/\w/.test(text)
    //~ if (regExp.latin.test(data[0])) return;
    
    var query = {q: data};
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    $ctrl.select = select;
    $http.get(
      appRoutes.url_for('поиск адреса'), //$attrs.searchAddressUrl,
      {params: query, timeout: $ctrl.cancelerHttp.promise}
    ).then(addr_http_then_cb);
    //~ return ;
  };
  
  $ctrl.clearAddr = function(select) {
    select.selected = {};
  };
  
  $ctrl.removeAddr = function(idx) {
    if ($ctrl.data.length == 1) {
      $ctrl.data[0] = {};
      return;
    }
    $ctrl.data.splice(idx, 1);
  };
  
  $ctrl.addrTop = function (idx, check) {// проверка тоже тут
    if (check) return idx !== 0; // вообще с нулевой в последнюю позицию перемещает хорошо
    $ctrl.data.move(idx, 0);
  };
  
  $ctrl.addrUp = function (idx, check) {// проверка тоже тут
    if (check) return idx !== 0; // вообще с нулевой в последнюю позицию перемещает хорошо
    $ctrl.data.move(idx, idx-1);
  };
  
  $ctrl.addrDown = function (idx) {
    $ctrl.data.move(idx, idx+1);
  };
  
  $ctrl.disableAddr = function (idx) {
    $ctrl.data[idx].disabled = !$ctrl.data[idx].disabled;
    
  };
  
  $ctrl.isDisabled = function(select) {
    if (!select.selected) return false;
    return !!select.selected.disabled;
  };

  

};

angular.module('address.select', ['ui.select', 'appRoutes'])
.component('addressSelect', {
  templateUrl: "address.select",
  bindings: {
      data: '<',
      disabled: '<'

  },
  controller: Controll
})
  ;

}());