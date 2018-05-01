
var fs = require('fs');       console.log('module for databaseMSSQL.js  fs');
var mssql = require('mssql');   console.log('module for databaseMSSQL.js mssql');
//var app = require('./app');   console.log('module for databaseMSSQL.js ./app');
   console.log('module for databaseMSSQL.js ./app');

var common=require('./common');
//var logger=require('./logger')();
var server = require('./server');
var log =server.log;
//var app=server.getApp();

//var dbConfig;
//var dbConfigFilePath;
//var conn=null;
var dbConnectError=null;

function getDBConfig(){
    var serverConfig= server.getServerConfig();
    return { host:serverConfig.host, database:serverConfig.database, user:serverConfig.user, password:serverConfig.password,
        supportBigNumbers:true };
}
module.exports.getDBConnectError= function(){ return dbConnectError; };



//global.appViewsPath= path.join(__dirname,'/../pages/','');
//global.appModulesPath= path.join(__dirname,'/modules/','');
//global.appDataModelPath= path.join(__dirname,'/datamodel/','');

//var appModules=require("./modules");
//var loadInitModulesErrorMsg=null;
//module.exports.getLoadInitModulesError= function(){ return loadInitModulesErrorMsg; };
//appModules.validateModules(function(errs, errMessage){
//    if (errMessage){                                                                                log.error("FAILED validate! Reason: ",errMessage);
//    }
//    appModules.init(server,errs);
//    if(errs&&!errMessage){
//        var eCount=0;
//        for(var errItem in errs){
//            if (!loadInitModulesErrorMsg) loadInitModulesErrorMsg=""; else loadInitModulesErrorMsg+="<br>";
//            loadInitModulesErrorMsg+=errs[errItem];
//            eCount++;
//            if(eCount>3) break;
//        }
//    }
//});









//module.exports.setDBConfig=function(newDBConfig){
//    dbConfig= newDBConfig;
//};
//module.exports.loadConfig=function(){
//    dbConfigFilePath='./' + app.startupMode + '.cfg';
//    var stringConfig = fs.readFileSync(dbConfigFilePath);
//    dbConfig = JSON.parse(stringConfig);
//};
//module.exports.getDBConfig=function(){
//    return dbConfig;
//};
//module.exports.saveConfig=function(callback) {
//    console.log('saveConfig dbConfigFilePath=',dbConfigFilePath);
//    fs.writeFile(dbConfigFilePath, JSON.stringify(dbConfig), function (err, success) {
//        callback(err,success);
//    })
//};


//module.exports.setDatabaseConnection=function(callback){
//    mssql.close();
//    dbConfig.requestTimeout=300000;
//    mssql.connect(dbConfig, function(err){
//        if(err){
//            dbConnectError=err.message;
//            logger.error("FAILED to connect to DB. Reason: "+dbConnectError);
//            callback(err.message);
//            return;
//        }
//        var request = new mssql.Request();
//        request.query('select 1',
//            function(err,res) {
//                if (err) {
//                    dbConnectError = err.message;
//                    callback(dbConnectError);
//                    return;
//                }
//                dbConnectError=null;
//                callback();
//            });
//    });
//};
/**
 *{uuid:{user:<user>, connection: <connection> }}
 */
var connections={};

module.exports.getConnData=function(){
    return connections;
};
/**
 * @param userData
 * @param callback (err,uuid)
 */
module.exports.connectWithPool=function(userData, callback){ console.log("!!!!connectWithPool=");
    if (connections && connections[userData.uuid]
        && connections[userData.uuid].connection){   console.log("connectWithPool if connections");
        callback(null,{uuid:uuid});
        return;
    }
    //const pool = new mssql.ConnectionPool({
    //    user: userData.login,
    //    password: userData.password,
    //    server: getDBConfig().host,
    //    database: getDBConfig().database
    //});
    var pool = new mssql.ConnectionPool({
        user: "sa",
        password: "GMSgms123",
        server:   "localhost",
        database: "GMSSample38btkKlnk"
    }, function(err){
        console.log("after ConnectionPool");
        if(err){
            console.log("ConnectionPool err",err);
            callback(err.message);
                    return;
        }
        var uuid=common.getUIDNumber();
            connections[uuid]={};
            connections[uuid].connection=pool;
            connections[uuid].user=userData.login;
        console.log("after ConnectionPool connections=",connections);
            callback(null,{uuid:uuid})
    });
    //console.log("pool=",pool);
    pool.on('error', function(err){
        console.log('pool on error=', err.message);
    });
    //pool.connect(function(err){     console.log("pool.connect");
    //    if(err){                    console.log("if(err) err=",err);
    //        log.error("FAILED to connect to DB. Reason: "+err.message);
    //        callback(err.message);
    //        return;
    //    }
    //    var uuid=common.getUIDNumber();
    //    connections[uuid]={};
    //    connections[uuid].connection=pool;
    //    connections[uuid].user=userData.login;
    //    callback(null,{uuid:uuid})
    //})
};

