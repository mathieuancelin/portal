/** @jsx React.DOM */

var portal = portal || {};
portal.MashetesStore = portal.MashetesStore || {};
(function(exports) {
    exports.MongoMashete = React.createClass({
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
                <portal.Mashetes.Mashete title="Clock" config={this.props}>
                    <input type="text" value={this.state.inputId} onChange={this.changeId}/>
                    <textarea onChange={this.changeQuery} className="largeText" value={this.state.inputQuery}></textarea>
                    <button type="button" className="btn btn-primary" onClick={this.findById}>findById</button>
                    <button type="button" className="btn btn-primary" onClick={this.search}>search</button>
                    <button type="button" className="btn btn-primary" onClick={this.save}>save</button>
                    <button type="button" className="btn btn-primary" onClick={this.remove}>delete</button>
                    <button type="button" className="btn btn-primary" onClick={this.findAll}>findAll</button>
                    <button type="button" className="btn btn-primary" onClick={this.deleteAll}>deleteAll</button>
                    <textarea className="largeText" value={this.state.output}></textarea>
                </portal.Mashetes.Mashete>
                );
        }
    });
})(portal.MashetesStore);

