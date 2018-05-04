
var mssql = require('mssql');   console.log('module for databaseMSSQL.js mssql');
var common=require('./common');
var server = require('./server');
var log =server.log;
var dbConnectError=null;

function getDBConfig(){
    var serverConfig= server.getServerConfig();
    return { host:serverConfig.host, database:serverConfig.database, user:serverConfig.user, password:serverConfig.password,
        supportBigNumbers:true };
}
module.exports.getDBConnectError= function(){ return dbConnectError; };
/**
 *{uuid:{user:<user>, connection: <connection> }}
 */
var connections={};

console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DATABASE=');

module.exports.getConnData=function(){
    return connections;
};
/**
 * @param userData
 * @param callback (err,uuid)
 */
function connectWithPool(userData, callback){
    if (connections && connections[userData.uuid]
        && connections[userData.uuid].connection){
        callback(null,{uuid:userData.uuid});
        return;
    }
    var pool = new mssql.ConnectionPool({
        user: userData.login,
        password: userData.password,
        server:   getDBConfig().host,
        database: getDBConfig().database
    }, function(err){
        if(err){
            dbConnectError=err.message;
            callback(err.message);
            return;
        }
        var uuid=userData.uuid=="systemConnection"?"systemConnection":common.getUIDNumber();
        dbConnectError=null;
        connections[uuid]={};
        connections[uuid].connection=pool;
        connections[uuid].user=userData.login;
        callback(null,{uuid:uuid})
    });
};
module.exports.connectWithPool=connectWithPool;
function setSystemConnection(callback){
    var dbConfig=getDBConfig();
    if(dbConfig){
        var systemConnUser= {
            login: dbConfig.user,
            password: dbConfig.password,
            uuid: "systemConnection"
        };
        if(connections["systemConnection"]
            &&connections["systemConnection"].connection){
            connections["systemConnection"].connection.close();
            connections["systemConnection"].connection=null;
        }
        connectWithPool(systemConnUser,function(err){
            if(err) {
                dbConnectError = err;
                callback(err);
                return;
            }
            dbConnectError = null;
            callback()
        });
    }
}
module.exports.setSystemConnection=setSystemConnection;

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
function selectQuery(uuid,query, callback) {                                                   log.info("database selectQuery query:",query);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    request.query(query,
        function(err, result) {
            if (err) {
                if(err.name=="ConnectionError")dbConnectError=err.message;                          log.error('database: selectQuery error:',err.message, {});
                callback(err);
                return;
            }                                                               console.log('selectQuery result.recordset=', result.recordset, result.recordset.columns, result.recordset.columns.first, {});
            callback(null, result.recordset, result.rowsAffected.length, getFieldsTypes(result.recordset));
        });
}
module.exports.selectQuery=selectQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL queryStr>
 * callback = function(err, updateCount)
 */
module.exports.executeQuery=function(uuid,query,callback){                                      log.debug("database executeQuery:",query);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    request.query(query,
        function(err,result){
            if(err){
                if(err.name=="ConnectionError")dbConnectError=err.message;
                log.error('database: executeQuery error:',err.message,{});
                callback(err);
                return;
            }
            callback(null, result.rowsAffected.length);
        });
};
function selectParamsQuery(uuid,query, parameters, callback) {                                      log.debug("database selectParamsQuery query:",query," parameters:",parameters,{});
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    for(var i in parameters){
        request.input('p'+i,parameters[i]);
    }
    request.query(query,
        function (err, result) {
            if (err) {                                                                                 log.error('database: selectParamsQuery error:',err.message,{});
                if(err.name=="ConnectionError")dbConnectError=err.message;
                callback(err);
                return;
            }
            callback(null, result.recordset ,result.rowsAffected.length, getFieldsTypes(result.recordset));
        });
}
module.exports.selectParamsQuery=selectParamsQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL queryStr>
 * paramsValueObj = {<paramName>:<paramValue>,...}
 * callback = function(err, updateCount)
 */
module.exports.executeParamsQuery= function(uuid, query, parameters, callback) {                 log.debug("database executeParamsQuery:",query,parameters);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    for(var i in parameters){
        request.input('p'+i,parameters[i]);
    }
    request.query(query,
        function (err, result) {
            if (err) {                                                                          log.error('database: executeParamsQuery error:',err.message,{});//test
                callback(err);
                return;
            }                                                                                   log.debug('database: executeParamsQuery recordset:',result.recordset,{});//test
            callback(null, result.rowsAffected.length);
        });
};


