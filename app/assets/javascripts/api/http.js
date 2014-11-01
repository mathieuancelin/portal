var portal = portal || {};
portal.Http = portal.Http || {};
(function(exports) {
    exports.url = function(url) {
        function execute(opts) {
            return portal.Socket.ask({
                topic: "/portal/topics/httpclient",
                payload: {
                    command: "execute",
                    options: opts
                }
            });
        }
        function build(opts) {
            return {
                withParts: function(parts) {
                    opts.url = opts.url + '/' + parts.join('/');
                    return build(opts);
                },
                withParams: function(params) {
                    if (!opts.params) {
                        opts.params = [];
                    }
                    return build(opts);
                },
                withRequestTimeout: function(timeout) {
                    opts.timeout = timeout;
                    return build(opts);
                },
                withMediaType: function(mediaType) {
                    opts.mediaType = mediaType;
                    return build(opts);
                },
                withBody: function(body) {
                    opts.body = body;
                    return build(opts);
                },
                withHeaders: function(headers) {
                    if (!opts.headers) {
                        opts.headers = [];
                    }
                    return build(opts);
                },
                withCookies: function(cookies) {
                    if (!opts.cookies) {
                        opts.cookies = [];
                    }
                    return build(opts);
                },
                withCurrentCookies: function() {
                    return this.withCookies([]); // TODO : get current cookies
                },
                get: function() {
                    opts.method = 'GET';
                    return execute(opts);
                },
                patch: function() {
                    opts.method = 'PATCH';
                    return execute(opts);
                },
                post: function() {
                    opts.method = 'POST';
                    return execute(opts);
                },
                put: function() {
                    opts.method = 'PUT';
                    return execute(opts);
                },
                del: function() {
                    opts.method = 'DELETE';
                    return execute(opts);
                },
                head: function() {
                    opts.method = 'HEAD';
                    return execute(opts);
                },
                options: function() {
                    opts.method = 'OPTIONS';
                    return execute(opts);
                }
            };
        }
        return build({
            url: url
        });
    };
})(portal.Http);