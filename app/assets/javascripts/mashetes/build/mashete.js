/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    exports.add = function(masheteId, conf, isAdmin) {
        // TODO : so ugly ...
        // TODO : add it server side
        var id = portal.Utils.generateUUID();
        var hiding = '#left-row-' + id ;
        var template = '<div class="row" id="left-row-' + id + '">' +
        '    <div class="row droppable" id="left-drop-start-' + id + '" data-pos="start"></div>' +
        '    <div class="col-md-12 draggable" id="left-' + id + '" draggable="' + isAdmin + '" ondragover="event.preventDefault();"></div>' +
        '    <div class="row droppable" id="left-drop-stop-' + id + '" data-pos="stop"></div>'
        '</div>';
        $('#left').prepend(template);
        conf.masheteid = id;
        conf.closeCallback = function () {
            $(hiding).hide();
        };
        React.renderComponent(
            new portal.MashetesStore[masheteId](conf), document.getElementById("left-" + id)
        );
    };

    exports.Mashete = React.createClass({displayName: 'Mashete',
        getInitialState: function() {
            return {
                hide: false,
                edit: false
            };
        },
        hide: function(e) {
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
            this.setState({edit: false});
        },
        saveAndHideOptions: function(e) {
            this.setState({edit: false});
            // TODO : call server to change options value
        },
        render: function() {
            if (this.state.hide) {
                return (React.DOM.div(null));
            }
            var content = this.props.children;
            if (this.state.edit) {
                content = (
                    React.DOM.div(null, 
                        React.DOM.div({className: "row"}, 
                            React.DOM.textarea({className: "largeText"}, JSON.stringify(this.props.config, null, 2))
                        ), 
                        React.DOM.div({className: "row"}, 
                            React.DOM.div({className: "btn-group pull-right"}, 
                                React.DOM.button({type: "button", onClick: this.cancelAndHideOptions, className: "btn btn-sm btn-danger"}, "Cancel"), 
                                React.DOM.button({type: "button", onClick: this.saveAndHideOptions, className: "btn btn-sm btn-primary"}, "Ok")
                            )
                        )
                    )
                );
            }
            var AdminBar = (
                React.DOM.div({className: "row mashete-bar"}, 
                    React.DOM.div({className: "pull-left"}, 
                        React.DOM.h5(null, this.props.title)
                    ), 
                    React.DOM.div({className: "btn-group pull-right"}, 
                        React.DOM.button({type: "button", className: "btn btn-primary btn-xs", onClick: this.flipOptions}, React.DOM.span({className: "glyphicon glyphicon-cog"})), 
                        React.DOM.button({type: "button", className: "btn btn-danger btn-xs", onClick: this.hide}, React.DOM.span({className: "glyphicon glyphicon-remove"}))
                    )
                )
                );
            if (portal.User.current.isNotAdmin()) {
                AdminBar = undefined;
            }
            return (
                React.DOM.div({className: "mashete col-md-12", draggable: "false", ondragover: "event.preventDefault();", 'data-masheteid': this.props.config.masheteid}, 
                    React.DOM.div({className: "container-fluid"}, 
                        React.DOM.div({class: "row droppable"}), 
                            AdminBar, 
                        React.DOM.div({className: "row"}, 
                            React.DOM.div({className: "col-md-12"}, 
                                content
                            )
                        ), 
                        React.DOM.div({class: "row droppable"})
                    )
                )
            );
        }
    });

})(portal.Mashetes);