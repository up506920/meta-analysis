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
var hiddenColumns = [];
var tableParams = {
    data: tableRows,
    columns: tableCols,
    "aoColumnDefs": [],
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
var lastClicked;

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

$(document).ready(function () {
    $.blockUI();
    params = parseQueryParams();
    //Check if meta-analysis ID has been passed - if not, show error
    if (typeof params !== 'object' && params != null || params["id"] == undefined) {
        alert("No meta-analysis ID passed - ID defaulted to 1");
        params = {
            id: ["1"]
        };
    }
    //When in use with the API, this is the correct way to do this:
    $.ajax({
        type: 'POST',
        url: '/Meta/Test/',
        data: {
            'id': params["id"][0]
        },
        dataType: 'json',
        success: function(data) {
            ajaxData = data;
            generateMetaAnalysis(ajaxData);
        }
    });
    //Get test data:
    /*$.ajax({
        url: "/TestData/TestData.JSON",
        dataType: 'json',
        success: function (data) {
            ajaxData = data;
            generateMetaAnalysis(ajaxData);
        }
    });*/
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
        registerHandlers();
    }

    //Populate table from values in arrays


}

function ChooseFieldsForEffectSizes() {

    var typeOfEffectSize = $('input[name=effectSizeType]:checked').val()
    var controlVal = null;
    var exposedVal = null;
    //incorporate in another loop:
    for (i = 0; i < effectSizes.length; i++) {
        for (y = 0; y < ajaxData.Studies.length; y++) {
            jQuery.each(ajaxData.Studies[y].Columns, function () {
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
                tableRows[y].push(CalculateEffectSize(controlVal, exposedVal, typeOfEffectSize).toString());
                controlVal = null;
                exposedVal = null;
            }
            else
                tableRows[y].push("");
        }
        if (controlName != null && exposedName != null) {
            tableCols.push({ title: "Effect Sizes " + effectSizes[i].control + " vs " + effectSizes[i].exposed + " Effect Size" });
        }
    }
    //
    for (i = 0; i < effectSizes.length; i++) {
        for (y = 0; y < ajaxData.Studies.length; y++) {
            jQuery.each(ajaxData.Studies[y].Columns, function () {
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
                tableRows[y].push(CalculateWeights(controlVal, exposedVal, typeOfEffectSize).toString());
                controlVal = null;
                exposedVal = null;
            }
            else
                tableRows[y].push("");
        }
        if (controlName != null && exposedName != null) {
            tableCols.push({ title: "Weights " + effectSizes[i].control + " vs " + effectSizes[i].exposed + " Effect Size" });
        }
    }
    BuildDataTable();
    effectSizes = [];
}

function HideColumn()
{
    var nameOfColumn = GetNameOfColumn();
    var arrayNumOfColumn = GetArrayNumOfColumn(nameOfColumn);
    hiddenColumns.push(arrayNumOfColumn);
    for (i = 0; i < tableParams["aoColumnDefs"].length; i++) {
        if (typeof (tableParams["aoColumnDefs"][i].bVisible) != "undefined")
        {
            if (tableParams["aoColumnDefs"][i].bVisible == false) {
                tableParams["aoColumnDefs"][i].aTargets == hiddenColumns;
                break;
            }
            else
            {
                tableParams["aoColumnDefs"].push({ "aTargets": hiddenColumns, "bVisible": false, "bSearchable": false });
                break;
            }
        }
        else
        {
            tableParams["aoColumnDefs"].push({ "aTargets": hiddenColumns, "bVisible": false, "bSearchable": false });
            break;
        }     
    }
    if (tableParams["aoColumnDefs"].length == 0)
        tableParams["aoColumnDefs"].push({ "aTargets": hiddenColumns, "bVisible": false, "bSearchable": false });
    BuildDataTable();
}

function OpenDialogBox(title, msgString, checkList, isReturn, returnCanBeNull, step) {
    var interpretations = new Array();
    var dataForCalcs = new Array();
    PopulateDialogText(title, msgString, checkList, step);
    $.unblockUI();
    if (isReturn) {
        $("#dialog").dialog({
            title: title,
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
                        $("input:checkbox[name=field]:not(:checked)").each(function () {
                            hiddenColumns.push(parseInt($(this).val()));
                        });
                        if (hiddenColumns.length > 0) {
                            tableParams["aoColumnDefs"].push({ "aTargets": hiddenColumns, "bVisible": false, "bSearchable": false });
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

    OpenDialogBox("Step 2: Choose interpretations", "Looks like this is a new meta analysis. To start, please choose which of the following fields are interpretations (fields not to be used in generating statistical data for meta analysis), and which are to be used for statistics (i.e. generating effect sizes):", headers, true, false, 2);

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


function ConfirmButtonPressed(data1, data2)
{
            //Highlight interpretations
    tableParams["aoColumnDefs"].push({ "sClass": "interpretation", "aTargets": data1 },
            { "sClass": "dataforcalcs", "aTargets": data2 });
    BuildDataTable();
}

function PopulateDialogText(title, msgString, checkList, step) {
    var arrayNumCount = 0;
    document.getElementById('dialog').title = title;
    $("#dialog").html(msgString);
    switch (step) {
        case 1:
            $('#dialog').append("<label id='selectAll'><input type='checkbox' onClick='toggle(this)' value='selectAll' id='checkAll' checked/>Select/Deselect All</label>");
            $.each(headers, function (index, value) {
                if (index != "Experiment Name") {
                    $('#dialog').append("<label><input type='checkbox' name='field' value='" + arrayNumCount + "' checked/>" + index + "</label>");
                }
                arrayNumCount++;
            });
            break;
        case 2:
            $("#dialog").append("<table class='grid' cellspacing='10'>");
            $("#dialog").append("<tr><td class='gridheader'> </td><td class='gridheader'>Interpretation</td><td class='gridheader'>Data For Statistical Use</td></tr>");
            $.each(headers, function (index, value) {
                if (index != "Experiment Name") {
                    if(hiddenColumns.indexOf(arrayNumCount) < 0)
                        $('#dialog').append("<tr><td class='griditem'>" + index + "</td><td class='radioCenter'><input type='radio' name='" + arrayNumCount + "' value='interpretation' class='radioCenter'/></td><td class = 'radioCenter'><input type='radio' name='" + arrayNumCount + "' value='data' class='radioCenter'/></td></tr>");
                }
                arrayNumCount++;
            });
            $("#dialog").append("</table>");
    }
    
}

function toggle(source){
    checkboxes = document.getElementsByName('field');
    for(var i=0; i<checkboxes.length; i++){
        checkboxes[i].checked = source.checked;
    }

}

function CalculateEffectSize(control, exposed, type) {
    //Pass argument to switch type of effect size
    switch (type) {
        //Odds ratio
        case "odds ratio":
            var es = Math.log((control / (1 - control)) / (exposed / (1 - exposed)));
            return es;
        case "neg odds ratio":
            var es = -Math.log((control / (1 - control)) / (exposed / (1 - exposed)));
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

//custom right click menu
$(document).bind("contextmenu", function (event) {
    //taken and edited from: http://stackoverflow.com/questions/4495626/making-custom-right-click-context-menus-for-my-web-app
    // Avoid the real one
    event.preventDefault();
    lastClicked = event.target;
    //if over a column:
    if (event.target.tagName == "TH" || event.target.tagName == "TD") {
        // Show contextmenu
        $(".custom-menu").finish().toggle(100).

        // In the right position (the mouse)
        css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    }
    
});

$(document).bind("mousedown", function (e) {

    // If the clicked element is not the menu
    if (!$(e.target).parents(".custom-menu").length > 0) {

        // Hide it
        $(".custom-menu").hide(100);
    }
});


// If the menu element is clicked
$(".custom-menu li").click(function () {

    // This is the triggered action name
    switch ($(this).attr("data-action")) {

        // A case for each action. Your actions here
        case "hide": HideColumn(); break;
        case "control": SetControlField(); break;
        case "exposed": SetExposedField(); break;
        case "columndef": alert("Change this columns definition (e.g. interpretation etc from step 2)"); break;
        case "unhide": UnhideAll(); break;
    }

    // Hide it AFTER the action was triggered
    $(".custom-menu").hide(100);
});

function SetControlField()
{
    var columnName = GetNameOfColumn();
    if (exposedName != null) {
        $("#dialog").html("Set column '" + columnName + "' to be the control field for '" + exposedName + "'?");
        PopulateDialogWithEffectSizes();
        $("#dialog").dialog({
            title: "Meta Analysis Alert",
            resizeable: false,
            height: 200,
            modal: true,
            buttons: {
                "Yes": function () {
                    controlName = columnName;
                    effectSizes.push({control: controlName,
                        exposed: exposedName})
                    ChooseFieldsForEffectSizes();
                    controlName = null;
                    exposedName = null;
                    $(this).dialog("close");
                },
                "No": function () {
                    $(this).dialog("close");
                }
            }
        });
    }
    else
    {
        controlName = columnName;
    }
}

function PopulateDialogWithEffectSizes()
{
    $("#dialog").append("<div id='effectSizeRadios'><ul>");
    $("#dialog").append("<li class='noBullet'><input type='radio' name='effectSizeType' value='odds ratio' class='radioCenter'/>Odds Ratio</input></li>");
    $("#dialog").append("<li class='noBullet'><input type='radio' name='effectSizeType' value='neg odds ratio' class='radioCenter'/>Negative Odds Ratio</input></li>");
    $("#dialog").append("</ul></div>");
}

function SetExposedField() {
    var columnName = GetNameOfColumn();
    if (controlName != null) {
        $("#dialog").html("Set column '" + columnName + "' to be the exposed field for '" + controlName + "'?");
        PopulateDialogWithEffectSizes();
        $("#dialog").dialog({
            title: "Meta Analysis Alert",
            resizeable: false,
            height: 200,
            modal: true,
            buttons: {
                "Yes": function () {
                    exposedName = columnName;
                    effectSizes.push({
                        control: controlName,
                        exposed: exposedName
                    })
                    ChooseFieldsForEffectSizes();
                    controlName = null;
                    exposedName = null;
                    $(this).dialog("close");
                },
                "No": function () {
                    $(this).dialog("close");
                }
            }
        });
    }
    else {
        exposedName = columnName;
    }
}

function UnhideAll() {
    hiddenColumns = [];
    var columnsToDelete = [];
    for (i = 0; i < tableParams["aoColumnDefs"].length; i++) {
        if (typeof (tableParams["aoColumnDefs"][i].bVisible) != "undefined") {
            if(tableParams["aoColumnDefs"][i].bVisible == false){
                columnsToDelete.push(i);
            }
        }
        
    }
    tableParams["aoColumnDefs"].multisplice(parseInt(columnsToDelete.toString()), 1);
    BuildDataTable();
}

function GetNameOfColumn()
{
    var nameOfColumn;
    if (lastClicked.tagName == "TH") {
        nameOfColumn = lastClicked.innerText;
    }
    else {
        //if they click on the td, get the th that corresponds with it
        nameOfColumn = $.parseHTML($(lastClicked).closest('table').find('th').eq($(lastClicked).index())[0].innerHTML)[0].innerText;
    }
    return nameOfColumn;
}

function GetArrayNumOfColumn(nameOfColumn)
{
    var arrayNumOfColumn = 0;
    $.each(headers, function (index, value) {
        if (index == nameOfColumn)
            return false;
        arrayNumOfColumn++;
    });
    return arrayNumOfColumn;
}

function registerHandlers() {
    $("input:checkbox[name=field]").click(function () {
        //on Step 1 dialog box, if the user has one or more deselected fields, make sure the "select all" checkbox is all deselected
        if ($("input:checkbox[name=field]").not(":checked").length > 0) {
            $("#checkAll").attr('checked', false);
        }
        else {
            $("#checkAll").prop('checked', true);
        }
    });
}