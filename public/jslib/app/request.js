/**
 * Created by dmkits on 30.12.16.
 */
define(["dojo/request", "app/base","app/dialogs"],
    function(request, base, dialogs) {
        return {
            jsonHeader: {"X-Requested-With":"application/json; charset=utf-8",
                'Content-Type': 'application/x-www-form-urlencoded'},
            /** getUlrWithParams
             * params = "<url>" OR { url, conditions }
             * conditions = "<conditions>" OR { <condition>:<value>, ... }
             */
            getUlrWithParams: function(params){
                if(!params||typeof(params)=="string")return params;
                var url= params["url"],pConditions=params.conditions;
                if(pConditions&&typeof(pConditions)==="object"){
                    var sConditions="";
                    for(var condItem in pConditions){
                        var sCondition=pConditions[condItem];
                        if(sCondition===undefined||sCondition===null) continue;
                        if(sConditions.length>0) sConditions+="&";
                        sConditions+= condItem+"="+sCondition;
                    }
                    if(sConditions) url=url+"?"+sConditions;
                }else if(pConditions) url=url+"?"+pConditions;
                return url;
            },
            /** getReqParams
             * params = { headers, handleAs, timeout, consoleLog }
             * if isJSON in result added headers=this.jsonHeader, handleAs="json"
             */
            getReqParams: function(params,isJSON){
                var requestParams=(isJSON)?{headers: this.jsonHeader, handleAs: "json"}:{};
                if(!params||typeof(params)=="string")return requestParams;
                if(params.handleAs) requestParams.handleAs=params.handleAs;
                if(params.headers) requestParams.headers=params.headers;
                if(params.timeout) requestParams.timeout=params.timeout;
                if(params.data) requestParams.data=params.data;
                return requestParams;
            },
            /** getJSON
             * params = "<url>" OR { url, conditions, headers, handleAs, timeout, consoleLog }
             * default headers=this.jsonHeader, handleAs="json"
             * conditions = "<conditions>" OR { <condition>:<value>, ... }
             * if success : callback(respData), if not success callback(undefined,error)
             */
            getJSON: function(params,callback){
                if(!params) return;
                var consoleLog=(params)?params.consoleLog:false;
                request.get(this.getUlrWithParams(params),this.getReqParams(params,true)).then(
                    function(respData){
                        if(callback) callback(respData);
                    },function(reqErr){
                        if(consoleLog) console.error("getJSON ERROR! url=",params.url," error=",reqErr);
                        if(callback) callback(undefined,reqErr);
                    })
            },
            /** postData
             * params = "<url>" OR { url, conditions, data, headers, handleAs, timeout, consoleLog }
             * if success : callback(data),
             * if not success callback(undefined,error)
             */
            postData: function(params,callback){
                var consoleLog=(params)?params.consoleLog:false;
                request.post(this.getUlrWithParams(params),this.getReqParams(params,false))
                    .then(function(respData){
                            if(callback)callback(respData);
                        },function(reqErr){
                            if(consoleLog) console.error("Request postData ERROR! url=",params.url," error=",reqErr);
                            if(callback)callback(undefined,reqErr);
                    })
            },
            /** postJSON
             * params = <url>" OR { url, conditions, data, timeout, consoleLog, showErrorDialog }
             * if success : callback(jsonData),
             * if not success callback(undefined,error)
             */
            postJSON: function(params,callback){
                var consoleLog=(params)?params.consoleLog:false;
                request.post(this.getUlrWithParams(params),this.getReqParams(params,true))
                    .then(function(respData){
                            if(callback)callback(respData);
                        },function(reqErr){
                            if(consoleLog) console.error("Request postJSON ERROR! url=",params.url," error=",reqErr);
                            if(callback)callback(undefined,reqErr);
                    })
            },
            /** processJSONDataResult
             * respJSON = { error:"<error message>", errorMessage="<user error message>", [resultItemName], <other data items> }
             * OR respJSON = { error:{error,message,errorMessage,userMessage}, [resultItemName], <other data items> }
             * if exists error and error is string, may be errorMessage
             * params = { showErrorDialog, errorDialogMsg, errorDialogReasonMsg, resultItemName }
             * resParams = { dlgErrMsgReqErr, dlgErrReasonReqErrState0, dlgErrReasonReqErr, dlgErrMsgRespErr, dlgErrReasonRespErrNoData }
             * resultCallback = function(<response result>, <error>), <error> = { message, errorMessage, userMessage, _reqError }
             * call resultCallback(<response result>) if request success and no result.error
             * call resultCallback(undefined, <error>) if request not success OR
             * call resultCallback(<response result>, <error>) if request success and exists <response result>.error
             */
            processJSONDataResult: function(params, respJSON,error, resParams, resultCallback){
                var requestFailDialog=null,
                    errorDialogMsg=(params&&params.errorDialogMsg)?params.errorDialogMsg:null,
                    errorDialogReasonMsg=(params&&params.errorDialogReasonMsg)?params.errorDialogReasonMsg:null,
                    self=this, hasRespJSON=respJSON!==undefined&&respJSON!==null,
                    result=(hasRespJSON&&params&&params.resultItemName)?respJSON[params.resultItemName]:respJSON,
                    hasResult=result!==undefined&&result!==null;
                if(params&&params.showErrorDialog!==false)
                    requestFailDialog= function(msg, reason){
                        self.doRequestFailDialog({title:"Внимание",
                            content:'<div style="font-weight:bold;color:red">'+(errorDialogMsg||msg)+'</div>'+
                                '<div style="margin-top:5px;font-size:11px">Причина: '+(errorDialogReasonMsg||reason||"")+'</div>'});
                    };
                if(!error&&hasResult&&!respJSON.error){
                    resultCallback(result);
                    return;
                }else if(!error&&respJSON&&respJSON.error){// response contain error
                    var respErr=respJSON.error, respErrObj=(typeof(respErr)=="object")?respErr:null,
                        errMsg=(respErrObj)?(respErrObj.message||"UNKNOWN"):(respJSON.errorMessage||respErr),
                        resErr={message:(!respErrObj)?respErr:errMsg, errorMessage:errMsg};
                    if(respErrObj&&respErrObj.errorMessage){
                        errMsg=respErrObj.errorMessage;
                        resErr.message=resErr.message||respErr.errorMessage;
                        resErr.errorMessage=respErr.errorMessage; resErr.userMessage=respErr.errorMessage;
                    }
                    if(respErrObj&&respErrObj.userMessage){
                        errMsg=respErrObj.userMessage;
                        resErr.message=resErr.message||respErr.userMessage; resErr.userMessage=respErr.userMessage;
                    }
                    console.error("Response return error! Error:",respErr,"Result:",respJSON,"Request params:",params);
                    if(requestFailDialog) requestFailDialog(resParams.dlgErrMsgRespErr,errMsg);
                    resultCallback(result,resErr);
                    return;
                }else if(!error&&!hasResult){//no response result
                    if(requestFailDialog) requestFailDialog(resParams.dlgErrMsgRespErr,resParams.dlgErrReasonRespErrNoData);
                    var errMsgNoRes="Response return no result!";
                    console.error(errMsgNoRes+" Result:",respJSON,"Request params:",params);
                    resultCallback(result,{message:resParams.dlgErrReasonRespErrNoData, errorMessage:errMsgNoRes});
                    return;
                }
                //if error
                var msg = (error.response&&error.response.status==0)?resParams.dlgErrReasonReqErrState0:resParams.dlgErrReasonReqErr,
                    reqErr=(error.message)?error.message:error;
                if(requestFailDialog) requestFailDialog(resParams.dlgErrMsgReqErr,msg);
                resultCallback(undefined,{message:msg,_reqError:reqErr});
            },
            getJSONResParams: {
                dlgErrMsgReqErr:"Невозможно получить данные!",
                dlgErrReasonReqErrState0:"Нет связи с сервером!",
                dlgErrReasonReqErr:"Некорректный ответ сервера!",
                dlgErrMsgRespErr:"Невозможно получить данные!",
                dlgErrReasonRespErrNoData:"Нет данных с сервера!"
            },
            postJSONResParams: {
                dlgErrMsgReqErr:"Невозможно получить результат операции!",
                dlgErrReasonReqErrState0:"Нет связи с сервером!",
                dlgErrReasonReqErr:"Некорректный ответ сервера!",
                dlgErrMsgRespErr:"Невозможно выпонить операцию!",
                dlgErrReasonRespErrNoData:"Нет результата операции с сервера!"
            },
            /** jsonData
             * params = { url, method:"get"/"post", conditions, timeout, showErrorDialog, errorDialogMsg,errorDialogReasonMsg, consoleLog, resultItemName }
             * default: method="get", params.showErrorDialog = true, params.consoleLog = true
             * response result should contain JSON
             * result JSON may be object as { error:"<error message>", errorMessage="<user error message>", [resultItemName], <other data items> }
             *          OR { error:{error,message,errorMessage,userMessage}, [resultItemName], <other data items> }
             * resultCallback = function(<response result>, <error>),
             *      <error> = { message, errorMessage, userMessage, _reqError }
             * call resultCallback(<response result>) if request success and no result.error
             * call resultCallback(undefined, <error>) if request not success OR
             * call resultCallback(<response result>, <error>) if request success and exists <response result>.error
             */
            jsonData: function(params,resultCallback){
                var self=this;
                if(params&&params.method=="post"){
                    this.postJSON(params,function(respJSON,error){
                        self.processJSONDataResult(params, respJSON,error, self.postJSONResParams, resultCallback);
                    });
                    return;
                }
                this.getJSON(params,function(respJSON,error){
                    self.processJSONDataResult(params, respJSON,error, self.getJSONResParams, resultCallback);
                });
            },
            /** getJSONData
             * params = { url, conditions, timeout, showErrorDialog, errorDialogMsg,errorDialogReasonMsg, consoleLog, resultItemName }
             * resultCallback = function(<response result>, <error>),
             *      <error> = { message, errorMessage, userMessage, _reqError }
             * call resultCallback(<response result>) if request success and no result.error
             * call resultCallback(undefined, <error>) if request not success OR
             * call resultCallback(<response result>, <error>) if request success and exists <response result>.error
             */
            getJSONData: function(params,resultCallback){
                var self=this;
                this.getJSON(params,function(respJSON,error){
                    self.processJSONDataResult(params, respJSON,error, self.getJSONResParams, resultCallback);
                });
            },
            /** postJSONData
             * params = <url>" OR { url, conditions, timeout, showErrorDialog, errorDialogMsg,errorDialogReasonMsg, data, resultItemName }
             * default: params.showErrorDialog = true
             * resultCallback = function(<response result>, <error>),
             *      <error> = { message, errorMessage, userMessage, _reqError }
             * call resultCallback(<response result>) if request success and no result.error
             * call resultCallback(undefined, <error>) if request not success OR
             * call resultCallback(<response result>, <error>) if request success and exists <response result>.error
             */
            postJSONData: function(params,resultCallback){
                var self=this;
                this.postJSON(params,function(respJSON,error){
                    self.processJSONDataResult(params, respJSON,error, self.postJSONResParams, resultCallback);
                })
            },
            doRequestFailDialog: function(params){
                if(!params) params={};
                params.id="requestFailDialog"; params.width=350; params.btnOkLabel="Закрыть";
                var instance= base.getInstanceByID(params.id);
                if(instance&&instance.open)return;
                dialogs.showSimple(params);
            }
        };
    });