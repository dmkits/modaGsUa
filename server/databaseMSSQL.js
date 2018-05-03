
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

module.exports.getConnData=function(){
    return connections;
};
/**
 * @param userData
 * @param callback (err,uuid)
 */
module.exports.connectWithPool=function(userData, callback){
    if (connections && connections[userData.uuid]
        && connections[userData.uuid].connection){
        callback(null,{uuid:uuid});
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
        var uuid=common.getUIDNumber();
            dbConnectError=null;
            connections[uuid]={};
            connections[uuid].connection=pool;
            connections[uuid].user=userData.login;
            callback(null,{uuid:uuid})
    });
};
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
//selectQuery
function selectMSSQLQuery(uuid,query, callback) {                                                   log.info("database selectMSSQLQuery query:",query);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    request.query(query,
        function(err, result) {
            if (err) {
                if(err.name=="ConnectionError")dbConnectError=err.message;                          log.error('database: selectMSSQLQuery error:',err.message, {});
                callback(err);
                return;
            }                                                               console.log('selectMSSQLQuery result.recordset=', result.recordset, result.recordset.columns, result.recordset.columns.first, {});
            callback(null, result.recordset, result.rowsAffected.length, getFieldsTypes(result.recordset));
        });
}
module.exports.selectMSSQLQuery=selectMSSQLQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL queryStr>
 * callback = function(err, updateCount)
 */
module.exports.executeMSSQLQuery=function(uuid,query,callback){                                      log.debug("database executeMSSQLQuery:",query);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    request.query(query,
        function(err,result){
            if(err){
                if(err.name=="ConnectionError")dbConnectError=err.message;
                log.error('database: executeMSSQLQuery error:',err.message,{});
                callback(err);
                return;
            }
            callback(null, result.rowsAffected.length);
        });
};
function selectParamsMSSQLQuery(uuid,query, parameters, callback) {                                      log.debug("database selectParamsMSSQLQuery query:",query," parameters:",parameters,{});
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    for(var i in parameters){
        request.input('p'+i,parameters[i]);
    }
    request.query(query,
        function (err, result) {
            if (err) {                                                                                 log.error('database: selectParamsMSSQLQuery error:',err.message,{});
                if(err.name=="ConnectionError")dbConnectError=err.message;
                callback(err);
                return;
            }
            callback(null, result.recordset ,result.rowsAffected.length, getFieldsTypes(result.recordset));
        });
}
module.exports.selectParamsMSSQLQuery=selectParamsMSSQLQuery;
/**
 * for MS SQL database query insert/update/delete
 * query= <MS SQL queryStr>
 * paramsValueObj = {<paramName>:<paramValue>,...}
 * callback = function(err, updateCount)
 */
module.exports.executeParamsMSSQLQuery= function(uuid, query, parameters, callback) {                 log.debug("database executeMSSQLParamsQuery:",query,parameters);
    var connection=connections[uuid].connection;
    var request = new mssql.Request(connection);
    for(var i in parameters){
        request.input('p'+i,parameters[i]);
    }
    request.query(query,
        function (err, result) {
            if (err) {                                                                          log.error('database: executeMSSQLParamsQuery error:',err.message,{});//test
                callback(err);
                return;
            }                                                                                   log.debug('database: executeMSSQLParamsQuery recordset:',result.recordset,{});//test
            callback(null, result.rowsAffected.length);
        });
};



