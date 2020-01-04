var server= require("../server"), log= server.log;
var dateFormat = require('dateformat'), path=require('path'), moment=require('moment');
var common=require("../common");
var database= require("../databaseMSSQL");

var dataModelChanges= [], validatedDataModels={};
module.exports.getModelChanges= function(){ return dataModelChanges; };
module.exports.resetModelChanges= function(){ dataModelChanges=[]; };
module.exports.getValidatedDataModels= function(){ return validatedDataModels; };
module.exports.resetValidatedDataModels= function(){ validatedDataModels={}; };

/**
 * created for data model fields: sourceType, source, fields, idField, fieldsMetadata
 * dataModel.changeLog or dataModel.modelData
 *      modelData = { tableName/viewName/queryName/functionName, <parameters> }
 *          tableName/viewName, idField="<idFieldName>", fields=["<fieldName>, ..." ];
 *          queryName, idField="<idFieldName>", fields=["<fieldName>, ..."], queryParameters=["@<parameterName>", ... ];
 *          functionName, functionParameters=["@<parameterName>", ... ]
 *      errs = [ <datamodel name>+"_initError":<error message>, ... ]
 * created data model functions
 */
function initValidateDataModel(dataModelName, dataModel, errs, nextValidateDataModelCallback){                  log.info('InitValidateDataModel: dataModel:'+dataModelName+"...");//test
    if(!dataModel.changeLog&&!dataModel.modelData){
        errs[dataModelName+"_initError"]="Failed init dataModel:"+dataModelName
            +"! Reason: no model data and no change log!";                                                      log.error('FAILED init dataModel:'+dataModelName+"! Reason: no model data and no change log!");//test
        nextValidateDataModelCallback();
        return;
    }
    if(validatedDataModels[dataModelName]){ nextValidateDataModelCallback(); return; }
    validatedDataModels[dataModelName]=dataModel;
    if(dataModel.changeLog) dataModelChanges= dataModelChanges.concat(dataModel.changeLog);
    if(dataModel.doValidate){//if data model already inited and validated
        dataModel.doValidate(errs, nextValidateDataModelCallback);
        return;
    }
    var tableName, viewName, queryName, functionName, tableFieldsList=[],tableFields={}, idFieldName, functionParameters=[],
        joinedSources={};
    if(dataModel.modelData){
        var modelData=dataModel.modelData;
        if(modelData.tableName) tableName= modelData.tableName;
        if(modelData.viewName) viewName= modelData.viewName;
        if(modelData.queryName) queryName= modelData.queryName;
        if(modelData.functionName) functionName= modelData.functionName;
        if(modelData.idField) idFieldName= modelData.idField;
        functionParameters= modelData.functionParameters;
        if(modelData.fields)
            for(var fieldIndex in modelData.fields){
                var fieldName=modelData.fields[fieldIndex];
                if(!tableFields[fieldName]){
                    tableFields[fieldName]=true;
                    tableFieldsList.push(fieldName);
                }
            }
    }
    if(dataModel.changeLog){
        for(var i=0;i<dataModel.changeLog.length;i++){
            var changeLogItem=dataModel.changeLog[i];
            if(changeLogItem.tableName&&!tableName&&!viewName) tableName= changeLogItem.tableName;
            if(changeLogItem.viewName&&!viewName&&!tableName) viewName= changeLogItem.viewName;
            if(changeLogItem.idField&&!idFieldName) idFieldName= changeLogItem.idField;
            if(changeLogItem.fields){
                for(var fieldIndex in changeLogItem.fields){
                    var fieldName=changeLogItem.fields[fieldIndex];
                    if(!tableFields[fieldName]){
                        tableFields[fieldName]=true;
                        tableFieldsList.push(fieldName);
                    }
                }
            }else if(changeLogItem.field){
                if(!tableFields[changeLogItem.field]){
                    tableFields[changeLogItem.field]=true;
                    tableFieldsList.push(changeLogItem.field);
                }
                if(changeLogItem.source){
                    var joinedSourceLinkConditions= joinedSources[changeLogItem.source];
                    if(!joinedSourceLinkConditions){
                        joinedSourceLinkConditions={};
                        joinedSources[changeLogItem.source]= joinedSourceLinkConditions;
                    }
                    if(changeLogItem.linkField)
                        joinedSourceLinkConditions[tableName+"."+changeLogItem.field+"="+changeLogItem.source+"."+changeLogItem.linkField]=null;
                }
            }
        }
    }
    dataModel.getDataItems= _getDataItems;
    dataModel.getDataItemsForSelect= _getDataItemsForSelect;
    dataModel.getDataItemsForTableCombobox= _getDataItemsForTableCombobox;
    dataModel.getDataItem= _getDataItem;
    dataModel.getIDByFiledValue= _getIDByFiledValue;
    dataModel.setDataItem= _setDataItem;
    dataModel.getDataItemsForTable= _getDataItemsForTable;
    dataModel.getDataItemForTable= _getDataItemForTable;
    dataModel.getDataForTable= _getDataForTable;
    dataModel.getDataForDocTable= _getDataForDocTable;
    dataModel.setDataItemForTable= _setDataItemForTable;
    dataModel.insDataItem= _insDataItem;
    dataModel.calcNewIDValueOnInsDataItemWithNewID= _calcNewIDValueOnInsDataItemWithNewID;
    dataModel.insDataItemWithNewID= _insDataItemWithNewID;
    dataModel.updDataItem= _updDataItem;
    dataModel.storeDataItem= _storeDataItem;
    dataModel.delDataItem= _delDataItem;
    dataModel.findDataItemByOrCreateNew= _findDataItemByOrCreateNew;
    dataModel.insTableDataItem= _insTableDataItem;
    dataModel.updTableDataItem= _updTableDataItem;
    dataModel.calcNewIDValueOnStoreTableDataItem= _calcNewIDValueOnStoreTableDataItem;
    dataModel.storeTableDataItem= _storeTableDataItem;
    dataModel.delTableDataItem= _delTableDataItem;
    if(!tableName&&!viewName&&!queryName&&!functionName){
        errs[dataModelName+"_initError"]= "Failed init dataModel:"+dataModelName
            +"! Reason: no model table or view name or query name or function name!";                           log.error('FAILED init dataModel:'+dataModelName+"! Reason: no model table or view name or query name or function name!");//test
        nextValidateDataModelCallback();
        return;
    }
    if((tableName||viewName||queryName)&&(!tableFieldsList||tableFieldsList.length==0)){
        errs[dataModelName+"_initError"]="Failed init dataModel:"+dataModelName+"! Reason: no model fields!";   log.error('FAILED init dataModel:'+dataModelName+"! Reason: no model fields!");//test
        nextValidateDataModelCallback();
        return;
    }else if(functionName&&(!functionParameters||functionParameters.length==0)){
        errs[dataModelName+"_initError"]="Failed init dataModel:"+dataModelName+"! Reason: no model parameters!";   log.error('FAILED init dataModel:'+dataModelName+"! Reason: no model parameters!");//test
        nextValidateDataModelCallback();
        return;
    }
    if(tableName){
        dataModel.sourceType="table"; dataModel.sourceName=tableName; dataModel.source=tableName;
    }else if(viewName){
        dataModel.sourceType="view"; dataModel.sourceName=viewName; dataModel.source=viewName;
    }else if(queryName){
        dataModel.sourceType="query";  dataModel.sourceName=modelData.queryName;
        dataModel.source=modelData.query; dataModel.sourceParamsNames=modelData.queryParameters;
    }else if(functionName){
        dataModel.sourceType="function";  dataModel.sourceName=functionName;
        dataModel.source=functionName; dataModel.sourceParamsNames=functionParameters;
    }
    dataModel.fields=tableFieldsList; dataModel.idField=idFieldName;                                            log.debug('Init data model '+dataModel.sourceType+":"+dataModel.sourceName+" fields:",dataModel.fields," idField:"+dataModel.idField);//test
    dataModel.fieldsMetadata=tableFields;
    dataModel.joinedSources=joinedSources;                                                                      log.debug('Init data model '+dataModel.sourceType+":"+dataModel.sourceName+" joined sources:",dataModel.joinedSources,{});//test
    if(!dataModel.idField)                                                                                      log.warn('NO id filed name in data model '+dataModel.sourceType+":"+dataModel.sourceName+"! Model cannot used functions insert/update/delete!");//test
    var sourceParams={};
    if(dataModel.source&&dataModel.sourceParamsNames){
        for(var i=0;i<dataModel.sourceParamsNames.length;i++){
            var sourceParamName= (dataModel.sourceParamsNames)?dataModel.sourceParamsNames[i]:null;
            if(sourceParamName) sourceParams[sourceParamName]=null;
        }
    }
    var validateCondition=null, withoutConditions=false;
    if(tableName||viewName||queryName){
        var idIsNullCondition= tableFieldsList[0]+" is NULL", validateCondition={};
        validateCondition[idIsNullCondition]=null;
    }else if(functionName) withoutConditions=true;
    dataModel.doValidate= function(errs, resultCallback){
        dataModel.getDataItems(database.getDBSystemConnection(),
                {sourceParams:sourceParams,conditions:validateCondition,withoutConditions:withoutConditions},
            function(result){
                if(result.error){                                                                               log.error('FAILED validate data model:'+dataModelName+"! Reason:"+result.error+"!");//test
                    errs[dataModelName+"_validateError"]= "Failed validate dataModel:"+dataModelName+"! Reason:"+result.error;
                }
                resultCallback();
        });
    };
    dataModel.doValidate(errs, nextValidateDataModelCallback);
}
/**
 * resultCallback= function(errs)
 *      errs = [ <datamodel name>+"_initError":<error message>, ... ]
 */
