/**
 *
 * @param printTableContentData
 * @created 2016-11-09
 */

/*
 * NEED LIBRARIES;
 * <script src="/jslib/moment-with-locales.js"></script>
 * <script src="/jslib/Numeral-js/min/numeral.min.js"></script>
 * <script src="/jslib/Numeral-js/min/languages/ru-UA.min.js"></script>
 */

var calcTableWidth = function (printSectionData) {
    var col_width;
    var table_width = 0;
    var tableColumns = printSectionData.columns;
    if (!tableColumns) return 0;
    for (var col = 0; col < tableColumns.length; col++) {
        var tableColumnData = tableColumns[col];
        col_width = (tableColumnData.width != undefined) ? tableColumnData.width : 80;
        table_width += col_width;
    }
    return table_width;
};
/*
 * tableColumns: [
 *  {"data":"date", "name":"DATE","width":80, "type":"date", format:"DD.MM.YYYY" },
 *  {"data":"date2", "name":"DATE2","width":80, "type":"text", datetimeFormat:"DD.MM.YYYY" },
 *  {"data":"trailer", "name":"TRAILER", "width":80, "align":"center"},
 *  {"data":"sum","name":"SUM", "width":85, "type":"currency", format:"#,###,###,##0.00#######",  printFormat:"#,###,###,##0.00#######" },
 *  {"data":"distance", "name":"DISTANCE", "width":85, "type":"numeric", format:"#,###,###,##0.#########",  printFormat:"#,###,###,##0.#########" }
 * ]
 * for data types date, numeric, currency you can set one of format or printFormat
 * tableData: [
 *  { "date":"2016-03-01", "date2":"2016-11-11", "trailer":"Y", "sum":"20", "distance":"500000"},
 *  { "date":"2017-01-31", "trailer":"Y", "sum":"20", "distance":"500000"}
 * ]
 */
var createPrintDetailTable = function (tableColumns, tableData, table_width) {                                          console.log("createPrintDetailTable ",tableColumns,tableData);
    var detailContent = document.createElement('div'),
        table = document.createElement('table');
    detailContent.setAttribute("style", "margin:0;padding:0;border:none;");
    detailContent.appendChild(table);
    table.setAttribute("style", "width:" + table_width + "px;");
    var thead = document.createElement("thead");
    var tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    var table_header_row = table.insertRow(0);
    for (var col = 0; col < tableColumns.length; col++) {
        var tableColumnData = tableColumns[col];
        var h_cell = document.createElement("TH");
        var col_width = (tableColumnData.width != undefined) ? tableColumnData.width-5 : 80;
        h_cell.setAttribute("style", "margin:0;padding:2px;width:" + col_width + "px;");
        h_cell.innerHTML = tableColumnData.name;
        table_header_row.appendChild(h_cell);
    }
    //table.setAttribute("style", "width:" + table_width + "px;");
    thead.appendChild(table_header_row);
    if (!tableData) return table;
    for (var row = 0; row < tableData.length; row++) {
        var dataItem = tableData[row];
        var tableRow = table.insertRow(-1);
        tbody.appendChild(tableRow);

        for (var col = 0; col < tableColumns.length; col++) {
            var tableCol = tableColumns[col];
            var tableCell = tableRow.insertCell(-1);
            var dataItemName = tableCol.data;
            var data_type = tableCol.type;
            var cellValue=null, printFormat=tableCol.printFormat;
            if(!printFormat&&tableCol.format) printFormat=tableCol.format;
            if (data_type==="text"&&tableCol.datetimeFormat){
                data_type="date"; printFormat=tableCol.datetimeFormat;
            }
            if (dataItemName) {
                cellValue = getPrintValue(dataItem[dataItemName], data_type, printFormat);
            }
            if (cellValue !== undefined && cellValue !== null) {
                tableCell.innerText = cellValue;
            }
            tableCell.setAttribute("style", "margin:0;padding:2px;padding-left:5px;padding-right:5px;"+getBaseStyleForValue(tableCol));
        }
    }
    return detailContent;
};
/*
 * descriptiveData:[
 *  {
 *      newTable: true/false,
 *      style:"...",
 *      items:[
 *          {"width":0, "style":"width:100%;font-size:14px;font-weight:bold;text-align:center;", align:"center, "contentStyle":"margin-top:5px;margin-bottom:3px;"",
 *              "label":"НАКЛАДНАЯ" },
 *          {"width":150, "style":"border:solid 1 px;color:red;", "contentStyle":"padding-top:5px;padding-bottom:5px;",
 *              "label":"Номер склада:", "labelStyle":"text-align:center", "id":"store", "type":"numeric", "value":6, "valueStyle":"width:80px" },
 *          {"width":350}
 *      ]
 *  },
 *  {
 *      newTable: true/false,
 *      style:"...",
 *      items:[
 *          {"width":100},
 *          {"width":200, "style":"border:solid 1 px;color:red;", align:"right", "contentStyle":"padding-top:5px;padding-bottom:5px;",
 *              "label":"Нач.дата:", "labelStyle":"text-align:right", "id":"bdate", "type":"date", "value":"2016-10-30", "valueStyle":"width:100px" },
 *          {"width":200, "style":"border:solid 1 px;color:green;", align:"right", "contentStyle":"padding-top:5px;padding-bottom:5px;",
 *              "label":"Конечн.дата:", "labelStyle":"text-align:right", "id":"edate","type":"date", "value":"2016-11-06", "valueStyle":"width:100px" }
 *      ]
 *  }
 * ]
 */
