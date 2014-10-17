/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.IframeMashete = React.createClass({
        getInitialState: function() {
            return {
                displayedTitle: this.props.title,
                displayedUrl: this.props.url,
                displayedHeight: this.props.height || 500
            };
        },
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props}>
                    <iframe className="pushTop" src={this.state.displayedUrl} width="100%" height={this.state.displayedHeight}></iframe>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

