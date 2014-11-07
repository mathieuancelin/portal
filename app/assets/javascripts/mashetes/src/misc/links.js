var React = require('react');

module.exports = React.createClass({
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
                <portal.Mashetes.Mashete title="Navigate to" config={this.props}>
                    <h5>Nothing here ...</h5>
                </portal.Mashetes.Mashete>
            );
        }
        var linkNodes = _.map(this.state.links, function(link) {
            return (
                <li>
                    <a href={link.url}>{link.name}</a>
                </li>
            );
        });
        // TODO : display as tree
        return (
            <portal.Mashetes.Mashete title="Navigate to" config={this.props}>
                <ul className="pushTop unstyled">
                    {linkNodes}
                </ul>
            </portal.Mashetes.Mashete>
        );
    }
});

