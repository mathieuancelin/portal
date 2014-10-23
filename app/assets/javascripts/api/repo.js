var portal = portal || {};
portal.Repository = portal.Repository || {};
(function(exports) {
    function deleteAll() {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "deleteAll"
            }
        });
    }
    function findById(id) {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "findById",
                _id: id
            }
        });
    }
    function findAll() {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "findAll"
            }
        });
    }
    function search(query) {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "search",
                query: query
            }
        });
    }
    function remove(id) {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "delete",
                _id: id
            }
        });
    }
    function removeSelection(query) {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "deleteSelection",
                query: query
            }
        });
    }
    function save(doc) {
        return portal.Socket.ask({
            topic: "/portal/topics/repo",
            payload: {
                command: "save",
                doc: doc
            }
        });
    }
    exports.deleteAll = deleteAll;
    exports.findById  = findById;
    exports.findAll   = findAll;
    exports.search    = search;
    exports.remove    = remove;
    exports.save      = save;
    exports.removeSelection      = removeSelection;
})(portal.Repository);