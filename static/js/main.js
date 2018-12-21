$(document).ready(function () {
  
  /***
    обновление скриптов работает за счет очистки/пересоздания ассет|пак кэша
    обновление шаблонов через смену ВЕРСИИ (используется в сервисе LoadTemplateCache для добавления к урлам) static/js/controllers/template-cache/script.js
***/
  ///определить что страница загружена авторизованным //~ if ( !($('div[ng-app="formAuth"]').length || $('.status404').length) ) {
  if ($('head meta[name="app:uid"]').attr('content') && !$('.status404').length) {
    var curr = $('head meta[name="app:version"]').attr('content') || 1;
    var path = location.pathname;
    var old = localStorage.getItem('app:version '+path) || false;// || localStorage.getItem('app config')
    if (!old || curr != old) {
      console.log("Перезапуск страницы с новой версией: ", curr);
      localStorage.setItem('app:version ' + path, curr);
      location.reload(true); 
    }
    console.log("Версия: ", curr, old == curr ? undefined : old);
    
  }
  
  
  /*
  Навигация сайта выплывает слева или справа
  */
  var rsn = $("a.right-side-nav");
  var lsn = $("a.left-side-nav");
  if(rsn.length) rsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'right', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
  if(lsn.length) {
    lsn.sideNav({menuWidth: $('body').innerWidth()*2/4, edge: 'left', closeOnClick: false,  draggable: true, onClick: function(side, opts) {side.menu.css('width', 'auto')}});// Initialize menu button
    //~ $('div.left-side-hover').on( "mouseover", function(){ console.log("div.left-side-hover mouseover", lsn); lsn.sideNav('show'); } );
  }
  
  /***
  Расширение главной колонки
  
  ***/
  if (window.innerWidth < 1200) $('main div.container').addClass('wide');
  
  /*главный поиск на сайте*/
  /*
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
*/
  
});

