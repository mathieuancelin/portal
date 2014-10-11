var portal = portal || {};
portal.Structure = portal.Structure || {};
(function(exports) {
    function subPages() {
        return portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'subPages',
                from: portal.Location.current._id
            }
        });
    }
    exports.subPages = subPages;
})(portal.Structure);