var createDescriptiveTable = function (descriptiveData, table_width) {                                                  console.log("createDescriptiveTable ",descriptiveData);
    var descriptBaseStyle="margin:0;padding:0;border:none;",
        descriptContent = document.createElement('div');
    descriptContent.setAttribute("style", descriptBaseStyle);
    var descript_table, tdBaseStyle="vertical-align:bottom;";//text-align:right;

    for (var rowIndex = 0; rowIndex < descriptiveData.length; rowIndex++) {
        var descriptiveRow=descriptiveData[rowIndex];
        var descriptiveRowData= descriptiveRow.items;
        if (rowIndex===0 || descriptiveRow.newTable===true){
            descript_table = document.createElement("table");
            descriptContent.appendChild(descript_table);
            descript_table.setAttribute("style", descriptBaseStyle+"width:" + table_width + "px;font-size:14;");
        }
        var tr = document.createElement("tr");
        var trStyle=(descriptiveRow.style)?descriptiveRow.style:"";
        tr.setAttribute("style", descriptBaseStyle+trStyle);
        descript_table.appendChild(tr);
        for (var cellIndex = 0; cellIndex < descriptiveRowData.length; cellIndex++) {
            var descriptItemData = descriptiveRowData[cellIndex];
            var td = document.createElement("td");
            var tdStyle= (descriptItemData.style)?descriptItemData.style+";":"";
            if (descriptItemData.width) tdStyle+= "width:" + descriptItemData.width+"px;";
            var tdAligntStyle="text-align:left;";
            if(descriptItemData.align==="right") tdAligntStyle= "text-align:right;";
            else if(descriptItemData.align==="center") tdAligntStyle= "text-align:center;";
            td.setAttribute("style",descriptBaseStyle+tdBaseStyle+tdAligntStyle+tdStyle);
            tr.appendChild(td);
            if (descriptItemData.label===undefined&&descriptItemData.value===undefined) continue;
            var contentStyle= (descriptItemData.contentStyle)?descriptItemData.contentStyle+";":"";
            var tdContentTextStyle = "margin:0;padding:1px;word-wrap:normal;";
            var label=undefined,labelText=undefined;
            if (descriptItemData.label !== undefined) {
                label = document.createElement("div");
                var labelStyle=(descriptItemData.labelStyle)?descriptItemData.labelStyle:"",labelAligntStyle= "float:left;text-align:left;";
                if(descriptItemData.align==="right") labelAligntStyle= "display:inline-block;text-align:right;";
                else if(descriptItemData.align==="center") labelAligntStyle="display:inline-block;";
                label.setAttribute("style", "margin:0;padding:0;border:solid 1px transparent;margin-right:2px;vertical-align:text-bottom;"
                    +contentStyle+labelAligntStyle+labelStyle);
                td.appendChild(label);
                labelText = document.createElement("div");
                labelText.innerText = descriptItemData.label;
                labelText.setAttribute("style", tdContentTextStyle);
                label.appendChild(labelText);
            }
            if (descriptItemData.value !== undefined) {
                var value = document.createElement("div");
                var valueStyle= (descriptItemData.valueStyle)?descriptItemData.valueStyle+";":"", valueAlignStyle="float:left;";
                if(descriptItemData.align==="right") valueAlignStyle="float:right;"; else if(descriptItemData.align==="center") valueAlignStyle="display:inline-block;";
                value.setAttribute("style", "margin:0;padding:0;border:solid 1px;"+valueAlignStyle+getBaseStyleForValue(descriptItemData)+contentStyle+valueStyle);
                td.appendChild(value);
                var valueText = document.createElement("div");
                valueText.setAttribute("style", tdContentTextStyle+"padding-left:5px;padding-right:5px;");
                var dataType= descriptItemData.type, printFormat= descriptItemData.printFormat;
                if (dataType==="text" && descriptItemData.dateFormat) {
                    dataType= "date"; printFormat= descriptItemData.dateFormat;
                }
                valueText.innerText = getPrintValue(descriptItemData.value, dataType, printFormat);
                value.appendChild(valueText);
            }
        }
    }
    return descriptContent;
};
var getBaseStyleForValue = function (ItemData) {
    if (ItemData.type == "date" ||(ItemData.type == "text"&&ItemData.datetimeFormat) ) return "text-align:center;";
    else if (ItemData.type == "numeric") return "text-align:right;";
    else if (ItemData.type == "currency") return "text-align:right;";
    else if (ItemData.align) return "text-align:"+ItemData.align+";";
    return "text-align:left;";
};
var getPrintValue = function (value, valueType, printFormat) {
    numeral.language('ru-UA');
    if (value===undefined||value===null||!valueType) return value;
    if (valueType === "date") {
        if (!printFormat) return moment(value).format("DD.MM.YYYY");
        else return moment(value).format(printFormat);
    } else if (valueType === "numeric") {
        if (!printFormat)
            return numeral(value).format('#,###,###,###,##0.#########');
        else return numeral(value).format(printFormat);
    } else if (valueType === "currency") {
        if (!printFormat)
            return numeral(value).format('#,###,###,###,##0.00#######');
        else return numeral(value).format(printFormat);
    }
    return value;
};