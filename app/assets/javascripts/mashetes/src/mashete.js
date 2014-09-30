/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    exports.add = function(masheteId, conf, isAdmin) {
        // TODO : so ugly ...
        // TODO : add it server side
        var id = portal.Utils.generateUUID();
        var hiding = '#left-row-' + id ;
        var template = '<div class="row" id="left-row-' + id + '">' +
        '    <div class="row droppable" id="left-drop-start-' + id + '" data-pos="start"></div>' +
        '    <div class="col-md-12 draggable" id="left-' + id + '" draggable="' + isAdmin + '" ondragover="event.preventDefault();"></div>' +
        '    <div class="row droppable" id="left-drop-stop-' + id + '" data-pos="stop"></div>'
        '</div>';
        $('#left').prepend(template);
        conf.masheteid = id;
        conf.closeCallback = function () {
            $(hiding).hide();
        };
        React.renderComponent(
            new portal.MashetesStore[masheteId](conf), document.getElementById("left-" + id)
        );
    };

    exports.Mashete = React.createClass({
        getInitialState: function() {
            return {
                hide: false,
                edit: false
            };
        },
        hide: function(e) {
            this.setState({hide: true});
            this.props.config.closeCallback();
        },
        showOptions: function(e) {
            this.setState({edit: true});
        },
        flipOptions: function(e) {
            this.setState({edit: !this.state.edit});
        },
        cancelAndHideOptions: function(e) {
            this.setState({edit: false});
        },
        saveAndHideOptions: function(e) {
            this.setState({edit: false});
            // TODO : call server to change options value
        },
        render: function() {
            if (this.state.hide) {
                return (<div></div>);
            }
            var content = this.props.children;
            if (this.state.edit) {
                content = (
                    <div>
                        <div className="row">
                            <textarea className="largeText">{JSON.stringify(this.props.config, null, 2)}</textarea>
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
            var AdminBar = (
                <div className="row mashete-bar">
                    <div className="pull-left">
                        <h5>{this.props.title}</h5>
                    </div>
                    <div className="btn-group pull-right">
                        <button type="button" className="btn btn-primary btn-xs" onClick={this.flipOptions}><span className="glyphicon glyphicon-cog"></span></button>
                        <button type="button" className="btn btn-danger btn-xs" onClick={this.hide}><span className="glyphicon glyphicon-remove"></span></button>
                    </div>
                </div>
                );
            if (portal.User.current.isNotAdmin()) {
                AdminBar = undefined;
            }
            return (
                <div className="mashete col-md-12" draggable="false" ondragover="event.preventDefault();" data-masheteid={this.props.config.masheteid}>
                    <div className="container-fluid">
                        <div class="row droppable"></div>
                            {AdminBar}
                        <div className="row">
                            <div className="col-md-12">
                                {content}
                            </div>
                        </div>
                        <div class="row droppable"></div>
                    </div>
                </div>
            );
        }
    });

})(portal.Mashetes);