/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var NavigationItem = React.createClass({
        onClick: function() {
            this.props.itemSelected(this.props.item);
        },
        render: function() {
            return (
                <li onClick={this.onClick} className={this.props.selected ? "list-group-item active" : "list-group-item"}>
                {this.props.item.data.display_name}
                </li>
            );
        }
    });

    var Navigation = React.createClass({
        setSelectedItem: function(item) {
            this.props.itemSelected(item);
        },
        render: function() {
            var _this = this;

            var items = this.props.items.map(function(item) {
                return (
                    <NavigationItem key={item.data.id}
                        item={item} itemSelected={_this.setSelectedItem}
                        selected={item.data.url === _this.props.activeUrl} />
                    );
            });

            return (
                <div className="navigation">
                    <div className="header">Navigation</div>
                    <ul className="list-group">
                    {items}
                    </ul>
                </div>
            );
        }
    });

    var StoryList = React.createClass({
        render: function() {
            var storyNodes = this.props.items.map(function(item) {
                return (
                    <tr key={item.data.url}>
                        <td>
                            <p className="score">{item.data.score}</p>
                        </td>
                        <td>
                            <p className="title">
                                <a href={item.data.url} target="_blank">
                                {item.data.title}
                                </a>
                            </p>
                            <p className="author">
                            Posted by <b>{item.data.author}</b>
                            </p>
                        </td>
                    </tr>
                );
            });

            return (
                <table>
                    <tbody>
                    {storyNodes}
                    </tbody>
                </table>
            );
        }
    });

    var Reddit = React.createClass({
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
                <div>
                    <h1>{this.state.title}</h1>
                    <Navigation activeUrl={this.state.activeNavigationUrl}
                        items={this.state.navigationItems}
                        itemSelected={this.setSelectedItem} />
                    <StoryList items={this.state.storyItems} />
                </div>
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

    exports.RedditMashete = React.createClass({
        render: function() {
            return (
                <portal.Mashetes.Mashete title="Reddit" config={this.props}>
                    <div className="redditmashete">
                        <Reddit />
                    </div>
                </portal.Mashetes.Mashete>
            );
        }
    });
})(portal.MashetesStore);