//module.exports.mySQLAdminConnection = function (connParams, callback) {                                     log.info("database mySQLAdminConnection connParams=",connParams);
//    if(!connParams){
//        callback({message:"Failed connect to database! Reason: no parameters!"});
//        return;
//    }
//    if(!connParams.server||connParams.server.trim()==""){
//        callback({message:"Failed connect to database! Reason: no host!"});
//        return;
//    }
//    if(!connParams.user||connParams.user.trim==""){
//        callback({message:"Failed connect to database! Reason: no user!"});
//        return;
//    }
//    mssql.close();
//    connParams.requestTimeout=300000;
//    mssql.connect(connParams, function(err){
//        if(err){
//            dbConnectError=err.message;
//            log.error("FAILED to connect to DB. Reason: "+dbConnectError);
//            callback(err.message);
//            return;
//        }
//        var request = new mssql.Request();
//        request.query('select 1',
//            function(err,res) {
//                if (err) {
//                    dbConnectError = err.message;
//                    callback(dbConnectError);
//                    return;
//                }
//                dbConnectError=null;
//                callback();
//            });
//    });
//};
//

function selectMSSQLQuery(query, uuid, callback) {   console.log("selectMSSQLQuery uuid=",uuid);                                                  log.debug("database selectMSSQLQuery query:",query);
    //var request = new mssql.Request();
    console.log("selectMSSQLQuery connections=",connections);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    request.query(query,
        function (err, result) {
            if (err) {
                //err.name="ConnectionError";
                //err.message="err message test";
                if(err.name=="ConnectionError")dbConnectError=err.message;
                log.error('database: selectMSSQLQuery error:',err.message,{});//test
                callback(err);
                return;
            }
            callback(null, result.recordset, result.rowsAffected.length);
        });
}

module.exports.selectMSSQLQuery=selectMSSQLQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL queryStr>
 * paramsObj = {<paramName>:<paramValue>,...}
 * callback = function(err, updateCount)
 */
