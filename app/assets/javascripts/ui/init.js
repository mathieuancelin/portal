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
                var hiding = '#row-mashete-' + mashete.id;
                mashete.instanceConfig.masheteid = mashete.id;
                mashete.instanceConfig.mashete = mashete.masheteId;
                mashete.instanceConfig.position = mashete.position;
                mashete.instanceConfig.closeCallback = function () {
                    $(hiding).hide();
                };
                console.log("try to instanciate " + mashete.masheteId);
                portal.MashetesStore.React.initializeTouchEvents(true);
                if (portal.MashetesStore[mashete.masheteId]) {
                    portal.MashetesStore.React.render(
                        portal.MashetesStore.React.createElement(portal.MashetesStore[mashete.masheteId], mashete.instanceConfig),
                        document.getElementById('mashete-' + mashete.id)
                    );
                    console.log("Success !!!");
                } else {
                    console.log("Fail !!!");
                    portal.MashetesStore.React.render(
                        portal.MashetesStore.React.createElement(portal.MashetesStore.FallbackMashete, {}),
                        document.getElementById('mashete-' + mashete.id)
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
                e.originalEvent.dataTransfer.setData("mashete-id", $(e.target).parent().data('masheteid'));
            }

            function dropIt(e) {
                $('.draggedon').each(function () {
                    $(this).removeClass('draggedon');
                    $(this).height('20px');
                });
                var theData = e.originalEvent.dataTransfer.getData("dragged-element");
                var masheteId = e.originalEvent.dataTransfer.getData("mashete-id");
                var theDraggedElement = document.getElementById(theData);
                console.log(e.originalEvent.target);
                if ($(e.originalEvent.target).data('pos') === 'start') {
                    $(e.originalEvent.target).after(theDraggedElement);
                } else {
                    $(e.originalEvent.target).parent().parent().parent().parent().after(theDraggedElement);
                }
                e.originalEvent.preventDefault();
                var mashetes = [];
                var cols = 0;
                $('.mashete-column').each(function() {
                    var col = $(this).data('colpos');
                    cols++;
                    $(this).find('.mashete').each(function() {
                        var masheteid = $(this).data('masheteid');
                        var top = $(this).offset().top;
                        mashetes.push({
                            col: col,
                            top: top,
                            masheteid: masheteid
                        });
                    });
                });
                for (var col = 0; col < cols; col++) {
                    _.chain(mashetes).filter(function(item) {
                        return item.col == col;
                    }).sortBy(function(item) {
                        return item.top;
                    }).each(function(item, idx) {
                        item.line = idx;
                    });
                }
                portal.Structure.moveMashetes(mashetes);
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
        }).then(function() {
            if (location.hash.replace('#', '') !== '' ) {
                portal.EventBus.Browser.publish(portal.Url.HashChangeEvent, location.hash.replace("#", ""));
            }
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