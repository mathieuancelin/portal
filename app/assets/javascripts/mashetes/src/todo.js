/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var SANDBOX = 'com.foo.bar.TodoMashete';
    var DOC_TYPE = 'TodoMashete.Task';
    var repository = portal.Repository.of(SANDBOX);

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
            var cx = React.addons.classSet;
            var classes = cx({
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

    exports.TodoMashete = React.createClass({
        getInitialState: function() {
            return {
                tasks: [],
                taskName: ''
            };
        },
        componentDidMount: function() {
            this.reloadList();
        },
        updateName: function(e) {
            this.setState({taskName: e.target.value});
        },
        reloadList: function() {
            repository.search({ docType: DOC_TYPE }).then(function(data) {
                this.setState({tasks: data || []});
            }.bind(this));
        },
        save: function() {
            var task = {
                name: this.state.taskName,
                done: false,
                docType: DOC_TYPE
            };
            var fakeTasks = this.state.tasks;
            fakeTasks.push(task);
            this.setState({tasks: fakeTasks}); // for user responsiveness
            repository.save(task).then(function() {
                this.reloadList();
                this.setState({taskName: ''});
            }.bind(this));
        },
        deleteAll: function() {
            repository.removeSelection({
                docType: DOC_TYPE,
                done: true
            }).then(function() {
                this.reloadList();
            }.bind(this));
        },
        render: function() {
            var _this = this;
            var displayedTasks = _.map(this.state.tasks, function(item) {
                function change(id, done) {
                    repository.save({
                        docType: DOC_TYPE,
                        _id: id,
                        done: done
                    }).then(function() {
                        _this.reloadList();
                    }.bind(_this));
                }
                return (<TaskItem key={item._id} task={item} updateDone={change}/>);
            });
            return (
                <portal.Mashetes.Mashete title="Todo list" config={this.props}>
                    <h3>Todo List</h3>
                    <div>
                        <div className="row">
                            <form role="form">
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


(function(exports) {

    var Constants = {
        SAVE_NEW_TASK: 'SAVE_NEW_TASK',
        DELETE_DONE_TASKS: 'DELETE_DONE_TASK',
        CHANGE_TASK_STATE: 'CHANGE_TASK_STATE',
        TASKS_CHANGED: 'TASKS_CHANGED',
        TASKS_ADDED: 'TASKS_ADDED'
    };

    var TaskActions = {
        saveNewTask: function(text) {
            Dispatcher.trigger(Constants.SAVE_NEW_TASK, {text: text});
        },
        deleteDone: function() {
            Dispatcher.trigger(Constants.DELETE_DONE_TASKS, {});
        },
        changeTaskState: function(id, done) {
            Dispatcher.trigger(Constants.CHANGE_TASK_STATE, {id: id, done: done});
        }
    };

    var Dispatcher = _.extend({}, Backbone.Events);

    var TaskStore = (function() {

        var SANDBOX = 'com.foo.bar.TodoMashete';
        var DOC_TYPE = 'TodoMashete.Task';
        var repository = portal.Repository.of(SANDBOX);
        var tasks = [];

        function updateStore() {
            repository.search({ docType: DOC_TYPE }).then(function(data) {
                tasks = data;
                console.log('tasks changed !!!');
                Dispatcher.trigger(Constants.TASKS_CHANGED);
            });
        }

        function createNewTask(text) {
            var task = {
                name: text,
                done: false,
                docType: DOC_TYPE
            };
            repository.save(task).then(function() {
                Dispatcher.trigger(Constants.TASKS_ADDED);
                updateStore();
            });
        }

        function deleteAllDone() {
            repository.removeSelection({
                docType: DOC_TYPE,
                done: true
            }).then(function() {
                updateStore();
            });
        }

        function flipTaskState(id, done) {
            console.log('Set state of ' + id + ' to ' + done);
            repository.save({
                docType: DOC_TYPE,
                _id: id,
                done: done
            }).then(function() {
                updateStore();
            });
        }

        Dispatcher.on(Constants.SAVE_NEW_TASK, function(data) {
            createNewTask(data.text);
        });
        Dispatcher.on(Constants.DELETE_DONE_TASKS, function() {
            deleteAllDone();
        });
        Dispatcher.on(Constants.CHANGE_TASK_STATE, function(data) {
            flipTaskState(data.id, data.done);
        });
        return {
            init: updateStore,
            getAllTasks: function() {
                return tasks;
            }
        };
    })();

    var TaskItem =  React.createClass({
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
            var cx = React.addons.classSet;
            var classes = cx({
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

    var TodoApp = React.createClass({
        getInitialState: function() {
            return {
                tasks: [],
                taskName: ''
            };
        },
        componentDidMount: function() {
            TaskStore.init();
            Dispatcher.on(Constants.TASKS_CHANGED, function() {
                console.log('Re-render tasks ');
                this.setState({
                    tasks: TaskStore.getAllTasks()
                });
            }.bind(this));
            Dispatcher.on(Constants.TASKS_ADDED, function() {
                console.log('Cleanup text ');
                this.setState({
                    taskName: ''
                });
            }.bind(this));
        },
        updateName: function(e) {
            this.setState({taskName: e.target.value});
        },
        save: function() {
            TaskActions.saveNewTask(this.state.taskName);
        },
        deleteAll: function() {
            TaskActions.deleteDone();
        },
        render: function() {
            var displayedTasks = _.map(this.state.tasks, function(item) {
                return (<TaskItem key={item._id} task={item}/>);
            });
            return (
                <portal.Mashetes.Mashete title="Todo list" config={this.props}>
                    <h3>Todo List</h3>
                    <div>
                        <div className="row">
                            <form role="form">
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

    exports.TodoMashete = TodoApp;
})(portal.MashetesStore);

