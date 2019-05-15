(function () {'use strict';
  
  const formatResultsRegExp = function(val) {// currentValue
    var pattern = '(' + $.Autocomplete.utils.escapeRegExChars(val) + ')';
    return new RegExp(pattern, 'gi');
  };
  
  const formatResultsApplyRE = function (re, val){
    
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
  minChars: 2,
  suggestionsLimit: 20,
  deferRequestBy: 700,
  //~ deferRequestBy: 500, косячит немного с таймаутом быстрого набора символов
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
  /*** ********/
  MapSuggestionsArrayTop: function(suggestion, i){/// список подсказок для структур и заголовками групп вернего уровня
    var that = this;
    var ac = that.ac,
      container = that.container,
      slice = that.slice,
      currentValue = that.currentValue,
      className = ac.classes.suggestion,
      data = suggestion.data,
      childs = data && suggestion.data.childs,
      item;
    if (suggestion.data.parents_id[0] === null) {
      item = $('<h4>').addClass('fw500 center teal-text text-darken-3 teal-lighten-4').html(suggestion.data.title);
      that.lastTop = suggestion.data.title;
    }
    else {
      if (that.lastTop != data.parents_title[0]) container.append($('<h4>').addClass('fw500 center teal-text text-darken-3 teal-lighten-4').html(data.parents_title[0]));
      that.lastTop = data.parents_title[0];
      var arr = data.parents_title.slice(1);//'suggestion.data.parents_id[0] === null ? 1 : 0);
      arr.push(data.title);
      suggestion._title = data.parents_title[0] + '〉' + arr.join('〉') + '  (#'+data.id+')';
      if (data.id && !(childs && childs.length)) arr.push({"title": '#'+data.id, "addClass": 'fs7 grey-text right-000'});
      item = ac.options.formatResultsArray(arr, currentValue, suggestion);
    }
    
    if (childs && childs.length) item.prepend('<i class="material-icons">keyboard_arrow_down</i>');
    else item.prepend($('<i class="material-icons">keyboard_arrow_right</i>').addClass('transparent-text'));
    
    var row = $('<div>').addClass(className)
      .attr({"data-index": i+slice[0], "data-value":suggestion.value})
      .append(item)
      .on('click.autocomplete', function () {
        //~ console.log("click.autocomplete suggestion", i);
        ac.select(i+slice[0]);
    });
    
    container.append(row);
    
  }
  
});

}());