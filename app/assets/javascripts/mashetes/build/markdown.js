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
                React.DOM.div(null, 
                    React.DOM.div({className: "row"}, 
                        React.DOM.textarea({onChange: this.changeConfig, className: "largeText", rows: "200", value: this.state.optionsContent})
                    ), 
                    React.DOM.div({className: "row"}, 
                        React.DOM.div({className: "btn-group pull-right"}, 
                            React.DOM.button({type: "button", onClick: this.cancelAndHideOptions, className: "btn btn-sm btn-danger"}, "Cancel"), 
                            React.DOM.button({type: "button", onClick: this.saveAndHideOptions, className: "btn btn-sm btn-primary"}, "Ok")
                        )
                    )
                )
            );
        }
    });
    exports.MarkdownMashete = React.createClass({displayName: 'MarkdownMashete',
        render: function() {
            var rawMarkup = converter.makeHtml(this.props.markdown.decodeBase64());
            var panel = function(outterProps, stateGetter, save) {
                return new MarkdownMasheteOptionsPanel({ outterProps: outterProps, stateGetter: stateGetter, save: save });
            };
            return (
                portal.Mashetes.Mashete({title: this.props.title, config: this.props, customOptionsPanelFactory: panel}, 
                    React.DOM.div(null, 
                        React.DOM.span({dangerouslySetInnerHTML: {__html: rawMarkup}})
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

