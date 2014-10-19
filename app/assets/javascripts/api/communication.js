var portal = portal || {};
portal.Location = portal.Location || {};
portal.User = portal.User || {};
portal.Socket = portal.Socket || {};
(function(exports) {

    var waitingQueue ={};
    var wsPromise = Q.defer();
    var correlationIdCounter = 0;
    var defaultOptions = {
        topic : '/portal/topics/default',
        timeout: 60000,
        payload: {}
    };

    var socket;
    var lastToken;

    function init() {

        function onMessage(event) {
            //console.trace('data received on user websocket : ' + event.data);
            var data = JSON.parse(event.data);
            if (data.firstConnection) {
                portal.Location.current = portal.Location.current || data.page;
                portal.User.current = portal.User.current || data.user;
                portal.User.current.isAdmin = function() {
                    return ! _.isUndefined(_.find(portal.User.current.roles, function(role) { return role === "ADMINISTRATOR"; }));
                };
                portal.User.current.isNotAdmin = function() {
                    return !portal.User.current.isAdmin();
                };
                lastToken = data.token;
                console.log("Successful first exchange");
                wsPromise.resolve({});
            } else if (data.response.__commandNotification) {
                portal.Utils.clientNotification(data.response.__commandNotification);
            } else if (data.response.__commandEventBus) {
                portal.EventBus.Browser.publish(data.response.__commandEventBus.channel, data.response.__commandEventBus.payload);
            } else if (data.correlationId) {
                lastToken = data.token;
                var correlationId = data.correlationId;
                if (!data.token) {
                    console.error('No token, WTF ???');
                }
                if (waitingQueue[correlationId]) {
                    var promise = waitingQueue[correlationId];
                    if (promise) {
                        if (data.response.__commandRedirect) {
                            promise.resolve({});
                            setTimeout(function() {
                                var url = window.location.protocol + "//" + window.location.host + data.response.__commandRedirect;
                                console.log( data.response.__commandRedirect);
                                console.log(url);
                                window.location.href = url;
                            }, 1);
                        } else {
                            promise.resolve(data.response);
                        }
                        delete waitingQueue[correlationId];
                    }
                } else {
                    console.error("Correlation " + correlationId + " not in waiting queue");
                }
            } else {
                console.error("Unknown message");
                console.log(data);
            }
        }

        function initSSE() {
            if (!wsPromise.promise.isFulfilled()) {
                var token = portal.Utils.generateUUID();
                var feed = new EventSource('/fallback/out/' + token);
                feed.onmessage = function (event) {
                    onMessage(event);
                };
                feed.onerror = function () {
                    wsPromise.reject(new Error("The SSE cannot be initialized"));
                    console.error("The SSE cannot be initialized");
                    initHttpFallback();
                };
                socket = {
                    send: function (message) {
                        $.ajax({
                            url: '/fallback/in/' + token,
                            contentType: 'text/plain',
                            data: message,
                            type: 'POST'
                        });
                    }
                };
                setTimeout(function () {
                    socket.send(JSON.stringify({
                        topic: "/portal/topics/default",
                        command: "first",
                        url: window.location.pathname
                    }));
                    console.log("Fallback SSE connection successful");
                }, 100);
            }
        }

        function initWebSocket() {
            if (!wsPromise.promise.isFulfilled()) {
                socket = new WebSocket("ws://" + location.host + "/ws");
                socket.onopen = function () {
                    socket.send(JSON.stringify({
                        topic: "/portal/topics/default",
                        command: "first",
                        url: window.location.pathname
                    }));
                    console.log("Websocket connection successful");
                };
                socket.onerror = function () {
                    console.error("The websocket cannot be initialized");
                    initSSE();
                };
                socket.onmessage = function (event) {
                    onMessage(event);
                };
            }
        }

        function initHttpFallback() {
            if (!wsPromise.promise.isFulfilled()) {
                var token = portal.Utils.generateUUID();
                socket = {
                    send: function (message) {
                        $.ajax({
                            url: '/fallback/http/' + token,
                            contentType: 'text/plain',
                            data: message,
                            type: 'POST',
                            success: function(data) {
                                onMessage({ data : JSON.stringify(data) });
                            },
                            error: function() {
                                var correlationId = JSON.parse(message);
                                var promise = waitingQueue[correlationId];
                                if (promise) {
                                    promise.reject("Http error");
                                    delete waitingQueue[correlationId];
                                }
                            }
                        });
                    }
                };
                socket.send(JSON.stringify({
                    topic: "/portal/topics/default",
                    command: "first",
                    url: window.location.pathname
                }));
                console.log("Http fallback connection successful");
            }
        }

        if (!wsPromise.promise.isFulfilled()) {
            initWebSocket();
            setTimeout(function () {
                initSSE();
            }, 1000);
        }

        return wsPromise.promise;
    }

    function ask(options) {
        var promise = Q.defer();
        var future = promise.promise;
        var opt = _.extend({}, defaultOptions, options);
        var correlationId = 'promise-' + (correlationIdCounter++);
        opt.correlationId = correlationId;
        opt.token = lastToken;
        waitingQueue[correlationId] = promise;
        var pl = JSON.stringify(opt);
        //console.trace('Data asked on user websocket ' + pl);
        socket.send(pl);
        setTimeout(function() {
            if (waitingQueue[correlationId]) {
                delete waitingQueue[correlationId];
                promise.reject(new Error("Request timeout"));
            }
        }, opt.timeout);
        return future;
    }

    function tell(options) {
        var opt = _.extend({}, defaultOptions, options);
        opt.correlationId = 'promise-' + (correlationIdCounter++);
        opt.token = lastToken;
        var pl = JSON.stringify(opt);
        //console.trace('Data sent on user websocket ' + pl);
        socket.send(pl);
    }

    exports.ask = ask;

    exports.tell = tell;

    exports.init = init;

})(portal.Socket);