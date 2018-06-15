/**
 * Created by dmkits on 16.02.17.
 */
define(["dojo/_base/declare", "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
        "dijit/form/DateTextBox", "dijit/form/TextBox", "dijit/form/NumberTextBox", "dijit/form/Select", "dojox/layout/ContentPane",
        "app/app", "app/tDocBase", "app/contentController", "app/hTableEditable", "app/dialogs","dojox/form/Uploader"],
    function(declare, BorderContainer, ContentPane, DateTextBox, TextBox, NumberTextBox, Select, XContentPane,
             APP, DocumentBase, ContentController, HTable, Dialogs, Uploader) {
        return declare("TDocStdTable", [BorderContainer, DocumentBase], {
            /**
             * args: {titleText, dataURL, condition:{...}, buttonUpdate, buttonPrint, printFormats={ ... } }
             * default:
             * buttonUpdate=true, buttonPrint=true,
             * printFormats={ numericFormat:"0,000,000.[00]", dateFormat:"DD.MM.YY", currencyFormat:"0,000,000.[00]" }
             */
            constructor: function (args, parentName) {
                this.srcNodeRef = document.getElementById(parentName);
                this.idListContainer=null;
                this.idDetailContainer=null;
                this.idDetailHeader=null;
                this.idDetailTable=null;
                this.idDetailTotal=null;
                this.idRightContainer=null;
                declare.safeMixin(this, args);
                this.listTable = null;
                this.listBDate = null;
                this.listEDate = null;
                this.detailContainer= null;
                this.rightContainer= null;
                //if (this.buttonUpdate === undefined) this.buttonUpdate = true;
                //if (this.buttonPrint === undefined) this.buttonPrint = true;
                //if (this.detailContentErrorMsg === undefined) this.detailContentErrorMsg = "Failed get data!";
            },

            postCreate: function () {
                if(this.idListContainer){
                    this.listContainer= this.setContainer({region:'left',splitter:true}, this.idListContainer);
                    this.listPeriodContent= this.setChildContentPaneTo(this.listContainer, {region:'top',style:"width:100%;height:auto;padding:0;margin:0;"});
                }
                if(this.idDetailContainer){
                    this.detailContainer= this.setContainer({region:'center'}, this.idDetailContainer);
                }
                if(this.idDetailContainer&&this.idDetailHeader){
                    this.detailHeader= new ContentController({region:'top', dataIDName:null, style:"margin:0;padding:0;"},this.idDetailHeader);
                    this.detailContainer.addChild(this.detailHeader);
                }
                if(this.idDetailContainer&&this.idDetailTable){
                    this.detailTable=
                        new HTable({region:'center',style:"margin:5px;padding:0;", wordWrap:true, readOnly:false, useFilters:true, allowFillHandle:true}, this.idDetailTable);
                    this.setBorderedStyleFor(this.detailTable.domNode);
                    this.detailContainer.addChild(this.detailTable);
                }
                if(this.idDetailContainer&&this.idDetailTotal){
                    this.detailTotal= this.setContentPane({region:'bottom'}, this.idDetailTotal);
                }
                if(this.idRightContainer){
                    this.rightContainer= this.setContentPane({region:'right'}, this.idRightContainer);
                    return this;
                }
            },

            /**
             * params: { getDataUrl:"/...", getDataCondition: {param:paramValue, ...},
             *              header, bdateCondition,bdatelabelText, edateCondition,edatelabelText} }
             */
            addListTable: function(params){  //setListTable
                this.listTable =
                    new HTable({region:'center',style:"margin:5px;padding:0;", wordWrap:true, readOnly:true, useFilters:true, allowFillHandle:false});
                this.setBorderedStyleFor(this.listTable.domNode);

                this.listTable.getDataUrl= (params)?params.getDataUrl:null; this.listTable.getDataCondition= (params)?params.getDataCondition:null;
                this.listContainer.addChild(this.listTable);
                var thisInstance= this;
                this.listTable.onUpdateContent= function() {                                            console.log("TDocStdTable.listTable.onUpdateContent ",this.getSelectedRow()," rowDataIDForSelect",this.rowDataIDForSelect);
                    if(this.rowDataIDForSelect!==undefined){
                        this.setSelectionByItemValue(this.getRowIDName(), this.rowDataIDForSelect);
                        return;
                    }
                    var selectedRowData = this.getSelectedRow();
                    if (!selectedRowData && this.getContent().length > 0) {
                        this.setSelectedRow(0);
                        return;
                    }
                    thisInstance.setDetailHeaderContentByListSelectedRow(selectedRowData);
                };
                this.listTable.onSelect = function (firstSelectedRowData, selection) {                  console.log("TDocStdTable.listTable.onSelect ",firstSelectedRowData);
                    if ( (thisInstance.detailHeader&&thisInstance.detailHeader.isContentChanged())
                            || (thisInstance.detailTable&&thisInstance.detailTable.isExistsEditableRows()) ){
                        var listTableSelRowDataID= firstSelectedRowData[thisInstance.detailHeader.dataIDName];
                        if(listTableSelRowDataID===thisInstance.detailHeader.getContentDataIDValue()) return;
                        Dialogs.doDialogMsg({title:"Действия с изменениями в документе",
                                content:"<b>Вы пытаетесь перейти в другой документ не сохранив изменения<br> в текущем документе.<br></b>"
                                    +"<br>Нажмите <b>Вернуться</b>, чтобы вернуться в текущий документ<br> и продолжить работу с ним, <br>"
                                    +"<br>или нажмите <b>Не сохранять</b> чтобы не сохранять изменения<br>"
                                    +" в текущем документе и перейти к выбранному в списке документу.",
                                btnOkLabel:"Вернуться", btnCancelLabel:"Не сохранять"
                            },function(dlgWin){
                                dlgWin.hide();
                            },function(dlgWin){
                                dlgWin.hide();
                                thisInstance.listTable.setSelection(firstSelectedRowData, selection);
                                thisInstance.setDetailHeaderContentByListSelectedRow(firstSelectedRowData);
                            }
                        );
                        return;
                    }
                    this.setSelection(firstSelectedRowData, selection);
                    thisInstance.setDetailHeaderContentByListSelectedRow(firstSelectedRowData);
                };
                this.setListDatesContent(params);
                return this;
            },
            /**
             * params: { callUpdateContent:true/false, selectedRowDataID }
             * default callUpdateContent=true
             */
            loadListTableContentFromServer: function(params){
                var condition = this.listTable.getDataCondition;
                if (!condition) condition={};
                if (this.listBDate) condition[this.listBDate.conditionName.replace("=","~")] =
                    this.listBDate.format(this.listBDate.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                if (this.listEDate) condition[this.listEDate.conditionName.replace("=","~")] =
                    this.listEDate.format(this.listEDate.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                if(!params) params={};
                var callUpdateContent=params.callUpdateContent;
                if(params.selectedRowDataID!==undefined) {
                    callUpdateContent=true;
                    this.listTable.rowDataIDForSelect=params.selectedRowDataID;
                }
                this.listTable.setContentFromUrl({url:this.listTable.getDataUrl,condition:condition,callUpdateContent:callUpdateContent});
            },
            /**
             * params: {header, bdateCondition,bdatelabelText, edateCondition,edatelabelText}
             */
            setListDatesContent: function(params){
                if (params.header) {
                    var listHeaderTable = this.addTableTo(this.listPeriodContent.containerNode);
                    var listHeaderRow = this.addRowToTable(listHeaderTable, 25);
                    this.addHeaderCellToTableRow(listHeaderRow, 0, "width:100%;", params.header);
                }
                if (!params.bdateCondition&&!params.edateCondition) return this;
                var listPeriodTable = this.addTableTo(this.listPeriodContent.containerNode);
                this.listPeriodTableRow = this.addRowToTable(listPeriodTable);
                var instance = this;
                if (params.bdateCondition) {
                    this.listBDate = this.addTableCellDateBoxTo(this.listPeriodTableRow,
                        {labelText:params.bdatelabelText, labelStyle:"margin-left:5px;", cellWidth:150, cellStyle:"text-align:right;",
                            dateBoxParams:{conditionName:params.bdateCondition}, initValueDate:APP.curMonthBDate()});
                    this.listBDate.onChange = function(){
                        instance.loadListTableContentFromServer();
                    }
                }
                if (params.edateCondition) {
                    this.listEDate = this.addTableCellDateBoxTo(this.listPeriodTableRow,
                        {labelText:params.edatelabelText, labelStyle:"margin-left:5px;", cellWidth:150, cellStyle:"text-align:right;",
                            dateBoxParams:{conditionName:params.edateCondition}, initValueDate:APP.curMonthEDate()});
                    this.listEDate.onChange = function(){
                        instance.loadListTableContentFromServer();
                    }
                }
                return this;
            },

            /**
             * parameters= { dataIDName, getDataUrl, dataStateName,activeStateValue }
             */
            setDetailHeaderParameters: function(parameters){
                if (parameters.dataIDName) this.detailHeader.setDataIDName(parameters.dataIDName);
                if (parameters.getDataUrl) this.detailHeader.getDataUrl=parameters.getDataUrl;
                if (parameters.getDataForNewUrl) this.detailHeader.getDataForNewUrl=parameters.getDataForNewUrl;
                if (parameters.postDataUrl) this.detailHeader.postDataUrl=parameters.postDataUrl;
                if (parameters.postForDeleteDataUrl) this.detailHeader.postForDeleteDataUrl=parameters.postForDeleteDataUrl;
                if (parameters.dataStateName) this.detailHeader.dataStateName=parameters.dataStateName;
                if (parameters.activeStateValue!==undefined) this.detailHeader.activeStateValue=parameters.activeStateValue;
                var thisInstance=this;
                this.detailHeader.onContentUpdated= function(contentData, params, idIsChanged){             console.log("TDocStdTable.detailHeader.onContentUpdated ",contentData," ",params,idIsChanged);
                    if (this.setTitleContent) this.setTitleContent();
                    if(idIsChanged&&(!params||(params.onlyValues!==true&&!params.error))) this.lastContentData=contentData;
                    if(idIsChanged){
                        if (!contentData||contentData.length==0) {
                            thisInstance.detailTable.clearContent();
                        } else
                            thisInstance.loadDetailTableContentDataFromServer();
                    } else {
                        var detailSubtotalContent=!contentData||contentData.length==0;
                        thisInstance.setDetailSubtotalContent({disabled:detailSubtotalContent, clearValue:detailSubtotalContent});
                        thisInstance.setToolPanesActions();
                    }
                    if(params&&params.onlyValues!==true
                            &&(params.updatedResultItem!==undefined||params.deletedResultItem!==undefined))
                        thisInstance.loadListTableContentFromServer({
                            selectedRowDataID:thisInstance.detailHeader.getContentDataIDValue(), callUpdateContent:false});
                    var detailHeaderContentData=thisInstance.detailHeader.getContentData();
                    if(detailHeaderContentData && detailHeaderContentData[thisInstance.detailHeader.dataStateName]!==undefined
                        && detailHeaderContentData[thisInstance.detailHeader.dataStateName]==thisInstance.detailHeader.activeStateValue){
                         thisInstance.detailTable.setReadOnly(false);
                    }else thisInstance.detailTable.setReadOnly();                                           console.log("TDocStdTable.detailHeader.onContentUpdated END",contentData, params, idIsChanged,this.lastContentData);
                };
                this.detailHeader.onContentChanged= function(isContentChanged){                             //console.log("TDocStdTable.detailHeader.onContentChanged ",isContentChanged,this.getContentData());
                    //thisInstance.detailTableSetDisabled(isContentChanged);
                    thisInstance.setToolPanesActions();
                };
                return this;
            },
            /**
             * param { reloadData, clearBeforeLoad }
             */
            setDetailHeaderContentByListSelectedRow: function(listSelectedFirstRowData, params){            console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow ",listSelectedFirstRowData, params);
                if (!this.detailHeader) {
                    this.setToolPanesActions();
                    return;
                }
                if (!this.detailHeader.getDataUrl||!listSelectedFirstRowData){
                    this.detailHeader.setContentData(null);
                    return;
                }
                var newID= listSelectedFirstRowData[this.detailHeader.dataIDName];                          //console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow newID=",newID);
                if (newID===null||newID===undefined) {
                    this.detailHeader.setContentData(null);
                    return;
                }
                var reloadData=(params&&params.reloadData==true)?true:false;
                if(this.detailHeader.getContentDataIDValue()===newID&&reloadData!==true) return;
                var clearBeforeLoad=(params&&params.clearBeforeLoad==true)?true:false;
                if(clearBeforeLoad===true) this.detailHeader.clearData();
                var detailHeaderGetDataCondition={};
                detailHeaderGetDataCondition[(this.detailHeader.dataIDName+"=").replace("=","~")]=newID;                //console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow this.detailHeader.loadDataFromUrl");
                if(this.detailHeader.getContentDataIDValue()!==newID&&this.detailTable.getContent().length>0)
                    this.detailTable.clearContent({callUpdateContent:false,resetSelection:false});
                this.detailHeader.loadDataFromUrl({url:this.detailHeader.getDataUrl, condition:detailHeaderGetDataCondition});
            },
            loadDetailHeaderContentValuesFromServer: function(){
                if (!this.detailHeader.getDataForNewUrl) return;
                this.detailHeader.lastContentData=this.detailHeader.getContentData();
                this.detailHeader.loadDataFromUrl({url:this.detailHeader.getDataForNewUrl, condition:null, onlyValues:true});
            },
            storeDetailHeaderContentValues: function(){
                if (!this.detailHeader.postDataUrl) return;
                this.detailHeader.storeDataByUrl({url:this.detailHeader.postDataUrl, condition:null});
            },
            deleteDetailHeaderContent: function(){
                if (!this.detailHeader.postForDeleteDataUrl) return;
                this.detailHeader.deleteDataByUrl({url:this.detailHeader.postForDeleteDataUrl, onlyIDValue:true});
            },
            addDetailHeaderElement: function(newRow,obj){
                if(!this.detailHeaderElements) this.detailHeaderElements=[];
                if(this.detailHeaderElements.length==0||newRow) this.detailHeaderElements.push([]);
                if(obj) this.detailHeaderElements[this.detailHeaderElements.length-1].push(obj);
            },
            addDetailHeaderRow: function(height, createNewTable){
                if (!height) height=25;
                if (!this.detailHeaderTable || (this.detailHeaderTable&&createNewTable) )
                    this.detailHeaderTable= this.addTableTo(this.detailHeader.containerNode, "margin:0;border-collapse:separate;border-spacing:10px 0;");
                this.addRowToTable(this.detailHeaderTable, height);
                this.addDetailHeaderElement(true);
                return this;
            },
            /**
             * params: {title, titleForNew, titleForNothing, titleForFailedLoad, numberDataItemName, dateDataItemName, titleDatePrefix}
             */
            addDetailHeaderTitle: function(detailHeaderTitleParams,height){
                if (!detailHeaderTitleParams.titleDatePrefix) detailHeaderTitleParams.titleDatePrefix=" ";
                this.detailHeaderTable= this.addTableTo(this.detailHeader.containerNode, "padding:0;margin:0px;");
                this.addRowToTable(this.detailHeaderTable, height);
                this.detailHeader.titleCell= this.addHeaderCellToTableRow(this.detailHeaderTable.lastChild);
                this.addDetailHeaderElement(true,this.detailHeader.titleCell);
                this.detailHeader.setTitleContent= function(){
                    if (!this.titleCell) return;
                    if (this.getContentData()===undefined){
                        this.titleCell.innerHTML= "<span>"+detailHeaderTitleParams.titleForFailedLoad+"</span>";
                        return;
                    }
                    if (this.getContentData()===null){
                        this.titleCell.innerHTML= "<span>"+detailHeaderTitleParams.titleForNothing+"</span>";
                        return;
                    }
                    if (this.getContentData()&& (this.getContentDataIDValue()==undefined||this.getContentDataIDValue()==null)){
                        this.titleCell.innerHTML= "<span style='color:red;'>"+detailHeaderTitleParams.titleForNew+"</span>";
                        return;
                    }
                    this.titleCell.innerHTML= detailHeaderTitleParams.title;
                    if (detailHeaderTitleParams.numberDataItemName)
                        this.titleCell.innerHTML= this.titleCell.innerHTML
                            +" № "+this.getContentDataItem(detailHeaderTitleParams.numberDataItemName);
                    if (detailHeaderTitleParams.dateDataItemName)
                        this.titleCell.innerHTML= this.titleCell.innerHTML
                            +" "+detailHeaderTitleParams.titleDatePrefix
                            +" "+moment(this.getContentDataItem(detailHeaderTitleParams.dateDataItemName)).format("DD.MM.YYYY");
                };
                this.addDetailHeaderBtnUpdate();
                this.addDetailHeaderBtnPrint();
                return this;
            },
            addDetailHeaderBtnUpdate: function(width, labelText){
                if (width===undefined) width=200;
                if (!labelText) labelText="Обновить";
                this.detailHeader.btnUpdate= this.addTableHeaderButtonTo(this.detailHeaderTable.lastChild, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var thisInstance= this;
                this.detailHeader.btnUpdate.onClick = function(){
                    thisInstance.setDetailHeaderContentByListSelectedRow(thisInstance.detailHeader.lastContentData, {reloadData:true, clearBeforeLoad:true});
                };
                return this;
            },
            addDetailHeaderBtnPrint: function(width, labelText, printFormats){
                if (width===undefined) width=100;
                if (!this.detailHeader.btnUpdate) this.addBtnUpdate(width);
                if (!labelText) labelText="Печатать";
                this.detailHeader.btnPrint= this.addTableHeaderButtonTo(this.detailHeaderTable.lastChild, {labelText:labelText, cellWidth:1, cellStyle:"text-align:right;"});
                var instance = this;
                this.detailHeader.btnPrint.onClick = function(){
                    instance.doPrint();
                };
                return this;
            },
            /**
             * params={ style, inputStyle }
             */
            addDetailHeaderTextBox: function(itemName, label, cellWidth, params){
                if (!params) params={};
                if (!params.inputStyle) params.inputStyle="";
                if (!params.style) params.style="";
                var textBox= this.addTableCellTextBoxTo(this.detailHeaderTable.lastChild,
                    {cellWidth:cellWidth, labelText:label, labelStyle:params.style, inputStyle:params.style+params.inputStyle});
                this.detailHeader.addControlElementObject(textBox, itemName);
                this.addDetailHeaderElement(false,textBox);
                return this;
            },
            /**
             * params={ style, inputStyle }
             */
            addDetailHeaderDateTextBox: function(itemName, label, cellWidth, params){
                if (!params) params={};
                if(!cellWidth)cellWidth=150;
                if (!params.inputStyle) params.inputStyle="";
                if (!params.style) params.style="";
                var dateBox= this.addTableCellDateBoxTo(this.detailHeaderTable.lastChild,
                    {cellWidth:cellWidth, labelText:label, labelStyle:params.style, inputStyle:params.style+params.inputStyle});
                this.detailHeader.addControlElementObject(dateBox, itemName);
                this.addDetailHeaderElement(false,dateBox);
                return this;
            },
            /**
             * params={ style, inputStyle, pattern }
             */
            addDetailHeaderNumberTextBox: function(itemName, label, cellWidth, params){
                if (!params) params={};
                if (!params.inputStyle) params.inputStyle="";
                if (!params.style) params.style="";
                if (!params.pattern||params.pattern.length==0) params.pattern="########0.00";
                var numberTextBox= this.addTableCellNumberTextBoxTo(this.detailHeaderTable.lastChild,
                    { labelText:label, labelStyle:params.style, inputStyle:params.style+"text-align:right;"+params.inputStyle, cellWidth:cellWidth,
                        inputParams:{constraints:{pattern:params.pattern}} });
                this.detailHeader.addControlElementObject(numberTextBox, itemName);
                this.addDetailHeaderElement(false,numberTextBox);
                return this;
            },
            /**
             * params={ style, inputStyle, labelDataItem, loadDropDownURL }
             */
            addDetailHeaderSelect: function(itemName, label, cellWidth, params){
                if (!params) params={};
                if (!params.inputStyle) params.inputStyle="";
                if (!params.style) params.style="";
                var cell= this.addLeftCellToTableRow(this.detailHeaderTable.lastChild, cellWidth);
                var input= this.createInputTo(cell, label, params.style);
                var select= APP.instanceFor(input, Select,
                    {style:params.inputStyle+params.style, labelDataItem:params.labelDataItem,loadDropDownURL:params.loadDropDownURL});
                select.printParams= {cellWidth:cellWidth, labelText:label, cellStyle:params.style, inputStyle:params.inputStyle};/*it's for print*/
                this.detailHeader.addControlElementObject(select, itemName);
                this.addDetailHeaderElement(false,select);
                return this;
            },
            /**
             * parameters: { conditionIDName, getDataUrl, getCondition, storeDataUrl, deleteDataUrl }
             */
            setDetailTableParameters: function(parameters){
                if (parameters.conditionIDName) this.detailTable.conditionIDName= parameters.conditionIDName;
                if (parameters.getDataUrl) this.detailTable.getDataUrl=parameters.getDataUrl;
                if (parameters.getCondition) this.detailTable.getDataURLCondition=parameters.getCondition;
                if (parameters.storeDataUrl) this.detailTable.storeDataUrl=parameters.storeDataUrl;
                if (parameters.deleteDataUrl) this.detailTable.deleteDataUrl=parameters.deleteDataUrl;
                var thisInstance= this;
                this.detailTable.onUpdateContent = function(params){                                                console.log("TDocStdTable.detailTable.onUpdateContent ",params);
                    if(params&&(params.updatedRows||params.deletedRows)) {
                        var reloadData=false;
                        if(params.deletedRows) reloadData=true;
                        if(!reloadData&&params.updatedRows)
                            for(var r in params.updatedRows)
                                if (!this.isRowEditable(params.updatedRows[r])) {
                                    reloadData=true; break;
                                }
                        if(reloadData){
                            thisInstance.loadListTableContentFromServer({callUpdateContent:false});
                            thisInstance.setDetailHeaderContentByListSelectedRow(thisInstance.detailHeader.lastContentData, {reloadData:reloadData});
                        }
                    }
                    var selectedRowData = this.getSelectedRow();
                    if ( !selectedRowData && this.getContent().length>0) {
                        thisInstance.setDetailSubtotalContent();
                        this.setSelectedRow(0);
                        return;
                    }
                    var disableDetailSubtotalContent=false, headerIDValue= thisInstance.detailHeader.getContentDataIDValue();
                    if (headerIDValue===undefined||headerIDValue===null) disableDetailSubtotalContent=true;
                    thisInstance.setDetailSubtotalContent({disabled:disableDetailSubtotalContent,clearValue:disableDetailSubtotalContent});
                    thisInstance.setToolPanesActions();
                };
                this.detailTable.onSelect = function(firstSelectedRowData, selection){                  console.log("TDocStdTable.detailTable.onSelect ",firstSelectedRowData/*,selection*/);
                    this.setSelection(firstSelectedRowData, selection);                                 //console.log("TDocStdTable.detailTable.onSelect ",this.getSelectedRowIndex());
                    thisInstance.setToolPanesActions();
                };
                this.detailTable.onChangeRowData= function(changedRowData,changedRowIndex){                     console.log("TDocStdTable.detailTable.onChangeRowData ",changedRowData);
                    thisInstance.setDetailSubtotalContent();
                };
                this.addDetailTableRowChangeCallback(function(changedRowData, detailTable, thisInstance, nextCallback){                       //console.log("TDocStdTable detailTableRowChangeCallback 1",changedRowData);
                    changedRowData.item(thisInstance.detailTable.conditionIDName).setValue(thisInstance.detailHeader.getContentDataIDValue());
                    nextCallback();
                });
                return this;
            },
            loadDetailTableContentDataFromServer: function(){
                if (!this.detailTable.getDataUrl) {
                    this.setDetailSubtotalContent({disabled:true, clearValue:true});
                    this.setToolPanesActions();
                    return;
                }
                //this.setDetailSubtotalContent({clearValue:true});//clearing before setDetailSubtotalContent on this.detailTable.onUpdateContent
                var condition = this.detailTable.getDataURLCondition, conditionIDValue= this.detailHeader.getContentDataIDValue();
                if (!condition) condition={};
                if (conditionIDValue!==null&&conditionIDValue!==undefined&&this.detailTable.conditionIDName)
                    condition[(this.detailTable.conditionIDName+"=").replace("=","~")]=conditionIDValue;
                this.detailTable.setContentFromUrl({url:this.detailTable.getDataUrl, condition:condition});
            },
            storeDetailTableSelectedRowValuesToServer: function(){
                this.detailTable.storeSelectedRowDataByURL({url:this.detailTable.storeDataUrl, condition:null});
            },
            storeDetailTableRowsDataToServer: function(rowsData){
                if (!rowsData) return;
                this.detailTable.storeRowsDataByURL({url: this.detailTable.storeDataUrl, condition: null, rowsData: rowsData});
            },
            deleteDetailTableSelectedRowFromServer: function(){
                this.detailTable.deleteSelectedRowDataByURL({url:this.detailTable.deleteDataUrl, condition:null});
            },
            /**
             * callback(changedRowData, thisInstance.detailTable, thisInstance)
             */
            addDetailTableRowChangeCallback: function(callback){
                if (!this.detailTable.rowChangeCallbacks) {
                    this.detailTable.rowChangeCallbacks=[];
                    var thisInstance=this, thisInstanceDetailTable=this.detailTable;

                    this.detailTable.onChangeRowsData= function(changedRowsData) {                                      //console.log("TDocStdTable this.detailTable.onChangeRowData",changedRowData);
                        var rowCallback= function(i, changedRowData, callUpdateContent, nextCallback){                  //console.log("TDocStdTable this.detailTable.onChangeRowsData rowCallback",i,changedRowData/*,nextCallback*/);
                            var rowNextCallback=thisInstance.detailTable.rowChangeCallbacks[i];
                            if(rowNextCallback) {
                                rowNextCallback(changedRowData, thisInstance.detailTable, thisInstance,
                                    function(callUpdateContentNext){
                                        callUpdateContentNext= (callUpdateContentNext===undefined)? false : callUpdateContentNext;      //console.log("TDocStdTable this.detailTable.onChangeRowData callback NEXT",changedRowData,callUpdateContentNext,callUpdateContent);
                                        rowCallback(i+1, changedRowData, callUpdateContent||callUpdateContentNext, nextCallback);
                                    });
                                return;
                            }
                            //if (callUpdateContent===true) thisInstanceDetailTable.handsonTable.render();//render after end row callbacks
                            nextCallback();
                        };
                        var rowsCallback= function(i, changedRowsData, callUpdateContent) {                             //console.log("TDocStdTable this.detailTable.onChangeRowData callback",changedRowData);
                            var changedRowData=changedRowsData[i];
                            if (changedRowData) {
                                setTimeout(function(){
                                    rowCallback(0,changedRowData,callUpdateContent,
                                        /**/function(){
                                            setTimeout(function(){
                                                rowsCallback(i+1, changedRowsData, callUpdateContent);
                                            },1);
                                        });
                                },1);
                                return;
                            }
                            thisInstanceDetailTable.handsonTable.render();
                            thisInstanceDetailTable.onUpdateContent({changedRows:changedRowsData});
                        };
                        rowsCallback(0,changedRowsData,false);
                        thisInstanceDetailTable.handsonTable.render();
                    };
                }
                this.detailTable.rowChangeCallbacks.push(callback);
                return this;
            },

            //setDetailHeaderStateContentFor: function(stateElementID){
            //    this.detailHeader.stateElementID= stateElementID;
            //
            //    return this;
            //},

            addDetailTotalElement: function(newRow,obj){
                if(!this.detailTotalElements) this.detailTotalElements=[];
                if(this.detailTotalElements.length==0||newRow) this.detailTotalElements.push([]);
                if(obj) this.detailTotalElements[this.detailTotalElements.length-1].push(obj);
            },
            addDetailTotalRow: function(createNewTable){
               if (!this.detailTotalTable || createNewTable) this.detailTotalTable=this.addTableTo(this.detailTotal.domNode);
                this.addRowToTable(this.detailTotalTable);
                this.addDetailTotalElement(true);
                return this;
            },
            addDetailTotalEmpty: function(cellWidth){
                this.addLeftCellToTableRow(this.detailTotalTable.lastChild, cellWidth);
                return this;
            },
            /**
             * params { inputStyle, style, print:true/false }
             * default print!=false
             */
            addDetailTotalTextBox: function(label, cellWidth, itemName, params){
                var inputStyle="", style="";
                if (params&&params.inputStyle) inputStyle=params.inputStyle;
                if (params&&params.style) style=params.style;
                inputStyle= "font-weight:bold;"+inputStyle;
                var textBox= this.addTableCellTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;", labelText:label, labelStyle:style, inputStyle:style+inputStyle,
                        inputParams:{readOnly:true,
                        /*it's for print*/cellWidth:cellWidth, labelText:label, printStyle:params.style, inputStyle:params.inputStyle, print:params.print} });
                this.detailHeader.addControlElementObject(textBox, itemName);
                this.addDetailTotalElement(false,textBox);
                return this;
            },
            /**
             * params { style, inputStyle, pattern, print:true/false, printLabel }
             * default pattern="########0.#########"
             * default print!=false
             */
            addDetailTotalNumberTextBox: function(label, cellWidth, itemName, params){
                var inputStyle="", style="", pattern="########0.#########", printLabel=label;
                if (params&&params.inputStyle) inputStyle=params.inputStyle;
                if (params&&params.style) style=params.style;
                if (params&&params.pattern) pattern=params.pattern;
                if (params&&params.printLabel) printLabel=params.printLabel;
                var numberTextBox= this.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;", labelText:label, labelStyle:style, inputStyle:"text-align:right;"+style+inputStyle,
                        inputParams:{constraints:{pattern:pattern}, readOnly:true,
                            /*it's for print*/cellWidth:cellWidth, printLabel:printLabel, printStyle:params.style, inputStyle:"text-align:right;"+params.inputStyle,
                                print:params.print} });
                this.detailHeader.addControlElementObject(numberTextBox, itemName);
                this.addDetailTotalElement(false,numberTextBox);
                return this;
            },
            /**
             * params { style, inputStyle }
             */
            addDetailSubTotalCountNumberTextBox: function(label, cellWidth, params){
                var inputStyle="", style="";
                if (params&&params.inputStyle) inputStyle=params.inputStyle;
                if (params&&params.style) style=params.style;
                var numberTextBox= this.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;",
                        labelText:label, labelStyle:style, inputStyle:"text-align:right;"+style+inputStyle,
                        inputParams:{constraints:{pattern:"########0.#########"}, readOnly:true} });
                var thisInstance=this;
                numberTextBox.updateValue = function(params){
                    if (params&&params.disabled){
                        this.set("value", null);
                        this.set("disabled", true);
                        return;
                    }
                    if (params&&params.clearValue){
                        this.set("value", null);
                        return;
                    }
                    this.set("disabled", false);
                    this.set("value", thisInstance.detailTable.getContent().length);
                };
                if (!this.subTotals) this.subTotals=[];
                this.subTotals[this.subTotals.length]=numberTextBox;
                return this;
            },
            getDetailTableItemSum: function(tableItemName){
                return this.detailTable.getContentItemSum(tableItemName);
            },
            /**
             * params { style, inputStyle, pattern }
             * default pattern="###,###,##0.#########"
             */
            addDetailSubtotalNumberTextBox: function(label, cellWidth, itemName, params){
                var inputStyle="", style="", pattern="###,###,##0.#########";
                if (params&&params.inputStyle) inputStyle=params.inputStyle;
                if (params&&params.style) style=params.style;
                if (params&&params.pattern) pattern=params.pattern;
                var numberTextBox= this.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;",
                        labelText:label, labelStyle:style, inputStyle:"text-align:right;"+style+inputStyle,
                        inputParams:{constraints:{pattern:pattern}, readOnly:true} });
                var thisInstance=this;
                numberTextBox.updateValue = function(params){
                    if (params&&params.disabled){
                        this.set("value", null);
                        this.set("disabled", true);
                        return;
                    }
                    if (params&&params.clearValue){
                        this.set("value", null);
                        return;
                    }
                    this.set("disabled", false);
                    this.set("value", thisInstance.getDetailTableItemSum(itemName));
                };
                if (!this.subTotals) this.subTotals=[];
                this.subTotals[this.subTotals.length]=numberTextBox;
                return this;
            },
            /**
             * params { disabled:true/false, clearValue:true/false }
             */
            setDetailSubtotalContent: function(params){                                                             //console.log("TDocStdTable setDetailSubtotalContent ",params);
                if (!this.subTotals) return;
                var disabled= false, clearValue=false;
                if (params&&params.disabled) disabled=params.disabled;
                if (params&&params.clearValue) clearValue=params.clearValue;
                for(var subtotalIndex in this.subTotals) this.subTotals[subtotalIndex].updateValue({clearValue:clearValue, disabled:disabled});
            },

            /**
             * params = { title, detailTableAction }
             * params.detailTableAction = function(params)
             * params.detailTableAction calls on this.detailTable select row, or updated table content
             *  detailTableAction.params = { thisToolPane, detailTable:<this.DetailTable>, instance:<this>,
             *      detailTableSelectedRow:<this.detailTable.getSelectedRow()> }
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
                if (params.detailTableAction) actionsTitlePane.contentAction = params.detailTableAction;
                if (!this.toolPanes) this.toolPanes= [];
                this.toolPanes.push(actionsTitlePane);
                this.addTableTo(actionsTitlePane.containerNode);
                return this;
            },
            addToolXPane: function(title, contentAction){
                if (!this.toolPanes) this.toolPanes= [];
                var actionsTitlePane= this.addChildTitlePaneTo(this.rightContainer,{title:title});
                if(contentAction) actionsTitlePane.contentAction= contentAction;
                this.toolPanes.push(actionsTitlePane);
                actionsTitlePane.xContentPane= new XContentPane({style:"margin:0;padding:0;"});
                actionsTitlePane.addChild(actionsTitlePane.xContentPane);
                return this;
            },
            setToolPanesContent: function(){
                if(!this.toolPanes) return;
                for(var tpInd=0;tpInd<this.toolPanes.length;tpInd++) {
                    var toolPane= this.toolPanes[tpInd], tpContentAction=toolPane.contentAction;
                    var tpInstance= (toolPane.xContentPane)?toolPane.xContentPane:toolPane;
                    if (tpContentAction) tpContentAction(tpInstance,this.detailHeader,this.detailTable,this);
                }
            },
            addToolPaneBR: function(){
                var row= this.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                this.addLeftCellToTableRow(row).innerHTML="<br>";
                return this;
            },
            /**
             * actionParams = { btnStyle, btnParams, actionFunction, actionButtonName }
             *    actionFunction = function(actionParams)
             *    actionParams = { detailTableRowsData, detailTableInstance, toolPanes, thisInstance }
             */
            addToolPaneActionButton: function(label, actionParams){
                if (!this.toolPanes||this.toolPanes.length==0) this.addToolPane();
                var actionsTableRow= this.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                var actionButton= this.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0, btnStyle:actionParams.btnStyle, btnParameters:actionParams.btnParams});
                if (!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                this.toolPanesActionButtons[actionParams.actionButtonName]= actionButton;
                var actionFunctionParams={detailTable:this.detailTable, toolPanes:this.toolPanes, thisInstance:this};
                if(actionParams.actionFunction) {
                    actionButton.onClick=function(){
                        actionParams.actionFunction(actionFunctionParams);
                    };
                    return this;
                } else {
                    actionButton.onClick= this.getOnClickAction(actionParams.actionButtonName);
                    actionButton.setState= this.getSetStateAction(actionParams.actionButtonName);
                }
                return this;
            },
            /**
             * actionButtonName: loadHeaderNewValues, storeHeaderValues, loadHeaderLastValues, deleteHeader,
             *              insertDetailTableRow, insertDetailTableCopySelectedRow,
             *              allowEditDetailTableSelectedRow, storeDetailTableSelectedRow,
             *              deleteDetailTableSelectedRow,
             *              exportTableContentToExcel
             */
            getOnClickAction: function(actionButtonName){
                var thisInstance=this;
                if (actionButtonName==="loadHeaderNewValues"){
                    return function(){
                        thisInstance.loadDetailHeaderContentValuesFromServer();
                    }
                } else if (actionButtonName==="storeHeaderValues"){
                    return function(){
                        thisInstance.storeDetailHeaderContentValues();
                    }
                } else if (actionButtonName==="loadHeaderLastValues"){
                    return function(){
                        thisInstance.detailHeader.setContentData(thisInstance.detailHeader.lastContentData);
                    }
                } else if (actionButtonName==="deleteHeader"){
                    return function(){
                        thisInstance.deleteDetailHeaderContent();
                    }
                } else if (actionButtonName==="insertDetailTableRow"){
                    return function(){
                        thisInstance.detailTable.insertRowAfterSelected();
                    }
                } else if (actionButtonName==="insertDetailTableCopySelectedRow"){
                    return function(){
                        thisInstance.detailTable.insertRowAfterSelected(thisInstance.detailTable.getSelectedRow());
                    }
                } else if (actionButtonName==="allowEditDetailTableSelectedRow"){
                    return function(){
                        thisInstance.detailTable.allowEditSelectedRow();
                    }
                } else if (actionButtonName==="storeDetailTableSelectedRow"){
                    return function(){
                        thisInstance.storeDetailTableSelectedRowValuesToServer();
                    }
                } else if (actionButtonName==="deleteDetailTableSelectedRow"){
                    return function(){
                        thisInstance.deleteDetailTableSelectedRowFromServer();
                    }
                } else if (actionButtonName==="exportTableContentToExcel"){
                    return function(){
                        thisInstance.exportTableContentToExcel();
                    }
                } else return function(){};
            },
            getSetStateAction: function(actionButtonName){
                var thisInstance=this;
                if (actionButtonName==="storeHeaderValues"){
                    return function(){
                        if (thisInstance.detailHeader.getContentData()&&thisInstance.detailHeader.isContentChanged()) this.setDisabled(false);
                        else this.setDisabled(true);
                    }
                } else if (actionButtonName==="loadHeaderLastValues"){
                    return function(){
                        if (thisInstance.detailHeader.getContentData()&&thisInstance.detailHeader.isContentChanged()) this.setDisabled(false);
                        else this.setDisabled(true);
                    }
                } else if (actionButtonName==="deleteHeader"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader,detailTable=thisInstance.detailTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if ( detailHeaderContentData && detailTable.getData() && detailTable.getData().length==0
                                && detailHeaderContentData[thisInstance.detailHeader.dataStateName]===thisInstance.detailHeader.activeStateValue)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                } else if (actionButtonName==="insertDetailTableRow"||actionButtonName==="insertDetailTableCopySelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader,
                            detailHeaderContentData=detailHeader.getContentData();
                        if (detailHeaderContentData && !detailHeader.isContentChanged() && detailHeaderContentData[detailHeader.dataStateName]!==undefined
                                && detailHeaderContentData[detailHeader.dataStateName]==detailHeader.activeStateValue)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                } else if (actionButtonName==="allowEditDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailTable=thisInstance.detailTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if (detailHeaderContentData && !detailHeader.isContentChanged() && detailTable.getSelectedRow()&& !detailTable.isSelectedRowEditable()
                                && detailHeaderContentData[thisInstance.detailHeader.dataStateName]!==undefined
                                && detailHeaderContentData[thisInstance.detailHeader.dataStateName]==detailHeader.activeStateValue)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                } else if (actionButtonName==="storeDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailTable=thisInstance.detailTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if (detailHeaderContentData && !detailHeader.isContentChanged() && detailTable.isSelectedRowEditable())
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                } else if (actionButtonName==="deleteDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailTable=thisInstance.detailTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if (detailHeaderContentData && !detailHeader.isContentChanged() && detailTable.getSelectedRow()
                                && detailHeaderContentData[thisInstance.detailHeader.dataStateName]!==undefined
                                && detailHeaderContentData[thisInstance.detailHeader.dataStateName]==thisInstance.detailHeader.activeStateValue)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }
            },

            /**
             * @params={label, url, name, btnStyle, acceptFileExt //--> ".xlsx"  }
             * @callback(serverResponse, thisInstance)
             */
            addToolPaneFileUploader: function(params, callback) {
                if (!this.toolPanes || this.toolPanes.length == 0) this.addToolPane();
                var actionsTableRow = this.addRowToTable(this.toolPanes[this.toolPanes.length - 1].containerNode.lastChild);
                var tableCell = this.addLeftCellToTableRow(actionsTableRow);
                if (!this.uploadBtn){
                    this.uploadBtn = new Uploader({
                        label: params.label, url: params.url, enctype: "multipart/form-data",
                        type: "file", uploadOnSelect: true, name: params.name, multiple: false
                    });
                    this.uploadBtn.startup();
                    if(params.acceptFileExt) this.uploadBtn.domNode.firstChild.setAttribute("accept",params.acceptFileExt);
                    if (params.btnStyle) this.uploadBtn.set("style", params.btnStyle);
                    var thisInstance = this;
                    this.uploadBtn.onComplete = function (result) {
                        callback(result, thisInstance);
                        this.reset();
                    };
                    tableCell.appendChild(this.uploadBtn.domNode);
                }
                return this;
            },
            setToolPanesActionButtonsState: function(){
                for(var btnAction in this.toolPanesActionButtons) {
                    var actionBtn=this.toolPanesActionButtons[btnAction];
                    if (actionBtn.setState) actionBtn.setState();
                }
            },
            setToolPanesActions: function(){
                this.setToolPanesContent();
                this.setToolPanesActionButtonsState();
            },

            /**
             * actionParams: {action, rowPosName, rowPosIndexName}
             */
            addDetailTableMenuItemAction: function(itemName, actionParams, menuItemAction){
                if (!itemName||!actionParams) return this;
                var menuItemCallback, thisInstance=this;
                if (actionParams.action==="insertDetailTableRowsAfterSelected"){
                    menuItemCallback= function(selRowsData){
                        var count=0;
                        if(selRowsData.length>0) {
                            for (var rowIndex in selRowsData) count++;
                            thisInstance.detailTable.insertRowsAfterSelected(count);//, actionParams.rowPosName,actionParams.rowPosIndexName
                        } else
                            thisInstance.detailTable.insertRowAfterSelected();
                    }
                } else if (actionParams.action==="allowEditDetailTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.detailTable.allowEditRows(selRowsData);
                    }
                } else if (actionParams.action==="storeDetailTableSelectedRows"){
                    menuItemCallback= function(selRowsData){
                        thisInstance.storeDetailTableRowsDataToServer(selRowsData);
                    }
                }
                if (menuItemCallback)
                    this.detailTable.setMenuItem(itemName, null, menuItemCallback);
                return this;
            },
            /**
             * actionParams = { stopOnFail, failsCount }
             *      default actionParams.stopOnFail=false
             *      default actionParams.failsCount=5
             * tableRowAction = function(detailTableRowData, actionParams, detailTableUpdatedRowData, startNextAction, finishedAction)
             *      actionParams = { tableInstance, toolPanes, thisInstance }
             *      startNextAction = function(true/false), if false- restart current action
             *
             */
            addDetailTableRowAction: function(actionName, actionParams, tableRowAction){
                if(!this.detailTableActions) this.detailTableActions={};
                this.detailTableActions[actionName] = { actionParams:actionParams, tableRowActionFunction:tableRowAction };
                return this;
            },
            /**
             * actions = { startAction, tableRowAction, endAction }
             *      startAction = function(detailTableRowsData, actionParams, startTableRowActions)
             *      tableRowAction = function(detailTableRowData, actionParams, detailTableUpdatedRowData, startNextAction, finishedAction)
             *          startNextAction = function(true/false), if false- restart current action
             *      endAction = function(detailTableRowsData, actionParams)
             *      actionParams = { detailTableInstance, toolPanes, thisInstance }
             */
            addDetailTableRowsAction: function(actionName, actions){
                if(!actions) return this;
                if(!this.detailTableActions) this.detailTableActions={};
                this.detailTableActions[actionName] = {
                    startActionFunction:actions.startAction,
                    tableRowActionFunction:actions.tableRowAction,//function(tableContentRowData, params, tableUpdatedRowData, startNextAction, finishedAction)
                    endActionFunction:actions.endAction
                };
                return this;
            },
            
            /**
             * actionParams = { btnStyle, btnParams, actionFunction, detailTableActionName, beforeDetailTableRowsAction }
             *      actionFunction = function(selectedTableContent, actionParams)
             *      beforeDetailTableRowsAction = function(selectedTableContent, actionParams, startDetailTableRowsAction)
             *          actionParams = { detailTableInstance, toolPanes, thisInstance }
             *          startDetailTableRowsAction= function(detailTableRowsDataForAction)
             */
            addDetailTablePopupMenuAction: function(itemName, actionParams){
                var thisInstance=this, thisDetailTable= this.detailTable;
                if(!actionParams) actionParams={};
                actionParams.detailTableInstance=thisDetailTable;
                actionParams.toolPanes=thisInstance.toolPanes;
                actionParams.thisInstance=thisInstance;
                var menuItemActionFunction;
                if(actionParams.actionFunction) {
                    menuItemActionFunction= actionParams.actionFunction;
                } else {
                    var detailTableRowAction= this.detailTableActions[actionParams.detailTableActionName];
                    var detailTableRowsActionFunction;
                    if(detailTableRowAction&&detailTableRowAction.startActionFunction&&detailTableRowAction.tableRowActionFunction){
                        detailTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            detailTableRowAction.startActionFunction(rowsDataForAction, actionParams,
                                /*startDetailTableRowsAction*/function(){
                                    thisInstance.detailTable.updateRowsAction(rowsDataForAction, actionParams,
                                        detailTableRowAction.tableRowActionFunction, detailTableRowAction.endActionFunction);
                                });
                        };
                    } else if(detailTableRowAction&&detailTableRowAction.tableRowActionFunction){
                        detailTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            thisInstance.detailTable.updateRowsAction(rowsDataForAction, actionParams,
                                detailTableRowAction.tableRowActionFunction, detailTableRowAction.endActionFunction);
                        }
                    }
                    if(actionParams.beforeDetailTableRowsAction){
                        menuItemActionFunction= function(rowsDataForAction, actionParams){
                            actionParams.beforeDetailTableRowsAction(rowsDataForAction, actionParams,
                                function(detailTableRowsDataForAction){
                                    if(!detailTableRowsDataForAction) detailTableRowsDataForAction=rowsDataForAction;
                                    if(detailTableRowsActionFunction)
                                        detailTableRowsActionFunction(detailTableRowsDataForAction, actionParams)
                                })
                        }
                    } else if (detailTableRowsActionFunction){
                        menuItemActionFunction= detailTableRowsActionFunction;
                    }
                }
                if(!menuItemActionFunction) return this;
                thisDetailTable.setMenuItem(itemName, actionParams,
                    /*menuItemAction*/function(selRowsData, actionParams){
                        var rowsDataForAction=[];
                        for(var selInd in selRowsData) rowsDataForAction.push(selRowsData[selInd]);
                        menuItemActionFunction(rowsDataForAction, actionParams);
                    });
                return this;
            },

            doPrint: function(){                                                                                        //console.log("TDocStdTable.doPrint ",this);
                var printData = {};
                var headerTextStyle="font-size:14px;";
                if(this.detailHeaderElements){
                    for(var ri=0;ri<this.detailHeaderElements.length;ri++){
                        var detHRow=this.detailHeaderElements[ri];
                        this.addPrintDataItemTo(printData, "header", {newTable:true, style:headerTextStyle});
                        for(var ci=0;ci<detHRow.length;ci++){
                            var detHElem=detHRow[ci];                                                                   //console.log("TDocStdTable.doPrint ",ri,ci,detHElem);
                            if(detHElem.tagName&&detHElem.tagName==="TH")
                                this.addPrintDataSubItemTo(printData, "header",
                                    {label:detHElem.innerText, width:0, align:"center",style:"width:100%;font-size:14px;font-weight:bold;text-align:center;",
                                        contentStyle:"margin-top:5px;margin-bottom:3px;"});
                            else {
                                value=null;
                                if (detHElem.textbox) value=detHElem.textbox.value;
                                else if(detHElem.textDirNode) value=detHElem.textDirNode.textContent;//if element Select
                                var printParams=detHElem.printParams;
                                if(value==""){
                                  if(printParams.inputStyle) {
                                      var oldStyleStr =printParams.inputStyle,
                                          newStyleStr= (oldStyleStr.trim().charAt(oldStyleStr.length-1)!=";")?";":"";
                                      newStyleStr+="height:14px;";
                                      printParams.inputStyle = oldStyleStr + newStyleStr;
                                  }
                                    else printParams.inputStyle = " height:14px;";
                                }
                                this.addPrintDataSubItemTo(printData, "header", {width:printParams.cellWidth+5, style:printParams.printStyle,align:"left",
                                    contentStyle:"margin-bottom:3px;", label:printParams.labelText, value:value, type:"text", valueStyle:printParams.inputStyle});
                            }
                        }
                        this.addPrintDataSubItemTo(printData, "header");
                    }
                }
                printData.columns = this.detailTable.getVisibleColumns();
                printData.data = this.detailTable.getData();
                var totalStyle="font-size:12px;";
                if(this.detailTotalElements){
                    for(var ri=0;ri<this.detailTotalElements.length;ri++){
                        var detTRow=this.detailTotalElements[ri];
                        this.addPrintDataItemTo(printData, "total", {newTable:true, style:totalStyle});
                        this.addPrintDataSubItemTo(printData, "total");
                        for(var ci=0;ci<detTRow.length;ci++){
                            var detTElem=detTRow[ci], value=null;                                                  //console.log("TDocStdTable.doPrint ",ri,ci,detTElem);
                            if (detTElem.print===false) continue;
                            if (detTElem.textbox) value=detTElem.textbox.value;
                            else if(detTElem.textDirNode) value=detTElem.textDirNode.textContent;//if element Select
                            var printParams=detTElem.printParams;
                            if(value==""){
                                if(printParams.inputStyle) {
                                    var oldStyleStr =printParams.inputStyle,
                                        newStyleStr= (oldStyleStr.trim().charAt(oldStyleStr.length-1)!=";")?";":"";
                                    newStyleStr+="height:14px;";
                                    printParams.inputStyle = oldStyleStr + newStyleStr;
                                }
                                else printParams.inputStyle = " height:14px;";
                            }
                            this.addPrintDataSubItemTo(printData, "total", {width:printParams.cellWidth+5, style:printParams.printStyle, align:"right",
                                    contentStyle:"margin-top:3px;", label:printParams.labelText, value:value, type:"text", valueStyle:printParams.inputStyle});
                        }
                    }
                }
                this.setPrintDataFormats(printData, this.printFormats);
                var printWindow= window.open("/print/printSimpleDocument");                                             //console.log("doPrint printWindow printData=",printData);
                printWindow["printTableContentData"]= printData;
            },
            exportTableContentToExcel:function(){
                this.requestForExcelFile({tableData:this.detailTable.getContent(), visibleColumns:this.detailTable.getVisibleColumns()});
            },
            startUp: function(){
                if(this.detailContainer)this.detailContainer.startup();
                if (this.listTable) this.loadListTableContentFromServer();
                return this;
            }
        })
    });