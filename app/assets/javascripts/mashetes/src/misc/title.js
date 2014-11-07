var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            displayedTitle: this.props.title
        };
    },
    render: function() {
        return (
            <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props} >
                <h1>{portal.Location.current.name}</h1>
                <p>{portal.Location.current.description}</p>
            </portal.Mashetes.Mashete>
        );
    }
});

