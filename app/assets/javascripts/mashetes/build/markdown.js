/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    var converter = new Showdown.converter();
    var MarkdownMasheteOptionsPanel = React.createClass({displayName: 'MarkdownMasheteOptionsPanel',
        getInitialState: function() {
            return {
                optionsContent: this.props.outterProps.config.markdown.decodeBase64()
            };
        },
        saveAndHideOptions: function(e) {
            this.props.save({
                markdown: this.state.optionsContent.encodeBase64()
            });
        },
        changeConfig: function(e) {
            this.setState({optionsContent: e.target.value})
        },
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("textarea", {onChange: this.changeConfig, className: "largeText", rows: "200", value: this.state.optionsContent})
                    ), 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "btn-group pull-right"}, 
                            React.createElement("button", {type: "button", onClick: this.cancelAndHideOptions, className: "btn btn-sm btn-danger"}, "Cancel"), 
                            React.createElement("button", {type: "button", onClick: this.saveAndHideOptions, className: "btn btn-sm btn-primary"}, "Ok")
                        )
                    )
                )
            );
        }
    });
    exports.MarkdownMashete = React.createClass({displayName: 'MarkdownMashete',
        getInitialState: function() {
            return {
                displayedTitle: this.props.title
            };
        },
        render: function() {
            var rawMarkup = converter.makeHtml(this.props.markdown.decodeBase64());
            var panel = function(outterProps, stateGetter, save) {
                return new MarkdownMasheteOptionsPanel({ outterProps: outterProps, stateGetter: stateGetter, save: save });
            };
            return (
                React.createElement(portal.Mashetes.Mashete, {title: this.state.displayedTitle, config: this.props, customOptionsPanelFactory: panel}, 
                    React.createElement("div", null, 
                        React.createElement("span", {dangerouslySetInnerHTML: {__html: rawMarkup}})
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

