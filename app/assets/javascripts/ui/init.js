$(function() {

    function showIdentity() {
        portal.Identity.whoAmI().then(function(data) {
            $('#userinfo').html(data.name + " " + data.surname + "&nbsp;&nbsp;");
        });
    }

    portal.Socket.init().then(function() {
        setTimeout(function() {
            try {

                showIdentity();

                _.chain(portal.Location.current.mashetes).filter(function(mashete) {
                    return mashete.position === "Left";
                }).each(function(mashete, idx) {
                    React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('left-' + (idx + 1)));
                });

                _.chain(portal.Location.current.mashetes).filter(function(mashete) {
                    return mashete.position === "Right";
                }).each(function(mashete, idx) {
                    React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('right-' + (idx + 1)));
                });

            } catch(e) {
                console.error(e);
                console.error(e.stack);
            }
        }, 800);  // Because of JSX transformer !!!
    });
});