module.exports.initValidateDataModels= function(dataModelsList, errs, resultCallback){
    var validateDataModelCallback = function(dataModelsList, index, errs){
        var dataModelInstance= dataModelsList[index];
        if(!dataModelInstance){ resultCallback(errs); return; }
        if(!dataModelInstance.id){                                                                              log.error('FAILED validate data model without id! Data model instance:',dataModelInstance,{});//test
            resultCallback(errs);
            return;
        }
        var dataModelName= path.basename(dataModelInstance.id).replace('.js','');
        initValidateDataModel(dataModelName, dataModelInstance, errs, function(){
            validateDataModelCallback(dataModelsList, index+1, errs);
        });
    };
    validateDataModelCallback(dataModelsList, 0, errs);
};

var getConUUID= database.getConUUID, getConU= database.getConU;

/**
 * params = { source, sourceType= table/view/query/function, sourceName, sourceParamsNames = [<param1Name>,...], sourceParams={<param1Name>:<value>,...},
 *      fields = [ <fieldName> or <functionFieldName>, ... ],
 *      fieldsSources = { <fieldName>:<sourceName>.<sourceFieldName>, ... },
 *      fieldsFunctions = {
 *          <fieldName>:
 *              "<function>" OR
 *              { function:<function>, source:<functionSource>, sourceField:<functionSourceField>, fields:[ <functionBodySourceFieldName> ] },
 *      ... },
 *      joinedSources = { <sourceName>:<linkConditions> = <linkConditions> or { <linkCondition>:null or <linkCondition>:<value>, ... } },
 *      leftJoinedSources = { <sourceName>:<linkConditions> = <linkConditions> or { <linkCondition>:null or <linkCondition>:<value>, ... } },
 *      groupedFields = [ <fieldName>, ... ],
 *      conditions={ <condition>:<conditionValue>, ... } OR conditions=[ { fieldName:"...", condition:"...", value:"..." }, ... ],
 *      order = "<fieldName>" OR "<fieldName>,<fieldName>,..." OR [ <fieldName>, ... ]
 *      top = "<TOP N>"
 * }
 * fieldsFunctions[].function: "maxPlus1" / "concat"
 * resultCallback = function(err, recordset)
 */
function _getSelectItems(connection, params,resultCallback){                                                    //log.debug("_getSelectItems params:",params,{});//test
    if(!params){                                                                                                log.error("FAILED _getSelectItems! Reason: no function parameters!");//test
        resultCallback("FAILED _getSelectItems! Reason: no function parameters!");
        return;
    }
    if(!params.source){                                                                                         log.error("FAILED _getSelectItems! Reason: no source!");//test
        resultCallback("FAILED _getSelectItems! Reason: no source!");
        return;
    }
    if(!params.fields){                                                                                         log.error("FAILED _getSelectItems from source:"+params.source+"! Reason: no source fields!");//test
        resultCallback("FAILED _getSelectItems from source:"+params.source+"! Reason: no source fields!");
        return;
    }
    var queryFields="";
    for(var fieldNameIndex in params.fields){
        if(queryFields!="") queryFields+= ",";
        var fieldName=params.fields[fieldNameIndex], fieldFunction=null;
        if(params.fieldsSources&&params.fieldsSources[fieldName]){
            fieldName= params.fieldsSources[fieldName]+" as "+fieldName;
        }else if(params.fieldsFunctions&&params.fieldsFunctions[fieldName]){
            var fieldFunctionData= params.fieldsFunctions[fieldName];
            if(typeof(fieldFunctionData)=="string") fieldFunction= fieldFunctionData;
            else if(typeof(fieldFunctionData)=="object") {
                if(fieldFunctionData.function=="maxPlus1")
                    fieldFunction="COALESCE(MAX("+((fieldFunctionData.source)?fieldFunctionData.source+".":"")+fieldFunctionData.sourceField+")+1,1)";
                else if(fieldFunctionData.function=="sumIsNull")
                    fieldFunction="COALESCE(SUM("+((fieldFunctionData.source)?fieldFunctionData.source+".":"")+fieldFunctionData.sourceField+"),0)";
                else if(fieldFunctionData.function=="rowsCountIsNull")
                    fieldFunction= "COALESCE(SUM(CASE When "+
                        ((fieldFunctionData.source)?fieldFunctionData.source+".":"")+fieldFunctionData.sourceField+
                        " is NULL Then 0 Else 1 END),0)";
                else if(fieldFunctionData.function=="concat"&&fieldFunctionData.fields){
                    for(var ind in fieldFunctionData.fields){
                        fieldFunction= (!fieldFunction)?fieldFunctionData.fields[ind]:fieldFunction+","+fieldFunctionData.fields[ind];
                    }
                    fieldFunction="CONCAT("+fieldFunction+")";
                }else if(fieldFunctionData.function&&fieldFunctionData.sourceField){
                    fieldFunction=fieldFunctionData.function+"("+((fieldFunctionData.source)?fieldFunctionData.source+".":"")+fieldFunctionData.sourceField+")";
                }else if(fieldFunctionData.function)
                    fieldFunction=fieldFunctionData.function;
            }
        }
        queryFields+= ((fieldFunction)?fieldFunction+" as ":"") + fieldName;
    }
    var querySource=params.source, queryValues=[];
    if(params.sourceType=="function") querySource+="("+((params.sourceParamsNames)?params.sourceParamsNames.join(","):"")+")";
    if(querySource&&params.sourceParams){
        for(var sourceParamName in params.sourceParams){
            var sourceParamValue=params.sourceParams[sourceParamName];
            if(sourceParamName&&sourceParamValue===null){
                querySource=querySource.replace(new RegExp(sourceParamName,'g'), "NULL");
            }else if(sourceParamName){
                querySource=querySource.replace(new RegExp(sourceParamName,'g'), '@p'+queryValues.length);
                queryValues.push(sourceParamValue);
            }
        }
    }
    if(!params.sourceName) params.sourceName="m";
    if(params.sourceType=="query") querySource= "(\n"+querySource+"\n) "+params.sourceName;
    if(!params.top) params.top=""; else params.top+=" ";
    var selectQuery=(params.sourceType=="function")
        ?"select dbo."+querySource+" "+params.sourceName
        :"select "+params.top+queryFields+" from "+querySource;
    var joins="";
    if(params.joinedSources){
        for(var joinSourceName in params.joinedSources){
            var joinedSourceConditions=params.joinedSources[joinSourceName], joinedSourceOnCondition=null;
            if(typeof joinedSourceConditions=="string") joinedSourceOnCondition= joinedSourceConditions;
            else
                for(var linkCondition in joinedSourceConditions)
                    joinedSourceOnCondition= (!joinedSourceOnCondition)?linkCondition:joinedSourceOnCondition+" and "+linkCondition;
            joins += " inner join " + joinSourceName + " on "+joinedSourceOnCondition;
        }
    }
    if(params.leftJoinedSources){
        for(var leftJoinSourceName in params.leftJoinedSources){
            var leftJoinedSourceConditions=params.leftJoinedSources[leftJoinSourceName], leftJoinedSourceOnCondition="";
            if(typeof leftJoinedSourceConditions=="string") leftJoinedSourceOnCondition= leftJoinedSourceConditions;
            else
                for(var leftJoinLinkCondition in leftJoinedSourceConditions)
                    leftJoinedSourceOnCondition= (!leftJoinedSourceOnCondition)?leftJoinLinkCondition:leftJoinedSourceOnCondition+" and "+leftJoinLinkCondition;
            joins += " left join " + leftJoinSourceName + " on "+leftJoinedSourceOnCondition;
        }
    }
    selectQuery+=joins;
    var wConditionQuery, hConditionQuery;
    if(params.conditions&&typeof(params.conditions)=="object"&&params.conditions.length===undefined){//object
        for(var conditionItem in params.conditions){
            var conditionItemValue=params.conditions[conditionItem];
            //var conditionItemValueQuery= (conditionItemValue===null)?conditionItem:conditionItem+"?";
            var conditionItemValueQuery= (conditionItemValue===null||conditionItemValue==='null')?conditionItem:conditionItem+"@p"+queryValues.length;
            conditionItemValueQuery= conditionItemValueQuery.replace("~","=");
            if(conditionItem.indexOf("SUM(")>=0)
                hConditionQuery= (!hConditionQuery)?conditionItemValueQuery:hConditionQuery+" and "+conditionItemValueQuery;
            else
                wConditionQuery= (!wConditionQuery)?conditionItemValueQuery:wConditionQuery+" and "+conditionItemValueQuery;
            if(conditionItemValue!==null) queryValues.push(conditionItemValue);
        }
    }else if(params.conditions&&typeof(params.conditions)=="object"&&params.conditions.length>0){//array
        for(var ind in params.conditions){
            var conditionItem= params.conditions[ind], conditionFieldName=conditionItem.fieldName;
            if(params.fieldsSources&&params.fieldsSources[conditionFieldName])
                conditionFieldName= params.fieldsSources[conditionFieldName];
            var conditionItemValueQuery=
                //(conditionItem.value===null)?conditionFieldName+conditionItem.condition:conditionFieldName+conditionItem.condition+"?";
                (conditionItem.value===null)?conditionFieldName+conditionItem.condition:conditionFieldName+conditionItem.condition+"@p"+queryValues.length;
            wConditionQuery= (!wConditionQuery)?conditionItemValueQuery:wConditionQuery+" and "+conditionItemValueQuery;
            if(conditionItem.value!==null) queryValues.push(conditionItem.value);
        }
    }
    if(wConditionQuery) selectQuery+= " where "+wConditionQuery;
    if(params.groupedFields){
        var queryGroupedFields = "";
        for(var groupedFieldNameIndex in params.groupedFields){
            if(queryGroupedFields!="") queryGroupedFields+= ",";
            var groupedFieldName = params.groupedFields[groupedFieldNameIndex];
            if(params.fieldsSources && params.fieldsSources[groupedFieldName]){
                groupedFieldName = params.fieldsSources[groupedFieldName];
            }
            queryGroupedFields += groupedFieldName;
        }
        selectQuery+= " group by "+queryGroupedFields;
    }
    if(hConditionQuery) selectQuery+= " having "+hConditionQuery;
    if(params.order) selectQuery+= " order by "+params.order;                                                   //log.debug('_getSelectItems selectQuery:',selectQuery);//test
    if(queryValues.length==0)
        database.selectQuery(connection, selectQuery, function(err,recordset,count,fields){
            if(err){                                                                                            log.error("FAILED _getSelectItems selectQuery! Reason:",err.message,"!");//test
                resultCallback(err);
            }else
                resultCallback(null,recordset);
        });
    else
        database.selectParamsQuery(connection, selectQuery,queryValues, function(err,recordset,count,fieldsMetadata){
            if(err){                                                                                            log.error("FAILED _getSelectItems selectParamsQuery! Reason:",err.message,"!");//test
                resultCallback(err);
            }else{
                resultCallback(null, recordset);
            }
        });
}
module.exports.getSelectItems= _getSelectItems;
/**
 * params = { source, sourceType, sourceName, sourceParamsNames, sourceParams,
 *      fields = [<tableFieldName>,<tableFieldName>,<tableFieldName>,...],
 *      conditions={ <condition>:<conditionValue>, ... } or withoutConditions=true/false,
 *      order = "<orderFieldsList>"
 * }
 * resultCallback = function(result), result = { items:[ {<tableFieldName>:<value>,...}, ... ], error, errorCode } )
 */
