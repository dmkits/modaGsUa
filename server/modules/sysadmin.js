var path = require('path'), fs = require('fs');
var server=require('../server'), getLoadInitModulesError=server.getLoadInitModulesError;
var log = server.log;
var appParams=server.getAppStartupParams(), getServerConfig=server.getServerConfig, setAppConfig=server.setAppConfig, getConfig=server.getConfig;
var loadServerConfiguration=server.loadServerConfiguration;

var util=require('../util'), database=require('../databaseMSSQL');
var appModules=require(appModulesPath), getValidateError=appModules.getValidateError;
var dateFormat = require('dateformat')/*, cron = require('node-cron'), moment = require('moment')*/;

var dataModel=require('../datamodel');
var changeLog= require(appDataModelPath+"change_log");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([changeLog], errs,
        function(){
            nextValidateModuleCallback();
        });
};

module.exports.modulePageURL = "/sysadmin";
module.exports.modulePagePath = "sysadmin.html";
var thisInstance=this;

module.exports.init = function(app){

    app.get("/sysadmin/serverState", function(req, res){
        var revalidateModules= false;
        if (req.query&&req.query["REVALIDATE"]) revalidateModules= true;
        var outData= {};
        outData.mode= appParams.mode;
        outData.port=appParams.port;
        outData.dbUserName=req.dbUserName;
        var serverConfig=getServerConfig();
        if (!serverConfig||serverConfig.error) {
            outData.error= (serverConfig&&serverConfig.error)?serverConfig.error:"unknown";
            res.send(outData);
            return;
        }
        outData.configuration= serverConfig;
        var systemConnectionErr= database.getSystemConnectionErr();
        if (systemConnectionErr) {
            outData.systemConnectionErr= systemConnectionErr;
            outData.dbValidation = "Validation failed! Reason:No database system connection!";
            res.send(outData);
            return
        }
        outData.systemConnectionErr = 'Connected';
        var loadInitModulesError=getLoadInitModulesError();
        if(loadInitModulesError) outData.modulesFailures = loadInitModulesError;
        if (revalidateModules) {
            appModules.validateModules(function(errs, errMessage){
                if(errMessage) outData.dbValidation = errMessage; else outData.dbValidation = "success";
                res.send(outData);
            });
            return;
        }
        outData.config=getConfig();
        var validateError=getValidateError();
        if(validateError) outData.dbValidation=validateError; else outData.dbValidation = "success";
        res.send(outData);
    });

    app.get("/sysadmin/serverConfig", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/serverConfig.html');
    });

    app.get("/sysadmin/server/getServerConfig", function (req, res) {
        var serverConfig=getServerConfig();
        if (!serverConfig||serverConfig.error) {
            res.send({error:(serverConfig&&serverConfig.error)?serverConfig.error:"unknown"});
            return;
        }
        res.send(serverConfig);
    });
    app.get("/sysadmin/server/getDBList", function (req, res) {
        database.selectQuery(req.dbUC,
            "select	name "+
            "from sys.databases "+
            "where name not in ('master','tempdb','model','msdb') "+
            "and is_distributor = 0 "+
            "and source_database_id is null",
            function(err,recordset){
                if(err){
                    res.send({error:err.message});
                    return;
                }
                res.send({dbList:recordset});
        });
    });

    app.get("/sysadmin/server/loadServerConfig", function (req, res) {
        loadServerConfiguration();
        var serverConfig=getServerConfig();                                                         log.info("serverConfig=",serverConfig);
        if (!serverConfig) {
            res.send({error: "Failed load server config!"});
            return;
        }
        res.send(serverConfig);
    });

    app.post("/sysadmin/serverConfig/storeServerConfigAndReconnect", function (req, res) {
        var newServerConfig = req.body;
        var currentDbName=server.getServerConfig().database;
        var currentDbHost=server.getServerConfig().host;
        util.saveConfig(appParams.mode+".cfg", newServerConfig,
            function (err) {
                var outData = {};
                if (err) {
                    outData.error = "Failed to save config. Reason: "+err;
                    res.send(outData);
                    return;
                }
                if(!(currentDbName==newServerConfig.database) || !(currentDbHost==newServerConfig.host)){
                    database.cleanConnectionPool();
                }
                setAppConfig(newServerConfig);
                database.setDBSystemConnection(newServerConfig, function (err,result) {
                    if (err) {
                        outData.DBConnectError = err.error;
                        outData.error="'\n Не удалось подключиться к базе данных!\n"+(err.userErrorMsg)?err.userErrorMsg:err.error;
                        //res.send(outData);
                        //return;
                    }
                    appModules.validateModules(function (errs, errMessage) {
                        if (errMessage) outData.dbValidation = errMessage;
                        res.send(outData);
                    });
                });
            });
    });

    app.get("/sysadmin/database", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/database.html');
    });

    /**
     * resultCallback = function(result={ item, error, errorCode })
     */
    var getChangeLogItemByID= function(uuid,id, resultCallback) {
        changeLog.getDataItem({uuid:uuid,conditions:{"ID=":id} }, resultCallback);
    };
    /**
     * result = true/false
     */
    var matchChangeLogFields= function(changeData, logData) {
        if (logData["ID"]!=changeData.changeID) return false;
        if (moment(new Date(changeData.changeDatetime)).format("YYYY-MM-DD HH:mm:ss")!= changeData.changeDatetime) return false;
        if (logData["CHANGE_VAL"]!=changeData.changeVal) return false;
        if (logData["CHANGE_OBJ"]!=changeData.changeObj) return false;
        return true;
    };
    var matchLogData=function(uuid,changesData, outData, ind, callback){
        var changeData = changesData?changesData[ind]:null;
        if (!changeData) {
            callback(outData);
            return;
        }
        getChangeLogItemByID(uuid,changeData.changeID, function (result) {
            if (result.error) {
                outData.error = "ERROR FOR ID:"+changeData.changeID+" Error msg: "+result.error;
                matchLogData(uuid,null, outData, ind+1, callback);
                return;
            }
            if (!result.item) {
                changeData.type = "new";
                changeData.message = "not applied";
                outData.items.push(changeData);
                matchLogData(uuid,changesData, outData, ind+1,callback);
                return;
            }
            if (!matchChangeLogFields(changeData,result.item)){
                changeData.type = "warning";
                changeData.message = "Current update has not identical fields in change_log!";
                outData.items.push(changeData);
                matchLogData(uuid,changesData, outData, ind+1,callback);
            } else {
                matchLogData(uuid,changesData, outData, ind+1,callback);
            }
        });
    };

    var changesTableColumns=[
        {data: "changeID", name: "changeID", width: 200, type: "text"},
        {data: "changeDatetime", name: "changeDatetime", width: 120, type:"text", datetimeFormat:"YYYY-MM-DD HH:mm:ss"},
        {data: "changeObj", name: "changeObj", width: 200, type: "text"},
        {data: "changeVal", name: "changeVal", width: 450, type: "text"},
        {data: "type", name: "type", width: 100, type: "text"},
        {data: "message", name: "message", width: 200, type: "text"}
    ];

    app.get("/sysadmin/database/getCurrentChanges", function (req, res) {
        var outData = { columns:changesTableColumns, identifier:changesTableColumns[0].data, items:[] };
        checkIfChangeLogExists(req.uuid,function(tableData) {
            if (tableData.error&&  tableData.error.indexOf("Invalid object name")>=0) {  log.info("668   checkIfChangeLogExists resultCallback tableData.error:",tableData.error,tableData);
                outData.noTable = true;
                var arr=dataModel.getModelChanges();
                var items=util.sortArray(arr);
                for(var i in items){
                    var item=items[i];
                    item.type="new";
                    item.message="not applied";
                }
                outData.items=items;
                res.send(outData);
                return;
            }
            if (tableData.error) {                                                                          log.error("681   checkIfChangeLogExists resultCallback tableData.error:",tableData.error);
                outData.error = tableData.error;
                res.send(outData);
                return;
            }
            var arr=dataModel.getModelChanges();
            var logsData= util.sortArray(arr);
            matchLogData(req.uuid,logsData, outData, 0, function(outData){
                res.send(outData);
            });
        });
    });
    /**
     * resultCallback = function(result={ item, error, errorCode })
     */
    var checkIfChangeLogExists= function(uuid,resultCallback) {
        changeLog.getDataItems({uuid:uuid,conditions:{"ID IS NULL":null}}, resultCallback);
    };

    var changeLogTableColumns=[
        {data: "ID", name: "changeID", width: 200, type: "text"},
        {data: "CHANGE_DATETIME", name: "changeDatetime", width: 120, type: "text", datetimeFormat:"YYYY-MM-DD HH:mm:ss", align:"center"},
        {data: "CHANGE_OBJ", name: "changeObj", width: 200, type: "text"},
        {data: "CHANGE_VAL", name: "changeVal", width: 450, type: "text"},
        {data: "APPLIED_DATETIME", name: "appliedDatetime", width: 120, type: "text", datetimeFormat:"YYYY-MM-DD HH:mm:ss", align:"center"}
    ];
    /**
     * resultCallback = function(result = { updateCount, resultItem:{<tableFieldName>:<value>,...}, error } )
     */
    var insertToChangeLog= function(uuid,itemData, resultCallback) {
        changeLog.insTableDataItem({uuid:uuid,tableColumns:changeLogTableColumns,idFieldName:"ID", insTableData:itemData}, resultCallback);
    };
    app.post("/sysadmin/database/applyChange", function (req, res) {
        var outData={};
        var ID=req.body.CHANGE_ID, appliedDatetime=req.body.appliedDatetime;
        var CHANGE_VAL;
        var fullModelChanges=dataModel.getModelChanges();
        var rowData;
        for (var i in fullModelChanges){
            var modelChange=fullModelChanges[i];
            if  (modelChange.changeID==ID){
                rowData=modelChange;
                CHANGE_VAL=modelChange.changeVal;
                break;
            }
        }
        checkIfChangeLogExists(req.uuid,function(result) {
           // if (result.error && (result.errorCode == "ER_NO_SUCH_TABLE")) {
            if (result.error&&  result.error.indexOf("Invalid object name")>=0) {  log.info("checkIfChangeLogExists  tableData.error:",result.error);
                database.executeQuery(req.uuid,CHANGE_VAL, function (err) {
                    if (err) {
                        outData.error = err.message;
                        res.send(outData);
                        return;
                    }
                    insertToChangeLog(req.uuid,{"ID":modelChange.changeID,
                            "CHANGE_DATETIME":modelChange.changeDatetime, "CHANGE_OBJ":modelChange.changeObj,
                            "CHANGE_VAL":modelChange.changeVal, "APPLIED_DATETIME":appliedDatetime},
                        function (result) {
                            if (result.error) {
                                outData.error = result.error;
                                res.send(outData);
                                return;
                            }
                            outData.resultItem = result.resultItem;
                            outData.updateCount = result.updateCount;
                            outData.resultItem.CHANGE_MSG='applied';
                            res.send(outData);
                        })
                });
                return;
            }
            if (result.error) {
                outData.error = result.error;
                res.send(outData);
                return;
            }
            getChangeLogItemByID(req.uuid,ID, function (result) {
                if (result.error) {
                    outData.error = result.error;
                    res.send(outData);
                    return;
                }
                if (result.item) {
                    outData.error = "Change log with ID is already exists";
                    res.send(outData);
                    return;
                }
                database.executeQuery(req.uuid,CHANGE_VAL, function (err) {
                    if (err) {
                        outData.error = err.message;
                        res.send(outData);
                        return;
                    }
                    insertToChangeLog(req.uuid,{"ID":modelChange.changeID,
                            "CHANGE_DATETIME":modelChange.changeDatetime, "CHANGE_OBJ":modelChange.changeObj,
                            "CHANGE_VAL":modelChange.changeVal, "APPLIED_DATETIME":appliedDatetime},
                        function (result) {
                            if (result.error) {
                                outData.error = result.error;
                                res.send(outData);
                                return;
                            }
                            outData.updateCount = result.updateCount;
                            outData.resultItem = result.resultItem;
                            outData.resultItem.CHANGE_MSG='applied';
                            res.send(outData);
                        })
                })
            })
        });
    });
    app.get("/sysadmin/database/getChangeLog", function (req, res) {
        changeLog.getDataForTable({uuid:req.uuid,tableColumns:changeLogTableColumns, identifier:changeLogTableColumns[0].data,
            conditions:req.query,
            order:"CHANGE_DATETIME, CHANGE_OBJ, ID"}, function(result){
            res.send(result);
        });
    });

    app.get("/sysadmin/appModelSettings", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/appModelSettings.html');
    });
    var sysCurrencyTableColumns=[
        {data: "ID", name: "ID", width: 50, type: "text", visible:true},
        {data: "CODE", name: "CODE", width: 120, type: "text"},
        {data: "NAME", name: "NAME", width: 200, type: "text"},
        {data: "NOTE", name: "NOTE", width: 450, type: "text"}
    ];
    //app.get("/sysadmin/appModelSettings/getSysCurrencyDataForTable", function(req, res){
    //    sys_currency.getDataForTable({tableColumns:sysCurrencyTableColumns, identifier:sysCurrencyTableColumns[0].data,
    //        order:"ID", conditions:req.query}, function(result){
    //        res.send(result);
    //    });
    //});
    var sysDocsStatesTableColumns=[
        {data: "ID", name: "ID", width: 200, type: "text", visible:false},
        {data: "ALIAS", name: "ALIAS", width: 120, type: "text"},
        {data: "NAME", name: "NAME", width: 200, type: "text"},
        {data: "NOTE", name: "NOTE", width: 450, type: "text"}
    ];
    //app.get("/sysadmin/appModelSettings/getSysDocumentsStatesDataForTable", function(req, res){
    //    sys_docstates.getDataForTable({tableColumns:sysDocsStatesTableColumns, identifier:sysCurrencyTableColumns[0].data,
    //        order:"ID", conditions:req.query}, function(result){
    //        res.send(result);
    //    });
    //});

    app.get("/sysadmin/logs", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/logs.html');
    });

    var sysLogsTableColumns=[
        {data: "level", name: "Level", width: 100, type: "text"},
        {data: "message", name: "Message", width: 700, type: "text"},
        {data: "timestamp", name: "Timestamp", width: 220, type: "text", datetimeFormat:"DD.MM.YY HH:mm:ss"}
    ];
    app.get('/sysadmin/logs/getDataForTable', function (req, res) {
        var fileDate = req.query.DATE;
        var outData = {};
        outData.columns = sysLogsTableColumns;
        if (!fileDate) {
            res.send(outData);
            return;
        }
        outData.items = [];
        var logFile = path.join(__dirname + "/../../logs/log_file.log." + fileDate);
        try {
            fs.existsSync(logFile);
            var fileDataStr = fs.readFileSync(logFile, "utf8");
        } catch (e) {
            if(e.code== 'ENOENT'){
                log.info("There are no logs for " +fileDate+".");
                outData.error = "There are no logs for " +fileDate+".";
                res.send(outData);
                return;
            }
            log.error("Impossible to read logs! Reason:", e);
            outData.error = "Impossible to read logs! Reason:" + e;
            res.send(outData);
            return;
        }
        var target = '{"level"';
        var pos = 0;
        var strObj;
        var jsonObj;
        while (true) {
            var foundPos = fileDataStr.indexOf(target, pos);
            if (foundPos < 0)break;
            strObj = fileDataStr.substring(foundPos, fileDataStr.indexOf('"}', foundPos) + 2);
            pos = foundPos + 1;
            jsonObj = JSON.parse(strObj);
            if (jsonObj.timestamp) {
                jsonObj.timestamp = moment(new Date(jsonObj.timestamp));
            }
            outData.items.push(jsonObj);
        }
        res.send(outData);
    });

    var importDataModelsTableColumns=[
        {data: "PRIORITY", name: "Priority", width: 65, type: "numeric"},
        {data: "DATA_MODEL_NAME", name: "Data model name", width: 220, type: "text"},
        {data: "DATA_TABLE_NAME", name: "Data table name", width: 220, type: "text"},
        {data: "IMPORT_DATA_TABLE_NAME", name: "import data table name", width: 220, type: "text"},
        {data: "CUR_ROW_COUNT", name: " current row count", width: 65, type: "numeric"},
        {data: "IMPORT_ROW_COUNT", name: "import row count", width: 65, type: "numeric"},
        {data: "RESULT", name: "result", width: 450, type: "text"}
    ];
    /**
     * resultCallback = function(dataModelsListForImport)
     */
    var getDataModelsForImportFormBata1DB= function(validatedDataModels, resultCallback) {
        var dataModelsListForImport= [], i=1;
        for(var dataModelName in validatedDataModels){
            var dataModel=validatedDataModels[dataModelName];
            if(dataModel.sourceType=="table"){
                var importTableName=dataModel.source;
                importTableName= importTableName.replace("sys_sync_POSes","sys_sync_databases");
                importTableName= importTableName.replace("wrh_orders_bata_details","wrh_order_bata_details");
                importTableName= importTableName.replace("wrh_pinvs_products","wrh_pinv_products");
                importTableName= importTableName.replace("wrh_invs_products","wrh_inv_products");
                importTableName= importTableName.replace("wrh_invs_products_wob","wrh_inv_products_wob");
                importTableName= importTableName.replace("wrh_ret_invs_products","wrh_ret_inv_products");
                importTableName= importTableName.replace("wrh_ret_invs_products_wob","wrh_ret_inv_products_wob");
                importTableName= importTableName.replace("wrh_retail_tickets_products","wrh_retail_ticket_products");
                importTableName= importTableName.replace("wrh_retail_tickets_products_wob","wrh_retail_ticket_products_wob");
                importTableName= importTableName.replace("dir_products_types","-");
                importTableName= importTableName.replace("sys_operations","-");
                importTableName= importTableName.replace("wrh_products_r_operations","-");
                dataModelsListForImport.push({ "PRIORITY":i,"DATA_MODEL_NAME":dataModelName,
                    "DATA_TABLE_NAME":dataModel.source, "IMPORT_DATA_TABLE_NAME":importTableName,
                    "CUR_ROW_COUNT":0, "IMPORT_ROW_COUNT":0 });
                i++;
            }
        }
        var setDataModelRowCountCallback= function (ind, dataModelsListForImport, finishedCallback) {
            var dataModelsListItem=dataModelsListForImport[ind];
            if(!dataModelsListItem){
                finishedCallback(dataModelsListForImport);
                return;
            }
            database.selectQuery("select COUNT(1) as ROWCOUNT from "+dataModelsListItem["DATA_TABLE_NAME"],
                function(err, recordset){
                    if(err)dataModelsListItem["RESULT"]="Failed get row count! Reson: "+err.message;
                    else dataModelsListItem["CUR_ROW_COUNT"]=(recordset&&recordset[0])?recordset[0]["ROWCOUNT"]:0;
                    setDataModelRowCountCallback(ind+1, dataModelsListForImport, finishedCallback);
                });
        };
        setDataModelRowCountCallback(0, dataModelsListForImport, function(dataModelsListForImport){
            resultCallback(dataModelsListForImport);
        });
    };
    app.get("/sysadmin/database/getDataModelsForImportData", function (req, res) {
        getDataModelsForImportFormBata1DB(dataModel.getValidatedDataModels(),
            function(dataModelsListForImport){
                res.send({columns:importDataModelsTableColumns,identifier:importDataModelsTableColumns[0].data,
                    items:dataModelsListForImport
                });
            })
    });

    app.post("/sysadmin/database/connectToBata1DB", function (req, res) {
        var connParams = {
            host: getServerConfig().host,
            user: req.body.adminUser,
            password: req.body.adminPassword
        };
        database.mySQLBata1AdminConnection(connParams, function (err) {
            if (err) {
                res.send({error:err.message});
                return;
            }
            res.send({success:"authorized"});
        });
    });

    var getBata1DBDataModelsInfo= function(dataModelsListForImport, resultCallback) {
        var setBata1DataModelRowCountCallback= function (ind, bata1DataModels, bata1DataModelsInfo, finishedCallback) {
            var bata1DataModelName=bata1DataModels[ind];
            if(!bata1DataModelName){
                finishedCallback(bata1DataModelsInfo);
                return;
            }
            if(bata1DataModelName=="-"){
                bata1DataModelsInfo.push({"RESULT":"No data."});
                setBata1DataModelRowCountCallback(ind+1, dataModelsListForImport, bata1DataModelsInfo, finishedCallback);
                return;
            }
            database.selectQueryFromBata1("select COUNT(1) as ROWCOUNT from "+bata1DataModelName,
                function(err, recordset){
                    if(err)bata1DataModelsInfo.push({"RESULT":"Failed get bata1 row count! Reson: "+err.message});
                    else bata1DataModelsInfo.push({"IMPORT_ROW_COUNT":(recordset&&recordset[0])?recordset[0]["ROWCOUNT"]:0});
                    setBata1DataModelRowCountCallback(ind+1, dataModelsListForImport, bata1DataModelsInfo, finishedCallback);
                });
        };
        setBata1DataModelRowCountCallback(0, dataModelsListForImport, [], function(bata1DataModelsInfo){
            resultCallback(bata1DataModelsInfo);
        });
    };
    app.post("/sysadmin/database/getBata1DataModelInfo", function (req, res) {
        var bata1DataModels=req.body;
        getBata1DBDataModelsInfo(bata1DataModels,function(bata1DataModelsInfo){
            res.send(bata1DataModelsInfo);
        })
    });

    var deleteDataFromTable= function (tableName, callback){
        if(!tableName){
            callback("Failed delete! Reason: no table name.");
            return;
        }
        if(tableName=="change_log"||tableName=="dir_products_types"){
            callback("Data model data cannot be deleted!");
            return;
        }
        database.executeQuery(req.uuid,"DELETE FROM "+tableName,
            function(err,updateCount){
                var deletedResult;
                if(err) deletedResult="Failed delete data! Reason:"+err.message;
                else deletedResult="Deleted "+updateCount+" rows.";
                callback(deletedResult);
            });
    };
    var deleteDataFromTables= function (deleteData, index, callback){
        var deleteDataItem=deleteData[index];
        if(!deleteDataItem){
            callback(deleteData);
            return;
        }
        deleteDataFromTable(deleteDataItem["DATA_TABLE_NAME"],
            function(deletedResult){
                deleteDataItem["RESULT"]=deletedResult;
                deleteDataFromTables(deleteData, index-1, callback)
            });
    };
    app.post("/sysadmin/database/deleteDataFromDataModels", function (req, res) {
        var dataModelTablesForDelete=req.body;
        if(!dataModelTablesForDelete){
            res.send({error:"Failed delete data from data model tables! Reason: No data for delete."});
            return;
        }
        var deleteData=[];
        for(var ind in dataModelTablesForDelete) deleteData.push({"DATA_TABLE_NAME":dataModelTablesForDelete[ind]});
        res.connection.setTimeout(0);
        deleteDataFromTables(deleteData, deleteData.length-1,
            function (deletedResult) {
                res.send({resultItems:deletedResult});
            });
    });

    app.post("/sysadmin/database/deleteDataFromDataModel", function (req, res) {
        var dataModelTable=req.body["DATA_TABLE_NAME"];
        res.connection.setTimeout(0);
        deleteDataFromTable(dataModelTable,
            function (deletedResult) {
                res.send({ resultItem:{"RESULT":deletedResult} });
            });
    });
    var selectDataFromBata1DB= function(bata1TableName, resultItem, resultCallback){
        if(bata1TableName=="-"){
            resultItem["RESULT"]="No data.";
            resultCallback(resultItem);
            return;
        }
        database.selectQueryFromBata1("select * from "+bata1TableName+" limit 1",
            function(err, recordset){
                if(err){
                    resultItem["RESULT"]="Failed select data from "+bata1TableName+"! Reason:"+err.message;
                    resultCallback(resultItem);
                    return;
                }
                if(!recordset||recordset.length==0){
                    resultItem["RESULT"]="No data for import in "+bata1TableName;
                    resultCallback(resultItem);
                    return;
                }
                var dataItem=recordset[0], bata1TableColumns=null;
                for(var dataColName in dataItem) {
                    var colName=dataColName;
                    if(colName=="RETAIL_TICKET_PRODUCTS_ID") colName="convert("+colName+", char(200)) as RETAIL_TICKETS_PRODUCTS_ID";
                    else if(colName=="INV_PRODUCTS_ID") colName="convert("+colName+", char(200)) as INVS_PRODUCTS_ID";
                    else if(colName=="RET_INV_PRODUCTS_ID") colName="convert("+colName+", char(200)) as RET_INVS_PRODUCTS_ID";
                    else if(colName=="ID"||colName.indexOf("_ID")>=0) colName="convert("+colName+", char(200)) as "+colName;
                    bata1TableColumns=(!bata1TableColumns)?colName:bata1TableColumns+","+colName;
                }
                database.selectQueryFromBata1("select "+bata1TableColumns+" from "+bata1TableName,
                    function(err, recordset){
                        if(err){
                            resultItem["RESULT"]="Failed select data from "+bata1TableName+"! Reason:"+err.message;
                            resultCallback(resultItem);
                            return;
                        }
                        var bata1TableData=recordset;
                        resultItem["RESULT"]="Selected "+bata1TableData.length+" rows.";
                        resultCallback(resultItem,bata1TableData);
                    });
            });
    };
    var insertDataItemFromBata1DB= function(importTableName, importTableFields, bata1TableDataItem, resultItem ,resultCallback){
        var sqlInsertFieldsList, sqlInsertFieldsValues, insertFieldsValues=[];
        for(var i=0; i<importTableFields.length; i++){
            var importTableFieldName=importTableFields[i];
            var importFieldValue=bata1TableDataItem[importTableFieldName];
            if(importTableName=="dir_products"){
                if(importTableFieldName=="TYPE_ID") importFieldValue=1;
            } else if(importTableName=="wrh_invs"||importTableName=="wrh_ret_invs"){
                if(importTableFieldName=="CURRENCY_ID") importFieldValue=2;
                if(importTableFieldName=="DOCSTATE_ID") importFieldValue=0;
                if(importTableFieldName=="RATE") importFieldValue=33;
            } else if(importTableName=="sys_sync_POSes"){
                if(importTableFieldName=="NAME") importFieldValue=bata1TableDataItem["POS_NAME"];
                if(importTableFieldName=="HOST_NAME") importFieldValue=bata1TableDataItem["STOCK_NAME"];
                if(importTableFieldName=="UNIT_ID") importFieldValue=1;
            }
            sqlInsertFieldsList= (!sqlInsertFieldsList)?importTableFieldName:sqlInsertFieldsList+","+importTableFieldName;
            sqlInsertFieldsValues= (!sqlInsertFieldsValues)?"?":sqlInsertFieldsValues+",?";
            insertFieldsValues.push(importFieldValue);
        }
        database.executeParamsQuery("INSERT INTO "+importTableName+"("+sqlInsertFieldsList+") values("+sqlInsertFieldsValues+")",
            insertFieldsValues,
            function(err,updateCount){
                if(err) {
                    resultItem["FAILED"]++;
                    resultItem["FAILED_MSGS"]=(!resultItem["FAILED_MSGS"])?err.message:resultItem["FAILED_MSGS"]+" "+err.message;
                } else resultItem["INSERTED"]+=updateCount;
                resultCallback(resultItem);
            });
    };
    var insertDataFromBata1DB= function(importTableName, importTableFields, bata1TableData, ind, resultItem ,resultCallback){
        if(importTableName=="change_log"){
            resultItem["RESULT"]+=" Data Model no imported.";
            resultCallback(resultItem);
            return;
        }
        var bata1TableDataItem=bata1TableData[ind];
        if(!bata1TableDataItem){
            resultItem["RESULT"]+=" Inserted "+resultItem["INSERTED"]+" rows.";
            if(resultItem["FAILED"]>0)resultItem["RESULT"]+=" FAILED insert "+resultItem["FAILED"]+" rows.";
            if(resultItem["FAILED_MSGS"]) resultItem["RESULT"]+=" Failed reasons:"+resultItem["FAILED_MSGS"];
            resultCallback(resultItem);
            return;
        }
        if(resultItem["FAILED"]>10){
            resultItem["RESULT"]+=" Process stoped! Many Failures! Inserted "+resultItem["INSERTED"]
                +" rows, FAILED insert "+resultItem["FAILED"]+" rows. Failure messages:"+resultItem["FAILED_MSGS"];
            resultCallback(resultItem);
            return;
        }
        if(importTableName=="wrh_pinvs_products"){
            insertDataItemFromBata1DB("sys_operations", ["ID"], {"ID":bata1TableDataItem["ID"]}, resultItem,
                function(resultItem){
                    insertDataItemFromBata1DB("wrh_products_r_operations", ["OPERATION_ID","PRODUCT_ID","BARCODE","BATCH_NUMBER"],
                        {"OPERATION_ID":bata1TableDataItem["ID"],
                            "PRODUCT_ID":bata1TableDataItem["PRODUCT_ID"],"BARCODE":bata1TableDataItem["BARCODE"],
                            "BATCH_NUMBER":bata1TableDataItem["BATCH_NUMBER"]}, resultItem,
                        function(resultItem){
                            var importPInvsProductsTableFields=[];
                            for (var i = 0; i < importTableFields.length; i++) {
                                var importTableField = importTableFields[i];
                                if(importTableField=="PRODUCT_ID"||importTableField=="BARCODE"||importTableField=="BATCH_NUMBER") continue;
                                importPInvsProductsTableFields.push(importTableField);
                            }
                            insertDataItemFromBata1DB(importTableName, importPInvsProductsTableFields, bata1TableDataItem, resultItem,
                                function(resultItem){
                                    insertDataFromBata1DB(importTableName, importTableFields, bata1TableData, ind+1, resultItem ,resultCallback);
                                });
                        });
                });
            return;
        }
        insertDataItemFromBata1DB(importTableName, importTableFields, bata1TableDataItem, resultItem,
            function(resultItem){
                insertDataFromBata1DB(importTableName, importTableFields, bata1TableData, ind+1, resultItem ,resultCallback);
            });
    };
    app.post("/sysadmin/database/importDataFromBata1DB", function (req, res) {
        var bata1TableName=req.body["IMPORT_DATA_TABLE_NAME"],
            importTableName=req.body["DATA_TABLE_NAME"], importDataModelName=req.body["DATA_MODEL_NAME"];
        var resultItem={"IMPORT_DATA_TABLE_NAME":bata1TableName};
        res.connection.setTimeout(0);
        selectDataFromBata1DB(bata1TableName, resultItem, function(resultItem, bata1TableData){
            if(!bata1TableData){
                res.send({resultItem:resultItem});
                return;
            }
            resultItem["INSERTED"]=0;resultItem["FAILED"]=0;
            var importDataModel=dataModel.getValidatedDataModels()[importDataModelName];
            if(!importDataModel){
                resultItem["RESULT"]+=" FAILED INSERT! Reason: no data model!";
                res.send({resultItem:resultItem});
                return;
            }
            if(!importDataModel.fields){
                resultItem["RESULT"]+=" FAILED INSERT! Reason: no data model fields!";
                res.send({resultItem:resultItem});
                return;
            }
            insertDataFromBata1DB(importTableName, importDataModel.fields, bata1TableData, 0, resultItem,
                function(resultItem){
                    res.send({resultItem:resultItem});
                });
        });
    });
};

