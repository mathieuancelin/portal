/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.TitleMashete = React.createClass({
        getInitialState: function() {
            return {
                displayedTitle: this.props.title
            };
        },
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props} >
                    <h1>{portal.Location.current.name}</h1>
                    <p>{portal.Location.current.description}</p>
                </portal.Mashetes.Mashete>
            );
        }
    });
    exports.CustomTitleMashete = React.createClass({
        getInitialState: function() {
            return {
                displayedDescription: this.props.description,
                displayedTitle: this.props.title
            };
        },
        render: function() {
            return (
                <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props} >
                    <h1>{this.state.displayedTitle}</h1>
                    <p>{this.state.displayedDescription}</p>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);

