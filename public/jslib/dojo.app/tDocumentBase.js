/**
 * Created by dmkits on 16.02.17.
 */
define(["dojo/_base/declare", "dijit/layout/BorderContainer", "dijit/layout/LayoutContainer", "dijit/layout/ContentPane", "dijit/TitlePane",
        "dijit/form/Button","dijit/form/ToggleButton","dijit/form/TextBox","dijit/form/DateTextBox","dijit/form/NumberTextBox",
        "dijit/form/ComboButton","dijit/Menu", "dijit/MenuItem", "dojo/dom-style"],
    function(declare, BorderContainer, LayoutContainer, ContentPane, TitlePane, Button,ToggleButton, TextBox,DateTextBox,NumberTextBox,
             ComboButton, Menu, MenuItem) {
        return declare("TemplateDocumentBase", [BorderContainer], {
            constructor: function(args,parentName){
                declare.safeMixin(this,args);
                if (this.printFormats === undefined)
                    this.printFormats = {
                        dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######"
                    };
            },
            postCreate: function(){
                //TODO actions of create document elements on parent
            },
            setContainer: function(params, tagName){
                if (!params) params={};
                var container;
                if (!tagName)
                    container= new LayoutContainer(params);
                else
                    container= new LayoutContainer(params, tagName);
                return container;
            },
            /*
             * params = { style }
             */
            setChildContainer: function(params, tagName){
                var container= this.setContainer(params, tagName);
                this.addChild(container);
                return container;
            },
            /*
             * params= { style }
             */
            setContentPane: function(params, tagName){
                if (!params) params={};
                var contentPane;
                if (!tagName)
                    contentPane= new ContentPane(params);
                else
                    contentPane= new ContentPane(params, tagName);
                return contentPane;
            },
            setChildContentPaneTo: function(parent, params){
                var contentPane= this.setContentPane(params);
                parent.addChild(contentPane);
                return contentPane;
            },
            setBorderedStyleFor: function(domNode){
                domNode.classList.remove("dijitLayoutContainer-child");
                domNode.classList.add("dijitBorderContainer-child");
                domNode.classList.remove("dijitLayoutContainer-dijitContentPane");
                domNode.classList.add("dijitBorderContainer-dijitContentPane");
                domNode.classList.remove("dijitLayoutContainerPane");
                domNode.classList.add("dijitBorderContainerPane");
            },
            //createTopContentPane: function(){
            //
            //},

            addTableTo: function(node, style){
                var table = document.createElement("table");
                if (!style) style="";
                table.setAttribute("style","width:100%;height:100%;"+style);
                node.appendChild(table);
                var tableBody = document.createElement("tbody");
                table.appendChild(tableBody);
                return tableBody;
            },
            addRowToTable: function(table,height,style){
                var tableRow = document.createElement("tr");
                if (height!=undefined) tableRow.setAttribute("height", height);
                if (!style) style="";
                style= "white-space:nowrap;"+style;
                tableRow.setAttribute("style", style);
                table.appendChild(tableRow);
                return tableRow;
            },
            addHeaderCellToTableRow: function(tableRow, width, style, content) {
                var tableCell = document.createElement("th");
                if (!style) style="";
                style= "white-space:nowrap;"+style;
                tableCell.setAttribute("style", style);
                if (width!=undefined) tableCell.setAttribute("width", width+"px");
                tableRow.appendChild(tableCell);
                if (content) tableCell.innerHTML= content;
                return tableCell;
            },
            //addCellFromLeftToTableRow: function(tableRow){
            //    if (tableRow.children.length===0) {
            //        var tableCell100p = document.createElement("td");
            //        tableCell100p.setAttribute("width", "100%");
            //        tableRow.appendChild(tableCell100p);
            //    }
            //    var tableCell = document.createElement("td");
            //    tableCell.setAttribute("style", "white-space:nowrap;");
            //    tableRow.insertBefore(tableCell, tableRow.lastChild);
            //    return tableCell;
            //},
            addLeftCellToTableRow: function(tableRow, width, style){
                if (tableRow.children.length===0) {
                    var tableCellEmpty = document.createElement("td");
                    tableRow.appendChild(tableCellEmpty);
                }
                var tableCell = document.createElement("td");
                if (width!=undefined) tableCell.setAttribute("width", width+"px");
                if (!style) style="";
                tableCell.setAttribute("style", "white-space:nowrap;"+style);
                tableRow.insertBefore(tableCell, tableRow.lastChild);
                return tableCell;
            },

            /**
             * params= {labelText, btnStyle, btnChecked, btnParameters}
             */
            addButtonTo: function(parentNode, params){
                var btnParameters={};
                if (params.btnParameters) btnParameters=params.btnParameters;
                if (params.labelText) btnParameters.label=params.labelText;
                if (params.btnChecked!==undefined) {
                    btnParameters.checked=params.btnChecked;
                    btnParameters.iconClass='dijitCheckBoxIcon';
                }
                var button;
                if(params.btnChecked!==undefined){
                    button=new ToggleButton(btnParameters);
                } else if(params.items!==undefined&&params.items.length>0){
                    button=new ComboButton(btnParameters);
                    var menu = new Menu({ style: "display: none;"});
                    for(var i in params.items){
                        var item=params.items[i];
                        var menuItem = new MenuItem({
                            label: item,
                            onClick: function(){console.log(item," clicked!");}
                        });
                        menu.addChild(menuItem);
                    }
                    menu.startup();
                    button.set("dropDown", menu);
                }else button = new Button(btnParameters);
                var btnStyle="";
                if (params.btnStyle) btnStyle=params.btnStyle;
                var existsStyle=button.domNode.firstChild.getAttribute("style");
                if (existsStyle) btnStyle=existsStyle+btnStyle;
                button.domNode.firstChild.setAttribute("style",btnStyle);
                parentNode.appendChild(button.domNode);
                return button;
            },
            /**
             * params= {labelText, cellWidth, cellStyle, btnStyle, btnParameters}
             */
            addTableHeaderButtonTo: function(tableRowNode, params){
                var tableCell = this.addHeaderCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                var button= this.addButtonTo(tableCell, params);
                button.printParams={ cellWidth:params.cellWidth, cellStyle:params.cellStyle,
                    labelText:params.labelText };
                return button;
            },
            /**
             * params= {labelText, cellWidth, cellStyle, btnStyle, btnChecked, btnParameters}
             */
            addTableCellButtonTo: function(tableRowNode, params){
                var tableCell = this.addLeftCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                return this.addButtonTo(tableCell, params);
            },
            createInputTo: function(parent, label, labelStyle){
                var labelTag;
                if (label){
                    labelTag = document.createElement("label");
                    labelTag.innerText=label+" ";
                    if (labelStyle) labelTag.setAttribute("style",labelStyle);
                    parent.appendChild(labelTag);
                }
                var tag = document.createElement("input");
                //if (label) labelTag.setAttribute("for",tag.getAttribute("id"));
                parent.appendChild(tag);
                return tag;
            },
            /**
             * params= {labelText,labelStyle, inputStyle, cellWidth,cellStyle, initValueText, inputParams}
             */
            addTableCellTextBoxTo: function(tableRowNode, params){
                if (!params) params={};
                var tableCell = this.addLeftCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                var inputTextBox= this.createInputTo(tableCell, params.labelText, params.labelStyle);
                var textBoxParams={};
                if (params.inputParams) textBoxParams=params.inputParams;
                if (params.initValueText!==undefined) textBoxParams.value=params.initValueText;
                if (params.inputStyle!==undefined) textBoxParams.style=params.inputStyle;
                var textBox= new TextBox(textBoxParams,inputTextBox);
                textBox.printParams={ cellWidth:params.cellWidth, cellStyle:params.cellStyle,
                    labelText:params.labelText, labelStyle:params.labelStyle, inputStyle:params.inputStyle };
                return textBox;
            },

            addTableInputTo: function(tableRowNode, params){
                if (!params) params={};
                //if (!params.inputStyle) params.inputStyle="";
                //if (!params.style) params.style="";
                var tableCell= this.addLeftCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                var input= this.createInputTo(tableCell, params.labelText/*, params.labelStyle*/);
                //var select= APP.instanceFor(input, Select,
                //    {style:params.inputStyle+params.style, labelDataItem:params.labelDataItem,loadDropDownURL:params.loadDropDownURL,
                //        /*it's for print*/cellWidth:cellWidth, labelText:label, printStyle:params.style, inputStyle:params.inputStyle });
                //this.detailHeader.addControlElementObject(select, itemName);
                //this.addDetailHeaderElement(false,select);
                return input;
            },
            /**
             * params= {labelText,labelStyle, inputStyle, cellWidth,cellStyle, initValueDate, dateBoxParams}
             */
            addTableCellDateBoxTo: function(tableRowNode, params){
                if (!params) params={};
                var tableCell = this.addLeftCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                var inputDateBox= this.createInputTo(tableCell, params.labelText, params.labelStyle);
                var dateBoxParams={};
                if (params.dateBoxParams) dateBoxParams=params.dateBoxParams;
                if (params.initValueDate!==undefined) dateBoxParams.value= params.initValueDate;
                dateBoxParams.style= "width:85px";
                if (params.inputStyle) dateBoxParams.style=params.inputStyle;
                var dateTextBox=new DateTextBox(dateBoxParams,inputDateBox);
                this.addPreviousDayBtn(tableCell,dateTextBox);
                this.addNextDayBtn(tableCell,dateTextBox);
                dateTextBox.printParams={ cellWidth:params.cellWidth, cellStyle:params.cellStyle,
                    labelText:params.labelText, labelStyle:params.labelStyle, inputStyle:params.inputStyle };
                return  dateTextBox;
            },
            /**
             * params= {cellWidth, cellStyle, labelText || printLabel, labelStyle, inputParams, inputStyle, initValues}
             */
            addTableCellNumberTextBoxTo: function(tableRowNode, params){
                if (!params) params={};
                var tableCell = this.addLeftCellToTableRow(tableRowNode, params.cellWidth, params.cellStyle);
                var inputNumberTextBox= this.createInputTo(tableCell, params.labelText, params.labelStyle);
                var numberTextBoxParams={};
                if (params.inputParams) numberTextBoxParams=params.inputParams;
                if (params.initValue!==undefined) numberTextBoxParams.value= params.initValue;
                if (params.inputStyle) numberTextBoxParams.style=params.inputStyle;
                var numberTextBox= new NumberTextBox(numberTextBoxParams,inputNumberTextBox);
                var printLabel;
                if(numberTextBoxParams.printLabel)printLabel=numberTextBoxParams.printLabel;
                else if(params.labelText) printLabel=params.labelText;
                numberTextBox.printParams={ cellWidth:params.cellWidth, cellStyle:params.cellStyle,
                    labelText:printLabel, labelStyle:params.labelStyle, inputStyle:params.inputStyle };
                return numberTextBox;
            },
            addChildTitlePaneTo: function(parent, params, style){
                if (!params) params={};
                if (style) params.style= style;
                var titlePane= new TitlePane(params);
                parent.addChild(titlePane);
                return titlePane;
            },
            /*
             * params { style, newTable:true/false }
             */
            addPrintDataItemTo: function(printData, sectionName, params){
                if (!printData[sectionName]) printData[sectionName]=[];
                var sectionItems= printData[sectionName];
                var sectionItemData={items:[]};
                if (params&&params.style) sectionItemData["style"]= params.style;
                if (params&&params.newTable) sectionItemData["newTable"]= params.newTable;
                sectionItems.push(sectionItemData);
                return printData;
            },
            /*
             * fill data item for printTable module
             * params { width, style, contentStyle, align: "left" / "right" / "center", label, labelStyle, value, type, valueStyle, printFormat }
             */
            addPrintDataSubItemTo: function(printData, sectionName, params){
                if (!printData[sectionName]) printData[sectionName]=[];
                var sectionData= printData[sectionName];
                if (sectionData.length==0) sectionData.push({items:[]});
                var sectionSubItems= sectionData[sectionData.length-1].items;
                var printDataItem= {};
                if (!params){
                    sectionSubItems.push(printDataItem);
                    return printDataItem;
                }
                if (params.style!==undefined) printDataItem["style"]= params.style;
                if (params.width!==undefined) printDataItem["width"]= params.width;
                if (params.contentStyle!==undefined) printDataItem["contentStyle"]= params.contentStyle;
                if (params.align!==undefined) printDataItem["align"]= params.align;
                if (params.label!==undefined) printDataItem["label"]= params.label;
                if (params.labelStyle!==undefined) printDataItem["labelStyle"]= params.labelStyle;
                if (params.value!==undefined) printDataItem["value"]= params.value;
                if (params.type!==undefined) printDataItem["type"]= params.type;
                if (params.valueStyle!==undefined) printDataItem["valueStyle"]= params.valueStyle;
                if (params.printFormat!==undefined) printDataItem["printFormat"]= params.printFormat;
                sectionSubItems.push(printDataItem);
            },
            /*
             * printFormats = { dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######" }
             */
            setPrintDataFormats: function(printData, printFormats){
                if (!printData) return;
                if (!printFormats) printFormats= this.printFormats;
                if (printData.columns){
                    for(var colIndex in printData.columns){
                        var colData= printData.columns[colIndex];
                        if(!colData.type||colData.type==="text"||colData.format||colData.printFormat) continue;
                        if (colData.type==="date"&&printFormats.dateFormat) colData.printFormat= printFormats.dateFormat;
                        if (colData.type==="numeric"&&printFormats.numericFormat) colData.printFormat= printFormats.numericFormat;
                        if (colData.type==="currency"&&printFormats.currencyFormat) colData.printFormat= printFormats.currencyFormat;
                        //if (printFormats.dateFormat&&colData.type==="text"&&colData.dateFormat) colData.dateFormat= printFormats.dateFormat;
                    }
                }
            },
            /**
             * IANAGEZ 11.10.2017
             * params= { visibleColumns,tableData }
             */
            requestForExcelFile:function(params){
                var tableData=params.tableData;
                var visibleColumns=params.visibleColumns;
                var columnsDataForExcel= [];
                for (var i in visibleColumns) {
                    var column = visibleColumns[i];
                    var columnForExcel = {};
                    columnForExcel.data = column.data;
                    columnForExcel.type = column.type;
                    columnForExcel.name = column.name;
                    columnForExcel.width = column.width;
                    if (column.format)columnForExcel.format = column.format;
                    if (column.datetimeFormat)columnForExcel.datetimeFormat = column.datetimeFormat;
                    columnsDataForExcel.push(columnForExcel);
                }
                var xhr = new XMLHttpRequest();
                xhr.open('POST',"/sys/getExcelFile");
                xhr.responseType = 'blob';
                var data=JSON.stringify({columns:columnsDataForExcel,rows:tableData});
                xhr.send(data);
                xhr.onload = function (e){
                    if (this.status == 200) {
                        var blob = new Blob([this.response], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                        var a = document.createElement("a");
                        a.style = "display: none";
                        document.body.appendChild(a);
                        var url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = 'myExcel.xlsx';
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }else{
                        console.log("Impossible to load file");
                    }
                };
            },
            addPreviousDayBtn:function(tableCell,dateTextBox){
                var previousDayBtn = document.createElement('BUTTON');
                previousDayBtn.setAttribute("id","previousDayBtnFor"+dateTextBox.id);
                previousDayBtn.className = "dijitReset dijitButtonNode";
                previousDayBtn.style.width = "18px";
                previousDayBtn.style.height = "18px";
                previousDayBtn.style.border="solid 1px #b5bcc7";
                previousDayBtn.style.color="#b5bcc7";
                previousDayBtn.innerText= "\u25c4";
                tableCell.insertBefore(previousDayBtn, tableCell.lastChild);
                previousDayBtn.onclick=function(){
                    if (dateTextBox.get("disabled")) return;
                    var newDate=moment(new Date(dateTextBox.value)).subtract(1, 'days');
                    dateTextBox.set("displayedValue",newDate.format("DD.MM.YYYY"));
                };
            },
            addNextDayBtn:function(tableCell,dateTextBox){
                var nextDayBtn = document.createElement('BUTTON');
                nextDayBtn.setAttribute("id","nextDayBtn"+dateTextBox.id);
                nextDayBtn.className = "dijitReset dijitButtonNode";
                nextDayBtn.style.width = "18px";
                nextDayBtn.style.height = "18px";
                nextDayBtn.style.border="solid 1px #b5bcc7";
                nextDayBtn.style.color="#b5bcc7";
                nextDayBtn.innerText= "\u25ba";
                tableCell.appendChild(nextDayBtn);
                nextDayBtn.onclick=function(){
                    if (dateTextBox.get("disabled")) return;
                    var newDate=moment(new Date(dateTextBox.value)).add(1, 'days');
                    dateTextBox.set("displayedValue",newDate.format("DD.MM.YYYY"));
                };
            }
        })
    });
