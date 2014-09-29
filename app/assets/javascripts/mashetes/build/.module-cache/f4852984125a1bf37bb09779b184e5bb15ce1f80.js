/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    function MasheteTemplate(component) {

        var AdminBar = (
            React.DOM.div({className: "row mashete-bar"}, 
                React.DOM.div({className: "pull-left"}, 
                    React.DOM.h5(null, component.props.title)
                ), 
                React.DOM.button({type: "button", className: "btn btn-primary btn-xs pull-right"}, "x")
            )
        );
        if (portal.User.current.isNotAdmin()) {
            AdminBar = undefined;
        }
        console.log(component.props);
        return (
            React.DOM.div({className: "mashete col-md-12", draggable: "false", ondragover: "event.preventDefault();", 'data-masheteid': component.props.masheteid}, 

                React.DOM.div({className: "container-fluid"}, 
                    React.DOM.div({class: "row droppable"}), 
                    AdminBar, 
                    React.DOM.div({className: "row"}, 
                        React.DOM.div({className: "col-md-12"}, 
                        component.props.children
                        )
                    ), 
                    React.DOM.div({class: "row droppable"})
                )
            )
        );
    }

    exports.Mashete = React.createClass({displayName: 'Mashete',
        render: function() {
            return MasheteTemplate(this);
        }
    });

})(portal.Mashetes);