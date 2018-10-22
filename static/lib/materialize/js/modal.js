(function($) {'use strict';
  var _stack = 0,
  _lastID = 0,
  _generateID = function() {
    _lastID++;
    return 'materialize-modal-overlay-' + _lastID;
  };
  
  var animatedEndEvents = 'animationend webkitAnimationEnd oAnimationend MSAnimationEnd';

  var methods = {
    init : function(options) {
      var defaults = {
        opacity: 0.5,
        in_duration: 350,
        out_duration: 250,
        ready: undefined,
        complete: undefined,
        dismissible: true,
        startingTop: '4%',
        endingTop: '10%',
        noOverlay: false,///без оверлея
      };

      // Override defaults
      options = $.extend(defaults, options);
      //~ console.log(options);

      return this.each(function() {
        var $modal = $(this);
        var modal_id = $(this).attr("id") || '#' + $(this).data('target');
        var modalStyleTop = $modal[0].style.top;///сусама

        var closeModal = function() {
          var overlayID = $modal.data('overlay-id');
          var $overlay = $('#' + overlayID);
          $modal.removeClass('open');
          _stack--;

          // Enable scrolling
          $('body').css({
            overflow: '',
            width: ''
          });

          $modal.find('.modal-close').off('click.close');
          //~ $(document).off('keyup.modal' + overlayID);
          
          if ($modal.data('overlayOut')) $overlay.removeClass($modal.data('overlayIn')).addClass($modal.data('overlayOut'));
          else $overlay.velocity( { opacity: 0}, {duration: options.out_duration, queue: false, ease: "easeOutQuart"});


          // Define Bottom Sheet animation
          var exitVelocityOptions = {
            duration: options.out_duration,
            queue: false,
            ease: "easeOutCubic",
            // Handle modal ready callback
            complete: function() {
              $(this).css({display:"none"});

              // Call complete callback
              if (typeof(options.complete) === "function") {
                options.complete.call(this, $modal);
              }
              $overlay.remove();
              //~ _stack--;
            }
          };
          
          if ($modal.hasClass('bottom-sheet')) {
            $modal.velocity({bottom: "-100%", opacity: 0}, exitVelocityOptions);
          }
          else if ($modal.data('modalOut')) {
            console.log("modal out ", $modal, $overlay);
            $modal/*.removeClass($modal.data('modalIn'))*/.addClass($modal.data('modalOut')).one(animatedEndEvents, function(){
              $modal.hide();
              $modal.removeClass($modal.data('modalOut'));
              //~ console.log("animationend", $modal, $overlay);
              // Call complete callback
                if (typeof(options.complete) === "function") options.complete.call(this, $modal);
              $overlay.remove();
            });
          }
          else {
            $modal.velocity(
              { top: options.startingTop, opacity: 0, scaleX: 0.7},
              exitVelocityOptions
            );
          }
        };

        var openModal = function($trigger) {
          var $body = $('body');
          var oldWidth = $body.innerWidth();
          $body.css('overflow', 'hidden');
          $body.width(oldWidth);

          if ($modal.hasClass('open')) {
            return;
          }

          var overlayID = _generateID();
          var $overlay = $('<div class="modal-overlay"></div>');
          var zIndex = 1000 + Math.abs(++_stack)*2;
          

          // Store a reference of the overlay
          $overlay.attr('id', overlayID).css('z-index', zIndex-1);//+ lStack * 2
          $modal.data('overlay-id', overlayID);//
          $modal.css('z-index', zIndex);
          $modal.addClass('open');
          
          //~ if($modal.closest('.modal').length) $("body").append($modal);
          if (!$modal.parent().is('body') && $modal.parents().filter(function(){  return $( this ).css('position') == 'fixed'; }).length) $("body").append($modal);
          if (!($modal.attr('data-noOverlay') || $modal.attr('data-no-overlay') || $modal.attr('data-nooverlay')) && !options.noOverlay) $("body").append($overlay);
          
          //~ var $close = $('<a class="modal-close btn-flat white-text"></a>').css({'position':'absolute', 'top':0, 'right':'0', 'z-index': zIndex,}).html('Закрыть').insertBefore($modal);
          //~ $("body").append($close);

          if (options.dismissible) {
            $overlay.click(function() {
              closeModal();
            });
            // Return on ESC
            $(document).one('keyup.modal' + overlayID, function(e) {
              if (e.keyCode === 27) {   // ESC key
                closeModal();
              }
            });
          }

          $modal.find(".modal-close").on('click.close', function(e) {
            closeModal();
          });

          
          if ($modal.data('overlayIn')) $overlay.addClass($modal.data('overlayIn'));
          else {
            $overlay.css({ display : "block", opacity : 0 });
            $overlay.velocity({opacity: options.opacity}, {duration: options.in_duration, queue: false, ease: "easeOutCubic"});
          }
          
          //~ $modal.data('associated-overlay', $overlay[0]);

          // Define Bottom Sheet animation
          var enterVelocityOptions = {
            duration: options.in_duration,
            queue: false,
            ease: "easeOutCubic",
            // Handle modal ready callback
            complete: function() {
              if (typeof(options.ready) === "function") {
                options.ready.call(this, $modal, $trigger);
              }
            }
          };
          $modal.css({
            display : "block",
            //~ opacity: 0
          });
          if ($modal.hasClass('bottom-sheet')) {
            $modal.css({opacity: 0}).velocity({bottom: "0", opacity: 1}, enterVelocityOptions);
          }
          else if ($modal.data('modalIn')) $modal.removeClass($modal.data('modalIn')).removeClass($modal.data('modalOut')).addClass($modal.data('modalIn')).one(animatedEndEvents, function(){
            $modal.removeClass($modal.data('modalIn'));
            //~ console.log("animationend", $modal);
            //~ enterVelocityOptions.complete();
            if (typeof(options.ready) === "function") options.ready.call(this, $modal, $trigger);

          })
          else {
            var endingTop = /*$modal[0].style.top ||*/ modalStyleTop || /* $modal.attr('data-endingTop') || $modal.attr('data-modalTop') ||*/ options.endingTop;
            //~ console.log("modal css top bottom! ", "style: "+$modal.attr('style'), "top: "+$modal[0].style.top, "bottom: "+$modal.css('bottom'));
            $.Velocity.hook($modal, "scaleX", 0.7);
            var opts = {opacity: 1, scaleX: '1'};/// 
            //~ if (/\b(?:top|bottom)\b:/.test($modal.attr('style'))) 1;
            if (endingTop == 'bottom') $modal.css({ bottom: 0, top:'auto', });
            else {
              $modal.css({ top: options.startingTop });
              opts.top = endingTop;
            }
            $modal.css({opacity: 0}).velocity(opts, enterVelocityOptions);
          }

        };

        // Reset handlers
        $(document).off('click.modalTrigger', 'a[href="#' + modal_id + '"], [data-target="' + modal_id + '"]');
        $(this).off('openModal');
        $(this).off('closeModal');

        // Close Handlers
        $(document).on('click.modalTrigger', 'a[href="#' + modal_id + '"], [data-target="' + modal_id + '"]', function(e) {
          options.startingTop = ($(this).offset().top - $(window).scrollTop()) /1.15;
          openModal($(this));
          e.preventDefault();
        }); // done set on click

        $(this).on('openModal', function() {
          //~ var modal_id = $(this).attr("href") || '#' + $(this).data('target');
          openModal();
        });

        $(this).on('closeModal', function() {
          closeModal();
        });
      }); // done return
    },
    open : function() {
      $(this).trigger('openModal');
    },
    close : function() {
      $(this).trigger('closeModal');
    }
  };

  $.fn.modal = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      // Default to "init"
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.modal' );
    }
  };
})(jQuery);
