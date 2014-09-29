/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    exports.Mashete = React.createClass({
        getInitialState: function() {
            return {hide: false};
        },
        hide: function(e) {
            console.log("hiding !!!");
            this.setState({hide: true});
        },
        render: function() {
            if (this.state.hide) {
                return (<div></div>);
            }
            var AdminBar = (
                <div className="row mashete-bar">
                    <div className="pull-left">
                        <h5>{this.props.title}</h5>
                    </div>
                    <button type="button" className="btn btn-primary btn-xs pull-right" onClick={this.hide}>x</button>
                </div>
                );
            if (portal.User.current.isNotAdmin()) {
                AdminBar = undefined;
            }
            return (
                <div className="mashete col-md-12" draggable="false" ondragover="event.preventDefault();" data-masheteid={this.props.masheteid}>
                    <div className="container-fluid">
                        <div class="row droppable"></div>
                    {AdminBar}
                        <div className="row">
                            <div className="col-md-12">
                                {this.props.children}
                            </div>
                        </div>
                        <div class="row droppable"></div>
                    </div>
                </div>
            );
        }
    });

})(portal.Mashetes);