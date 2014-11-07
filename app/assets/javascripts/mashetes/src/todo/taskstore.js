var React = require('react');
var TaskConstants = require('./constants');
var TaskDispatcher = require('./dispatcher');

var SANDBOX = 'com.foo.bar.TodoMashete';
var DOC_TYPE = 'TodoMashete.Task';
var repository = portal.Repository.of(SANDBOX);
var tasks = [];
var notifier = _.extend({}, Backbone.Events);

function notifyChanges() {
    notifier.trigger(TaskConstants.TASKS_CHANGED, tasks);
}

function updateStore() {
    repository.search({ docType: DOC_TYPE }).then(function(data) {
        tasks = data;
        console.log('tasks changed !!!');
        notifyChanges();
    });
}

function createNewTask(text) {
    var task = {
        name: text,
        done: false,
        docType: DOC_TYPE
    };
    repository.save(task).then(function() {
        notifier.trigger(TaskConstants.TASKS_ADDED);
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

TaskDispatcher.on(TaskConstants.SAVE_NEW_TASK, function(data) {
    createNewTask(data.text);
});
TaskDispatcher.on(TaskConstants.DELETE_DONE_TASKS, function() {
    deleteAllDone();
});
TaskDispatcher.on(TaskConstants.CHANGE_TASK_STATE, function(data) {
    flipTaskState(data.id, data.done);
});

module.exports =  {
    init: updateStore,
    on: function(what, callback) {
        notifier.on(what, callback);
    },
    off: function(what, callback) {
        notifier.off(what, callback);
    },
    getAllTasks: function() {
        return tasks;
    }
};
