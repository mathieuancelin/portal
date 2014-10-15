/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.FallbackMashete = React.createClass({displayName: 'FallbackMashete',
        render: function() {
            return (
                portal.Mashetes.Mashete({title: "Fallback", config: this.props}, 
                    React.DOM.h3(null, "Mashete kills ... ")
                )
            );
        }
    });
})(portal.MashetesStore);

