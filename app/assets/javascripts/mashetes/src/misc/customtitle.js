var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            displayedDescription: this.props.description,
            displayedTitle: this.props.title
        };
    },
    render: function() {
        return (
            <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props} >
                <h1>{this.state.displayedTitle}</h1>
                <p>{this.state.displayedDescription}</p>
            </portal.Mashetes.Mashete>
        );
    }
});

