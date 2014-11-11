var React = require('react');

// TODO : calculator mashete
// TODO : user profile mashete
// TODO : notepad mashete (need storage)

function add(masheteId, conf, isAdmin) {
    return portal.Socket.ask({
        topic: '/portal/topics/structure',
        payload: {
            command: 'addMashete',
            from: portal.Location.current._id,
            id: masheteId
        }
    }).then(function(data) {
        var id = data.masheteid;
        var hiding = '#row-mashete-' + id;
        var template = '<div id="mashete-' + id + '"></div>';
        $('#col-0').prepend(template);
        conf.masheteid = id;
        conf.mashete = masheteId;
        conf.position = {column: 0, line: 0};
        conf.closeCallback = function () {
            $(hiding).hide();
        };
        React.render(
            React.createElement(portal.MashetesStore[masheteId], conf), document.getElementById("mashete-" + id)
        );
    })
}

var Mashete = React.createClass({
    getInitialState: function() {
        var config = _.extend({}, this.props.config);
        delete config.mashete;
        delete config.masheteid;
        delete config.position;
        return {
            hide: false,
            edit: false,
            originalContent: JSON.stringify(config, null, 2),
            optionsContent: JSON.stringify(config, null, 2)
        };
    },
    hide: function(e) {
        portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'removeMashete',
                from: portal.Location.current._id,
                id: this.props.config.masheteid,
                instance: this.props.config.mashete
            }
        });
        this.setState({hide: true});
        this.props.config.closeCallback();
    },
    showOptions: function(e) {
        this.setState({edit: true});
    },
    flipOptions: function(e) {
        this.setState({edit: !this.state.edit});
    },
    cancelAndHideOptions: function(e) {
        this.setState({
            edit: false,
            optionsContent: this.state.originalContent
        });
    },
    saveAndHideOptions: function(e) {
        var masheteThis = this;
        portal.Structure.saveMasheteOptions(this.props.config.masheteid, JSON.parse(this.state.optionsContent)).then(function(newConfig) {
            masheteThis.setState({edit: false});
            setTimeout(function() {
                var hiding = '#row-mashete-' + this.props.config.masheteid;
                React.unmountComponentAtNode(document.getElementById("mashete-" + this.props.config.masheteid));
                newConfig.masheteid = this.props.config.masheteid;
                newConfig.mashete = this.props.config.mashete;
                newConfig.position = this.props.config.position;
                newConfig.closeCallback = function () {
                    $(hiding).hide();
                };
                React.render(
                    React.createElement(portal.MashetesStore[this.props.config.mashete], newConfig),
                    document.getElementById("mashete-" + this.props.config.masheteid)
                );
            }.bind(masheteThis), 100);
        });
    },
    changeConfig: function(e) {
        this.setState({optionsContent: e.target.value})
    },
    render: function() {
        if (this.state.hide) {
            return (<div></div>);
        }
        var content = this.props.children;
        if (this.state.edit) {
            if (this.props.customOptionsPanelFactory) {
                var stateGetter = function() {
                    return this.state;
                }.bind(this);
                var save = function(what) {
                    var newProps = _.extend({}, this.props.config);
                    newProps = _.extend(newProps, what);
                    var masheteThis = this;
                    portal.Structure.saveMasheteOptions(this.props.config.masheteid, newProps).then(function(newConfig) {
                        masheteThis.setState({edit: false});
                        setTimeout(function() {
                            var hiding = '#row-mashete-' + this.props.config.masheteid;
                            React.unmountComponentAtNode(document.getElementById("mashete-" + this.props.config.masheteid));
                            newConfig.masheteid = this.props.config.masheteid;
                            newConfig.mashete = this.props.config.mashete;
                            newConfig.position = this.props.config.position;
                            newConfig.closeCallback = function () {
                                $(hiding).hide();
                            };
                            React.render(
                                React.createElement(portal.MashetesStore[this.props.config.mashete], newConfig),
                                document.getElementById("mashete-" + this.props.config.masheteid)
                            );
                        }.bind(masheteThis), 100);
                    });
                }.bind(this);
                var instance = this.props.customOptionsPanelFactory(this.props, stateGetter, save);
                content = (<div>{instance}</div>);
            } else {
                content = (
                    <div>
                        <div className="row">
                            <textarea onChange={this.changeConfig} className="largeText" value={this.state.optionsContent}></textarea>
                        </div>
                        <div className="row">
                            <div className="btn-group pull-right">
                                <button type="button" onClick={this.cancelAndHideOptions} className="btn btn-sm btn-danger">Cancel</button>
                                <button type="button" onClick={this.saveAndHideOptions} className="btn btn-sm btn-primary">Ok</button>
                            </div>
                        </div>
                    </div>
                    );
            }
        }
        var AdminBar = (
            <div className="row mashete-bar">
                <div className="pull-left">
                    <h5>{this.props.title}</h5>
                </div>
                <div className="btn-group pull-right">
                    <button type="button" className="btn btn-primary btn-xs" onClick={this.flipOptions}><span className="glyphicon glyphicon-cog"></span></button>
                    <button type="button" className="btn btn-danger btn-xs" onClick={this.hide}><span className="glyphicon glyphicon-remove"></span></button>
                </div>
            </div>
            );
        if (portal.User.current.isNotAdmin()) {
            AdminBar = undefined;
        }
        return (
            <div className="row mashete-row draggable" draggable={portal.User.current.isAdmin()} data-masheteid={this.props.config.masheteid} id={"row-mashete-" + this.props.config.masheteid}>
                <div className="col-md-12">
                    <div className="row">
                        <div className="mashete col-md-12" data-masheteid={this.props.config.masheteid}>
                            <div className="container-fluid">
                        {AdminBar}
                                <div className="row">
                                    <div className="col-md-12">
                            {content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="row droppable"></div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = {
    add: add,
    Mashete: Mashete
}