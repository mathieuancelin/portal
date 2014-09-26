var portal = portal || {};
portal.Socket = portal.Socket || {};
(function(exports) {

    var waitingQueue ={};
    var wsPromise = Q.defer();
    var correlationIdCounter = 0;
    var defaultOptions = {
        topic : 'defaultPortalTopic',
        timeout: 60000,
        payload: {}
    };

    function ask(options) {
        var promise = Q.defer();
        var future = promise.promise;
        var opt = _.extend({}, defaultOptions, options);
        var correlationId = 'promise-' + (correlationIdCounter++);
        opt.correlationId = correlationId;
        waitingQueue[correlationId] = promise;
        wsPromise.promise.then(function(ws) {
            var pl = JSON.stringify(opt);
            console.trace('Data asked on user websocket ' + pl);
            ws.send(pl);
            return ws;
        });
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
        wsPromise.promise.then(function(ws) {
            var pl = JSON.stringify(opt);
            console.trace('Data sent on user websocket ' + pl);
            ws.send(pl);
        });
    }

    exports.ask = ask;
    exports.tell = tell;
    exports.resolveWS = function(wsk) {
        wsPromise.resolve(wsk);
        wsk.addEventListener("message", function(event) {
            console.trace('data received on user websocket : ' + event.data);
            var data = JSON.parse(event.data);
            var correlationId = data.correlationId;
            if (waitingQueue[correlationId]) {
                var promise = waitingQueue[correlationId];
                promise.resolve(data.response);
                delete waitingQueue[correlationId];
            } else {
                console.error("Correlation " + correlationId + " not in waiting queue");
            }
        });
    };
    exports.rejectWS = function() {
        wsPromise.reject(new Error("The websocket cannot be initialized"));
    };
})(portal.Socket);