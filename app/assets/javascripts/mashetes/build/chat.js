/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {

    var ChatConstants = {
        ActionTypes: portal.Utils.keyMirror({
            CLICK_THREAD: null,
            CREATE_MESSAGE: null,
            RECEIVE_RAW_CREATED_MESSAGE: null,
            RECEIVE_RAW_MESSAGES: null
        }),

        PayloadSources: portal.Utils.keyMirror({
            SERVER_ACTION: null,
            VIEW_ACTION: null
        })
    };

    var ChatMessageUtils = {
        convertRawMessage: function(rawMessage, currentThreadID) {
            return {
                id: rawMessage.id,
                threadID: rawMessage.threadID,
                authorName: rawMessage.authorName,
                date: new Date(rawMessage.timestamp),
                text: rawMessage.text,
                isRead: rawMessage.threadID === currentThreadID
            };
        }
    };

    var ChatWebAPIUtils = {
        getAllMessages: function() {
            // simulate retrieving data from a database
            var rawMessages = JSON.parse(localStorage.getItem('messages'));

            // simulate success callback
            ChatServerActionCreators.receiveAll(rawMessages);
        },

        createMessage: function(message, threadName) {
            // simulate writing to a database
            var rawMessages = JSON.parse(localStorage.getItem('messages'));
            var timestamp = Date.now();
            var id = 'm_' + timestamp;
            var threadID = message.threadID || ('t_' + Date.now());
            var createdMessage = {
                id: id,
                threadID: threadID,
                threadName: threadName,
                authorName: message.authorName,
                text: message.text,
                timestamp: timestamp
            };
            rawMessages.push(createdMessage);
            localStorage.setItem('messages', JSON.stringify(rawMessages));

            // simulate success callback
            setTimeout(function() {
                ChatServerActionCreators.receiveCreatedMessage(createdMessage);
            }, 200);
        }
    };

    var ChatServerActionCreators = {
        receiveAll: function(rawMessages) {
            ChatAppDispatcher.handleServerAction({
                type: ChatConstants.ActionTypes.RECEIVE_RAW_MESSAGES,
                rawMessages: rawMessages
            });
        },

        receiveCreatedMessage: function(createdMessage) {
            ChatAppDispatcher.handleServerAction({
                type: ChatConstants.ActionTypes.RECEIVE_RAW_CREATED_MESSAGE,
                rawMessage: createdMessage
            });
        }
    };
    var ChatThreadActionCreators = {
        clickThread: function(threadID) {
            ChatAppDispatcher.handleViewAction({
                type: ChatConstants.ActionTypes.CLICK_THREAD,
                threadID: threadID
            });
        }
    };
    var ChatMessageActionCreators = {
        createMessage: function(text) {
            console.log('ChatMessageActionCreators.createMessage(' + text + ')');
            ChatAppDispatcher.handleViewAction({
                type: ChatConstants.ActionTypes.CREATE_MESSAGE,
                text: text
            });
            var message = MessageStore.getCreatedMessageData(text);
            ChatWebAPIUtils.createMessage(message);
        }
    };

    var ChatAppDispatcher = portal.Utils.Dispatcher({
        handleServerAction: function(action) {
            var payload = {
                source: ChatConstants.PayloadSources.SERVER_ACTION,
                action: action
            };
            this.dispatch(payload);
        },
        handleViewAction: function(action) {
            var payload = {
                source: ChatConstants.PayloadSources.VIEW_ACTION,
                action: action
            };
            this.dispatch(payload);
        }
    });

    var ThreadStore = (function() {

        var ActionTypes = ChatConstants.ActionTypes;
        var CHANGE_EVENT = 'change';

        var _currentID = null;
        var _threads = {};

        var _emitter = _.extend({}, Backbone.Events);

        var InternalThreadStore = {
            init: function(rawMessages) {
                rawMessages.forEach(function(message) {
                    var threadID = message.threadID;
                    var thread = _threads[threadID];
                    if (thread && thread.lastTimestamp > message.timestamp) {
                        return;
                    }
                    _threads[threadID] = {
                        id: threadID,
                        name: message.threadName,
                        lastMessage: ChatMessageUtils.convertRawMessage(message, _currentID)
                    };
                }, this);

                if (!_currentID) {
                    var allChrono = this.getAllChrono();
                    _currentID = allChrono[allChrono.length - 1].id;
                }

                _threads[_currentID].lastMessage.isRead = true;
            },
            emitChange: function() {
                _emitter.trigger(CHANGE_EVENT, {});
            },
            addChangeListener: function(callback) {
                _emitter.on(CHANGE_EVENT, callback);
            },
            removeChangeListener: function(callback) {
                _emitter.off(CHANGE_EVENT, callback);
            },
            get: function(id) {
                return _threads[id];
            },

            getAll: function() {
                return _threads;
            },
            getAllChrono: function() {
                var orderedThreads = [];
                for (var id in _threads) {
                    var thread = _threads[id];
                    orderedThreads.push(thread);
                }
                orderedThreads.sort(function(a, b) {
                    if (a.lastMessage.date < b.lastMessage.date) {
                        return -1;
                    } else if (a.lastMessage.date > b.lastMessage.date) {
                        return 1;
                    }
                    return 0;
                });
                return orderedThreads;
            },
            getCurrentID: function() {
                return _currentID;
            },
            getCurrent: function() {
                return this.get(this.getCurrentID());
            }
        };

        InternalThreadStore.dispatchToken = ChatAppDispatcher.register(function(payload) {
            var action = payload.action;

            switch(action.type) {

                case ActionTypes.CLICK_THREAD:
                    _currentID = action.threadID;
                    _threads[_currentID].lastMessage.isRead = true;
                    InternalThreadStore.emitChange();
                    break;

                case ActionTypes.RECEIVE_RAW_MESSAGES:
                    InternalThreadStore.init(action.rawMessages);
                    InternalThreadStore.emitChange();
                    break;

                default:
                // do nothing
            }
        });
        return InternalThreadStore;
    })();

    var UnreadThreadStore = (function() {

        var ActionTypes = ChatConstants.ActionTypes;
        var CHANGE_EVENT = 'change';
        var _emitter = _.extend({}, Backbone.Events);

        var InternalUnreadThreadStore = {
            emitChange: function() {
                _emitter.trigger(CHANGE_EVENT, {});
            },
            addChangeListener: function(callback) {
                _emitter.on(CHANGE_EVENT, callback);
            },
            removeChangeListener: function(callback) {
                _emitter.off(CHANGE_EVENT, callback);
            },
            getCount: function() {
                var threads = ThreadStore.getAll();
                var unreadCount = 0;
                for (var id in threads) {
                    if (!threads[id].lastMessage.isRead) {
                        unreadCount++;
                    }
                }
                return unreadCount;
            }
        };

        InternalUnreadThreadStore.dispatchToken = ChatAppDispatcher.register(function(payload) {
            ChatAppDispatcher.waitFor([
                ThreadStore.dispatchToken,
                MessageStore.dispatchToken
            ]);
            var action = payload.action;
            switch (action.type) {

                case ActionTypes.CLICK_THREAD:
                    InternalUnreadThreadStore.emitChange();
                    break;

                case ActionTypes.RECEIVE_RAW_MESSAGES:
                    InternalUnreadThreadStore.emitChange();
                    break;

                default:
                // do nothing
            }
        });
        return InternalUnreadThreadStore;
    })();

    var MessageStore = (function() {

        var ActionTypes = ChatConstants.ActionTypes;
        var CHANGE_EVENT = 'change';
        var _emitter = _.extend({}, Backbone.Events);
        var _messages = {};

        function _addMessages(rawMessages) {
            rawMessages.forEach(function(message) {
                if (!_messages[message.id]) {
                    _messages[message.id] = ChatMessageUtils.convertRawMessage(
                        message,
                        ThreadStore.getCurrentID()
                    );
                }
            });
        }

        function _markAllInThreadRead(threadID) {
            for (var id in _messages) {
                if (_messages[id].threadID === threadID) {
                    _messages[id].isRead = true;
                }
            }
        }

        var InternalMessageStore = {
            emitChange: function() {
                _emitter.trigger(CHANGE_EVENT, {});
            },
            addChangeListener: function(callback) {
                _emitter.on(CHANGE_EVENT, callback);
            },
            get: function(id) {
                return _messages[id];
            },
            getAll: function() {
                return _messages;
            },
            getAllForThread: function(threadID) {
                console.log('searching messages for thread  ' + ThreadStore.getCurrentID());

                var threadMessages = [];
                for (var id in _messages) {
                    if (_messages[id].threadID === threadID) {
                        threadMessages.push(_messages[id]);
                    }
                }
                threadMessages.sort(function(a, b) {
                    if (a.date < b.date) {
                        return -1;
                    } else if (a.date > b.date) {
                        return 1;
                    }
                    return 0;
                });
                console.log('thread messages are' + JSON.stringify(threadMessages));
                return threadMessages;
            },
            getAllForCurrentThread: function() {
                console.log('getAllForCurrentThread ' + ThreadStore.getCurrentID());
                return this.getAllForThread(ThreadStore.getCurrentID());
            },
            getCreatedMessageData: function(text) {
                var timestamp = Date.now();
                return {
                    id: 'm_' + timestamp,
                    threadID: ThreadStore.getCurrentID(),
                    authorName: 'Bill', // hard coded for the example
                    date: new Date(timestamp),
                    text: text,
                    isRead: true
                };
            }
        };

        InternalMessageStore.dispatchToken = ChatAppDispatcher.register(function(payload) {

            var action = payload.action;

            switch(action.type) {

                case ActionTypes.CLICK_THREAD:
                    ChatAppDispatcher.waitFor([ThreadStore.dispatchToken]);
                    _markAllInThreadRead(ThreadStore.getCurrentID());
                    InternalMessageStore.emitChange();
                    break;

                case ActionTypes.CREATE_MESSAGE:
                    console.log('InternalMessageStore.received ActionTypes.CREATE_MESSAGE');
                    var message = InternalMessageStore.getCreatedMessageData(action.text);
                    console.log('new message is : ' + JSON.stringify(message));
                    _messages[message.id] = message;
                    InternalMessageStore.emitChange();
                    break;

                case ActionTypes.RECEIVE_RAW_MESSAGES:
                    _addMessages(action.rawMessages);
                    ChatAppDispatcher.waitFor([ThreadStore.dispatchToken]);
                    _markAllInThreadRead(ThreadStore.getCurrentID());
                    InternalMessageStore.emitChange();
                    break;

                default:
                // do nothing
            }
        });
        return InternalMessageStore;
    })();

    var ChatExampleData = {
        init: function() {
            localStorage.clear();
            localStorage.setItem('messages', JSON.stringify([
                {
                    id: 'm_1',
                    threadID: 't_1',
                    threadName: 'Jing and Bill',
                    authorName: 'Bill',
                    text: 'Hey Jing, want to give a Flux talk at ForwardJS?',
                    timestamp: Date.now() - 99999
                },
                {
                    id: 'm_2',
                    threadID: 't_1',
                    threadName: 'Jing and Bill',
                    authorName: 'Bill',
                    text: 'Seems like a pretty cool conference.',
                    timestamp: Date.now() - 89999
                },
                {
                    id: 'm_3',
                    threadID: 't_1',
                    threadName: 'Jing and Bill',
                    authorName: 'Jing',
                    text: 'Sounds good.  Will they be serving dessert?',
                    timestamp: Date.now() - 79999
                },
                {
                    id: 'm_4',
                    threadID: 't_2',
                    threadName: 'Dave and Bill',
                    authorName: 'Bill',
                    text: 'Hey Dave, want to get a beer after the conference?',
                    timestamp: Date.now() - 69999
                },
                {
                    id: 'm_5',
                    threadID: 't_2',
                    threadName: 'Dave and Bill',
                    authorName: 'Dave',
                    text: 'Totally!  Meet you at the hotel bar.',
                    timestamp: Date.now() - 59999
                },
                {
                    id: 'm_6',
                    threadID: 't_3',
                    threadName: 'Functional Heads',
                    authorName: 'Bill',
                    text: 'Hey Brian, are you going to be talking about functional stuff?',
                    timestamp: Date.now() - 49999
                },
                {
                    id: 'm_7',
                    threadID: 't_3',
                    threadName: 'Bill and Brian',
                    authorName: 'Brian',
                    text: 'At ForwardJS?  Yeah, of course.  See you there!',
                    timestamp: Date.now() - 39999
                }
            ]));
        }
    };


    var MessageComposer = React.createClass({displayName: 'MessageComposer',

        ENTER_KEY_CODE: 13,
        getInitialState: function() {
            return {text: ''};
        },

        render: function() {
            return (
                React.createElement("textarea", {
                className: "message-composer", 
                name: "message", 
                value: this.state.text, 
                onChange: this._onChange, 
                onKeyDown: this._onKeyDown}
                )
                );
        },

        _onChange: function(event, value) {
            this.setState({text: event.target.value});
        },

        _onKeyDown: function(event) {
            if (event.keyCode === this.ENTER_KEY_CODE) {
                event.preventDefault();
                var text = this.state.text.trim();
                if (text) {
                    ChatMessageActionCreators.createMessage(text);
                }
                this.setState({text: ''});
            }
        }

    });

    var MessageListItem = React.createClass({displayName: 'MessageListItem',

        render: function() {
            var message = this.props.message;
            return (
                React.createElement("li", {className: "message-list-item"}, 
                    React.createElement("h5", {className: "message-author-name"}, message.authorName), 
                    React.createElement("div", {className: "message-time"}, 
          message.date.toLocaleTimeString()
                    ), 
                    React.createElement("div", {className: "message-text"}, message.text)
                )
                );
        }

    });

    var MessageSection = React.createClass({displayName: 'MessageSection',
        getStateFromStores: function() {
            console.log('___getStateFromStores');
            return {
                messages: MessageStore.getAllForCurrentThread(),
                thread: ThreadStore.getCurrent()
            };
        },
        getMessageListItem: function(message) {
            return (
                React.createElement(MessageListItem, {
                    key: message.id, 
                    message: message}
                )
            );
        },
        getInitialState: function() {
            return this.getStateFromStores();
        },

        componentDidMount: function() {
            this._scrollToBottom();
            MessageStore.addChangeListener(this._onChange);
            ThreadStore.addChangeListener(this._onChange);
        },

        componentWillUnmount: function() {
            MessageStore.removeChangeListener(this._onChange);
            ThreadStore.removeChangeListener(this._onChange);
        },

        render: function() {
            var messageListItems = _.map(this.state.messages, this.getMessageListItem);
            var thread = this.state.thread || { name: 'Pouet' };
            return (
                React.createElement("div", {className: "message-section"}, 
                    React.createElement("h3", {className: "message-thread-heading"}, thread.name), 
                    React.createElement("ul", {className: "message-list", ref: "messageList"}, 
          messageListItems
                    ), 
                    React.createElement(MessageComposer, null)
                )
                );
        },

        componentDidUpdate: function() {
            this._scrollToBottom();
        },

        _scrollToBottom: function() {
            var ul = this.refs.messageList.getDOMNode();
            ul.scrollTop = ul.scrollHeight;
        },

        /**
         * Event handler for 'change' events coming from the MessageStore
         */
        _onChange: function() {
            console.log('_onChange, reset state');
            this.setState(this.getStateFromStores());
        }

    });

    var ThreadListItem = React.createClass({displayName: 'ThreadListItem',

        render: function() {
            var thread = this.props.thread;
            var lastMessage = thread.lastMessage;
            var cx = React.addons.classSet;
            return (
                React.createElement("li", {
                className: cx({
                    'thread-list-item': true,
                    'active': thread.id === this.props.currentThreadID
                }), 
                onClick: this._onClick}, 
                    React.createElement("h5", {className: "thread-name"}, thread.name), 
                    React.createElement("div", {className: "thread-time"}, 
          lastMessage.date.toLocaleTimeString()
                    ), 
                    React.createElement("div", {className: "thread-last-message"}, 
          lastMessage.text
                    )
                )
                );
        },

        _onClick: function() {
            ChatThreadActionCreators.clickThread(this.props.thread.id);
        }

    });


    var ThreadSection = React.createClass({displayName: 'ThreadSection',
        getStateFromStores: function() {
            return {
                threads: ThreadStore.getAllChrono(),
                currentThreadID: ThreadStore.getCurrentID(),
                unreadCount: UnreadThreadStore.getCount()
            };
        },
        getInitialState: function() {
            return this.getStateFromStores();
        },
        componentDidMount: function() {
            ThreadStore.addChangeListener(this._onChange);
            UnreadThreadStore.addChangeListener(this._onChange);
        },
        componentWillUnmount: function() {
            ThreadStore.removeChangeListener(this._onChange);
            UnreadThreadStore.removeChangeListener(this._onChange);
        },
        render: function() {
            var threadListItems = _.map(this.state.threads, function(thread) {
                return (
                    React.createElement(ThreadListItem, {
                    key: thread.id, 
                    thread: thread, 
                    currentThreadID: this.state.currentThreadID}
                    )
                    );
            }, this);
            var unread =
                    this.state.unreadCount === 0 ?
                null :
                React.createElement("span", null, "Unread threads: ", this.state.unreadCount);
            return (
                React.createElement("div", {className: "thread-section"}, 
                    React.createElement("div", {className: "thread-count"}, 
          unread
                    ), 
                    React.createElement("ul", {className: "thread-list"}, 
          threadListItems
                    )
                )
                );
        },

        /**
         * Event handler for 'change' events coming from the stores
         */
        _onChange: function() {
            this.setState(this.getStateFromStores());
        }
    });

    var ChatApp = React.createClass({displayName: 'ChatApp',
        render: function() {
            return (
                React.createElement("div", {className: "chatapp"}, 
                    React.createElement(ThreadSection, null), 
                    React.createElement(MessageSection, null)
                )
                );
        }
    });

    exports.ChatMashete = React.createClass({displayName: 'ChatMashete',
        componentDidMount: function() {
            ChatExampleData.init(); // load example data into localstorage
            ChatWebAPIUtils.getAllMessages();
        },
        render: function() {
            return React.createElement(ChatApp, null);
        }
    });
})(portal.MashetesStore);