/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.LinksMashete = React.createClass({displayName: 'LinksMashete',
        getInitialState: function() {
            return {links: []};
        },
        componentDidMount: function() {
            portal.Structure.subPages().then(function(data) {
                this.setState({links: data});
            }.bind(this));
        },
        render: function() {
            if (this.state.links.length === 0) {
                return (
                    React.createElement(portal.Mashetes.Mashete, {title: "Navigate to", config: this.props}, 
                        React.createElement("h5", null, "Nothing here ...")
                    )
                );
            }
            var linkNodes = _.map(this.state.links, function(link) {
                return (
                    React.createElement("li", null, 
                        React.createElement("a", {href: link.url}, link.name)
                    )
                );
            });
            // TODO : display as tree
            return (
                React.createElement(portal.Mashetes.Mashete, {title: "Navigate to", config: this.props}, 
                    React.createElement("ul", {className: "pushTop unstyled"}, 
                        linkNodes
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

