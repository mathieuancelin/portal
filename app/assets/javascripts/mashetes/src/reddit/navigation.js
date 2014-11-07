var React = require('react');

var NavigationItem = require('./navigationitem');

module.exports = React.createClass({
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