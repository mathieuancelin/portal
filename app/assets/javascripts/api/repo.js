var portal = portal || {};
portal.Repository = portal.Repository || {};
// TODO : filter by doc type
(function(exports) {

    exports.of = function(sandbox) {
        function deleteAll() {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "deleteAll",
                    __sandbox: sandbox
                }
            });
        }
        function findById(id) {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "findById",
                    _id: id,
                    __sandbox: sandbox
                }
            });
        }
        function findAll() {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "findAll",
                    __sandbox: sandbox
                }
            });
        }
        function search(query) {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "search",
                    query: query,
                    __sandbox: sandbox
                }
            });
        }
        function remove(id) {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "delete",
                    _id: id,
                    __sandbox: sandbox
                }
            });
        }
        function removeSelection(query) {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "deleteSelection",
                    query: query,
                    __sandbox: sandbox
                }
            });
        }
        function save(doc) {
            return portal.Socket.ask({
                topic: "/portal/topics/repo",
                payload: {
                    command: "save",
                    doc: doc,
                    __sandbox: sandbox
                }
            });
        }
        var publicAPI = {};
        publicAPI.deleteAll = deleteAll;
        publicAPI.findById  = findById;
        publicAPI.findAll   = findAll;
        publicAPI.search    = search;
        publicAPI.remove    = remove;
        publicAPI.save      = save;
        publicAPI.removeSelection      = removeSelection;
        return publicAPI;
    };
})(portal.Repository);