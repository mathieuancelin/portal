/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.PingMashete = React.createClass({
        getInitialState: function() {
            setTimeout(function() {
                portal.EventBus.Browser.publish('pong', {});
            }, 10);
            portal.EventBus.on('pong', function() {
                setTimeout(function() {
                    portal.EventBus.Browser.publish('ping', {});
                    this.setState({ show: '&nbsp;' });
                }.bind(this), 1000);
                this.setState({ show: 'Ping' });
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
    exports.PongMashete = React.createClass({
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
})(portal.MashetesStore);

