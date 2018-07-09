(function () {'use strict';
  
  var formatResultsRegExp = function(val) {// currentValue
    var pattern = '(' + $.Autocomplete.utils.escapeRegExChars(val) + ')';
    return new RegExp(pattern, 'gi');
  };
  
  var formatResultsApplyRE = function (re, val){
    
    var el =  $('<span>').html(val
      .replace(re, '<strong>$1<\/strong>')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/&lt;(\/?strong)&gt;/g, '<$1>')
    );
    el.find('strong').css({'background-color':'yellow', 'color':'inherit', 'vertical-align':'middle'});
    return el.html();
    
  };
  
jQuery.extend( jQuery.Autocomplete.defaults, {
  containerClass: 'autocomplete-content z-depth-3 dropdown-content',
  //~ suggestionClass:"",
  preserveInput: false,
  triggerSelectOnValidInput: false,
  
  
  formatResultsSingle: function(suggestion, currentValue, sugClass){//одиночное форматирование простого списка
    var el = $('<span>').css({'vertical-align':'middle'});
    if           (Object.prototype.toString.call(sugClass) == '[object Object]') Object.keys(sugClass).map(function(key){ if (sugClass[key]) el.addClass(key); });
    else  if (Object.prototype.toString.call(sugClass) == '[object String]') el.addClass(sugClass);
    else  if (Object.prototype.toString.call(sugClass) == '[object Function]') el.addClass(sugClass(suggestion, currentValue));
    
    if (!currentValue)  return el.html(suggestion.value).get(0).outerHTML;// Do not replace anything if there current value is empty
    //$.Autocomplete.defaults.
    var re = formatResultsRegExp(currentValue);//new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
    var replace = formatResultsApplyRE(re, suggestion.value);//suggestion.data.title
    el.html(replace);
    return el.get(0).outerHTML;
  },
  formatResultsArray: function(vals, currentValue){//форматирование списка массивов
    //~ console.log("formatResultsArray", vals, currentValue);
    //~ if (!currentValue)  return;// suggestion.value;// Do not replace anything if there current value is empty
    var re = formatResultsRegExp(currentValue),
      ret = [];
    angular.forEach(vals, function(val) {
      if (val === null) return;
      //~ ret.push('<span class="breadcrumb"><span class="chip">' + formatResultsApplyRE(re, val) + '</span></span>');
      var el = $('<span>').addClass('chip shadow-inset-10').html( formatResultsApplyRE(re, val));
      ret.push($('<span>').addClass('breadcrumb').append(el).get(0).outerHTML);
    });
    //~ ret.push('<span class="breadcrumb">' +  ac.options.formatResultsApplyRE(re, suggestion.data.name) + '</span>');
    return '<span>'+ret.join('')+'</span>';
  },
});

}());