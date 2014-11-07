var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            optionsContent: this.props.outterProps.config.markdown.decodeBase64()
        };
    },
    saveAndHideOptions: function(e) {
        this.props.save({
            markdown: this.state.optionsContent.encodeBase64()
        });
    },
    changeConfig: function(e) {
        this.setState({optionsContent: e.target.value})
    },
    render: function() {
        return (
            <div>
                <div className="row">
                    <textarea onChange={this.changeConfig} className="largeText" rows="200" value={this.state.optionsContent}></textarea>
                </div>
                <div className="row">
                    <div className="btn-group pull-right">
                        <button type="button" onClick={this.cancelAndHideOptions} className="btn btn-sm btn-danger">Cancel</button>
                        <button type="button" onClick={this.saveAndHideOptions} className="btn btn-sm btn-primary">Ok</button>
                    </div>
                </div>
            </div>
        );
    }
});