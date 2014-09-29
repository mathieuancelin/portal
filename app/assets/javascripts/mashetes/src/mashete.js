/** @jsx React.DOM */

var portal = portal || {};
portal.Mashetes = portal.Mashetes || {};
(function(exports) {

    function MasheteTemplate(component) {

        var AdminBar = (
            <div className="row mashete-bar">
                <div className="pull-left">
                    <h5>{component.props.title}</h5>
                </div>
                <button type="button" className="btn btn-primary btn-xs pull-right">x</button>
            </div>
        );
        if (portal.User.current.isNotAdmin()) {
            AdminBar = undefined;
        }
        return (
            <div className="mashete col-md-12" draggable="false" ondragover="event.preventDefault();" data-masheteid={component.props.masheteid}>
                <div className="container-fluid">
                    <div class="row droppable"></div>
                    {AdminBar}
                    <div className="row">
                        <div className="col-md-12">
                        {component.props.children}
                        </div>
                    </div>
                    <div class="row droppable"></div>
                </div>
            </div>
        );
    }

    exports.Mashete = React.createClass({
        render: function() {
            return MasheteTemplate(this);
        }
    });

})(portal.Mashetes);