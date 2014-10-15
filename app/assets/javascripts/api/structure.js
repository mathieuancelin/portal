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
        page = {
            name: "My New Page yeah !!!",
            description: "A dynamically created page",
            url: "newpage",
            accessibleByIds: ["USER", "WRITER", "ANONYMOUS", "ADMINISTRATOR"]
        };
        return portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'addPage',
                from: portal.Location.current._id,
                page: page
            }
        });
    }
    exports.subPages = subPages;
    exports.createPage = createPage;
})(portal.Structure);