/**
 * Created by dmkits on 20.04.16.
 * Refactor by dmkits 15.02.17.
 */
Handsontable.cellTypes['text'].editor.prototype.setValue = function(value) {                                            //console.log("Handsontable.cellTypes['text'].editor.prototype.setValue ",value);
    var cellPropFormat = this.cellProperties["format"];
    if (this.cellProperties["type"]=="numeric"&&cellPropFormat&&cellPropFormat.indexOf('%')>=0){
        var val = ''; if(value) val = Math.round(value.replace(',','.')*100)+'%'; this.TEXTAREA.value= val;
    } else if (this.cellProperties["type"]=="numeric") {
        this.TEXTAREA.value = value.replace('.',',');
    } else this.TEXTAREA.value=value;
};
Handsontable.cellTypes['text'].editor.prototype.getValue = function() {
    var cellPropFormat = this.cellProperties["format"];
    if (this.cellProperties["type"]=="numeric"&&cellPropFormat&&cellPropFormat.indexOf('%')>=0){
        var val = this.TEXTAREA.value;
        if(!val) return this.TEXTAREA.value;
        if(val.indexOf('%')>=0) val = val.replace('%','');
        if (isNaN(val/100)) return this.TEXTAREA.value;
        return val/100;
    } else if (this.cellProperties["type"]=="numeric") {
        return this.TEXTAREA.value.replace('.',',');
    }
    return this.TEXTAREA.value;
};

