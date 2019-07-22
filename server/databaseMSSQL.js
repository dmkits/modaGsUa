var mssql = require('mssql');
var common=require('./common'), server = require('./server'), log =server.log;

/**
 *{uuid:{user:<user>, connection: <connection> }}
 */
var connections={};

module.exports.getUserConnectionData=function(uuid){
    return connections[uuid];
};
module.exports.cleanConnectionPool=function(){
    for(var i in connections)
        if(connections[i].connection) connections[i].connection=null;
    connections={};
};
/**
 * @param userData = { uuid, login, password }
 * @param callback (err,result), result = { dbUC:<database user connection> }, err = { error, userMessage }
 */
function createNewUserDBConnection(userData, callback){
    var uuid= userData.uuid;
    if(uuid===undefined||uuid===null){                                                              log.error("database createNewUserDBConnection: Failed create new user database connection! Reason:No UUID.");
        callback({error:"Failed create new user database connection! Reason:No UUID."});
        return;
    }
    var dbConfig=server.getSysConfig();
    if(!dbConfig){
        callback({error:"Failed create database system connection! Reason: no server configuration!",
            userMessage:"Не удалось подключиться к базе данных!<br> Нет параметров подключения к базе данных!<br> Обратитесь к системному администратору."});
        return;
    }
    var dbUserConnection = new mssql.ConnectionPool({
        user: userData.login,
        password: userData.password,
        server:   dbConfig.dbHost,
        database: dbConfig.dbName,
        pool: {
            max: 100,
            min: 0/*,
            idleTimeoutMillis: 30000*/
        }
    },function(err){
        var connectionData=connections[uuid];
        if(err){                                                                                    log.error("database createNewUserDBConnection: Failed to create connection for user "+userData.login+" userData.uuid="+userData.uuid+ ". Reason: "+err);
            if(connectionData){
                connectionData.connection=null;
                connectionData.user=userData.login;
            }
            callback({error:err.message,userMessage:err.message});
            return;
        }
        if(!connectionData)
            connections[uuid]={ connection:dbUserConnection, user:userData.login };
        else{
            connectionData.connection=dbUserConnection;
            connectionData.user=userData.login;
        }
        callback(null,{dbUC:dbUserConnection});
    });
}
module.exports.createNewUserDBConnection=createNewUserDBConnection;

var systemConnectionErr=null;
module.exports.getDBSystemConnection=function(){
    var systemConnectionData=connections["systemConnection"];
    return (systemConnectionData)?systemConnectionData.connection:null;
};
/**
 * callback= function(err,result)
 *  result = { dbUC:<database user connection> }, err = { error, userMessage }
 */
function setDBSystemConnection(sysConfig, callback){                                                log.debug("database setDBSystemConnection sysConfig:",sysConfig);
    if(!sysConfig){
        callback({error:"Failed create database system connection! Reason: no server configuration!"});
        return;
    }
    var systemConnectionUUID="systemConnection";
    var systemConnUser= {
        login: sysConfig.dbUser,
        password: sysConfig.dbUserPass,
        uuid: systemConnectionUUID
    };
    createNewUserDBConnection(systemConnUser,function(err,result){
        if(err){                                                                                    log.error("database setDBSystemConnection err:",err);
            systemConnectionErr = err.error;
            callback(err);
            return;
        }
        systemConnectionErr = null;
        callback(null,result);
    });
}
module.exports.setDBSystemConnection=setDBSystemConnection;

function getSystemConnectionErr(){ return systemConnectionErr; }
module.exports.getSystemConnectionErr=getSystemConnectionErr;

function getFieldsTypes(recordset){
    var columns=recordset.columns;
    var fieldsTypes={};
    for (var colName in columns){
        var column=columns[colName];
        if(column.type===mssql.DateTime)fieldsTypes[colName]="datetime";
        else if(column.type===mssql.SmallDateTime)fieldsTypes[colName]="datetime";
        else if(column.type===mssql.VarChar)fieldsTypes[colName]="varchar";
        else if(column.type===mssql.Bit)fieldsTypes[colName]="bit";
        else if(column.type===mssql.Int)fieldsTypes[colName]="integer";
        else if(column.type===mssql.Numeric)fieldsTypes[colName]="numeric";
        else fieldsTypes[colName]="unknown";
    }
    return fieldsTypes;
}
/**
 * for MS SQL database select query
 * query= <MS SQL select query string>
 * callback = function(err, recordset, rowsCount, fieldsTypes)
 */
