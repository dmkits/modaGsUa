/**
 * Created by dmkits on 16.02.17.
 */
define(["dojo/_base/declare", "hTableSimple"], function(declare, HTableSimple){
    return declare("HTableSimpleFiltered", [HTableSimple], {
        useFilters: false,
        filtered: false,
        globalFilter:{ value:null },
        constructor: function(args,parentName){
            this.useFilters= false;
            this.filtered= false;
            this.globalFilter= { value:null };
            declare.safeMixin(this,args);
        },
        setHandsonTableFilterSettings: function () {
            if(this.useFilters!==true) return;
            var lblGlobalFilter= document.createElement("label"); this.globalFilter.label=lblGlobalFilter;
            lblGlobalFilter.innerHTML="Фильтр по таблице:"; lblGlobalFilter.className = "changeTypeLbl";
            var inputGlobalFilter = document.createElement("input"); this.globalFilter.input=inputGlobalFilter;
            inputGlobalFilter.id = "inputGlobalFilter"; inputGlobalFilter.className = "changeTypeC";
            this.globalFilter.setGlobalFilter=function(value){
                if(value!==null&&value.length>0){
                    this.value= value.trim();
                    this.input.classList.add("changeTypeAccent"); this.label.classList.add("changeTypeAccent");
                } else {
                    this.value= null; this.input.value=null;
                    this.input.classList.remove("changeTypeAccent"); this.label.classList.remove("changeTypeAccent");
                }
            };
            var thisGlobalFilter= this.globalFilter;
            inputGlobalFilter.onblur=function(){                                                                        //console.log("HTableSimpleFiltered inputGlobalFilter.onblur ");
                this.value=thisGlobalFilter.value;
            };
            inputGlobalFilter.onkeypress=function(event){                                                               //console.log("HTableSimpleFiltered inputGlobalFilter.onkeypress ",event);
                if(event.key==="Enter") {                                                                               //console.log("HTableSimpleFiltered inputGlobalFilter.onkeypress key=",event.key);
                    thisGlobalFilter.setGlobalFilter(this.value);
                    parent.onUpdateContent({filtered:parent.filterContentData()});
                }
            };
            var clearAllFiltersButton = document.createElement('BUTTON'); clearAllFiltersButton.id = "clearAllFiltersButton";
            clearAllFiltersButton.innerHTML = "\u2612 Снять фильтры"; clearAllFiltersButton.className = "changeTypeC";
            this.setAddingHeaderRow({"label":lblGlobalFilter, "input":inputGlobalFilter, "button":clearAllFiltersButton});
            var handsontableSettings= this.handsonTable.getSettings();
            var parent= this;
            handsontableSettings.colHeadersFilterButton= function (colIndex) {
                if(parent.useFilters!=true) return "";
                if(parent.htVisibleColumns&&parent.htVisibleColumns[colIndex]&&parent.htVisibleColumns[colIndex].useFilter===false) return "";
                var filterButton = document.createElement('BUTTON');
                filterButton.id = "filter_button_for_col_"+colIndex; filterButton.innerHTML = "\u25BC"; filterButton.className = "changeType";
                if (this.columns[colIndex]["filtered"]==true) filterButton.style.color = 'black'; else filterButton.style.color = '#bbb';
                filterButton.setAttribute("colindex",colIndex);
                return filterButton.outerHTML;
            };
            handsontableSettings.colHeaders= function(colIndex){
                return "<span style=\"float:right\">"+this.colHeadersFilterButton(colIndex)+"</span><span>"+this.getColumnHeader(colIndex)+"</span>";
            };
            //this.handsonTable.updateSettings({
            //    afterGetColHeader:function(col, TH) {                             console.log("afterGetColHeader",col,TH);
            //    }
            //    //afterRenderer:function(TD, row, col, prop, value, cellProperties) {                             console.log("afterRenderer",TD,row,col);
            //    //
            //    //}
            //});
            this.handsonTable.updateSettings({
                beforeOnCellMouseDown:function(event, coords, element) {
                    if(event.target.id.indexOf("filter_menu")<0)/*filter menu closed if filter button focusout*/
                        parent.handsonTable.hideFilterMenu();
                    if(element.tagName==="TH") { event.stopImmediatePropagation(); }//disable column header click event
                }
            });
            Handsontable.Dom.addEvent(document, 'focusin', function (event) {                                           //console.log("HTableSimpleFiltered document focus target=", event.target);
                if(event.target.id.indexOf("filter_menu_")<0)/*filter menu closed if filter menu item element focusout*/
                    parent.handsonTable.hideFilterMenu();
            });
            Handsontable.Dom.addEvent(document, 'mousedown', function (event) {                                         //console.log("HTableSimpleFiltered document mousedown target=",event.target);
                if(event.target.id.indexOf("filter_button_for_")>=0) event.stopPropagation();
                if(event.target.id.indexOf("filter_menu_")<0)/*filter menu closed if filter button focusout*/
                    parent.handsonTable.hideFilterMenu();
            });
            var thisGlobalFilter=this.globalFilter;
            Handsontable.Dom.addEvent(this.handsonTable.rootElement, 'mouseup', function (event) {                      //console.log("HTableSimpleFiltered mouseup ",event);
                if(event.target.id.indexOf("filter_button_for_")>=0){
                    var button= event.target;
                    parent.handsonTable.showFilterMenu(button);
                }
                if(event.target.id.indexOf("clearAllFiltersButton")>=0) {
                    thisGlobalFilter.setGlobalFilter(null);
                    parent.clearDataColumnsFilters();
                    parent.onUpdateContent({filtered:parent.filterContentData()});
                }
            });
            this.handsonTable.showFilterMenu= function (button) {                                                       //console.log("HTableSimpleFiltered.handsonTable.showFilterMenu ",this);
                var filterMenu = this.filterMenu;
                //if(filterMenu&&filterMenu.isOpen==true&&filterMenu.colProp==colProp){//close filter menu
                //    this.hideFilterMenu(); return;
                //}
                var colIndex = button.getAttribute("colindex");
                var colProp= this.colToProp(colIndex), colData= this.getDataAtCol(colIndex);
                var colProps = this.getSettings().columns[colIndex];
                var colType= colProps["type"], filterValue = colProps["filterValue"], filterValues = colProps["filterValues"];
                var filterItemsMap={};
                for(var i in colData){ var filterItemValue= colData[i]; if(filterItemValue==null)filterItemValue=""; filterItemsMap[filterItemValue]=true; }
                if(colProps["filtered"]==true&&filterValues){
                    for(var filterValueItem in filterValues)
                        if (filterValues[filterValueItem]==false){ filterItemsMap[filterValueItem]=false; }
                }
                var filterItems = [];
                for(var item in filterItemsMap){ filterItems[filterItems.length]=item; }
                if(colType=="text"&&filterItems.length==0) return;

                if(!filterMenu) {
                    filterMenu = document.createElement('UL');
                    filterMenu.id = "filter_menu"; filterMenu.className = "changeTypeMenu";
                    this.filterMenu = filterMenu; filterMenu.filterButton=button;
                    document.body.appendChild(filterMenu);
                    var menuBtnOkOnClick= function(filterMenu){
                        if(!filterMenu) return;
                        var filterColProps= filterMenu.colProps, filterValues= filterColProps["filterValues"];
                        var filtered = false;
                        if(filterMenu.valueType=="text") {
                            if(filterMenu.valueEdit) {
                                if(filterMenu.valueEdit.value=="") filterColProps["filterValue"]=null;
                                else {
                                    filterColProps["filterValue"]= filterMenu.valueEdit.value;
                                    filtered=true;
                                    for(var filterMenuItemName in filterMenu.valueItems) {
                                        var filterMenuItem=filterMenu.valueItems[filterMenuItemName];
                                        filterMenuItem.checked= filterMenuItem.value.toString().indexOf(filterMenu.valueEdit.value)>=0;
                                    }
                                }
                            }
                            for(var filterMenuItemName in filterMenu.valueItems) {
                                var filterMenuItem = filterMenu.valueItems[filterMenuItemName];
                                var filterItemValue=filterMenuItem["value"];
                                filterValues[filterItemValue]=filterMenuItem.checked;
                            }
                            for(var filterMenuItemName in filterMenu.valueItems)
                                if(filterMenu.valueItems[filterMenuItemName].checked==false){ filtered=true; break; }
                        } else if(filterMenu.valueType=="numeric") {
                            for(var filterValueItem in filterValues) filterValues[filterValueItem]= null;
                            if(filterMenu.valueEdit.value!="") {
                                var filterEditValues = filterMenu.valueEdit.value, filterValueNum=1;
                                while(filterEditValues.length>0){
                                    var posDelimiter = filterEditValues.indexOf(","); if(posDelimiter<0) posDelimiter=filterEditValues.length;
                                    var filterEditValueItem = filterEditValues.substring(0,posDelimiter);
                                    var posInterval= filterEditValueItem.indexOf("-");
                                    if(posInterval<0){
                                        var filterValueItem= parseFloat(filterEditValueItem);
                                        if(!isNaN(filterValueItem)) filterValues["value_"+filterValueNum] = filterValueItem;
                                    } else {
                                        filterValues["value_"+filterValueNum] = [];
                                        var filterEditValueItemFrom= parseFloat(filterEditValueItem.substring(0,posInterval));
                                        if(!isNaN(filterEditValueItemFrom)) filterValues["value_"+filterValueNum]["from"] = filterEditValueItemFrom;
                                        var filterEditValueItemTo= parseFloat(filterEditValueItem.substring(posInterval+1,filterEditValueItem.length));
                                        if(!isNaN(filterEditValueItemTo)) filterValues["value_"+filterValueNum]["to"] = filterEditValueItemTo;
                                    }
                                    filterEditValues= filterEditValues.substring(posDelimiter+1,filterEditValues.length);
                                    filterValueNum++;
                                }
                            }
                            for(var filterValueItem in filterValues) if(filterValues[filterValueItem]!=null) { filtered= true; break; }
                        }
                        filterColProps["filtered"]= filtered;
                        if (filtered==true) filterMenu.filterButton.style.color = 'black'; else filterMenu.filterButton.style.color = '#bbb';
                        parent.handsonTable.hideFilterMenu();
                        parent.onUpdateContent({filtered:parent.filterContentData()});
                    };
                    Handsontable.Dom.addEvent(filterMenu, 'click', function (event) {/*menu item click*/                //console.log("HTableSimpleFiltered.handsonTable.showFilterMenu filterMenu click ",event.target);
                        var eventTarget = event.target, eventTargetID = event.target.id;
                        if (eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonCancel")>0) {   //console.log("HTableSimpleFiltered.handsonTable.showFilterMenu filterMenu click filter_menu_item_ buttonCancel", event.target);
                            var filterColProps= eventTarget.filterMenu.colProps;
                            filterColProps["filterValues"]=[];
                            if(eventTarget.filterMenu.valueType=="text") filterColProps["filterValue"]= null;
                            filterColProps["filtered"]= false;
                            eventTarget.filterButton.style.color = '#bbb';
                            parent.handsonTable.hideFilterMenu();
                            parent.onUpdateContent({filtered:parent.filterContentData()});
                        } else if (eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonOK")>0) { //console.log("HTableSimpleFiltered.handsonTable.showFilterMenu filterMenu click filter_menu_item_ buttonOK", event.target);
                            menuBtnOkOnClick(eventTarget.filterMenu);
                        } else if (eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonClearAll")>0) {
                            if(eventTarget.filterMenu.valueItems){
                                for(var filterValueItemName in eventTarget.filterMenu.valueItems)
                                    eventTarget.filterMenu.valueItems[filterValueItemName].checked = false;
                            }
                        } else if (eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonClear")>0) {
                            if(eventTarget.filterMenu.valueEdit) eventTarget.filterMenu.valueEdit.value="";
                        }
                    });
                    filterMenu.onkeyup=function(event){
                        if(event.key=='Enter'&&(event.code=='Enter'||event.code=='NumpadEnter')) {
                            if(event.target&&event.target.filterMenu)
                            menuBtnOkOnClick(event.target.filterMenu);
                        }
                        if(event.key=='Escape'&&event.code=='Escape')parent.handsonTable.hideFilterMenu();
                    };
                }
                button.onkeyup=function(event){
                    if(event.key=='Escape'&&event.code=='Escape')parent.handsonTable.hideFilterMenu();
                };
                filterMenu.style.display = 'block'; filterMenu.isOpen = true;
                var position = button.getBoundingClientRect();
                filterMenu.style.top = (position.top + (window.scrollY || window.pageYOffset)) + 2 + 'px';
                filterMenu.style.left = (position.left) + 'px';
                filterMenu.colProp = colProp; filterMenu.colType = colType; filterMenu.colProps = colProps;
                while(filterMenu.firstChild) filterMenu.removeChild(filterMenu.firstChild);
                filterMenu.valueType = colType; filterMenu.valueEdit = null; filterMenu.valueItems = [];

                filterItems = filterItems.sort();
                var createMenuItem = function(filterMenu,idPostfix,itemType, filterMenuItemData){
                    var filterMenuItem = document.createElement("LI");
                    filterMenuItem["id"]= "filter_menu_item_"+idPostfix; filterMenuItem["filterMenu"] = filterMenu;

                    filterMenu.appendChild(filterMenuItem);
                    var filterMenuElem,filterMenuElemLabel;
                    if(itemType=="button"){
                        filterMenuElem = document.createElement("input"); filterMenuElem.type = "button"; filterMenuElem.id = "filter_menu_item_elem_"+idPostfix;
                        filterMenuElem.value = filterMenuItemData.label;
                        filterMenuElem.style.width = "120px";
                        filterMenuElem.filterButton = button; filterMenuElem.filterMenu = filterMenu;
                        filterMenuItem.appendChild(filterMenuElem);
                    } else if(itemType=="edit") {
                        filterMenuElem = document.createElement("input"); filterMenuElem.type = "text"; filterMenuElem.id = "filter_menu_item_elem_"+idPostfix;
                        filterMenuElem.value= filterMenuItemData.value; filterMenuElem.filterMenu = filterMenu; filterMenu.valueEdit= filterMenuElem;
                        filterMenuElemLabel = document.createElement("label"); filterMenuElemLabel.id = "filter_menu_item_elem_label_"+idPostfix;
                        filterMenuElemLabel.htmlFor = filterMenuElem.id; filterMenuElemLabel.appendChild(document.createTextNode(filterMenuItemData.label));
                        filterMenuItem.appendChild(filterMenuElemLabel);filterMenuItem.appendChild(filterMenuElem);
                    } else if(itemType=="checkboxlist"){
                        var filterMenuItemElemsContainer = document.createElement("div"); filterMenuItemElemsContainer.id="filter_menu_item_elem_divcontainer"+idPostfix;
                        filterMenuItemElemsContainer.style.maxHeight = "250px";filterMenuItemElemsContainer.style.maxWidth = "350px";
                        filterMenuItemElemsContainer.style.overflow= "auto";
                        filterMenuItem.appendChild(filterMenuItemElemsContainer);
                        for(var i in filterMenuItemData.values){
                            var filterMenuItemElemDIV = document.createElement("div");filterMenuItemElemDIV.id="filter_menu_item_elem_div"+idPostfix+"_"+i;
                            filterMenuItemElemsContainer.appendChild(filterMenuItemElemDIV);
                            var elemValue = filterMenuItemData.values[i];
                            filterMenuElem = document.createElement("input"); filterMenuElem.type = "checkbox"; filterMenuElem.id = "filter_menu_item_elem_"+idPostfix+"_"+i;
                            filterMenuElem.value= elemValue; filterMenuElem.checked= filterMenuItemData.isValueChecked[elemValue]!=false;
                            filterMenuElem.filterMenu = filterMenu; filterMenu.valueItems[idPostfix+"_"+i] = filterMenuElem;
                            filterMenuElemLabel = document.createElement("label"); filterMenuElemLabel.id = "filter_menu_item_elem_label_"+idPostfix+"_"+i;
                            if(elemValue=="")elemValue="(Без значения)";
                            filterMenuElemLabel.htmlFor = filterMenuElem.id;
                            var filterMenuElemLabelText=elemValue; //
                            filterMenuElemLabel.appendChild(document.createTextNode(filterMenuElemLabelText));
                            filterMenuElem.label = filterMenuElemLabel;
                            filterMenuItemElemDIV.appendChild(filterMenuElem); filterMenuItemElemDIV.appendChild(filterMenuElemLabel);
                        }
                    }
                    return filterMenuItem;
                };
                createMenuItem(filterMenu,colProp+"_buttonCancel","button", {label:"Снять фильтр"});
                if(colType=="text"){
                    createMenuItem(filterMenu,colProp+"_buttonClear","button",{label:"Очистить значение"});
                    if(!filterValue)filterValue="";
                    createMenuItem(filterMenu,colProp+"edit","edit",{label:"Значение: ",value:filterValue});
                    createMenuItem(filterMenu,colProp+"_buttonClearAll","button",{label:"Снять все отметки"});
                    createMenuItem(filterMenu,colProp+"_checkboxlist","checkboxlist",{values:filterItems,isValueChecked:filterValues});
                } else if(colType=="numeric"){
                    createMenuItem(filterMenu,colProp+"_buttonClear","button",{label:"Очистить значение"});
                    var filterEditValue = "";
                    for(var filterMenuItem in filterValues){
                        var filterValue= filterValues[filterMenuItem];
                        if(filterMenuItem.indexOf("value_")>=0&&filterValue!=null) {
                            if(filterEditValue.length>0) filterEditValue=filterEditValue+",";
                            if(filterValue instanceof Array){
                                filterEditValue= filterEditValue+filterValue["from"]+"-"+filterValue["to"];
                            } else filterEditValue= filterEditValue+filterValue;
                        }
                    }
                    createMenuItem(filterMenu,colProp+"edit","edit",{label:"Значение: ",value:filterEditValue});
                }
                createMenuItem(filterMenu,colProp+"_buttonOK","button",{label:"Применить фильтр"});
            };
            this.handsonTable.hideFilterMenu= function () {//close filter menu
                var filterMenu = this.filterMenu;
                if(filterMenu){ filterMenu.isOpen= false; filterMenu.style.display = 'none'; }
            };
        },
        postCreate : function(){
            this.createHandsonTable();
            this.setHandsonTableFilterSettings();
        },
        clearDataColumnsFilters: function(){
            for(var colIndex in this.htVisibleColumns) {
                var colData= this.htVisibleColumns[colIndex];
                if (colData&&colData["filtered"]) {
                    colData["filterValue"]=null;
                    colData["filterValues"]=[];
                    colData["filtered"]=false;
                }
            }
        },
        setDataColumns: function(newDataColumns){                                                                       //console.log("HTableSimpleFiltered setDataColumns",newDataColumns,this.getHandsonTable().view);//this.domNode.firstChild.childNodes[1]
            if(!newDataColumns) {
                this.htColumns=[]; this.htVisibleColumns = [];
                return;
            }
            var existsVisibleDataColumns= this.htVisibleColumns;
            this.htColumns = newDataColumns;
            this.htVisibleColumns= this.getVisibleColumnsFrom(newDataColumns);
            for(var colIndex in this.htVisibleColumns) {
                var colData= this.htVisibleColumns[colIndex];
                var colDataName= colData.name, findedColData;
                if (existsVisibleDataColumns)
                    for(var eColIndex in existsVisibleDataColumns){
                        var existsColData=existsVisibleDataColumns[eColIndex];
                        if (existsColData.name==colDataName) {
                            findedColData=existsColData;
                            break;
                        }
                    }
                if (findedColData&&findedColData["filterValues"]) {
                    colData["filterValue"]=findedColData["filterValue"];
                    colData["filterValues"]=findedColData["filterValues"];
                    colData["filtered"]=findedColData["filtered"];
                } else if (!colData["filterValues"]) colData["filterValues"] = [];
            }
        },
        filterContentData: function(){                                                                                  //console.log("HTableSimpleFiltered filterContentData globalFilter=",this.globalFilter);
            var filtered=false;
            if (!this.htData||this.htData.length==0){
                this.handsonTable.updateSettings(
                    {columns:this.htVisibleColumns, data:this.getData(), readOnly:this.readOnly, comments:this.enableComments}
                );
                return filtered;
            }
            var htVisColumns= this.htVisibleColumns, filteredData=[], globalFilterValue=this.globalFilter.value;
            for(var rowInd=0; rowInd<this.htData.length; rowInd++){
                var rowData=this.htData[rowInd];
                if(!rowData) continue;
                var rowVisible=true, rowVisibleByGlobalFilter=(globalFilterValue!==null)?false:true;
                for(var colIndex in htVisColumns){
                    var colProps = htVisColumns[colIndex], colPropName = colProps["data"], dataItemVal = rowData[colPropName], itemVisible=true;
                    var colFiltered= colProps["filtered"];
                    if(colFiltered==true){
                        itemVisible= false;
                        if(dataItemVal==null) dataItemVal="";
                        if(colProps["type"]=="text"&&dataItemVal!==undefined){
                            if(colProps["filterValue"]&&dataItemVal.toString().indexOf(colProps["filterValue"])>=0) itemVisible=true;
                            if(colProps["filterValues"]&&colProps["filterValues"][dataItemVal.toString()]===true) itemVisible=true;
                        } else if(colProps["type"]=="numeric"&&dataItemVal!==undefined&&colProps["filterValues"]) {
                            var numericFilterValues = colProps["filterValues"];
                            for(var numericFilterValuesItem in numericFilterValues){
                                var numericFilterValue = numericFilterValues[numericFilterValuesItem];
                                if(numericFilterValue instanceof Array){
                                    if(numericFilterValue["from"]&&numericFilterValue["to"]
                                        &&dataItemVal>=numericFilterValue["from"]&&dataItemVal<=numericFilterValue["to"]){
                                        itemVisible= true; break;
                                    } else if(numericFilterValue["from"]&&!numericFilterValue["to"]&&dataItemVal>=numericFilterValue["from"]){
                                        itemVisible= true; break;
                                    } else if(!numericFilterValue["from"]&&numericFilterValue["to"]&&dataItemVal<=numericFilterValue["to"]){
                                        itemVisible= true; break;
                                    }
                                } else if(numericFilterValue==dataItemVal){
                                    itemVisible= true; break;
                                }
                            }
                        }
                        if(globalFilterValue!==null && !rowVisibleByGlobalFilter && itemVisible==true) {
                            var sdataItemVal=(dataItemVal)?dataItemVal.toString():"", sGlobalFilterVal=globalFilterValue.toString();
                            if(sdataItemVal===sGlobalFilterVal||sdataItemVal.indexOf(" "+sGlobalFilterVal+" ")>=0) rowVisibleByGlobalFilter= true;
                        }
                    } else if(globalFilterValue!==null && !rowVisibleByGlobalFilter) {                                  //console.log("HTableSimpleFiltered filterContentData globalFilterValue=",globalFilterValue,dataItemVal);
                        var sdataItemVal=(dataItemVal)?dataItemVal.toString():"", sGlobalFilterVal=globalFilterValue.toString();
                        if(sdataItemVal===sGlobalFilterVal||sdataItemVal.indexOf(" "+sGlobalFilterVal+" ")>=0) rowVisibleByGlobalFilter= true;
                    }
                    rowVisible=rowVisible&&itemVisible;
                }
                rowVisible=rowVisible&&rowVisibleByGlobalFilter;
                filtered=filtered||!rowVisible;
                if (rowVisible) filteredData.push(rowData);
            }
            this.handsonTable.updateSettings(
                {columns:this.htVisibleColumns, data:filteredData, readOnly:this.readOnly, comments:this.enableComments}
            );
            return filtered;
        },
        /**
         * calls on load/set/reset data to table or on change data after store
         * params= { callOnUpdateContent=true/false, resetSelection=true/false }
         * default params.resetSelection!=false
         * if params.resetSelection==false not call resetSelection
         * default params.callOnUpdateContent!=false
         * if params.callOnUpdateContent==false not call onUpdateContent
         */
        updateContent: function(newdata,params) {                                                                       //console.log("HTableSimpleFiltered updateContent newdata=",newdata," params=", params);
            if(newdata!==undefined) {
                this.setData(newdata);
            }
            var filtered=false;
            if(this.htData!==null) {//loadTableContent
                filtered= this.filterContentData();
                if(params.resetSelection!==false) this.resetSelection();
            } else {//clearTableDataContent
                this.clearContent();
            }
            if (params.callOnUpdateContent===false) return;
            this.onUpdateContent({filtered:filtered});
        },
        /**
         * param = { updatedRows, filtered }
         * param.updatedRows has values if call updateRowData
         * param.filtered = true if in table use columns filters or global filter
         */
        onUpdateContent: function(params){                                                                              //console.log("HTableSimpleFiltered onUpdateContent params=",params);
            //TODO actions on/after update table content (after set/reset/reload/clear table content data)
            //TODO actions and after call updateRowData({rowData,newRowData})
            //TODO actions after set/clear table filters
        }
    });
});