define(["dojo/_base/declare", "dijit/layout/ContentPane","dojox/widget/Standby", "dijit/Dialog","dijit/ProgressBar", "dijit/registry", "request"],
    function(declare, ContentPane, Standby, Dialog, ProgressBar, Registry, Request){
        return declare("HTableSimple", [ContentPane], {
            handsonTable: null,
            htColumns: [], htVisibleColumns: [],
            htData: [], htDataError:null,
            htSelection:null,
            //showIdentifiers:false,
            readOnly: true,
            wordWrap: false,
            persistentState: false,
            popupMenuItems: {},
            tableHeaderAddedElements: undefined,
            constructor: function(args,parentName){
                this.srcNodeRef = document.getElementById(parentName);
                this.domNode = this.srcNodeRef;
                this.htColumns= [];/*[ { data:<data prop>, name, readOnly, type, width}, ...]*/
                this.htVisibleColumns= [];
                this.htData= []; /*[ {prop:value,...}, ...]*/
                this.htDataError= null;
                //this.showIdentifiers=false;
                this.readOnly= true;
                this.wordWrap= false;
                this.persistentState= false;
                this.popupMenuItems= [];
                this.enableComments=false; this.htComments=[];
                this.htSelection=null;
                declare.safeMixin(this,args);
                this.loadingGif=null;
            },
            getVisibleColumnsFrom: function(dataColumns){
                var visibleColumns = [], vc=0;
                for(var c=0;c<dataColumns.length;c++){
                    var colItem=dataColumns[c];
                    if(colItem["visible"]!==false) {
                        var newColData = {};
                        visibleColumns[vc++]= newColData;
                        for(var item in colItem) {
                            newColData[item]=colItem[item];
                            if (item==="type"&&colItem.type==="autocomplete"&&colItem.source===undefined) {
                                newColData.source=[]; //newColData.source.push("");
                            }
                        }
                    }
                }
                return visibleColumns;
            },
            setDataColumns: function(newDataColumns){
                if(!newDataColumns) {
                    this.htColumns=[]; this.htVisibleColumns = [];
                    return;
                }
                this.htColumns = newDataColumns;
                this.htVisibleColumns= this.getVisibleColumnsFrom(newDataColumns);
            },
            /*
             * data = { identifier:"...", columns:[...], items:[...] }
             * if no data table data setted to { identifier:null, columns:[], items:[] }; }
             * if no data.items data.items setted to []
             */
            setData: function(data) {
                if (!data) { data={ identifier:null, columns:[], items:[], error:null }; }
                if(data.error) { this.htDataError=data.error; } else this.htDataError=null;
                if(data.identifier) { this.handsonTable.rowIDName=data.identifier; }
                this.setDataColumns(data.columns);
                if(!data.items) {
                    this.htData = [];
                    return;
                }
                this.htData = data.items;
            },
            getData: function(){
                return this.htData;
            },
            getRowIDName: function(){
                return this.handsonTable.rowIDName;
            },
            getColumns: function(){                                                                                         //console.log("HTableSimple getColumns ",this.htColumns);
                return this.htColumns;
            },
            getDataError: function(){
                return this.htDataError;
            },
            getVisibleColumns: function(){ return this.htVisibleColumns; },
            createHandsonTable: function(){
                var content = document.createElement('div');
                content.parentNode = this.domNode; content.parent = this.domNode; content.style="width:100%;height:100%;margin0;padding:0;";
                this.set("content",content);
                var parent=this;
                this.handsonTable = new Handsontable(content, {
                    columns: parent.htVisibleColumns,
                    getColumnHeader: function(colIndex){
                        if(!parent.htVisibleColumns||!parent.htVisibleColumns[colIndex])return colIndex;
                        return parent.htVisibleColumns[colIndex]["name"];
                    },
                    colHeaders: function(colIndex){
                        return this.getColumnHeader(colIndex);
                    },
                    data: parent.htData, comments: parent.enableComments,//copyPaste: true,default
                    copyRowsLimit: 5000,
                    htDataSelectedProp: "<!$selected$!>",
                    rowHeaders: false,
                    //stretchH: "all",
                    autoWrapRow: true,
                    //maxRows: 20,
                    //width: 0, height: 0,
                    minSpareCols:0, minSpareRows: 0,
                    allowInsertRow:false,
                    fillHandle: { autoInsertRow: false, direction: 'vertical' },//it's for use fillHandle in childrens
                    startRows: 1,
                    fixedColumnsLeft: 0, fixedRowsTop: 0,
                    manualColumnResize: true, manualRowResize: false,
                    persistentState: parent.persistentState,
                    readOnly: parent.readOnly,
                    wordWrap: parent.wordWrap,
                    enterMoves:{row:0,col:1}, tabMoves:{row:0,col:1},
                    multiSelect: true,
                    beforeOnCellMouseDown: function(event, coords, element) {
                        if(element.tagName==="TH") { event.stopImmediatePropagation(); }//disable column header click event
                    },
                    cellValueRenderer:function (instance, td, row, col, prop, value, cellProperties) {
                        if(cellProperties["html"]){
                            Handsontable.renderers.HtmlRenderer.apply(this, arguments);
                        } else {
                            Handsontable.cellTypes[cellProperties.type].renderer.apply(this, arguments);
                            if (cellProperties["type"]==="text"&&cellProperties["datetimeFormat"]){
                                if(value!==null&&value!==undefined)
                                    td.innerHTML= moment(new Date(value) /*value,"YYYY-MM-DD"*/).format(cellProperties["datetimeFormat"]);
                                else td.innerHTML="";
                            }
                            if (cellProperties["align"]){
                                if(cellProperties["align"]=="left") td.setAttribute("style","text-align:left");
                                if(cellProperties["align"]=="center") td.setAttribute("style","text-align:center");
                                if(cellProperties["align"]=="right") td.setAttribute("style","text-align:right");
                            }
                        }
                        var rowSourceData= instance.getContentRow(row);
                        if(rowSourceData&&rowSourceData[instance.getSettings().htDataSelectedProp]===true) td.classList.add('hTableCurrentRow');
                        return cellProperties;
                    },
                    cells: function (row, col, prop) {
                        return {readOnly:true, renderer:this.cellValueRenderer};
                    },
                    setDataSelectedProp: function(data, olddata){
                        if (data) data[this.htDataSelectedProp]= true;
                        if (olddata && olddata!==data) olddata[this.htDataSelectedProp]= false;
                    },
                    /*beforeSetRangeStart: function(coords){                                                                console.log("HTableSimple beforeSetRangeStart coords=",coords);

                     },*/
                    /*beforeSetRangeEnd: function(coords){                                                                  console.log("HTableSimple beforeSetRangeEnd coords=",coords);

                     },*/
                    afterSelectionEnd: function(r,c,r2,c2) {
                        var selection= [], firstItem=r;
                        if (r<=r2)
                            for (var ri=r; ri<=r2; ri++) selection[ri]=this.getContentRow(ri);
                        else {
                            firstItem=r2;
                            for (var ri = r2; ri <= r; ri++) selection[ri] = this.getContentRow(ri);
                        }
                        parent.onSelect(selection[firstItem], selection);
                    }
                });
                this.handsonTable.updateSettings({fillHandle: false});//it's for use fillHandle in childrens
                this.handsonTable.getContent= function(){
                    return this.getSourceData();
                };
                this.handsonTable.getContentRow= function(row){
                    if (!this.getContent()||this.getContent().length==0) return null;
                    return this.getContent()[row];
                };
                this.resizePane = this.resize; this.resize = this.resizeAll;
                this.loadingGif = new Standby({"target":parent.domNode});
                this.loadingGif.startup();
                document.body.appendChild(this.loadingGif.domNode);
            },
            postCreate: function(){
                this.createHandsonTable();
            },
            getHandsonTable: function(){ return this.handsonTable; },
            setReadOnly: function(readOnly){
                if (readOnly===undefined) readOnly=true;
                this.readOnly= readOnly;
                this.handsonTable.updateSettings({readOnly:readOnly});
            },
            setHTParams: function(params){
                this.handsonTable.updateSettings(params);
            },
            setAddingHeaderRow: function(addingHeaderElements){
                if (addingHeaderElements) this.tableHeaderAddedElements=addingHeaderElements;
                var hInstance= this.getHandsonTable();
                hInstance.updateSettings({
                    afterRender: function () {
                        var theads=hInstance.rootElement.getElementsByTagName('thead');                         //console.log("HTableSimple afterRender theads=",theads);
                        var div= document.createElement("div");
                        for(var theadInd=0;theadInd<theads.length;theadInd++){
                            var thead= theads[theadInd];
                            var newTR = document.createElement("tr");
                            var newTH=document.createElement("th");
                            newTR.appendChild(newTH);
                            var tr=thead.getElementsByTagName('tr')[0];
                            if(theadInd<=1) {
                                thead.insertBefore(newTR, tr);
                                newTH.setAttribute("colspan", tr.childNodes.length.toString());
                                if(theadInd==1)newTH.appendChild(div);
                                if (tr.firstChild) tr.firstChild.removeAttribute("colspan");
                            }
                        }
                        for(var eName in addingHeaderElements)
                            div.appendChild(addingHeaderElements[eName]);
                    }
                });
            },
            resizeAll: function(changeSize,resultSize){
                if(!changeSize) return;
                this.resizePane(changeSize,resultSize);
                var thisMarginTop= (this.domNode.style.marginTop).replace("px",""),
                    thisMarginBottom= (this.domNode.style.marginBottom).replace("px","");
                this.handsonTable.updateSettings(
                    {/*width:this.domNode.clientWidth,*/ height:changeSize.h-2-thisMarginTop-thisMarginBottom}
                );
            },
            //setDisabled: function(disabled){
            //    this.set("disabled",disabled);
            //    if (disabled) this.handsonTable
            //},
            /*
             * newdata = { identifier:"...", columns:[...], items:[...] }
             * if newdata.items=null table data content cleared (columns not clreared)
             * calls on load/set/reset data to table or on change data after store
             * params= { callOnUpdateContent=true/false, resetSelection=true/false }
             * default params.resetSelection!=false
             * if params.resetSelection==false not call resetSelection
             * default params.callOnUpdateContent!=false
             * if params.callOnUpdateContent==false not call onUpdateContent
             */
            updateContent: function(newdata,params) {                                                           //console.log("HTableSimple updateContent newdata=",newdata," params=", params);
                if(newdata!==undefined) this.setData(newdata);
                if(this.htData!==null) {//loadTableContent
                    this.handsonTable.updateSettings(
                        {columns:this.htVisibleColumns, data:this.getData(), readOnly:this.readOnly, comments:this.enableComments}
                    );
                    if(params&&params.resetSelection!==false) this.resetSelection();
                } else {//clearTableDataContent
                    this.clearContent(params);
                }
                if (params&&params.callOnUpdateContent===false) return;
                this.onUpdateContent();
            },
            setContent: function(newdata) {                                                                                 //console.log("HTableSimple setContent newdata=", newdata);
                this.updateContent(newdata);
            },
            /*
             * params= { callOnUpdateContent=true/false, resetSelection=true/false }
             * default params.resetSelection!=false
             * if params.resetSelection==false not call resetSelection
             * default params.callOnUpdateContent!=false
             * if params.callOnUpdateContent==false not call onUpdateContent
             */
            clearContent: function(params) {                                                                                //console.log("HTableSimple clearContent");
                if(params&&params.resetSelection!==false) this.setSelection(null,null);
                this.handsonTable.updateSettings({columns:this.htVisibleColumns, data:[], comments:false, readOnly:true});
                if (params&&params.callOnUpdateContent===false) return;
                this.onUpdateContent();
            },
            resetSelection: function(){                                                                         //console.log("HTableSimple resetSelection ",this.getSelectedRows()," rowIDName=", this.handsonTable.rowIDName);
                var newData= this.getContent();
                var newSelection= null, newSelectionFirstRowIndex, oldSelection= this.getSelectedRows();
                if (oldSelection){
                    var rowIDName= this.handsonTable.rowIDName;
                    for (var oldSelectionRowIndex in oldSelection){
                        var oldSelectionRowData= oldSelection[oldSelectionRowIndex];
                        if (newData[oldSelectionRowIndex]){
                            if(!rowIDName || (rowIDName && oldSelectionRowData[rowIDName]===newData[oldSelectionRowIndex][rowIDName]) ){
                                if (!newSelection) newSelection= [];
                                newSelectionFirstRowIndex=oldSelectionRowIndex;
                                newSelection[oldSelectionRowIndex]=newData[oldSelectionRowIndex];
                                break;
                            }
                        }
                        for(var filteredDataRowIndex in newData)
                            if (rowIDName && newData[filteredDataRowIndex][rowIDName]===oldSelectionRowData[rowIDName]){
                                if (!newSelection) newSelection= [];
                                newSelectionFirstRowIndex=filteredDataRowIndex;
                                newSelection[filteredDataRowIndex]=newData[filteredDataRowIndex];
                                break;
                            }
                        break;
                    }
                }
                this.setSelection( (newSelection)?newSelection[newSelectionFirstRowIndex]:null, newSelection);              //console.log("HTableSimple resetSelection END",this.getSelectedRows()," rowIDName=", this.handsonTable.rowIDName);
            },
            getContent: function(){
                return this.handsonTable.getContent();
            },
            getContentData: function(){//copy of contentData
                var contentData=[], content=this.handsonTable.getContent();
                for(var row=0;row<content.length;row++){
                    var contentDataItem={}, contentItem=content[row];
                    for(var itemName in contentItem) contentDataItem[itemName]=contentItem[itemName];
                    contentData.push(contentDataItem);
                }
                return contentData;
            },
            getContentRow: function(rowInd){
                return this.handsonTable.getContentRow(rowInd);
            },
            getContentItemSum: function(itemName){
                var contentData= this.getContent();
                var itemSum=0.0;
                for(var dataItemIndex in contentData){
                    var itemData= contentData[dataItemIndex];
                    var itemValue=itemData[itemName];
                    if (itemValue) itemSum+=itemValue;
                }
                return itemSum;
            },
            /**
             * param = { updatedRows }
             * param.updatedRows has values if call updateRowData
             */
            onUpdateContent: function(params){                                                                                    //console.log("HTableSimple onUpdateContent");
                //TODO actions on/after update table content (after set/reset/reload/clear table content data)
                //TODO actions and after call updateRowData({rowData,newRowData})
            },
            /**
             * params: {method=get/post , url, condition:string or object, duplexRequest:true/false, dontClearContent:true/false, data, callUpdateContent:true/false}
             * if (duplexRequest=true) or (duplexRequest=undefined and no htColumns data),
             *     sends two requests: first request without parameters to get columns data without table data
             *     and second request with parameters from params.condition to get table data;
             * if duplexRequest=false, sends only one request to get table data with columns data.
             * if clearContentBeforeLoad==true content clearing before send request for table data
             */
            setContentFromUrl: function(params){                                                                            console.log("HTableSimple setContentFromUrl ",params);
                var instance = this;
                if (!params) {
                    this.updateContent(null);
                    return;
                }
                if (!params.method) params.method="get";
                var duplexRequest= (params.duplexRequest===true)||( (!this.htColumns||this.htColumns.length==0)&&(params.duplexRequest!==false) );
                if (params.method!="post") {
                    if (duplexRequest){
                        instance.loadingGif.show();
                        Request.getJSONData({url:params.url, condition:null}
                            ,/*postaction*/function(result){
                                if(!result) {
                                    instance.loadingGif.hide();
                                    instance.updateContent({columns:instance.htColumns, items:[]}, {callUpdateContent:params.callUpdateContent});
                                    return;
                                }
                                if(!result.columns) result.columns=instance.htColumns;
                                if(!result.items) result.items=[];
                                instance.loadingGif.hide();
                                instance.updateContent(result, {callUpdateContent:params.callUpdateContent, resetSelection:false});
                                var sCondition= JSON.stringify(params.condition);
                                if(sCondition.length==0||sCondition==="{}"){ instance.loadingGif.hide(); return; }  //if condition is Empty
                                Request.getJSONData({url:params.url, condition:params.condition}
                                    ,/*postaction*/function(result){
                                        if(!result) result={};
                                        if(!result.columns) result.columns=instance.htColumns;
                                        if(!result.items) result.items=[];
                                        instance.loadingGif.hide();
                                        instance.updateContent(result, {callUpdateContent:params.callUpdateContent});
                                    });
                            });
                        return;
                    }
                    if(this.htData&&this.htData.length>0 && params.clearContentBeforeLoad===true)
                        instance.clearContent({callUpdateContent:params.callUpdateContent, resetSelection:false});
                    instance.loadingGif.show();
                    Request.getJSONData({url:params.url, condition:params.condition}
                        ,/*postaction*/function(result){
                            if(!result) result={};
                            if(!result.columns) result.columns=instance.htColumns;
                            if(!result.items) result.items=[];
                            instance.loadingGif.hide();
                            instance.updateContent(result, {callUpdateContent:params.callUpdateContent});
                        });
                    return;
                }
                if (duplexRequest){
                    instance.loadingGif.show();
                    Request.postJSONData({url:params.url, condition:null},
                        /*postaction*/function(result){
                            if(!result) {
                                instance.loadingGif.hide();
                                instance.updateContent(result, {callUpdateContent:params.callUpdateContent});
                                return;
                            }
                            instance.updateContent(result, {callUpdateContent:params.callUpdateContent, resetSelection:false});
                            var sCondition= JSON.stringify(params.condition);
                            if(sCondition.length==0||sCondition==="{}") {
                                instance.loadingGif.hide();
                                return;
                            }//if condition is Empty
                            Request.postJSONData({url:params.url, condition:params.condition, data:params.data},
                                /*postaction*/function(result){
                                    if(!result) {
                                        instance.loadingGif.hide();
                                        instance.updateContent({ columns:instance.htColumns, items:[] }, {callUpdateContent:params.callUpdateContent});
                                        return;
                                    }
                                    if (result.items && result.items.length>0)
                                        instance.loadingGif.hide();
                                    instance.updateContent(result, {callUpdateContent:params.callUpdateContent});
                                });
                        });
                    return;
                }
                if(this.htData&&this.htData.length>0 && params.clearContentBeforeLoad===true)
                    instance.clearContent({callUpdateContent:params.callUpdateContent, resetSelection:false});
                instance.loadingGif.show();
                Request.postJSONData({url:params.url, condition:params.condition, data:params.data},
                    /*postaction*/function(result){
                        if(!result) {
                            instance.updateContent({ columns:instance.htColumns, items:[] }, {callUpdateContent:params.callUpdateContent});
                            instance.loadingGif.hide();
                            return;
                        }
                        instance.loadingGif.hide();
                        instance.updateContent(result, {callUpdateContent:params.callUpdateContent});
                    });
            },
            /**
             * params { callUpdateContent }
             * do render table content
             */
            updateRowData: function(rowData, newRowData, params){
                for(var itemName in newRowData) rowData[itemName]= newRowData[itemName];
                this.handsonTable.render();
                if (params&&params.callUpdateContent!=false) {
                    var rowsData=[]; rowsData[0]=rowData;
                    this.onUpdateContent({updatedRows:rowsData});
                }
                return rowData;
            },
            /**
             * actionFunction = function(rowData, actionParams, updatedRowData, nextAction, finishedAction)
             * nextAction = function(true/false) if false restart current action
             * finishedAction = function(rowsData, actionParams)
             */
            updateRowsAction: function(rowsData, actionParams, actionFunction, finishedAction){
                this.updateRowsActionCallback(this, rowsData, 0, actionParams, actionFunction, finishedAction);
            },
            updateRowsActionCallback: function(tableInstance, rowsData, ind, actionParams, actionFunction, finishedAction){
                var rowData=rowsData[ind];
                var progressBarDialog = Registry.byId(tableInstance.id + "_progressDialog");
                var progressBarForDialog = Registry.byId(tableInstance.id + "_progressBarForDialog");
                if(!rowData){
                    if(progressBarDialog) progressBarDialog.hide();
                    if(finishedAction) finishedAction(rowsData, actionParams);
                    else tableInstance.updateRowData(rowData, {}, {callUpdateContent:true});
                    return;
                }
                if(ind==0) {
                    if (!progressBarDialog) {
                        progressBarDialog = new Dialog({id: tableInstance.id + "_progressDialog", closable: false,
                            title: "Подождите, пожалуйста, операция выполняется"});
                        document.body.appendChild(progressBarDialog.domNode);
                    }
                    if (!progressBarForDialog) {
                        progressBarForDialog = new ProgressBar({id: tableInstance.id +"_progressBarForDialog", style: "width: 300px"});
                        progressBarDialog.addChild(progressBarForDialog);
                    }
                    progressBarForDialog.set("maximum", rowsData.length);
                    progressBarForDialog.set("value",0);
                    progressBarDialog.show();
                } else
                    progressBarForDialog.set("value",ind);
                var updatedRowData={};
                actionFunction(rowData, actionParams, updatedRowData,
                    /*nextAction*/function(next){
                        var indNext=(next===false)?ind:ind+1;
                        tableInstance.updateRowData(rowData, updatedRowData, {callUpdateContent:false});
                        tableInstance.updateRowsActionCallback(tableInstance, rowsData, indNext, actionParams, actionFunction, finishedAction);
                    },/*finishedAction*/function(){
                        tableInstance.updateRowData(rowData, updatedRowData, {callUpdateContent:false});
                        tableInstance.updateRowsActionCallback(tableInstance, rowsData, rowsData.length, actionParams, actionFunction, finishedAction);
                    })
            },
            setSelectedRow: function(rowIndex){
                this.handsonTable.selectCell(rowIndex,0,rowIndex,0);
            },
            setSelectedRowByItemValue:function(itemName, value){
                var oldSelectedRow=this.getSelectedRow(), instance=this;
                this.getContent().some(function(item,rowIndex){
                    if (item[itemName]==value) {
                        instance.htSelection= []; instance.htSelection[rowIndex]=item;
                    }
                });
                var newSelectedRow=this.getSelectedRow();
                this.handsonTable.getSettings().setDataSelectedProp(newSelectedRow, oldSelectedRow);
                this.handsonTable.render();
                this.onSelect(newSelectedRow,this.htSelection);
            },
            getSelectedRowIndex:function(){
                if(!this.htSelection) return null;
                for(var selItemIndex in this.htSelection)
                    return parseInt(selItemIndex);
            },
            getSelectedRow:function(){
                if(!this.htSelection) return null;
                for(var selItemIndex in this.htSelection)
                    return this.htSelection[selItemIndex];
            },
            getSelectionLastRow:function(){
                if(!this.htSelection) return null;
                var selLastRowData=null;
                for(var selItemIndex in this.htSelection)
                    selLastRowData= this.htSelection[selItemIndex];
                return selLastRowData;
            },
            getSelectedRowItemValue:function(itemName){
                if (!this.getSelectedRow) return null;
                return this.getSelectedRow[itemName];
            },
            getSelectedRows:function(){
                return this.htSelection;
            },
            onSelect: function (firstSelectedRowData, selection){
                //TODO actions on/after row select by user or after call setSelectedRow/setSelectedRowByID
                this.setSelection(firstSelectedRowData, selection);
            },
            setSelection:function(firstSelectedRowData, selection){//callback onSelect
                if (firstSelectedRowData===undefined){
                    this.handsonTable.getSettings().setDataSelectedProp(this.getSelectedRow());
                    this.handsonTable.render();
                    return;
                }
                var oldSelRow= this.getSelectedRow();                                                                       //console.log("HTableSimple setSelection",selection);
                this.handsonTable.getSettings().setDataSelectedProp(firstSelectedRowData, oldSelRow);
                this.htSelection= selection;
                this.handsonTable.render();
            },
            /**
             * menuAction= function(selRowsData, actionParams, thisInstance)
             */
            setMenuItem: function(itemName, actionParams, menuAction){                                              //console.log("HTableSimple setMenuItem",itemID,this.popupMenuItems,this);
                var thisInstance= this;
                this.popupMenuItems.push({
                    name:itemName,
                    callback: function(key, options){                                                                       //console.log("HTableSimple menuItem callback",key,options);
                        var selRowsData= [];
                        if(options.start&&options.end){
                            var startRowIndex= options.start.row, endRowIndex= options.end.row;
                            var selRowsData= [];
                            for(var r=startRowIndex; r<=endRowIndex; r++) selRowsData[r]= this.getContentRow(r);
                        }
                        menuAction(selRowsData, actionParams, thisInstance);
                    }
                });
                this.handsonTable.updateSettings({ contextMenu: { items: this.popupMenuItems } });
            }
        });
    });
