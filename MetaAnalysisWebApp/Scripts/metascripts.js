﻿/************************************************************************************************************************\
*
* Javascript file with scripts to facilitate generation of a meta analysis by receiving an ID from a referring page,
* sending that ID in an AJAX request to an API to receive JSON data, and serialising that data into a tabular format for
* the user to view and edit.
*
* Created 19/01/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
* Last Modified 21/01/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
\************************************************************************************************************************/

//on document load...
$(document).ready(function () {
    //Check if meta-analysis ID has been passed - if not, show error

    //
    $.ajax({
        type: 'POST',
        url: '/Meta/Test/',
        data: {
            'id':'1'
        },
        dataType:'json',
        success: function(data){
            alert(JSON.stringify(data));
    }
    });
});