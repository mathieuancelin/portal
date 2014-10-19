$(function() {

    function showIdentity() {
        portal.Identity.whoAmI().then(function(data) {
            var url = 'http://www.gravatar.com/avatar/' + data.md5email + '?s=30&d=identicon';
            $('#useravatar').attr('src', url);
            $('#userinfo').html(data.name + " " + data.surname);
        });
    }

    function startUi() {
        showIdentity();
        _.chain(portal.Location.current.mashetes).each(function (mashete) {
            try {
                var idx = mashete.position.line;
                var side = 'left';
                if (mashete.position.column === 1) {
                    side = 'right';
                }
                var hiding = '#' + side + '-row-' + (idx + 1);
                mashete.instanceConfig.masheteid = mashete.id;
                mashete.instanceConfig.mashete = mashete.masheteId;
                mashete.instanceConfig.position = mashete.position;
                mashete.instanceConfig.closeCallback = function () {
                    $(hiding).hide();
                };
                console.log("try to instanciate " + mashete.masheteId);
                if (portal.MashetesStore[mashete.masheteId]) {
                    console.log("Success !!!");
                    React.renderComponent(
                        new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig),
                        document.getElementById(side + '-' + (idx + 1))
                    );
                } else {
                    console.log("Fail !!!");
                    React.renderComponent(
                        new portal.MashetesStore.FallbackMashete({}),
                        document.getElementById(side + '-' + (idx + 1))
                    );
                }
            } catch (ex) {
                console.error(ex.stack);
            }
        });

        $('.addmashete').click(function (e) {
            e.preventDefault();
            var id = $(this).data('mid');
            var conf = JSON.parse($(this).data('conf').decodeBase64()); // TODO : server side, from default config
            portal.Mashetes.add(id, conf, portal.User.current.isAdmin() + "");
            registerDragAndDrop();
        });

        function registerDragAndDrop() {
            function dragIt(e) {
                e.originalEvent.dataTransfer.setData("dragged-element", $(e.target).parent().attr('id'));
                e.originalEvent.dataTransfer.setData("previous-position", $(e.target).parent().data('position'));
                e.originalEvent.dataTransfer.setData("mashete-id", $(e.target).parent().data('masheteid'));
            }

            function dropIt(e) {
                $('.draggedon').each(function () {
                    $(this).removeClass('draggedon');
                    $(this).height('20px');
                });
                var theData = e.originalEvent.dataTransfer.getData("dragged-element");
                var previousPosition = e.originalEvent.dataTransfer.getData("previous-position");
                var masheteId = e.originalEvent.dataTransfer.getData("mashete-id");
                var currentPosition = $(e.originalEvent.target).parent().data("position");
                var previous = {
                    column: previousPosition.split(":")[0],
                    line: previousPosition.split(":")[1]
                };
                var current = {
                    column: currentPosition.split(":")[0],
                    line: currentPosition.split(":")[1]
                };
                var thePos = $(this).data('pos');
                console.log(thePos);
                var theDraggedElement = document.getElementById(theData);
                if (thePos === 'start') {
                    $(e.originalEvent.target).parent().before(theDraggedElement);
                } else {
                    $(e.originalEvent.target).parent().after(theDraggedElement);
                }
                e.originalEvent.preventDefault();
                portal.Structure.moveMashete(masheteId, previous, current);
            }

            $('.draggable').on('dragstart', dragIt);
            $('.droppable').on('drop', dropIt);
            $('.droppable').on('dragover', function (event) {
                event.preventDefault();
            });
            $('.droppable').on('dragenter', function (event) {
                event.preventDefault();
                $(this).addClass('draggedon');
                $(this).height('100px');
            });
            $('.droppable').on('dragleave', function (event) {
                event.preventDefault();
                $(this).removeClass('draggedon');
                $(this).height('20px');
            });
        }

        registerDragAndDrop();
        portal.Structure.getAllRoles().then(function(roles) {
            var portal = portal || {};
            portal.Roles = portal.Roles || {};
            portal.Roles.all = roles;
        });
    }

    portal.Socket.init().then(function() {
        try {
            console.log('Init UI ...');
            setTimeout(startUi, 0);
        } catch(e) {
            console.error(e);
            console.error(e.stack);
        }
    });
});


(function() {
    function updateClock(){
        var now = moment(),
            second = now.seconds() * 6,
            minute = now.minutes() * 6 + second / 60,
            hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

        $('#hour').css("transform", "rotate(" + hour + "deg)");
        $('#minute').css("transform", "rotate(" + minute + "deg)");
        $('#second').css("transform", "rotate(" + second + "deg)");
    }
    function timedUpdate () {
        updateClock();
        setTimeout(timedUpdate, 1000);
    }
    //<div class="hero-circle">
    //    <div class="hero-face">
    //        <div id="hour" class="hero-hour"></div>
    //        <div id="minute" class="hero-minute"></div>
    //        <div id="second" class="hero-second"></div>
    //    </div>
    //</div>
    //timedUpdate();

})();