/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.IframeMashete = React.createClass({displayName: 'IframeMashete',
        getInitialState: function() {
            return {
                displayedTitle: this.props.title,
                displayedUrl: this.props.url,
                displayedHeight: this.props.height || '500px',
                displayedWidth: this.props.width || "100%",
                displayedAllowTransparency: this.props.allowTransparency || true,
                displayedClass: this.props.class || 'pushTop',
                displayedFrameborder: this.props.frameborder || "0"
            };
        },
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: this.state.displayedTitle, config: this.props}, 
                    React.createElement("div", {className: "centeredText"}, 
                        React.createElement("iframe", {
                            className: this.state.displayedClass, 
                            src: this.state.displayedUrl, 
                            title: this.state.displayedTitle, 
                            allowTransparency: this.state.displayedAllowTransparency, 
                            frameBorder: this.state.displayedFrameborder, 
                            width: this.state.displayedWidth, 
                            height: this.state.displayedHeight
                        })
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

