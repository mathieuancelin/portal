var React = require('react');
var StoryList = require('./storylist');
var Navigation = require('./navigation');

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

module.exports = React.createClass({
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


