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
                    return mashete.position.column === 0;
                }).sortBy(function(mashete) {
                    return mashete.position.line;
                }).each(function(mashete, idx) {
                    React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('left-' + (idx + 1)));
                });

                _.chain(portal.Location.current.mashetes).filter(function(mashete) {
                    return mashete.position.column === 1;
                }).sortBy(function(mashete) {
                    return mashete.position.line;
                }).each(function(mashete, idx) {
                    React.renderComponent(new portal.MashetesStore[mashete.masheteId](mashete.instanceConfig), document.getElementById('right-' + (idx + 1)));
                });


                (function() {
                    function dragIt(theEvent) {
                        //tell the browser what to drag
                        theEvent.originalEvent.dataTransfer.setData("dragged-element", theEvent.target.id);
                        console.log('Dragging : ' + theEvent.originalEvent.target.id);
                    }

                    //function called when element drops
                    function dropIt(theEvent) {
                        $('.draggedon').each(function() {
                            $(this).removeClass('draggedon');
                        });
                        //get a reference to the element being dragged
                        var theData = theEvent.originalEvent.dataTransfer.getData("dragged-element");
                        //get the element
                        console.log('Dropping ' + theData + ' in ' + theEvent.originalEvent.target.id);
                        var theDraggedElement = document.getElementById(theData);
                        //add it to the drop element
                        theEvent.originalEvent.target.appendChild(theDraggedElement);
                        //instruct the browser to allow the drop
                        theEvent.originalEvent.preventDefault();
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
        }, 800);  // Because of JSX transformer !!!
    });
});