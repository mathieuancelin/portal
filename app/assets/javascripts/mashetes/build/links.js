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
                    portal.Mashetes.Mashete({title: "Navigate to"}, 
                        React.DOM.h5(null, "Nothing here ...")
                    )
                );
            }
            var linkNodes = _.map(this.state.links, function(link) {
                return (
                    React.DOM.li(null, 
                        React.DOM.a({href: link.url}, link.name)
                    )
                );
            });
            return (
                portal.Mashetes.Mashete({title: "Navigate to", masheteid: this.props.masheteid}, 
                    React.DOM.ul({className: "pushTop unstyled"}, 
                        linkNodes
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

