/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    var converter = new Showdown.converter();
    exports.MarkdownMashete = React.createClass({displayName: 'MarkdownMashete',
        render: function() {
            var rawMarkup = converter.makeHtml(this.props.markdown.decodeBase64());
            return (
                portal.Mashetes.Mashete({title: this.props.title, config: this.props}, 
                    React.DOM.div(null, 
                        React.DOM.span({dangerouslySetInnerHTML: {__html: rawMarkup}})
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

