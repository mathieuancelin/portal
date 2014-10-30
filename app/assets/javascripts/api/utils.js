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
})(portal.Utils);

/**
 * Usage :
 * ======
 *
 * portal.EventBus.on(portal.Url.HashChangeEvent, function(url) {
     *     if (url.startsWith('/name/')) {
     *         var params = portal.Url.extractParams('/name/$0/age/$1/surname/$2');
     *         var name = params[0];
     *         var age = params[1];
     *         var surname = params[2];
     *         this.setState({
     *             displayedText: surname + ' ' + name + ' is ' + age + ' old'
     *         });
     *     }
     *  }.bind(this))
 *
 * portal.Url.navigateTo('/name/Doe/age/42/surname/billy');
 *
 */
portal.Url = portal.Url || {};
(function(exports) {

    var HashChangeEvent = "___HASH_CHANGED_EVENT";

    function navigateTo(url) {
        location.hash = "#" + url.replace('#', '');
    }

    function extractParams(mask) {
        var ret = [];
        var hash = location.hash.replace("#", "");
        var partsLen = mask.split('$').length - 1;
        var current = hash;
        for (var i = 0; i < partsLen; i++) {
            var idx = mask.indexOf('$' + i);
            var part2 = mask.split('$' + i)[1];
            mask = part2;
            var stop = part2.substr(0, part2.indexOf('$'));
            var idx2 = current.indexOf(stop);
            var tmp = current.substring(idx, idx2);
            if (idx2 < idx) {
                tmp = current.substr(idx);
            }
            current = current.substr(idx2);
            ret.push(tmp);
        }
        return ret;
    }
    function extractParam(mask) {
        var hash = location.hash.replace("#", "");
        var parts = mask.split('$0');
        var tmp = hash;
        for (var j = 0; j < parts.length; j++) {
            tmp = tmp.replace(parts[j], '');
        }
        return tmp;
    }

    function queryParam(key) {
        var m, r, re;
        re = new RegExp("(?:\\?|&)" + key + "=(.*?)(?=&|$)", "gi");
        r = [];
        m = void 0;
        while ((m = re.exec(document.location.search)) != null) {
            r.push(m[1]);
        }
        if (r.length > 0) {
            return r[0];
        } else {
            return undefined;
        }
    }

    $(window).bind("hashchange", function() {
        portal.EventBus.Browser.publish(HashChangeEvent, location.hash.replace("#", ""));
    });

    exports.queryParam = queryParam;
    exports.navigateTo = navigateTo;
    exports.extractParams = extractParams;
    exports.extractParam = extractParam;
    exports.HashChangeEvent = HashChangeEvent
})(portal.Url);