/**
 * Created by dmkits on 20.04.16.
 * Refactor by dmkits 15.02.17.
 */
Handsontable.cellTypes['text'].editor.prototype.setValue = function(value){                                //log("Handsontable.cellTypes['text'].editor.prototype.setValue ",value);
    var cellPropFormat = this.cellProperties["format"];
    if(this.cellProperties["type"]=="numeric"&&cellPropFormat&&cellPropFormat.indexOf('%')>=0){
        var val = ''; if(value) val = Math.round(value.replace(',','.')*100)+'%'; this.TEXTAREA.value= val;
    }else if(this.cellProperties["type"]=="numeric"){
        this.TEXTAREA.value = value.replace('.',',');
    }else this.TEXTAREA.value=value;
};
Handsontable.cellTypes['text'].editor.prototype.getValue = function(){
    var cellPropFormat = this.cellProperties["format"];
    if(this.cellProperties["type"]=="numeric"&&cellPropFormat&&cellPropFormat.indexOf('%')>=0){
        var val = this.TEXTAREA.value;
        if(!val) return this.TEXTAREA.value;
        if(val.indexOf('%')>=0) val = val.replace('%','');
        if (isNaN(val/100)) return this.TEXTAREA.value;
        return val/100;
    }else if(this.cellProperties["type"]=="numeric"){
        return this.TEXTAREA.value.replace('.',',');
    }
    return this.TEXTAREA.value;
};

