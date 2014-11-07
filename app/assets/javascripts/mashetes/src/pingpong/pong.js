var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        portal.EventBus.on('ping', function() {
            setTimeout(function() {
                portal.EventBus.Browser.publish('pong', {});
                this.setState({ show: '&nbsp;' });
            }.bind(this), 1000);
            this.setState({ show: 'Pong' });
        }.bind(this));
        return {
            show: '&nbsp;',
            displayedTitle: this.props.title
        };
    },
    render: function() {
        return (
            <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props}>
                <h2 dangerouslySetInnerHTML={{__html: this.state.show}}></h2>
            </portal.Mashetes.Mashete>
        );
    }
});
