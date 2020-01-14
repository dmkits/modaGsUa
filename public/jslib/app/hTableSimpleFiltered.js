/**
 * Created by dmkits on 16.02.17.
 */
define(["dojo/_base/declare", "app/hTableSimple"], function(declare, HTableSimple){
    return declare("HTableSimpleFiltered", [HTableSimple], {
        useFilters: false,
        filtered: false,
        globalFilter:{ value:null },
        constructor: function(args){
            this.useFilters= false;
            this.filtered= false;
            this.globalFilter= { value:null };
            declare.safeMixin(this,args);
        },
        postCreate: function(){
            this.setConentStyle();
            this.createHandsonTable();
            this.setHandsonTableFilterSettings();
        },
        setHandsonTableFilterSettings: function(){
            if(this.useFilters===false) return;
            var lblGlobalFilter= document.createElement("label"); this.globalFilter.label=lblGlobalFilter;
            lblGlobalFilter.innerHTML="Фильтр по таблице:"; lblGlobalFilter.className="addedHeaderGlobalFilterLbl";
            lblGlobalFilter.setAttribute("for",this.id+"_inputGlobalFilter");
            var inputGlobalFilter = document.createElement("input"); this.globalFilter.input=inputGlobalFilter;
            inputGlobalFilter.id = this.id+"_inputGlobalFilter"; inputGlobalFilter.className="addedHeaderGlobalFilter";
            this.globalFilter.setGlobalFilter=function(value){
                if(value!==null&&value.length>0){
                    this.value= value.trim();
                    this.input.classList.add("addedHeaderGlobalFilterInUse"); this.label.classList.add("addedHeaderGlobalFilterInUse");
                }else{
                    this.value= null; this.input.value=null;
                    this.input.classList.remove("addedHeaderGlobalFilterInUse"); this.label.classList.remove("addedHeaderGlobalFilterInUse");
                }
            };
            var thisGlobalFilter= this.globalFilter, parent=this;
            inputGlobalFilter.onblur=function(){ this.value=thisGlobalFilter.value; };
            inputGlobalFilter.onkeypress=function(event){
                if(event.key==="Enter"){ thisGlobalFilter.setGlobalFilter(this.value); parent.updateContent(); }
            };
            var btnClearAllFilters= document.createElement('BUTTON'); btnClearAllFilters.id="btnClearAllFilters";
            btnClearAllFilters.innerHTML="\u2612 Снять фильтры"; btnClearAllFilters.className="addedHeaderGlobalFilter";
            this.setAddingHeaderRow(
                function(){ parent.updateContent(); },
                {"label":lblGlobalFilter, "input":inputGlobalFilter, "button":btnClearAllFilters}
            );
            var handsontableSettings= this.handsonTable.getSettings();
            handsontableSettings.colHeadersFilterButton= function(colIndex){
                if(!this.columns||parent.useFilters!=true) return "";
                var colData= this.columns[colIndex];
                if(!colData||(colData&&colData.useFilter===false)) return "";
                var filterButton= document.createElement('BUTTON');
                filterButton.id="filter_button_for_col_"+colIndex; filterButton.innerHTML="\u25BC"; filterButton.className="hTableColFilterBtn";
                if(colData["filtered"]==true) filterButton.style.color='black'; else filterButton.style.color='#bbb';
                filterButton.setAttribute("colindex",colIndex);
                return filterButton.outerHTML;
            };
            handsontableSettings.colHeaders= function(colIndex){
                return "<span style=\"float:right\">"+this.colHeadersFilterButton(colIndex)+"</span><span>"+this.getColumnHeader(colIndex)+"</span>";
            };
            //this.handsonTable.updateSettings({
            //    afterGetColHeader:function(col, TH) {                                                     console.log("afterGetColHeader",col,TH);
            //    }
            //    //afterRenderer:function(TD, row, col, prop, value, cellProperties) {                     console.log("afterRenderer",TD,row,col);
            //    //
            //    //}
            //});
            this.handsonTable.updateSettings({
                beforeOnCellMouseDown:function(event,coords,element){
                    if(event.target.id.indexOf("filter_menu")<0) {/*popup and filter menu closed if filter button focusout*/
                        parent.closePopupMenuHTableColumns();
                        parent.handsonTable.hideFilterMenu();
                    }
                    if(!element)return;
                    if(element.tagName==="TH"&&element.className=="addedHeaderTH") { event.stopImmediatePropagation(); }//disable added header click event
                }
            });
            Handsontable.dom.addEvent(this.handsonTable.rootElement,'focusin',function(event){
                if(event.target.id.indexOf("filter_menu_")<0) {/*popup and filter menu closed if filter menu item element focusout*/
                    parent.closePopupMenuHTableColumns();
                    parent.handsonTable.hideFilterMenu();
                }
            });
            Handsontable.dom.addEvent(this.handsonTable.rootElement,'mousedown',function(event){
                if(event.target.id.indexOf("filter_button_for_")>=0) event.stopPropagation();
                if(event.target.id.indexOf("filter_menu_")<0) {/*popup and filter menu closed if filter button focusout*/
                    parent.closePopupMenuHTableColumns();
                    parent.handsonTable.hideFilterMenu();
                }
            });
            var thisGlobalFilter=this.globalFilter;
            Handsontable.dom.addEvent(this.handsonTable.rootElement,'mouseup',function(event){
                if(event.target.id.indexOf("filter_button_for_")>=0){
                    var button= event.target;
                    parent.closePopupMenuHTableColumns();
                    parent.handsonTable.showFilterMenu(button);
                }
                if(event.target.id.indexOf("btnClearAllFilters")>=0){
                    thisGlobalFilter.setGlobalFilter(null);
                    parent.clearDataColumnsFilters();
                    parent.updateContent();
                }
            });
            this.handsonTable.showFilterMenu= function(button){
                var filterMenu= this.filterMenu;
                //if(filterMenu&&filterMenu.isOpen==true&&filterMenu.colProp==colProp){//close filter menu
                //    this.hideFilterMenu(); return;
                //}
                var colIndex = button.getAttribute("colindex"), colProp= this.colToProp(colIndex), colData= this.getDataAtCol(colIndex),
                    colProps = this.getSettings().columns[colIndex],
                    colType= colProps["type"], filterValue = colProps["filterValue"], filterValues = colProps["filterValues"],
                    filterItemsMap={};
                for(var i in colData){ var filterItemValue= colData[i]; filterItemValue=filterItemValue||""; filterItemsMap[filterItemValue]=true; }
                if(colProps["filtered"]==true&&filterValues){
                    for(var filterValueItem in filterValues)
                        if(filterValues[filterValueItem]==false){ filterItemsMap[filterValueItem]=false; }
                }
                var filterItems=[];
                for(var item in filterItemsMap) filterItems.push(item);
                if(colType=="text"&&filterItems.length==0) return;

                if(!filterMenu){
                    filterMenu= document.createElement('UL'); filterMenu.id= "filter_menu"; filterMenu.className= "hTablePopupMenu";
                    this.filterMenu= filterMenu; filterMenu.filterButton=button;
                    document.body.appendChild(filterMenu);
                    var menuBtnOkOnClick= function(filterMenu){
                        if(!filterMenu) return;
                        var filterColProps= filterMenu.colProps, filterValues= filterColProps["filterValues"], filtered=false;
                        if(filterMenu.valueType=="text"){
                            if(filterMenu.valueEdit){
                                if(filterMenu.valueEdit.value=="") filterColProps["filterValue"]=null;
                                else{
                                    filterColProps["filterValue"]= filterMenu.valueEdit.value;
                                    filtered=true;
                                    for(var filterMenuItemName in filterMenu.valueItems){
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
                        }else if(filterMenu.valueType=="numeric"){
                            for(var filterValueItem in filterValues) filterValues[filterValueItem]= null;
                            if(filterMenu.valueEdit.value!="") {
                                var filterEditValues = filterMenu.valueEdit.value, filterValueNum=1;
                                while(filterEditValues.length>0){
                                    var posDelimiter = filterEditValues.indexOf(","); if(posDelimiter<0) posDelimiter=filterEditValues.length;
                                    var filterEditValueItem = filterEditValues.substring(0,posDelimiter), posInterval= filterEditValueItem.indexOf("-");
                                    if(filterEditValueItem.indexOf("<")==0){
                                        filterValues["value_"+filterValueNum] = {};
                                        var filterEditValueItemToVal= parseFloat(filterEditValueItem.substring(1,filterEditValueItem.length));
                                        if(!isNaN(filterEditValueItemToVal)) filterValues["value_"+filterValueNum]["less"] = filterEditValueItemToVal;
                                    }else if(posInterval<0){
                                        var filterValueItem= parseFloat(filterEditValueItem);
                                        if(!isNaN(filterValueItem)) filterValues["value_"+filterValueNum] = filterValueItem;
                                    }else{
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
                            for(var filterValueItem in filterValues) if(filterValues[filterValueItem]!=null){ filtered= true; break; }
                        }
                        filterColProps["filtered"]= filtered;
                        if (filtered==true) filterMenu.filterButton.style.color='black'; else filterMenu.filterButton.style.color='#bbb';
                        parent.closePopupMenuHTableColumns();
                        parent.handsonTable.hideFilterMenu();
                        parent.updateContent();
                    };
                    Handsontable.Dom.addEvent(filterMenu,'click',function(event){/*menu item click*/
                        var eventTarget = event.target, eventTargetID = event.target.id;
                        if(eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonCancel")>0){
                            var filterColProps= eventTarget.filterMenu.colProps;
                            filterColProps["filterValues"]=[];
                            if(eventTarget.filterMenu.valueType=="text") filterColProps["filterValue"]= null;
                            filterColProps["filtered"]= false;
                            eventTarget.filterButton.style.color='#bbb';
                            parent.closePopupMenuHTableColumns();
                            parent.handsonTable.hideFilterMenu();
                            parent.updateContent();
                        }else if(eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonOK")>0){
                            menuBtnOkOnClick(eventTarget.filterMenu);
                        }else if(eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonClearAll")>0){
                            if(eventTarget.filterMenu.valueItems){
                                for(var filterValueItemName in eventTarget.filterMenu.valueItems)
                                    eventTarget.filterMenu.valueItems[filterValueItemName].checked = false;
                            }
                        }else if(eventTargetID.indexOf("filter_menu_item_elem_")==0&&eventTargetID.indexOf("buttonClear")>0){
                            if(eventTarget.filterMenu.valueEdit) eventTarget.filterMenu.valueEdit.value="";
                        }
                    });
                    filterMenu.onkeyup= function(event){
                        if(event.key=='Enter'&&(event.code=='Enter'||event.code=='NumpadEnter')){
                            if(event.target&&event.target.filterMenu)
                            menuBtnOkOnClick(event.target.filterMenu);
                        }
                        if(event.key=='Escape'&&event.code=='Escape')parent.handsonTable.hideFilterMenu();
                    };
                }
                button.onkeyup= function(event){
                    if(event.key=='Escape'&&event.code=='Escape'){
                        parent.closePopupMenuHTableColumns();
                        parent.handsonTable.hideFilterMenu();
                    }
                };
                filterMenu.style.display='block'; filterMenu.isOpen=true;
                var position= button.getBoundingClientRect();
                filterMenu.style.top= (position.top + (window.scrollY || window.pageYOffset)) + 2 + 'px';
                filterMenu.style.left= (position.left) + 'px';
                filterMenu.colProp= colProp; filterMenu.colType= colType; filterMenu.colProps= colProps;
                while(filterMenu.firstChild) filterMenu.removeChild(filterMenu.firstChild);
                filterMenu.valueType= (colType=="autocomplete")?"text":colType;
                filterMenu.valueEdit=null; filterMenu.valueItems=[];

                filterItems = filterItems.sort();
                var createMenuItem = function(filterMenu,idPostfix,itemType, filterMenuItemData){
                    var filterMenuItem = document.createElement("LI");
                    filterMenuItem["id"]= "filter_menu_item_"+idPostfix; filterMenuItem["filterMenu"]= filterMenu;
                    filterMenu.appendChild(filterMenuItem);
                    var filterMenuElem,filterMenuElemLabel;
                    if(itemType=="button"){
                        filterMenuElem = document.createElement("input"); filterMenuElem.type = "button"; filterMenuElem.id = "filter_menu_item_elem_"+idPostfix;
                        filterMenuElem.value = filterMenuItemData.label;
                        filterMenuElem.style.width = "120px";
                        filterMenuElem.filterButton = button; filterMenuElem.filterMenu = filterMenu;
                        filterMenuItem.appendChild(filterMenuElem);
                    }else if(itemType=="edit"){
                        filterMenuElem = document.createElement("input"); filterMenuElem.type = "text"; filterMenuElem.id = "filter_menu_item_elem_"+idPostfix;
                        filterMenuElem.value= filterMenuItemData.value; filterMenuElem.filterMenu = filterMenu; filterMenu.valueEdit= filterMenuElem;
                        filterMenuElemLabel = document.createElement("label"); filterMenuElemLabel.id = "filter_menu_item_elem_label_"+idPostfix;
                        filterMenuElemLabel.htmlFor = filterMenuElem.id; filterMenuElemLabel.appendChild(document.createTextNode(filterMenuItemData.label));
                        filterMenuItem.appendChild(filterMenuElemLabel);filterMenuItem.appendChild(filterMenuElem);
                    }else if(itemType=="checkboxlist"){
                        var filterMenuItemElemsContainer = document.createElement("div"); filterMenuItemElemsContainer.id="filter_menu_item_elem_divcontainer"+idPostfix;
                        filterMenuItemElemsContainer.style.maxHeight="250px";filterMenuItemElemsContainer.style.maxWidth="350px";
                        filterMenuItemElemsContainer.style.overflow="auto";
                        filterMenuItem.appendChild(filterMenuItemElemsContainer);
                        for(var i in filterMenuItemData.values){
                            var filterMenuItemElemDIV = document.createElement("div");filterMenuItemElemDIV.id="filter_menu_item_elem_div"+idPostfix+"_"+i;
                            filterMenuItemElemsContainer.appendChild(filterMenuItemElemDIV);
                            var elemValue= filterMenuItemData.values[i];
                            filterMenuElem= document.createElement("input"); filterMenuElem.type="checkbox"; filterMenuElem.id="filter_menu_item_elem_"+idPostfix+"_"+i;
                            filterMenuElem.value= elemValue; filterMenuElem.checked= filterMenuItemData.isValueChecked[elemValue]!=false;
                            filterMenuElem.filterMenu = filterMenu; filterMenu.valueItems[idPostfix+"_"+i] = filterMenuElem;
                            filterMenuElemLabel = document.createElement("label"); filterMenuElemLabel.id = "filter_menu_item_elem_label_"+idPostfix+"_"+i;
                            if(elemValue=="")elemValue="(Без значения)";
                            filterMenuElemLabel.htmlFor = filterMenuElem.id;
                            var filterMenuElemLabelText=elemValue;
                            filterMenuElemLabel.appendChild(document.createTextNode(filterMenuElemLabelText));
                            filterMenuElem.label = filterMenuElemLabel;
                            filterMenuItemElemDIV.appendChild(filterMenuElem); filterMenuItemElemDIV.appendChild(filterMenuElemLabel);
                        }
                    }
                    return filterMenuItem;
                };
                createMenuItem(filterMenu,colProp+"_buttonCancel","button", {label:"Снять фильтр"});
                if(colType=="text"||colType=="autocomplete"){
                    createMenuItem(filterMenu,colProp+"_buttonClear","button",{label:"Очистить значение"});
                    if(!filterValue)filterValue="";
                    createMenuItem(filterMenu,colProp+"_edit","edit",{label:"Значение: ",value:filterValue});
                    createMenuItem(filterMenu,colProp+"_buttonClearAll","button",{label:"Снять все отметки"});
                    createMenuItem(filterMenu,colProp+"_checkboxlist","checkboxlist",{values:filterItems,isValueChecked:filterValues});
                }else if(colType=="numeric"){
                    createMenuItem(filterMenu,colProp+"_buttonClear","button",{label:"Очистить значение"});
                    var filterEditValue = "";
                    for(var filterMenuItem in filterValues){
                        var filterValue= filterValues[filterMenuItem];
                        if(filterMenuItem.indexOf("value_")>=0&&filterValue!=null) {
                            if(filterEditValue.length>0) filterEditValue=filterEditValue+",";
                            if(filterValue instanceof Array){
                                filterEditValue= filterEditValue+filterValue["from"]+"-"+filterValue["to"];
                            } else if(filterValue&&typeof(filterValue)=="object"&&filterValue["less"]!==undefined&&filterValue["less"]!==null){
                                filterEditValue= filterEditValue+"<"+filterValue["less"];
                            } else filterEditValue= filterEditValue+filterValue;
                        }
                    }
                    createMenuItem(filterMenu,colProp+"edit","edit",{label:"Значение: ",value:filterEditValue});
                }
                createMenuItem(filterMenu,colProp+"_buttonOK","button",{label:"Применить фильтр"});
            };
            this.handsonTable.hideFilterMenu= function(){//close filter menu
                var filterMenu = this.filterMenu;
                if(filterMenu){ filterMenu.isOpen= false; filterMenu.style.display = 'none'; }
            };
        },
        clearDataColumnsFilters: function(){
            for(var colIndex in this.htColumns){
                var colData= this.htColumns[colIndex];
                if(colData&&colData["filtered"]){ colData["filterValue"]=null; colData["filterValues"]=[]; colData["filtered"]=false; }
            }
        },
        setDataColumns: function(newDataColumns){
            var existsDataColumns= this.htColumns;
            this.inherited(arguments,[newDataColumns]);
            for(var colIndex in this.htColumns){
                var colData= this.htColumns[colIndex], colDataName= colData.name, findedColData;
                if(existsDataColumns)
                    for(var eColIndex in existsDataColumns){
                        var existsColData=existsDataColumns[eColIndex];
                        if(existsColData.name==colDataName){ findedColData=existsColData; break; }
                    }
                if(findedColData&&findedColData["filterValues"]){
                    colData["filterValue"]= findedColData["filterValue"];
                    colData["filterValues"]= findedColData["filterValues"];
                    colData["filtered"]= findedColData["filtered"];
                }else if(!colData["filterValues"]) colData["filterValues"]=[];
            }
        },
        filterContentData: function(){
            if(!this.htData||this.htData.length==0) return null;
            var filtered=false;
            var htColumns= this.htColumns, filteredData=[], globalFilterValue=this.globalFilter.value;
            for(var rowInd=0; rowInd<this.htData.length; rowInd++){
                var rowData= this.htData[rowInd];
                if(!rowData) continue;
                var rowVisible=true, rowVisibleByGlobalFilter=(globalFilterValue!==null)?false:true;
                for(var colIndex in htColumns){
                    var colProps = htColumns[colIndex];
                    if(colProps&&colProps.visible===false)continue;
                    var colPropName = colProps["data"], colType = colProps["type"], dataItemVal = rowData[colPropName], itemVisible=true;
                    var colFiltered= colProps["filtered"];
                    if(colFiltered==true){
                        itemVisible= false;
                        if(dataItemVal==null) dataItemVal="";
                        if((colType=="text"||colType=="autocomplete")&&dataItemVal!==undefined){
                            if(colProps["filterValue"]&&dataItemVal.toString().indexOf(colProps["filterValue"])>=0) itemVisible=true;
                            if(colProps["filterValues"]&&colProps["filterValues"][dataItemVal.toString()]===true) itemVisible=true;
                        }else if(colType=="numeric"&&dataItemVal!==undefined&&colProps["filterValues"]) {
                            var numericFilterValues = colProps["filterValues"];
                            for(var numericFilterValuesItem in numericFilterValues){
                                var numericFilterValue = numericFilterValues[numericFilterValuesItem];
                                if(numericFilterValue instanceof Array){
                                    if(numericFilterValue["from"]&&numericFilterValue["to"]
                                        &&dataItemVal>=numericFilterValue["from"]&&dataItemVal<=numericFilterValue["to"]){
                                        itemVisible= true; break;
                                    }else if(numericFilterValue["from"]&&!numericFilterValue["to"]&&dataItemVal>=numericFilterValue["from"]){
                                        itemVisible= true; break;
                                    }else if(!numericFilterValue["from"]&&numericFilterValue["to"]&&dataItemVal<=numericFilterValue["to"]){
                                        itemVisible= true; break;
                                    }
                                }else if(numericFilterValue&&typeof(numericFilterValue)=="object"){
                                    if(numericFilterValue["less"]&&dataItemVal<numericFilterValue["less"]){ itemVisible= true; break; }
                                }else if(numericFilterValue==dataItemVal){
                                    itemVisible= true; break;
                                }
                            }
                        }
                        if(globalFilterValue!==null && !rowVisibleByGlobalFilter && itemVisible==true){
                            var sdataItemVal=(dataItemVal)?dataItemVal.toString():"", sGlobalFilterVal=globalFilterValue.toString();
                            if(sdataItemVal===sGlobalFilterVal||sdataItemVal.indexOf(" "+sGlobalFilterVal+" ")>=0) rowVisibleByGlobalFilter= true;
                        }
                    }else if(globalFilterValue!==null && !rowVisibleByGlobalFilter){
                        var sdataItemVal=(dataItemVal)?dataItemVal.toString():"", sGlobalFilterVal=globalFilterValue.toString();
                        if(sdataItemVal===sGlobalFilterVal||sdataItemVal.indexOf(" "+sGlobalFilterVal+" ")>=0) rowVisibleByGlobalFilter= true;
                    }
                    rowVisible=rowVisible&&itemVisible;
                }
                rowVisible=rowVisible&&rowVisibleByGlobalFilter;
                filtered=filtered||!rowVisible;
                if(rowVisible) filteredData.push(rowData);
            }
            return (filtered)?filteredData:null;
        },
        /**
         * calls on load/set/reset data to table or on change data after store
         * params= { callUpdateContent=true/false, resetSelection=true/false }
         * default params.resetSelection!=false
         * if params.resetSelection==false not call resetSelection
         * default params.callUpdateContent!=false
         * if params.callUpdateContent==false not call onUpdateContent
         */
        updateContent: function(newdata,params){                                                                console.log("HTableSimpleFiltered updateContent newdata=",newdata,"params=",params);
            if(newdata!==undefined) this.setData(newdata);
            if(!params)params={};
            if(this.htData===null){//clearTableDataContent
                this.clearContent(params);
                this.setMenuItemHTableColumns();
                return;
            }
            //loadTableContent
            var filteredData= this.filterContentData(), newContent= filteredData||this.htData, thisHTable=this;
            this.handsonTable.updateSettings({
                columns:this.htColumns, manualColumnResize:false,colWidths:this.colWidths,
                data:newContent, readOnly:this.readOnly, comments:this.enableComments
            });
            this.handsonTable.updateSettings({manualColumnResize:true});
            this.setMenuItemHTableColumns(function(){ thisHTable.updateContent(); });
            if(params.resetSelection!==false) this.resetSelection();
            if(params.callUpdateContent===false) return;
            var onUpdateParams={filtered:filteredData!=null};
            if(params&&params.error) onUpdateParams.error=params.error;
            this.onUpdateContent(onUpdateParams);
        },
        /**
         * param = { error, updatedRows, filtered }
         * param.error exists if request error in call setContentFromUrl
         * param.updatedRows exists if call updateRowData
         * param.filtered = true if in table use columns filters or global filter
         */
        onUpdateContent: function(params){
            //TODO actions on/after update table content (after set/reset/reload/clear table content data)
            //TODO actions and after call updateRowData({rowData,newRowData})
            //TODO actions after set/clear table filters
        }
    });
});