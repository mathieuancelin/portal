/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var NavigationItem = React.createClass({displayName: 'NavigationItem',
        onClick: function() {
            this.props.itemSelected(this.props.item);
        },
        render: function() {
            return (
                React.createElement("li", {onClick: this.onClick, className: this.props.selected ? "list-group-item active" : "list-group-item"}, 
                this.props.item.data.display_name
                )
            );
        }
    });

    var Navigation = React.createClass({displayName: 'Navigation',
        setSelectedItem: function(item) {
            this.props.itemSelected(item);
        },
        render: function() {
            var _this = this;

            var items = this.props.items.map(function(item) {
                return (
                    React.createElement(NavigationItem, {key: item.data.id, 
                        item: item, itemSelected: _this.setSelectedItem, 
                        selected: item.data.url === _this.props.activeUrl})
                    );
            });

            return (
                React.createElement("div", {className: "navigation"}, 
                    React.createElement("div", {className: "header"}, "Navigation"), 
                    React.createElement("ul", {className: "list-group"}, 
                    items
                    )
                )
            );
        }
    });

    var StoryList = React.createClass({displayName: 'StoryList',
        render: function() {
            var storyNodes = this.props.items.map(function(item) {
                return (
                    React.createElement("tr", {key: item.data.url}, 
                        React.createElement("td", null, 
                            React.createElement("p", {className: "score"}, item.data.score)
                        ), 
                        React.createElement("td", null, 
                            React.createElement("p", {className: "title"}, 
                                React.createElement("a", {href: item.data.url, target: "_blank"}, 
                                item.data.title
                                )
                            ), 
                            React.createElement("p", {className: "author"}, 
                            "Posted by ", React.createElement("b", null, item.data.author)
                            )
                        )
                    )
                );
            });

            return (
                React.createElement("table", null, 
                    React.createElement("tbody", null, 
                    storyNodes
                    )
                )
            );
        }
    });

    var Reddit = React.createClass({displayName: 'Reddit',
        componentDidMount: function() {
            $("head link[rel='stylesheet']").last().after("<link rel='stylesheet' href='/assets/stylesheets/reddit.css' type='text/css' media='screen'>");
            portal.Http.url( "http://www.reddit.com/reddits.json").get().then(function(data) {
                this.setState({
                    navigationItems: data.response.json.data.children
                });
            }.bind(this));
        },
        getInitialState: function() {
            return ({
                activeNavigationUrl: "",
                navigationItems: [],
                storyItems: [],
                title: "Please select a sub"
            });
        },
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement("h1", null, this.state.title), 
                    React.createElement(Navigation, {activeUrl: this.state.activeNavigationUrl, 
                        items: this.state.navigationItems, 
                        itemSelected: this.setSelectedItem}), 
                    React.createElement(StoryList, {items: this.state.storyItems})
                )
            );
        },
        setSelectedItem: function(item) {
            portal.Http.url("http://www.reddit.com/" + item.data.url + ".json?sort=top&t=month").get().then(function(data) {
                this.setState({storyItems: data.response.json.data.children});
            }.bind(this));
            this.setState({
                activeNavigationUrl: item.data.url,
                title: item.data.display_name
            });
        }
    });

    exports.RedditMashete = React.createClass({displayName: 'RedditMashete',
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: "Reddit", config: this.props}, 
                    React.createElement("div", {className: "redditmashete"}, 
                        React.createElement(Reddit, null)
                    )
                )
            );
        }
    });
})(portal.MashetesStore);


