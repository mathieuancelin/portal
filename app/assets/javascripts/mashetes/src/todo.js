/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var DATA_NAME = 'com.foo.bar.TodoMashete.tasks';

    var TaskItem =  React.createClass({
        getInitialState: function () {
            return {
                done: this.props.task.done
            };
        },
        change: function() {
            this.setState({done: !this.state.done}, function() {
                this.props.updateDone(this.props.task._id, this.state.done);
            }.bind(this));
        },
        render: function () {
            var classes = 'label ';
            if (this.state.done) {
                classes = classes + 'label-success'
            } else {
                classes = classes + 'label-default'
            }
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


    exports.TodoMashete = React.createClass({
        getInitialState: function() {
            return {
                tasks: [],
                taskName: ''
            };
        },
        componentDidMount: function() {
            portal.Repository.findById(DATA_NAME).then(function(data) {
                this.setState({tasks: data.tasks || []});
            }.bind(this));
        },
        updateName: function(e) {
            this.setState({taskName: e.target.value});
        },
        save: function() {
            var tasks = this.state.tasks;
            var name = this.state.taskName;
            var task = {
                name: name,
                done: false,
                _id: portal.Utils.generateUUID()
            };
            tasks.push(task);
            this.setState({tasks: tasks}, function() {
                portal.Repository.save({
                    _id: DATA_NAME,
                    tasks: tasks
                }).then(function(data) {
                    this.setState({tasks: data.tasks, taskName: ''});
                }.bind(this));
            }.bind(this));
        },
        deleteAll: function() {
            var tasks = this.state.tasks;
            var newTasks = _.filter(tasks, function(task) { return !task.done; });
            portal.Repository.save({
                _id: DATA_NAME,
                tasks: newTasks
            }).then(function(data) {
                this.setState({tasks: data.tasks});
            }.bind(this));
        },
        render: function() {
            var _this = this;
            var displayedTasks = _.map(this.state.tasks, function(item) {
                function change(id, done) {
                    var tasks = _.map(_this.state.tasks, function(task) {
                        if (id === task._id) {
                            var newTask = _.extend({}, task);
                            newTask.done = done;
                            return newTask;
                        }
                        return task;
                    });
                    portal.Repository.save({
                        _id: DATA_NAME,
                        tasks: tasks
                    }).then(function(data) {
                        this.setState({tasks: data.tasks});
                    }.bind(_this));
                }
                return (<TaskItem task={item} updateDone={change}/>);
            });
            return (
                <portal.Mashetes.Mashete title="Todo list" config={this.props}>
                    <h3>Todo List</h3>
                    <div>
                        <div className="row">
                            <form class="form-inline" role="form">
                                <div className="form-group col-md-10">
                                    <input placeholder="What do you have to do ?" type="text" className="form-control" value={this.state.taskName} onChange={this.updateName}/>
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
                    <ul className="list-group">
                    {displayedTasks}
                    </ul>
                </portal.Mashetes.Mashete>
                );
        }
    });
})(portal.MashetesStore);

