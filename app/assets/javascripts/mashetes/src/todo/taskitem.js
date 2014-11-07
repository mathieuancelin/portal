var React = require('react');
var TaskActions = require('./actions');
var addons = require('react-addons');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            done: this.props.task.done
        };
    },
    change: function() {
        console.log('Flip state of task ' + this.props.task._id);
        TaskActions.changeTaskState(this.props.task._id, !this.state.done);
        this.setState({
            done: !this.state.done
        });
    },
    render: function () {
        var cx = addons.classSet;
        var classes = cx({
            'task-done': true,
            'label': true,
            'label-success': this.state.done,
            'label-default': !this.state.done
        });
        return (
            <li className="list-group-item">
                <div className="row">
                    <div className="col-md-10">
                        {this.props.task.name}
                    </div>
                    <div className="col-md-2">
                        <span onClick={this.change} className={classes}>Done</span>
                    </div>
                </div>
            </li>
        );
    }
});