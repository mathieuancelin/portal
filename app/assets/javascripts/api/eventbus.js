var portal = portal || {};
portal.EventBus = portal.EventBus || {};
(function(exports) {
    function notifyBrowser(hash) {
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
    exports.notifyBrowser = notifyBrowser;
})(portal.EventBus);