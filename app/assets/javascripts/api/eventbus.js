var portal = portal || {};
portal.EventBus = portal.EventBus || {};
(function(exports) {

    var inBrowserBus = _.extend({}, Backbone.Events);

    function publishClientOnly(channel, payload) {
        inBrowserBus.trigger(channel, payload);
    }

    function broadcast(channel, payload) {
        portal.Socket.tell({
            topic: "/portal/topics/eventbus",
            payload: {
                command: 'broadcast',
                channel: channel,
                payload: payload
            }
        });
    }

    function publish(channel, payload) {
        portal.Socket.tell({
            topic: "/portal/topics/eventbus",
            payload: {
                command: 'publish',
                channel: channel,
                payload: payload
            }
        });
    }

    function on(channel, callback) {
        if (_.isRegExp(channel)) {
            inBrowserBus.on('all', function(cha, event) {
                if (cha.match(channel)) {
                    callback(event);
                }
            });
        } else {
            inBrowserBus.on(channel, callback);
        }
    }

    function predicateFilterFunction(predicate, funct) {
        return function(something) {
            if (predicate(something)) {
                funct(something);
            }
        };
    }

    exports.User = {
        publish: publish
    };
    exports.Browser = {
        publish: publishClientOnly
    };
    exports.Broadcast = {
        publish: broadcast
    };
    exports.on = on;
    exports.filter = predicateFilterFunction;
})(portal.EventBus);