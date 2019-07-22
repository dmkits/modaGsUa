/**
 * Created by dmkits on 12.07.17.
 */
define(["dojo/_base/declare", "app/tDocsFunctions", "app/base", "app/tDocSimpleTable", "app/hTableEditable"],
    function(declare, TDocsFunctions, Base, TDocSimpleTable, HTableEditable) {
        var $TDF=TDocsFunctions;
        return declare("TDocSimpleTableEdt", [TDocSimpleTable], {
            /**
             * added args: { dataNewURL, dataStoreURL, dataDeleteURL },
             */
            constructor: function(args,parentName){
                this.dataNewURL= null;
                this.dataStoreURL= null;
                this.dataDeleteURL= null;
                declare.safeMixin(this,args);
                if(args.rightPane&& typeof(args.rightPane)=="object") this.rightContainerParams=args.rightPane;
            },
            postCreate: function(){
                this.createTopContent();
                this.createContentTable(HTableEditable, {readOnly:false,allowFillHandle:true});
                this.createRightContent();
                this.startup();
            },
            /**
             * params { title:"<pane title>"
             *          buttons:{ insertTableRow:"<button title>", allowEditTableSelectedRow:"<button title>",
             *                    storeTableSelectedRow:"<button title>", deleteTableSelectedRow:"<button title>" }
             * }
             */
            addToolPaneWHTableActionBtns: function(params){
                if(!params) params= {};
                this.addToolPane({title:params.title});
                var rightPaneWidth= this.rightContainerParams.width;
                for(var btnActionName in params.buttons){
                    var btn= params.buttons[btnActionName];
                    this.addToolPaneTableActionButton(btn, {btnStyle:"width:"+(rightPaneWidth-35)+"px;", actionName:btnActionName})
                }
                return this;
            },
            /**
             * callback(changedRowData, contentTableInstance, params, nextCallback)
             */
            addContentTableOnChangeRowAction: function(callback){
                this.contentHTable.addOnChangeRowAction(callback);
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
                if(!this.rightContainer){
                    console.error("WARNING! Failed addToolPaneTableActionButton! Reason: no rightContainer!");
                    return this;
                }
                if(!this.toolPanes||this.toolPanes.length==0) this.addToolPane();
                var actionsTableRow= $TDF.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                if(!actionParams) actionParams={};
                var actionButton= $TDF.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0,
                    btnStyle:actionParams.btnStyle, btnParameters:actionParams.btnParams});
                if(!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                this.toolPanesActionButtons[actionParams.action]= actionButton;
                if(actionParams.actionFunction){
                    actionButton.onClick=actionParams.actionFunction;
                    actionButton.contentHTable= this.contentHTable;
                }else{
                    actionButton.onClick= this.getOnClickButtonTableAction(actionParams);
                //    actionButton.setState= this.getSetStateAction(actionParams.action);
                }
                return this;
            },
            getOnClickButtonTableAction: function(actionParams){
                var actionFunction, thisInstance=this;
                if(actionParams&&actionParams.actionName=="insertTableRow"){
                    actionFunction= function(){
                        thisInstance.contentHTable.insertRowAfterSelected();
                        if(thisInstance.dataNewURL)
                            thisInstance.contentHTable.getRowDataFromURL({url:thisInstance.dataNewURL, condition:null,
                                rowData:thisInstance.contentHTable.getSelectedRow(), consoleLog:true, callUpdateContent:false});
                    };
                }else if(actionParams&&actionParams.actionName=="allowEditTableSelectedRow"){
                    actionFunction= function(){ thisInstance.contentHTable.allowEditSelectedRow(); };
                }else if(actionParams&&actionParams.actionName=="storeTableSelectedRow"){
                    actionFunction= function(){
                        thisInstance.contentHTable.storeSelectedRowDataByURL({url:thisInstance.dataStoreURL, condition:null});
                    };
                }else if(actionParams&&actionParams.actionName=="deleteTableSelectedRow"){
                    actionFunction= function(){
                        thisInstance.contentHTable.deleteSelectedRowDataByURL({url:thisInstance.dataDeleteURL, condition:null});
                    };
                }
                return actionFunction;
            },
            /**
             * actionParams = {
             *      actionName: "insertTableRowsAfterSelected" / "allowEditTableSelectedRows" / "storeTableSelectedRows"
             * }
             */
            addContentTablePopupMenuTableRowsAction: function(itemName,actionParams){
                var menuItemCallback, thisInstance=this;
                if(actionParams.actionName==="insertTableRowsAfterSelected"){
                    menuItemCallback= function(selRowsData){
                        var count=0;
                        if(selRowsData.length>0){
                            for(var rowIndex in selRowsData) count++;
                            thisInstance.contentHTable.insertRowsAfterSelected(count);
                        }else
                            thisInstance.contentHTable.insertRowAfterSelected();
                    }
                }else if(actionParams.actionName==="allowEditTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.contentHTable.allowEditRows(selRowsData);
                    }
                }else if(actionParams.actionName==="storeTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.contentHTable.storeRowsDataByURL({url:thisInstance.dataStoreURL, rowsData:selRowsData, condition:null});
                    }
                }
                if(menuItemCallback) this.contentHTable.setMenuItem(itemName, {}, menuItemCallback);
                return this;
            }
        });
    });