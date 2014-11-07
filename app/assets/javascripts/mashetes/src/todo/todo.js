// Nicer version of the Todo App using Flux like architecture (http://facebook.github.io/flux/)

var React = require('react');
var TaskConstants = require('./constants');
var TaskStore = require('./taskstore.js');
var TaskItem = require('./taskitem');
var NewTask = require('./newtask');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            tasks: []
        };
    },
    reloadTasks: function() {
        console.log('Re-render tasks');
        this.setState({
            tasks: TaskStore.getAllTasks()
        });
    },
    componentDidMount: function() {
        TaskStore.init();
        TaskStore.on(TaskConstants.TASKS_CHANGED, this.reloadTasks);
    },
    componentWillUnmount: function() {
        TaskStore.off(TaskConstants.TASKS_CHANGED, this.reloadTasks);
    },
    render: function() {
        var displayedTasks = _.map(this.state.tasks, function(item) {
            return (<TaskItem key={item._id} task={item}/>);
        });
        return (
            <portal.Mashetes.Mashete title="Todo list" config={this.props}>
                <h3>Todo List</h3>
                <NewTask />
                <ul className="list-group">
                {displayedTasks}
                </ul>
            </portal.Mashetes.Mashete>
        );
    }
});
