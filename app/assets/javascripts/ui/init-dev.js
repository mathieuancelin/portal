var portal = portal || {};
portal.DevTools = portal.DevTools || {};

// Nicer version of the Todo App using Flux like architecture (http://facebook.github.io/flux/)
(function(exports) {

    function startUi() {
        _.chain(portal.Location.current.mashetes).each(function (mashete) {
            try {
                var idx = mashete.position.line;
                var side = 'left';
                if (mashete.position.column === 1) {
                    side = 'right';
                }
                var hiding = '#' + side + '-row-' + (idx + 1);
                mashete.instanceConfig.masheteid = mashete.id;
                mashete.instanceConfig.mashete = mashete.masheteId;
                mashete.instanceConfig.position = mashete.position;
                mashete.instanceConfig.closeCallback = function () {
                    $(hiding).hide();
                };
                console.log("try to instanciate " + mashete.masheteId);
                React.initializeTouchEvents(true);
                if (portal.MashetesStore[mashete.masheteId]) {
                    React.render(
                        React.createElement(portal.MashetesStore[mashete.masheteId], mashete.instanceConfig),
                        document.getElementById('masheteInstance')
                    );
                    console.log("Success !!!");
                } else {
                    console.log("Fail !!!");
                    React.render(
                        React.createElement(portal.MashetesStore.FallbackMashete, {}),
                        document.getElementById('masheteInstance')
                    );
                }
            } catch (ex) {
                console.error(ex.stack);
            }
        });

        if (location.hash.replace('#', '') !== '' ) {
            portal.EventBus.Browser.publish(portal.Url.HashChangeEvent, location.hash.replace("#", ""));
        }
    }

    if (location.pathname.startsWith('/dev/env/')) {
        exports.init = function(instance) {
            portal.Socket.init().then(function() {
                try {
                    console.log('Init UI ...');
                    portal.Location.current.mashetes = [instance];
                    setTimeout(startUi, 0);
                } catch(e) {
                    console.error(e);
                    console.error(e.stack);
                }
            });
        };
    }
})(portal.DevTools);