function _getDataItems(connection, params, resultCallback){                                                     //log.debug('_getDataItems: params:',params,{});//test
    if(!params) params={};
    if(!params.source) params.source= this.source;
    if(!params.sourceName) params.sourceName= this.sourceName;
    if(!params.sourceType) params.sourceType= this.sourceType;
    if(!params.sourceParamsNames) params.sourceParamsNames= this.sourceParamsNames;
    if(!params.sourceParams) params.sourceParams= this.sourceParams;
    if(!params.fields) params.fields=this.fields;
    if(!params.withoutConditions&&!params.conditions){                                                          log.error("FAILED _getDataItems from source:"+params.source+"! Reason: no conditions!");//test
        resultCallback({error:"FAILED _getDataItems from source:"+params.source+"! Reason: no conditions!"});
        return;
    }
    var condition={}, hasCondition=false;
    for(var condItem in params.conditions){
        var condValue= params.conditions[condItem];
        if(condValue!==undefined){
            condition[condItem]= condValue;
            hasCondition= true;
        }
    }
    if(!params.withoutConditions&&!hasCondition){                                                               log.error("FAILED _getDataItems from source:"+params.source+"! Reason: no data conditions!");//test
        resultCallback({error:"FAILED _getDataItems from source:"+params.source+"! Reason: no data conditions!"});
        return;
    }
    _getSelectItems(connection, params, function(err,recordset){
        var selectResult={};
        if(err){
            selectResult.error= "Failed get data items! Reason:"+err.message; selectResult.message= err.message;
            selectResult.errorCode= err.code;
        }
        if(recordset) selectResult.items= recordset;                                                            //log.debug('_getDataItems: _getSelectItems: result:',selectResult,{});//test
        resultCallback(selectResult);
    });
}
/**
 * params = { source,
 *      fields = [<tableFieldName>,<tableFieldName>,<tableFieldName>,...],
 *      fieldsFunctions = {
 *          <fieldName>:
 *              "<function>" OR
 *              { function:<function>, source:<functionSource>, sourceField:<functionSourceField>, fields:[ <functionBodySourceFieldName> ] },
 *      ... },
 *      conditions={ <condition>:<conditionValue>, ... },
 * }
 *      <function>: "maxPlus1"
 * resultCallback = function(result), result = { item:{<tableFieldName>:<value>,...}, error, errorCode } )
 */
function _getDataItem(connection, params, resultCallback){
    if(!params) params={};
    if(!params.source) params.source= this.source;
    if(!params.sourceName) params.sourceName= this.sourceName;
    if(!params.sourceType) params.sourceType= this.sourceType;
    if(!params.sourceParamsNames) params.sourceParamsNames= this.sourceParamsNames;
    if(!params.sourceParams) params.sourceParams= this.sourceParams;
    if(!params.fields) params.fields=this.fields;
    _getDataItems(connection, params, function(result){                                                         log.debug(getConUUID(connection),getConU(connection),'_getDataItem: _getDataItems: result:',JSON.stringify(result));//test
        var getDataItemResult={};
        if(result.error) getDataItemResult.error= result.error;
        if(result.errorCode!==undefined) getDataItemResult.errorCode= result.errorCode;
        if(result.items){
            if(result.items.length>1)
                getDataItemResult.error= "Failed get data item! Reason: result contains more that one items!";
            else
                getDataItemResult.item= result.items[0];
        }
        resultCallback(getDataItemResult);
    });
}
/**
 * params = { idFieldName, findFieldName }
 * data
 * callback = function(data,err)
 */
function _getIDByFiledValue(connection, params, data, callback){
    var idValue=data[params.idFieldName];
    if(idValue!==undefined&&idValue!==null){ callback(data); return; }
    var condition={};
    condition[params.findFieldName+"="]= data[params.findFieldName];
    this.getDataItem(connection, {fields:[params.idFieldName],conditions:condition}, function(result){
        if(!result.item){
            callback(data,"Failed finded "+params.idFieldName+" by "+params.findFieldName+"!");
            return;
        }
        data[params.idFieldName]= result.item[params.idFieldName];
        callback(data);
    })

}

/**
 * params = { source, valueField, labelField,
 *      conditions={ <condition>:<conditionValue>, ... },
  *     order = "<orderFieldsList>"
 * }
 * if !params.conditions returns all items
 * resultCallback = function(result)
 *      result = { items:[ {value:<valueOfValueField>,label:<valueOfLabelField>}, ... ], error, errorCode } )
 *      if no labelField label=<valueOfValueField>
 */
function _getDataItemsForSelect(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _getDataItemsForSelect! Reason: no function parameters!");//test
        resultCallback("FAILED _getDataItemsForSelect! Reason: no function parameters!");
        return;
    }
    if(!params.valueField){                                                                                     log.error("FAILED _getDataItemsForSelect! Reason: no value field!");//test
        resultCallback("FAILED _getDataItemsForSelect! Reason: no value field!");
        return;
    }
    if(!params.source) params.source=this.source;
    if(!params.conditions) params.conditions={"1=1":null};
    params.fields=[params.valueField];
    params.fieldsSources={}; params.fieldsSources[params.valueField]=params.source+"."+params.valueField;
    if(params.labelField&&params.labelField!=params.valueField){
        params.fields.push(params.labelField);
        params.fieldsSources[params.labelField]= params.source+"."+params.labelField;
    }
    _getDataItems(connection, params, function(result){
        if(result.items){
            var resultItems=result.items;
            result.items=[];
            for(var i in resultItems){
                var resultItem=resultItems[i], resultItemValue= resultItem[params.valueField],
                    selectItem= {value:((resultItemValue!=null)?resultItemValue.toString():resultItemValue)};
                if(params.labelField&&params.labelField!=params.valueField) selectItem.label= resultItem[params.labelField];
                else selectItem.label= resultItem[params.valueField];
                result.items.push(selectItem);
            }
        }
        resultCallback(result);
    });
}
/**
 * params = { source, comboboxFields = { <tableComboboxFieldName>:<sourceFieldName>, ... },
 *      joinedDMSources=[ <joinedSourceName>, ... ]
 *      conditions={ <condition>:<conditionValue>, ... },
 *      order = "<orderFieldsList>"
 * }
 * if !params.conditions returns all items
 * resultCallback = function(result), result = { items:[ {<tableComboboxFieldName>:<value>, ... }, ... ], error, errorCode } )
 */
