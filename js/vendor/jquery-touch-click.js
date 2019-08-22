// Utility add a click handler that fires only once for both touch and click
// Based on code from https://stackoverflow.com/a/14202543/775259
(function ($) {
    $.fn.touchClick = function(onclick) {
        this.bind('touchstart', function(e) {
            onclick.call(this, e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (e.cancelable) {
                e.preventDefault();
            }
        });
        this.bind('mousedown', function(e) {
           onclick.call(this, e);  //substitute mousedown event for exact same result as touchstart
        });
        return this;
    };

    var hasTouch = function() {
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    };

    $.fn.singleTouchClick = function(onClick) {
        if (hasTouch()) {
            this.bind('touchstart', function(e) {
                onClick.call(this, e);
            });
        } else {
            this.bind('mousedown', function(e) {
                onClick.call(this, e);
            });
        }
        return this;
    };

    $.fn.singleTouchClickOff = function(onClickOff) {
        if (hasTouch()) {
            this.bind('touchend touchcancel', function(e) {
                onClickOff.call(this, e);
            });
        } else {
            this.bind('mouseup', function(e) {
                onClickOff.call(this, e);
            });
        }
        return this;
    };
})(jQuery);
