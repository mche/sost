/**
*  Ajax Autocomplete for jQuery, version 1.4.1
*  (c) 2017 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
                },
                //~ createNode: function (options) {
                    //~ var div = document.createElement('div');
                    //~ div.className = options.containerClass;
                    //~ div.style.display = 'none';
                    //~ return div;
                //~ }
                createNode: function (options) {
                    var div = $('<div>');
                    div.addClass(options.containerClass);
                    if (options.containerCss) div.css(options.containerCss);
                    div.css({"display": 'none'});
                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        },

        noop = $.noop;

    function Autocomplete(el, options) {
        var that = this;

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.timeoutId = null;
        that.cachedResponse = {};
        that.onChangeTimeout = null;
        that.onChange = null;
        that.isLocal = false;
        that['список'] = {/**поции списка: top(boolean)-сместить список сверху(по умолчанию наезжает на ПУСТОЕ поле ввода)**/};
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, Autocomplete.defaults, options);
        //~ that.formatResult = that.options.formatResult;
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: that.options.suggestionClass,//'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: 'body',
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: _formatResult,
            formatGroup: _formatGroup,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            suggestionClass: 'autocomplete-suggestion',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: _lookupFilter,
            paramName: 'query',
            transformResult: _transformResult,
            showNoSuggestionNotice: false,
            noSuggestionNotice: $('<div>No results</div>'),
            orientation: 'bottom',
            forceFixPosition: false
    };

    function _lookupFilter(suggestion, originalQuery, queryLowerCase) {
        return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
    };

    function _transformResult(response) {
        return typeof response === 'string' ? $.parseJSON(response) : response;
    };
    
    

    function _formatResult(suggestion, currentValue) {
        // Do not replace anything if the current value is empty
        //~ console.log("_formatResult", arguments);
        if (!currentValue) {
            return suggestion.value;
        }
        
        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value
            .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    function _formatGroup(suggestion, category) {
        return '<div class="autocomplete-group">' + category + '</div>';
    };

    Autocomplete.prototype = {

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .append(this.options.noSuggestionNotice);

            that.suggestionsContainer = Autocomplete.utils.createNode(options);

            var container = that.suggestionsContainer;
            

            container.appendTo(options.appendTo || 'body');

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                //~ console.log("mouse over event on suggestions list");
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                //~ console.log("mouse leaves suggestions container");
                that.selectedIndex = -1;
                ///that.suggestionsPage = 0;
                container.children('.' + selected).removeClass(selected);
            });


            // Listen for click event on suggestions list:
            //~ container.on('click.autocomplete', suggestionSelector, function () {
                //~ console.log("click.autocomplete", this);
                //~ that.select($(this).data('index'));
            //~ });

            container.on('click.autocomplete', function () {
                //~ console.log("click.autocomplete", this);
                //~ that.select($(this).data('index'));
                clearTimeout(that.blurTimeoutId);
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },
        
        "documentEventHideContainer": function(){///сусама
            //~ if (this._documentEventHideContainer) return; не катит
            var that = this,
                container = that.suggestionsContainer
            ;
            if (!that.eventHideContainer) that.eventHideContainer = function(event){
                var cont = $(event.target).closest(container);
                if(cont.length) return true;
                //~ if (param && param.resetSuggestionsPage) that.suggestionsPage = 0;
                that.hide();
                //~ $(document).off('click', that.eventHideContainer);в .hide()
                return false;
            };
            that._documentEventHideContainer = setTimeout(function(){$(document).on('click', that.eventHideContainer);}, 100);
            return that._documentEventHideContainer;
        },

        onFocus: function () {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            var that = this;

            // If user clicked on a suggestion, hide() will
            // be canceled, otherwise close suggestions
            //~ console.log("onBlur");
            that.blurTimeoutId = setTimeout(function () {
                if (!that.el.val()) return;
                //~ if (that.visible) 
                that.hide();/////патчик
            }, 200);
        },
        
        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            this.options = $.extend({}, options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            //~ that.suggestionsContainer.css({
                //~ 'max-height': options.maxHeight + 'px',
                //~ 'width': options.width + 'px',
                //~ 'z-index': options.zIndex
            //~ });
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
            return this;
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
            return this;
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearTimeout(that.onChangeTimeout);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = that.suggestionsContainer,
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if(containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                    if (!that.visible){
                        $container.css('opacity', 0).show();
                    }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible){
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                //~ styles.width = that.el.outerWidth() + 'px';
                //~ styles.width = '100%';
            }

            $container.css(styles);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    //~ that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    //~ that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearTimeout(that.onChangeTimeout);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                 that.suggestionsPage = 0;
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeTimeout = setTimeout(function () {
                        //~ console.log("onKeyUp onChangeTimeout");
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                    //~ console.log("onKeyUp onChangeTimeout", that.onChangeTimeout);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {
            //~ console.log("onValueChange");
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearTimeout(that.onChangeTimeout);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },
        
        toggleAll: function(){
            var that = this,
                container = that.suggestionsContainer,
                className = that.classes.suggestion,
                options = that.options;
            
            //~ if(!that.onEvHideAllFn) that.onEvHideAllFn = that.onEvHideAll();
            
            if (that.visible) {
                that.hide();
            }
            else setTimeout(function(){
                //~ that.intervalHideAll = window.setInterval(function () {
                //~ that.suggestions = options.lookup;
                that.suggest(true);
                
                var val = that.el.val();
                if(val) {
                    //~ var s = $('.'+className+'[data-value="' + val.replace(/"/g, '\\"') + '"]', container);
                    var index, scrollTo;
                    options.lookup.filter(function(item, i){ if ((item.data && item.data.value == val) || item.value == val) index = i;});
                    if(index !== undefined) scrollTo = $('.'+className, container).eq(index);
                    //~ else scrollTo = $('.'+className, container).eq(12);
                    //~ console.log("Scroll  to ", scrollTo, index, val, options.lookup);

                    if(scrollTo)    container.animate({
                            scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
                        });

/* OK fast
container.scrollTop(
    scrollTo.offset().top - container.offset().top + container.scrollTop()
);*/
                    
                }
                
                that.documentEventHideContainer();
            }, 0);
            //~ that.toggledList = !that.toggledList;
        },
        
        getSuggestionsLocal: function (query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase, that);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            params = options.ignoreParams ? null : options.params;

            if ($.isFunction(options.lookup)){
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            if (!this.options.preventBadQueries){
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = that.suggestionsContainer;

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearTimeout(that.onChangeTimeout);
            container.hide();
            that.signalHint(null);
            if(that.eventHideContainer) $(document).off('click', that.eventHideContainer);
        }, 

        suggest: function (all) {
            if (!this.suggestions.length && !all) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.hightlight || that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = that.suggestionsContainer,
                noSuggestionsContainer = that.noSuggestionsContainer,
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return options.formatGroup(suggestion, category);
                    },
                    
                suggestionsLimit = options.suggestionsLimit || 0,
                suggestionsPage = that.suggestionsPage || 0 
              
            ;/// end var

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }
            //~ debugger;
            //~ html += $('<a>').css({"position":'fixed', "left000":container.width(), "color":'red'}).attr("href", 'javascript:').html('x').get(0).outerHTML;
            container.html(html);///очистка тут
            if(all) that.suggestions = options.lookup;
            // Build suggestions inner HTML:
            //~ console.log("Build suggestions inner HTML:", that.suggestions);
            var suggestions;
            var slice = [suggestionsPage*suggestionsLimit, (suggestionsPage+1)*suggestionsLimit];
            if (suggestionsLimit) suggestions = that.suggestions.slice(slice[0], slice[1]);///извлекает элементы с индексом меньше второго параметра
            else suggestions = that.suggestions;
            var len = that.suggestions.length;
            $.each(suggestions, function (i, suggestion) {
            //~ var i=0, len = suggestions.length;
            //~ for (i = 0; i < len; ++i) {
            //~ while (i++ < len) {
              //~ var suggestion = suggestions[i-1];
              //~ console.log("Build suggestion ", suggestion, i);
              if (groupBy)  html += formatGroup(suggestion, value, i+slice[0]);
              
              var item = formatResult(suggestion,  value, i+slice[0], that);// value- text field
              var div = $('<div>').addClass(className).attr({"data-index": i+slice[0], "data-value":suggestion.value});
              if (item instanceof jQuery) div.append(item);
              else div.html(item);
              div.on('click.autocomplete', function () {
                  //~ console.log("click.autocomplete suggestion", i);
                  that.select(i+slice[0]);
              });
              container.append(div);
              //~ i++;

              //~ html += div[0].outerHTML; //'<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i, that) + '</div>';
            });
            
            if (!all && that.el.val().length || (options['список'] && options['список'].top)) container.css({"top": that.el.height()+'px'});// сам 2017-10-02
            //~ console.log("suggest ", this, container);

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            
            if (options.topChild) container.prepend(options.topChild(value, that));
            if(options.lastChild) container.append(options.lastChild(value, that));
            if (suggestionsLimit) {
                var div = $('<div class="center grey">');
                if (slice[1] < len) div.append($('<a href="javascript:">').addClass('btn-flat white green-text text-darken-3  z-depth-3 fs10 nowrap').html('показать еще').on('click', function(e){
                    that.suggestionsPage = suggestionsPage + 1; ///дальше вниз
                    //~ else that.suggestionsPage = 0;///достигнут конец снова первая страница
                    
                    if (that.blurTimeoutId) clearTimeout(that.blurTimeoutId);
                    that.suggest();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                }));
                if (slice[0] || slice[1] < len)
                    div.append($('<span class="chip">').html((slice[0]+1)+'-'+slice[1]))
                         .append($('<span class="chip">').html(' из: '+len));
                if (slice[0]) div.append($('<a href="javascript:">').addClass('btn-flat white green-text text-darken-3  z-depth-3 fs10 nowrap').html('в начало').on('click', function(e){
                    that.suggestionsPage = 0;///достигнут конец снова первая страница
                    
                    if (that.blurTimeoutId) clearTimeout(that.blurTimeoutId);
                    that.suggest();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                }));
                container.append(div);
            }

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.slideDown(300);// было show()
            that.documentEventHideContainer();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
            
            
        },

        noSuggestions: function() {
             var that = this,
                options = that.options,
                 beforeRender = that.options.beforeRender,
                 container = that.suggestionsContainer,
                 noSuggestionsContainer = that.noSuggestionsContainer;

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();

            // clean suggestions if any
            container.empty(); 
            container.append(noSuggestionsContainer);
            
            if (that.el.val().length /*|| (options['список'] && options['список'].top)*/) container.css({"top": that.el.height()+'px'});// сам 2017-10-02

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = that.suggestionsContainer;

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                //~ width = that.el.outerWidth();
                //~ container.css('width', width > 0 ? width : 300);
                //~ container.css('width', '100%');
            } else if(options.width === 'flex') {
                // Trust the source! Unset the width property so it will be the max length
                // the containing elements.
                container.css('width', '');
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if($.inArray(orientation, ['auto', 'bottom', 'top']) === -1){
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = that.suggestionsContainer,
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                that.suggestionsContainer.children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index),
                container = that.suggestionsContainer
            ;

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = container.scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) container.scrollTop(offsetTop);
            else if (offsetTop > lowerBound) container.scrollTop(offsetTop - that.options.maxHeight + heightDelta);

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];
            
            if(!suggestion) return;

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            that.suggestionsContainer.remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };

    // Don't overwrite if it already exists
    if (!$.fn.autocomplete) {
        $.fn.autocomplete = $.fn.devbridgeAutocomplete;
    }
}));
