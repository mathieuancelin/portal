var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        this.props.bus.on('unselect', function() {
            this.setState({active: false})
        }.bind(this));
        return { active: false };
    },
    onClick: function() {
        this.props.itemSelected(this.props.item);
        this.setState({active: true});
    },
    render: function() {
        var clzz = this.props.item.progression < 0 ? 'list-group-item list-group-item-danger' : 'list-group-item list-group-item-success';
        clzz = clzz + (this.state.active ? ' active' : '');
        return (
            <li className={clzz} onClick={this.onClick} onTouch={this.onClick}>
                <div className="row">
                    <div className="col-md-10">
                        <div className="row">
                            <div className="col-md-6"><b>{this.props.item.name}</b></div>
                            <div className="col-md-6">{this.props.item.value}</div>
                        </div>
                    </div>
                    <div className="col-md-2">
                        <span className="badge">{this.props.item.progression}</span>
                    </div>
                </div>
            </li>
        );
    }
});