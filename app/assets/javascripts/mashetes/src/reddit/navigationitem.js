var React = require('react');

module.exports = React.createClass({
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