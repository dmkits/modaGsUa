/**
 * Created by dmkits on 12.07.17.
 */
define(["dojo/_base/declare", "dojo.app/app", "dojo.app/tDocumentSimpleTable", "dojo.app/hTableEditable"],
    function(declare, APP, TDocumentSimpleTable, HTableEditable) {
        return declare("TemplateDocumentSimpleTableEditable", [TDocumentSimpleTable], {
            /**
             * added args: { dataNewURL, dataStoreURL, dataDeleteURL },
             * rightToolPane:{title:"<title>", width:<width>
             *               buttons:{ insertTableRow:"<title>", allowEditTableSelectedRow:"<title>",
             *                         storeTableSelectedRow:"<title>",deleteTableSelectedRow:"<title>"} }
             * default:
             * rightToolPane.width=150
             */
            constructor: function(args,parentName){
                this.dataNewURL= null;
                this.dataStoreURL= null;
                this.dataDeleteURL= null;
                declare.safeMixin(this,args);
                if(args.rightToolPane&& typeof(args.rightToolPane)=="object"){
                    this.rightToolPaneParams= args.rightToolPane;
                    if(!this.rightContainerParams) this.rightContainerParams= {};
                    if(!this.rightContainerParams.style) this.rightContainerParams.style="margin:0;padding:0;";
                    if(!this.rightContainerParams.width&&this.rightToolPaneParams.width)
                        this.rightContainerParams.width=this.rightToolPaneParams.width;
                    else if(!this.rightContainerParams.width&&!this.rightToolPaneParams.width)
                        this.rightContainerParams.width=150;
                }
            },
            postCreate: function(){
                this.createTopContent();
                this.createContentTable(HTableEditable, {readOnly:false,allowFillHandle:true});
                this.createRightContent();
                if(this.rightToolPaneParams){
                    if(this.rightToolPaneParams.title){
                        this.addToolPane({title:"Действия"});
                    }
                    var rightPaneWidth=this.rightContainerParams.width;
                    for (var btnActionName in this.rightToolPaneParams.buttons) {
                        var btn= this.rightToolPaneParams.buttons[btnActionName];
                        this.addToolPaneTableActionButton(btn, {btnStyle:"width:"+(rightPaneWidth-35)+"px;", actionName:btnActionName})
                    }
                }
            },

            /*
             * callback(changedRowData, contentTableInstance, params, nextCallback)
             */
            addContentTableRowChangeCallback: function(callback){
                this.contentTable.addRowChangeCallback(callback);
                return this;
            },

            /**
             * actionParams: {
             *      btnStyle, btnParams,
             *      actionFunction = function()
             *      actionName:"insertTableRow"/"allowEditTableSelectedRow"/"storeTableSelectedRow"/"deleteTableSelectedRow"
             * }
             */
            addToolPaneTableActionButton: function(label, actionParams){
                if(!this.rightContainer) {
                    console.log("WARNING! Failed addToolPaneTableActionButton! Reason: no rightContainer!");
                    return this;
                }
                if (!this.toolPanes||this.toolPanes.length==0) this.addToolPane();
                var actionsTableRow= this.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                if(!actionParams) actionParams={};
                var actionButton= this.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0,
                    btnStyle:actionParams.btnStyle, btnParameters:actionParams.btnParams});
                if (!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                this.toolPanesActionButtons[actionParams.action]= actionButton;
                if(actionParams.actionFunction) {
                    actionButton.onClick=actionParams.actionFunction;
                    actionButton.contentTable= this.contentTable;
                } else {
                    actionButton.onClick= this.getOnClickButtonTableAction(actionParams);
                //    actionButton.setState= this.getSetStateAction(actionParams.action);
                }
                return this;
            },
            getOnClickButtonTableAction: function(actionParams){
                var actionFunction, thisInstance=this;
                if (actionParams&&actionParams.actionName=="insertTableRow"){
                    actionFunction= function(){
                        thisInstance.contentTable.insertRowAfterSelected();
                        if (thisInstance.dataNewURL)
                            thisInstance.contentTable.getRowDataFromURL({url:thisInstance.dataNewURL, condition:null,
                                rowData:thisInstance.contentTable.getSelectedRow(), consoleLog:true, callUpdateContent:false});
                    };
                } else if (actionParams&&actionParams.actionName=="allowEditTableSelectedRow"){
                    actionFunction= function(){
                        thisInstance.contentTable.allowEditSelectedRow();
                    };
                } else if (actionParams&&actionParams.actionName=="storeTableSelectedRow"){
                    actionFunction= function(){
                        thisInstance.contentTable.storeSelectedRowDataByURL({url:thisInstance.dataStoreURL, condition:null});
                    };
                } else if (actionParams&&actionParams.actionName=="deleteTableSelectedRow"){
                    actionFunction= function(){
                        thisInstance.contentTable.deleteSelectedRowDataByURL({url:thisInstance.dataDeleteURL, condition:null});
                    };
                }
                return actionFunction;
            },
            /**
             * actionParams = {
             *      actionName: "insertTableRowsAfterSelected" / "allowEditTableSelectedRows" / "storeTableSelectedRows"
             * }
             */
            addContentTablePopupMenuTableRowsAction: function(itemName, actionParams){
                var menuItemCallback, thisInstance=this;
                if (actionParams.actionName==="insertTableRowsAfterSelected"){
                    menuItemCallback= function(selRowsData){
                        var count=0;
                        if(selRowsData.length>0) {
                            for (var rowIndex in selRowsData) count++;
                            thisInstance.contentTable.insertRowsAfterSelected(count);
                        } else
                            thisInstance.contentTable.insertRowAfterSelected();
                    }
                } else if (actionParams.actionName==="allowEditTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.contentTable.allowEditRows(selRowsData);
                    }
                } else if (actionParams.actionName==="storeTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.contentTable.storeRowsDataByURL({url:thisInstance.dataStoreURL, rowsData:selRowsData, condition:null});
                    }
                }
                if (menuItemCallback)
                    this.contentTable.setMenuItem(itemName, {}, menuItemCallback);
                return this;
            }
        });
    });