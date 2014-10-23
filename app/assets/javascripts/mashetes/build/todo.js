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
                React.DOM.li({className: "list-group-item"}, 
                    React.DOM.div({className: "row"}, 
                        React.DOM.div({className: "col-md-10"}, 
                            this.props.task.name
                        ), 
                        React.DOM.div({className: "col-md-2"}, 
                            React.DOM.span({onClick: this.change, className: classes}, "Done")
                        )
                    )
                )
            );
        }
    });

    exports.TodoMashete = React.createClass({displayName: 'TodoMashete',
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
                return (TaskItem({task: item, updateDone: change}));
            });
            return (
                portal.Mashetes.Mashete({title: "Todo list", config: this.props}, 
                    React.DOM.h3(null, "Todo List"), 
                    React.DOM.div(null, 
                        React.DOM.div({className: "row"}, 
                            React.DOM.form({class: "form-inline", role: "form"}, 
                                React.DOM.div({className: "form-group col-md-10"}, 
                                    React.DOM.input({placeholder: "What do you have to do ?", type: "text", className: "form-control", value: this.state.taskName, onChange: this.updateName})
                                ), 
                                React.DOM.div({className: "form-group"}, 
                                    React.DOM.div({className: "btn-group"}, 
                                        React.DOM.button({type: "button", onClick: this.save, className: "btn btn-success"}, React.DOM.span({className: "glyphicon glyphicon-floppy-saved"})), 
                                        React.DOM.button({type: "button", onClick: this.deleteAll, className: "btn btn-danger"}, React.DOM.span({className: "glyphicon glyphicon-trash"}))
                                    )
                                )
                            )
                        )
                    ), 
                    React.DOM.ul({className: "list-group"}, 
                    displayedTasks
                    )
                )
            );
        }
    });
})(portal.MashetesStore);