function _getDataItemsForTableCombobox(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _getDataItemsForTableCombobox! Reason: no function parameters!");//test
        resultCallback("FAILED _getDataItemsForTableCombobox! Reason: no function parameters!");
        return;
    }
    if(!params.comboboxFields){                                                                                 log.error("FAILED _getDataItemsForTableCombobox! Reason: no comboboxFields!");//test
        resultCallback("FAILED _getDataItemsForTableCombobox! Reason: no comboboxFields!");
        return;
    }
    if(!params.source) params.source=this.source;
    if(!params.conditions) params.conditions= {"1=1":null};
    params.fields=[]; params.groupedFields=[];
    var joinedSources;
    for(var cFieldName in params.comboboxFields){
        var cFieldData=params.comboboxFields[cFieldName];
        if(cFieldData&&typeof(cFieldData)=="object"&&cFieldData.source) {
            if(!joinedSources) joinedSources={};
            if(!joinedSources[cFieldData.source]) joinedSources[cFieldData.source]=true;
        }
    }
    for(var cFieldName in params.comboboxFields){
        var cFieldData=params.comboboxFields[cFieldName];
        params.fields.push(cFieldName); params.groupedFields.push(cFieldName);
        if(typeof(cFieldData)=="string"){
            var mainSourceName=(params.source)?params.source:this.source;
            if(!params.fieldsSources) params.fieldsSources={};
            if(joinedSources&&mainSourceName)
                params.fieldsSources[cFieldName]= mainSourceName+"."+cFieldData;
            else
                params.fieldsSources[cFieldName]= cFieldData;
        }else if(cFieldData&&typeof(cFieldData)=="object"&&cFieldData.field){
            if(cFieldData.source){
                if(!params.fieldsSources) params.fieldsSources={};
                params.fieldsSources[cFieldName]= cFieldData.source+"."+cFieldData.field;
            }
        }
    }
    if(joinedSources&&this.joinedSources){
        params.joinedSources={};
        for(var joinedSourceName in joinedSources){
            var joinedSourceMetadata= this.joinedSources[joinedSourceName];
            if(joinedSourceMetadata) params.joinedSources[joinedSourceName]= joinedSourceMetadata;
        }
    }
    _getDataItems(connection,params,function(result){
        if(result.items){
            for(var i in result.items){
                var resultItemData= result.items[i];
                for(var rItemName in resultItemData){
                    var rItemDataValue= resultItemData[rItemName];
                    if(rItemDataValue==null) continue;
                    if(typeof(rItemDataValue)!=="string") resultItemData[rItemName]= rItemDataValue.toString();
                }
            }
        }
        resultCallback(result);
    });
}

/**
 * params = (
 *      fields = [<tableField1Name>,...],
 *      values=[ <valueField1>,<valueField2>,<valueField3>,...]
 * resultCallback = function(itemData), itemData = { item:{<tableFieldName>:<value>,...} } )
 */
function _setDataItem(params, resultCallback){
    var itemData={};
    for(var index=0; index<params.fields.length; index++){
        var fieldName= params.fields[index], value=params.values[index];
        if(value!=undefined) itemData[fieldName]=value;
    }
    resultCallback({item:itemData});
}

function _getDSAlias(sDataSource){
    if(!sDataSource) return sDataSource;
    sDataSource= sDataSource.trim();
    var iSpaceInd= sDataSource.indexOf(" ");
    return (iSpaceInd<0)?sDataSource:sDataSource.substr(iSpaceInd+1,sDataSource.length-iSpaceInd).toLowerCase().replace("as","");
}
/**
 * params = { source, sourceName, sourceType, sourceParamsNames, sourceParams,
 *      tableColumns = [
 *          {data:<dataFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, readOnly:true/false, visible:true/false,
 *              sourceField:<sourceFieldName>,
 *              dataFunction:<sql function or sql expression>
 *             OR dataSource:<sourceName>, sourceField:<sourceFieldName>
 *             OR dataSource:<sourceName>, sourceField:<sourceFieldName>, linkCondition:<dataSource join link condition>
 *             OR childDataSource:<childSourceName>, sourceField:<child dataSource field name>, childLinkCondition:<child dataSource join link condition>
 *             OR childDataSource:<childSourceName>, sourceField:<child dataSource field name>, childLinkField:<childSourceLinkFieldName>, parentDataSource, parentLinkField:<parentSourceLinkFieldName> },
 *          ...
 *      ],
 *      conditions={ <condition>:<conditionValue>, ... },
 *      order = "<orderFieldsList>",
 *      tableData = { columns:tableColumns, identifier:identifier }
 * }
 * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
 * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
 *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
 *              checkbox checkedTemplate:1 uncheckedTemplate:0 /
 *              autocomplete strict allowInvalid sourceURL
 * tableColumns: -readOnly default false, visible default true
 * resultCallback = function(tableData)
 *      tableData = { columns:tableColumns, identifier:identifier, items:[ {<tableFieldName>:<value>,...}, {}, {}, ...], error:errorMessage } )
 */
function _getDataItemsForTable(connection, params, resultCallback){
    var tableData={};
    if(!params){                                                                                                log.error("FAILED _getDataItemsForTable! Reason: no function parameters!");//test
        tableData.error= "FAILED _getDataItemsForTable! Reason: no function parameters!";
        resultCallback(tableData);
        return;
    }
    if(params.tableData) tableData=params.tableData;
    if(!params.tableColumns){                                                                                   log.error("FAILED _getDataItemsForTable! Reason: no table columns!");//test
        tableData.error= "FAILED _getDataItemsForTable! Reason: no table columns!";
        resultCallback(tableData);
        return;
    }
    if(!params.source&&this.source) params.source=this.source;
    if(!params.sourceName) params.sourceName=this.sourceName;
    if(!params.sourceName) params.sourceName=this.source;
    if(!params.sourceType) params.sourceType= this.sourceType;
    if(!params.sourceParamsNames) params.sourceParamsNames= this.sourceParamsNames;
    if(!params.sourceParams) params.sourceParams= this.sourceParams;
    var hasSources=false, hasAFunctions=false;
    for(var i in params.tableColumns){
        var tableColumnData=params.tableColumns[i];
        if(tableColumnData.dataSource) hasSources=true;
        if(tableColumnData.dataFunction
                && (tableColumnData.dataFunction.function=="sumIsNull"||tableColumnData.dataFunction.function=="rowsCountIsNull"))
            hasAFunctions=true;
        if(hasSources&&hasAFunctions) break;
    }
    var fieldsList=[], fieldsSources={}, fieldsFunctions, groupedFieldsList=[], addJoinedSources;
    for(var i in params.tableColumns){
        var tableColumnData= params.tableColumns[i], fieldName= tableColumnData.data;
        if(this.fieldsMetadata&&this.fieldsMetadata[fieldName]&&!tableColumnData.dataFunction){
            if(tableColumnData.name) fieldsList.push(fieldName);
            if(tableColumnData.name&&hasAFunctions) groupedFieldsList.push(fieldName);
            if(tableColumnData.dataSource&&tableColumnData.sourceField)
                fieldsSources[fieldName]= _getDSAlias(tableColumnData.dataSource)+"."+tableColumnData.sourceField;
            else if(tableColumnData.dataSource)
                fieldsSources[fieldName]= _getDSAlias(tableColumnData.dataSource)+"."+fieldName;
            else if(hasSources&&params.sourceName)
                fieldsSources[fieldName]= params.sourceName+"."+fieldName;
        }else if(!tableColumnData.dataFunction &&( tableColumnData.sourceField||tableColumnData.dataSource||tableColumnData.childDataSource)){
            if(tableColumnData.name) fieldsList.push(fieldName);
            if(tableColumnData.name&&hasAFunctions) groupedFieldsList.push(fieldName);
            var fieldDS="";
            if(hasSources) fieldDS= params.sourceName+".";
            if(tableColumnData.dataSource) fieldDS= _getDSAlias(tableColumnData.dataSource)+".";
            if(tableColumnData.childDataSource) fieldDS= tableColumnData.childDataSource+".";
            if(tableColumnData.sourceField)
                fieldsSources[fieldName]= fieldDS+tableColumnData.sourceField;
            else
                fieldsSources[fieldName]= fieldDS+fieldName;
        }else if(tableColumnData.dataFunction){
            if(tableColumnData.name) fieldsList.push(fieldName);
            if(hasAFunctions&&tableColumnData.name&&!tableColumnData.dataFunction
                    &&tableColumnData.dataFunction.function!="sumIsNull"&&tableColumnData.dataFunction.function!="rowsCountIsNull")
                groupedFieldsList.push(fieldName);
            if(!fieldsFunctions) fieldsFunctions={};
            fieldsFunctions[fieldName]= tableColumnData.dataFunction;
        }else if(!this.fieldsMetadata){
            if(tableColumnData.name) fieldsList.push(fieldName);
            if(tableColumnData.name&&hasAFunctions)groupedFieldsList.push(fieldName);
        }
        if(tableColumnData.dataSource && this.joinedSources&&this.joinedSources[tableColumnData.dataSource]){
            if(!params.joinedSources) params.joinedSources={};
            params.joinedSources[tableColumnData.dataSource]= this.joinedSources[tableColumnData.dataSource];
        }else if(tableColumnData.dataSource&&tableColumnData.linkCondition){
            if(!addJoinedSources) addJoinedSources={};
            if(!addJoinedSources[tableColumnData.dataSource]){
                var joinedSourceLinkConditions={};
                joinedSourceLinkConditions[tableColumnData.linkCondition]=null;
                addJoinedSources[tableColumnData.dataSource]= joinedSourceLinkConditions;
            }
        }
        if(tableColumnData.childDataSource&& (!params.leftJoinedSources||!params.leftJoinedSources[tableColumnData.childDataSource])){
            if(!params.leftJoinedSources) params.leftJoinedSources={};
            var childLinkConditions={};
            var parentDataSource= tableColumnData.parentDataSource;
            if(!parentDataSource&&params.source) parentDataSource= params.source;
            if(!parentDataSource&&this.source) parentDataSource= this.source;
            if(tableColumnData.childLinkCondition) childLinkConditions[tableColumnData.childLinkCondition]=null;
            else childLinkConditions[tableColumnData.childDataSource+"."+tableColumnData.childLinkField+"="+parentDataSource+"."+tableColumnData.parentLinkField]=null;
            params.leftJoinedSources[tableColumnData.childDataSource]= childLinkConditions;
        }
        if(tableColumnData.leftJoinedSources){
            params.leftJoinedSources= tableColumnData.leftJoinedSources;
        }
    }
    params.fields=fieldsList;
    params.fieldsSources=fieldsSources;
    if(addJoinedSources){
        if(!params.joinedSources) params.joinedSources={};
        for(var sourceName in addJoinedSources) params.joinedSources[sourceName]= addJoinedSources[sourceName];
    }
    params.fieldsFunctions=fieldsFunctions;
    if(groupedFieldsList.length>0) params.groupedFields= groupedFieldsList;
    _getSelectItems(connection, params, function(err,recordset){
        if(err) tableData.error= "Failed get data for table! Reason:"+err.message;
        tableData.items= recordset;
        resultCallback(tableData);
    });
}
function _getDataItemForTable(connection, params, resultCallback){
    this.getDataItemsForTable(connection, params,function(tableData){
        var tableDataItem={};
        for(var itemName in tableData){
            if(itemName!="items"){
                tableDataItem[itemName]= tableData[itemName];
                continue;
            }
            var tableDataItems= tableData.items;
            if(tableDataItems&&tableDataItems.length>1){
                tableDataItem.error= "Failed get data item for table! Reason: result contains more that one items!";
                continue;
            } else if(!tableDataItems||tableDataItems.length==0){
                continue;
            }
            tableDataItem.item= tableDataItems[0];
        }                                                                                                       //log.debug('_getDataItemForTable: getDataItemsForTable: tableDataItem:',tableDataItem,{});//test
        resultCallback(tableDataItem);
    });
}
/**
 * tableColumns = [
 *      { data:<tableFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, align:"left"/"center"/"right",
 *          useFilter:true/false default:true, readOnly:true/false, default:false, visible:true/false default:true },
 *       ...
 * ]
 * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
 *                              / combobox,sourceURL / comboboxWN,sourceURL
 * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
 *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
 *              checkbox, checkedTemplate:1, uncheckedTemplate:0 /
 *              autocomplete, strict, allowInvalid, sourceURL
 */
