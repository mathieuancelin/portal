var React = require('react');
var TaskConstants = require('./constants');
var TaskStore = require('./taskstore.js');
var TaskActions = require('./actions');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            taskName: ''
        };
    },
    clearTaskName: function() {
        console.log('Cleanup text');
        this.setState({
            taskName: ''
        });
    },
    componentDidMount: function() {
        TaskStore.on(TaskConstants.TASKS_ADDED, this.clearTaskName);
    },
    componentWillUnmount: function() {
        TaskStore.off(TaskConstants.TASKS_ADDED, this.clearTaskName);
    },
    updateName: function(e) {
        this.setState({taskName: e.target.value});
    },
    save: function() {
        if (this.state.taskName && this.state.taskName !== '') {
            TaskActions.saveNewTask(this.state.taskName);
        }
    },
    deleteAll: function() {
        TaskActions.deleteDone();
    },
    keyPress: function(e) {
        if (e.key === 'Enter') {
            this.save();
            e.preventDefault();
        }
    },
    render: function() {
        return (
            <div>
                <div className="row">
                    <form role="form">
                        <div className="form-group col-md-10">
                            <input placeholder="What do you have to do ?" type="text" className="form-control" value={this.state.taskName} onChange={this.updateName} onKeyPress={this.keyPress}/>
                        </div>
                        <div className="form-group">
                            <div className="btn-group">
                                <button type="button" onClick={this.save} className="btn btn-success"><span className="glyphicon glyphicon-floppy-saved"></span></button>
                                <button type="button" onClick={this.deleteAll} className="btn btn-danger"><span className="glyphicon glyphicon-trash"></span></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});