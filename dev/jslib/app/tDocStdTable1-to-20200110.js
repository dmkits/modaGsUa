/**
 * Created by dmkits on 16.02.17.
 */
define(["dojo/_base/declare", "dijit/layout/BorderContainer", "app/tDocsFunctions",
        "app/base", "app/dialogs", "app/contentController", "app/hTableEditable",
        "dojox/layout/ContentPane", "dojox/form/Uploader"],
    function(declare, BorderContainer, TDocsFunctions,
             base, Dialogs, ContentController, HTable,
             XContentPane, Uploader){
        var $TDF=TDocsFunctions;
        return declare("TDocStdTable", [BorderContainer], {
            /**
             * args: { titleText, dataURL, dataURLCondition:{...}, buttonUpdate, buttonPrint, buttonExportToExcel,
             *          printFormats={ ... } }
             * default:
             * buttonUpdate=true, buttonPrint=true, buttonExportToExcel=true,
             * printFormats={ numericFormat:"0,000,000.[00]", dateFormat:"DD.MM.YY", currencyFormat:"0,000,000.[00]" }
             */
            constructor: function(args){
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
            },
            /**
             * params: { titleText, dataURL, dataURLCondition={...},
            *            rightPane:{ width:<width>, ... },
            *            buttonUpdate, buttonPrint, buttonExportToExcel,
            *            printFormats={ ... } or other.
            *  }
             */
            _initInnerComponents: function(params){
                if(this.idListContainer){
                    this.listContainer= $TDF.setContainer({region:'left',splitter:true}, this.idListContainer);
                    this.addChild(this.listContainer);
                    this.listPeriodContent= $TDF.setChildContentPaneTo(this.listContainer, {region:'top',style:"width:100%;height:auto;padding:0;margin:0;"});
                }
                if(this.idDetailContainer){
                    this.detailContainer= $TDF.setContainer({region:'center'}, this.idDetailContainer);
                    this.addChild(this.detailContainer);
                }
                if(this.idDetailContainer&&this.idDetailHeader){
                    this.detailHeader= new ContentController({region:'top', dataIDName:null, style:"margin:0;padding:0;"},this.idDetailHeader);
                    this.detailContainer.addChild(this.detailHeader);
                }
                if(this.idDetailContainer&&this.idDetailTable){
                    this.detailHTable=
                        new HTable({region:'center',style:"margin:5px;padding:0;", wordWrap:true, readOnly:false, useFilters:true, allowFillHandle:true}, this.idDetailTable);
                    $TDF.setBorderedStyleFor(this.detailHTable.domNode);
                    this.detailContainer.addChild(this.detailHTable);
                }
                if(this.idDetailContainer&&this.idDetailTotal){
                    this.detailTotal= $TDF.setContentPane({region:'bottom'}, this.idDetailTotal);
                }
                if(this.idRightContainer){
                    this.rightContainer= $TDF.setContentPane({region:'right'}, this.idRightContainer);
                    this.addChild(this.rightContainer);
                }
            },
            init: function(params){
                for(var pName in params){ this[pName]=params[pName]; }
                if(this.titleText) this.topHeaderTitle.innerHTML=this.titleText;
                this._initInnerComponents();
                this.startup();
                return this;
            },
            postCreate: function(){
                this._initInnerComponents();
                this.startup();
            },

            /**
             * params: { getDataUrl:"/...", getDataUrlCondition: {param:paramValue, ...},
             *              header, bdateCondition,bdatelabelText, edateCondition,edatelabelText} }
             */
            addListTable: function(params){ //setListTable
                this.listTable =
                    new HTable({region:'center',style:"margin:5px;padding:0;", wordWrap:true, readOnly:true, useFilters:true, allowFillHandle:false});
                $TDF.setBorderedStyleFor(this.listTable.domNode);
                this.listTable.getDataUrl= (params)?params.getDataUrl:null; this.listTable.getDataUrlCondition= (params)?params.getDataUrlCondition:null;
                this.listContainer.addChild(this.listTable);
                var thisInstance= this;
                this.listTable.onUpdateContent= function(){                                                     console.log("TDocStdTable.listTable.onUpdateContent ",this.getSelectedRow()," rowDataIDForSelect",this.rowDataIDForSelect);
                    if(this.rowDataIDForSelect!==undefined){
                        this.setSelectionByItemValue(this.getRowIDName(), this.rowDataIDForSelect);
                        return;
                    }
                    var selectedRowData= this.getSelectedRow();
                    if(!selectedRowData && this.getContent().length>0){ this.setSelectedRowByIndex(0); return; }
                    thisInstance.setDetailHeaderContentByListSelectedRow(selectedRowData);
                };
                this.listTable.onSelect= function(firstSelectedRowData,selection){                              console.log("TDocStdTable.listTable.onSelect ",firstSelectedRowData);
                    if( (thisInstance.detailHeader&&thisInstance.detailHeader.isContentChanged())
                            || (thisInstance.detailHTable&&thisInstance.detailHTable.isExistsEditableRows()) ){
                        var listTableSelRowDataID= firstSelectedRowData[thisInstance.detailHeader.dataIDName];
                        if(listTableSelRowDataID===thisInstance.detailHeader.getContentDataIDValue()) return;
                        Dialogs.showSimple({title:"Действия с изменениями в документе",
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
                    this.rowDataIDForSelect= listTableSelRowDataID;
                    thisInstance.setDetailHeaderContentByListSelectedRow(firstSelectedRowData);
                };
                this.setListDatesContent(params);
                return this;
            },
            /**
             * params: { callUpdateContent:true/false, detailHeaderDataID }
             * default callUpdateContent=true
             */
            loadListTableContentFromServer: function(params){
                var conditions = this.listTable.getDataUrlCondition;
                if(!conditions) conditions= {};
                if(this.listBDate) conditions[this.listBDate.conditionName.replace("=","~")] =
                    this.listBDate.format(this.listBDate.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                if(this.listEDate) conditions[this.listEDate.conditionName.replace("=","~")] =
                    this.listEDate.format(this.listEDate.get("value"),{selector:"date",datePattern:"yyyy-MM-dd"});
                if(!params) params= {};
                var callUpdateContent=params.callUpdateContent;
                if(params.detailHeaderDataID!==undefined){
                    callUpdateContent=true;
                    this.listTable.rowDataIDForSelect=params.detailHeaderDataID;
                }
                this.listTable.setContentFromUrl({url:this.listTable.getDataUrl,conditions:conditions,callUpdateContent:callUpdateContent});
            },
            /**
             * params: {header, bdateCondition,bdatelabelText, edateCondition,edatelabelText}
             */
            setListDatesContent: function(params){
                if(params.header){
                    var listHeaderTable = $TDF.addTableTo(this.listPeriodContent.containerNode),
                        listHeaderRow = $TDF.addRowToTable(listHeaderTable, 25);
                    $TDF.addHeaderCellToTableRow(listHeaderRow, 0, "width:100%;", params.header);
                }
                if(!params.bdateCondition&&!params.edateCondition) return this;
                var listPeriodTable = $TDF.addTableTo(this.listPeriodContent.containerNode);
                this.listPeriodTableRow = $TDF.addRowToTable(listPeriodTable);
                var self= this;
                if(params.bdateCondition){
                    this.listBDate = $TDF.addTableCellDateBoxTo(this.listPeriodTableRow,
                        {labelText:params.bdatelabelText, labelStyle:"margin-left:5px;", cellWidth:150, cellStyle:"text-align:right;",
                            dateBoxParams:{conditionName:params.bdateCondition}, initValueDate:base.curMonthBDate()});
                    this.listBDate.onChange = function(){
                        self.loadListTableContentFromServer();
                    }
                }
                if (params.edateCondition) {
                    this.listEDate = $TDF.addTableCellDateBoxTo(this.listPeriodTableRow,
                        {labelText:params.edatelabelText, labelStyle:"margin-left:5px;", cellWidth:150, cellStyle:"text-align:right;",
                            dateBoxParams:{conditionName:params.edateCondition}, initValueDate:base.curMonthEDate()});
                    this.listEDate.onChange = function(){
                        self.loadListTableContentFromServer();
                    }
                }
                return this;
            },

            /**
             * parameters= { dataIDName, getDataUrl,
             *     docDetailEditable= true/false/function(params),
             *     detailHeaderEditable= true/false/function(params),
             *     detailTableEditable= true/false/function(params),
             *         params= { doc:<this document>, detailHeader:<this document header>,
             *             detailHeaderContentData: doc.detailHeader.getContentData() }
             * }
             */
            setDetailHeaderParameters: function(parameters){
                if(parameters.dataIDName) this.detailHeader.setDataIDName(parameters.dataIDName);
                if(parameters.getDataUrl) this.detailHeader.getDataUrl=parameters.getDataUrl;
                if(parameters.getDataForNewUrl) this.detailHeader.getDataForNewUrl=parameters.getDataForNewUrl;
                if(parameters.postDataUrl) this.detailHeader.postDataUrl=parameters.postDataUrl;
                if(parameters.postForDeleteDataUrl) this.detailHeader.postForDeleteDataUrl=parameters.postForDeleteDataUrl;
                if(parameters.docDetailEditable!==undefined) this.docDetailEditable=parameters.docDetailEditable;
                if(parameters.detailHeaderEditable!==undefined) this.detailHeaderEditable=parameters.detailHeaderEditable;
                if(parameters.detailTableEditable!==undefined) this.detailTableEditable=parameters.detailTableEditable;
                this.detailHeaderEditableChecker= function(params){
                    params=params||{};
                    params.doc=this; params.detailHeader=this.detailHeader;
                    if(params.detailHeaderContentData===undefined&&this.detailHeader) params.detailHeaderContentData= this.detailHeader.getContentData();
                    if(this.detailHeaderEditable!==undefined&&typeof(this.detailHeaderEditable)!="function") return this.detailHeaderEditable;
                    if(this.detailHeaderEditable!==undefined&&typeof(this.detailHeaderEditable)=="function")
                        return this.detailHeaderEditable(params);
                    if(this.docDetailEditable!==undefined&&typeof(this.docDetailEditable)!="function") return this.docDetailEditable;
                    if(this.docDetailEditable!==undefined&&typeof(this.docDetailEditable)=="function")
                        return this.docDetailEditable(params);
                    return false;
                };
                this.detailTableEditableChecker= function(params){
                    params=params||{};
                    params.doc=this; params.detailHeader=this.detailHeader;
                    if(params.detailHeaderContentData===undefined&&this.detailHeader) params.detailHeaderContentData= this.detailHeader.getContentData();
                    if(this.detailTableEditable!==undefined&&typeof(this.detailTableEditable)!="function") return this.detailTableEditable;
                    else if(this.detailTableEditable!==undefined&&typeof(this.detailTableEditable)=="function")
                        return this.detailTableEditable(params);
                    else if(this.docDetailEditable!==undefined&&typeof(this.docDetailEditable)!="function") return this.docDetailEditable;
                    else if(this.docDetailEditable!==undefined&&typeof(this.docDetailEditable)=="function")
                        return this.docDetailEditable(params);
                    return false;
                };
                var self=this;
                this.detailHeader.dataEnabledChecker= function(dataItems){
                    return self.detailHeaderEditableChecker({detailHeaderContentData:dataItems});
                };
                this.detailHeader.onContentUpdated= function(contentData,params,idIsChanged){                   //console.log("TDocStdTable.detailHeader.onContentUpdated ",contentData," ",params,idIsChanged);
                    if(this.setTitleContent) this.setTitleContent();
                    if(idIsChanged&&(!params||(params.onlyValues!==true&&!params.error))) this.lastContentData=contentData;
                    if(idIsChanged){
                        if(!contentData||contentData.length==0) self.detailHTable.clearContent();
                        else self.loadDetailTableContentDataFromServer();
                    }else{
                        var detailSubtotalContent=!contentData||contentData.length==0;
                        self.setDetailSubtotalContent({disabled:detailSubtotalContent, clearValue:detailSubtotalContent});
                        self.setToolPanesActions();
                    }
                    if(params&&params.onlyValues!==true&&(params.updatedResultItem!==undefined||params.deletedResultItem!==undefined))
                        self.loadListTableContentFromServer({detailHeaderDataID:self.detailHeader.getContentDataIDValue(), callUpdateContent:false});
                    self.detailHTable.setReadOnly(!self.detailTableEditableChecker());
                };
                this.detailHeader.onContentChanged= function(isContentChanged){                                 //console.log("TDocStdTable.detailHeader.onContentChanged ",isContentChanged,this.getContentData());
                    //thisInstance.detailHTableSetDisabled(isContentChanged);
                    self.setToolPanesActions();
                };
                return this;
            },
            /**
             * param { reloadData, clearBeforeLoad }
             */
            setDetailHeaderContentByListSelectedRow: function(listSelectedFirstRowData,params){                 //console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow ",listSelectedFirstRowData, params);
                if(!this.detailHeader){ this.setToolPanesActions(); return; }
                if(!this.detailHeader.getDataUrl||!listSelectedFirstRowData){ this.detailHeader.setContentData(null); return; }
                var newID= listSelectedFirstRowData[this.detailHeader.dataIDName];                              //console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow newID=",newID);
                if(newID===null||newID===undefined){ this.detailHeader.setContentData(null); return; }
                var reloadData=(params&&params.reloadData==true)?true:false;
                if(this.detailHeader.getContentDataIDValue()===newID&&reloadData!==true) return;
                var clearBeforeLoad=(params&&params.clearBeforeLoad==true)?true:false;
                if(clearBeforeLoad===true) this.detailHeader.clearData();
                var detailHeaderGetDataConditions= {};
                detailHeaderGetDataConditions[(this.detailHeader.dataIDName+"=").replace("=","~")]=newID;       //console.log("TDocStdTable.setDetailHeaderContentByListSelectedRow this.detailHeader.loadDataFromUrl");
                if(this.detailHeader.getContentDataIDValue()!==newID&&this.detailHTable.getContent().length>0)
                    this.detailHTable.clearContent({callUpdateContent:false,resetSelection:false});
                this.detailHeader.loadDataFromUrl({url:this.detailHeader.getDataUrl, conditions:detailHeaderGetDataConditions});
            },
            loadDetailHeaderContentValuesFromServer: function(){
                if(!this.detailHeader.getDataForNewUrl) return;
                this.detailHeader.lastContentData=this.detailHeader.getContentData();
                this.detailHeader.loadDataFromUrl({url:this.detailHeader.getDataForNewUrl, condition:null, onlyValues:true});
            },
            storeDetailHeaderContentValues: function(){
                if(!this.detailHeader.postDataUrl) return;
                this.detailHeader.storeDataByUrl({url:this.detailHeader.postDataUrl, condition:null});
            },
            deleteDetailHeaderContent: function(){
                if(!this.detailHeader.postForDeleteDataUrl) return;
                this.detailHeader.deleteDataByUrl({url:this.detailHeader.postForDeleteDataUrl, onlyIDValue:true});
            },
            addDetailHeaderElement: function(newRow,obj){
                if(!this.detailHeaderElements) this.detailHeaderElements=[];
                if(this.detailHeaderElements.length==0||newRow) this.detailHeaderElements.push([]);
                if(obj) this.detailHeaderElements[this.detailHeaderElements.length-1].push(obj);
            },
            addDetailHeaderRow: function(height,createNewTable){
                if(!height) height=25;
                if(!this.detailHeaderTable || (this.detailHeaderTable&&createNewTable))
                    this.detailHeaderTable= $TDF.addTableTo(this.detailHeader.containerNode, "margin:0;border-collapse:separate;border-spacing:10px 0;");
                $TDF.addRowToTable(this.detailHeaderTable, height);
                this.addDetailHeaderElement(true);
                return this;
            },
            /**
             * params: {title, titleForNew, titleForNothing, titleForFailedLoad, numberDataItemName, dateDataItemName, titleDatePrefix}
             */
            addDetailHeaderTitle: function(detailHeaderTitleParams,height){
                if(!detailHeaderTitleParams.titleDatePrefix) detailHeaderTitleParams.titleDatePrefix=" ";
                this.detailHeaderTable= $TDF.addTableTo(this.detailHeader.containerNode, "padding:0;margin:0px;");
                $TDF.addRowToTable(this.detailHeaderTable, height);
                this.detailHeader.titleCell= $TDF.addHeaderCellToTableRow(this.detailHeaderTable.lastChild);
                this.addDetailHeaderElement(true,this.detailHeader.titleCell);
                this.detailHeader.setTitleContent= function(){
                    if(!this.titleCell) return;
                    if(this.getContentData()===undefined){
                        this.titleCell.innerHTML= "<span>"+detailHeaderTitleParams.titleForFailedLoad+"</span>";
                        return;
                    }
                    if(this.getContentData()===null){
                        this.titleCell.innerHTML= "<span>"+detailHeaderTitleParams.titleForNothing+"</span>";
                        return;
                    }
                    if(this.getContentData()&& (this.getContentDataIDValue()==undefined||this.getContentDataIDValue()==null)){
                        this.titleCell.innerHTML= "<span style='color:red;'>"+detailHeaderTitleParams.titleForNew+"</span>";
                        return;
                    }
                    this.titleCell.innerHTML= detailHeaderTitleParams.title;
                    if(detailHeaderTitleParams.numberDataItemName)
                        this.titleCell.innerHTML= this.titleCell.innerHTML
                            +" № "+this.getContentDataItem(detailHeaderTitleParams.numberDataItemName);
                    if(detailHeaderTitleParams.dateDataItemName)
                        this.titleCell.innerHTML= this.titleCell.innerHTML
                            +" "+detailHeaderTitleParams.titleDatePrefix
                            +" "+moment(this.getContentDataItem(detailHeaderTitleParams.dateDataItemName)).format("DD.MM.YYYY");
                };
                this.addDetailHeaderBtnUpdate();
                if(this.buttonPrint!=false&&!this.btnPrint) this.addDetailHeaderBtnPrint();
                //if(this.buttonExportToExcel!=false&&!this.btnExportToExcel) this.addBtnExportToExcel();
                return this;
            },
            addDetailHeaderBtnUpdate: function(width,labelText){
                if(width===undefined) width=200;
                if(!labelText) labelText="Обновить";
                this.detailHeader.btnUpdate= $TDF.addTableHeaderButtonTo(this.detailHeaderTable.lastChild, {labelText:labelText, cellWidth:width, cellStyle:"text-align:right;"});
                var thisInstance= this;
                this.detailHeader.btnUpdate.onClick= function(){
                    thisInstance.setDetailHeaderContentByListSelectedRow(thisInstance.detailHeader.lastContentData, {reloadData:true, clearBeforeLoad:true});
                };
                return this;
            },
            addDetailHeaderBtnPrint: function(width,labelText,printFormats){
                if(width===undefined) width=100;
                if(!this.detailHeader.btnUpdate) this.addBtnUpdate(width);
                if(!labelText) labelText="Печатать";
                this.detailHeader.btnPrint= $TDF.addTableHeaderButtonTo(this.detailHeaderTable.lastChild, {labelText:labelText, cellWidth:1, cellStyle:"text-align:right;"});
                var instance= this;
                this.detailHeader.btnPrint.onClick= function(){ instance.doPrint(); };
                return this;
            },
            /**
             * params={ style, inputStyle }
             */
            addDetailHeaderTextBox: function(itemName,label,cellWidth,params){
                if(!params) params= {};
                if(!params.inputStyle) params.inputStyle="";
                if(!params.style) params.style="";
                var textBox= $TDF.addTableCellTextBoxTo(this.detailHeaderTable.lastChild,
                    {cellWidth:cellWidth, labelText:label, labelStyle:params.style, inputStyle:params.style+params.inputStyle});
                this.detailHeader.addControlElementObject(textBox, itemName);
                this.addDetailHeaderElement(false,textBox);
                return this;
            },
            /**
             * params={ style, inputStyle, noPrevNextButtons }
             */
            addDetailHeaderDateTextBox: function(itemName,label,cellWidth,params){
                if(!params) params= {};
                if(!cellWidth)cellWidth=150;
                if(!params.inputStyle) params.inputStyle="";
                if(!params.style) params.style="";
                var dateBox= $TDF.addTableCellDateBoxTo(this.detailHeaderTable.lastChild,
                    {cellWidth:cellWidth, labelText:label, labelStyle:params.style, inputStyle:params.style+params.inputStyle,
                        noPrevNextButtons:params.noPrevNextButtons});
                this.detailHeader.addControlElementObject(dateBox, itemName);
                this.addDetailHeaderElement(false,dateBox);
                return this;
            },
            /**
             * params={ style, inputStyle, pattern }
             */
            addDetailHeaderNumberTextBox: function(itemName,label,cellWidth,params){
                if(!params) params={};
                if(!params.inputStyle) params.inputStyle="";
                if(!params.style) params.style="";
                if(!params.pattern||params.pattern.length==0) params.pattern="########0.00";
                var numberTextBox= $TDF.addTableCellNumberTextBoxTo(this.detailHeaderTable.lastChild,
                    { labelText:label, labelStyle:params.style, inputStyle:params.style+"text-align:right;"+params.inputStyle, cellWidth:cellWidth,
                        inputParams:{constraints:{pattern:params.pattern}} });
                this.detailHeader.addControlElementObject(numberTextBox, itemName);
                this.addDetailHeaderElement(false,numberTextBox);
                return this;
            },
            /**
             * params = { style, selectStyle, labelDataItem, loadDropDownURL }
             *      loadDropDownURL - URL returned data items for select drop-down list [{label,value},...]
             */
            addDetailHeaderSelect: function(itemName,label,cellWidth,params){
                if(!params) params={};
                if(!params.selectStyle) params.selectStyle="";
                if(!params.style) params.style="";
                var select= $TDF.addTableCellSelectTo(this.detailHeaderTable.lastChild,
                    { labelText:label, labelStyle:params.style, selectStyle:params.style+"text-align:right;"+params.selectStyle, cellWidth:cellWidth,
                        selectParams:{labelDataItem:params.labelDataItem,loadDropDownURL:params.loadDropDownURL} });
                this.detailHeader.addControlElementObject(select, itemName);
                this.addDetailHeaderElement(false,select);
                return this;
            },
            /**
             * parameters: { conditionIDName, getDataUrl, getDataURLCondition, storeDataUrl, deleteDataUrl }
             */
            setDetailTableParameters: function(parameters){
                if(parameters.conditionIDName) this.detailHTable.conditionIDName= parameters.conditionIDName;
                if(parameters.getDataUrl) this.detailHTable.getDataUrl=parameters.getDataUrl;
                if(parameters.getDataURLCondition) this.detailHTable.getDataURLCondition=parameters.getDataURLCondition;
                if(parameters.storeDataUrl) this.detailHTable.storeDataUrl=parameters.storeDataUrl;
                if(parameters.deleteDataUrl) this.detailHTable.deleteDataUrl=parameters.deleteDataUrl;
                var thisInstance= this;
                this.detailHTable.onUpdateContent= function(params){                                             console.log("TDocStdTable.detailHTable.onUpdateContent ",params);
                    if(params&&(params.updatedRows||params.deletedRows)){
                        var reloadData=false, storedRows=[];
                        if(params.deletedRows) reloadData=true;
                        if(!reloadData&&params.updatedRows)
                            for(var r in params.updatedRows){
                                var rowData= params.updatedRows[r];
                                if(!this.isRowEditable(rowData)){ reloadData=true; storedRows.push(rowData); }
                            }
                        if(reloadData){
                            thisInstance.loadListTableContentFromServer({callUpdateContent:false});
                            thisInstance.setDetailHeaderContentByListSelectedRow(thisInstance.detailHeader.lastContentData, {reloadData:reloadData});
                            thisInstance.detailHTable.updContentAutocompleteColumnsValues(storedRows);
                        }
                    }
                    if(!this.getSelectedRow() && this.getContent().length>0){
                        thisInstance.setDetailSubtotalContent();
                        this.setSelectedRowByIndex(0);
                        return;
                    }
                    var disableDetailSubtotalContent=false, headerIDValue= thisInstance.detailHeader.getContentDataIDValue();
                    if(headerIDValue===undefined||headerIDValue===null) disableDetailSubtotalContent=true;
                    thisInstance.setDetailSubtotalContent({disabled:disableDetailSubtotalContent,clearValue:disableDetailSubtotalContent});
                    thisInstance.setToolPanesActions();
                };
                this.detailHTable.onSelect= function(firstSelectedRowData,selection){                            console.log("TDocStdTable.detailHTable.onSelect ",firstSelectedRowData/*,selection*/);
                    this.setSelection(firstSelectedRowData, selection);                                         //console.log("TDocStdTable.detailHTable.onSelect ",this.getSelectedRowIndex());
                    thisInstance.setToolPanesActions();
                };
                this.detailHTable.onChangeRowData= function(changedRowData,changedRowIndex){                     console.log("TDocStdTable.detailHTable.onChangeRowData ",changedRowData);
                    thisInstance.setDetailSubtotalContent();
                };
                this.addDetailTableRowChangeAction(function(changedRowData,detailHTable,thisInstance,nextCallback){    //console.log("TDocStdTable detailTableRowChangeAction 1",changedRowData);
                    changedRowData.item(thisInstance.detailHTable.conditionIDName).setValue(thisInstance.detailHeader.getContentDataIDValue());
                    nextCallback();
                });
                return this;
            },
            loadDetailTableContentDataFromServer: function(){
                if(!this.detailHTable.getDataUrl){
                    this.setDetailSubtotalContent({disabled:true, clearValue:true});
                    this.setToolPanesActions();
                    return;
                }
                //this.setDetailSubtotalContent({clearValue:true});//clearing before setDetailSubtotalContent on this.detailHTable.onUpdateContent
                var conditions= this.detailHTable.getDataURLCondition, conditionIDValue= this.detailHeader.getContentDataIDValue();
                if(!conditions) conditions= {};
                if(conditionIDValue!==null&&conditionIDValue!==undefined&&this.detailHTable.conditionIDName)
                    conditions[(this.detailHTable.conditionIDName+"=").replace("=","~")]=conditionIDValue;
                this.detailHTable.setContentFromUrl({url:this.detailHTable.getDataUrl, conditions:conditions});
            },
            storeDetailTableSelectedRowValuesToServer: function(){
                this.detailHTable.storeSelectedRowDataByURL({url:this.detailHTable.storeDataUrl, condition:null});
            },
            storeDetailTableRowsDataToServer: function(rowsData){
                if(!rowsData) return;
                this.detailHTable.storeRowsDataByURL({url: this.detailHTable.storeDataUrl, condition: null, rowsData: rowsData});
            },
            deleteDetailTableSelectedRowFromServer: function(){
                this.detailHTable.deleteSelectedRowDataByURL({url:this.detailHTable.deleteDataUrl, condition:null});
            },
            /**
             * callback(changedRowData, thisInstance.detailHTable, thisInstance)
             */
            addDetailTableRowChangeAction: function(callback){
                if(!this.detailHTable.rowChangeCallbacks){
                    this.detailHTable.rowChangeCallbacks=[];
                    var thisInstance=this, thisInstanceDetailTable=this.detailHTable;

                    this.detailHTable.onChangeRowsData= function(changedRowsData){                                //console.log("TDocStdTable this.detailHTable.onChangeRowData",changedRowData);
                        var rowCallback= function(i, changedRowData, callUpdateContent, nextCallback){           //console.log("TDocStdTable this.detailHTable.onChangeRowsData rowCallback",i,changedRowData/*,nextCallback*/);
                            var rowNextCallback=thisInstance.detailHTable.rowChangeCallbacks[i];
                            if(rowNextCallback){
                                rowNextCallback(changedRowData, thisInstance.detailHTable, thisInstance,
                                    function(callUpdateContentNext){
                                        callUpdateContentNext= (callUpdateContentNext===undefined)? false : callUpdateContentNext;      //console.log("TDocStdTable this.detailHTable.onChangeRowData callback NEXT",changedRowData,callUpdateContentNext,callUpdateContent);
                                        rowCallback(i+1, changedRowData, callUpdateContent||callUpdateContentNext, nextCallback);
                                    });
                                return;
                            }
                            //if (callUpdateContent===true) thisInstanceDetailTable.handsonTable.render();//render after end row callbacks
                            nextCallback();
                        };
                        var rowsCallback= function(i, changedRowsData, callUpdateContent){                      //console.log("TDocStdTable this.detailHTable.onChangeRowData callback",changedRowData);
                            var changedRowData=changedRowsData[i];
                            if(changedRowData){
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
                this.detailHTable.rowChangeCallbacks.push(callback);
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
               if (!this.detailTotalTable || createNewTable) this.detailTotalTable=$TDF.addTableTo(this.detailTotal.domNode);
                $TDF.addRowToTable(this.detailTotalTable);
                this.addDetailTotalElement(true);
                return this;
            },
            addDetailTotalEmpty: function(cellWidth){
                $TDF.addLeftCellToTableRow(this.detailTotalTable.lastChild, cellWidth);
                return this;
            },
            /**
             * params { inputStyle, style, print:true/false }
             * default print!=false
             */
            addDetailTotalTextBox: function(label,cellWidth,itemName,params){
                var inputStyle="", style="";
                if(params&&params.inputStyle) inputStyle=params.inputStyle;
                if(params&&params.style) style=params.style;
                inputStyle= "font-weight:bold;"+inputStyle;
                var textBox= $TDF.addTableCellTextBoxTo(this.detailTotalTable.lastChild,
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
            addDetailTotalNumberTextBox: function(label,cellWidth,itemName,params){
                var inputStyle="", style="", pattern="########0.#########", printLabel=label;
                if(params&&params.inputStyle) inputStyle=params.inputStyle;
                if(params&&params.style) style=params.style;
                if(params&&params.pattern) pattern=params.pattern;
                if(params&&params.printLabel) printLabel=params.printLabel;
                var numberTextBox= $TDF.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
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
            addDetailSubTotalCountNumberTextBox: function(label,cellWidth,params){
                var inputStyle="", style="";
                if(params&&params.inputStyle) inputStyle=params.inputStyle;
                if(params&&params.style) style=params.style;
                var numberTextBox= $TDF.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;",
                        labelText:label, labelStyle:style, inputStyle:"text-align:right;"+style+inputStyle,
                        inputParams:{constraints:{pattern:"########0.#########"}, readOnly:true} });
                var thisInstance=this;
                numberTextBox.updateValue = function(params){
                    if(params&&params.disabled){ this.set("value", null); this.set("disabled", true); return; }
                    if(params&&params.clearValue){ this.set("value", null); return; }
                    this.set("disabled", false);
                    this.set("value", thisInstance.detailHTable.getContent().length);
                };
                if(!this.subTotals) this.subTotals=[];
                this.subTotals[this.subTotals.length]=numberTextBox;
                return this;
            },
            getDetailTableItemSum: function(tableItemName){
                return this.detailHTable.getContentItemSum(tableItemName);
            },
            /**
             * params { style, inputStyle, pattern }
             * default pattern="###,###,##0.#########"
             */
            addDetailSubtotalNumberTextBox: function(label,cellWidth,itemName,params){
                var inputStyle="", style="", pattern="###,###,##0.#########";
                if(params&&params.inputStyle) inputStyle=params.inputStyle;
                if(params&&params.style) style=params.style;
                if(params&&params.pattern) pattern=params.pattern;
                var numberTextBox= $TDF.addTableCellNumberTextBoxTo(this.detailTotalTable.lastChild,
                    {cellWidth:cellWidth, cellStyle:"text-align:right;",
                        labelText:label, labelStyle:style, inputStyle:"text-align:right;"+style+inputStyle,
                        inputParams:{constraints:{pattern:pattern}, readOnly:true} });
                var thisInstance=this;
                numberTextBox.updateValue= function(params){
                    if(params&&params.disabled){ this.set("value", null); this.set("disabled", true); return; }
                    if(params&&params.clearValue){ this.set("value", null); return; }
                    this.set("disabled", false);
                    this.set("value", thisInstance.getDetailTableItemSum(itemName));
                };
                if(!this.subTotals) this.subTotals=[];
                this.subTotals[this.subTotals.length]=numberTextBox;
                return this;
            },
            /**
             * params { disabled:true/false, clearValue:true/false }
             */
            setDetailSubtotalContent: function(params){                                                         //console.log("TDocStdTable setDetailSubtotalContent ",params);
                if(!this.subTotals) return;
                var disabled= false, clearValue=false;
                if(params&&params.disabled) disabled=params.disabled;
                if(params&&params.clearValue) clearValue=params.clearValue;
                for(var subtotalIndex in this.subTotals) this.subTotals[subtotalIndex].updateValue({clearValue:clearValue, disabled:disabled});
            },

            /**
             * params = { title, detailTableAction }
             * params.detailTableAction = function(params)
             * params.detailTableAction calls on this.detailHTable select row, or updated table content
             *  detailTableAction.params = { toolPaneContent,toolPaneContentDom, detailHeader, detailHTable, doc }
             *      detailHTable selected row:<detailHTable.getSelectedRow()>
             */
            addToolPane: function(params){
                if(!this.rightContainer){ console.log("WARNING! Failed addToolPane! Reason: no rightContainer!"); return this; }
                if(!params) params={};
                if(params.title===undefined) params.title="";
                if(params.width===undefined) params.width=100;
                var actionsTitlePane= $TDF.addChildTitlePaneTo(this.rightContainer,{title:params.title});
                if(params.detailTableAction) actionsTitlePane.contentAction = params.detailTableAction;
                if(!this.toolPanes) this.toolPanes= [];
                this.toolPanes.push(actionsTitlePane);
                $TDF.addTableTo(actionsTitlePane.containerNode);
                return this;
            },
            /**
             * contentAction = function(params),
             *      params= { toolPaneContent,toolPaneContentDom, detailHeader, detailHTable, doc }
             */
            addToolXPane: function(title,contentAction){
                if(!this.toolPanes) this.toolPanes= [];
                var actionsTitlePane= $TDF.addChildTitlePaneTo(this.rightContainer,{title:title});
                if(contentAction) actionsTitlePane.contentAction= contentAction;
                this.toolPanes.push(actionsTitlePane);
                actionsTitlePane.toolPaneContentWidget= new XContentPane({style:"margin:0;padding:0;"});
                actionsTitlePane.addChild(actionsTitlePane.toolPaneContentWidget);
                return this;
            },
            addToolInnerPage: function(title,contentAction){
                if(!this.toolPanes) this.toolPanes= [];
                var actionsTitlePane= $TDF.addChildTitlePaneTo(this.rightContainer,{title:title});
                if(contentAction) actionsTitlePane.contentAction= contentAction;
                this.toolPanes.push(actionsTitlePane);
                actionsTitlePane.toolPaneContentWidget= new window.InnerPage({style:"margin:0;padding:0;"});
                actionsTitlePane.addChild(actionsTitlePane.toolPaneContentWidget);
                return this;
            },
            setToolPanesContent: function(){
                if(!this.toolPanes) return;
                for(var tpInd=0;tpInd<this.toolPanes.length;tpInd++){
                    var toolPane= this.toolPanes[tpInd], tpContentAction= toolPane.contentAction;
                    if(!tpContentAction) continue;
                    var toolPaneContent= toolPane.toolPaneContentWidget||toolPane;
                    tpContentAction({toolPaneContent:toolPaneContent,toolPaneContentDom:toolPaneContent.domNode,
                        detailHeader:this.detailHeader,detailHTable:this.detailHTable,doc:this});
                }
            },
            addToolPaneBR: function(){
                var row= $TDF.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                $TDF.addLeftCellToTableRow(row).innerHTML="<br>";
                return this;
            },
            /**
             * actionParams = { btnStyle, btnParams, actionFunction, actionStateFunction, actionButtonName }
             *    actionFunction = function(actionParams), actionStateFunction = function(actionParams)
             *    actionParams = { detailHeader, detailHTable, toolPanes, thisDoc }
             *    use actionParams: detailHeader.getContentData(), detailHTable.getContent(), detailHTable.getContentEditableRows()
             *      detailHTable.updateRowsAction(rowsData, actionParams, actionFunction, finishedAction)
             */
            addToolPaneActionButton: function(label,actionParams){
                if(!this.toolPanes||this.toolPanes.length==0) this.addToolPane();
                var actionsTableRow= $TDF.addRowToTable(this.toolPanes[this.toolPanes.length-1].containerNode.lastChild);
                var actionButton= $TDF.addTableCellButtonTo(actionsTableRow, {labelText:label, cellWidth:0, btnStyle:actionParams.btnStyle, btnParameters:actionParams.btnParams});
                if(!this.toolPanesActionButtons) this.toolPanesActionButtons={};
                if(!actionParams.actionButtonName) actionParams.actionButtonName= actionButton.id;
                this.toolPanesActionButtons[actionParams.actionButtonName]= actionButton;
                var actionFunctionParams= { detailHeader:this.detailHeader, detailHTable:this.detailHTable, toolPanes:this.toolPanes, thisDoc:this };
                if(actionParams.actionFunction){
                    actionButton.actionFunction= actionParams.actionFunction;
                    actionButton.onClick= function(){ this.actionFunction(actionFunctionParams); };
                }else
                    actionButton.onClick= this.getOnClickAction(actionParams.actionButtonName);
                if(actionParams.actionStateFunction){
                    actionButton.actionStateFunction= actionParams.actionStateFunction;
                    actionButton.setState= function(){ this.actionStateFunction(actionFunctionParams); };
                }else
                    actionButton.setState= this.getSetStateAction(actionParams.actionButtonName);
                return this;
            },
            /**
             * actionButtonName: loadHeaderNewValues, storeHeaderValues, loadHeaderLastValues, deleteHeader,
             *              insertDetailTableRow, insertDetailTableCopySelectedRow,
             *              allowEditDetailTableSelectedRow, allowEditDetailTableAllVisibleRows,
             *              storeDetailTableSelectedRow, storeDetailTableAllEditableRows,
             *              deleteDetailTableSelectedRow,
             *              exportTableContentToExcel
             */
            getOnClickAction: function(actionButtonName){
                var thisInstance=this;
                if(actionButtonName==="loadHeaderNewValues"){
                    return function(){ thisInstance.loadDetailHeaderContentValuesFromServer(); }
                }else if(actionButtonName==="storeHeaderValues"){
                    return function(){ thisInstance.storeDetailHeaderContentValues(); }
                }else if(actionButtonName==="loadHeaderLastValues"){
                    return function(){ thisInstance.detailHeader.setContentData(thisInstance.detailHeader.lastContentData); }
                }else if(actionButtonName==="deleteHeader"){
                    return function(){ thisInstance.deleteDetailHeaderContent(); }
                }else if(actionButtonName==="insertDetailTableRow"){
                    return function(){
                        thisInstance.detailHTable.insertRowAfterSelected();
                        thisInstance.detailHTable.setSelectedRowByIndex(thisInstance.detailHTable.getSelectedRowIndex()+1);
                    }
                }else if(actionButtonName==="insertDetailTableCopySelectedRow"){
                    return function(){ thisInstance.detailHTable.insertRowAfterSelected(thisInstance.detailHTable.getSelectedRow()); }
                }else if(actionButtonName==="allowEditDetailTableSelectedRow"){
                    return function(){ thisInstance.detailHTable.allowEditSelectedRow(); }
                }else if(actionButtonName==="allowEditDetailTableAllVisibleRows"){
                    return function(){ thisInstance.detailHTable.allowEditRows(thisInstance.detailHTable.getContent()); }
                }else if(actionButtonName==="storeDetailTableSelectedRow"){
                    return function(){ thisInstance.storeDetailTableSelectedRowValuesToServer(); }
                }else if(actionButtonName==="storeDetailTableAllEditableRows"){
                    return function(){ thisInstance.storeDetailTableRowsDataToServer(thisInstance.detailHTable.getContentEditableRows()); }
                }else if(actionButtonName==="deleteDetailTableSelectedRow"){
                    return function(){ thisInstance.deleteDetailTableSelectedRowFromServer(); }
                }else if(actionButtonName==="exportTableContentToExcel"){
                    return function(){ thisInstance.exportTableContentToExcel(); }
                }else return function(){};
            },
            getSetStateAction: function(actionButtonName){
                var thisInstance=this;
                if(actionButtonName==="storeHeaderValues"){
                    return function(){
                        if(thisInstance.detailHeader.getContentData()&&thisInstance.detailHeader.isContentChanged()) this.setDisabled(false);
                        else this.setDisabled(true);
                    }
                }else if(actionButtonName==="loadHeaderLastValues"){
                    return function(){
                        if(thisInstance.detailHeader.getContentData()&&thisInstance.detailHeader.isContentChanged()) this.setDisabled(false);
                        else this.setDisabled(true);
                    }
                }else if(actionButtonName==="deleteHeader"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader,detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if( detailHeaderContentData && detailHTable.getData()
                                && thisInstance.detailHeaderEditableChecker() && detailHTable.getData().length==0)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="insertDetailTableRow"||actionButtonName==="insertDetailTableCopySelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged()
                                && thisInstance.detailTableEditableChecker())
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="allowEditDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged()
                                && detailHTable.getSelectedRow()&& !detailHTable.isSelectedRowEditable()
                                && thisInstance.detailTableEditableChecker())
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="allowEditDetailTableAllVisibleRows"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged()
                                && thisInstance.detailTableEditableChecker() && detailHTable.getContent().length>0)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="storeDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged() && detailHTable.isSelectedRowEditable())
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="storeDetailTableAllEditableRows"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged() && detailHTable.getContentEditableRows().length>0)
                            this.setDisabled(false);
                        else
                            this.setDisabled(true);
                    }
                }else if(actionButtonName==="deleteDetailTableSelectedRow"){
                    return function(){
                        var detailHeader=thisInstance.detailHeader, detailHTable=thisInstance.detailHTable,
                            detailHeaderContentData=detailHeader.getContentData();
                        if(detailHeaderContentData && !detailHeader.isContentChanged() && detailHTable.getSelectedRow()
                                && thisInstance.detailTableEditableChecker())
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
            addToolPaneFileUploader: function(params,callback){
                if(!this.toolPanes || this.toolPanes.length == 0) this.addToolPane();
                var actionsTableRow = $TDF.addRowToTable(this.toolPanes[this.toolPanes.length - 1].containerNode.lastChild),
                    tableCell = $TDF.addLeftCellToTableRow(actionsTableRow);
                if(!this.uploadBtn){
                    this.uploadBtn= new Uploader({
                        label: params.label, url: params.url, enctype: "multipart/form-data",
                        type: "file", uploadOnSelect: true, name: params.name, multiple: false
                    });
                    this.uploadBtn.startup();
                    if(params.acceptFileExt) this.uploadBtn.domNode.firstChild.setAttribute("accept",params.acceptFileExt);
                    if(params.btnStyle) this.uploadBtn.set("style", params.btnStyle);
                    var thisInstance = this;
                    this.uploadBtn.onComplete= function(result){ callback(result, thisInstance); this.reset(); };
                    tableCell.appendChild(this.uploadBtn.domNode);
                }
                return this;
            },
            setToolPanesActionButtonsState: function(){
                for(var btnAction in this.toolPanesActionButtons){
                    var actionBtn=this.toolPanesActionButtons[btnAction];
                    if(actionBtn.setState) actionBtn.setState();
                }
            },
            setToolPanesActions: function(){
                this.setToolPanesContent();
                this.setToolPanesActionButtonsState();
            },

            /**
             * actionParams: {action, rowPosName, rowPosIndexName}
             */
            addDetailTableMenuItemAction: function(itemName,actionParams,menuItemAction){
                if(!itemName||!actionParams) return this;
                var menuItemCallback, thisInstance=this;
                if(actionParams.action==="insertDetailTableRowsAfterSelected"){
                    menuItemCallback= function(selRowsData){
                        var count=0;
                        if(selRowsData.length>0){
                            for(var rowIndex in selRowsData) count++;
                            thisInstance.detailHTable.insertRowsAfterSelected(count);//, actionParams.rowPosName,actionParams.rowPosIndexName
                        } else
                            thisInstance.detailHTable.insertRowAfterSelected();
                    }
                }else if(actionParams.action==="allowEditDetailTableSelectedRows"){
                    menuItemCallback= function(selRowsData){ thisInstance.detailHTable.allowEditRows(selRowsData); }
                }else if(actionParams.action==="storeDetailTableSelectedRows"){
                    menuItemCallback= function(selRowsData){ thisInstance.storeDetailTableRowsDataToServer(selRowsData); }
                }
                if(menuItemCallback) this.detailHTable.setMenuItem(itemName, null, menuItemCallback);
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
            addDetailTableRowAction: function(actionName,actionParams,tableRowAction){
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
            addDetailTableRowsAction: function(actionName,actions){
                if(!actions) return this;
                if(!this.detailTableActions) this.detailTableActions={};
                this.detailTableActions[actionName]= {
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
                var thisInstance=this, thisDetailTable= this.detailHTable;
                if(!actionParams) actionParams={};
                actionParams.detailTableInstance=thisDetailTable;
                actionParams.toolPanes=thisInstance.toolPanes;
                actionParams.thisInstance=thisInstance;
                var menuItemActionFunction;
                if(actionParams.actionFunction){
                    menuItemActionFunction= actionParams.actionFunction;
                }else{
                    var detailTableRowAction= this.detailTableActions[actionParams.detailTableActionName],
                        detailTableRowsActionFunction;
                    if(detailTableRowAction&&detailTableRowAction.startActionFunction&&detailTableRowAction.tableRowActionFunction){
                        detailTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            detailTableRowAction.startActionFunction(rowsDataForAction, actionParams,
                                /*startDetailTableRowsAction*/function(){
                                    thisInstance.detailHTable.updateRowsAction(rowsDataForAction, actionParams,
                                        detailTableRowAction.tableRowActionFunction, detailTableRowAction.endActionFunction);
                                });
                        };
                    }else if(detailTableRowAction&&detailTableRowAction.tableRowActionFunction){
                        detailTableRowsActionFunction=function(rowsDataForAction, actionParams){
                            thisInstance.detailHTable.updateRowsAction(rowsDataForAction, actionParams,
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
                    }else if(detailTableRowsActionFunction){
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

            doPrint: function(){                                                                                //console.log("TDocStdTable.doPrint ",this);
                var printData= {}, headerTextStyle= "font-size:14px;";
                if(this.detailHeaderElements){
                    for(var ri=0;ri<this.detailHeaderElements.length;ri++){
                        var detHRow=this.detailHeaderElements[ri];
                        $TDF.addPrintDataItemTo(printData,"header",{newTable:true,style:headerTextStyle});
                        for(var ci=0;ci<detHRow.length;ci++){
                            var detHElem= detHRow[ci];                                                          //console.log("TDocStdTable.doPrint ",ri,ci,detHElem);
                            if(detHElem.tagName&&detHElem.tagName==="TH")
                                $TDF.addPrintDataSubItemTo(printData, "header",
                                    {label:detHElem.innerText, width:0, align:"center",
                                        style:"width:100%;font-size:14px;font-weight:bold;text-align:center;",
                                        contentStyle:"margin-top:5px;margin-bottom:3px;"});
                            else{
                                value=null;
                                if(detHElem.textbox) value= detHElem.textbox.value;
                                else if(detHElem.textDirNode) value= detHElem.textDirNode.textContent;//if element Select
                                var printParams= detHElem.printParams;
                                if(value==""){
                                  if(printParams.inputStyle){
                                      var oldStyleStr =printParams.inputStyle,
                                          newStyleStr= (oldStyleStr.trim().charAt(oldStyleStr.length-1)!=";")?";":"";
                                      newStyleStr+="height:14px;";
                                      printParams.inputStyle = oldStyleStr+newStyleStr;
                                  }else
                                      printParams.inputStyle= " height:14px;";
                                }
                                $TDF.addPrintDataSubItemTo(printData,"header",{width:printParams.cellWidth+5,
                                    style:printParams.printStyle, align:"left", contentStyle:"margin-bottom:3px;",
                                    label:printParams.labelText,
                                    value:value, type:"text", valueStyle:printParams.inputStyle});
                            }
                        }
                        $TDF.addPrintDataSubItemTo(printData,"header");
                    }
                }
                printData.columns = this.detailHTable.getVisibleColumns();
                printData.data = this.detailHTable.getData();
                var totalStyle="font-size:12px;";
                if(this.detailTotalElements){
                    for(var ri=0;ri<this.detailTotalElements.length;ri++){
                        var detTRow=this.detailTotalElements[ri];
                        $TDF.addPrintDataItemTo(printData,"total",{newTable:true, style:totalStyle});
                        $TDF.addPrintDataSubItemTo(printData,"total");
                        for(var ci=0;ci<detTRow.length;ci++){
                            var detTElem=detTRow[ci], value=null;                                               //console.log("TDocStdTable.doPrint ",ri,ci,detTElem);
                            if(detTElem.print===false) continue;
                            if(detTElem.textbox) value= detTElem.textbox.value;
                            else if(detTElem.textDirNode) value= detTElem.textDirNode.textContent;//if element Select
                            var printParams= detTElem.printParams;                                               //console.log("printParams",printParams);
                            if(value==""){
                                if(printParams.inputStyle){
                                    var oldStyleStr= printParams.inputStyle,
                                        newStyleStr= (oldStyleStr.trim().charAt(oldStyleStr.length-1)!=";")?";":"";
                                    newStyleStr+= "height:14px;";
                                    printParams.inputStyle= oldStyleStr+newStyleStr;
                                }else
                                    printParams.inputStyle= " height:14px;";
                            }
                            $TDF.addPrintDataSubItemTo(printData,"total",{width:printParams.cellWidth+5, align:"right",
                                style:printParams.printStyle||printParams.style, contentStyle:"margin-top:3px;",
                                label:printParams.labelText, labelStyle:printParams.labelStyle,
                                value:value, type:"text", valueStyle:printParams.inputStyle});
                        }
                    }
                }
                $TDF.setPrintDataFormats(printData,this.printFormats);
                var printWindow= window.open("/print/printDocSimpleTable");                                     //console.log("doPrint printWindow printData=",printData);
                printWindow["printDocSimpleTableData"]= printData;
            },
            exportTableContentToExcel: function(){
                this.requestForExcelFile({tableData:this.detailHTable.getContent(), visibleColumns:this.detailHTable.getVisibleColumns()});
            },
            startupDoc: function(){
                this.layout();
                if(this.listTable) this.loadListTableContentFromServer();
                this.startedUp=true;
                return this;
            }
        })
    });