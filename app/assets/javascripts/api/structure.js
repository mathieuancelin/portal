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
    function createPage(page) {
        return portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'addPage',
                from: portal.Location.current._id,
                page: page
            }
        });
    }
    function moveMashete(masheteId, previous, current) {
        return portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'moveMashete',
                from: portal.Location.current._id,
                id: masheteId,
                previous: previous,
                current: current
            }
        });
    }
    function getAllRoles() {
        return portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'allRoles'
            }
        });
    }
    exports.subPages = subPages;
    exports.createPage = createPage;
    exports.moveMashete = moveMashete;
    exports.getAllRoles = getAllRoles;
})(portal.Structure);