//module.exports.executeMSSQLParamsQuery= function(query, paramsObj, callback) {               log.debug("database executeMSSQLParamsQuery:",query,paramsObj);
//    var request = new mssql.Request();
//    for(var param in paramsObj){
//        request.input(param,paramsObj[param]);
//    }
//    request.query(query,
//        function (err, result) {
//            if (err) {                                                                        log.error('database: executeMSSQLParamsQuery error:',err.message,{});//test
//                if(err.name=="ConnectionError")dbConnectError=err.message;
//                callback(err);
//                return;
//            }                                                                                 log.debug('database: executeMSSQLParamsQuery recordset:',result,{});//test
//            callback(null, result.rowsAffected.length);
//        });
//};
//
///**
// * for MS SQL database query select
// * paramsObj={<paramName>:<paramValue>, ... }
// * callback = function(err, recordset, count)
// */
function selectParamsMSSQLQuery(uuid,query, paramsObj, callback) {                                      log.debug("database selectParamsMSSQLQuery query:",query," parameters:",paramsObj,{});
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    for(var param in paramsObj){
        //if(param.toLocaleLowerCase().indexOf("date")==param-5){
        //reqSql.input(param,mssql.Date, paramsObj[param]);
        request.input(param,paramsObj[param]);
    }
    request.query(query,
        function (err, result) {
            if (err) {                                                                              log.error('database: selectParamsMSSQLQuery error:',err.message,{});
                if(err.name=="ConnectionError")dbConnectError=err.message;
                callback(err);
                return;
            }
            callback(null, result.recordset ,result.rowsAffected.length);
        });
}
module.exports.selectParamsMSSQLQuery=selectParamsMSSQLQuery;
//
///**
// * params = { source,
// *      tableColumns = [
// *          {data:<sourceFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, readOnly:true/false, visible:true/false,
// *                dataSource:<sourceName>, sourceField:<sourceFieldName> },
// *          ...
// *      ],
// *      identifier= <sourceIDFieldName>,
// *      conditions={ <condition>:<conditionValue>, ... },
// *      order = "<orderFieldsList>"
// * }
// * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
// * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
// *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
// *              checkbox checkedTemplate:1 uncheckedTemplate:0 /
// *              autocomplete strict allowInvalid sourceURL
// * tableColumns: -readOnly default false, visible default true
// * resultCallback = function( tableData = { columns:tableColumns, identifier:identifier, items:[ {<tableFieldName>:<value>,...}, {}, {}, ...],
// *      error:errorMessage } )
// */
//function getDataForTable(params, resultCallback){
//    var tableData={};
//    if(!params){                                                                                        log.error("FAILED _getDataForTable! Reason: no function parameters!");//test
//        tableData.error="FAILED _getDataForTable! Reason: no function parameters!";
//        resultCallback(tableData);
//        return;
//    }
//    if(!params.tableColumns){                                                                           log.error("FAILED _getDataForTable! Reason: no table columns!");//test
//        tableData.error="FAILED _getDataForTable! Reason: no table columns!";
//        resultCallback(tableData);
//        return;
//    }
//    tableData.columns= getTableColumnsDataForHTable(params.tableColumns);
//    tableData.identifier=params.identifier;
//    if (!params.conditions) {
//        resultCallback(tableData);
//        return;
//    }
//    var hasConditions=false;
//    for(var conditionItem in params.conditions){
//        hasConditions=true; break;
//    }
//    if (!hasConditions) {
//        resultCallback(tableData);
//        return;
//    }
//    params.tableData=tableData;
//    getDataItemsForTable(params,resultCallback);
//}
//module.exports.getDataForTable=getDataForTable;
//
///**
// * tableColumns = [
// *      { data:<tableFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, align:"left"/"center"/"right",
// *          useFilter:true/false default:true, readOnly:true/false, default:false, visible:true/false default:true },
// *       ...
// * ]
// * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
// *                              / combobox,sourceURL / comboboxWN,sourceURL
// * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
// *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
// *              checkbox, checkedTemplate:1, uncheckedTemplate:0 /
// *              autocomplete, strict, allowInvalid, sourceURL
// */
//function getTableColumnsDataForHTable(tableColumns){
//    if (!tableColumns) return tableColumns;
//    var tableColumnsDataForHTable=[];
//    for(var col=0;col<tableColumns.length;col++){
//        var tableColData=tableColumns[col];
//        if(!tableColData||!tableColData.data||!tableColData.name) continue;
//        var tableColumnsDataItemForHTable= { data:tableColData.data };
//        if(tableColData.name!==undefined) tableColumnsDataItemForHTable.name=tableColData.name;
//        if(tableColData.width!==undefined) tableColumnsDataItemForHTable.width=tableColData.width;
//        if(tableColData.type!==undefined) tableColumnsDataItemForHTable.type=tableColData.type;
//        if(tableColData.align!==undefined) tableColumnsDataItemForHTable.align=tableColData.align;
//        if(tableColData.useFilter!==undefined) tableColumnsDataItemForHTable.useFilter=tableColData.useFilter;
//        if(tableColData.readOnly!==undefined) tableColumnsDataItemForHTable.readOnly=tableColData.readOnly;
//        if(tableColData.visible!==undefined) tableColumnsDataItemForHTable.visible=tableColData.visible;
//        if(tableColData.format!==undefined) tableColumnsDataItemForHTable.format=tableColData.format;
//        if(tableColData.dateFormat!==undefined) tableColumnsDataItemForHTable.dateFormat=tableColData.dateFormat;
//        if(tableColData.datetimeFormat!==undefined) tableColumnsDataItemForHTable.datetimeFormat=tableColData.datetimeFormat;
//        if(tableColData.format!==undefined) tableColumnsDataItemForHTable.format=tableColData.format;
//        if(tableColData.language!==undefined) tableColumnsDataItemForHTable.language=tableColData.language;
//        if(tableColData.checkedTemplate!==undefined) tableColumnsDataItemForHTable.checkedTemplate=tableColData.checkedTemplate;
//        if(tableColData.uncheckedTemplate!==undefined) tableColumnsDataItemForHTable.uncheckedTemplate=tableColData.uncheckedTemplate;
//        if(tableColData.strict!==undefined) tableColumnsDataItemForHTable.strict=tableColData.strict;
//        if(tableColData.allowInvalid!==undefined) tableColumnsDataItemForHTable.allowInvalid=tableColData.allowInvalid;
//        if(tableColData.sourceURL!==undefined) tableColumnsDataItemForHTable.sourceURL=tableColData.sourceURL;
//        tableColumnsDataForHTable.push(tableColumnsDataItemForHTable);
//        if (tableColumnsDataItemForHTable.type=="dateAsText"){
//            tableColumnsDataItemForHTable.type="text";
//            //if(!tableColumnsDataItemForHTable.dateFormat) tableColumnsDataItemForHTable.dateFormat="DD.MM.YY";
//            if(!tableColumnsDataItemForHTable.datetimeFormat) tableColumnsDataItemForHTable.datetimeFormat="DD.MM.YY";
//        } else if (tableColumnsDataItemForHTable.type=="datetimeAsText"){
//            tableColumnsDataItemForHTable.type="text";
//            //if(!tableColumnsDataItemForHTable.dateFormat) tableColumnsDataItemForHTable.dateFormat="DD.MM.YY HH:mm:ss";
//            if(!tableColumnsDataItemForHTable.datetimeFormat) tableColumnsDataItemForHTable.datetimeFormat="DD.MM.YY HH:mm:ss";
//        } else if(tableColumnsDataItemForHTable.type=="numeric"){
//            if(!tableColumnsDataItemForHTable.format) tableColumnsDataItemForHTable.format="#,###,###,##0.[#########]";
//            if(!tableColumnsDataItemForHTable.language) tableColumnsDataItemForHTable.language="ru-RU";
//        } else if(tableColumnsDataItemForHTable.type=="numeric2"){
//            tableColumnsDataItemForHTable.type="numeric";
//            if(!tableColumnsDataItemForHTable.format) tableColumnsDataItemForHTable.format="#,###,###,##0.00[#######]";
//            if(!tableColumnsDataItemForHTable.language) tableColumnsDataItemForHTable.language="ru-RU";
//        } else if(tableColumnsDataItemForHTable.type=="checkbox"){
//            if(!tableColumnsDataItemForHTable.checkedTemplate) tableColumnsDataItemForHTable.checkedTemplate="1";
//            if(!tableColumnsDataItemForHTable.uncheckedTemplate) tableColumnsDataItemForHTable.uncheckedTemplate="0";
//        } else if(tableColumnsDataItemForHTable.type=="checkboxMSSQL"){
//            tableColumnsDataItemForHTable.type="checkbox";
//            if(!tableColumnsDataItemForHTable.checkedTemplate) tableColumnsDataItemForHTable.checkedTemplate="true";
//            if(!tableColumnsDataItemForHTable.uncheckedTemplate) tableColumnsDataItemForHTable.uncheckedTemplate="false";
//        } else if(tableColumnsDataItemForHTable.type=="combobox"||tableColumnsDataItemForHTable.type=="comboboxWN") {
//            tableColumnsDataItemForHTable.strict= true;
//            if(tableColumnsDataItemForHTable.type=="combobox") tableColumnsDataItemForHTable.allowInvalid=false; else tableColumnsDataItemForHTable.allowInvalid=true;
//            tableColumnsDataItemForHTable.filter= false;
//            tableColumnsDataItemForHTable.type="autocomplete";
//        } else if(!tableColumnsDataItemForHTable.type) tableColumnsDataItemForHTable.type="text";
//    }
//    return tableColumnsDataForHTable;
//}
//
///**
// * params = { source,
// *      tableColumns = [
// *          {data:<dataFieldName>, name:<tableColumnHeader>, width:<tableColumnWidth>, type:<dataType>, readOnly:true/false, visible:true/false },
// *                sourceField:<sourceFieldName>
// *             OR dataSource:<sourceName>, sourceField:<sourceFieldName>
// *             OR dataSource:<sourceName>, sourceField:<sourceFieldName>, linkCondition:<dataSource join link condition>
// *      ],
// *      conditions={ <condition>:<conditionValue>, ... },
// *      order = "<orderFieldsList>",
// *      tableData = { columns:tableColumns, identifier:identifier }
// * }
// * tableColumns: -<dataType> = text / html_text / text_date / text_datetime / date / numeric / numeric2 / checkbox
// * OR tableColumns: -<dataType> = text / text & dateFormat:"DD.MM.YY HH:mm:ss" / html_text / date /
// *              numeric format:"#,###,###,##0.00[#######]" language:"ru-RU" /
// *              checkbox checkedTemplate:1 uncheckedTemplate:0 /
// *              autocomplete strict allowInvalid sourceURL
// * tableColumns: -readOnly default false, visible default true
// * resultCallback = function( tableData = { columns:tableColumns, identifier:identifier, items:[ {<tableFieldName>:<value>,...}, {}, {}, ...],
// *      error:errorMessage } )
// */
//function getDataItemsForTable(params, resultCallback){
//    var tableData={};
//    if(!params){                                                                                        log.error("FAILED _getDataItemsForTable! Reason: no function parameters!");//test
//        tableData.error="FAILED _getDataItemsForTable! Reason: no function parameters!";
//        resultCallback(tableData);
//        return;
//    }
//    if(params.tableData) tableData=params.tableData;
//    if(!params.tableColumns){                                                                           log.error("FAILED _getDataItemsForTable! Reason: no table columns!");//test
//        tableData.error="FAILED _getDataItemsForTable! Reason: no table columns!";
//        resultCallback(tableData);
//        return;
//    }
//    if(!params.source){                                                                                 log.error("FAILED _getDataItemsForTable! Reason: no table source!");//test
//        tableData.error="FAILED _getDataItemsForTable! Reason: no table source!";
//        resultCallback(tableData);
//        return;
//    }
//    var hasSources=false;
//    for(var i in params.tableColumns) {
//        var tableColumnData=params.tableColumns[i];
//        if(tableColumnData.dataSource) hasSources=true;
//    }
//    var fieldsList=[], fieldsSources={}, addJoinedSources=null;
//    for(var i in params.tableColumns) {
//        var tableColumnData=params.tableColumns[i], fieldName=tableColumnData.data;
//        if(tableColumnData.sourceField||tableColumnData.dataSource) {
//            if (tableColumnData.name) fieldsList.push(fieldName);
//            if (tableColumnData.dataSource && tableColumnData.sourceField)
//                fieldsSources[fieldName] = tableColumnData.dataSource + "." + tableColumnData.sourceField;
//            else if (tableColumnData.dataSource)
//                fieldsSources[fieldName] = tableColumnData.dataSource + "." + fieldName;
//            else if (tableColumnData.sourceField && hasSources)
//                fieldsSources[fieldName] =params.source  + "." + tableColumnData.sourceField;
//            else if (tableColumnData.sourceField)
//                fieldsSources[fieldName] = tableColumnData.sourceField;
//            }
//        if(tableColumnData.dataSource&&tableColumnData.linkCondition){
//            if(!addJoinedSources) addJoinedSources={};
//            if(!addJoinedSources[tableColumnData.dataSource]){
//                var joinedSourceLinkConditions={};
//                joinedSourceLinkConditions[tableColumnData.linkCondition]=null;
//                addJoinedSources[tableColumnData.dataSource]=joinedSourceLinkConditions;
//            }
//        } else {
//            if(tableColumnData.name) fieldsList.push(fieldName);
//            if(tableColumnData.dataSource&&tableColumnData.sourceField)
//                fieldsSources[fieldName]=tableColumnData.dataSource+"."+tableColumnData.sourceField;
//            else if(tableColumnData.dataSource)
//                fieldsSources[fieldName]=tableColumnData.dataSource+"."+fieldName;
//            else if(hasSources&&(params.source))
//                fieldsSources[fieldName]=params.source+"."+fieldName;
//        }
//    }
//    params.fields=fieldsList;
//    params.fieldsSources=fieldsSources;
//    if(addJoinedSources){
//        if(!params.joinedSources) params.joinedSources={};
//        for(var sourceName in addJoinedSources) params.joinedSources[sourceName]=addJoinedSources[sourceName];
//    }
//    getSelectItemsMSSQL(params, function(err, recordset){
//        if(err) tableData.error="Failed get data for table! Reason:"+err.message;
//        tableData.items= recordset;
//        formatItemsByColumnsTypes(tableData);
//        resultCallback(tableData);
//    });
//}
///**
// * params = { source,
// *      fields = [ <fieldName> or <functionFieldName>, ... ],
// *      fieldsSources = { <fieldName>:<sourceName>.<sourceFieldName>, ... },
// *      joinedSources = { <sourceName>:<linkConditions> = { <linkCondition>:null or <linkCondition>:<value>, ... } },
// *      conditions={ <condition>:<conditionValue>, ... } OR conditions=[ { fieldName:"...", condition:"...", value:"..." }, ... ],
// *      order = "<fieldName>" OR "<fieldName>,<fieldName>,..." OR [ <fieldName>, ... ]
// * }
// * resultCallback = function(err, recordset)
// */
//function getSelectItemsMSSQL(params, resultCallback){
//    if(!params){                                                                                        log.error("FAILED _getSelectItems! Reason: no function parameters!");//test
//        resultCallback("FAILED _getSelectItems! Reason: no function parameters!");
//        return;
//    }
//    if(!params.source){                                                                                 log.error("FAILED _getSelectItems! Reason: no source!");//test
//        resultCallback("FAILED _getSelectItems! Reason: no source!");
//        return;
//    }
//    if(!params.fields){                                                                                 log.error("FAILED _getSelectItems from source:"+params.source+"! Reason: no source fields!");//test
//        resultCallback("FAILED _getSelectItems from source:"+params.source+"! Reason: no source fields!");
//        return;
//    }
//    var queryFields="";
//    for(var fieldNameIndex in params.fields) {
//        if (queryFields!="") queryFields+= ",";
//        var fieldName=params.fields[fieldNameIndex], fieldFunction=null;
//        if(params.fieldsSources&&params.fieldsSources[fieldName]){
//            fieldName= params.fieldsSources[fieldName]+" as "+fieldName;
//        }
//        queryFields+= ((fieldFunction)?fieldFunction+" as ":"") + fieldName;
//    }
//    var selectQuery="select "+queryFields+" from "+params.source;
//    var joins="";
//    if(params.joinedSources){
//        for(var joinSourceName in params.joinedSources) {
//            var joinedSourceConditions=params.joinedSources[joinSourceName], joinedSourceOnCondition=null;
//            for(var linkCondition in joinedSourceConditions)
//                joinedSourceOnCondition= (!joinedSourceOnCondition)?linkCondition:joinedSourceOnCondition+" and "+linkCondition;
//            joins += " inner join " + joinSourceName + " on "+joinedSourceOnCondition;
//        }
//    }
//    selectQuery+=joins;
//    var wConditionQuery, conditionsObj={};
//    if (params.conditions&&typeof(params.conditions)=="object"&&params.conditions.length===undefined) {//object
//        for(var conditionItem in params.conditions) {
//            var conditionItemValue=params.conditions[conditionItem];
//            var conditionItemValueQuery= (conditionItemValue===null||conditionItemValue==='null')?conditionItem:conditionItem+"@p"+Object.keys(conditionsObj).length;
//            conditionItemValueQuery= conditionItemValueQuery.replace("~","=");
//            wConditionQuery= (!wConditionQuery)?conditionItemValueQuery:wConditionQuery+" and "+conditionItemValueQuery;
//            if (conditionItemValue!==null)  conditionsObj["p"+Object.keys(conditionsObj).length]=conditionItemValue;
//        }
//    } else if (params.conditions&&typeof(params.conditions)=="object"&&params.conditions.length>0) {//array
//        for(var ind in params.conditions) {
//            var conditionItem= params.conditions[ind];
//            var conditionFieldName=conditionItem.fieldName;
//            if(params.fieldsSources&&params.fieldsSources[conditionFieldName])
//                conditionFieldName= params.fieldsSources[conditionFieldName];
//            var conditionItemValueQuery=
//                (conditionItem.value===null)?conditionFieldName+conditionItem.condition:conditionFieldName+conditionItem.condition+"@p"+Object.keys(conditionsObj).length;
//            wConditionQuery= (!wConditionQuery)?conditionItemValueQuery:wConditionQuery+" and "+conditionItemValueQuery;
//            if (conditionItem.value!==null) conditionsObj["p"+Object.keys(conditionsObj).length]=conditionItem.value;
//        }
//    }
//    if(wConditionQuery)selectQuery+=" where "+wConditionQuery;
//    if (params.order) selectQuery+=" order by "+params.order;
//    if (conditionsObj.length==0)
//        selectMSSQLQuery(selectQuery,function(err, recordset){
//            if(err) {                                                                                       log.error("FAILED _getSelectItems selectMSSQLQuery! Reason:",err.message,"!");//test
//                resultCallback(err);
//            } else
//                resultCallback(null,recordset);
//        });
//    else
//        selectParamsMSSQLQuery(selectQuery,conditionsObj, function(err, recordset){
//            if(err) {                                                                                       log.error("FAILED _getSelectItems selectParamsMSSQLQuery! Reason:",err.message,"!");//test
//                resultCallback(err);
//            } else
//                resultCallback(null,recordset);
//        });
//}
//
//function getDataItemForTable(params, resultCallback){
//    getDataItemsForTable(params,function(tableData){
//        var tableDataItem={};
//        for(var itemName in tableData){
//            if(itemName!="items"){
//                tableDataItem[itemName]=tableData[itemName];
//                continue;
//            }
//            var tableDataItems=tableData.items;
//            if(tableDataItems&&tableDataItems.length>1){
//                tableDataItem.error="Failed get data item for table! Reason: result contains more that one items!";
//                continue;
//            } else if(!tableDataItems||tableDataItems.length==0){
//                continue;
//            }
//            tableDataItem.item=tableDataItems[0];
//        }
//        resultCallback(tableDataItem);
//    });
//}
///**
// * params = { source, comboboxFields = { <tableComboboxFieldName>:<sourceFieldName>, ... },
// *      conditions={ <condition>:<conditionValue>, ... },
// *      order = "<orderFieldsList>"
// * }
// * if !params.conditions returns all items
// * resultCallback = function(result = { items:[ {<tableComboboxFieldName>:<value>, ... }, ... ], error, errorCode } )
// */
//function getDataItemsForTableCombobox(params, resultCallback){
//    if(!params) {                                                                                       log.error("FAILED _getDataItemsForTableCombobox! Reason: no function parameters!");//test
//        resultCallback("FAILED _getDataItemsForTableCombobox! Reason: no function parameters!");
//        return;
//    }
//    if(!params.comboboxFields) {                                                                        log.error("FAILED _getDataItemsForTableCombobox! Reason: no comboboxFields!");//test
//        resultCallback("FAILED _getDataItemsForTableCombobox! Reason: no comboboxFields!");
//        return;
//    }
//    if(!params.source) resultCallback("FAILED _getDataItemsForTableCombobox! Reason: no source table!");
//    if(!params.conditions) params.conditions={"1=1":null};
//    params.fields=[];
//    var joinedSources;
//    for(var cFieldName in params.comboboxFields){
//        var cFieldData=params.comboboxFields[cFieldName];
//        if(cFieldData&&typeof(cFieldData)=="object"&&cFieldData.source) {
//            if (!joinedSources) joinedSources={};
//            if(!joinedSources[cFieldData.source]) joinedSources[cFieldData.source]=true;
//        }
//    }
//    for(var cFieldName in params.comboboxFields){
//        var cFieldData=params.comboboxFields[cFieldName];
//        params.fields.push(cFieldName);
//        if(typeof(cFieldData)=="string") {
//            var mainSourceName=params.source;
//            if(!params.fieldsSources) params.fieldsSources={};
//            if(joinedSources&&mainSourceName)
//                params.fieldsSources[cFieldName]=mainSourceName+"."+cFieldData;
//            else
//                params.fieldsSources[cFieldName]=cFieldData;
//        } else if(cFieldData&&typeof(cFieldData)=="object"&&cFieldData.field) {
//            if(cFieldData.source){
//                if(!params.fieldsSources) params.fieldsSources={};
//                params.fieldsSources[cFieldName]=cFieldData.source+"."+cFieldData.field;
//            }
//        }
//    }
//    getDataItems(params,function(result){
//        if(result.items){
//            for(var i in result.items){
//                var resultItemData=result.items[i];
//                for(var rItemName in resultItemData){
//                    var rItemDataValue=resultItemData[rItemName];
//                    if(rItemDataValue==null) continue;
//                    if(typeof(rItemDataValue)!=="string") resultItemData[rItemName]=rItemDataValue.toString();
//                }
//            }
//        }
//        resultCallback(result);
//    });
//}
//module.exports.getDataItemsForTableCombobox=getDataItemsForTableCombobox;
///**
// * params = { source,
// *      fields = [<tableFieldName>,<tableFieldName>,<tableFieldName>,...],
// *      conditions={ <condition>:<conditionValue>, ... },
// *      order = "<orderFieldsList>"
// * }
// * resultCallback = function(result = { items:[ {<tableFieldName>:<value>,...}, ... ], error, errorCode } )
// */
//function getDataItems(params, resultCallback){                                                             //log.debug('_getDataItems: params:',params,{});//test
//    if(!params) params={};
//    if(!params.source)resultCallback("FAILED getDataItems! Reason: no source table!");
//    if(!params.fields) resultCallback("FAILED getDataItems! Reason: no source fields!");
//    if(!params.conditions){                                                                                 log.error("FAILED _getDataItems from source:"+params.source+"! Reason: no conditions!");//test
//        resultCallback({error:"FAILED _getDataItems from source:"+params.source+"! Reason: no conditions!"});
//        return;
//    }
//    var condition={}, hasCondition=false;
//    for(var condItem in params.conditions){
//        var condValue=params.conditions[condItem];
//        if(condValue!==undefined) {
//            condition[condItem]=condValue;
//            hasCondition= true;
//        }
//    }
//    if(!hasCondition){                                                                                 log.error("FAILED _getDataItems from source:"+params.source+"! Reason: no data conditions!");//test
//        resultCallback({error:"FAILED _getDataItems from source:"+params.source+"! Reason: no data conditions!"});
//        return;
//    }
//    getSelectItemsMSSQL(params,function(err,recordset){
//        var selectResult={};
//        if(err) {
//            selectResult.error="Failed get data items! Reason:"+err.message;
//            selectResult.errorCode=err.code;
//        }
//        if (recordset) selectResult.items= recordset;                                                       //log.debug('_getDataItems: _getSelectItems: result:',selectResult,{});//test
//        resultCallback(selectResult);
//    });
//}
//
//function formatItemsByColumnsTypes(tableData){
//    if(!tableData.tableColumns||!tableData.items||tableData.items.length==0) return tableData;
//    for(var i in tableData.tableColumns){
//        var colData= tableData.tableColumns[i];
//        if(colData.type=="date"&&colData.dateFormat){
//            for(var row in tableData.items){
//                var rowData= tableData.items[row];
//                if(!rowData||!rowData[colData.data]) continue;
//                rowData[colData.data]= moment(rowData[colData.data]).format(colData.dateFormat); //format rowData[colData.data] by colData.type=="date"&&colData.dateFormat
//            }
//        }
//    }
//}
//
///**
// * params = { tableName, idFieldName, tableColumns,
// *      storeTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
// * }
// * resultCallback = function(result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error } )
// */
//module.exports.storeTableDataItem = function (params, resultCallback) {
//    if (!params) {                                                                                      log.error("FAILED _storeTableDataItem! Reason: no parameters!");//test
//        resultCallback({ error:"Failed store table data item! Reason:no function parameters!"});
//        return;
//    }
//    if (!params.tableName) {                                                                            log.error("FAILED _storeTableDataItem! Reason: no table name!");//test
//        resultCallback({ error:"Failed store table data item! Reason:no table name for store!"});
//        return;
//    }
//    if (!params.storeTableData) {                                                                       log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no data for store!");//test
//        resultCallback({ error:"Failed store table data item! Reason:no data for store!"});
//        return;
//    }
//    var idFieldName= params.idFieldName;
//    if (!idFieldName) {                                                                                 log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no id field!");//test
//        resultCallback({ error:"Failed store table data item! Reason:no id field name!"});
//        return;
//    }
//    if (!params.tableColumns) {                                                                         log.error("FAILED _storeTableDataItem "+params.tableName+"! Reason: no table columns!");//test
//        resultCallback({ error:"Failed store table data item! Reason:no table columns!"});
//        return;
//    }
//    var idValue=params.storeTableData[idFieldName];
//    getDateFromFormattedStr(params.tableColumns,params.storeTableData);
//    var storeTableDataRefactored={};
//    for(var i in params.tableColumns){
//        var column=params.tableColumns[i];
//        if(column.dataSource && (column.dataSource!=params.tableName)){
//            continue;
//        }
//        storeTableDataRefactored[column.data]=params.storeTableData[column.data];
//    }
//    if (idValue===undefined||idValue===null){
//        insTableDataWithNewID({tableName:params.tableName, idFieldName:idFieldName, tableColumns:params.tableColumns,
//            insTableData:storeTableDataRefactored}, resultCallback);
//        return;
//    }
//    updTableDataItem({tableName:params.tableName, idFieldName:idFieldName, tableColumns:params.tableColumns,
//        updTableData:storeTableDataRefactored}, resultCallback);
//};
//function getDateFromFormattedStr(columnsData, tableData){
//    if(!columnsData||!tableData||columnsData.length==0) return tableData;
//
//    for(var i in columnsData){
//        var colData= columnsData[i];
//        if(colData.type=="date"&&colData.dateFormat){
//            if(tableData[colData.data])
//                tableData[colData.data]= moment(tableData[colData.data], colData.dateFormat).format('YYYY-MM-DD HH:mm:ss');
//        }
//    }
//}
//
//function insTableDataWithNewID(params, resultCallback) {
//    if (!params) {                                                                                      log.error("FAILED insTableDataWithNewID! Reason: no parameters!");//test
//        resultCallback({ error:"Failed insert data item with new ID! Reason:no function parameters!"});
//        return;
//    }
//    var idFieldName= params.idFieldName;
//    if (!idFieldName) {                                                                                 log.error("FAILED insTableDataWithNewID "+params.tableName+"! Reason: no id field!");//test
//        resultCallback({ error:"Failed insert data item with new ID! Reason:no id field name!"});
//        return;
//    }
//    var sqlSelectMaxID="select ISNULL(MAX("+idFieldName+"),0)+1 as MAXCHID from "+params.tableName;
//    selectMSSQLQuery(sqlSelectMaxID,function(err, recordset, count){
//        if(err) {                                                                                       log.error("FAILED insTableDataWithNewID selectMSSQLQuery! Reason:",err.message,"!");//test
//            resultCallback(err);
//            return;
//        }
//        params.insTableData[idFieldName]=recordset[0]["MAXCHID"];
//        insTableDataItem(params,resultCallback);
//    });
//}
///**
// * params = { tableName, idFieldName,
// *      tableColumns=[ {<tableColumnData>},... ],
// *      updTableData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...}
// * }
// * resultCallback = function(result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error })
// */
//function updTableDataItem(params, resultCallback) {
//    if (!params) {                                                                                      log.error("FAILED _updTableDataItem! Reason: no parameters!");//test
//        resultCallback({ error:"Failed update table data item! Reason:no function parameters!"});
//        return;
//    }
//    if(!params.tableName&&this.source) params.tableName=this.source;
//    if (!params.tableName) {                                                                            log.error("FAILED _updTableDataItem! Reason: no table name!");//test
//        resultCallback({ error:"Failed update table data item! Reason:no table name!"});
//        return;
//    }
//    if (!params.updTableData) {                                                                         log.error("FAILED _updTableDataItem "+params.tableName+"! Reason: no data for update!");//test
//        resultCallback({ error:"Failed update table data item! Reason:no data for update!"});
//        return;
//    }
//    var idFieldName= params.idFieldName;
//    if (!idFieldName) {                                                                                 log.error("FAILED _updTableDataItem "+params.tableName+"! Reason: no id field!");//test
//        resultCallback({ error:"Failed update table data item! Reason:no id field name!"});
//        return;
//    }
//    params.updData={};
//    if(this.fields){
//        for(var i in this.fields){
//            var fieldName=this.fields[i];
//            if(fieldName!=idFieldName)params.updData[fieldName]=params.updTableData[fieldName];
//        }
//    } else {
//        for(var updFieldName in params.updTableData)
//            if(updFieldName!=idFieldName) params.updData[updFieldName]=params.updTableData[updFieldName];
//    }
//    params.conditions={}; params.conditions[idFieldName+"="]=params.updTableData[idFieldName];
//    updDataItem(params, function(updResult){
//        if(updResult.error){
//            resultCallback(updResult);
//            return;
//        }
//        var resultFields=[];
//        for(var fieldName in params.updTableData) resultFields.push(fieldName);
//        var getResultConditions={}; getResultConditions[params.tableName+"."+idFieldName+"="]=params.updTableData[idFieldName];
//        getDataItemForTable({source:params.tableName, tableColumns:params.tableColumns, conditions:getResultConditions},
//            function(result){
//                if(result.error) updResult.error="Failed get result updated data item! Reason:"+result.error;
//                if (result.item) updResult.resultItem= result.item;
//                resultCallback(updResult);
//            });
//    });
//}
///**
// * params = { tableName,
// *      updData = {<tableFieldName>:<value>,<tableFieldName>:<value>,<tableFieldName>:<value>,...},
// *      conditions = { <tableFieldNameCondition>:<value>, ... }
// * }
// * resultCallback = function(result = { updateCount, error })
// */
//function updDataItem(params, resultCallback) {
//    if (!params) {                                                                                      log.error("FAILED _updDataItem! Reason: no parameters!");//test
//        resultCallback({ error:"Failed update data item! Reason:no function parameters!"});
//        return;
//    }
//    if(!params.tableName&&this.source) params.tableName=this.source;
//    if (!params.tableName) {                                                                            log.error("FAILED _updDataItem! Reason: no table name!");//test
//        resultCallback({ error:"Failed update data item! Reason:no table name for update!"});
//        return;
//    }
//    if (!params.updData) {                                                                              log.error("FAILED _updDataItem "+params.tableName+"! Reason: no data for update!");//test
//        resultCallback({ error:"Failed update data item! Reason:no data for update!"});
//        return;
//    }
//    if (!params.conditions) {                                                                           log.error("FAILED _updDataItem "+params.tableName+"! Reason: no conditions!");//test
//        resultCallback({ error:"Failed update data item! Reason:no update conditions!"});
//        return;
//    }
//    var queryFields="", fieldsValuesObj={};
//    for(var fieldName in params.updData) {
//        if (queryFields!="") queryFields+= ",";
//        queryFields+= fieldName+"=@p"+Object.keys(fieldsValuesObj).length;
//        var updDataItemValue=params.updData[fieldName];
//        if(updDataItemValue&&(updDataItemValue instanceof Date)) {
//            updDataItemValue=moment(updDataItemValue).format('YYYY-MM-DD HH:mm:ss');
//        }
//        fieldsValuesObj["p"+Object.keys(fieldsValuesObj).length]=updDataItemValue;
//    }
//    var updQuery="update "+params.tableName+" set "+queryFields;
//    var queryConditions="";
//    for(var fieldNameCondition in params.conditions) {
//
//        if (queryConditions!="") queryConditions+= " and ";
//        queryConditions+= fieldNameCondition.replace("~","=")+"@p"+Object.keys(fieldsValuesObj).length;
//        fieldsValuesObj["p"+Object.keys(fieldsValuesObj).length]=params.conditions[fieldNameCondition];
//    }
//
//    updQuery+= " where "+queryConditions;
//    module.exports.executeMSSQLParamsQuery(updQuery,fieldsValuesObj,function(err, updateCount){
//        var updResult={};
//        if(err) {
//            updResult.error="Failed update data item! Reason:"+err.message;
//            resultCallback(updResult);
//            return;
//        }
//        updResult.updateCount= updateCount;
//        if (updateCount==0) updResult.error="Failed update data item! Reason: no updated row count!";
//        resultCallback(updResult);
//    });
//}



