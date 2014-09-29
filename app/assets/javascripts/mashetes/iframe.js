/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.IframeMashete = React.createClass({
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.props.title}  id={this.props.id}>
                    <iframe className="pushTop" src={this.props.url} width="100%" height={this.props.height || 500}></iframe>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

