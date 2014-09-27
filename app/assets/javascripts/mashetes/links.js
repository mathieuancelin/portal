/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.LinksMashete = React.createClass({
        getInitialState: function() {
            return {links: []};
        },
        componentDidMount: function() {
            portal.Structure.subPages().then(function(data) {
                this.setState({links: data});
            }.bind(this));
        },
        render: function() {
            var linkNodes = _.map(this.state.links, function(link) {
                return (
                    <li>
                        <a href={link.url}>{link.name}</a>
                    </li>
                );
            });
            return (
                <portal.Mashetes.Mashete title="Navigate to">
                    <ul className="pushTop unstyled">
                        {linkNodes}
                    </ul>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

