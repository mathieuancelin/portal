var React = require('react');

var MarkdownMasheteOptionsPanel = require('./optionpanel');

var converter = new Showdown.converter();

module.exports = React.createClass({
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
            <portal.Mashetes.Mashete title={this.state.displayedTitle} config={this.props} customOptionsPanelFactory={panel}>
                <div>
                    <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
                </div>
            </portal.Mashetes.Mashete>
        );
    }
});

