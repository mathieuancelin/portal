$(function() {

    function showIdentity() {
        portal.Identity.whoAmI().then(function(data) {
            $('#userinfo').html(data.name + " " + data.surname + "&nbsp;&nbsp;");
        });
    }

    portal.Socket.init().then(function() {
        try {

            showIdentity();

            _.chain(portal.Location.current.mashetes).filter(function(mashete) {
                return mashete.position.column === 0;
            }).sortBy(function(mashete) {
                return mashete.position.line;
            }).each(function(mashete, idx) {
                mashete.instanceConfig.masheteid = mashete.id;
                React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('left-' + (idx + 1)));
            });

            _.chain(portal.Location.current.mashetes).filter(function(mashete) {
                return mashete.position.column === 1;
            }).sortBy(function(mashete) {
                return mashete.position.line;
            }).each(function(mashete, idx) {
                mashete.instanceConfig.masheteid = mashete.id;
                React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('right-' + (idx + 1)));
            });

            (function() {
                function dragIt(e) {
                    e.originalEvent.dataTransfer.setData("dragged-element", $(e.target).parent().attr('id'));
                    console.log('Dragging : ' + e.originalEvent.target.id);
                }
                function dropIt(e) {
                    $('.draggedon').each(function() {
                        $(this).removeClass('draggedon');
                    });
                    var theData = e.originalEvent.dataTransfer.getData("dragged-element");
                    var thePos = $(this).data('pos');
                    console.log('Dropping ' + theData + ' in ' + $(e.originalEvent.target).parent().attr('id') + " at " + thePos);
                    var theDraggedElement = document.getElementById(theData);
                    //$(e.originalEvent.target).parent().append(theDraggedElement);
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
                $('.droppable').on('dragover', function(event) {
                    event.preventDefault();
                });
                $('.droppable').on('dragenter', function(event) {
                    event.preventDefault();
                    $(this).addClass('draggedon');
                });
                $('.droppable').on('dragleave', function(event) {
                    event.preventDefault();
                    $(this).removeClass('draggedon');
                });
            })();

        } catch(e) {
            console.error(e);
            console.error(e.stack);
        }
    });
});