function _getTableColumnsDataForHTable(tableColumns){
    if(!tableColumns) return tableColumns;
    var htTableColumns=[];
    for(var col=0;col<tableColumns.length;col++){
        var tableColData=tableColumns[col];
        if(!tableColData||!tableColData.data||!tableColData.name) continue;
        var thTableColumnsItem= { data:tableColData.data };
        if(tableColData.identifier!==undefined) thTableColumnsItem.identifier=tableColData.identifier;
        if(tableColData.name!==undefined) thTableColumnsItem.name=tableColData.name;
        if(tableColData.width!==undefined) thTableColumnsItem.width=tableColData.width;
        if(tableColData.type!==undefined) thTableColumnsItem.type=tableColData.type;
        if(tableColData.align!==undefined) thTableColumnsItem.align=tableColData.align;
        if(tableColData.useFilter!==undefined) thTableColumnsItem.useFilter=tableColData.useFilter;
        if(tableColData.readOnly!==undefined) thTableColumnsItem.readOnly=tableColData.readOnly;
        if(tableColData.visible!==undefined) thTableColumnsItem.visible=tableColData.visible;
        if(tableColData.format!==undefined) thTableColumnsItem.format=tableColData.format;
        //if(tableColData.trimWhitespace!==undefined) thTableColumnsItem.trimWhitespace=tableColData.trimWhitespace;
        //else thTableColumnsItem.trimWhitespace=false;
        if(tableColData.dateFormat!==undefined) thTableColumnsItem.dateFormat=tableColData.dateFormat;
        if(tableColData.datetimeFormat!==undefined) thTableColumnsItem.datetimeFormat=tableColData.datetimeFormat;
        if(tableColData.format!==undefined) thTableColumnsItem.format=tableColData.format;
        if(tableColData.language!==undefined) thTableColumnsItem.language=tableColData.language;
        if(tableColData.checkedTemplate!==undefined) thTableColumnsItem.checkedTemplate=tableColData.checkedTemplate;
        if(tableColData.uncheckedTemplate!==undefined) thTableColumnsItem.uncheckedTemplate=tableColData.uncheckedTemplate;
        if(tableColData.strict!==undefined) thTableColumnsItem.strict=tableColData.strict;
        if(tableColData.allowInvalid!==undefined) thTableColumnsItem.allowInvalid=tableColData.allowInvalid;
        if(tableColData.sourceURL!==undefined) thTableColumnsItem.sourceURL=tableColData.sourceURL;
        htTableColumns.push(thTableColumnsItem);
        if(thTableColumnsItem.type=="dateAsText"){
            thTableColumnsItem.type="text";
            //if(!tableColumnsDataItemForHTable.dateFormat) tableColumnsDataItemForHTable.dateFormat="DD.MM.YY";
            if(!thTableColumnsItem.datetimeFormat) thTableColumnsItem.datetimeFormat="DD.MM.YY";
        } else if(thTableColumnsItem.type=="datetimeAsText"){
            thTableColumnsItem.type="text";
            //if(!tableColumnsDataItemForHTable.dateFormat) tableColumnsDataItemForHTable.dateFormat="DD.MM.YY HH:mm:ss";
            if(!thTableColumnsItem.datetimeFormat) thTableColumnsItem.datetimeFormat="DD.MM.YY HH:mm:ss";
        } else if(thTableColumnsItem.type=="numeric"){
            if(!thTableColumnsItem.format) thTableColumnsItem.format="#,###,###,##0.[#########]";
            if(!thTableColumnsItem.language) thTableColumnsItem.language="ru-RU";
        } else if(thTableColumnsItem.type=="numeric2"){
            thTableColumnsItem.type="numeric";
            if(!thTableColumnsItem.format) thTableColumnsItem.format="#,###,###,##0.00[#######]";
            if(!thTableColumnsItem.language) thTableColumnsItem.language="ru-RU";
        } else if(thTableColumnsItem.type=="checkbox"){
            if(!thTableColumnsItem.checkedTemplate) thTableColumnsItem.checkedTemplate="1";
            if(!thTableColumnsItem.uncheckedTemplate) thTableColumnsItem.uncheckedTemplate="0";
        } else if(thTableColumnsItem.type=="checkboxMSSQL"){
            thTableColumnsItem.type="checkbox";
            if(!thTableColumnsItem.checkedTemplate) thTableColumnsItem.checkedTemplate="true";
            if(!thTableColumnsItem.uncheckedTemplate) thTableColumnsItem.uncheckedTemplate="false";
        } else if(thTableColumnsItem.type=="combobox"||thTableColumnsItem.type=="comboboxWN") {
            thTableColumnsItem.strict= true;
            if(thTableColumnsItem.type=="combobox") thTableColumnsItem.allowInvalid=false; else thTableColumnsItem.allowInvalid=true;
            thTableColumnsItem.filter= false;
            thTableColumnsItem.type="autocomplete";
        } else if(!thTableColumnsItem.type) thTableColumnsItem.type="text";
    }
    return htTableColumns;
}
/**
 * params = { source,
 *      tableColumns = [
 *          {data:<sourceFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, readOnly:true/false, visible:true/false,
 *                dataSource:<sourceName>, sourceField:<sourceFieldName>,
 *              dataFunction:<sql function or sql expression>
 *                },
 *          ...
 *      ],
 *      identifier= <sourceIDFieldName>,
 *      conditions={ <condition>:<conditionValue>, ... },
 *      aconditions={ <condition>:<conditionValue>, ... }, - additional conditions, added to conditions if conditions exists items
 *      order = "<orderFieldsList>"
 * }
 * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
 * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
 *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
 *              checkbox checkedTemplate:1 uncheckedTemplate:0 /
 *              autocomplete strict allowInvalid sourceURL
 * tableColumns: -readOnly default false, visible default true
 * resultCallback = function(tableData)
 *      tableData= { columns:tableColumns, identifier:identifier, items:[ {<tableFieldName>:<value>,...}, {}, {}, ...], error:errorMessage } )
 */
