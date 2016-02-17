/************************************************************************************************************************\
*
* Javascript file with scripts to facilitate generation of a meta analysis by receiving an ID from a referring page,
* sending that ID in an AJAX request to an API to receive JSON data, and serialising that data into a tabular format for
* the user to view and edit.
*
* Created 19/01/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
* Last Modified 16/02/2016 by Mathieu Pyle - University of Portsmouth - 506920
*
\************************************************************************************************************************/

//Initialise global variables for table generation

var tableHTML; 
var headers = { "Experiment Name": [] };
var tableHeaders = "<thead><tr>";
var body;
var tableBody = "<tbody>";
var clicked = 0;
var warningText;
var effectSizes = [];
var controlName = null;
var exposedName = null;
var step = 1;
var ajaxData;

//on document load...
var params;

$(document).ready(function () {
    params = parseQueryParams();
    //Check if meta-analysis ID has been passed - if not, show error
    if (typeof params !== 'object' && params != null || params["id"] == undefined) {
        alert("No meta-analysis ID passed - ID defaulted to 1");
        params = { id: ["1"] };
    }
    //
    $.ajax({
        type: 'POST',
        url: '/Meta/Test/',
        data: {
            'id':params["id"][0]
        },
        dataType:'json',
        success: function(data){
            //alert(JSON.stringify(data));
            //$('#test').append(JSON.stringify(data));
            ajaxData = data;
            generateMetaAnalysis(ajaxData);
    }
    });
});



function generateMetaAnalysis(data)
{

    //Choose fields for meta analysis calculations:

    
    
    //Test area of the function - 23/01/2016
    /*$('#idValue').append(params["id"][0]);
    jQuery.each(data.Studies, function () {
        $('#metaContent').append("<p><strong>Experiment ID: </strong>" + this.ExperimentID + "</p>");
        $('#metaContent').append("<p><strong>Experiment Name: </strong>" + this.ExperimentName + "</p>");
        jQuery.each(this.Columns, function () {
            $('#metaContent').append("<p><i><strong>Column to include: </strong>" + this.ColumnName + "</i></p>");
            $('#metaContent').append("<p><i><strong>Column Value: </strong>" + this.Value + "</i></p>");
        });
    });*/

    //Populate table - 26/01/2016

    tableHTML = "<table id = 'MetaID" + params['id'][0] + "' class='display' cellspacing='0' width='100%'>";

    //TODO: Turn into a separate function 26/01/2016

    jQuery.each(data.Studies, function () {
        //Populate all headers first
        headers["Experiment Name"].push(this.ExperimentName);
        jQuery.each(this.Columns, function () {
            //For each column in each study, check if in headers array. If not, add it.
            if (this.ColumnName in headers == false) {
                //count how many experiment names there are to add blank space before, maintain structure
                headers[this.ColumnName] = [];
                for (i = 0; i < headers["Experiment Name"].length - 1; i++) {
                    headers[this.ColumnName].push("");
                }
            }
            headers[this.ColumnName].push(this.Value);
            
        });

        //if there are columns in headers object that aren't in this study's columns, fill it with blank space
        $.each(headers, function (index, value) {
            while(value.length < headers["Experiment Name"].length)
            {
                value.push("");
            }
        });
    });
    


    //Populate table from values in arrays

    //Table headers to HTML format:
    for(i=0; i < headers["Experiment Name"].length; i++){
        $.each(headers, function (index, value)
        {
            if(i==0)
            {
                AppendFromObjectToHTML("tableHeaders", index);
            }
            if (index == "Experiment Name") {
                if (i == 0) {
                    TableRowHTML("tableBodyStart");
                }

                else {
                    TableRowHTML("tableBody");
                }
            }
            AppendFromObjectToHTML("tableBody", value[i]);

            //checks if it's on the last loop and if on the last index of the headers variable. If so, finish the HTML for the table.
            //Unnecessary code now, left commented in case it is useful later

            /*if (i == headers["Experiment Name"].length - 1 && value == headers[Object.keys(headers)[Object.keys(headers).length - 1]]) {
                TableRowHTML("tableBodyEnd");
            }*/

        });
    }

    //Make table:
    TableRowHTML("tableBodyEnd");
    TableRowHTML("tableHeaders");
    tableHTML += tableHeaders + tableBody;
    $('#metaTableContainer').html(tableHTML);

    //Initialise Datatable:
    $('#MetaID' + params["id"][0]).DataTable({
        createdRow: function (row) {
            $('td', row).attr('tabindex', 0);
        }
    });
    
    //If new, ask which columns to do meta analysis on:
    /*
    $('a.toggle-vis').on('click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table.column($(this).attr('data-column'));

        // Toggle the visibility
        column.visible(!column.visible());
    });*/


    //Prompt user to choose which columns to use 
    //Check if new, then do this if it is:
    UpdateWarningText();
    //data = ChooseFieldsForEffectSizes(data);

    //Regenerate tables
    

}