define(["dojo/_base/declare", "dijit/layout/ContentPane","dojox/widget/Standby", "app/request", "app/dialogs"],
    function(declare, ContentPane, Standby, Request, Dialogs){
        return declare("HTableSimple", [ContentPane],{
            handsonTable: null,
            htColumns: [], htVisibleColumns: [],
            htData: [],
            htSelection:null,
            //showIdentifiers:false,
            readOnly: true,
            wordWrap: false,
            persistentState: false,
            popupMenuItems: {},
            tableHeaderAddedElements: undefined,
            constructor: function(args){
                this.htColumns= [];/*[ { data:<data prop>, name, readOnly, type, width}, ...]*/
                this.htVisibleColumns= [];
                this.htData= []; /*[ {prop:value,...}, ...]*/
                //this.showIdentifiers=false;
                this.readOnly= true;//HTableSimple,hTableSimpleFiltered only read only. see cells function.
                this.wordWrap= false;
                this.persistentState= false;
                this.popupMenuItems= [];
                this.enableComments=false; this.htComments=[];
                this.htSelection=null;
                declare.safeMixin(this,args);
                this.loadingGif=null;
            },
            setConentStyle:function(){
                this.domNode.style.padding="0px";
            },
            postCreate: function(){
                this.setConentStyle();
                this.createHandsonTable();
            },
            getVisibleColumnsFrom: function(dataColumns){
                var visibleColumns = [], vc=0;
                for(var c=0;c<dataColumns.length;c++){
                    var colItem=dataColumns[c];
                    if(colItem["visible"]!==false){
                        var newColData = {};
                        visibleColumns[vc++]= newColData;
                        for(var item in colItem){
                            newColData[item]=colItem[item];
                            if(item==="type"&&colItem.type==="autocomplete"&&colItem.source===undefined){
                                newColData.source=[]; //newColData.source.push("");
                            }
                        }
                    }
                }
                return visibleColumns;
            },
            setDataColumns: function(newDataColumns){
                if(!newDataColumns){ this.htColumns=[]; this.htVisibleColumns = []; return; }
                this.htColumns = newDataColumns;
                this.htVisibleColumns= this.getVisibleColumnsFrom(newDataColumns);
            },
            /*
             * data = { identifier:"...", columns:[...], items:[...] }
             * if no data table data setted to { identifier:null, columns:[], items:[] }; }
             * if no data.items data.items setted to []
             */
            setData: function(data){
                if(!data){ data={ identifier:null, columns:[], items:[], error:null }; }
                this.handsonTable.rowIDNames={};
                if(data.identifier){
                    this.handsonTable.rowIDName=data.identifier;
                    this.handsonTable.rowIDNames[data.identifier]=0;
                }
                if(data.columns){
                    for(var c in data.columns){
                        var colData=data.columns[c];
                        if(colData.identifier) this.handsonTable.rowIDNames[colData.data]=c;
                    }
                }
                this.setDataColumns(data.columns);
                if(!data.items){ this.htData = []; return; }
                this.htData = data.items;
            },
            getData: function(){ return this.htData; },
            getRowIDName: function(){ return this.handsonTable.rowIDName; },
            getRowIDNames: function(){ return this.handsonTable.rowIDNames; },
            getColumns: function(){                                                                         //log("HTableSimple getColumns ",this.htColumns);
                return this.htColumns;
            },
            getVisibleColumns: function(){ return this.htVisibleColumns; },
            createHandsonTable: function(){
                var content = document.createElement('div');content.style="width:100%;height:100%;margin0;padding:0;";
                this.domNode.appendChild(content); this.domNode.style.overflow="hidden";
                var parent=this;
                this.handsonTable = new Handsontable(content, {
                    columns: parent.htVisibleColumns,
                    getColumnHeader: function(colIndex){
                        if(!parent.htVisibleColumns||!parent.htVisibleColumns[colIndex])return colIndex;
                        return parent.htVisibleColumns[colIndex]["name"];
                    },
                    colHeaders: function(colIndex){ return this.getColumnHeader(colIndex); },
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
                    readOnly: parent.readOnly!==false,
                    wordWrap: parent.wordWrap, trimWhitespace:false,
                    enterMoves:{row:0,col:1}, tabMoves:{row:0,col:1},
                    multiSelect: true,
                    beforeOnCellMouseDown: function(event, coords, element){
                        if(!element)return;
                        if(element.tagName==="TH"&&element.className=="addedHeaderTH"){ event.stopImmediatePropagation(); }//disable added header click event
                    },
                    cellValueRenderer:function (instance, td, row, col, prop, value, cellProperties){
                        if(cellProperties["html"]){
                            Handsontable.renderers.HtmlRenderer.apply(this, arguments);
                        }else{
                            Handsontable.cellTypes[cellProperties.type].renderer.apply(this, arguments);
                            if(cellProperties["type"]==="text"&&cellProperties["datetimeFormat"]){
                                if(value!==null&&value!==undefined)
                                    td.innerHTML= moment.parseZone(new Date(value) /*value,"YYYY-MM-DD"*/).utc().format(cellProperties["datetimeFormat"]);
                                else td.innerHTML="";
                            }
                            if(cellProperties["align"]){
                                if(cellProperties["align"]=="left") td.setAttribute("style","text-align:left");
                                if(cellProperties["align"]=="center") td.setAttribute("style","text-align:center");
                                if(cellProperties["align"]=="right") td.setAttribute("style","text-align:right");
                            }
                        }
                        var rowSourceData= instance.getContentRow(row);
                        if(rowSourceData&&rowSourceData[instance.getSettings().htDataSelectedProp]===true) td.classList.add('hTableCurrentRow');
                        return cellProperties;
                    },
                    cells: function (row, col, prop){ return {readOnly:true, renderer:this.cellValueRenderer}; },
                    setDataSelectedProp: function(data, olddata){
                        if(data) data[this.htDataSelectedProp]= true;
                        if(olddata && olddata!==data) olddata[this.htDataSelectedProp]= false;
                    },
                    /*beforeSetRangeStart: function(coords){                                                log("HTableSimple beforeSetRangeStart coords=",coords);

                     },*/
                    /*beforeSetRangeEnd: function(coords){                                                  log("HTableSimple beforeSetRangeEnd coords=",coords);

                     },*/
                    afterSelectionEnd: function(r,c,r2,c2){
                        var selection= [], firstItem=r;
                        if(r<=r2)
                            for(var ri=r; ri<=r2; ri++) selection[ri]=this.getContentRow(ri);
                        else{
                            firstItem=r2;
                            for(var ri = r2; ri <= r; ri++) selection[ri] = this.getContentRow(ri);
                        }                                                                                   //log("HTableSimple afterSelectionEnd selection1=",selection[firstItem]);
                        parent.onSelect(selection[firstItem], selection);
                    }
                });
                this.handsonTable.updateSettings({fillHandle: false});//it's for use fillHandle in childrens
                this.handsonTable.getContent= function(){ return this.getSourceData(); };
                this.handsonTable.getContentRow= function(row){
                    if(!this.getContent()||this.getContent().length==0) return null;
                    return this.getContent()[row];
                };
                this.resizePane = this.resize; this.resize = this.resizeAll;
                this.loadingGif = new Standby({"target":parent.domNode});
                this.loadingGif.startup();
                document.body.appendChild(this.loadingGif.domNode);
            },
            getHandsonTable: function(){ return this.handsonTable; },
            resizeAll: function(changeSize,resultSize){
                if(!changeSize) return;
                this.resizePane(changeSize,resultSize);
                var thisMarginTop= (this.domNode.style.marginTop).replace("px",""),
                    thisMarginBottom= (this.domNode.style.marginBottom).replace("px","");
                this.handsonTable.updateSettings(
                    {/*width:this.domNode.clientWidth,*/ height:changeSize.h-2-thisMarginTop-thisMarginBottom}
                );
            },
            //setReadOnly: function(readOnly){                                                              console.log("this.handsonTable",this.handsonTable.getSettings().readOnly);
            //    if(readOnly===undefined) readOnly=true;
            //    this.readOnly= readOnly;
            //    this.handsonTable.updateSettings({readOnly:readOnly!==false});                            console.log("this.handsonTable",this.handsonTable.getSettings().readOnly);
            //},
            setWordWrap: function(wordWrap){
                if(wordWrap===undefined) wordWrap=true;
                this.wordWrap= wordWrap;
                this.handsonTable.updateSettings({wordWrap:wordWrap!==false});
            },
            setHTParams: function(params){
                this.handsonTable.updateSettings(params);
            },
            setAddingHeaderRow: function(addingHeaderElements){
                if(addingHeaderElements) this.tableHeaderAddedElements=addingHeaderElements;
                var hInstance= this.getHandsonTable();
                hInstance.updateSettings({
                    afterRender: function(){
                        var theads=hInstance.rootElement.getElementsByTagName('thead'),                     //log("HTableSimple afterRender theads=",theads);
                            div= document.createElement("div");
                        for(var theadInd=0;theadInd<theads.length;theadInd++){
                            var thead= theads[theadInd],
                                newTR = document.createElement("tr"),
                                newTH=document.createElement("th");newTH.setAttribute("class","addedHeaderTH");
                            newTR.appendChild(newTH);
                            var tr=thead.getElementsByTagName('tr')[0];
                            if(theadInd<=1){
                                thead.insertBefore(newTR, tr);
                                newTH.setAttribute("colspan", tr.childNodes.length.toString());
                                if(theadInd==1)newTH.appendChild(div);
                                if(tr.firstChild) tr.firstChild.removeAttribute("colspan");
                            }
                        }
                        for(var eName in addingHeaderElements) div.appendChild(addingHeaderElements[eName]);
                    }
                });
            },
            //setDisabled: function(disabled){
            //    this.set("disabled",disabled);
            //    if (disabled) this.handsonTable
            //},
            /**
             * newdata = { identifier:"...", columns:[...], items:[...] }
             * if newdata.items=null table data content cleared (columns not clreared)
             * calls on load/set/reset data to table or on change data after store
             * params= { callUpdateContent=true/false, resetSelection=true/false }
             * default params.resetSelection!=false
             * if params.resetSelection==false not call resetSelection
             * default params.callUpdateContent!=false
             * if params.callUpdateContent==false not call onUpdateContent
             */
            updateContent: function(newdata,params){                                                log("HTableSimple updateContent newdata=",newdata," params=", params);
                if(newdata!==undefined) this.setData(newdata);
                if(this.htData!==null) {//loadTableContent
                    this.handsonTable.updateSettings(
                        {columns:this.htVisibleColumns, data:this.getData(), readOnly:this.readOnly!==false, comments:this.enableComments}
                    );
                    if(params&&params.resetSelection!==false) this.resetSelection();
                }else{//clearTableDataContent
                    this.clearContent(params);
                    return;
                }
                if(params&&params.callUpdateContent===false) return;
                this.onUpdateContent((params&&params.error)?{error:params.error}:{});
            },
            setContent: function(newdata,params){                                                   //log("HTableSimple setContent newdata=", newdata);
                this.updateContent(newdata,params);
            },
            /**
             * params= { callUpdateContent=true/false, resetSelection=true/false }
             * default params.resetSelection!=false
             * if params.resetSelection==false not call resetSelection
             * default params.callUpdateContent!=false
             * if params.callUpdateContent==false not call onUpdateContent
             */
            clearContent: function(params){                                                         //log("HTableSimple clearContent");
                if(params&&params.resetSelection!==false) this.setSelection(null,null);
                this.handsonTable.updateSettings({columns:this.htVisibleColumns, data:[], comments:false, readOnly:true});
                if(params&&params.callUpdateContent===false) return;
                this.onUpdateContent({});
            },
            resetSelection: function(){                                                             //log("HTableSimple resetSelection ",this.getSelectedRows()," rowIDName=", this.handsonTable.rowIDName);
                var newData= this.getContent();
                var newSelection= null, newSelectionFirstRowIndex, oldSelection= this.getSelectedRows();
                if(oldSelection){
                    var rowIDName= this.handsonTable.rowIDName;
                    for(var oldSelectionRowIndex in oldSelection){
                        var oldSelectionRowData= oldSelection[oldSelectionRowIndex];
                        if(!oldSelectionRowData) continue;
                        if(newData[oldSelectionRowIndex]){
                            if(!rowIDName || (rowIDName && oldSelectionRowData[rowIDName]===newData[oldSelectionRowIndex][rowIDName]) ){
                                if(!newSelection) newSelection= [];
                                newSelectionFirstRowIndex=oldSelectionRowIndex;
                                newSelection[oldSelectionRowIndex]=newData[oldSelectionRowIndex];
                                break;
                            }
                        }
                        for(var filteredDataRowIndex in newData)
                            if(rowIDName && newData[filteredDataRowIndex][rowIDName]===oldSelectionRowData[rowIDName]){
                                if (!newSelection) newSelection= [];
                                newSelectionFirstRowIndex=filteredDataRowIndex;
                                newSelection[filteredDataRowIndex]=newData[filteredDataRowIndex];
                                break;
                            }
                        break;
                    }
                }
                this.setSelection( (newSelection)?newSelection[newSelectionFirstRowIndex]:null, newSelection); //log("HTableSimple resetSelection END",this.getSelectedRows()," rowIDName=", this.handsonTable.rowIDName);
            },
            getContent: function(){ return this.handsonTable.getContent(); },
            getContentData: function(){//copy of contentData
                var contentData=[], content=this.handsonTable.getContent();
                for(var row=0;row<content.length;row++){
                    var contentDataItem={}, contentItem=content[row];
                    for(var itemName in contentItem) contentDataItem[itemName]=contentItem[itemName];
                    contentData.push(contentDataItem);
                }
                return contentData;
            },
            getContentRow: function(rowInd){ return this.handsonTable.getContentRow(rowInd); },
            getContentItemSum: function(itemName){
                var contentData= this.getContent(), itemSum=0.0;
                for(var dataItemIndex in contentData){
                    var itemData= contentData[dataItemIndex], itemValue=itemData[itemName];
                    if(itemValue) itemSum+=itemValue;
                }
                return itemSum;
            },
            /**
             * this callback in onSelect for render selected row
             */
            setSelection:function(firstSelectedRowData, selection){
                if(firstSelectedRowData===undefined){
                    this.handsonTable.getSettings().setDataSelectedProp(this.getSelectedRow());
                    this.handsonTable.render();
                    return;
                }
                var oldSelRow= this.getSelectedRow();                                                       //log("HTableSimple setSelection",selection);
                this.handsonTable.getSettings().setDataSelectedProp(firstSelectedRowData,oldSelRow);
                this.htSelection= selection;
                this.handsonTable.render();
            },
            setSelectionByItemValue:function(itemName, value){
                var oldSelectedRow=this.getSelectedRow(), instance=this;
                this.getContent().some(function(item,rowIndex){
                    if(item[itemName]==value){
                        instance.htSelection= []; instance.htSelection[rowIndex]=item;
                    }
                });
                var newSelectedRow=this.getSelectedRow();
                this.handsonTable.getSettings().setDataSelectedProp(newSelectedRow, oldSelectedRow);
                this.handsonTable.render();
            },
            setSelectedRowByIndex: function(rowIndex){ this.handsonTable.selectCell(rowIndex,0,rowIndex,0); },
            setSelectedRow: function(rowData){
                if(!rowData)return;
                var instance=this;
                this.getContent().some(function(item,rowIndex){
                    if(item==rowData) instance.setSelectedRowByIndex(rowIndex);
                });
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
                if(!this.getSelectedRow) return null;
                return this.getSelectedRow[itemName];
            },
            getSelectedRows:function(){ return this.htSelection; },
            onSelect: function(firstSelectedRowData, selection){
                //TODO actions on/after row select by user or after call setSelectedRowByIndex/setSelectedRow/setSelectedRowByID
                this.setSelection(firstSelectedRowData, selection);
            },
            /**
             * param = { error, updatedRows }
             * param.error exists if request error in call setContentFromUrl
             * param.updatedRows exists if call updateRowData
             */
            onUpdateContent: function(params){                                                              //log("HTableSimple onUpdateContent");
                //TODO actions on/after update table content (after set/reset/reload/clear table content data)
                //TODO actions and after call updateRowData({rowData,newRowData})
            },
            /**
             * menuAction= function(selRowsData, actionParams, thisInstance)
             */
            setMenuItem: function(itemName, actionParams, menuAction){                                       //log("HTableSimple setMenuItem",itemID,this.popupMenuItems,this);
                var thisInstance= this;
                this.popupMenuItems.push({
                    name:itemName,
                    callback: function(key, options){                                                        //log("HTableSimple menuItem callback",key,options);
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
            },
            /**
             * params: { method=get/post , url, conditions:string or object, data,
             *      duplexRequest:true/false,
             *      clearContentBeforeLoad:true/false, resetSelection:true/false, callUpdateContent:true/false }
             * default: clearContentBeforeLoad=false, resetSelection=true, callUpdateContent=true
             * if (duplexRequest=true) or (duplexRequest=undefined and no htColumns data),
             *     sends two requests: first request without parameters to get columns data without table data
             *     and second request with parameters from params.condition to get table data;
             * if duplexRequest=false, sends only one request to get table data with columns data.
             * if clearContentBeforeLoad==true content clearing before send request for table data
             */
            setContentFromUrl: function(params){                                                            log("HTableSimple.setContentFromUrl ",params);
                if(!params){ this.updateContent(null); return; }
                if(!params.url){ console.error("Failed HTableSimple.setContentFromUrl! Reason:no URI."); return; }
                var reqParams={ url:params.url, method:params.method, conditions:null, consoleLog:true, showErrorDialog:true};
                if(!reqParams.method) reqParams.method="get";
                var duplexRequest= (params.duplexRequest===true)||( (!this.htColumns||this.htColumns.length==0)&&(params.duplexRequest!==false) );
                var self = this;
                if(duplexRequest){
                    self.loadingGif.show();
                    Request.jsonData(reqParams,function(result,error){
                        if(!result) result={};
                        if(!result.columns){
                            if(!error)console.error("HTableSimple.setContentFromUrl response result no columns!");
                            result.columns=self.htColumns;
                        }
                        var sConditions= JSON.stringify(params.conditions),
                            noSecondRequest=(result.items)||(!params.conditions||!params.conditions.toString().trim()||sConditions==="{}");
                        if(noSecondRequest) {
                            self.updateContent(result, {error:error, callUpdateContent:params.callUpdateContent, resetSelection:params.resetSelection});
                            self.loadingGif.hide();
                            if(result.items) console.error("HTableSimple.setContentFromUrl response returned items in duplex mode! Second request canceled!");
                            return;
                        }
                        self.updateContent(result, {callUpdateContent:false, resetSelection:false});
                        reqParams.conditions=params.conditions;
                        Request.jsonData(reqParams,function(result,error){
                            if(!result) result={};
                            if(!result.columns) result.columns=self.htColumns;
                            if(!result.items&&!error)console.error("HTableSimple.setContentFromUrl response result no items!");
                            self.updateContent(result,{error:error, callUpdateContent:params.callUpdateContent, resetSelection:params.resetSelection});
                            self.loadingGif.hide();
                        });
                    });
                    return;
                }
                if(this.htData&&this.htData.length>0 && params.clearContentBeforeLoad===true)
                    self.clearContent({callUpdateContent:false, resetSelection:false});
                reqParams.conditions=params.conditions;
                self.loadingGif.show();
                Request.jsonData(reqParams,function(result,error){
                    if(!result) result={};
                    if(!result.columns){
                        if(!error)console.error("HTableSimple.setContentFromUrl response result no columns!");
                        result.columns=self.htColumns;
                    }
                    if(!result.items&&!error)console.error("HTableSimple.setContentFromUrl response result no items!");
                    self.updateContent(result,{error:error, callUpdateContent:params.callUpdateContent, resetSelection:params.resetSelection});
                    self.loadingGif.hide();
                });
            },
            /**
             * params { callUpdateContent, selectUpdateRow= true/false }
             *  if params.selectUpdateRow == true - update row selected
             *  do render table content
             */
            updateRowData: function(rowData, newRowData, params){
                for(var itemName in newRowData) rowData[itemName]= newRowData[itemName];
                if(params&&params.selectUpdateRow)this.setSelectedRow(rowData);
                else this.handsonTable.render();
                if(params&&params.callUpdateContent!=false){
                    var rowsData=[]; rowsData[0]=rowData;
                    this.onUpdateContent({updatedRows:rowsData});
                }
                return rowData;
            },
            updateRowsActionDialog: function(actionParams,progressMaximum){
                return Dialogs.showProgress({id:this.id + "_progressBarForDialog", title:"Выполнение операции",
                    width:530, contentHeight:actionParams.progressDialogContentHeight,
                    btnOkLabel:"Закрыть", btnStopLabel:"Остановить", progressMaximum:progressMaximum});
            },
            /**
             * actionParams = {}, parameters values for use in actionFunction and finishedAction
             * actionFunction = function(rowData, actionParams, updatedRowData, nextAction, finishedAction)
             *      nextAction = function(true/false) -call in actionFunction for start next action, if parameter false restart current action
             * finishedAction = function(rowsData, actionParams) -call if process finished or stopped by user,
             *      actionParams.progressStopped=true if process stopped by user
             *      actionParams.progressFinished=true if process finished (no stopped by user)
             * actionParams.progressDialog - dialog of action progress
             * actionParams.progressDialogContentHeight - messages content height in process dialog
             * actionParams.progressDialog.start({ title, contentHeight, progressMaximum, message }) - start process dialog
             * actionParams.progressDialog.addMsgLine(msg,{contentHeight,textStyle}) - added new message line to dialog, contentHeight if exists set dialog content height
             * actionParams.progressDialog.addMsg(msg,{contentHeight,textStyle}) - added message to dialog, contentHeight if exists set dialog content height
             * actionParams.progressDialog.setMsg(msg) - set last message in dialog
             * actionParams.progressCounter - operation counter
             */
            updateRowsAction: function(rowsData, actionParams, actionFunction, finishedAction){
                if(!actionParams)actionParams={};
                if(!actionParams.progressDialogStoppedMessage)actionParams.progressDialogStoppedMessage="Операция остановлена!";
                if(!actionParams.progressDialog)actionParams.progressDialog=this.updateRowsActionDialog(actionParams,rowsData.length);
                actionParams.progressStopped=false;actionParams.progressFinished=false;
                this._updateRowsActionCallback(this, rowsData, 0, actionParams, actionFunction,
                    /*finishedAction*/function(rowsData, actionParams){
                        if(finishedAction)finishedAction(rowsData, actionParams);
                    });
            },
            _updateRowsActionCallback: function(htableInstance, rowsData, ind, actionParams, actionFunction, finishedAction){
                var rowData=rowsData[ind];
                if(!rowData||actionParams.progressDialog.progressStopped){
                    if(actionParams.progressDialog.progressStopped) actionParams.progressStopped=true;
                    else{
                        actionParams.progressFinished=true; actionParams.progressDialog.setFinished();
                    }
                    if(finishedAction) setTimeout(function(){ finishedAction(rowsData, actionParams); },10);
                    else htableInstance.updateRowData(rowData, {}, {callUpdateContent:true});
                    return;
                }
                actionParams.progressCounter=ind+1; actionParams.progressDialog.setProgress(actionParams.progressCounter);
                var updatedRowData={};
                actionFunction(rowData, actionParams, updatedRowData,
                    /*nextAction*/function(next){
                        var indNext=(next===false)?ind:ind+1;
                        htableInstance.updateRowData(rowData, updatedRowData, {selectUpdateRow:true,callUpdateContent:false});
                        setTimeout(function(){
                            htableInstance._updateRowsActionCallback(htableInstance, rowsData, indNext, actionParams, actionFunction, finishedAction);
                        },10);
                    },/*finishedAction*/function(){
                        htableInstance.updateRowData(rowData, updatedRowData, {selectUpdateRow:true,callUpdateContent:false});
                        setTimeout(function(){
                            htableInstance._updateRowsActionCallback(htableInstance, rowsData, rowsData.length, actionParams, actionFunction, finishedAction);
                        },10);
                    })
            }
        });
    });
