var TaskConstants = require('./constants');
var TaskDispatcher = require('./dispatcher');

module.exports = {
    saveNewTask: function(text) {
        TaskDispatcher.trigger(TaskConstants.SAVE_NEW_TASK, {text: text});
    },
    deleteDone: function() {
        TaskDispatcher.trigger(TaskConstants.DELETE_DONE_TASKS, {});
    },
    changeTaskState: function(id, done) {
        TaskDispatcher.trigger(TaskConstants.CHANGE_TASK_STATE, {id: id, done: done});
    }
};