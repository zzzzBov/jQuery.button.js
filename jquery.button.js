/**
 * A stand-alone widget template
 * no dependencies other than jQuery
 * 
 * Author: zzzzBov
 * Version: dev
 */
(function ($, undefined) {
    "use strict";
    var widget;
    widget = 'widget';
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
    $[widget].prototype = {
        //the widget's default options
        _options: {
            disabled: false
        },
        //accessor for _options
        _getOption: function (key) {
            return this._options[key];
        },
        //mutator for _options
        _setOption: function (key, value) {
            switch (key) {
            case 'disabled':
                if (value) {
                    this.disable();
                } else {
                    this.enable();
                }
                break;
            default:
                this._options[key] = value;
                break;
            }
        },
        //_create called when the widget is first instantiated
        //_options have not yet been set
        _create: function () {
            this._original = {
                'aria-disabled':    this._element.attr('aria-disabled'),
                'disabled':         this._element.attr('disabled'),
                'role':             this._element.attr('role'),
                'tabindex':         this._element.attr('tabindex')
            };
            this._element.attr({
                'role': widget,
                'tabindex': 0
            });
        },
        //_init called as the constructor,
        //or any time the widget is called with no arguments
        //_options have been set
        _init: function () {
        },
        //destroy is the destructor method
        //remove all attributes, classes, object references, and bound events
        destroy: function () {
            var attr,
                attrVal;
            //revert to original attribute values
            for (attr in this._original) {
                attrVal = this._original[attr];
                if (attrVal === undefined) {
                    attrVal = null;
                }
                this._element.attr(attr, attrVal);
            }
            //remove the widget reference
            delete this._element.data()[widget];
        },
        enable: function () {
            this._element.attr({
                'aria-disabled': 'false',
                'disabled': null
            });
            this._options.disabled = false;
        },
        disable: function () {
            this._element.attr({
                'aria-disabled': 'true',
                'disabled': 'disabled'
            });
            this._options.disabled = true;
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