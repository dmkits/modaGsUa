var path = require('path'), fs = require('fs');
var server=require('../server'), getLoadInitModulesError=server.getLoadInitModulesError;
var log = server.log;
var appParams=server.getAppStartupParams(), getServerConfig=server.getServerConfig, setAppConfig=server.setAppConfig, getConfig=server.getConfig;
var loadServerConfiguration=server.loadServerConfiguration;

var common=require('../common'), database=require('../databaseMSSQL');
var appModules=require(appModulesPath), getValidateError=appModules.getValidateError;
var moment=require('moment') /*dateFormat = require('dateformat'), cron = require('node-cron'), moment = require('moment')*/;

var dataModel=require('../datamodel');
var changeLog= require(appDataModelPath+"change_log"),
    r_Users= require(appDataModelPath+"r_Users"),r_Emps= require(appDataModelPath+"r_Emps"),r_Uni= require(appDataModelPath+"r_Uni"),
    sysusers=require(appDataModelPath+"sysusers"), sys_server_principals=require(appDataModelPath+"sys_server_principals");

module.exports.validateModule = function(errs, nextValidateModuleCallback){
    dataModel.initValidateDataModels([changeLog,r_Users,r_Emps,r_Uni,sysusers,sys_server_principals], errs,
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

    app.get("/sysadmin/logins", function (req, res) {
        res.sendFile(appViewsPath+'sysadmin/logins.html');
    });
    var userVisiblePass="****************",
        loginsTableColumns=[
            {data: "UserID", name: "UserID", width: 200, type: "text", readOnly:true, visible:false},
            {data: "UserName", name: "User name", width: 250, type: "text", readOnly:true},
            {data: "EmpName", name: "Employee name", width: 300, type: "text", readOnly:true,
            dataSource:"r_Emps",linkCondition:"r_Emps.EmpID=r_Users.EmpID"},
            {data: "EmpID", name: "EmpID", width: 120, dataSource:"r_Emps", visible:false},
            {data: "ShiftPostID", name: "User role", width: 120, dataSource:"r_Emps", visible:false},
            {data: "ShiftPostName", name: "User role", width: 120,
                dataSource:"r_Uni", sourceField:"RefName", linkCondition:"r_Uni.RefTypeID=10606 and r_Uni.RefID=r_Emps.ShiftPostID",
                type: "combobox", sourceURL:"/sysadmin/logins/getDataForUserRoleCombobox"},
            {data: "suname", name: "DB User Name", width: 250, type: "text", readOnly:true,
                childDataSource:"sysusers", sourceField:"name",
                childLinkCondition:"sysusers.islogin=1 and (sysusers.name=r_Users.UserName or (sysusers.Name='dbo' and r_Users.UserName='sa'))"},
            {data: "login", name: "login", width: 150, type: "text", readOnly:true,
                childDataSource:"sys.server_principals", sourceField:"name",
                childLinkCondition:"sys.server_principals.type in ('S','U') and sys.server_principals.sid=sysusers.sid"},
            {data: "lPass", name: "Password", width: 150, type: "text",
                dataSource:"sys.server_principals", dataFunction:"CASE When sys.server_principals.sid is Null Then '' else '"+userVisiblePass+"' END"},
            {data: "is_disabled", name: "Disabled", width: 75, type: "checkboxMSSQL",
                dataSource:"sys.server_principals", sourceField:"is_disabled"}
    ];
    app.get('/sysadmin/logins/getLoginsDataForTable', function (req, res) {
        r_Users.getDataForTable(req.dbUC,{tableColumns:loginsTableColumns, identifier:loginsTableColumns[0].data,
                conditions:{"1=1":null}, order:"UserID"},
            function(result){
                res.send(result);
            });
    });
    app.get('/sysadmin/logins/getDataForUserRoleCombobox', function(req,res){  //ShiftPostID
        r_Uni.getDataItemsForTableCombobox(req.dbUC,{ comboboxFields:{"ShiftPostName":"RefName","ShiftPostID":"RefID" },
                source:"r_Uni",fields:["RefID","RefName"],
                order:"RefName",
                conditions:{"RefTypeID=":10606}},
            function(result){
                res.send(result);
            });
    });
    /**
     * callback = function(result,login,lpass,suname)
     */
    r_Users.checkLoginPassDBUser= function(dbUC,loginData,callback){
        var result={};
        var login= loginData["login"],lpass= loginData["lPass"],suname=loginData["suname"];
        if(!suname||suname.trim().length==0) suname=loginData["UserName"];
        if(!login||login.trim().length==0) login=suname;
        if(!login||login.trim().length==0) {
            result.error="Failed create login! Reason: no login op login is empty!";
            result.userErrorMsg="Невозможно создать имя входа! Имя входа не указано или пустое!";
        } else if(login.indexOf("\\")>=0){
            result.error="Failed create login! Reason: cannot create login for type 'WINDOWS_LOGIN'! This function cannot support.";
            result.userErrorMsg="Не удалось создать или изменить данные имени входа! Создание или изменение имен входа для аутентификации windows не поддерживается!";
        } else if(!lpass||lpass.trim().length==0) {
            result.error="Failed create login! Reason: no password op password is empty!";
            result.userErrorMsg="Невозможно созать или изменить пароль для имени входа! Не указан пароль или пароль пустой!";
        }
        callback(result,login,lpass,suname);
    };
    /**
     * callback = function(result)
     */
    r_Users.getLoginData= function(dbUC,loginData,storeResult,callback){
        r_Users.getDataItemForTable(dbUC,{tableColumns:loginsTableColumns,conditions:{"UserID=":loginData["UserID"]}},
            function(result){
                if(result.error) storeResult.error="Failed get result inserted data item! Reason:"+result.error;
                if (result.item) storeResult.resultItem= result.item;
                callback(storeResult);
            })
    };
    /**
     * callback = function(result)
     */
    r_Users.createLoginIfNotExists= function(dbUC,loginData,login,lpass,suname,callback){
        /* create login kassir12 WITH PASSWORD = 'QWErty123QWErty123QWErty123'*/
        sys_server_principals.getDataItems(dbUC,{fields:["name","type"],conditions:{"name=":login}},function(result){
            if(result.error){
                var resultCreateLogin={};
                resultCreateLogin.error="Failed create login! Reason: cannot check if login exists!";
                resultCreateLogin.userErrorMsg="Не удалось создать имя входа! Не удалось проверить существование имени входа!";
                callback(resultCreateLogin);
                return;
            }
            var resultItems=result.items;
            if(!resultItems||resultItems.length==0){
                database.executeQuery(dbUC,"create login "+login+" WITH PASSWORD = '"+lpass+"'",function(err, updateCount){
                    if(err){
                        var resultCreateLogin={};
                        resultCreateLogin.error="Failed create login! Reason: password no strong!";
                        resultCreateLogin.userErrorMsg="Не удалось создать имя входа! Пароль не удовлетворяет политике безопастности сервера!";
                        callback(resultCreateLogin);
                        return;
                    }
                    callback({});
                });
                return;
            }
            callback({});
        });
    };
    /**
     * callback = function(result)
     */
    r_Users.createDBUserIfNotExists= function(dbUC,loginData,login,lpass,suname,callback){
        /* CREATE USER kassir5 FOR LOGIN kassir5	--exec sp_grantdbaccess 'kassir5', 'kassir5' */
        sysusers.getDataItems(dbUC,{fields:["name"],conditions:{"islogin=":1,"name=":suname}},function(result) {
            if (result.error) {
                var resultCreateDBUser = {};
                resultCreateDBUser.error = "Failed create dbuser! Reason: cannot check if dbuser exists!";
                resultCreateDBUser.userErrorMsg = "Не удалось создать пользователя базы данных! Не удалось проверить существование пользователя базы данных!";
                callback(resultCreateDBUser);
                return;
            }
            if(!result.items||result.items.length==0){
                database.executeQuery(dbUC,"CREATE USER "+suname+" FOR LOGIN "+login,function(err, updateCount){
                    if(err){
                        var resultCreateDBUser={};
                        resultCreateDBUser.error="Failed create dbuser! Reason: cannot create dbuser for login'"+login+"'!";
                        resultCreateDBUser.userErrorMsg="Не удалось создать пользователя базы данных! Не удалось создать пользователя базы данных для имени входа '"+login+"'!";
                        callback(resultCreateDBUser);
                        return;
                    }
                    callback({});
                });
                return;
            }
            callback({});
        });
    };
    /**
     * callback = function(result)
     */
    r_Users.updateLoginDBUser= function(dbUC,loginData,login,lpass,suname,callback){
        /* alter login kassir12 WITH PASSWORD = 'Kassir321'
         exec sp_addrolemember 'db_ddladmin', 'kassir12'
         exec sp_addrolemember 'db_owner', 'kassir12'
         ALTER LOGIN kassir12 WITH CHECK_POLICY=ON,CHECK_EXPIRATION=ON
         go
         EXEC sp_change_users_login 'Update_One', 'kassir12', 'kassir12'
         go */
        database.executeQuery(dbUC,"exec sp_addrolemember 'db_ddladmin', '"+suname+"'",function(err, updateCount){
            database.executeQuery(dbUC,"exec sp_addrolemember 'db_owner', '"+suname+"'",function(err, updateCount){
                database.executeQuery(dbUC,"ALTER LOGIN "+login+" WITH CHECK_POLICY=ON,CHECK_EXPIRATION=ON",function(err, updateCount){
                    database.executeQuery(dbUC,"EXEC sp_change_users_login 'Update_One', '"+suname+"', '"+login+"'",function(err, updateCount){
                        var resultUpdateLoginDBUser={updateCount:1};
                        if(err){
                            resultUpdateLoginDBUser.updateCount=0;
                            resultUpdateLoginDBUser.error="Failed update login! Reason: database user do not map to a login!";
                            resultUpdateLoginDBUser.userErrorMsg="Не удалось сопоставить имя входа с пользователем базы данных!";
                            r_Users.getLoginData(dbUC,loginData,resultUpdateLoginDBUser,callback);
                            return;
                        }
                        if(lpass!=userVisiblePass){
                            database.executeQuery(dbUC,"alter login "+login+" WITH PASSWORD = '"+lpass+"'",function(err, updateCount){
                                if(err){
                                    resultUpdateLoginDBUser.updateCount=0;
                                    resultUpdateLoginDBUser.error="Failed update login password! Reason: password no strong!";
                                    resultUpdateLoginDBUser.userErrorMsg="Не удалось изменить пароль для имени входа! Пароль не удовлетворяет политике безопастности сервера!";
                                }
                                r_Users.getLoginData(dbUC,loginData,resultUpdateLoginDBUser,callback);
                            });
                            return
                        }
                        r_Users.getLoginData(dbUC,loginData,resultUpdateLoginDBUser,callback);
                    });
                });
            });
        });
    };
    /**
     * callback = function(result)
     */
    r_Users.updateUserData= function(dbUC,loginData,login,lpass,suname,callback){
        r_Emps.updDataItem(dbUC,{updData:{"ShiftPostID":loginData["ShiftPostID"]},conditions:{"EmpID=":loginData["EmpID"]}},function(result){
            var resultUpdateUserData={updateCount:1};
            if(result.error){
                resultUpdateUserData.updateCount=0;
                resultUpdateUserData.error="Failed update user emp data! Reason: "+result.error+"!";
                resultUpdateUserData.userErrorMsg="Не удалось изменить данные служащего для пользователя!";
            }
            r_Users.getLoginData(dbUC,loginData,resultUpdateUserData,callback);
        });
    };

    app.post("/sysadmin/logins/storeLoginsTableData", function(req, res){
        var tLoginData=req.body;
        r_Users.checkLoginPassDBUser(req.dbUC,tLoginData,function(result,login,lpass,suname){
            if(result.error){
                res.send(result);
                return;
            }
            r_Users.createLoginIfNotExists(req.dbUC,tLoginData,login,lpass,suname,function(result){                                       console.log("createLogin",result);
                if(result.error){
                    res.send(result);
                    return;
                }
                r_Users.createDBUserIfNotExists(req.dbUC,tLoginData,login,lpass,suname,function(result){                                       console.log("createLogin",result);
                    if(result.error){
                        res.send(result);
                        return;
                    }
                    r_Users.updateLoginDBUser(req.dbUC,tLoginData,login,lpass,suname,function(result){                                       console.log("createLogin",result);
                        if(result.error){
                            res.send(result);
                            return;
                        }
                        r_Users.updateUserData(req.dbUC,tLoginData,login,lpass,suname,function(result){                                       console.log("createLogin",result);
                            res.send(result);
                        });
                    });
                });
            });
        });
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