function _getDataForTable(connection, params, resultCallback){
    var tableData={};
    if(!params){                                                                                                log.error("FAILED _getDataForTable! Reason: no function parameters!");//test
        tableData.error= "FAILED _getDataForTable! Reason: no function parameters!";
        resultCallback(tableData);
        return;
    }
    if(!params.tableColumns){                                                                                   log.error("FAILED _getDataForTable! Reason: no table columns!");//test
        tableData.error= "FAILED _getDataForTable! Reason: no table columns!";
        resultCallback(tableData);
        return;
    }
    tableData.columns= _getTableColumnsDataForHTable(params.tableColumns);
    tableData.identifier=params.identifier;
    if(!params.conditions){ resultCallback(tableData); return; }
    var hasConditions=false;
    for(var conditionItem in params.conditions){ hasConditions=true; break; }
    if(!hasConditions){ resultCallback(tableData); return; }
    if(params.aconditions) for(var acondItem in params.aconditions){ params.conditions[acondItem]= params.aconditions[acondItem]; }
    params.tableData=tableData;
    this.getDataItemsForTable(connection, params, resultCallback);
}
/**
 * set column width and type for tableColumnItem.data containing "QTY"/"PRICE"/"SUM"/"NUMBER"/"DATE"
 */
function _getTableColumnsDataForDocHTable(tableColumns){
    if(!tableColumns) return tableColumns;
    for(var col=0;col<tableColumns.length;col++){
        var tableColData=tableColumns[col];
        if(!tableColData||!tableColData.data) continue;
        if(tableColData.width===undefined){
            if(tableColData.data.indexOf("QTY")>=0) tableColData.width=50;
            else if(tableColData.data.indexOf("PRICE")>=0) tableColData.width=65;
            else if(tableColData.data.indexOf("SUM")>=0) tableColData.width=80;
            else if(tableColData.data.indexOf("NUMBER")>=0) tableColData.width=65;
            else if(tableColData.data=="POS"||tableColData.data.indexOf("POSITION")==0) tableColData.width=75;
            else if(tableColData.data.indexOf("DATE")>=0) tableColData.width=55;
        }
        if(tableColData.align===undefined){
            if(tableColData.data.indexOf("DATE")>=0
                || tableColData.data.indexOf("NUMBER")>=0
                || tableColData.data.indexOf("POSITION")==0 || tableColData.data=="POS") tableColData.align="center";
        }
        if(tableColData.type===undefined){
            if(tableColData.data.indexOf("QTY")>=0) tableColData.type="numeric";
            else if(tableColData.data.indexOf("PRICE")>=0) tableColData.type="numeric2";
            else if(tableColData.data.indexOf("SUM")>=0) tableColData.type="numeric2";
            else if(tableColData.data.indexOf("NUMBER")>=0
                ||tableColData.data=="POS"||tableColData.data.indexOf("POSITION")==0) tableColData.type="numeric";
            else if(tableColData.data.indexOf("DATE")>=0) tableColData.type="dateAsText";
        }
    }
    return tableColumns;
}
function _getDataForDocTable(connection, params, resultCallback){
    var tableData={};
    if(!params){                                                                                                log.error("FAILED _getDataForDocTable! Reason: no function parameters!");//test
        tableData.error= "FAILED _getDataForDocTable! Reason: no function parameters!";
        resultCallback(tableData);
        return;
    }
    if(!params.tableColumns){                                                                                   log.error("FAILED _getDataForDocTable! Reason: no table columns!");//test
        tableData.error= "FAILED _getDataForDocTable! Reason: no table columns!";
        resultCallback(tableData);
        return;
    }
    tableData.columns= _getTableColumnsDataForHTable(_getTableColumnsDataForDocHTable(params.tableColumns));
    tableData.identifier= params.identifier;
    if(!params.conditions){ resultCallback(tableData); return; }
    var hasConditions=false;
    for(var conditionItem in params.conditions){ hasConditions=true; break; }
    if(!hasConditions){ resultCallback(tableData); return; }
    var tableConditions={};
    for(var conditionItem in params.conditions) tableConditions[conditionItem]= params.conditions[conditionItem];
    params.conditions=tableConditions;
    params.tableData=tableData;
    this.getDataItemsForTable(connection, params, resultCallback);
}
/**
 * params = {
 *      tableColumns = [{data:<tableField1Name>},{data:<tableField2Name>},{data:<tableField3Name>},...],
 *      values=[ <valueField1>,<valueField2>,<valueField3>,...]
 * }
 * resultCallback = function(itemData), itemData = { item:{<tableFieldName>:<value>,...} } )
 */
function _setDataItemForTable(params, resultCallback){
    var itemData={};
    for(var columnIndex=0; columnIndex<params.tableColumns.length; columnIndex++){
        var fieldName= params.tableColumns[columnIndex].data, value= params.values[columnIndex];
        if(value!=undefined) itemData[fieldName]= value;
    }
    resultCallback({item:itemData});
}

/**
 * params = { tableName,
 *      insData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 * }
 * <value> instanceof Date converted to sting by format yyyy-mm-dd HH:MM:ss !!!
 * resultCallback = function(result), result = { updateCount, error,errorMessage }
 */
function _insDataItem(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _insDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed insert data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName&&this.source) params.tableName= this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _insDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed insert data item! Reason:no table name for insert!"});
        return;
    }
    if(!params.insData){                                                                                        log.error("FAILED _insDataItem into "+params.tableName+"! Reason: no data for insert!");//test
        resultCallback({error:"Failed insert data item! Reason:no data for insert!"});
        return;
    }
    var queryFields="", queryInputParams=[], queryFieldsValues="";
    for(var fieldName in params.insData){
        if(queryFields!="") queryFields+= ",";
        if(queryFieldsValues!="") queryFieldsValues+= ",";
        queryFields+= fieldName;
        queryFieldsValues+= "@p"+queryInputParams.length;
        var insDataItemValue=params.insData[fieldName];
        if(insDataItemValue&&(insDataItemValue instanceof Date)){
            insDataItemValue= dateFormat(insDataItemValue,"yyyy-mm-dd HH:MM:ss");
        }
        queryInputParams.push(insDataItemValue);
    }
    var insQuery="insert into "+params.tableName+"("+queryFields+") values("+queryFieldsValues+")";
    database.executeParamsQuery(connection, insQuery,queryInputParams,function(err,updateCount){
        if(err){
            resultCallback({error:"Failed insert data item! Reason:"+(err.message||"UNKNOWN")});
            return;
        }
        var insResult= {updateCount:updateCount};
        if(updateCount==0) insResult.error= "Failed insert data item! Reason: no inserted row count!";
        resultCallback(insResult);
    });
}
/**
 * params = { tableName, idFieldName,
 *      insData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 * }
 * callback = function(result,params), result= { data, error,errorMessage }
 */
function _calcNewIDValueOnInsDataItemWithNewID(params,callback){
    if(params.insData&&params.idFieldName) params.insData[params.idFieldName]=common.getUIDNumber();
    callback({data:params.insData},params);
}
/**
 * params = { tableName, idFieldName,
 *      insData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
 *      calcNewIDValue = function(params,callback), callback= function(result,params), result= { data, error }
 * }
 * resultCallback = function(result), result = { updateCount, error,errorMessage }
 */
