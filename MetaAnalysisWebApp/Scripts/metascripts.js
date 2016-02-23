﻿/************************************************************************************************************************\
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
var headers = {
    "Experiment Name": []
};
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
var params;
var isNew = true;
var _table;
var tableCols = [];
var tableRows = [];
var tableParams = {
    data: tableRows,
    columns: tableCols,
    scrollY: "300px",
    scrollX: true,
    scrollCollapse: true,
    paging: false,
    bSort: false,
    //"aoColumnDefs": { "sClass": "interpretation", "aTargets": 2 },
    fixedColumns: {
        leftColumns: 1
    },
    createdRow: function (row) {
        $('td', row).attr('tabindex', 0);
    }
};

Array.prototype.multisplice = function () {
    //function taken from http://upshots.org/actionscript/javascript-splice-array-on-multiple-indices-multisplice
    var args = Array.apply(null, arguments);
    args.sort(function (a, b) {
        return a - b;
    });
    for (var i = 0; i < args.length; i++) {
        var index = args[i] - i;
        this.splice(index, 1);
    }
}

$(document).ready(function() {
    $.blockUI();
    params = parseQueryParams();
    //Check if meta-analysis ID has been passed - if not, show error
    if (typeof params !== 'object' && params != null || params["id"] == undefined) {
        alert("No meta-analysis ID passed - ID defaulted to 1");
        params = {
            id: ["1"]
        };
    }
    //
    $.ajax({
        type: 'POST',
        url: '/Meta/Test/',
        data: {
            'id': params["id"][0]
        },
        dataType: 'json',
        success: function(data) {
            //alert(JSON.stringify(data));
            //$('#test').append(JSON.stringify(data));
            ajaxData = data;
            generateMetaAnalysis(ajaxData);
        }
    });
});

function generateMetaAnalysis(data) {

    //Check if meta analysis is new or not:

    isNew = CheckIfNew();
    
    //TODO: Turn into a separate function 26/01/2016
    
    jQuery.each(data.Studies, function() {
        //Populate all headers first
        headers["Experiment Name"].push(this.ExperimentName);
        jQuery.each(this.Columns, function() {
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
        $.each(headers, function(index, value) {
            while (value.length < headers["Experiment Name"].length) {
                value.push("");
            }
        });
    });

    var rowData = [];
    for (i = 0; i < headers["Experiment Name"].length; i++){
        $.each(headers, function(index, value){
            if (i == 0) {
                tableCols.push({ title: index });
            }
            rowData.push(value[i]);
            if (rowData.length == Object.keys(headers).length) {
                tableRows.push(rowData);
                rowData = [];
            } 
        });
    }

    if (isNew) {
        OpenDialogBox("Step 1: Choose fields", "Looks like this is a new meta analysis. To start, please choose which of the following fields you would like to keep in the meta analysis", headers, true, false, 1);
        //Prompt user to select fields that are the interpretations
    }

    //Populate table from values in arrays


}

function ChooseFieldsForEffectSizes() {

    var typeOfEffectSize = "odds ratio";
    var controlVal = null;
    var exposedVal = null;

    //incorporate in another loop:
    x = 0;
    for (i = 0; i < effectSizes.length; i++) {
        jQuery.each(ajaxData.Studies, function () {
            jQuery.each(this.Columns, function() {
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
                tableCols.push({ title: effectSizes[i].control + " vs " + effectSizes[i].exposed + " Effect Size" });
                tableRows[x].push(CalculateEffectSize(controlVal, exposedVal, typeOfEffectSize).toString());
            }
            else
                tableRows[x].push("");
            controlVal = null;
            exposedVal = null;
            x++;
        });
    }
    //Rebuild table with new columns
    BuildDataTable();

}

function OpenDialogBox(title, msgString, checkList, isReturn, returnCanBeNull, step) {
    var interpretations = new Array();
    var dataForCalcs = new Array();
    PopulateDialogText(title, msgString, checkList, step);
    $.unblockUI();
    if (isReturn) {
        $("#dialog").dialog({
            width: 500,
            modal: true,
            closeOnEscape: false,
            open: function(event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            },
            buttons: {
                "Confirm": {
                    text: "Confirm",
                    id: "confirmBtn",
                    click: 
                    function () {
                        $("input:radio:checked").each(function () {
                            if($(this).val() == "interpretation"){
                                interpretations.push(parseInt($(this).attr('name')));
                            }
                            else if($(this).val() == "data")
                            {
                                dataForCalcs.push(parseInt($(this).attr('name')));
                            }
                        });
                        var indexesToSplice = [];
                        $("input:checkbox:not(:checked)").each(function () {
                            indexesToSplice.push(parseInt($(this).val()));
                            delete headers[$(this).attr('name')];
                        });
                        if (indexesToSplice.length > 0) {
                            MultipleSplice(indexesToSplice);
                        }
                        $(this).dialog("close");
                        switch(step){
                            case 1:
                                Step2();
                                break;
                            case 2:
                                if (returnCanBeNull)
                                    ConfirmButtonPressed(interpretations, dataForCalcs)
                                else {
                                    if (interpretations != null && dataForCalcs != null)
                                        ConfirmButtonPressed(interpretations, dataForCalcs)
                                    else {
                                        //error handling if data is null
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        
                }

                }
            }
        });
    } else {

    }
}

function Step2(){

    OpenDialogBox("Step 2: Choose interpretations", "Looks like this is a new meta analysis. To start, please choose which of the following fields are interpretations (fields not to be used in generating statistical data for meta analysis):", headers, true, false, 2);

    //Initialise Datatable:
    tableHTML = "<table id = 'MetaID" + params['id'][0] + "' class='display' cellspacing='0' width='100%'></table>";
    BuildDataTable();

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

function MultipleSplice(indexesToSplice) {
    //remove unwanted fields from arrays
    tableCols.multisplice(1, 5, 2, 3);
    tableRows.multisplice(indexesToSplice);
}

function ConfirmButtonPressed(data1, data2)
{
            //Highlight interpretations
    tableParams["aoColumnDefs"] = [{ "sClass": "interpretation", "aTargets": data1 },
            { "sClass": "dataforcalcs", "aTargets": data2 }];
    BuildDataTable();
}

function PopulateDialogText(title, msgString, checkList, step) {
    var arrayNumCount = 0;
    document.getElementById('dialog').title = title;
    $("#dialog").html(msgString);
    switch (step) {
        case 1:
            $.each(headers, function (index, value) {
                if (index != "Experiment Name") {
                    $('#dialog').append("<label><input type='checkbox' name='field' value='" + arrayNumCount + "'/>" + index + "</label>");
                }
                arrayNumCount++;
            });
            break;
        case 2:
            $("#dialog").append("<table class='grid' cellspacing='10'>");
            $("#dialog").append("<tr><td class='gridheader'> </td><td class='gridheader'>Interpretation</td><td class='gridheader'>Data For Statistical Use</td></tr>");
            $.each(headers, function (index, value) {
                if (index != "Experiment Name") {
                    $('#dialog').append("<tr><td class='griditem'>" + index + "</td><td class='radioCenter'><input type='radio' name='" + arrayNumCount + "' value='interpretation' class='radioCenter'/></td><td class = 'radioCenter'><input type='radio' name='" + arrayNumCount + "' value='data' class='radioCenter'/></td></tr>");
                }
                arrayNumCount++;
            });
            $("#dialog").append("</table>");
    }
    
}

function CalculateEffectSize(control, exposed, type) {
    //Pass argument to switch type of effect size
    switch (type) {
        //Odds ratio
        case "odds ratio":
            var es = Math.log((control / (1 - control)) / (exposed / (1 - exposed)));
            alert(es);
            return es;

            //Cohen's d

            //etc...
    }
}

function CheckIfNew() {
    //checks if the meta analysis has been generated before or not
    var metaNew;
    //Do stuff here to see if exists by ID on my end
    metaNew = true;
    return metaNew;
}

function AppendFromObjectToHTML(variableName, data) {
    switch (variableName) {
        case "tableHeaders":
            tableHeaders += "<th>" + data + "</th>";
            break;
        case "tableBody":
            tableBody += "<td>" + data + "</td>";
            break;
    }

}

function TableRowHTML(variableName) {
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

function UpdateWarningText() {
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

function BuildDataTable() {

    if (typeof (_table) != "undefined") {
        if(_table != null)
            _table.destroy();
    }
    $('#metaTableContainer').html(tableHTML);
    //refresh variable params
    tableParams.data = tableRows;
    tableParams.columns = tableCols;
    _table = $('#MetaID' + params["id"][0]).DataTable(tableParams);
}

//Event listener for choosing which columns to do meta analysis on
$('#metaTableContainer').on('click', 'table tr th', function (e) {
    if ($(this).hasClass("dataforcalcs")) {
        switch (clicked) {
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
            effectSizes.push({
                control: controlName,
                exposed: exposedName
            });
            controlName = null;
            exposedName = null;
        }
    }
    else
    {
        alert("Please select a field that has been selected for use with calculations");
    }
});

$("#GenerateButton").click(function() {
    ChooseFieldsForEffectSizes();
});

$(window).resize(function() {
    $("#dialog").dialog("option", "position", {
        my: "center",
        at: "center",
        of: window
    });
});
