var portal = portal || {};
portal.Identity = portal.Identity || {};
(function(exports) {
    function whoAmI() {
        return portal.Socket.ask({
            topic: "/portal/topics/identity",
            payload: {
                command: "WHOAMI"
            }
        });
    }
    exports.whoAmI = whoAmI;
})(portal.Identity);