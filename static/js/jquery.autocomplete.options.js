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
  
  /***var MapArrayVal1 = function(val){///this - RegExp
    if (val === null) return;
    //~ var re = this;
    return $('<span>').addClass('chip shadow-inset-10').html( formatResultsApplyRE(this, val));
  };
  var FilterArrayVal1 = function(val){
    return !!val;
  };
  var MapArrayVal2 = function(el){///this - элемент jQuery сборка массива
    return this.append($('<span>').addClass('breadcrumb').append(el));
  };**/
  
jQuery.extend( jQuery.Autocomplete.defaults, {
  preserveInput: !0,///большой косяк был!
  containerClass: 'autocomplete-content z-depth-3 dropdown-content',
  //~ suggestionClass:"",
  triggerSelectOnValidInput: false,
  
  
  formatResultsSingle: function(suggestion, currentValue, sugClass){//одиночное форматирование простого списка
    var el = $('<span>').css({'vertical-align':'middle'});
    if           (Object.prototype.toString.call(sugClass) == '[object Object]') Object.keys(sugClass).map(function(key){ if (sugClass[key]) el.addClass(key); });
    else  if (Object.prototype.toString.call(sugClass) == '[object String]') el.addClass(sugClass);
    else  if (Object.prototype.toString.call(sugClass) == '[object Function]') el.addClass(sugClass(suggestion, currentValue));
    
    if (!currentValue)  return el.html(suggestion.value);///.get(0).outerHTML;// Do not replace anything if there current value is empty
    //$.Autocomplete.defaults.
    var re = formatResultsRegExp(currentValue);//new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
    var replace = formatResultsApplyRE(re, suggestion.value);//suggestion.data.title
    el.html(replace);
    return el;///.get(0).outerHTML;
  },
  formatResultsArray: function(vals, currentValue, suggestion){//форматирование списка массивов
    //~ console.log("formatResultsArray", vals, currentValue);
    //~ if (!currentValue)  return;// suggestion.value;// Do not replace anything if there current value is empty
    var re = formatResultsRegExp(currentValue);
    var ret = $('<div>');
    if (suggestion && suggestion._title) ret.attr('title', suggestion._title);
    ///angular.forEach(vals, function(val) {
    for (const val of vals) {
      if (val === null) continue;
      //~ ret.push('<span class="breadcrumb"><span class="chip">' + formatResultsApplyRE(re, val) + '</span></span>');
      var el;
      if (Object.prototype.toString.call(val).toLowerCase() == '[object object]') 
        el = $('<span>').addClass(val.addClass || '').html( formatResultsApplyRE(re, val.title || val.value || val.name));
      else
        el = $('<span>').addClass('chip shadow-inset-10').html( formatResultsApplyRE(re, val));
      ret.append($('<span>').addClass('breadcrumb before-margin-0').append(el));
    }
   ///});*/
    //~ vals.map(MapArrayVal1, re).filter(FilterArrayVal1).map(MapArrayVal2, ret);
    //~ ret.push('<span class="breadcrumb">' +  ac.options.formatResultsApplyRE(re, suggestion.data.name) + '</span>');
    return ret;///.get(0).outerHTML;
  },
});

}());