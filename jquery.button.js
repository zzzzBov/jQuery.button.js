/**
 * An accessible button widget
 * 
 * Author: zzzzBov
 * Version: dev
 */
(function ($, undefined) {
    "use strict";
    var widget,
        mouseTriggers,
        keyTriggers;
    widget = 'button';
//------------------------------------------------------------------------------
    //widget constructor
    $[widget] = function (element, options) {
        if (!(this instanceof $[widget])) {
            return new $[widget](element, options);
        }
        this._element = $(element);
        this._options = {};
        this._create();
        this.options($.extend({}, $[widget].prototype._options, options));
    };
//------------------------------------------------------------------------------
    //binary values for specific button press triggers
    $[widget].triggers = {
        none:               0x00000000,
        click:              0x00000001,
        doubleclick:        0x00000002,
        mousedown:          0x00000004,
        mousehold:          0x00000008,
        mouseup:            0x00000010,
        leftclick:          0x00000020,
        rightclick:         0x00000040,
        middleclick:        0x00000080,
        leftdoubleclick:    0x00000100,
        rightdoubleclick:   0x00000200,
        middledoubleclick:  0x00000400,
        leftmousedown:      0x00000800,
        rightmousedown:     0x00001000,
        middlemousedown:    0x00002000,
        leftmousehold:      0x00004000,
        rightmousehold:     0x00008000,
        middlemousehold:    0x00010000,
        leftmouseup:        0x00020000,
        rightmouseup:       0x00040000,
        middlemouseup:      0x00080000,
        keydown:            0x00100000,
        keypress:           0x00200000,
        keyup:              0x00400000
    };
//------------------------------------------------------------------------------
    mouseTriggers = {
        all: $.button.triggers.click |
            $.button.triggers.doubleclick |
            $.button.triggers.mousedown |
            $.button.triggers.mousehold |
            $.button.triggers.mouseup,
        '1': $.button.triggers.leftclick |
            $.button.triggers.leftdoubleclick |
            $.button.triggers.leftmousedown |
            $.button.triggers.leftmousehold |
            $.button.triggers.leftmouseup,
        '2': $.button.triggers.middleclick |
            $.button.triggers.middledoubleclick |
            $.button.triggers.middlemousedown |
            $.button.triggers.middlemousehold |
            $.button.triggers.middlemouseup,
        '3': $.button.triggers.rightclick |
            $.button.triggers.rightdoubleclick |
            $.button.triggers.rightmousedown |
            $.button.triggers.rightmousehold |
            $.button.triggers.rightmouseup
    };
    keyTriggers =
        $.button.triggers.keydown |
        $.button.triggers.keypress |
        $.button.triggers.keyup;
//------------------------------------------------------------------------------
    $[widget].prototype = {
        //the widget's state classes
        _classes: {
            disabled:   'is-disabled',
            enabled:    'is-enabled',
            focused:    'is-focused',
            blurred:    'is-blurred',
            over:       'is-over',
            out:        'is-out',
            up:         'is-up',
            down:       'is-down'
        },
        //the widget's default options
        _options: {
            disabled: false,
            keys: [13, 32],
            tabindex: true,
            triggers: 0x00200001 //click and keypress
        },
        _mousepressed: false,
        _mouseover: false,
        _keypressed: false,
        //accessor for _options
        _getOption: function (key) {
            return this._options[key];
        },
        //mutator for _options
        _setOption: function (key, value) {
            var options,
                self;
            self = this;
            options = this._options;
            switch (key) {
            case 'disabled':
                value = !!value;
                if (value) {
                    this.disable();
                } else {
                    this.enable();
                }
                break;
            case 'tabindex':
                //validate value is correct
                if (value === true || value === false) {
                    value = value ? 0 : -1;
                }
                //cast value to number
                value = +value;
                if (value < -1) {
                    value = -1;
                }
                this._element.attr('tabindex', options.disabled ? -1 : value);
                break;
            case 'keys':
                this._keys = {};
                if (!$.isArray(value)) {
                    value = (''+value).split(' ');
                }
                $.each(value, function (i, key) {
                    self._keys[key] = true;
                });
                break;
            default:
                //by default, do nothing
                break;
            }
            options[key] = value;
        },
        //_create called when the widget is first instantiated
        //_options have not yet been set
        _create: function () {
            var c,
                element,
                focused;
            c = this._classes;
            element = this._element;
            focused = element.is(':focus');
            this._original = {
                'aria-disabled':    this._element.attr('aria-disabled'),
                'disabled':         this._element.attr('disabled'),
                'role':             this._element.attr('role'),
                'tabindex':         this._element.attr('tabindex')
            };
            element.attr({
                'role': widget,
                'tabindex': 0
            }).on({
                'click.button':         $.proxy(this, '_clickHandler'),
                'dblclick.button':      $.proxy(this, '_dblclickHandler'),
                'mousedown.button':     $.proxy(this, '_mousedownHandler'),
                'mouseup.button':       $.proxy(this, '_mouseupHandler'),
                'focus.button':         $.proxy(this, '_focusHandler'),
                'blur.button':          $.proxy(this, '_blurHandler'),
                'mouseenter.button':    $.proxy(this, '_mouseenterHandler'),
                'mouseleave.button':    $.proxy(this, '_mouseleaveHandler'),
                'keydown.button':       $.proxy(this, '_keydownHandler'),
                'keyup.button':         $.proxy(this, '_keyupHandler'),
                'keypress.button':      $.proxy(this, '_keypressHandler')
            }).addClass(c.out)
                .addClass(c.up)
                .toggleClass(c.focused, focused)
                .toggleClass(c.blurred, !focused);
            $(document).on({
                'mouseup.button':   $.proxy(this, '_documentMouseupHandler'),
                'keyup.button':     $.proxy(this, '_documentKeyupHandler')
            });
        },
        //_init called as the constructor,
        //or any time the widget is called with no arguments
        //_options have been set
        _init: function () {
            var options;
            options = this._options;
            this._element.attr({
                'tabindex': options.disabled ? -1 : options.tabindex
            });
        },
        //destroy is the destructor method
        //remove all attributes, classes, object references, and bound events
        destroy: function () {
            var attr,
                attrVal,
                element,
                original,
                classes,
                classList;
            element = this._element;
            original = this._original;
            classes = this._classes;
            
            //revert to original attribute values
            for (attr in original) {
                attrVal = original[attr];
                if (attrVal === undefined) {
                    attrVal = null;
                }
                element.attr(attr, attrVal);
            }
            
            //remove classes
            classList = [];
            for (key in classes) {
                classList.push(classes[key]);
            }
            element.removeClass(classList.join(' '));
            
            //end timeouts and intervals
            clearTimeout(this._holdTimeout);
            clearInterval(this._holdInterval);
            
            //unbind events
            element.off('.button');
            $(document).off({
                'mouseup.button':   this._documentMouseupHandler,
                'keyup.button':     this._documentKeyupHandler
            });
            //remove the widget reference
            delete element.data()[widget];
        },
        enable: function () {
            var element,
                options,
                classes;
            element = this._element;
            options = this._options;
            classes = this._classes;
            element.attr({
                'aria-disabled': 'false',
                'disabled': null,
                'tabindex': options.tabindex
            }).addClass(classes.enabled)
                .removeClass(classes.disabled);
        },
        disable: function () {
            var element,
                classes;
            element = this._element;
            classes = this._classes;
            element.attr({
                'aria-disabled': 'true',
                'disabled': 'disabled',
                'tabindex': -1
            }).addClass(classes.disabled)
                .removeClass(classes.enabled);
        },
        options: function (optionsMap) {
            var key,
                value;
            for (key in optionsMap) {
                if (optionsMap.hasOwnProperty(key)) {
                    value = optionsMap[key];
                    this.option(key, value);
                }
            }
        },
        option: function (key, value) {
            switch (arguments.length) {
            case 1:
                return this._getOption(key);
            case 2:
                this._setOption(key, value);
                break;
            }
        },
        widget: function () {
            return this._element;
        },
        startpress: function () {
            var element,
                classes;
            element = this._element;
            classes = this._classes;
            element.addClass(classes.down).removeClass(classes.up);
        },
        press: function () {
            this._element.trigger('buttonpress');
        },
        endpress: function () {
            var element,
                classes;
            element = this._element;
            classes = this._classes;
            element.addClass(classes.up).removeClass(classes.down);
        },
        _mouseTriggersEvent: function (mousebutton, event) {
            var triggers;
            triggers = this._options.triggers;
            switch (arguments.length) {
            case 1:
                if ((triggers & mouseTriggers.all) ||
                    (triggers & mouseTriggers[mousebutton])) {
                    return true;
                }
                return false;
            case 2:
            default:
                if ((triggers & $.button.triggers[event]) ||
                    (mousebutton === 1 && (triggers & $.button.triggers['left' + event])) ||
                    (mousebutton === 2 && (triggers & $.button.triggers['middle' + event])) ||
                    (mousebutton === 3 && (triggers & $.button.triggers['right' + event]))) {
                    return true;
                }
                return false;
            }
        },
        _keyTriggersEvent: function (key, event) {
            var triggers,
                keys;
            triggers = this._options.triggers;
            keys = this._keys;
            switch (arguments.length) {
            case 1:
                //check if key is in keys
                //check if triggers is one of <key event types>
                if (keys[key] && (triggers & keyTriggers)) {
                    return true;
                }
                return false;
            case 2:
            default:
                //check if key is in keys
                //check if triggers is $.button.triggers[event]
                if (keys[key] && (triggers & $.button.triggers[event])) {
                    return true;
                }
                return false;
            }
        },
        _clickHandler: function (e) {
            if (this._mouseTriggersEvent(e.which, 'click')) {
                this.press();
            }
        },
        _dblclickHandler: function (e) {
            if (this._mouseTriggersEvent(e.which, 'doubleclick')) {
                this.press();
            }
        },
        _mousedownHandler: function (e) {
            if (this._mouseTriggersEvent(e.which)) {
                this.startpress();
                this._mousepressed = true;
            }
            if (this._mouseTriggersEvent(e.which, 'mousedown')) {
                this.press();
            }
            if (this._mouseTriggersEvent(e.which, 'mousehold')) {
                this.press();
                this._holdTimeout = setTimeout($.proxy(this, '_holdTimeoutCallback'), 200);
                //start timeout for 200ms
                //timeout will start interval which will fire every 50ms
                //triggering press
            }
        },
        _mouseupHandler: function (e) {
            if (this._mouseTriggersEvent(e.which, 'mouseup')) {
                this.press();
            }
        },
        _focusHandler: function (e) {
            var classes;
            classes = this._classes;
            this._element.addClass(classes.focused).removeClass(classes.blurred);
        },
        _blurHandler: function (e) {
            var classes;
            classes = this._classes;
            this._element.addClass(classes.blurred).removeClass(classes.focused);
        },
        _mouseenterHandler: function (e) {
            var classes;
            classes = this._classes;
            this._element.addClass(classes.over).removeClass(classes.out);
            this._mouseover = true;
            if (this._mousepressed) {
                this.startpress();
            }
        },
        _mouseleaveHandler: function (e) {
            var classes;
            classes = this._classes;
            this._element.addClass(classes.out).removeClass(classes.over);
            this._mouseover = false;
            if (this._mousepressed) {
                this.endpress();
            }
        },
        _keydownHandler: function (e) {
            if (this._keyTriggersEvent(e.which)) {
                this.startpress();
                this._keypressed = true;
            }
            if (this._keyTriggersEvent(e.which, 'keydown')) {
                this.press();
            }
        },
        _keyupHandler: function (e) {
            if (this._keyTriggersEvent(e.which, 'keyup')) {
                this.press();
            }
        },
        _keypressHandler: function (e) {
            if (this._keyTriggersEvent(e.which, 'keypress')) {
                this.press();
            }
        },
        _documentMouseupHandler: function (e) {
            if (this._mouseTriggersEvent(e.which)) {
                this.endpress();
                this._mousepressed = false;
            }
            clearTimeout(this._holdTimeout);
            clearInterval(this._holdInterval);
        },
        _documentKeyupHandler: function (e) {
            if (this._keyTriggersEvent(e.which)) {
                this.endpress();
                this._keypressed = false;
            }
        },
        _holdTimeoutCallback: function (e) {
            this._holdInterval = setInterval($.proxy(this, '_holdIntervalCallback'), 50);
        },
        _holdIntervalCallback: function (e) {
            if (this._mouseover) {
                this.press();
            }
        }
    };
//------------------------------------------------------------------------------
    //Lib Functions
    //check whether arg is a string. Works for both string literal instances and String objects.
    function isString(arg) {
        return Object.prototype.toString.call(arg) === '[object String]';
    }
    //declare an assertion
    function assert(assertion, message) {
        if (window.console && console.assert) {
            console.assert(assertion, message);
        }
    }
//------------------------------------------------------------------------------
    /**
     * Initializer
     * obj opts?
     * 
     * Method caller
     * str fnName, ...params?
     */
    $.fn[widget] = function () {
        var args,
            ret;
        //store the arguments passed to $.fn[widget] for use with every element in the selection
        args = Array.prototype.slice.call(arguments);
        this.each(function (index, element) {
            var $this,
                fnName,
                options,
                wgt,
                fn;
            $this = $(this);
            //wgt is the Widget instance
            wgt = $this.data(widget);
            if (wgt) {
                if (args.length) {
                    //widget was previously instantiated
                    //the first argument must be the method name to call
                    fnName = args[0];
                    
                    //a couple assertions for debugging
                    assert(isString(fnName), 'The first parameter of "$.fn.' + widget + '" must be a string.');
                    assert(fnName in wgt, '"$.fn.' + widget + '" does not contain a "' + fnName + '" function.');
                    
                    //check whether the method begins with "_"
                    //variables prefixed with "_" are considered "private" and not accessible in this manner
                    //regexp used so that developers can define a custom "private" prefix
                    if (/^_/.test(fnName)) {
                        throw new Error('"' + fnName + '" begins with an underscore. Functions beginning with "_" are considered private and not accessible.');
                    }
                    
                    //check whether the method actually exists on the Widget instance
                    //you can't call methods that don't exist
                    if (!(fnName in wgt)) {
                        throw new Error('"' + fnName + '" does not exist in "$.fn.' + widget + '".');
                    }
                    
                    fn = wgt[fnName];
                    //check whether the method is actually a function
                    //you can only call functions
                    if ($.isFunction(fn)) {
                        //stores the return value for the first element only
                        if (!index) {
                            ret = fn.apply(wgt, args.slice(1));
                        } else {
                            fn.apply(wgt, args.slice(1));
                        }
                    } else {
                        //optionally this could be an accessor/mutator for "public" variables
                        //throw new Error('"' + fnName + '" is not a function.');
                        switch (args.length) {
                        case 1:
                            ret = !index ? fn : ret;
                            break;
                        case 2:
                        default:
                            wgt[fnName] = args[1];
                            break;
                        }
                    }
                } else {
                    wgt._init();
                }
            } else {
                //TODO: add check to prevent initialization on a method call
                //Widget didn't exist, so create a new instance
                options = args[0] || {};
                wgt = new $[widget](element, options);
                $this.data(widget, wgt);
                wgt._init();
            }
        });
        //if the return value was set, return that, otherwise $.fn[widget] is chainable
        return ret !== undefined ? ret : this;
    };
//------------------------------------------------------------------------------
    //store the widget.options reference in a publicly accessible location
    //so that the default options can be easily changed during runtime
    //comment out to keep default options private
    $[widget].options = $[widget].prototype._options;
//------------------------------------------------------------------------------
    $.expr[':'][widget] = function (element, index, matches) {
        return $(element).data(widget) instanceof $[widget];
    };
}(jQuery));