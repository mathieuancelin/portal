/** @jsx React.DOM */

// TODO : calculator mashete
// TODO : stocks mashete
// TODO : clock mashete
// TODO : user profile mashete

// TODO : notepad mashete (need storage)
// TODO : todo mashete (need storage)
var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    exports.add = function(masheteId, conf, isAdmin) {
        // TODO : so ugly ...
        var id = portal.Utils.generateUUID();
        var hiding = '#left-row-' + id ;
        var template = '<div class="row" id="left-row-' + id + '">' +
        '    <div class="row droppable" id="left-drop-start-' + id + '" data-pos="start"></div>' +
        '    <div class="col-md-12 draggable" id="left-' + id + '" draggable="' + isAdmin + '" ondragover="event.preventDefault();"></div>' +
        '    <div class="row droppable" id="left-drop-stop-' + id + '" data-pos="stop"></div>'
        '</div>';
        $('#left').prepend(template);
        conf.masheteid = id;
        conf.mashete = masheteId;
        conf.position = {column: 0, line: 0};
        conf.closeCallback = function () {
            $(hiding).hide();
        };
        portal.Socket.ask({
            topic: '/portal/topics/structure',
            payload: {
                command: 'addMashete',
                from: portal.Location.current._id,
                id: masheteId
            }
        }).then(function() {
            React.render(
                React.createElement(portal.MashetesStore[masheteId], conf), document.getElementById("left-" + id)
            );
        })
    };

    exports.Mashete = React.createClass({displayName: 'Mashete',
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
                    // TODO : common code => see init.js line 15
                    var idx = this.props.config.position.line;
                    var side = 'left';
                    if (this.props.config.position.column === 1) {
                        side = 'right';
                    }
                    var hiding = '#' + side + '-row-' + (idx + 1);
                    React.unmountComponentAtNode(document.getElementById(side + '-' + (idx + 1)));
                    newConfig.masheteid = this.props.config.masheteid;
                    newConfig.mashete = this.props.config.mashete;
                    newConfig.position = this.props.config.position;
                    newConfig.closeCallback = function () {
                        $(hiding).hide();
                    };
                    React.render(
                        React.createElement(portal.MashetesStore[this.props.config.mashete], newConfig),
                        document.getElementById(side + '-' + (idx + 1))
                    );
                }.bind(masheteThis), 100);
            });
        },
        changeConfig: function(e) {
            this.setState({optionsContent: e.target.value})
        },
        render: function() {
            if (this.state.hide) {
                return (React.createElement("div", null));
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
                                // TODO : common code => see init.js line 15
                                var idx = this.props.config.position.line;
                                var side = 'left';
                                if (this.props.config.position.column === 1) {
                                    side = 'right';
                                }
                                var hiding = '#' + side + '-row-' + (idx + 1);
                                React.unmountComponentAtNode(document.getElementById(side + '-' + (idx + 1)));
                                newConfig.masheteid = this.props.config.masheteid;
                                newConfig.mashete = this.props.config.mashete;
                                newConfig.position = this.props.config.position;
                                newConfig.closeCallback = function () {
                                    $(hiding).hide();
                                };
                                React.render(
                                    React.createElement(portal.MashetesStore[this.props.config.mashete], newConfig),
                                    document.getElementById(side + '-' + (idx + 1))
                                );
                            }.bind(masheteThis), 100);
                        });
                    }.bind(this);
                    var instance = this.props.customOptionsPanelFactory(this.props, stateGetter, save);
                    content = (React.createElement("div", null, instance));
                } else {
                    content = (
                        React.createElement("div", null, 
                            React.createElement("div", {className: "row"}, 
                                React.createElement("textarea", {onChange: this.changeConfig, className: "largeText", value: this.state.optionsContent})
                            ), 
                            React.createElement("div", {className: "row"}, 
                                React.createElement("div", {className: "btn-group pull-right"}, 
                                    React.createElement("button", {type: "button", onClick: this.cancelAndHideOptions, className: "btn btn-sm btn-danger"}, "Cancel"), 
                                    React.createElement("button", {type: "button", onClick: this.saveAndHideOptions, className: "btn btn-sm btn-primary"}, "Ok")
                                )
                            )
                        )
                        );
                }
            }
            var AdminBar = (
                React.createElement("div", {className: "row mashete-bar"}, 
                    React.createElement("div", {className: "pull-left"}, 
                        React.createElement("h5", null, this.props.title)
                    ), 
                    React.createElement("div", {className: "btn-group pull-right"}, 
                        React.createElement("button", {type: "button", className: "btn btn-primary btn-xs", onClick: this.flipOptions}, React.createElement("span", {className: "glyphicon glyphicon-cog"})), 
                        React.createElement("button", {type: "button", className: "btn btn-danger btn-xs", onClick: this.hide}, React.createElement("span", {className: "glyphicon glyphicon-remove"}))
                    )
                )
                );
            if (portal.User.current.isNotAdmin()) {
                AdminBar = undefined;
            }
            return (
                React.createElement("div", {className: "mashete col-md-12", draggable: "false", ondragover: "event.preventDefault();", 'data-masheteid': this.props.config.masheteid}, 
                    React.createElement("div", {className: "container-fluid"}, 
                        React.createElement("div", {className: "row droppable"}), 
                            AdminBar, 
                        React.createElement("div", {className: "row"}, 
                            React.createElement("div", {className: "col-md-12"}, 
                                content
                            )
                        ), 
                        React.createElement("div", {className: "row droppable"})
                    )
                )
            );
        }
    });

})(portal.Mashetes);