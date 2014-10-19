/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.ClockMashete = React.createClass({displayName: 'ClockMashete',
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
                portal.Mashetes.Mashete({title: "Clock", config: this.props}, 
                    React.DOM.div({className: "centeredText"}, 
                        React.DOM.h3(null, this.state.displayedDate)
                    )
                )
                );
        }
    });
})(portal.MashetesStore);

