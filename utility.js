(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['lodash'], factory);
    } else if (typeof module === "object" && module.exports) {
        var lodash = require('lodash');
        module.exports = factory(lodash);
    } else {
        root.Utility = factory(_);
    }
}(this, function(lodash) {

    var Utility = {};

    var callback = Utility.Callback = function() {
        this.callbacks = [];
        this.isExecuted = false;
        this.args = [];
    };

    callback.prototype.run = function() {

        var args = [arguments];
        this.args.push(arguments);

        lodash.each(this.callbacks, function(callback) {
            runCallback(callback, args)
        });
    };

    var runCallback = function(callback, args) {
        if (lodash.isFunction(callback)) {
            lodash.each(args, function(arg) {
                callback.apply(null, arg);
            })
        }
    }

    callback.prototype.add = function(callback) {
        this.callbacks.push(callback);
        this.args.length > 0 && runCallback(callback, this.args);
    };

    var Model = Utility.Model = function(attributes, options) {
        this.attributes = attributes || {};
        this.watches = {};
        this.options = options;
    }

    var ModelPrototype = Model.prototype;

    ModelPrototype.get = function(path) {
        if (lodash.isString(path)) {
            return lodash.get(this.attributes, path);
        } else {
            return this.attributes;
        }
    }

    ModelPrototype.set = function(path, value, options) {
        if (lodash.isString(path) && arguments.length > 1) {
            lodash.set(this.attributes, path, value);
            this.trigger(path, options);
        } else if (arguments.length == 1) {
            this.attributes = path;
        }
    }

    ModelPrototype.trigger = function(path, options) {
        var that = this;
        if (arguments.length == 0 ||
            (lodash.isPlainObject(path) && path.propagateToChildren == true)) {
            lodash.each(this.watches, function(watch) {
                var value = that.get(watch.path);
                watch.callback(value);
            })
        }
        var value = this.get(path);
        lodash.each(this.watches, function(watch) {
            if (watch.path == path) {
                watch.callback(value);
            }
        });
        if (!options || options.propagateToParent == true) {
            var propList = path.split('.');
            propList.pop();
            if (propList.length > 0) {
                var propName = propList.join('.');
                this.trigger(propName, {
                    propagateToParent: true,
                    propagateToChildren: false,
                });
            }
        }
        if (!options || options.propagateToChildren == true) {
            if (lodash.isArray(value)) {
                lodash.each(value, function(v, i) {
                    that.trigger(path + '[' + i + ']', {
                        propagateToParent: false,
                        propagateToChildren: true
                    });
                })
            } else if (lodash.isPlainObject(value)) {
                lodash.each(value, function(v, k) {
                    that.trigger(path + '.' + k, {
                        propagateToParent: false,
                        propagateToChildren: true
                    });
                })
            }
        }
    }

    ModelPrototype.watch = function(path, callback) {
        var id = lodash.uniqueId('watch-');

        this.watches[id] = {
            path: path,
            callback: callback
        }

        return id;
    }

    ModelPrototype.unwatch = function(id) {
        var watches = this.watches,
            watch = watches[id];
        if (arguments.length > 0) {
            if (watch) {
                deleteModelWatch(watch, id, watches);
            } else {
                var path = id;
                lodash.each(watches, function(watch, id) {
                    if (watch.path == path) {
                        deleteModelWatch(watch, id, watches);
                    }
                });
            }
        } else {
            lodash.each(watches, function(watch, id) {
                deleteModelWatch(watch, id, watches);
            });
        }
        return this;
    }

    var deleteModelWatch = function(watch, id, watches) {
        delete watch.path;
        delete watch.callback;
        delete watches[id];
    }

    Model.registerAjaxCallback = function(callback) {
        Model.ajaxCallback = callback;
    }

    var executeAjax = function(options) {
        Model.ajaxCallback(options);
    };

    var fineTuneOptions = function(options, settings) {

        var model = settings.model;

        options.method = options.method || settings.method;
        options.data = options.data || model.attributes;
        options.data = JSON.stringify(options.data);

        options.url = options.url || model.url;
        if (settings.isById == true) {
            options.url += '/' + (model.idAttribute ? model.get(model.idAttribute) : model.get('id'));
        }

        return options;
    }

    ModelPrototype.fetch = function(options) {
        fineTuneOptions(options, {
            method: 'get',
            model: this,
            isById: false
        });


    }

    return Utility;
}));
