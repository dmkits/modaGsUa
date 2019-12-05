var framework7MUIFunctions= {
    init: function(app7){
        app7.srvRequestJSON= this.srvRequestJSON;
        app7.srvPostRequestJSON= this.srvPostRequestJSON;
        app7.innerPageCreateTableRow= this.innerPageCreateTableRow;
        app7.innerPageUpdateTotalTable= this.innerPageUpdateTotalTable;
        app7.innerPageFillTableData= this.innerPageFillTableData;
        app7.fillInnerPageTableDataProgress= this.fillInnerPageTableDataProgress;
    },
    /**
     * params = { method, url, data/conditions, showRequestErrorDialog, errorDialogMsg }
     * default: params.method="GET", params.showRequestErrorDialog = true
     * resultCallback = function(result, errorMessage)
     *  result = undefined if request failed
     *  result = null if response result is empty or response result error (parameter errorMessage exists)
     *  result = JSON response result if request success and response result is JSON
     *  errorMessage exists if request failed or response result contains error
     */
    srvRequestJSON: function(params,callback){
        if(!params)return;
        if(!params.method)params.method="GET";
        if((!window.origin||window.origin=="null"||window.origin.indexOf("file")==0)&&params.url) params.url= app7.data['serverURI']+params.url;
        var requestData={};
        if(params.data)requestData=params.data;
        else if(params.conditions&&typeof(params.conditions)=="string") requestData=params.conditions.replace('=','~');
        else if(params.conditions)
            for(var cName in params.conditions) requestData[cName.replace('=','~')]=params.conditions[cName];   //console.log('srvRequestJSON app7.request',params.url,'requestData=',requestData);
        this.request({method:params.method,url:params.url,data:requestData,
            headers:{ 'x-requested-with': 'application/json; charset=utf-8' },
            success:function(data){                                                                             //console.log('srvRequestJSON app7.request',params.url,'success data=',data);
                var errMsg;
                if(!params.errorDialogMsg)params.errorDialogMsg='Не удалось получить данные с сервера!';
                if(data==undefined||data==null) {
                    if(params.showRequestErrorDialog==false){ callback(null, null);return; }
                    errMsg=params.errorDialogMsg;
                }
                var jsonData;
                try{
                    jsonData=JSON.parse(data);
                }catch (e) {
                    errMsg=params.errorDialogMsg+'<br>Данные некорректные!';
                }
                if(jsonData&&jsonData.error){
                    if(typeof(jsonData.error)=="string")errMsg= jsonData.errorMessage||jsonData.error;
                    else errMsg= (jsonData.error.userMessage||jsonData.error.message||jsonData.error.error);
                    errMsg=params.errorDialogMsg+"<br>"+errMsg;
                }
                if(errMsg&&params.showRequestErrorDialog==false){ callback(null, errMsg);return; }
                if(errMsg&&app7.srvRequestJSONDialogErr){ app7.srvRequestJSONDialogErr.open(); return; }
                else if(errMsg){
                    app7.srvRequestJSONDialogErr = app7.dialog.alert(errMsg,"Внимание",function(){
                        app7.srvRequestJSONDialogErr = null;
                        callback(null, errMsg);
                    });
                    return;
                }                                                                                           //console.log('srvRequestJSON app7.request',params.url,'success jsonData=',jsonData);
                callback(jsonData);
            },
            error:function(xhr, status){                                                                    //console.log('srvRequestJSON app7.request',params.url,'error err=',xhr);
                var state=status,
                    msg=(!params.errorDialogMsg)?'Не удалось получить данные с сервера!':params.errorDialogMsg;
                if(params.showRequestErrorDialog==false){
                    callback(undefined,msg+"<br>Статус="+state);return;
                }
                if(state===0){
                    msg+="<br>Неправильный или недействительный адрес сервера"+
                        "<br>или доступ по указанному адресу сервера запрещен.";
                } else
                    msg+="<br>Не удалось установить связь с сервером по указанному адресу.";
                if(app7.srvRequestJSONDialogErr){
                    app7.srvRequestJSONDialogErr.open(); return;
                }
                app7.srvRequestJSONDialogErr=app7.dialog.alert(msg,"Внимание",function(){
                    app7.srvRequestJSONDialogErr=null;
                    callback(undefined,msg);
                });
            }
        });
    },

    /**
     * params = { url, data, showRequestErrorDialog, errorDialogMsg }
     * default: params.showRequestErrorDialog = true
     * resultCallback = function(result, errorMessage)
     *  result = undefined if request failed
     *  result = null if response result is empty or response result error (parameter errorMessage exists)
     *  result = JSON response result if request success and response result is JSON
     *  errorMessage exists if request failed or response result contains error
     */
    srvPostRequestJSON: function(params,callback){
        if(!params)return;
        params.method="POST";
        if(!params.errorDialogMsg)params.errorDialogMsg="Не удалось получить результат операции с сервера!";
        this.srvRequestJSON(params,callback);
    },
    /** IT'S USED IN INNER PAGE TEMPLATES
     * contentTableHeader =
     * <table width="100%" style="position:fixed; top:104px; z-index: 100">
     *     <thead>
     *         <tr>
     *             <th width="40px">№<br>п/п</th>
     *             <th>Наименование товара<br>Штрихкод</th>
     *             <th width="50px">Ед.<br>изм.</th>
     *             <th width="50px">Уч.<br>кол-во</th>
     *             <th width="50px">Факт.<br>кол-во</th>
     *         </tr>
     *     </thead>
     *     <tbody style="display:none">
     *         <tr rowSelecting="true">
     *             <td rowSpan="2" width="40px" class="tdSrcPosID" dataItemName="TSrcPosID"></td>
     *             <td colSpan="4" class="tdProdName" dataItemName="ProdName"></td>
     *         </tr>
     *         <tr rowSelecting="true" onCreated="contentTableTROnCreated" onClick="contentTableTROnClick">
     *             <td dataItemName="Barcode"></td>
     *             <td width="50px" class="text-centered" dataItemName="UM"></td>
     *             <td width="50px" class="tdQty" dataItemName="TQty"><div class="table-text"></div></td> -- variant with inner div with data
     *             <td width="50px" class="tdNewQty" dataItemName="TNewQty"
     *                  onCreated="contentTableTDNewQtyOnCreated" onClick="contentTableTDNewQtyOnClick"></td>
     *         </tr>
     *     </tbody>
     * </table>
     *      tr rowSelecting - if row can be selected
     *      td dataItemName - name of data table row data item value
     *      tr,td onCreated - name of function called after td has been created,
     *          function(tr/td,tableDataItem,newTRs,methods), newTRs=[] - array or tr, methods={ rowSelectingMethod, <onClick function name if exists> }
     *      tr,td onClick - name of function called after td click,
     *          function(e,owner,contentTableDataItem,self), e-onclick event, owner - owner of onClick action function (tr/td dom element), self-component instance
     * contentTableData =
     * <table width="100%" style="margin-bottom: 43px;"></table>
     * totalTable =
     * <table width="100%" style="position:fixed; bottom:0px; z-index: 100">
     *     <tfoot>
     *         <tr>
     *             <td id="totalRows" width="40px">0</td>
     *             <td></td>
     *             <td id="totalQty" width="50px">0</td>
     *             <td id="totalNewQty" width="50px">0</td>
     *         </tr>
     *     </tfoot>
     * </table>
     * totalTable updated in innerPageUpdateTotalTable function
     * self = component instance
     * added to table TDs and table TD childs as [dataTableRowData]
     * return array new table TR
     */
    innerPageCreateTableRow: function(contentTableHeaderDomEl, contentTableDataDomEl, contentTableDataItem, self){
        if(!contentTableHeaderDomEl||!contentTableDataDomEl) return;
        var contentTableHeaderRows= $$(contentTableHeaderDomEl).children("tbody").children("tr");
        if(!contentTableHeaderRows||contentTableHeaderRows.length==0)return;
        if(!contentTableDataItem) contentTableDataItem={};
        var newTRs=[];
        for(var i=0;i<contentTableHeaderRows.length;i++){
            var dthTR= contentTableHeaderRows[i], newTR;
            newTRs.push(newTR=dthTR.cloneNode(true)); contentTableDataDomEl.appendChild(newTR);
            var rowSelecting= newTR.getAttribute("rowSelecting"),
                selectOnClickFunction=function(e){
                    $$(contentTableDataDomEl).children('.mobile-table-selectedRow').removeClass('mobile-table-selectedRow');
                    for(var selTR of newTRs) selTR.classList.add('mobile-table-selectedRow');
                };
            var trOnCreatedMethodName= newTR.getAttribute("onCreated"),
                trOnClickMethodName= newTR.getAttribute("onClick");
            if(trOnCreatedMethodName){
                var methods={};
                if(rowSelecting) methods["rowSelectingMethod"]= selectOnClickFunction;
                if(trOnClickMethodName) methods[trOnClickMethodName]= self[trOnClickMethodName];
                self[trOnCreatedMethodName](newTR,contentTableDataItem,newTRs,methods);
            }
            if(trOnClickMethodName&&rowSelecting){
                var trOnClickMethod= self[trOnClickMethodName];
                newTR.onclick=function(e){
                    selectOnClickFunction(e);
                    trOnClickMethod(e,newTR,contentTableDataItem,self);
                };
            }else if(trOnClickMethodName){
                var trOnClickMethod= self[trOnClickMethodName];
                newTR.onclick=function(e){
                    trOnClickMethod(e,newTR,contentTableDataItem,self);
                };
            }else if(rowSelecting)
                newTR.onclick= selectOnClickFunction;
            for(var newTD of newTR.children){
                var contentTableDataItemName= newTD.getAttribute("dataItemName"), val;
                if(contentTableDataItemName!==undefined) val= contentTableDataItem[contentTableDataItemName];
                var newTDText=newTD.firstChild||newTD;
                newTDText.innerText= (val==null)?"":val.toString();
                var tdOnCreatedMethodName= newTD.getAttribute("onCreated"), tdOnClickMethodName= newTD.getAttribute("onClick");
                if(tdOnCreatedMethodName){
                    var methods={};
                    if(rowSelecting) methods["rowSelectingMethod"]= selectOnClickFunction;
                    if(tdOnClickMethodName) methods[tdOnClickMethodName]= self[tdOnClickMethodName];
                    self[tdOnCreatedMethodName](newTD,contentTableDataItem,newTRs,methods);
                }
                if(tdOnClickMethodName){
                    var tdOnClickMethod= self[tdOnClickMethodName];
                    newTD.onclick=function(e){
                        tdOnClickMethod(e,newTD,contentTableDataItem,self);
                    };
                }
            }
        }
        return newTRs;
    },
    /** IT'S USED IN INNER PAGE TEMPLATES
     * contentTableFootDomEl =
     * <table width="100%" style="position:fixed; bottom:0px; z-index: 100">
     *     <tfoot>
     *         <tr>
     *             <td id="totalRows" width="40px">0</td>
     *             <td></td>
     *             <td id="totalQty" width="50px">0</td>
     *             <td id="totalNewQty" width="50px">0</td>
     *         </tr>
     *     </tfoot>
     * </table>
     * contentTableFootDomEl may be array = [<contentTableFootDomEl1>, <contentTableFootDomEl2>, ... ]
     * params = { <td id value>:<value>, .. }
     */
    innerPageUpdateTotalTable:function(contentTableFootDomElVal, params){
        if(!params)return;
        if(!Array.isArray(contentTableFootDomElVal)){
            var contentTableFootTR= $$(contentTableFootDomElVal).find("tr");
            for(var valueName in params) contentTableFootTR.find("td#"+valueName).html(params[valueName]);
            return;
        }
        for(var contentTableFootDomEl of contentTableFootDomElVal){
            var contentTableFootTR= $$(contentTableFootDomEl).find("tr");
            for(var valueName in params) contentTableFootTR.find("td#"+valueName).html(params[valueName]);
        }
    },
    /** IT'S USED IN INNER PAGE TEMPLATES
     * self = component instance
     * params = { contentTableHeaderDomEl,contentTableDataDomEl, contentTable2HeaderDomEl,contentTable2DataDomEl, progressAction }
     *      contentTable2Header,contentTable2Data - if exists, used for fill second data table,
     *      contentTableDataIDName, contentTableDataDomTRs,
     *      progressAction = function(tableData,ind,tableDataItem), if no ind and no tableDataItem, do last progressAction
     * finishedCallback = function(contentTableData,contentTableDataDomTRs)
     *      contentTableDataDomTRs - array of arrays created content table TR elements, create/fill only exists params.contentTableDataIDName
     */
    innerPageFillTableData: function(self, contentTableData, params, finishedCallback){
        var progress = 0, progressStep=100/contentTableData.length;
        params.progressBarEl = app7.progressbar.show(progress, app7.theme === 'md' ? 'yellow' : 'blue');
        app7.preloader.show();
        var stDisplay="", stDisplay2="";
        if(params.contentTableDataDomEl){
            stDisplay= params.contentTableDataDomEl.style.display;
            params.contentTableDataDomEl.style.display="none";
            $$(params.contentTableDataDomEl).children("tr").remove();
        }
        if(params.contentTable2DataDomEl){
            stDisplay2= params.contentTable2DataDomEl.style.display;
            params.contentTable2DataDomEl.style.display="none";
            $$(params.contentTable2DataDomEl).children("tr").remove();
        }
        params.progressBarEl=params.progressBarEl; params.progress=progress; params.progressStep=progressStep;
        app7.fillInnerPageTableDataProgress(self, 0,contentTableData,params, function(contentTableData,contentTableDataDomTRs){
            app7.progressbar.hide(params.progressBarEl);
            app7.preloader.hide();
            if(params.contentTableDataDomEl) params.contentTableDataDomEl.style.display= stDisplay;
            if(params.contentTable2DataDomEl) params.contentTable2DataDomEl.style.display= stDisplay2;
            if(params.progressAction) params.progressAction(contentTableData);
            if(finishedCallback) setTimeout(function(){ finishedCallback(contentTableData,contentTableDataDomTRs); },1);
        });
    },
    /** IT'S USED IN INNER PAGE TEMPLATES
     * self = component instance
     * params = { contentTableHeaderDomEl,contentTableDataDomEl, contentTable2HeaderDomEl,contentTable2DataDomEl,
     *              progressBarEl,progress,progressStep, progressAction,
     *              contentTableDataIDName, contentTableDataDomTRs }
     *      progressAction = function(tableData,ind,tableDataItem)
     * finishedCallback = function(contentTableData,contentTableDataDomTRs)
     *      contentTableDataDomTRs - array of arrays created content table TR elements, create/fill only exists params.contentTableDataIDName
     */
    fillInnerPageTableDataProgress: function(self, ind,contentTableData, params, finishedCallback){
        var timeout= 10+Math.round(ind/100), i=ind, contentTableDataItem;
        while(i<ind+10){
            contentTableDataItem= contentTableData[i];
            if(!contentTableDataItem)break;
            var createdTRs=[].concat(app7.innerPageCreateTableRow(params.contentTableHeaderDomEl,params.contentTableDataDomEl, contentTableDataItem, self));
            if(params.contentTable2HeaderDomEl&&params.contentTable2DataDomEl)
                createdTRs= createdTRs.concat(app7.innerPageCreateTableRow(params.contentTable2HeaderDomEl,params.contentTable2DataDomEl, contentTableDataItem, self));
            if(params.contentTableDataIDName){
                 if(!params.contentTableDataDomTRs) params.contentTableDataDomTRs={};
                params.contentTableDataDomTRs[contentTableDataItem[params.contentTableDataIDName]]= createdTRs;
            }
            if(params.progressAction) params.progressAction(contentTableData, ind,contentTableDataItem);
            params.progress+= params.progressStep;
            i++;
        }
        app7.progressbar.set(params.progressBarEl, params.progress);
        if(!contentTableDataItem){
            if(finishedCallback) setTimeout(function(){ finishedCallback(contentTableData,params.contentTableDataDomTRs); },timeout);
            return;
        }
        setTimeout(function(){
            app7.fillInnerPageTableDataProgress(self, i,contentTableData, params, finishedCallback)
        },timeout)
    }
};