function _insDataItemWithNewID(connection,params,resultCallback){
    if(!params){                                                                                                log.error("FAILED _insDataItemWithNewID! Reason: no parameters!");//test
        resultCallback({error:"Failed insert data item with new ID! Reason:no function parameters!"});
        return;
    }
    var idFieldName= params.idFieldName;
    if(!idFieldName){                                                                                           log.error("FAILED _insDataItemWithNewID "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed insert data item with new ID! Reason:no id field name!"});
        return;
    }
    if(!params.calcNewIDValue) params.calcNewIDValue= this.calcNewIDValueOnInsDataItemWithNewID;
    var thisInstance=this;
    params.calcNewIDValue(params, function(result,params){
        if(!result||!result.data){                                                                              log.error("FAILED _insDataItemWithNewID calcNewIDValue "+((params)?params.tableName:params)+"! Reason: no result of calcNewIDValue!");//test
            resultCallback({error:"Failed calc new ID value! Reason: no calc result."});
            return;
        }
        if(result.error){                                                                                       log.error("FAILED _insDataItemWithNewID calcNewIDValue "+((params)?params.tableName:params)+"! Reason:"+result.error);//test
            resultCallback({error:result.error,errorMessage:result.errorMessage});
            return;
        }
        params.insData= result.data;//equals
        thisInstance.insDataItem(connection, {tableName:params.tableName, insData:params.insData}, function(result){
            if(result&&result.updateCount>0) result.resultItem= params.insData;
            resultCallback(result);
        });
    });
}
/**
 * params = { tableName,
 *      updData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
 *      conditions = { <tableFieldNameCondition>:<value>, ... },
 *      ignoreErrorNoUpdate = true/false
 * }
 * resultCallback = function(result), result = { updateCount, error,errorMessage })
 */
function _updDataItem(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _updDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed update data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName&&this.source) params.tableName=this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _updDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed update data item! Reason:no table name for update!"});
        return;
    }
    if(!params.updData){                                                                                        log.error("FAILED _updDataItem "+params.tableName+"! Reason: no data for update!");//test
        resultCallback({error:"Failed update data item! Reason:no data for update!"});
        return;
    }
    if(!params.conditions){                                                                                     log.error("FAILED _updDataItem "+params.tableName+"! Reason: no conditions!");//test
        resultCallback({error:"Failed update data item! Reason:no update conditions!"});
        return;
    }
    var queryFields="", fieldsValues=[];
    for(var fieldName in params.updData){
        if(queryFields!="") queryFields+= ",";
        queryFields+= fieldName+"=@p"+fieldsValues.length;
        var updDataItemValue= params.updData[fieldName];
        if(updDataItemValue&&(updDataItemValue instanceof Date)){
            updDataItemValue= dateFormat(updDataItemValue,"yyyy-mm-dd HH:MM:ss");
        }
        fieldsValues.push(updDataItemValue);
    }
    var updQuery= "update "+params.tableName+" set "+queryFields, queryConditions="";
    for(var fieldNameCondition in params.conditions){
        if(queryConditions!="") queryConditions+= " and ";
        queryConditions+= fieldNameCondition.replace("~","=")+"@p"+fieldsValues.length;
        fieldsValues.push(params.conditions[fieldNameCondition]);
    }
    updQuery+= " where "+queryConditions;
    database.executeParamsQuery(connection,updQuery,fieldsValues,function(err,updateCount){
        if(err){
            resultCallback({error:err.message,errorMessage:"Failed update data item! Reason:"+err.message});
            return;
        }
        var updResult={updateCount:updateCount};
        if(updateCount==0&&!params.ignoreErrorNoUpdate) updResult.error= "Failed update data item! Reason: no updated row count!";
        resultCallback(updResult);
    });
}
/**
 * params = { tableName, idFieldName,
 *      storeData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 * }
 * resultCallback = function(result), result = { updateCount, resultItem, error } )
 */
function _storeDataItem(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _storeDataItem! Reason: no parameters!");//test
        resultCallback({ error:"Failed store data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName) params.tableName= this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _storeDataItem! Reason: no table name!");//test
        resultCallback({ error:"Failed store data item! Reason:no table name for store!"});
        return;
    }
    if(!params.storeData){                                                                                      log.error("FAILED _storeDataItem "+params.tableName+"! Reason: no data for store!");//test
        resultCallback({error:"Failed store data item! Reason:no data for store!"});
        return;
    }

    var idFieldName= params.idFieldName;
    if(!idFieldName){                                                                                           log.error("FAILED _storeDataItem "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed store data item! Reason:no id field name!"});
        return;
    }
    var idValue= params.storeData[idFieldName];
    if(idValue===undefined||idValue===null){//insert
        this.insDataItemWithNewID(connection, {idFieldName:idFieldName, insData:params.storeData}, resultCallback);
        return;
    }
    //update
    var updData= {}, updCondition={}; updCondition[idFieldName]= params.storeData[idFieldName];
    for(var storeItemName in params.storeData)
        if(storeItemName!=idFieldName) updData[storeItemName]= params.storeData[storeItemName];
    this.updDataItem(connection, {idFieldName:idFieldName, updData:updData, conditions:updCondition}, function(result){
        if(result&&result.updateCount>0) result.resultItem= params.storeData;
        resultCallback(result);
    });
}
/**
 * params = { tableName,
 *      conditions = { <tableFieldNameCondition>:<value>, ... }
 * }
 * resultCallback = function(result), result = { updateCount, error })
 */
function _delDataItem(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _delDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed delete data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName&&this.source) params.tableName=this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _delDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed delete data item! Reason:no table name for delete!"});
        return;
    }
    if(!params.conditions){                                                                                     log.error("FAILED _delDataItem "+params.tableName+"! Reason: no conditions!");//test
        resultCallback({error:"Failed delete data item! Reason:no delete conditions!"});
        return;
    }
    var fieldsValues=[], delQuery= "delete from "+params.tableName, queryConditions="";
    for(var fieldNameCondition in params.conditions){
        if(queryConditions!="") queryConditions+= " and ";
       // queryConditions+= fieldNameCondition.replace("~","=")+"?";
        queryConditions+= fieldNameCondition.replace("~","=")+"@p"+fieldsValues.length;
        fieldsValues.push(params.conditions[fieldNameCondition]);
    }
    delQuery+= " where "+queryConditions;
    database.executeParamsQuery(connection,delQuery,fieldsValues,function(err,updateCount){
        var delResult= {};
        if(err){
            delResult.error="Failed delete data item! Reason:"+err.message;
            resultCallback(delResult);
            return;
        }
        delResult.updateCount= updateCount;
        if(updateCount==0) delResult.error= "Failed delete data item! Reason: no updated row count!";
        resultCallback(delResult);
    });
}

/**
 * params = { tableName, resultFields, findByFields, idFieldName,
 *      fieldsValues = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
 *      fieldsDefValues = {<tableFieldName>:<value>,...},
 *      calcNewIDValue = function(params, callback), callback= function(params)
 * }
 * resultCallback = function(result), result = { resultItem, error } )
 * result.resultItem = fieldsDefValues where no fieldsValues or values of fieldsValues item is undefined
 */
function _findDataItemByOrCreateNew(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _findDataItemByOrCreateNew! Reason: no parameters!");//test
        resultCallback({error:"Failed find/create data item! Reason:no function parameters!"});
        return;
    }
    if(!params.resultFields||!params.resultFields.length){                                                      log.error("FAILED _findDataItemByOrCreateNew! Reason: no result fields!");//test
        resultCallback({error:"Failed find/create data item! Reason:no result fields!"});
        return;
    }
    if(!params.findByFields||!params.findByFields.length){                                                      log.error("FAILED _findDataItemByOrCreateNew! Reason: no fields for find condition!");//test
        resultCallback({error:"Failed find/create data item! Reason:no fields for find condition!"});
        return;
    }
    if(!params.idFieldName){                                                                                    log.error("FAILED _findDataItemByOrCreateNew! Reason: no id field!");//test
        resultCallback({error:"Failed find/create data item! Reason:no id field!"});
        return;
    }
    if(!params.fieldsValues){                                                                                   log.error("FAILED _findDataItemByOrCreateNew! Reason: no fields values!");//test
        resultCallback({error:"Failed find/create data item! Reason:no fields values!"});
        return;
    }
    var findCondition={}, hasCondition=false;
    for(var ind=0;ind<params.findByFields.length;ind++){
        var fieldName= params.findByFields[ind];
        if(!params.fieldsValues.hasOwnProperty(fieldName))continue;
        var fieldValue= params.fieldsValues[fieldName];
        if(fieldValue===undefined)continue;
        findCondition[fieldName+"="]= fieldValue;
        hasCondition= true;
    }
    if(!hasCondition&&params.fieldsDefValues){
        resultCallback({resultItem:params.fieldsDefValues});
        return;
    }
    var thisInstance=this;
    this.getDataItem(connection, {fields:params.resultFields,conditions:findCondition}, function(result){
        if(result.error){
            resultCallback({error:"Failed find/create data item! Reason:"+result.error});
            return;
        }
        if(!result.item){
            thisInstance.insDataItemWithNewID(connection,
                {idFieldName:params.idFieldName,insData:params.fieldsValues,calcNewIDValue:params.calcNewIDValue},
                resultCallback);
            return;
        }
        resultCallback({resultItem:result.item});
    });
}

/**
 * params = { tableName, idFieldName, idFields, tableColumns
 *      insTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 * }
 * resultCallback = function(result), result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error })
 */
