var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        setInterval(function() {
            this.setState({ displayedDate: moment().format('MMMM Do YYYY, hh:mm:ss') });
        }.bind(this), 1000);
        return {
            displayedDate: moment().format('MMMM Do YYYY, hh:mm:ss')
        };
    },
    render: function() {
        return (
            <portal.Mashetes.Mashete title="Clock" config={this.props}>
                <div className="centeredText">
                    <h3>{this.state.displayedDate}</h3>
                </div>
            </portal.Mashetes.Mashete>
            );
    }
});

