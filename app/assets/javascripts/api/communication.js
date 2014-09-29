var portal = portal || {};
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

    function init() {
        socket = new WebSocket("ws://" + location.host + "/ws");
        socket.onopen = function() {
            wsPromise.resolve({});//socket);
            console.log("Websocket connection successful")
        };
        socket.onerror = function() {
            wsPromise.reject(new Error("The websocket cannot be initialized"));
            console.error("The websocket cannot be initialized");
        };
        socket.onmessage = function(event) {
            //console.trace('data received on user websocket : ' + event.data);
            var data = JSON.parse(event.data);
            var correlationId = data.correlationId;
            if (waitingQueue[correlationId]) {
                var promise = waitingQueue[correlationId];
                promise.resolve(data.response);
                delete waitingQueue[correlationId];
            } else {
                console.error("Correlation " + correlationId + " not in waiting queue");
            }
        };
        return wsPromise.promise;
    }

    function ask(options) {
        var promise = Q.defer();
        var future = promise.promise;
        var opt = _.extend({}, defaultOptions, options);
        var correlationId = 'promise-' + (correlationIdCounter++);
        opt.correlationId = correlationId;
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
        var pl = JSON.stringify(opt);
        //console.trace('Data sent on user websocket ' + pl);
        socket.send(pl);
    }

    exports.ask = ask;

    exports.tell = tell;

    exports.init = init;

})(portal.Socket);