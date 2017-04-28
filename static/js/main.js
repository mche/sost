$(document).ready(function () {
  
  //~ var atopnav = $("a.top-nav");
  //~ if (atopnav.get(0)) atopnav.
  $(".right-side").sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'right', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', '51%')}});// Initialize menu button
  
  var search = $('#search');
  if (!search.get(0)) return;
  search.autocomplete({
    //~ serviceUrl: 
    lookup: function (query, done) {// однократно вызовется ниже $('#search').autocomplete().getSuggestions();
      $.ajax({
        url: '/assets/top-search.json',//c/transport/category/search.json
        //~ data: data,
        cache: true,
        //~ ifModified: true,
        success: function(data) {
          var suggestions = [];
          $.each(data, function(idx, val) {
            suggestions.push({value: val.path.join('/'), data:val})
          });
          //~ console.log(suggestions);
          search.autocomplete().setOptions({lookup: suggestions});
          
        },
        dataType: 'json'
      });
        //~ done(result);
    },
    preserveInput: true,
    appendTo: $('#search').closest('div'),
    containerClass: 'autocomplete-content dropdown-content',
    formatResult: function (suggestion, currentValue) {
      if (!currentValue)  return suggestion.value;// Do not replace anything if there current value is empty
      var ret = [];
      var pattern = new RegExp('(' + currentValue.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&") + ')', 'gi'); // копи-паста utils.escapeRegExChars(currentValue)
      $.each(suggestion.data.path, function(idx, val) {
        //~ var matchStart = val.toLowerCase().indexOf("" + currentValue.toLowerCase() + ""),
          //~ matchEnd = matchStart + currentValue.length - 1,
          //~ beforeMatch = val.slice(0, matchStart),
          //~ matchText = val.slice(matchStart, matchEnd + 1),
          //~ afterMatch = val.slice(matchEnd + 1);
        //~ ret.push('<span class="breadcrumb teal-text">' + beforeMatch + '<span class="highlight">' + matchText + '</span>' + afterMatch + '</span>');
        val = val
          .replace(pattern, '<strong>$1<\/strong>')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
        ret.push('<span class="breadcrumb teal-text">' + val + '</span>');
      });
      return '<img alt="пиктограмма транспорта" class="circle000" style=" width: 45px; vertical-align: middle;" src="/i/transport/category/'+ (suggestion.data.img || '8cb2d903fe2a5d9d0d8a953ba3df94e1.png') +'">'+'<span>'+ret.join('')+'</span>';
    },
    onSelect: function (suggestion) {
        //~ console.log('You selected: ', suggestion);
      window.location.href = '/search?c='+suggestion.data.id;
    }
  });
  search.autocomplete().getSuggestions();// вызов lookup и там подмена его
/*  $('input.autocomplete').searchcomplete({
    data: {
      "Яблоко": null,
      "Груша": null,
      "Голос": 'http://placehold.it/250x250',
      "Глобус":null
    },
    limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
  });*/
  //~ $('.collapsible').collapsible();
  
  //$('*[cachedAjaxScript]').cachedAjaxScript();//function () {
  //});
  
});

