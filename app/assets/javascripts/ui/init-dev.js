var portal = portal || {};
portal.DevTools = portal.DevTools || {};

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
                portal.MashetesStore.React.initializeTouchEvents(true);
                if (portal.MashetesStore[mashete.masheteId]) {
                    portal.MashetesStore.React.render(
                        portal.MashetesStore.React.createElement(portal.MashetesStore[mashete.masheteId], mashete.instanceConfig),
                        document.getElementById('masheteInstance')
                    );
                    console.log("Success !!!");
                } else {
                    console.log("Fail !!!");
                    portal.MashetesStore.React.render(
                        portal.MashetesStore.React.createElement(portal.MashetesStore.FallbackMashete, {}),
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

/**
// TODO : add to dev env
(function(__exports) {
    __exports.MongoMashete = portal.MashetesStore.React.createClass({
        getInitialState: function() {
            return {
                inputId: '',
                inputQuery: '',
                output: ''
            };
        },
        changeId: function(e) {
            this.setState({inputId: e.target.value})
        },
        changeQuery: function(e) {
            this.setState({inputQuery: e.target.value})
        },
        findById: function() {
            portal.Repository.findById(this.state.inputId).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        search: function() {
            portal.Repository.search(JSON.parse(this.state.inputQuery)).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        save: function() {
            portal.Repository.save(JSON.parse(this.state.inputQuery)).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        remove: function() {
            portal.Repository.remove(this.state.inputId).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        findAll: function() {
            portal.Repository.findAll().then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        deleteAll: function() {
            portal.Repository.deleteAll().then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        render: function() {
            return (
                <portal.Mashetes.Mashete title="Clock" config={this.props}>
                    <input type="text" value={this.state.inputId} onChange={this.changeId}/>
                    <textarea onChange={this.changeQuery} className="largeText" value={this.state.inputQuery}></textarea>
                    <button type="button" className="btn btn-primary" onClick={this.findById}>findById</button>
                    <button type="button" className="btn btn-primary" onClick={this.search}>search</button>
                    <button type="button" className="btn btn-primary" onClick={this.save}>save</button>
                    <button type="button" className="btn btn-primary" onClick={this.remove}>delete</button>
                    <button type="button" className="btn btn-primary" onClick={this.findAll}>findAll</button>
                    <button type="button" className="btn btn-primary" onClick={this.deleteAll}>deleteAll</button>
                    <textarea className="largeText" value={this.state.output}></textarea>
                </portal.Mashetes.Mashete>
            );
        }
    });
})({});
**/