function selectQuery(connection,query, callback) {                                                  log.debug("database selectQuery query:",query);
    if(!connection){
        if(callback)callback({message:"No user database connection is specified."});
        return;
    }
    var request = new mssql.Request(connection);
    request.query(query,function(err, result){
        if(err){                                                                                    log.error('database: selectQuery error:',err.message, {});
            callback(err); return;
        }
        callback(null, result.recordset, result.rowsAffected.length, getFieldsTypes(result.recordset));
    });
}
module.exports.selectQuery=selectQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL insert/update/delete query string>
 * callback = function(err, updateCount)
 */
module.exports.executeQuery=function(connection,query,callback){                                    log.debug("database executeQuery:",query);
    if(!connection){
        callback({message:"No user database connection is specified."});
        return;
    }
    var request = new mssql.Request(connection);
    request.query(query,function(err,result){
        if(err){                                                                                    log.error('database: executeQuery error:',err.message,{});
            callback(err); return;
        }
        callback(null, result.rowsAffected[result.rowsAffected.length-1]);
    });
};
/**
 * for MS SQL database select query
 * query= <MS SQL select query string>
 * callback = function(err, recordset, rowsCount, fieldsTypes)
 */
function selectParamsQuery(connection,query, parameters, callback) {                                log.debug("database selectParamsQuery query:",query," parameters:",parameters,{});
    if(!connection){
        callback({message:"No user database connection is specified."});
        return;
    }
    var request = new mssql.Request(connection);
    for(var i in parameters)request.input('p'+i,parameters[i]);
    request.query(query,function(err,result){
        if(err){                                                                                    log.error('database: selectParamsQuery error:',err.message,{});
            callback(err); return;
        }
        callback(null, result.recordset, result.rowsAffected.length, getFieldsTypes(result.recordset));
    });
}
module.exports.selectParamsQuery=selectParamsQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL insert/update/delete query string>
 * paramsValueObj = {<paramName>:<paramValue>,...}
 * callback = function(err, updateCount)
 */
module.exports.executeParamsQuery= function(connection, query, parameters, callback) {              log.debug("database executeParamsQuery:",query,parameters);
    if(!connection){
        callback({message:"No user database connection is specified."});
        return;
    }
    var request = new mssql.Request(connection);
    for(var i in parameters)request.input('p'+i,parameters[i]);
    request.query(query,function(err,result){
        if(err){                                                                                    //log.error('database: executeParamsQuery error:',err.message,err.precedingErrors,{});//test
            var precedingErrors= err.precedingErrors, sMsg=null, sErr="";
            for(var prErrNum in precedingErrors){
                var prErrItem= precedingErrors[prErrNum], sReqErrMsg= prErrItem.message,
                    sReqErrProcName= prErrItem.procName,sReqErrLineNumber= prErrItem.lineNumber;    //log.error('database: executeParamsQuery error info:',sReqErrMsg,sReqErrProcName,sReqErrLineNumber,prErrItem,{});//test
                sMsg=((!sMsg)?"":sMsg+"\n")+sReqErrMsg;
                sErr=((!sErr)?"":sErr+"\n")+sReqErrMsg+((sReqErrProcName)?" Error in "+sReqErrProcName:"")+((sReqErrLineNumber)?", in line "+sReqErrLineNumber:"");
            }
            var qErr= {message:sMsg||err.message, error:sErr||err.message};                         log.error('database: executeParamsQuery error:',qErr,{});//test
            callback(qErr);
            return;
        }                                                                                           log.debug('database: executeParamsQuery result:',result,result.rowsAffected[result.rowsAffected.length-1],{});//test
        callback(null, result.rowsAffected[result.rowsAffected.length-1]);
    });
};