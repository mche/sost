(function () {'use strict';
  
  var formatResultsRegExp = function(val) {// currentValue
    var pattern = '(' + $.Autocomplete.utils.escapeRegExChars(val) + ')';
    return new RegExp(pattern, 'gi');
  };
  
  var formatResultsApplyRE = function (re, val){
    return val
      .replace(re, '<strong>$1<\/strong>')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    
  };
  
jQuery.extend( jQuery.Autocomplete.defaults, {
  containerClass: 'autocomplete-content dropdown-content',
  preserveInput: false,
  triggerSelectOnValidInput: false,
  
  
  formatResultsSingle: function(suggestion, currentValue){//одиночное форматирование простого списка
    if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
    //$.Autocomplete.defaults.
    var re = formatResultsRegExp(currentValue);//new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
    var replace = formatResultsApplyRE(re, suggestion.value);//suggestion.data.title
    return $('<span>').html(replace).get(0).outerHTML;
  },
  formatResultsArray: function(vals, currentValue){//форматирование списка массивов
    if (!currentValue)  return;// suggestion.value;// Do not replace anything if there current value is empty
    var re = formatResultsRegExp(currentValue),
      ret = [];
    angular.forEach(vals, function(val) {
      if (val === null) return;
      //~ ret.push('<span class="breadcrumb"><span class="chip">' + formatResultsApplyRE(re, val) + '</span></span>');
      ret.push($('<span>').addClass('breadcrumb').append($('<span>').addClass('chip').html( formatResultsApplyRE(re, val))).get(0).outerHTML);
    });
    //~ ret.push('<span class="breadcrumb">' +  ac.options.formatResultsApplyRE(re, suggestion.data.name) + '</span>');
    return '<span>'+ret.join('')+'</span>';
  },
});

}());