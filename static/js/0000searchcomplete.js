/**************************
 * Search field complete plugin  *
 *************************/
$.fn.searchcomplete = function (options) {
  // Defaults
  var defaults = {
    data: {}
  };

  options = $.extend(defaults, options);

  return this.each(function() {
    var $input = $(this);
    var data = options.data,
        $inputDiv = $input.closest('.input-field'); // Div to append on

    // Check if data isn't empty
    if (!$.isEmptyObject(data)) {
      // Create autocomplete element
      var $autocomplete = $('<ul class="autocomplete-content dropdown-content"></ul>');

      // Append autocomplete element
      if ($inputDiv.length) {
        $inputDiv.append($autocomplete); // Set ul in body
      } else {
        $input.after($autocomplete);
      }

      var highlight = function(string, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
            matchEnd = matchStart + string.length - 1,
            beforeMatch = $el.text().slice(0, matchStart),
            matchText = $el.text().slice(matchStart, matchEnd + 1),
            afterMatch = $el.text().slice(matchEnd + 1);
        $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
        if (img.length) {
          $el.prepend(img);
        }
      };

      // Perform search
      $input.on('keyup', function (e) {
        // Capture Enter
        if (e.which === 13) {
          $autocomplete.find('li').first().click();
          return;
        }

        var val = $input.val().toLowerCase();
        $autocomplete.empty();

        // Check if the input isn't empty
        if (val !== '') {
          for(var key in data) {
            if (data.hasOwnProperty(key) &&
                key.toLowerCase().indexOf(val) !== -1 &&
                key.toLowerCase() !== val) {
              var autocompleteOption = $('<li></li>');
              if(!!data[key]) {
                autocompleteOption.append('<img src="'+ data[key] +'" class="right circle"><span>'+ key +'</span>');
              } else {
                autocompleteOption.append('<span>'+ key +'</span>');
              }
              $autocomplete.append(autocompleteOption);

              highlight(val, autocompleteOption);
            }
          }
        }
      });

      // Set input value
      $autocomplete.on('click', 'li', function () {
        $input.val($(this).text().trim());
        $input.trigger('change');
        $autocomplete.empty();
      });
    }
  });
};