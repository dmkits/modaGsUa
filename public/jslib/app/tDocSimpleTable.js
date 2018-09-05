/**
 * Created by dmkits on 18.12.16.
 */
define(["dojo/_base/declare", "app/app", "app/tDocBase","dijit/form/Select", "app/hTableSimpleFiltered","app/request"],
    function(declare, APP, DocumentBase,Select, HTable, Request) {
        return declare("TemplateDocumentSimpleTable", [DocumentBase], {
            /**
            * args: {titleText, dataURL, dataURLCondition={...},
            *       rightPane:{ width:<width> },
            *       buttonUpdate, buttonPrint, buttonExportToExcel,
            *       printFormats={ ... } }
            * default:
            * rightPane.width=150,
            * buttonUpdate=true, buttonPrint=true, buttonExportToExcel=true,
            * default printFormats={ dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######" }
            * */
            constructor: function(args,parentName){
                this.titleText="";
                this.dataURL=null; this.dataURLCondition=null;
                this.buttonUpdate= true;
                this.buttonPrint= true;
                this.buttonExportToExcel= true;
                this.printFormats= { dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######" };
                this.detailContentErrorMsg="Failed get data!";
                this.srcNodeRef = document.getElementById(parentName);
                declare.safeMixin(this,args);
                if(args.rightPane&& typeof(args.rightPane)=="object"){
                    this.rightContainerParams=args.rightPane;
                    if(!this.rightContainerParams.style) this.rightContainerParams.style="margin:0;padding:0;";
                    if(!this.rightContainerParams.width) this.rightContainerParams.width=150;
                    this.rightContainerParams.style+= ";width:"+this.rightContainerParams.width.toString()+"px;";
                }
            },

            createTopContent: function(){
                this.topContent = this.setChildContentPaneTo(this, {region:'top', style:"margin:0;padding:0;border:none"});
                var topTable = this.addTableTo(this.topContent.containerNode);
                this.topTableRow = this.addRowToTable(topTable);
                var topTableHeaderCell = this.addLeftCellToTableRow(this.topTableRow,1, "padding-bottom:5px;");
                var topHeaderText = document.createElement("h1");
                topHeaderText.appendChild(document.createTextNode(this.titleText));
                topTableHeaderCell.appendChild(topHeaderText);
                var btnsTable = this.addTableTo(this.topContent.containerNode);
                this.btnsTableRow = this.addRowToTable(btnsTable);
                var topTableErrorMsg = this.addTableTo(this.topContent.containerNode);
                var topTableErrorMsgRow=this.addRowToTable(topTableErrorMsg);
                this.topTableErrorMsg= this.addLeftCellToTableRow(topTableErrorMsgRow,1);
            },
            createContentTable: function(HTable, params){
                if (!params) params={};
                if (!params.region) params.region='center';
                if (!params.style) params.style="margin:0;padding:0;";
                if (params.readOnly===undefined) params.readOnly=true;
                if (params.wordWrap===undefined) params.wordWrap=true;
                if (params.useFilters===undefined) params.useFilters=true;
                if (params.allowFillHandle===undefined) params.allowFillHandle=false;
                this.contentTable = new HTable(params);
                this.addChild(this.contentTable);
                var instance = this;
                this.contentTable.onUpdateContent = function(){ instance.onUpdateTableContent(); };
                this.contentTable.onSelect = function(firstSelectedRowData, selection){
                    this.setSelection(firstSelectedRowData, selection);
                    instance.onSelectTableContent(firstSelectedRowData, selection);
                };
            },
            createRightContent: function(params){
                if(this.rightContainerParams){
                    this.rightContainerParams.region='right';
                    this.rightContainerParams.splitter=true;
                    this.rightContainer= this.setContentPane(this.rightContainerParams);
                    this.addChild(this.rightContainer);
                }
            },
            postCreate: function(){
                this.createTopContent();
                this.createContentTable(HTable);
                this.createRightContent();
            },
            loadTableContent: function(additionalCondition){                                                            //console.log("TemplateDocumentSimpleTable loadTableContent");
                var condition = (this.dataURLCondition)?this.dataURLCondition:{};
                if(this.headerData){
                    for(var i=0; i<this.headerData.length;i++){
                        var headerDataItem=this.headerData[i], headerInstanceType=headerDataItem.type, headerInstance=headerDataItem.instance;
                        if(headerInstanceType=="DateBox"&&headerInstance.contentTableCondition){
                            condition[headerInstance.contentTableCondition.replace("=","~")] =
                                headerInstance.format(headerInstance.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                        }else if(headerInstanceType=="DateBox"&&headerInstance.contentTableParam){
                            condition[headerInstance.contentTableParam] =
                                headerInstance.format(headerInstance.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                        }else if(headerInstanceType=="CheckButton"&&headerInstance.checked==true&&headerInstance.contentTableConditions){
                            var checkBtnConditions=headerInstance.contentTableConditions;
                            for(var conditionItemName in checkBtnConditions) condition[conditionItemName]=checkBtnConditions[conditionItemName];
                        } else if(headerInstanceType=="SelectBox"&&headerInstance.contentTableCondition){
                            condition[headerInstance.contentTableCondition.replace("=","~")] =headerInstance.get("value");
                        }
                    }
                }
                if (additionalCondition)
                    for(var addConditionItemName in additionalCondition)
                        condition[addConditionItemName.replace("=","~")]=additionalCondition[addConditionItemName];
                this.contentTable.setContentFromUrl({url:this.dataURL,condition:condition, clearContentBeforeLoad:true});
            },
            reloadTableContentByCondition: function(additionalCondition){                                                     //console.log("TemplateDocumentSimpleTable reloadTableContentByCondition condition=",condition);
                this.loadTableContent(additionalCondition);
            },
            setDetailContentErrorMsg: function(detailContentErrorMsg){
                this.detailContentErrorMsg= detailContentErrorMsg;
                return this;
            },
            getTableContent: function(){
                return this.contentTable.getContent();
            },
            getTableContentSelectedRow: function(){
                return this.contentTable.getSelectedRow();
            },
            getTableContentItemSum: function(tableItemName){
                return this.contentTable.getContentItemSum(tableItemName);
            },
            onUpdateTableContent: function(){
                if(this.contentTable.getDataError())
                    this.topTableErrorMsg.innerHTML= "<b style='color:red'>"+this.detailContentErrorMsg+" Reason: "+this.contentTable.getDataError()+"</b>";
                else
                    this.topTableErrorMsg.innerHTML="";
                if (!this.totals) return;
                for(var tableItemName in this.totals){
                    var totalBox = this.totals[tableItemName];
                    totalBox.updateValue();
                }
                this.callToolPanesContentTableActions();
                this.layout();
            },
            onSelectTableContent: function(firstSelectedRowData, selection){
                this.callToolPanesContentTableActions(firstSelectedRowData);
                //toolPanes contentTableAction
            },

            /**
             * params : { initValueDate:"curDate"/"curMonthBDate"/"curMonthEDate",
             *  contentTableCondition:"<condition>", contentTableParam:"<paramName>" }
             * default params.initValueDate = "curDate"
             * default params.width = 100
             */
            addHeaderDateBox: function(labelText, params){
                if(!params) params={};
                var initValueDate=null;
                if (params.initValueDate==="curMonthBDate") initValueDate= APP.curMonthBDate();
                else if (params.initValueDate==="curMonthEDate") initValueDate= APP.curMonthEDate();
                else initValueDate= APP.today();
                if (!params.width) params.width=105;
                var dateBox= this.addTableCellDateBoxTo(this.topTableRow,
                    {labelText:labelText, labelStyle:"margin-left:5px;", cellWidth:params.width, cellStyle:"text-align:right;",
                        initValueDate:initValueDate});
                if(!this.headerData) this.headerData=[];
                this.headerData.push({type:"DateBox",instance:dateBox});
                if(params.contentTableCondition) dateBox.contentTableCondition=params.contentTableCondition;
                if(params.contentTableParam) dateBox.contentTableParam=params.contentTableParam;
                var instance = this;
                dateBox.onChange = function(){
                    instance.loadTableContent();
                };
                return this;
            },
            /**
             * params : { checked:true/false, contentTableConditions:{<condition>:<conditionValue>, ... } }
             * default params.width=100
             */
            addCheckBtnCondition: function(labelText, params){
                if(!params) params={};
                if (params.width===undefined) params.width=100;
                var btnChecked= true;
                if (this.headerData) {
                    for(var i=0;i<this.headerData.length;i++)
                        if(this.headerData[i].type=="CheckButton"){
                            btnChecked= false; break;
                        }
                }
                var checkBtn= this.addTableCellButtonTo(this.btnsTableRow, {labelText:labelText, cellWidth:params.width,
                    cellStyle:"text-align:center;", btnChecked:btnChecked});
                if(!this.headerData) this.headerData=[];
                this.headerData.push({type:"CheckButton",instance:checkBtn});
                checkBtn.contentTableConditions=params.contentTableConditions;
                checkBtn.printParams={cellWidth:params.width, labelText:labelText};
                var instance = this;
                checkBtn.onClick = function(){
                    for(var i=0;i<instance.headerData.length;i++) {
                        var headerDataItem = instance.headerData[i];
                        if (headerDataItem.type=="CheckButton"&&headerDataItem.instance!=this)
                            headerDataItem.instance.set("checked", false, false);
                        else
                            headerDataItem.instance.set("checked", true, false);
                    }
                    instance.loadTableContent();
                };
                return this;
            },
            /**
             * params : { width, loadDropDownURL, valueItemName, labelDataItem, contentTableCondition:"<conditions>" }
             */
            addSelectBox:function(label, params){
                if (!params) params={};
                if(!params.width)params.width=275;
                var input=this.addTableInputTo(this.topTableRow,{labelText:label, labelStyle:"margin-left:5px; ", cellWidth:params.width, cellStyle:"text-align:right" +
                "; padding-left:10px;"});
                var select= APP.instanceFor(input, Select,
                    {style:"width:180px;", labelDataItem:params.labelDataItem,loadDropDownURL:params.loadDropDownURL,contentTableCondition:params.contentTableCondition});

                select.printParams = {cellWidth:params.width, labelText:label/*, printStyle:params.style*/};

                if(!this.headerData) this.headerData=[];
                this.headerData.push({type:"SelectBox",instance:select});
                select.loadDropDownValuesFromServer= function(callback){
                    Request.getJSONData({url: select.loadDropDownURL, resultItemName:"items"},
                        function (resultItems) {
                            var options=select.get("options"),value = select.get("value");
                            if (resultItems) {
                                select.set("options", resultItems);
                                select.set("value", value);
                            }
                            if(callback) callback();
                        });
                };
                select.selectToggleDropDown= select.toggleDropDown;
                select.toggleDropDown= function(){                                                                   //console.log("ContentController.setSelectDropDown toggleDropDown");
                    select.loadDropDownValuesFromServer(function(){
                        select.selectToggleDropDown();
                    });
                };
                var thisInstance=this;
                select.onChange=function(){
                    thisInstance.loadTableContent();
                };
                return this;
            },
            /*
             * onClickAction = function(this.contentTableContent,this.contentTableInstance)
             */
            addBtn: function(labelText, width, onClickAction){
                if (width===undefined) width=100;
                var btn= this.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var instance= this;
                btn.onClick = function(){
                    if (onClickAction) onClickAction(instance.getTableContent(),instance.contentTable);
                };
                return this;
            },
            addBtnUpdate: function(width, labelText){
                if (width===undefined) width=200;
                if (!labelText) labelText="Обновить";
                this.btnUpdate= this.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var instance= this;
                this.btnUpdate.onClick = function(){
                    instance.loadTableContent();
                };
                return this;
            },
            /*
             * params = { items:["print1","print2",...] }
             */
            addBtnPrint: function(width, labelText, printFormats, params){
                if (width===undefined) width=100;
                if (!labelText) labelText="Печатать";
                var btnParams={labelText:labelText, cellWidth:1, cellStyle:"text-align:right;"};
                if(params&&params.items!=undefined&&params.items.length>0){
                    btnParams.items=params.items;
                }
                this.btnPrint= this.addTableCellButtonTo(this.topTableRow,btnParams);
                var instance = this;
                this.btnPrint.onClick = function(){
                    instance.doPrint();
                };
                return this;
            },
            addBtnExportToExcel: function(width, labelText){
                if (width===undefined) width=100;
                if (!labelText) labelText="Экспорт в excel";
                this.btnExportToExcel= this.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:1, cellStyle:"text-align:right;"});
                var instance = this;
                this.btnExportToExcel.onClick = function(){
                    instance.exportTableContentToExcel();
                };
                return this;
            },
            setTotalContent: function(){
                if (!this.totalContent) {
                    this.totalContent = this.setChildContentPaneTo(this, {region:'bottom',style:"margin:0;padding:0;border:none;"});
                    this.totalTable = this.addTableTo(this.totalContent.containerNode);
                    this.addTotalRow();
                }
                return this;
            },
            addTotalRow: function(){
                this.totalTableRow = this.addRowToTable(this.totalTable);
                if (!this.totalTableData) this.totalTableData= [];
                this.totalTableData.push([]);
                return this;
            },
            addTotalEmpty: function(width){
                this.setTotalContent();
                this.addLeftCellToTableRow(this.totalTableRow, width);
                var totalTableRowData= this.totalTableData[this.totalTableData.length-1];
                totalTableRowData.push(null);
                return this;
            },
            addTotalText: function(text, width){
                this.setTotalContent();
                var totalTableCell = this.addLeftCellToTableRow(this.totalTableRow, width);
                //var totalTableCellDiv = document.createElement("div");
                //totalTableCellDiv.setAttribute("style","width:"+width+"px");
                //totalTableCell.appendChild(totalTableCellDiv);
                if (text) totalTableCell.appendChild(document.createTextNode(text));
                return this;
            },
            /**
             * params { style, inputStyle, pattern }
             * default inputStyle = "width:50px"
             * default inputStyle for totalItemName contain "QTY" = "width:60px"
             * default inputStyle for totalItemName contain "SUM" = "width:90px"
             * default pattern="#,###,###,###,##0.#########"
             * * default pattern for totalItemName contain "SUM" ="#,###,###,###,##0.00#######"
             */
            addTotalNumberBox: function(labelText, width, totalItemName, params){
                this.setTotalContent();
                if (!params) params={};
                if (!params.style&&totalItemName=="TableRowCount") params.style="font-weight:bold;";
                else if (!params.style) params.style="";
                if (!params.inputStyle&&totalItemName&&totalItemName.indexOf("QTY")>=0) params.inputStyle="width:60px";
                else if (!params.inputStyle&&totalItemName&&totalItemName.indexOf("SUM")>=0) params.inputStyle="width:90px";
                else if (!params.inputStyle) params.inputStyle="width:50px";
                if (params.inputStyle&&params.inputStyle.indexOf("width:")<0) params.inputStyle+=";width:50px;";
                if (!params.pattern&&totalItemName.indexOf("SUM")>=0) params.pattern="#,###,###,###,##0.00#######";
                else if(!params.pattern) params.pattern="#,###,###,###,##0.#########";
                var totalNumberTextBox= this.addTableCellNumberTextBoxTo(this.totalTableRow,
                    {cellWidth:width, cellStyle:"text-align:right;",
                        labelText:labelText, labelStyle:params.style, inputStyle:"text-align:right;"+params.style+params.inputStyle,
                        inputParams:{constraints:{pattern:params.pattern}, readOnly:true,
                            /*it's for print*/cellWidth:width, labelText:labelText, printStyle:params.style,
                            inputStyle:"text-align:right;"+params.inputStyle, typeFormat:params.pattern } });
                if (!this.totals) this.totals = {};
                this.totals[totalItemName]= totalNumberTextBox;
                var totalTableRowData= this.totalTableData[this.totalTableData.length-1];
                totalTableRowData.push(totalNumberTextBox);
                return totalNumberTextBox;
            },
            /*
             * params { style, inputStyle }
             */
            addTotalCountNumberBox: function(labelText, width, params){
                var totalNumberTextBox= this.addTotalNumberBox(labelText, width, "TableRowCount", params);
                var thisInstance = this;
                totalNumberTextBox.updateValue = function(){
                    this.set("value", thisInstance.getTableContent().length);
                };
                return this;
            },
            /*
             * params { style, inputStyle, pattern }
             * default pattern="#,###,###,###,##0.#########"
             */
            addTotalSumNumberTextBox: function(labelText, width, tableItemName, params){
                var totalNumberTextBox= this.addTotalNumberBox(labelText, width, tableItemName, params);
                var thisInstance = this;
                totalNumberTextBox.updateValue = function(){
                    this.set("value", thisInstance.getTableContentItemSum(tableItemName));
                };
                return this;
            },
            /**
             * params = { title, contentTableAction }
             * params.contentTableAction = function(params)
             * params.contentTableAction calls on this.contentTable select row, or updated table content
             *  contentTableAction.params = { thisToolPane, contentTable:<this.ContentTable>, instance:<this>,
             *      contentTableSelectedRow:<this.contentTable.getSelectedRow()> }
             */
            addToolPane: function(params){
                if(!this.rightContainer) {
                    console.log("WARNING! Failed addToolPane! Reason: no rightContainer!");
                    return this;
                }
                if(!params) params={};
                if (params.title===undefined) params.title="";
                if (params.width===undefined) params.width=100;
                var actionsTitlePane= this.addChildTitlePaneTo(this.rightContainer,{title:params.title});
                if (params.contentTableAction) actionsTitlePane.contentTableAction = params.contentTableAction;
                if (!this.toolPanes) this.toolPanes= [];
                this.toolPanes.push(actionsTitlePane);
                this.addTableTo(actionsTitlePane.containerNode);
                return this;
            },
            callToolPanesContentTableActions: function(firstSelectedRowData){
                if(!this.toolPanes) return;
                for (var i = 0; i < this.toolPanes.length; i++) {
                    var toolPane = this.toolPanes[i];
                    if(!toolPane.contentTableAction) continue;
                    if(!firstSelectedRowData) firstSelectedRowData=this.contentTable.getSelectedRow();
                    toolPane.contentTableAction({thisToolPane:toolPane, contentTable:this.contentTable, instance:this,
                        contentTableSelectedRow:firstSelectedRowData});
                }
            },
            addToolPaneBR: function(){
                var row= this.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                this.addLeftCellToTableRow(row).innerHTML="<br>";
                return this;
            },
            /**
             * tableRowAction = function(contentTableRowData, actionParams, contentTableUpdatedRowData, startNextAction, finishedAction)
             *      startNextAction = function(true/false), if false- restart current action
             *      actionParams = { tableInstance, toolPanes, thisInstance }
             */
            addContentTableRowAction: function(actionName, tableRowAction){
                if(!this.contentTableActions) this.contentTableActions={};
                this.contentTableActions[actionName] = { tableRowActionFunction:tableRowAction };
                return this;
            },
            /**
             * actions = { startAction, tableRowAction, endAction }
             *      startAction = function(contentTableRowsData, actionParams, startTableRowActions)
             *      tableRowAction = function(contentTableRowData, actionParams, contentTableUpdatedRowData, startNextAction, finishedAction)
             *          startNextAction = function(true/false), if false- restart current action
             *      endAction = function(contentTableRowsData, actionParams)
             *      actionParams = { contentTableInstance, toolPanes, thisInstance }
             */
            addContentTableRowsAction: function(actionName, actions){
                if(!actions) return this;
                if(!this.contentTableActions) this.contentTableActions={};
                this.contentTableActions[actionName] = {
                    startActionFunction:actions.startAction,
                    tableRowActionFunction:actions.tableRowAction,//function(tableContentRowData, params, tableUpdatedRowData, startNextAction, finishedAction)
                    endActionFunction:actions.endAction
                };
                return this;
            },

            /**
             * actionParams = { btnStyle, btnParams, actionFunction, contentTableActionName, beforeContentTableRowsAction }
             *      actionFunction = function(actionParams)
             *          actionParams = { contentTableRowsData, contentTableInstance, toolPanes, thisInstance }
             *      beforeContentTableRowsAction = function(contentTableRowsData, actionParams, startContentTableRowsAction)
             *          actionParams = { contentTableInstance, toolPanes, thisInstance }
             *          startContentTableRowsAction= function(contentTableRowsDataForAction)
             */
            addToolPaneActionButton: function(label, actionParams){
                if(!this.rightContainer) {
                    console.log("WARNING! Failed addToolPaneActionButton! Reason: no rightContainer!");
                    return this;
                }
                if (!this.toolPanes||this.toolPanes.length==0) this.addToolPane("");
                var actionsTableRow= this.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                if(!actionParams) actionParams={};
                var actionButton= this.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0,
                    btnStyle:actionParams.btnStyle, btnParameters:actionParams.btnParams});
                if (!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                var actionFunctionParams={contentTableInstance:this.contentTable, toolPanes:this.toolPanes, thisInstance:this,
                    contentTableRowsData:this.getTableContent()};
                if(actionParams.actionFunction) {
                    actionButton.onClick=function(){
                        actionParams.actionFunction(actionFunctionParams);
                    };
                    return this;
                }
                var thisInstance=this;
                var contentTableRowAction, contentTableRowsActionFunction;
                if (actionParams.contentTableActionName)
                    contentTableRowAction= this.contentTableActions[actionParams.contentTableActionName];
                if(contentTableRowAction&&contentTableRowAction.startActionFunction&&contentTableRowAction.tableRowActionFunction){
                    contentTableRowsActionFunction= function(tableContentForAction,actionParams){
                        contentTableRowAction.startActionFunction(tableContentForAction, actionParams,
                            /*startContentTableRowsAction*/function(){
                                thisInstance.contentTable.updateRowsAction(tableContentForAction, actionParams,
                                    contentTableRowAction.tableRowActionFunction, contentTableRowAction.endActionFunction);
                            });
                    };
                } else if(contentTableRowAction&&contentTableRowAction.tableRowActionFunction){
                    contentTableRowsActionFunction= function(tableContentForAction,actionParams){
                        thisInstance.contentTable.updateRowsAction(tableContentForAction, actionParams,
                            contentTableRowAction.tableRowActionFunction, contentTableRowAction.endActionFunction);
                    };
                }
                if(actionParams.beforeContentTableRowsAction){
                    actionButton.onClick= function(){
                        var contentTableRowsData=thisInstance.getTableContent();
                        actionParams.beforeContentTableRowsAction(contentTableRowsData,actionParams,
                            function(contentTableRowsDataForAction){
                                if(!contentTableRowsDataForAction) contentTableRowsDataForAction=contentTableRowsData;
                                if(contentTableRowsActionFunction)
                                    contentTableRowsActionFunction(contentTableRowsDataForAction, actionParams);
                            });
                    }
                } else if(contentTableRowsActionFunction)
                    actionButton.onClick= function(){
                        var contentTableRowsData=thisInstance.getTableContent();
                        contentTableRowsActionFunction(contentTableRowsData, actionParams);
                    };
                return this;
            },

            /**
             * actionParams = { btnStyle, btnParams, actionFunction, contentTableActionName, beforeContentTableRowsAction }
             *      actionFunction = function(selectedTableContent, actionParams)
             *      beforeContentTableRowsAction = function(selectedTableContent, actionParams, startContentTableRowsAction)
             *          actionParams = { contentTableInstance, toolPanes, thisInstance }
             *          startContentTableRowsAction= function(contentTableRowsDataForAction)
             */
            addContentTablePopupMenuAction: function(itemName, actionParams){
                var thisInstance=this, thisContentTable= this.contentTable;
                if(!actionParams) actionParams={};
                actionParams.contentTableInstance=thisContentTable;
                actionParams.toolPanes=thisInstance.toolPanes;
                actionParams.thisInstance=thisInstance;
                var menuItemActionFunction;
                if(actionParams.actionFunction) {
                    menuItemActionFunction= actionParams.actionFunction;
                } else {
                    var contentTableRowAction= this.contentTableActions[actionParams.contentTableActionName];
                    var contentTableRowsActionFunction;
                    if(contentTableRowAction&&contentTableRowAction.startActionFunction&&contentTableRowAction.tableRowActionFunction){
                        contentTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            contentTableRowAction.startActionFunction(rowsDataForAction, actionParams,
                                /*startContentTableRowsAction*/function(){
                                    thisInstance.contentTable.updateRowsAction(rowsDataForAction, actionParams,
                                        contentTableRowAction.tableRowActionFunction, contentTableRowAction.endActionFunction);
                                });
                        };
                    } else if(contentTableRowAction&&contentTableRowAction.tableRowActionFunction){
                        contentTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            thisInstance.contentTable.updateRowsAction(rowsDataForAction, actionParams,
                                contentTableRowAction.tableRowActionFunction, contentTableRowAction.endActionFunction);
                        }
                    }
                    if(actionParams.beforeContentTableRowsAction){
                        menuItemActionFunction= function(rowsDataForAction, actionParams){
                            actionParams.beforeContentTableRowsAction(rowsDataForAction, actionParams,
                                function(contentTableRowsDataForAction){
                                    if(!contentTableRowsDataForAction) contentTableRowsDataForAction=rowsDataForAction;
                                    if(contentTableRowsActionFunction)
                                        contentTableRowsActionFunction(contentTableRowsDataForAction, actionParams)
                                })
                        }
                    } else if (contentTableRowsActionFunction){
                        menuItemActionFunction= contentTableRowsActionFunction;
                    }
                }
                if(!menuItemActionFunction) return this;
                thisContentTable.setMenuItem(itemName, actionParams,
                    /*menuItemAction*/function(selRowsData, actionParams){
                        var rowsDataForAction=[];
                        for(var selInd in selRowsData) rowsDataForAction.push(selRowsData[selInd]);
                        menuItemActionFunction(rowsDataForAction, actionParams);
                    });
                return this;
            },

            startUp: function(){
                if (this.buttonUpdate!=false&&!this.btnUpdate) this.addBtnUpdate();
                if (this.buttonPrint!=false&&!this.btnPrint) this.addBtnPrint();
                if (this.buttonExportToExcel!=false&&!this.btnExportToExcel) this.addBtnExportToExcel();
                if(this.headerData)
                    for(var i=0;i<this.headerData.length;i++){
                        var headerDataItem=this.headerData[i], headerInstanceType=headerDataItem.type, headerInstance=headerDataItem.instance;
                        if(headerInstanceType=="SelectBox"&&headerInstance.loadDropDownValuesFromServer) headerInstance.loadDropDownValuesFromServer();
                    }

                this.loadTableContent();
                this.layout();
                return this;
            },

            /**
             * printParams={ cellWidth:params.cellWidth, cellStyle:params.cellStyle,
                    labelText:params.labelText, labelStyle:params.labelStyle, inputStyle:params.inputStyle };
             * @param printFormats
             */
            doPrint: function(printFormats){
                var printData = {};
                if (this.titleText) {
                    this.addPrintDataSubItemTo(printData, "header",
                        {label:this.titleText, width:0, align:"center",style:"width:100%;font-size:14px;font-weight:bold;text-align:center;", contentStyle:"margin-top:5px;margin-bottom:3px;"});
                }
                var headerTextStyle="font-size:14px;", headerDateContentStyle="margin-bottom:3px;";
                if(this.headerData){
                    this.addPrintDataItemTo(printData, "header", {newTable:true, style:headerTextStyle});
                    this.addPrintDataSubItemTo(printData, "header");
                    for(var i in this.headerData){
                        var headerItemData=this.headerData[i];
                        var printParams={};
                        if(headerItemData.type=="DateBox"){
                            printParams = headerItemData.instance.printParams;
                                this.addPrintDataSubItemTo(printData, "header",
                                    {label:printParams.labelText, width:printParams.cellWidth, align:"left",style:headerTextStyle, contentStyle:headerDateContentStyle, value:headerItemData.instance.get("value"),type:"date"});
                        }else if(headerItemData.type=="SelectBox"){
                            printParams = headerItemData.instance.printParams;
                            this.addPrintDataSubItemTo(printData, "header",
                                        {label:printParams.labelText, width:printParams.cellWidth, align:"left",style:headerTextStyle, contentStyle:headerDateContentStyle, value:headerItemData.instance.get("value")});
                        }else if(headerItemData.type=="CheckButton"){
                            if(headerItemData.instance.checked==true) {
                                printParams = headerItemData.instance.printParams;
                                this.addPrintDataSubItemTo(printData, "header",
                                    {label: printParams.labelText, width: printParams.cellWidth, align: "left", style: headerTextStyle, contentStyle: headerDateContentStyle});
                            }
                        }
                    }
                }
                this.addPrintDataSubItemTo(printData, "header");
                printData.columns = this.contentTable.getVisibleColumns();                                       //console.log("doPrint printData.columns=",this.contentTable.getVisibleColumns());
                printData.data = this.contentTable.getContent();
                var totalStyle="font-size:12px;";
                if (this.totals){
                    for(var tRowIndex in this.totalTableData){
                        var tRowData= this.totalTableData[tRowIndex];
                        this.addPrintDataItemTo(printData, "total", {style:totalStyle});
                        for(var tCellIndex in tRowData){
                            var tCellData= tRowData[tCellIndex];
                            if (tCellData===null) {
                                this.addPrintDataSubItemTo(printData, "total");
                                continue
                            }
                            this.addPrintDataSubItemTo(printData, "total", {width:tCellData.cellWidth+5, style:tCellData.printStyle, align:"right",
                                contentStyle:"margin-top:3px;", label:tCellData.labelText, value:tCellData.textbox.value, type:"text", valueStyle:tCellData.inputStyle});
                        }
                    }
                }
                this.setPrintDataFormats(printData, printFormats);
                var printWindow= window.open("/print/printSimpleDocument");                                             //console.log("doPrint printWindow printData=",printData);
                printWindow["printTableContentData"]= printData;
            },
            exportTableContentToExcel:function(){
                this.requestForExcelFile({tableData:this.contentTable.getContent(),visibleColumns:this.contentTable.getVisibleColumns()});
            }
        });
    });
