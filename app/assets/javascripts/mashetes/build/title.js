/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.TitleMashete = React.createClass({displayName: 'TitleMashete',
        getInitialState: function() {
            return {
                displayedTitle: this.props.title
            };
        },
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: this.state.displayedTitle, config: this.props}, 
                    React.createElement("h1", null, portal.Location.current.name), 
                    React.createElement("p", null, portal.Location.current.description)
                )
            );
        }
    })
    exports.CustomTitleMashete = React.createClass({displayName: 'CustomTitleMashete',
        getInitialState: function() {
            return {
                displayedDescription: this.props.description,
                displayedTitle: this.props.title
            };
        },
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: this.state.displayedTitle, config: this.props}, 
                    React.createElement("h1", null, this.state.displayedTitle), 
                    React.createElement("p", null, this.state.displayedDescription)
                )
            );
        }
    });
})(portal.MashetesStore);

