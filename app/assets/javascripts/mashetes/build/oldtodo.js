/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var SANDBOX = 'com.foo.bar.TodoMashete';
    var DOC_TYPE = 'TodoMashete.Task';
    var repository = portal.Repository.of(SANDBOX);

    var TaskItem =  React.createClass({displayName: 'TaskItem',
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
                React.createElement("li", {className: "list-group-item"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-md-10"}, 
                            this.props.task.name
                        ), 
                        React.createElement("div", {className: "col-md-2"}, 
                            React.createElement("span", {onClick: this.change, className: classes}, "Done")
                        )
                    )
                )
                );
        }
    });

    exports.OldTodoMashete = React.createClass({displayName: 'OldTodoMashete',
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
                return (React.createElement(TaskItem, {key: item._id, task: item, updateDone: change}));
            });
            return (
                React.createElement(portal.Mashetes.Mashete, {title: "Todo list", config: this.props}, 
                    React.createElement("h3", null, "Todo List"), 
                    React.createElement("div", null, 
                        React.createElement("div", {className: "row"}, 
                            React.createElement("form", {role: "form"}, 
                                React.createElement("div", {className: "form-group col-md-10"}, 
                                    React.createElement("input", {placeholder: "What do you have to do ?", type: "text", className: "form-control", value: this.state.taskName, onChange: this.updateName})
                                ), 
                                React.createElement("div", {className: "form-group"}, 
                                    React.createElement("div", {className: "btn-group"}, 
                                        React.createElement("button", {type: "button", onClick: this.save, className: "btn btn-success"}, React.createElement("span", {className: "glyphicon glyphicon-floppy-saved"})), 
                                        React.createElement("button", {type: "button", onClick: this.deleteAll, className: "btn btn-danger"}, React.createElement("span", {className: "glyphicon glyphicon-trash"}))
                                    )
                                )
                            )
                        )
                    ), 
                    React.createElement("ul", {className: "list-group"}, 
                    displayedTasks
                    )
                )
                );
        }
    });
})(portal.MashetesStore);