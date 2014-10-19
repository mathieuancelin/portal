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
    exports.clientNotification = userNotification;
    exports.generateUUID = generateUUID;
    // TODO : extract params from URL
    // TODO : hook into history API
    // TODO : history API hooks for mashetes
    // TODO : url management API for mashetes (with #)
})(portal.Utils);