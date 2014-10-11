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
                mashete.instanceConfig.masheteid = mashete._id;
                mashete.instanceConfig.closeCallback = function () {
                    $(hiding).hide();
                };
                if (portal.MashetesStore[mashete.masheteId]) {
                    React.renderComponent(
                        new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig),
                        document.getElementById(side + '-' + (idx + 1))
                    );
                } else {
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
            var conf = JSON.parse($(this).data('conf').decodeBase64()); // TODO : server side
            portal.Mashetes.add(id, conf, portal.User.current.isAdmin() + "");
            registerDragAndDrop();
        });

        function registerDragAndDrop() {
            function dragIt(e) {
                e.originalEvent.dataTransfer.setData("dragged-element", $(e.target).parent().attr('id'));
            }

            function dropIt(e) {
                $('.draggedon').each(function () {
                    $(this).removeClass('draggedon');
                    $(this).height('20px');
                });
                var theData = e.originalEvent.dataTransfer.getData("dragged-element");
                var thePos = $(this).data('pos');
                var theDraggedElement = document.getElementById(theData);
                if (thePos === 'start') {
                    $(e.originalEvent.target).parent().before(theDraggedElement);
                } else {
                    $(e.originalEvent.target).parent().after(theDraggedElement);
                }
                e.originalEvent.preventDefault();
                // TODO : call services to change mashete position
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