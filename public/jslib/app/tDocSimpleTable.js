/**
 * Created by dmkits on 18.12.16.
 */
define(["dojo/_base/declare", "dijit/layout/BorderContainer", "app/tDocsFunctions", "app/base", "app/hTableSimpleFiltered","app/request"],
    function(declare, BorderContainer, TDocsFunctions, Base, HTable, Request) {
        var $TDF=TDocsFunctions;
        return declare("TDocSimpleTable", [BorderContainer], {
            /**
            * args: { titleText, dataURL, dataURLCondition={...},
            *         rightPane:{ width:<width> },
            *         buttonUpdate, buttonPrint, buttonExportToExcel,
            *         printFormats={ ... }
            * }
            * default:
            *   rightPane.width=150,
            *   buttonUpdate=true, buttonPrint=true, buttonExportToExcel=true,
            * default printFormats={ dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######" }
            */
            constructor: function(args){
                this.titleText=this.title||"";
                this.dataURL=null; this.dataURLCondition=null;
                this.buttonUpdate= true;
                this.buttonPrint= true;
                this.buttonExportToExcel= true;
                this.printFormats= { dateFormat:"DD.MM.YY", numericFormat:"#,###,###,###,##0.#########", currencyFormat:"#,###,###,###,##0.00#######" };
                declare.safeMixin(this,args);
                if(args.rightPane&& typeof(args.rightPane)=="object") this.rightContainerParams=args.rightPane;
            },
            /**
             * params: { titleText, dataURL, dataURLCondition={...},
            *            rightPane:{ width:<width>, ... },
            *            buttonUpdate, buttonPrint, buttonExportToExcel,
            *            printFormats={ ... } or other.
            *  }
            */
            init: function(params){
                if(!params)return this;
                for(var pName in params){
                    var pValue=params[pName];
                    if(pName=="rightPane") this.rightContainerParams=pValue; else this[pName]=pValue;
                }
                if(this.titleText) this.topHeaderTitle.innerHTML=this.titleText;
                if(this.rightContainerParams) this.createRightContent(this.rightContainerParams);
                return this;
            },
            createTopContent: function(){
                this.topContent = $TDF.setChildContentPaneTo(this, {region:'top', style:"margin:0;padding:0;border:none"});
                var topTable = $TDF.addTableTo(this.topContent.containerNode);
                this.topTableRow = $TDF.addRowToTable(topTable);
                var topTableHeaderCell = $TDF.addLeftCellToTableRow(this.topTableRow,1, "padding-bottom:5px;");
                var topHeaderText = this.topHeaderTitle = document.createElement("h1");
                topHeaderText.appendChild(document.createTextNode(this.titleText||this.title));
                topTableHeaderCell.appendChild(topHeaderText);
                var btnsTable = $TDF.addTableTo(this.topContent.containerNode);
                this.btnsTableRow = $TDF.addRowToTable(btnsTable);
            },
            createContentTable: function(HTable, params){
                if(!params) params={};
                if(!params.region) params.region='center';
                if(!params.style) params.style="margin:0;padding:0;";
                if(params.readOnly===undefined) params.readOnly=true;
                if(params.wordWrap===undefined) params.wordWrap=true;
                if(params.useFilters===undefined) params.useFilters=true;
                if(params.allowFillHandle===undefined) params.allowFillHandle=false;
                this.addChild(this.contentHTable=new HTable(params));
                var instance = this;
                this.contentHTable.onUpdateContent = function(){
                    if(!this.getSelectedRow()) this.setSelectedRowByIndex(0);
                    instance.onUpdateTableContent();
                };
                this.contentHTable.onSelect = function(firstSelectedRowData, selection){
                    this.setSelection(firstSelectedRowData, selection);
                    instance.onSelectTableContent(firstSelectedRowData, selection);
                };
            },
            /**
             * params: { width:<width>, ... }, right pane params
             * default:
             *   params.width=150
             */
            createRightContent: function(params){
                if(!this.rightContainerParams&&params)this.rightContainerParams=params;
                if(!this.rightContainerParams)return this;
                if(!this.rightContainerParams.style) this.rightContainerParams.style="margin:0;padding:0;";
                if(!this.rightContainerParams.width) this.rightContainerParams.width=150;
                this.rightContainerParams.style+= ";width:"+this.rightContainerParams.width.toString()+"px;";
                this.rightContainerParams.region='right';
                this.rightContainerParams.splitter=true;
                this.addChild(this.rightContainer= $TDF.setContentPane(this.rightContainerParams));
            },
            postCreate: function(){
                this.createTopContent();
                this.createContentTable(HTable);
                this.createRightContent();
                this.startup();
            },
            loadTableContent: function(additionalConditions){                                               //console.log("TDocSimpleTable loadTableContent",this.dataURL,this);
                var conditions = (this.dataURLCondition)?this.dataURLCondition:{};
                if(this.headerData){
                    for(var hdID in this.headerData){
                        var headerDataItem= this.headerData[hdID], headerInstanceType=headerDataItem.type, headerInstance=headerDataItem.instance;
                        if(headerInstanceType=="DateBox"&&headerInstance.contentTableCondition){
                            conditions[headerInstance.contentTableCondition.replace("=","~")] =
                                headerInstance.format(headerInstance.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                        }else if(headerInstanceType=="DateBox"&&headerInstance.contentTableParam){
                            conditions[headerInstance.contentTableParam] =
                                headerInstance.format(headerInstance.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                        }else if(headerInstanceType=="CheckButton"&&headerInstance.checked==true&&headerInstance.contentTableConditions){
                            var checkBtnConditions=headerInstance.contentTableConditions;
                            for(var conditionItemName in checkBtnConditions) conditions[conditionItemName]=checkBtnConditions[conditionItemName];
                        } else if(headerInstanceType=="SelectBox"&&headerInstance.contentTableCondition){
                            conditions[headerInstance.contentTableCondition.replace("=","~")] =headerInstance.get("value");
                        }
                    }
                }
                if(additionalConditions)
                    for(var addConditionItemName in additionalConditions)
                        conditions[addConditionItemName.replace("=","~")]=additionalConditions[addConditionItemName];
                this.contentHTable.setContentFromUrl({url:this.dataURL,conditions:conditions, clearContentBeforeLoad:true});
            },
            reloadTableContentByCondition: function(additionalCondition){                                   //console.log("TDocSimpleTable reloadTableContentByCondition condition=",condition);
                this.loadTableContent(additionalCondition);
            },
            getHTableContent: function(){
                return this.contentHTable.getContent();
            },
            getHTableContentSelectedRow: function(){
                return this.contentHTable.getSelectedRow();
            },
            getHTableContentItemSum: function(tableItemName){
                return this.contentHTable.getContentItemSum(tableItemName);
            },
            onUpdateTableContent: function(){
                if(!this.totals) return;
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
             * params : { initValueDate:"curDate"/"curMonthBDate"/"curMonthEDate"/<value>,
             *  contentTableCondition:"<condition>", contentTableParam:"<paramName>" }
             * default params.initValueDate = "curDate"
             * default params.width = 100
             */
            addHeaderDateBox: function(labelText, params){
                if(!params) params={};
                var initValueDate=null;
                if(params.initValueDate==="curMonthBDate") initValueDate= Base.curMonthBDate();
                else if(params.initValueDate==="curMonthEDate") initValueDate= Base.curMonthEDate();
                else if(params.initValueDate===undefined||params.initValueDate==="curDate") initValueDate= Base.today();
                else initValueDate=params.initValueDate;
                if(!params.width) params.width=105;
                var dateBox= $TDF.addTableCellDateBoxTo(this.topTableRow,
                    {labelText:labelText, labelStyle:"margin-left:5px;", cellWidth:params.width, cellStyle:"text-align:right;",
                        initValueDate:initValueDate});
                if(!this.headerData) this.headerData={};
                this.headerData[dateBox.id]= {type:"DateBox",instance:dateBox};
                if(params.contentTableCondition) dateBox.contentTableCondition=params.contentTableCondition;
                if(params.contentTableParam) dateBox.contentTableParam=params.contentTableParam;
                var instance = this;
                dateBox.onChange = function(){ instance.loadTableContent(); };
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
                if(this.headerData){
                    for(var hdID in this.headerData)
                        if(this.headerData[hdID].type=="CheckButton"){ btnChecked= false; break; }
                }
                var checkBtn= $TDF.addTableCellButtonTo(this.btnsTableRow, {labelText:labelText, cellWidth:params.width,
                    cellStyle:"text-align:center;", btnChecked:btnChecked});
                if(!this.headerData) this.headerData={};
                this.headerData[checkBtn.id]= {type:"CheckButton",instance:checkBtn};
                checkBtn.contentTableConditions=params.contentTableConditions;
                checkBtn.printParams={cellWidth:params.width, labelText:labelText};
                var instance = this;
                checkBtn.onClick = function(){
                    for(var hdID in instance.headerData){
                        var headerDataItem = instance.headerData[hdID];
                        if(headerDataItem.type=="CheckButton"&&headerDataItem.instance!=this)
                            headerDataItem.instance.set("checked", false, false);
                        else
                            headerDataItem.instance.set("checked", true, false);
                    }
                    instance.loadTableContent();
                };
                return this;
            },
            /**
             * params = { id, width, selectStyle, loadDropDownURL, defValue, contentTableCondition:"<conditions>" }
             *      id - optional,
             *      loadDropDownURL - URL returned data items for select drop-down list [{label,value},...]
             *      defValue: "<value>" || "=<value>" || "><value>"
             */
            addSelectBox: function(label, params){
                if(!params) params={};
                if(!params.width)params.width=275;
                var selectParams= {loadDropDownURL:params.loadDropDownURL,contentTableCondition:params.contentTableCondition};
                if(params.id) selectParams.id= params.id;
                var select= $TDF.addTableCellSelectTo(this.topTableRow,
                    { cellWidth:params.width,cellStyle:"text-align:right;padding-left:10px;",
                        labelText:label, labelStyle:"margin-left:5px;", selectStyle:params.selectStyle, selectParams:selectParams });
                if(!this.headerData) this.headerData={};
                this.headerData[select.id]= {type:"SelectBox",instance:select};
                select.loadDropDownValuesFromServer= function(callOnUpdate,callback){
                    Request.getJSONData({url: select.loadDropDownURL, resultItemName:"items"},function(resultItems){
                        var options= select.get("options"),value= select.get("value");
                        if(resultItems){
                            select.set("options",resultItems,callOnUpdate);
                            if((value===undefined||value===null||value=="")&&params.defValue){//exists params.defValue
                                var pDefValue= params.defValue.toString().trim(), defValue="";
                                for(var i in resultItems){
                                    var itemData=resultItems[i];
                                    if(itemData.value===undefined||itemData.value===null)continue;
                                    if( (pDefValue.indexOf("=")==0&&itemData.value==pDefValue.substr(1,pDefValue.length-1))
                                        ||(pDefValue.indexOf("<")==0&&itemData.value<pDefValue.substr(1,pDefValue.length-1))
                                        ||(pDefValue.indexOf(">")==0&&itemData.value>pDefValue.substr(1,pDefValue.length-1)) ){
                                        defValue=itemData.value; break;
                                    }else if(itemData.value==pDefValue){
                                        defValue=itemData.value; break;
                                    }
                                }
                                select.set("value",defValue,callOnUpdate);
                            }else
                                select.set("value",value,callOnUpdate);
                        }
                        if(callback) callback();
                    });
                };
                select.selectToggleDropDown= select.toggleDropDown;
                select.toggleDropDown= function(){
                    select.loadDropDownValuesFromServer(true,function(){
                        select.selectToggleDropDown();
                    });
                };
                var thisInstance=this;
                select.onChange=function(){ thisInstance.loadTableContent(); };
                return this;
            },
            /**
             * onClickAction = function(this.contentHTableContent,this.contentHTableInstance)
             */
            addBtn: function(labelText, width, onClickAction){
                if(width===undefined) width=100;
                var btn= $TDF.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var instance= this;
                btn.onClick = function(){
                    if (onClickAction) onClickAction(instance.getHTableContent(),instance.contentHTable);
                };
                return this;
            },
            addBtnUpdate: function(width, labelText){
                if(width===undefined) width=200;
                if(!labelText) labelText="Обновить";
                this.btnUpdate= $TDF.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var instance= this;
                this.btnUpdate.onClick = function(){ instance.loadTableContent(); };
                return this;
            },
            /**
             * params = { items:["print1","print2",...] }
             */
            addBtnPrint: function(width, labelText, printFormats, params){
                if(width===undefined) width=1;
                if(!labelText) labelText="Печатать";
                var btnParams={labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"};
                if(params&&params.items!=undefined&&params.items.length>0){
                    btnParams.items=params.items;
                }
                this.btnPrint= $TDF.addTableCellButtonTo(this.topTableRow,btnParams);
                var instance = this;
                this.btnPrint.onClick = function(){ instance.doPrint(); };
                return this;
            },
            addBtnExportToExcel: function(width, labelText){
                if(width===undefined) width=1;
                if(!labelText) labelText="Экспорт в excel";
                this.btnExportToExcel= $TDF.addTableCellButtonTo(this.topTableRow, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var instance = this;
                this.btnExportToExcel.onClick = function(){ instance.exportTableContentToExcel(); };
                return this;
            },
            setTotalContent: function(){
                if(!this.totalContent){
                    this.totalContent = $TDF.setChildContentPaneTo(this, {region:'bottom',style:"margin:0;padding:0;border:none;"});
                    this.totalTable = $TDF.addTableTo(this.totalContent.containerNode);
                    this.addTotalRow();
                }
                return this;
            },
            addTotalRow: function(){
                this.totalTableRow = $TDF.addRowToTable(this.totalTable);
                if(!this.totalTableData) this.totalTableData= [];
                this.totalTableData.push([]);
                return this;
            },
            addTotalEmpty: function(width){
                this.setTotalContent();
                $TDF.addLeftCellToTableRow(this.totalTableRow, width);
                var totalTableRowData= this.totalTableData[this.totalTableData.length-1];
                totalTableRowData.push(null);
                return this;
            },
            addTotalText: function(text, width){
                this.setTotalContent();
                var totalTableCell = $TDF.addLeftCellToTableRow(this.totalTableRow, width);
                //var totalTableCellDiv = document.createElement("div");
                //totalTableCellDiv.setAttribute("style","width:"+width+"px");
                //totalTableCell.appendChild(totalTableCellDiv);
                if(text) totalTableCell.appendChild(document.createTextNode(text));
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
                if(!params) params={};
                if(!params.style&&totalItemName=="TableRowCount") params.style="font-weight:bold;";
                else if(!params.style) params.style="";
                if(!params.inputStyle&&totalItemName&&totalItemName.indexOf("QTY")>=0) params.inputStyle="width:60px";
                else if(!params.inputStyle&&totalItemName&&totalItemName.indexOf("SUM")>=0) params.inputStyle="width:90px";
                else if(!params.inputStyle) params.inputStyle="width:50px";
                if(params.inputStyle&&params.inputStyle.indexOf("width:")<0) params.inputStyle+=";width:50px;";
                if(!params.pattern&&totalItemName.indexOf("SUM")>=0) params.pattern="#,###,###,###,##0.00#######";
                else if(!params.pattern) params.pattern="#,###,###,###,##0.#########";
                var totalNumberTextBox= $TDF.addTableCellNumberTextBoxTo(this.totalTableRow,
                    {cellWidth:width, cellStyle:"text-align:right;", labelText:labelText, labelStyle:params.style,
                        inputStyle:"text-align:right;"+params.style+params.inputStyle,
                        inputParams:{constraints:{pattern:params.pattern}, readOnly:true } });
                if(!this.totals) this.totals = {};
                this.totals[totalItemName]= totalNumberTextBox;
                var totalTableRowData= this.totalTableData[this.totalTableData.length-1];
                totalTableRowData.push(totalNumberTextBox);
                return totalNumberTextBox;
            },
            /**
             * params { style, inputStyle }
             */
            addTotalCountNumberBox: function(labelText, width, params){
                var totalNumberTextBox= this.addTotalNumberBox(labelText, width, "TableRowCount", params);
                var thisInstance = this;
                totalNumberTextBox.updateValue = function(){
                    this.set("value", thisInstance.getHTableContent().length);
                };
                return this;
            },
            /**
             * params { style, inputStyle, pattern }
             * default pattern="#,###,###,###,##0.#########"
             */
            addTotalSumNumberTextBox: function(labelText, width, tableItemName, params){
                var totalNumberTextBox= this.addTotalNumberBox(labelText, width, tableItemName, params);
                var thisInstance = this;
                totalNumberTextBox.updateValue = function(){
                    this.set("value", thisInstance.getHTableContentItemSum(tableItemName));
                };
                return this;
            },
            /**
             * params = { title, width, contentTableAction }
             * params.contentTableAction = function(params)
             * params.contentTableAction calls on this.contentHTable select row, or updated table content
             *  contentTableAction.params = { thisToolPane, contentHTable:<this.contentHTable>, thisDoc:<this>,
             *      contentHTableSelectedRow:<this.contentHTable.getSelectedRow()> }
             */
            addToolPane: function(params){
                if(!this.rightContainer){
                    console.error("WARNING! Failed addToolPane! Reason: no rightContainer!");
                    return this;
                }
                if(!params) params={};
                if(params.title===undefined) params.title="";
                if(params.width===undefined) params.width=100;
                var actionsTitlePane= $TDF.addChildTitlePaneTo(this.rightContainer,{title:params.title});
                if(params.contentTableAction) actionsTitlePane.contentTableAction = params.contentTableAction;
                if(!this.toolPanes) this.toolPanes= [];
                this.toolPanes.push(actionsTitlePane);
                $TDF.addTableTo(actionsTitlePane.containerNode);
                return this;
            },
            callToolPanesContentTableActions: function(firstSelectedRowData){
                if(!this.toolPanes) return;
                for(var i = 0; i < this.toolPanes.length; i++){
                    var toolPane = this.toolPanes[i];
                    if(!toolPane.contentTableAction) continue;
                    if(!firstSelectedRowData) firstSelectedRowData=this.contentHTable.getSelectedRow();
                    toolPane.contentTableAction({thisToolPane:toolPane, contentHTable:this.contentHTable, thisDoc:this,
                        contentHTableSelectedRow:firstSelectedRowData});
                }
            },
            addToolPaneBR: function(){
                var row= $TDF.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                $TDF.addLeftCellToTableRow(row).innerHTML="<br>";
                return this;
            },
            /**
             * tableRowAction = function(contentHTableRowData, actionParams, contentHTableUpdatedRowData, startNextAction, finishedAction)
             *      startNextAction = function(true/false), if false- restart current action
             *      actionParams = { contentHTable, toolPanes, thisDoc, progressDialog }
             */
            addContentTableRowAction: function(actionName, tableRowAction){
                if(!this.contentTableActions) this.contentTableActions={};
                this.contentTableActions[actionName] = { tableRowActionFunction:tableRowAction };
                return this;
            },
            /**
             * actions = { action } || { startAction, tableRowAction, endAction }
             *      action = function(contentHTableSelectedRowsData, actionParams)
             *      startAction = function(contentHTableRowsDataForAction, actionParams, startTableRowActions)
             *          startTableRowActions = function()
             *      tableRowAction = function(contentHTableRowDataForAction, actionParams, contentHTableUpdatedRowData, startNextAction, finishedAction)
             *          startNextAction = function(true/false), if false- repeat current row action
             *      endAction = function(contentHTableRowsDataForAction, actionParams)
             *      actionParams = { contentHTable, toolPanes, thisDoc, progressDialog }
             */
            addContentTableAction: function(actionName, actions){
                if(!actions) return this;
                if(!this.contentTableActions) this.contentTableActions={};
                this.contentTableActions[actionName] = {
                    startActionFunction:actions.startAction,
                    tableRowActionFunction:actions.tableRowAction,//function(tableContentRowData, params, tableUpdatedRowData, startNextAction, finishedAction)
                    endActionFunction:actions.endAction
                };
                return this;
            },
            getContentTableActionByName: function(actionName){
                var self=this, contentTableRowActions= this.contentTableActions[actionName];
                if(!contentTableRowActions)return;
                var contentTableRowsActionFunction;
                if(contentTableRowActions.startActionFunction&&contentTableRowActions.tableRowActionFunction){
                    contentTableRowsActionFunction=function(contentHTableRowsDataForAction, actionParams){
                        actionParams.progressDialog=actionParams.contentHTable.updateRowsActionDialog(actionParams,contentHTableRowsDataForAction.length);
                        contentTableRowActions.startActionFunction(contentHTableRowsDataForAction, actionParams,
                            /*startContentTableAction*/function(){
                                self.contentHTable.updateRowsAction(contentHTableRowsDataForAction, actionParams,
                                    contentTableRowActions.tableRowActionFunction, contentTableRowActions.endActionFunction);
                            });
                    };
                }else if(contentTableRowActions.tableRowActionFunction){
                    contentTableRowsActionFunction=function(contentHTableRowsDataForAction, actionParams){
                        actionParams.progressDialog=actionParams.contentHTable.updateRowsActionDialog(actionParams,contentHTableRowsDataForAction.length);
                        self.contentHTable.updateRowsAction(contentHTableRowsDataForAction, actionParams,
                            contentTableRowActions.tableRowActionFunction, contentTableRowActions.endActionFunction);
                    }
                }
                return contentTableRowsActionFunction;
            },
            /**
             * actionParams = { btnStyle, btnParams, actionFunction, contentTableActionName, beforeContentTableAction }
             *      actionFunction = function(contentTableSelectedRowData, contentTableRowsData, actionParams)
             *          actionParams = { contentHTable, toolPanes, thisDoc, progressDialog }
             *      beforeContentTableAction = function(contentHTableSelectedRowData, contentHTableRowsData, actionParams, startContentHTableAction)
             *          actionParams = { contentHTable, toolPanes, thisDoc, progressDialog }
             *          startContentHTableAction= function(contentHTableRowsDataForAction)
             */
            addToolPaneActionButton: function(label, toolPaneBtnActionParams){
                if(!toolPaneBtnActionParams) {
                    console.error("tDocSimpleTable.addToolPaneActionButton Failed! Reason:No tool pane action button parameters!"); return this;
                }
                if(!this.rightContainer){
                    console.error("WARNING! Failed addToolPaneActionButton! Reason: no rightContainer!"); return this;
                }
                if(!this.toolPanes||this.toolPanes.length==0) this.addToolPane("");
                var actionsTableRow= $TDF.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                if(!toolPaneBtnActionParams) toolPaneBtnActionParams={};
                var actionButton= $TDF.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0,
                    btnStyle:toolPaneBtnActionParams.btnStyle, btnParameters:toolPaneBtnActionParams.btnParams});
                if(!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                var self=this;
                if(toolPaneBtnActionParams.actionFunction){
                    actionButton.onClick=function(){
                        var contentHTableSelRowData=self.getSelectedRow(),contentHTableRowsData=self.getHTableContent(),
                            actionParams={contentHTable:self.contentHTable,toolPanes:self.toolPanes,thisDoc:self};
                        toolPaneBtnActionParams.actionFunction(contentHTableSelRowData,contentHTableRowsData, actionParams);
                    };
                    return this;
                }
                var contentHTableRowsActionFunction= this.getContentTableActionByName(toolPaneBtnActionParams.contentTableActionName),
                    toolPaneBtnActionFunction;
                if(toolPaneBtnActionParams.beforeContentTableAction){
                    toolPaneBtnActionFunction= function(contentHTableSelRowData,contentHTableRowsData, actionParams){
                        actionParams.progressDialog=actionParams.contentHTable.updateRowsActionDialog(actionParams,contentHTableRowsData.length);
                        toolPaneBtnActionParams.beforeContentTableAction(contentHTableSelRowData,contentHTableRowsData,actionParams,
                            function(contentHTableRowsDataForAction){
                                if(!contentHTableRowsDataForAction){
                                    contentHTableRowsDataForAction=[];
                                    if(contentHTableSelRowData) contentHTableRowsDataForAction.push(contentHTableSelRowData);
                                }
                                if(contentHTableRowsActionFunction)
                                    contentHTableRowsActionFunction(contentHTableRowsDataForAction, actionParams);
                            });
                    }
                }else if(contentHTableRowsActionFunction)
                    toolPaneBtnActionFunction= function(contentHTableSelRowData,contentHTableRowsData, actionParams){
                        var contentHTableRowDataForAction=[];
                        if(contentHTableSelRowData) contentHTableRowDataForAction.push(contentHTableSelRowData);
                        contentHTableRowsActionFunction(contentHTableRowDataForAction,actionParams);
                    };
                if(!toolPaneBtnActionFunction) {
                    console.error("tDocSimpleTable.addToolPaneActionButton Failed! Reason: tool pane button parameters no correct for set button action function!");
                    return this;
                }
                actionButton.onClick= function(){
                    var contentHTableSelRowData=self.getHTableContentSelectedRow(),contentHTableRowsData=self.getHTableContent(),
                        actionParams={contentHTable:self.contentHTable,toolPanes:self.toolPanes,thisDoc:self};
                    toolPaneBtnActionFunction(contentHTableSelRowData,contentHTableRowsData, actionParams);
                };
                return this;
            },

            /**
             * popupMenuActionParams = { actionFunction, contentTableActionName, beforeContentTableAction }
             *      actionFunction = function(contentHTableSelectedRowsData, actionParams)
             *      beforeContentTableAction = function(selectedTableContent, actionParams, startContentTableAction)
             *          actionParams = { contentHTable, toolPanes, thisDoc, progressDialog }
             *          startContentTableAction= function(contentTableRowsDataForAction)
             */
            addContentTablePopupMenuAction: function(itemName, popupMenuActionParams){
                if(!popupMenuActionParams) {
                    console.error("tDocSimpleTable.addContentTablePopupMenuAction Failed! Reason:No popup menu parameters!"); return this;
                }
                var menuItemActionFunction=popupMenuActionParams.actionFunction;
                if(!menuItemActionFunction){
                    var contentHTableRowsActionFunction= this.getContentTableActionByName(popupMenuActionParams.contentTableActionName);
                    if(popupMenuActionParams.beforeContentTableAction){
                        menuItemActionFunction= function(contentHTableSelectedRowsData, actionParams){
                            actionParams.progressDialog=actionParams.contentHTable.updateRowsActionDialog(actionParams,contentHTableSelectedRowsData.length);
                            popupMenuActionParams.beforeContentTableAction(contentHTableSelectedRowsData, actionParams,
                                function(contentHTableRowsDataForAction){
                                    if(!contentHTableRowsDataForAction) contentHTableRowsDataForAction=contentHTableSelectedRowsData;
                                    if(contentHTableRowsActionFunction)
                                        contentHTableRowsActionFunction(contentHTableRowsDataForAction, actionParams)
                                })
                        }
                    }else if(contentHTableRowsActionFunction){
                        menuItemActionFunction= contentHTableRowsActionFunction;
                    }
                }
                if(!menuItemActionFunction) {
                    console.error("tDocSimpleTable.addContentTablePopupMenuAction Failed! Reason: popup menu parameters no correct for set menu action function!");
                    return this;
                }
                var thisContentHTable= this.contentHTable,
                    menuItemParams={contentHTable:thisContentHTable,toolPanes:this.toolPanes,thisDoc:this};
                thisContentHTable.addMenuItem(itemName, menuItemParams,
                    /*menuItemAction*/function(contentHTableSelectedRowsData, menuItemParams){
                        var contentHTableRowsDataForAction=[];
                        for(var selInd in contentHTableSelectedRowsData) contentHTableRowsDataForAction.push(contentHTableSelectedRowsData[selInd]);
                        var menuActionParams=
                            {contentHTable:menuItemParams.contentHTable,toolPanes:menuItemParams.toolPanes,thisDoc:menuItemParams.thisDoc};
                        menuItemActionFunction(contentHTableRowsDataForAction, menuActionParams);
                    });
                return this;
            },

            startupDoc: function(){
                if(this.buttonUpdate!=false&&!this.btnUpdate) this.addBtnUpdate();
                if(this.buttonPrint!=false&&!this.btnPrint) this.addBtnPrint();
                if(this.buttonExportToExcel!=false&&!this.btnExportToExcel) this.addBtnExportToExcel();
                this.layout();
                if(!this.headerData||!Object.keys(this.headerData).length){
                    this.loadTableContent();
                    this.startedUp=true;
                    return;
                }

                var headerDataItems= Object.values(this.headerData);
                var initHeaderData= function(headerDataItems,i, fcallback){
                    var headerDataItem= headerDataItems[i];
                    if(!headerDataItem){ fcallback(); return; }
                    var headerInstanceType= headerDataItem.type, headerInstance= headerDataItem.instance;
                    if(headerInstanceType=="SelectBox"&&headerInstance.loadDropDownValuesFromServer){
                        headerInstance.loadDropDownValuesFromServer(false,function(){
                            initHeaderData(headerDataItems,i+1,fcallback);
                        });
                        return;
                    }
                    initHeaderData(headerDataItems,i+1,fcallback);
                };
                var self=this;
                initHeaderData(headerDataItems,0,function(){
                    self.loadTableContent();
                    self.startedUp=true;
                });
            },

            /**
             */
            doPrint: function(printFormats){
                var printData = {};
                if(this.titleText){
                    $TDF.addPrintDataSubItemTo(printData, "header",{label:this.titleText, width:0, align:"center",
                        style:"width:100%;font-size:14px;font-weight:bold;text-align:center;",contentStyle:"margin-top:5px;margin-bottom:3px;"});
                }
                var headerTextStyle="font-size:14px;", headerContentStyle="margin-bottom:3px;";
                if(this.headerData){                                                                        //console.log("TDocSimpleTable doPrint headerData=",this.headerData);
                    $TDF.addPrintDataItemTo(printData, "header", {newTable:true, style:headerTextStyle});
                    $TDF.addPrintDataSubItemTo(printData, "header");
                    for(var hdID in this.headerData){
                        var headerDataItem= this.headerData[hdID], print=true, value="";                    //console.log('TDocSimpleTable doPrint headerItemData=',headerItemData);
                        if(headerDataItem.type=="DateBox") value=headerDataItem.instance.textbox.value;
                        else if(headerDataItem.type=="SelectBox") value=headerDataItem.instance.textDirNode.textContent;
                        else if(headerDataItem.type=="CheckButton"){
                            if(headerDataItem.instance.checked==true) value=undefined; else print=false;
                        }
                        if(!print)continue;
                        var printParams={};
                        if(headerDataItem.instance&&headerDataItem.instance.printParams)printParams = headerDataItem.instance.printParams;
                        $TDF.addPrintDataSubItemTo(printData, "header",{
                            width:Math.round(printParams.cellWidth*1.1)+5, align:"left",style:headerTextStyle+(printParams.printStyle||""), contentStyle:headerContentStyle,
                            label:printParams.labelText,labelStyle:printParams.labelStyle,
                            valueStyle:printParams.inputStyle, value:value});
                    }
                }
                $TDF.addPrintDataSubItemTo(printData, "header");
                printData.columns = this.contentHTable.getVisibleColumns();                                 //console.log("TDocSimpleTable doPrint printData.columns=",this.contentHTable.getVisibleColumns());
                printData.data = this.contentHTable.getContent();                                           //console.log("TDocSimpleTable doPrint totals=",this.totals);
                var totalStyle="font-size:12px;";
                if(this.totals){                                                                            //console.log("TDocSimpleTable doPrint totals=",this.totals);
                    for(var tRowIndex in this.totalTableData){
                        var tRowData= this.totalTableData[tRowIndex];
                        $TDF.addPrintDataItemTo(printData, "total", {style:totalStyle});
                        for(var tCellIndex in tRowData){
                            var tCellData= tRowData[tCellIndex];
                            if(tCellData===null){
                                $TDF.addPrintDataSubItemTo(printData, "total");
                                continue
                            }
                            var printParams=tCellData.printParams;
                            $TDF.addPrintDataSubItemTo(printData, "total", {
                                width:printParams.cellWidth+5, align:"right",style:printParams.printStyle, contentStyle:"margin-top:3px;",
                                label:printParams.labelText,labelStyle:printParams.labelStyle,
                                type:"text", valueStyle:printParams.inputStyle, value:tCellData.textbox.value});
                        }
                    }
                }
                $TDF.setPrintDataFormats(printData, printFormats);
                var printWindow= window.open("/print/printDocSimpleTable");                                 //console.log("TDocSimpleTable doPrint printWindow printData=",printData);
                printWindow["printDocSimpleTableData"]= printData;
            },
            exportTableContentToExcel:function(){
                $TDF.requestForExcelFile({tableData:this.contentHTable.getContent(),visibleColumns:this.contentHTable.getVisibleColumns()});
            }
        });
    });
