var path = require('path'), fs = require('fs');
var server=require('../server'), getLoadInitModulesError=server.getLoadInitModulesError;
var log = server.log;
var appParams=server.getAppStartupParams(), getServerConfig=server.getServerConfig, setAppConfig=server.setAppConfig, getConfig=server.getConfig;
var loadServerConfiguration=server.loadServerConfiguration;

var common=require('../common'), database=require('../databaseMSSQL');
var appModules=require(appModulesPath), getValidateError=appModules.getValidateError;
var moment=require('moment') /*dateFormat = require('dateformat'), cron = require('node-cron'), moment = require('moment')*/;

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
        database.selectQuery(database.getDBSystemConnection(),
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
        common.saveConfig(appParams.mode+".cfg", newServerConfig,
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
    var getChangeLogItemByID= function(id, resultCallback) {
        changeLog.getDataItem(database.getDBSystemConnection(),{conditions:{"ID=":id} }, resultCallback);
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
    var matchLogData=function(changesData, outData, ind, callback){
        var changeData = changesData?changesData[ind]:null;
        if (!changeData) {
            callback(outData);
            return;
        }
        getChangeLogItemByID(changeData.changeID, function (result) {
            if (result.error) {
                outData.error = "ERROR FOR ID:"+changeData.changeID+" Error msg: "+result.error;
                matchLogData(null, outData, ind+1, callback);
                return;
            }
            if (!result.item) {
                changeData.type = "new";
                changeData.message = "not applied";
                outData.items.push(changeData);
                matchLogData(changesData, outData, ind+1,callback);
                return;
            }
            if (!matchChangeLogFields(changeData,result.item)){
                changeData.type = "warning";
                changeData.message = "Current update has not identical fields in change_log!";
                outData.items.push(changeData);
                matchLogData(changesData, outData, ind+1,callback);
            } else {
                matchLogData(changesData, outData, ind+1,callback);
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
        checkIfChangeLogExists(function(tableData) {
            if (tableData.error&&  tableData.error.indexOf("Invalid object name")>=0) {  log.info("668   checkIfChangeLogExists resultCallback tableData.error:",tableData.error,tableData);
                outData.noTable = true;
                var arr=dataModel.getModelChanges();
                var items=common.sortArray(arr);
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
            var logsData= common.sortArray(arr);
            matchLogData(logsData, outData, 0, function(outData){
                res.send(outData);
            });
        });
    });
    /**
     * resultCallback = function(result={ item, error, errorCode })
     */
    var checkIfChangeLogExists= function(resultCallback) {
        changeLog.getDataItems(database.getDBSystemConnection(), {conditions:{"ID IS NULL":null}}, resultCallback);
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
    var insertToChangeLog= function(itemData, resultCallback) {
        changeLog.insTableDataItem(database.getDBSystemConnection(),{tableColumns:changeLogTableColumns,idFieldName:"ID", insTableData:itemData}, resultCallback);
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
        checkIfChangeLogExists(function(result) {
           // if (result.error && (result.errorCode == "ER_NO_SUCH_TABLE")) {
            if (result.error&&  result.error.indexOf("Invalid object name")>=0) {  log.info("checkIfChangeLogExists  tableData.error:",result.error);
                database.executeQuery(database.getDBSystemConnection(),CHANGE_VAL, function (err) {
                    if (err) {
                        outData.error = err.message;
                        res.send(outData);
                        return;
                    }
                    insertToChangeLog({"ID":modelChange.changeID,
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
            getChangeLogItemByID(ID, function (result) {
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
                database.executeQuery(database.getDBSystemConnection(),CHANGE_VAL, function (err) {
                    if (err) {
                        outData.error = err.message;
                        res.send(outData);
                        return;
                    }
                    insertToChangeLog({"ID":modelChange.changeID,
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
        changeLog.getDataForTable(database.getDBSystemConnection(),
            {tableColumns:changeLogTableColumns, identifier:changeLogTableColumns[0].data, conditions:req.query,
                order:"CHANGE_DATETIME, CHANGE_OBJ, ID"}, function(result){
            res.send(result);
        });
    });

    app.get("/sysadmin/appModelSettings", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/appModelSettings.html');
    });

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
};

