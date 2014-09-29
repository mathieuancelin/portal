/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.TitleMashete = React.createClass({
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.props.title} masheteid={this.props.masheteid}>
                    <h1>{portal.Location.current.name}</h1>
                    <p>{portal.Location.current.description}</p>
                </portal.Mashetes.Mashete>
            );
        }
    })
    exports.CustomTitleMashete = React.createClass({
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.props.title} masheteid={this.props.masheteid}>
                    <h1>{this.props.title}</h1>
                    <p>{this.props.description}</p>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

