/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.IframeMashete = React.createClass({displayName: 'IframeMashete',
        render: function() {
            return (
                portal.Mashetes.Mashete({title: this.props.title, config: this.props}, 
                    React.DOM.iframe({className: "pushTop", src: this.props.url, width: "100%", height: this.props.height || 500})
                )
            );
        }
    });
})(portal.MashetesStore);

