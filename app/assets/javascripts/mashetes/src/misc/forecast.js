var React = require('react');

// TODO : custom location
module.exports = React.createClass({
    getInitialState: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                this.setState({
                    displayedUrl: "http://forecast.io/embed/#lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&name=Current%20Location&units=ca"
                });
            }.bind(this));
        }
        return {
            displayedUrl: "http://forecast.io/embed/#lat=48.8569&lon=2.3412&name=Paris&units=ca"
        };
    },
    render: function() {
        return (
            <portal.Mashetes.Mashete title="Forecast" config={this.props}>
                <div className="centeredText">
                    <iframe frameBorder="0" height="245" width="100%" src={this.state.displayedUrl}> </iframe>
                </div>
            </portal.Mashetes.Mashete>
            );
    }
});

