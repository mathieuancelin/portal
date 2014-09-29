/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.TitleMashete = React.createClass({displayName: 'TitleMashete',
        render: function() {
            return (
                portal.Mashetes.Mashete({title: this.props.title, config: this.props}, 
                    React.DOM.h1(null, portal.Location.current.name), 
                    React.DOM.p(null, portal.Location.current.description)
                )
            );
        }
    })
    exports.CustomTitleMashete = React.createClass({displayName: 'CustomTitleMashete',
        render: function() {
            return (
                portal.Mashetes.Mashete({title: this.props.title, config: this.props}, 
                    React.DOM.h1(null, this.props.title), 
                    React.DOM.p(null, this.props.description)
                )
            );
        }
    });
})(portal.MashetesStore);

