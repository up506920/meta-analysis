/************************************************************************************************************************\
*
* Javascript file with scripts to facilitate generation of a meta analysis by receiving an ID from a referring page,
* sending that ID in an AJAX request to an API to receive JSON data, and serialising that data into a tabular format for
* the user to view and edit.
*
* Created 19/01/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
* Last Modified 22/01/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
\************************************************************************************************************************/

//on document load...
$(document).ready(function () {
    //Check if meta-analysis ID has been passed - if not, show error
    if (typeof top.glob == 'undefined') {
        top.glob = "1";
    }
    //
    $.ajax({
        type: 'POST',
        url: '/Meta/Test/',
        data: {
            'id':top.glob
        },
        dataType:'json',
        success: function(data){
            alert(JSON.stringify(data));
            $('#test').append(JSON.stringify(data));
            generateMetaAnalysis(data);
    }
    });
});



function generateMetaAnalysis(data)
{
    jQuery.each(data.Studies, function(){
        $('#metaContent').append("<p>Experiment ID: " + this.ExperimentID + "</p>");
        $('#metaContent').append("<p>Experiment Name: " + this.ExperimentName + "</p>");
        jQuery.each(this.Columns, function(){
            $('#metaContent').append("<p><i>Column to include: " + this.ColumnName + "</i></p>");
            $('#metaContent').append("<p><i>Column to include: " + this.ColumnName + "</i></p>");
        });

        
    });
    
    //$('#metaContent').html(data[0].)
}

