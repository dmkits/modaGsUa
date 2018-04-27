/**
 * Created by dmkits on 30.12.16.
 */
define(["dojo/_base/declare", "dojo/request", "dijit/registry", "dialogs"],
    function(declare, request, registry, dialogs) {
        return {
            jsonHeader: {"X-Requested-With":"application/json; charset=utf-8",
                'Content-Type': 'application/x-www-form-urlencoded'},
            showRequestErrorDialog: false,
            /** getJSON
             * params = { url, condition, headers, handleAs, timeout, consoleLog }
             * default headers=this.jsonHeader, handleAs="json"
             * if success : callback(true,data), if not success callback(false,error)
             * @param params
             * @param callback
             */
            getJSON: function(params,callback){
                if (!params) return;
                var url= params["url"],condition=params["condition"],consoleLog=params["consoleLog"],timeout=params["timeout"];
                if(condition && typeof(condition)==="object"){
                    var scondition;
                    for(var condItem in condition){
                        if (condition[condItem]!==undefined&&condition[condItem]!==null)
                            scondition = (!scondition) ? condItem+"="+condition[condItem] : scondition+"&"+condItem+"="+condition[condItem];
                    }
                    if (scondition) url=url+"?"+scondition;
                } else if(condition) url=url+"?"+condition;
                var requestParams={headers: this.jsonHeader, handleAs: "json"};
                if(params.handleAs) requestParams.handleAs=params.handleAs;
                if(params.headers) requestParams.headers=params.headers;
                if(params.timeout) requestParams.timeout=params.timeout;
                request.get(url, requestParams).then(
                    function(respdata){
                        if(callback)callback(true, respdata);
                    }, function(resperror){
                        if(consoleLog) console.log("getJSON ERROR! url=",url," error=",resperror);
                        if(callback)callback(false, resperror);
                    })
            },
            /** getJSONData
             * params = { url, condition, timeout, showRequestErrorDialog, consoleLog, resultItemName }
             * default: params.showRequestErrorDialog = true, params.consoleLog = true
             * resultCallback = function(result, error)
             *  result = undefined if request failed
             *  result = null if result is empty or result error (parameter error exists)
             *  result = response result if no params.resultItemName
             *  OR result = response result[params.resultItemName] if exists params.resultItemName
             */
            getJSONData: function(params, resultCallback){
                if (!params) return;
                var requestFailDialog;
                if (params.showRequestErrorDialog!==false)
                    requestFailDialog= function(msg){
                        dialogs.doRequestFailDialog({title:"Внимание",content:"Невозможно получить данные! <br>Причина:"+msg});
                    };
                this.getJSON(params,function(success, serverResult){
                    if(!success){
                        if(requestFailDialog) requestFailDialog("Нет связи с сервером!");
                        resultCallback();
                        return;
                    }
                    if(!serverResult){
                        if(requestFailDialog) requestFailDialog("Нет данных с сервера!");
                        resultCallback(null);
                        return;
                    }
                    if(serverResult.error){
                        var msg=serverResult.error;
                        if(serverResult.errorMsg) msg= serverResult.errorMsg+"<br>"+msg;
                        if(serverResult.userErrorMsg)msg=serverResult.userErrorMsg;
                        if(params.consoleLog) console.log("getJSONData DATA ERROR! url=",params.url," error=",msg);
                        if(requestFailDialog) requestFailDialog(msg);
                        resultCallback((params.resultItemName)?serverResult[params.resultItemName]:serverResult, serverResult.error);
                        return;
                    }
                    if(params.resultItemName&&serverResult[params.resultItemName]===undefined){
                        if(params.consoleLog) console.log("getJSONData DATA ERROR! url=",params.url," No result!");
                        if(requestFailDialog) requestFailDialog("Нет данных с сервера!");
                        resultCallback(null);
                        return;
                    }
                    if(params.resultItemName){
                        resultCallback(serverResult[params.resultItemName]);
                        return;
                    }
                    resultCallback(serverResult);
                });
            },

            /** postData
             * params = { url, condition, data, headers, handleAs, timeout, consoleLog }
             * if success : callback(true,data), if not success callback(false,error)
             */
            postData: function (params,callback) {
                if (!params) return;
                var url= params["url"],condition=params["condition"],consoleLog=params["consoleLog"];
                if(condition && typeof(condition)==="object"){
                    var scondition;
                    for(var condItem in condition){
                        if (condition[condItem]!==undefined&&condition[condItem]!==null)
                            scondition = (!scondition) ? condItem+"="+condition[condItem] : scondition+"&"+condItem+"="+condition[condItem];
                    }
                    if (scondition) url=url+"?"+scondition;
                } else if(condition) url=url+"?"+condition;
                var requestParams={data:params["data"]};
                if(params.handleAs) requestParams.handleAs=params.handleAs;
                if(params.headers) requestParams.headers=params.headers;
                if(params.timeout) requestParams.timeout=params.timeout;
                request.post(url, requestParams).then(
                    function(respdata){
                        if(callback)callback(true, respdata);
                    }, function(resperror){
                        if(consoleLog) console.log("Request postData ERROR! url=",url," error=",resperror);
                        if(callback)callback(false, resperror);
                    })
            },
            /** postJSON
             * params = { url, condition, data, timeout, consoleLog, showRequestErrorDialog }
             * if success : callback(true,data), if not success callback(false,error)
             */
            postJSON: function (params,callback) {
                if (!params) return;
                params.handleAs="json"; params.headers=this.jsonHeader;
                this.postData(params,callback);
            },
            /** postJSONData
             * params = { url, condition, timeout, showRequestErrorDialog, data, resultItemName }
             * default: params.showRequestErrorDialog = true
             * resultCallback = function(result, error)
             *  result = undefined if request failed
             *  result = null if result is empty or result error (parameter error exists)
             *  result = response result if no params.resultItemName
             *  OR result = response result[params.resultItemName] if exists params.resultItemName
             */
            postJSONData: function (params,resultCallback) {
                if (!params) return;
                var requestFailDialog;
                if (params.showRequestErrorDialog!==false)
                    requestFailDialog= function(msg, reason){
                        if(!reason) reason="";
                        dialogs.doRequestFailDialog({title:"Внимание",content:msg+" <br>Причина:"+reason});
                    };
                this.postJSON(params,function(success, serverResult) {
                    if (!success) {
                        if (requestFailDialog) requestFailDialog("Невозможно получить результат операции!","Нет связи с сервером!");
                        resultCallback();
                        return;
                    }
                    if (!serverResult) {
                        if (requestFailDialog) requestFailDialog("Невозможно получить результат операции!","Нет данных с сервера!");
                        resultCallback(null);
                        return;
                    }
                    if (serverResult.error) {
                        var msg = serverResult.error;
                        if (serverResult.errorMsg) msg = serverResult.errorMsg + "<br>" + msg;
                        if(serverResult.userErrorMsg)msg=serverResult.userErrorMsg;
                        if (requestFailDialog) requestFailDialog("Невозможно выпонить операцию!",msg);
                        resultCallback((params.resultItemName)?serverResult[params.resultItemName]:serverResult, serverResult.error);
                        return;
                    }
                    if (params.resultItemName && serverResult[params.resultItemName] === undefined) {
                        if (requestFailDialog) requestFailDialog("Невозможно получить результат операции!","Нет данных результата операции с сервера!");
                        resultCallback(null);
                        return;
                    }
                    if (params.resultItemName) {
                        resultCallback(serverResult[params.resultItemName]);
                        return;
                    }
                    resultCallback(serverResult);
                })
            }
        };
    });