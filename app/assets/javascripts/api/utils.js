var portal = portal || {};
portal.Utils = portal.Utils || {};
(function(exports) {
    function generateUUID() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    }
    function userNotification(hash) {
        $.notify(hash.message, hash.notifcationType);
    }
    function keyMirror(obj) {
        var ret = {};
        var key;
        if (!(obj instanceof Object && !Array.isArray(obj))) {
            throw new Error('keyMirror(...): Argument must be an object.');
        }
        for (key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            ret[key] = key;
        }
        return ret;
    }
    function invariant(condition, message, a, b, c, d, e, f) {
        if (!condition) {
            var args = [a, b, c, d, e, f];
            var argIndex = 0;
            throw new Error("Violation : " + message.replace(/%s/g, function() { return args[argIndex++]; }));
        }
    }
    function createDispatcher(over) {

        var _lastID = 1;
        var _prefix = 'ID_';

        var _callbacks = {};
        var _isPending = {};
        var _isHandled = {};
        var _isDispatching = false;
        var _pendingPayload = null;

        function register(callback) {
            var id = _prefix + _lastID++;
            _callbacks[id] = callback;
            return id;
        }

        function unregister(id) {
            invariant(
                _callbacks[id],
                'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
                id
            );
            delete _callbacks[id];
        }

        function waitFor(ids) {
            invariant(
                _isDispatching,
                'Dispatcher.waitFor(...): Must be invoked while dispatching.'
            );
            for (var ii = 0; ii < ids.length; ii++) {
                var id = ids[ii];
                if (_isPending[id]) {
                    invariant(
                        _isHandled[id],
                            'Dispatcher.waitFor(...): Circular dependency detected while ' +
                            'waiting for `%s`.',
                        id
                    );
                    continue;
                }
                invariant(
                    _callbacks[id],
                    'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
                    id
                );
                _invokeCallback(id);
            }
        }

        function dispatch(payload) {
            invariant(
                !_isDispatching,
                'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
            );
            _startDispatching(payload);
            try {
                for (var id in _callbacks) {
                    if (_isPending[id]) {
                        continue;
                    }
                    _invokeCallback(id);
                }
            } finally {
                _stopDispatching();
            }
        }

        function isDispatching() {
            return _isDispatching;
        }

        function _invokeCallback(id) {
            _isPending[id] = true;
            _callbacks[id](_pendingPayload);
            _isHandled[id] = true;
        }

        function _startDispatching(payload) {
            for (var id in _callbacks) {
                _isPending[id] = false;
                _isHandled[id] = false;
            }
            _pendingPayload = payload;
            _isDispatching = true;
        }

        function _stopDispatching() {
            _pendingPayload = null;
            _isDispatching = false;
        }
        var api = {
            trigger: function(a, b) {
                if (!b) {
                    return dispatch(a);
                } else {
                    return dispatch(b);
                }
            },
            dispatch: dispatch,
            register: register,
            unregister: unregister,
            isDispatching: isDispatching,
            waitFor: waitFor,
            on: function(a, b) {
                if (!b) {
                    return register(a);
                } else {
                    return register(b);
                }
            },
            off: function(a, b) {
                if (!b) {
                    return unregister(a);
                } else {
                    return unregister(b);
                }
            }
        };
        if (over) {
            return _.extend(over, api);
        } else {
            return api;
        }
    }
    exports.invariant = invariant;
    exports.clientNotification = userNotification;
    exports.generateUUID = generateUUID;
    exports.keyMirror = keyMirror;
    exports.Dispatcher = createDispatcher;
})(portal.Utils);

/**
 * Usage :
 * ======
 *
 * portal.EventBus.on(portal.Url.HashChangeEvent, function(url) {
 *     if (url.startsWith('/name/')) {
 *         var params = portal.Url.extractParams('/name/$0/age/$1/surname/$2');
 *         var name = params[0];
 *         var age = params[1];
 *         var surname = params[2];
 *         this.setState({
 *             displayedText: surname + ' ' + name + ' is ' + age + ' old'
 *         });
 *     }
 *  }.bind(this))
 *
 * portal.Url.navigateTo('/name/Doe/age/42/surname/billy');
 *
 */
portal.Url = portal.Url || {};
(function(exports) {

    var HashChangeEvent = "___HASH_CHANGED_EVENT";

    function navigateTo(url) {
        location.hash = "#" + url.replace('#', '');
    }

    function extractParams(mask) {
        var ret = [];
        var hash = location.hash.replace("#", "");
        var partsLen = mask.split('$').length - 1;
        var current = hash;
        for (var i = 0; i < partsLen; i++) {
            var idx = mask.indexOf('$' + i);
            var part2 = mask.split('$' + i)[1];
            mask = part2;
            var stop = part2.substr(0, part2.indexOf('$'));
            var idx2 = current.indexOf(stop);
            var tmp = current.substring(idx, idx2);
            if (idx2 < idx) {
                tmp = current.substr(idx);
            }
            current = current.substr(idx2);
            ret.push(tmp);
        }
        return ret;
    }
    function extractParam(mask) {
        var hash = location.hash.replace("#", "");
        var parts = mask.split('$0');
        var tmp = hash;
        for (var j = 0; j < parts.length; j++) {
            tmp = tmp.replace(parts[j], '');
        }
        return tmp;
    }

    function queryParam(key) {
        var m, r, re;
        re = new RegExp("(?:\\?|&)" + key + "=(.*?)(?=&|$)", "gi");
        r = [];
        m = void 0;
        while ((m = re.exec(document.location.search)) != null) {
            r.push(m[1]);
        }
        if (r.length > 0) {
            return r[0];
        } else {
            return undefined;
        }
    }

    $(window).bind("hashchange", function() {
        portal.EventBus.Browser.publish(HashChangeEvent, location.hash.replace("#", ""));
    });

    exports.queryParam = queryParam;
    exports.navigateTo = navigateTo;
    exports.extractParams = extractParams;
    exports.extractParam = extractParam;
    exports.HashChangeEvent = HashChangeEvent;
})(portal.Url);