function _insTableDataItem(connection, params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _insTableDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed insert table data item! Reason:no parameters!"});
        return;
    }
    if(!params.tableName&&this.source) params.tableName=this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _insTableDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed insert table data item! Reason:no table name!"});
        return;
    }
    if(!params.insTableData){                                                                                   log.error("FAILED _insTableDataItem "+params.tableName+"! Reason: no data for insert!");//test
        resultCallback({error:"Failed insert table data item! Reason:no data for insert!"});
        return;
    }
    var idFieldName= params.idFieldName, idFields= params.idFields;
    if(!idFieldName&&!idFields){                                                                                log.error("FAILED _insTableDataItem "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed insert table data item! Reason:no id fields name!"});
        return;
    }
    if(!params.tableColumns){                                                                                   log.error("FAILED _insTableDataItem "+params.tableName+"! Reason: no table columns!");//test
        resultCallback({error:"Failed insert table data item! Reason:no table columns!"});
        return;
    }
    params.insData= {};
    if(this.fields){
        for(var i in this.fields){
            var fieldName=this.fields[i];
            params.insData[fieldName]= (params.insTableData[fieldName]==undefined)?null:params.insTableData[fieldName];
        }
    } else params.insData= params.insTableData;
    var thisInstance=this;
    _insDataItem(connection, params, function(insResult){
        if(insResult.error){
            resultCallback(insResult);
            return;
        }
        var resultFields=[];
        for(var fieldName in params.insTableData) resultFields.push(fieldName);
        var getResultConditions={};
        if(idFieldName)
            getResultConditions[params.tableName+"."+idFieldName+"="]= params.insTableData[idFieldName];
        else
            for(var i in idFields){
                var idFieldNameItem=idFields[i];
                getResultConditions[params.tableName+"."+idFieldNameItem+"="]=params.insTableData[idFieldNameItem];
            }
        thisInstance.getDataItemForTable(connection, {source:params.tableName, tableColumns:params.tableColumns, conditions:getResultConditions},
            function(result){
                if(result.error) insResult.error= "Failed get result inserted data item! Reason:"+result.error;
                if(result.item) insResult.resultItem= result.item;
                resultCallback(insResult);
            });
    });
}

/**
 * params = { tableName, idFieldName, idFields,
 *      updFields = [<tableFieldName>,...],
 *      updTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
 *      updTableFieldsData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
 *      tableColumns=[ {<tableColumnData>},... ], resultItemIDFields = [<idFieldName>,...]
 * }
 * params may be contain updTableData with or without updFields, OR only updTableFieldsData
 * tableColumns used for return resultItem data
 * if exists resultItemConditions resultItem data returned by resultItemConditions
 * resultCallback = function(result), result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error })
 */
function _updTableDataItem(connection, params, resultCallback){
    if(!params) {                                                                                               log.error("FAILED _updTableDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed update table data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName&&this.source) params.tableName=this.source;
    if(!params.tableName) {                                                                                     log.error("FAILED _updTableDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed update table data item! Reason:no table name!"});
        return;
    }
    if(!params.updTableData&&!params.updTableFieldsData){                                                       log.error("FAILED _updTableDataItem "+params.tableName+"! Reason: no data for update!");//test
        resultCallback({error:"Failed update table data item! Reason:no data for update!"});
        return;
    }
    var idFieldName= params.idFieldName,idFields= params.idFields;
    if(!idFieldName&&!idFields){                                                                                log.error("FAILED _updTableDataItem "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed update table data item! Reason:no id fields name!"});
        return;
    }
    params.updData= {};
    var idFiledsNames= {};
    if(idFieldName)idFiledsNames[idFieldName]=true;
    else
        for(var i in idFields) idFiledsNames[idFields[i]]=true;
    if(params.updFields){
        for(var i in params.updFields){
            var fieldName= params.updFields[i];
            if(!idFiledsNames[fieldName]) params.updData[fieldName]= params.updTableData[fieldName];
        }
    }else if(params.updTableFieldsData){
        for(var updFieldName in params.updTableFieldsData)
            if(!idFiledsNames[updFieldName]) params.updData[updFieldName]= params.updTableFieldsData[updFieldName];
    }else if(this.fields){
        for(var i in this.fields){
            var fieldName= this.fields[i];
            if(!idFiledsNames[fieldName]) params.updData[fieldName]= params.updTableData[fieldName];
        }
    }else{
        for(var updFieldName in params.updTableData)
            if(!idFiledsNames[updFieldName]) params.updData[updFieldName]= params.updTableData[updFieldName];
    }
    params.conditions= {};
    if(idFieldName&&params.updTableData)
        params.conditions[params.tableName+"."+idFieldName+"="]= params.updTableData[idFieldName];
    else if(idFieldName&&params.updTableFieldsData)
        params.conditions[params.tableName+"."+idFieldName+"="]= params.updTableFieldsData[idFieldName];
    else
        for(var i in idFields){
            var idFieldNameItem= idFields[i],
                idFieldVal= (params.updTableData)?params.updTableData[idFieldNameItem]:params.updTableFieldsData[idFieldNameItem];
            params.conditions[params.tableName+"."+idFieldNameItem+"="]= idFieldVal;
        }
    var thisInstance=this;
    _updDataItem(connection, params, function(updResult){
        if(updResult.error){ resultCallback(updResult); return; }
        thisInstance.getDataItemForTable(connection, {source:params.tableName, tableColumns:params.tableColumns, conditions:params.resultItemConditions||params.conditions},
            function(result){
                if(result.error) updResult.error= "Failed get result updated data item! Reason:"+result.error;
                if(result.item) updResult.resultItem= result.item;
                resultCallback(updResult);
            });
    });
}
/**
 * callback = function(params)
 */
function _calcNewIDValueOnStoreTableDataItem(params, callback){
    if(params.storeTableData&&params.idFieldName) params.storeTableData[params.idFieldName]=common.getUIDNumber();
    callback(params);
}
/**
 * params = { tableName, idFieldName, idFields, tableColumns,
 *      storeTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 *      calcNewIDValue = function(params, callback), callback= function(params)
 * }
 * resultCallback = function(result), result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error } )
 */
function _storeTableDataItem(connection,params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _storeTableDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed store table data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName) params.tableName= this.source;
    if(!params.tableName){                                                                                      log.error("FAILED _storeTableDataItem! Reason: no table name!");//test
        resultCallback({error:"Failed store table data item! Reason:no table name for store!"});
        return;
    }
    if(!params.storeTableData){                                                                                 log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no data for store!");//test
        resultCallback({error:"Failed store table data item! Reason:no data for store!"});
        return;
    }
    var idFieldName= params.idFieldName,idFields= params.idFields;
    if(!idFieldName&&!idFields){                                                                                log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed store table data item! Reason:no id fields name!"});
        return;
    }
    if(!params.tableColumns){                                                                                   log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no table columns!");//test
        resultCallback({error:"Failed store table data item! Reason:no table columns!"});
        return;
    }
    var isInsert=false;
    if(idFieldName){
        var idValue=params.storeTableData[idFieldName];
        isInsert= (idValue===undefined||idValue===null);
    }else{
        for(var i in idFields){
            var idFieldNameItem= idFields[i], idValueItem= params.storeTableData[idFieldNameItem];
            isInsert= (idValueItem===undefined||idValueItem===null);
            if(isInsert) break;
        }
    }
    if(isInsert){//insert
        if(!params.calcNewIDValue) params.calcNewIDValue= this.calcNewIDValueOnStoreTableDataItem;
        var thisInstance=this;
        params.calcNewIDValue(params, function(params){
            thisInstance.insTableDataItem(connection, {tableName:params.tableName, idFieldName:idFieldName,idFields:idFields,
                tableColumns:params.tableColumns,insTableData:params.storeTableData}, resultCallback);
        });
        return;
    }
    //update
    this.updTableDataItem(connection, {tableName:params.tableName, idFieldName:idFieldName,idFields:idFields,
        tableColumns:params.tableColumns,updTableData:params.storeTableData}, resultCallback);
}

/**
 * params = { tableName, idFieldName, idFields,
 *      delTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
 * }
 * resultCallback = function(result), result = { updateCount, error })
 */
function _delTableDataItem(connection,params, resultCallback){
    if(!params){                                                                                                log.error("FAILED _delTableDataItem! Reason: no parameters!");//test
        resultCallback({error:"Failed delete table data item! Reason:no function parameters!"});
        return;
    }
    if(!params.tableName) params.tableName= this.source;
    if(!params.delTableData){                                                                                   log.error("FAILED _delTableDataItem "+params.tableName+"! Reason: no data for delete!");//test
        resultCallback({error:"Failed delete table data item! Reason:no data for delete!"});
        return;
    }
    var idFieldName= params.idFieldName,idFields= params.idFields;
    if(!idFieldName&&!idFields){                                                                                log.error("FAILED _delTableDataItem "+params.tableName+"! Reason: no id field!");//test
        resultCallback({error:"Failed delete table data item! Reason:no id fields name!"});
        return;
    }
    params.conditions= {};
    var resultItem= {};
    if(idFieldName){
        var idFieldValue= params.delTableData[idFieldName];
        params.conditions[params.tableName+"."+idFieldName+"="]= idFieldValue;
        resultItem[idFieldName]= idFieldValue;
    }else
        for(var i in idFields){
            var idFieldsNameItem= idFields[i], idFieldValueItem= params.delTableData[idFieldsNameItem];
            params.conditions[params.tableName+"."+idFieldsNameItem+"="]= idFieldValueItem;
            resultItem[idFieldsNameItem]= idFieldValueItem;
        }
    _delDataItem(connection,params, function(delResult){
        if(delResult.updateCount==1) delResult.resultItem= resultItem;
        resultCallback(delResult);
    });
}
