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
    widget = {
        //the name to call the widget
        name: 'widget',
        //the widget's default options
        options: {
            foo: 'bar'
        },
        //uncomment to use _getOption as option accessor
        //_getOption: function (key) {},
        //uncomment to use _setOption as option mutator
        //_setOption: function (key, value) {},
        //_create called when the widget is first instantiated
        _create: function () {
        },
        //_init called any time the widget is called with no arguments
        _init: function () {
        },
        _destroy: function () {
        }
    };
//------------------------------------------------------------------------------
    //check whether arg is a string. Works for both string literal instances and String objects.
    function isString(arg) {
        return Object.prototype.toString.call(arg) === '[object String]';
    }
//------------------------------------------------------------------------------
    function Widget(element, options) {
        //save the element reference on the instance
        this._element = $(element);
        //save a copy of the options on the instance
        this._options = $.extend({}, Widget.prototype.options, options);
        //create a bulk options mutator
        this.options = function (optionsMap) {
            var key,
                value;
            for (key in optionsMap) {
                if (optionsMap.hasOwnProperty(key)) {
                    value = optionsMap[key];
                    this.option(key, value);
                }
            }
        };
        //single option accessor/mutator
        //calls _getOption & _setOption if they've been set on the prototype
        this.option = function (key, value) {
            switch (arguments.length) {
            case 1:
                if ('_getOption' in this) {
                    value = this._getOption(key);
                } else {
                    value = this._options[key];
                }
                return value;
            case 2:
                if ('_setOption' in this) {
                    this._setOption(key, value);
                } else {
                    this._options[key] = value;
                }
                break;
            }
        };
        this.widget = function () {
            return this._element;
        };
        //Widget destructor
        //calls _destroy if it was set on the prototype
        this.destroy = function () {
            if ('_destroy' in this) {
                this._destroy();
            }
            delete $(element).data()[widget.name];
        };
        //call _create if it was set on the prototype
        if ('_create' in this) {
            this._create();
        }
    }
    Widget.prototype = widget;
//------------------------------------------------------------------------------
    /**
     * Initializer
     * obj opts?
     * 
     * Method caller
     * str fnName, ...params?
     */
    $.fn[widget.name] = function () {
        var args,
            ret;
        //store the arguments passed to $.fn[widget.name] for use with every element in the selection
        args = Array.prototype.slice.call(arguments);
        this.each(function (index, element) {
            var $this,
                fnName,
                options,
                wgt,
                fn;
            $this = $(this);
            //wgt is the Widget instance
            wgt = $this.data(widget.name);
            if (wgt) {
                if (args.length) {
                    //widget was previously instantiated
                    //the first argument must be the method name to call
                    fnName = args[0];
                    if (window.console) {
                        console.assert(isString(fnName), 'The first parameter of "$.fn.' + widget.name + '" must be a string.');
                        console.assert(fnName in wgt, '"$.fn.' + widget.name + '" does not contain a "' + fnName + '" function.');
                    }
                    
                    //check whether the method begins with "_"
                    //variables prefixed with "_" are considered "private" and not accessible in this manner
                    if (/^[^_]/.test(fnName)) {
                        //check whether the method actually exists on the Widget instance
                        //you can't call methods that don't exist
                        if (fnName in wgt) {
                            fn = wgt[fnName];
                            //check whether the method is actually a function
                            //you can only call functions
                            if ($.isFunction(fn)) {
                                //stores the return value for the first element only
                                ret = !index ? fn.apply(wgt, args.slice(1)) : ret;
                            } else {
                                //optionally this could be an accessor/mutator for "public" variables
                                throw new Error('"' + fnName + '" is not a function.');
                            }
                        } else {
                            throw new Error('"' + fnName + '" does not exist in "$.fn.' + widget.name + '".');
                        }
                    } else {
                        throw new Error('"' + fnName + '" begins with an underscore. Functions beginning with "_" are considered private and not accessible.');
                    }
                } else {
                    if ('_init' in wgt) {
                        wgt._init();
                    }
                }
            } else {
                //TODO: add check to prevent initialization on a method call
                //Widget didn't exist, so create a new instance
                options = args[0] || {};
                wgt = new Widget(element, options);
                $this.data(widget.name, wgt);
                if ('_init' in wgt) {
                    wgt._init();
                }
            }
        });
        //if the return value was set, return that, otherwise $.fn[widget.name] is chainable
        return ret !== undefined ? ret : this;
    };
//------------------------------------------------------------------------------
    //store the widget.options reference in a publicly accessible location
    //so that the default options can be changed during runtime
    //comment out to keep default options private
    $.fn[widget.name].options = widget.options;
//------------------------------------------------------------------------------
    //uncomment to use $(':' + widget.name) expressions
    //$.expr[':'][widget.name] = function (element, index, matches) {};
//------------------------------------------------------------------------------
    //uncomment to use $[widget.name]()
    //$[widget.name] = function () {};
}(jQuery));