var portal = portal || {};
portal.EventBus = portal.EventBus || {};
(function(exports) {

    var inBrowserBus = _.extend({}, Backbone.Events);

    function userNotification(hash) {
        $.notify(hash.message, hash.notifcationType);

        //$('#mainNavBar').notify(hash.message, {
        //    clickToHide: true,
        //    autoHide: true,
        //    autoHideDelay: 5000,
        //    arrowShow: false,
        //    arrowSize: 5,
        //    elementPosition: 'bottom right',
        //    globalPosition: 'top right',
        //    style: 'bootstrap',
        //    className: hash.notifcationType,
        //    showAnimation: 'slideDown',
        //    showDuration: 400,
        //    hideAnimation: 'slideUp',
        //    hideDuration: 200,
        //    gap: 2
        //});
    }

    function publishClientOnly(channel, payload) {
        inBrowserBus.trigger(channel, payload);
    }

    function publishServerOnly(channel, payload) {
        portal.Socket.tell({
            topic: "/portal/topics/eventbus",
            payload: {
                command: 'publish',
                channel: channel,
                payload: payload
            }
        });
    }

    function publish() {
        publishServerOnly();
        publishClientOnly();
    }

    function on(channel, callback) {
        inBrowserBus.on(channel, callback);
    }

    exports.userNotification = userNotification;
    exports.publish = publish;
    exports.publishClientOnly = publishClientOnly;
    exports.publishServerOnly = publishServerOnly;
    exports.on = on;
})(portal.EventBus);