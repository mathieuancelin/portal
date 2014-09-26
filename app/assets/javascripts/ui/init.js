$(function() {

    function showIdentity() {
        portal.Identity.whoAmI().then(function(data) {
            $('#userinfo').html(data.name + " " + data.surname + "&nbsp;&nbsp;");
        });
    }

    function showSubPages() {
        portal.Structure.subPages().then(function(data) {
            _.each(data, function(item) {
                $('#subpages').append('<li><a href="' + item.url + '">' + item.name + '</a></li>');
            });
        });
    }

    var socket = new WebSocket("ws://" + location.host + "/ws");
    socket.onopen = function() {
        portal.Socket.resolveWS(socket);
        // todo : init UI flow here
        setTimeout(function() {
            showIdentity();
            showSubPages();
        }, 0);
    };
    socket.onerror = function() {
        portal.Socket.rejectWS();
    };
});