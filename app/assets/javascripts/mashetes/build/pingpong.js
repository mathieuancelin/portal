/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.PingMashete = React.createClass({displayName: 'PingMashete',
        getInitialState: function() {
            setTimeout(function() {
                portal.EventBus.publishClientOnly('pong', {});
            }, 10);
            portal.EventBus.on('pong', function() {
                setTimeout(function() {
                    portal.EventBus.publishClientOnly('ping', {});
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
                portal.Mashetes.Mashete({title: this.state.displayedTitle, config: this.props}, 
                    React.DOM.h2({dangerouslySetInnerHTML: {__html: this.state.show}})
                )
            );
        }
    });
    exports.PongMashete = React.createClass({displayName: 'PongMashete',
        getInitialState: function() {
            portal.EventBus.on('ping', function() {
                setTimeout(function() {
                    portal.EventBus.publishClientOnly('pong', {});
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
                portal.Mashetes.Mashete({title: this.state.displayedTitle, config: this.props}, 
                    React.DOM.h2({dangerouslySetInnerHTML: {__html: this.state.show}})
                )
                );
        }
    });
})(portal.MashetesStore);