function ChooseFieldsForEffectSizes()
{

    var typeOfEffectSize = "odds ratio";
    var controlVal = null;
    var exposedVal = null;

    //incorporate in another loop:
    for (i = 0; i < effectSizes.length; i++) {
        jQuery.each(ajaxData.Studies, function () {
            jQuery.each(this.Columns, function () {
                switch (this.ColumnName) {
                    case effectSizes[i].control:
                        controlVal = this.Value;
                        break;
                    case effectSizes[i].exposed:
                        exposedVal = this.Value;
                        break;
                    default:
                        break;
                }
            });
            if (controlVal != null && exposedVal != null) {
                this.Columns.push({ ColumnName: effectSizes[i].control + " vs " + effectSizes[i].exposed + " Effect Size", Value: CalculateEffectSize(controlVal, exposedVal, typeOfEffectSize) });
            }
            controlVal = null;
            exposedVal = null;

        });
    }
    return ajaxData;

}

function CalculateEffectSize(control, exposed, type) {
    //Pass argument to switch type of effect size

    switch(type){
        //Odds ratio
        case "odds ratio":
            var es = Math.log((control / (1 - control)) / (exposed / (1 - exposed)));
            alert(es);
            return es;

        //Cohen's d

        //etc...
    }
}

function AppendFromObjectToHTML(variableName, data)
{
    switch(variableName){
        case "tableHeaders":
            tableHeaders += "<th>" + data + "</th>";
            break;
        case "tableBody":
            tableBody += "<td>" + data + "</td>";
            break;
    }
    
}

function TableRowHTML(variableName)
{
    switch (variableName) {
        case "tableHeaders":
            tableHeaders += "</tr></thead>";
            break;
        case "tableBodyStart":
            tableBody += "<tr>";
            break;
        case "tableBody":
            tableBody += "</tr><tr>";
            break;
        case "tableBodyEnd":
            tableBody += "</tr></tbody></table>";
            break;
    }
}

function UpdateWarningText()
{
    switch (step) {
        case 1:
            warningText = "Choose the first EXPOSED column for calculating a meta analysis (control will be chosen later)";
            $("#GenerateButton").hide();
            break;
        case 2:
            warningText = "Click on a column to use as the control for " + controlName;
            $("#GenerateButton").hide();
            break;
        case 3:
            warningText = "Choose another set of columns or click 'Generate' to generate a Meta-Analysis";
            $("#GenerateButton").show();
            break;
        default:
            $("#GenerateButton").hide();
            break;
            return;
    }
    $('#WarningLabel').html("Step " + step.toString() + ": " + warningText);


}


//Event listener for choosing which columns to do meta analysis on
$('#metaTableContainer').on('click', 'table tr th', function (e) {
    switch(clicked)
    {
        case 0:
            clicked++;
            exposedName = $(e.target).text();
            step = 2;
            break;
        case 1:
            clicked = 0;
            controlName = $(e.target).text();
            step = 3;
            break;
    }
    UpdateWarningText();
    if (controlName && exposedName != null) {
        effectSizes.push({ control: controlName, exposed: exposedName });
        controlName = null;
        exposedName = null;
    }

});

$("#GenerateButton").click(function () {
    ChooseFieldsForEffectSizes();
});