/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.MongoMashete = React.createClass({displayName: 'MongoMashete',
        getInitialState: function() {
            return {
                inputId: '',
                inputQuery: '',
                output: ''
            };
        },
        changeId: function(e) {
            this.setState({inputId: e.target.value})
        },
        changeQuery: function(e) {
            this.setState({inputQuery: e.target.value})
        },
        findById: function() {
            portal.Repository.findById(this.state.inputId).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        search: function() {
            portal.Repository.search(JSON.parse(this.state.inputQuery)).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        save: function() {
            portal.Repository.save(JSON.parse(this.state.inputQuery)).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        remove: function() {
            portal.Repository.remove(this.state.inputId).then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        findAll: function() {
            portal.Repository.findAll().then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        deleteAll: function() {
            portal.Repository.deleteAll().then(function(data) {
                this.setState({output: JSON.stringify(data)});
            }.bind(this));
        },
        render: function() {
            return (
                React.createElement(portal.Mashetes.Mashete, {title: "Clock", config: this.props}, 
                    React.createElement("input", {type: "text", value: this.state.inputId, onChange: this.changeId}), 
                    React.createElement("textarea", {onChange: this.changeQuery, className: "largeText", value: this.state.inputQuery}), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.findById}, "findById"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.search}, "search"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.save}, "save"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.remove}, "delete"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.findAll}, "findAll"), 
                    React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.deleteAll}, "deleteAll"), 
                    React.createElement("textarea", {className: "largeText", value: this.state.output})
                )
                );
        }
    });
})(portal.MashetesStore);

