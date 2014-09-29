/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    exports.Mashete = React.createClass({displayName: 'Mashete',
        getInitialState: function() {
            return {hide: false};
        },
        hide: function(e) {
            this.setState({hide: true});
            this.props.config.closeCallback();
        },
        render: function() {
            if (this.state.hide) {
                return (React.DOM.div(null));
            }
            var AdminBar = (
                React.DOM.div({className: "row mashete-bar"}, 
                    React.DOM.div({className: "pull-left"}, 
                        React.DOM.h5(null, this.props.title)
                    ), 
                    React.DOM.button({type: "button", className: "btn btn-primary btn-xs pull-right", onClick: this.hide}, "x")
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
                                this.props.children
                            )
                        ), 
                        React.DOM.div({class: "row droppable"})
                    )
                )
            );
        }
    });

})(portal.Mashetes);