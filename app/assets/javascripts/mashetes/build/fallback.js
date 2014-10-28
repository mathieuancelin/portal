/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.FallbackMashete = React.createClass({displayName: 'FallbackMashete',
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: "Fallback", config: this.props}, 
                    React.createElement("h3", null, "Mashete kills ... ")
                )
            );
        }
    });
})(portal.MashetesStore);

