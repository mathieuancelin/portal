/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.FallbackMashete = React.createClass({
        render: function() {
            return (
                <portal.Mashetes.Mashete title="Fallback" config={this.props}>
                    <h3>Mashete kills ... </h3>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

