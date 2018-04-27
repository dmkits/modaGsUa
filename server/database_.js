var fs = require('fs'), child_process = require('child_process'), path=require('path'), mysql= require('mysql');
var server = require('./server'), log =server.log;

function getDBConfig(){
    var serverConfig= server.getServerConfig();
    return { server:serverConfig.host, database:serverConfig.database, user:serverConfig.user, password:serverConfig.password,
        supportBigNumbers:true };
}

var connection=null, dbConnectError=null, connectionBata1=null;

function databaseConnection(callback){                                                                      log.info("database databaseConnection dbConfig:", getDBConfig());
    if(!connection) {
        connection = mysql.createConnection(getDBConfig());
        connection.connect(function (err) {
            if (err) {                                                                                      log.error("database databaseConnection connect err=", err.message);
                callback(err.message);
                return;
            }
            callback(null, "connected");
        });
        return;
    }
    connection.destroy();
    connection = mysql.createConnection(getDBConfig());
    connection.connect(function (err) {
        if (err) {                                                                                          log.error("database connect error:",err.message);
            callback(err.message);
            return;
        }
        callback(null, "connected");
    });
}
module.exports.databaseConnection=databaseConnection;

function tryDBConnect(postaction) {                                                                         log.info('database tryDBConnect...');//test
    databaseConnection(function (err) {
        dbConnectError = null;
        if (err) {
            dbConnectError = "Failed to connect to database! Reason:" + err;                                log.error('database tryDBConnect DBConnectError=', dbConnectError);//test
        }
        if (postaction)postaction(err);
    });
}
module.exports.tryDBConnect=tryDBConnect;
if (getDBConfig()) tryDBConnect();
module.exports.getDBConnectError= function(){ return dbConnectError; };

module.exports.mySQLAdminConnection = function (connParams, callback) {                                     log.info("database mySQLAdminConnection connParams=",connParams);
    if(!connParams){
        callback({message:"Failed connect to database! Reason: no parameters!"});
        return;
    }
    if(!connParams.host||connParams.host.trim()==""){
        callback({message:"Failed connect to database! Reason: no host!"});
        return;
    }
    if(!connParams.user||connParams.user.trim==""){
        callback({message:"Failed connect to database! Reason: no user!"});
        return;
    }
    if (connection) connection.destroy();
    connection = mysql.createConnection(connParams);
    connection.connect(function (err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, "connected");
    });
};

module.exports.mySQLBata1AdminConnection = function (connParams, callback) {                                log.info("database mySQLAdminConnection connParams=",connParams);
    if(!connParams){
        callback({message:"Failed connect to database! Reason: no parameters!"});
        return;
    }
    if(!connParams.host||connParams.host.trim()==""){
        callback({message:"Failed connect to database! Reason: no host!"});
        return;
    }
    if(!connParams.user||connParams.user.trim==""){
        callback({message:"Failed connect to database! Reason: no user!"});
        return;
    }
    connParams.database="bata1";
    if (connectionBata1) connectionBata1.destroy();
    connectionBata1 = mysql.createConnection(connParams);
    connectionBata1.connect(function (err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, "connected");
    });
};

module.exports.checkIfDBExists = function (DBName, callback) {
    connection.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" +DBName + "'",
        function (err, recordset) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, recordset);
        });
};

module.exports.createNewDB= function(DBName,callback) {
    connection.query('CREATE SCHEMA '+DBName,
        function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, DBName+" Database created!");
        });
};

module.exports.checkIfUserExists= function(newUserName,callback) {
    connection.query("select * from mysql.user where user='"+newUserName+"'",
        function (err, recordset) {
            if (err) {
                callback(err);
                return;
            }
            callback(null,recordset);
        });
};

module.exports.createNewUser= function(host,newUserName,newUserPassword,callback) {
    connection.query("CREATE USER '"+newUserName+"'@'"+host+"' IDENTIFIED BY '"+newUserPassword+"'",
        function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null,"User "+ newUserName+" created!");
        });
};

module.exports.grantUserAccess= function(host,userName,newDBName,callback) {
    var strQuery="GRANT ALL PRIVILEGES ON "+newDBName+".* TO '"+userName+"'@'"+host+"' WITH GRANT OPTION";
    connection.query(strQuery,
        function (err ) {
            if (err) {
                callback(err);
                return;
            }
            callback(null,userName+" granted privileges!");
        });
};

module.exports.dropDB= function(DBName,callback) {
    connection.query("DROP DATABASE "+ DBName,
        function (err ) {
            if (err) {
                callback(err);
                return;
            }
            callback(null,DBName+" dropped!");
        });
};

module.exports.isDBEmpty= function(DBName,callback) {
    connection.query("SELECT table_name FROM information_schema.tables where table_schema='"+DBName+"'",
        function (err,recordset ) {
            if (err) {
                callback(err);
                return;
            }
            callback(null,recordset[0]);
        });
};

/**
 * backupParam = {host, database, fileName, user, password,  onlyData:true/false}
 * default onlyData=false
 */
module.exports.backupDB= function(backupParam,callback) {
    var onlyDataCommand=
        (backupParam.onlyData==='true') ? " --no-create-info   --ignore-table="+backupParam.database+".change_log" : " ";
    var backupDir=__dirname+'/../backups/';
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir);
    }
    var filePath=path.join(backupDir+backupParam.fileName);
    var command ='mysqldump'+onlyDataCommand + ' -u '+ backupParam.user + ' --password="'+backupParam.password+
        '" --host='+backupParam.host +' '+backupParam.database+' --result-file='+filePath;                  log.debug("database.backupDB command=",command);

    child_process.exec(command, function(err,stdout,stderr){
        if(err){                                         log.error("err backupDB=", err);
            callback(err);
            return;
        }
        if(stdout){
            log.info("stdout backupDB=",stdout);
        }
        if(stderr && stderr.indexOf("Warning")<0){       log.error("stderr backupDB=",stderr);
            callback(stderr);
            return;
        }
        callback(null,"Database "+backupParam.database+" backup saved to "+backupParam.fileName);
    });
};
/**
 * restoreParams = {host, database, fileName, user, password}
 * default onlyData=false
 */
module.exports.restoreDB= function(restoreParams,callback) {
    var filePath=path.join(__dirname+'/../backups/'+restoreParams.fileName);
    var command ='mysql -u '+restoreParams.user+' --password="'+restoreParams.password+
        '" -h '+restoreParams.host+' '+restoreParams.database+' < '+ filePath;                              log.debug("database.restoreDB command=",command);
    child_process.exec(command, function(err,stdout,stderr){
        if(err){                                                                                            log.error("database.restoreDB error=", err);
            callback(err);
            return;
        }
        if(stdout){
            log.info("stdout restoreDB=",stdout);
        }
        if(stderr && stderr.indexOf("Warning")<0){                                                          log.error("database.restoreDB stderr=",stderr);
            callback(stderr);
            return;
        }
        callback(null,"Database "+restoreParams.database+" restored successfully!");
    });
};

/**
 * for database query insert/update/delete
 * callback = function(err, updateCount)
 */
module.exports.executeQuery= function(query, callback) {                                                    log.debug("database executeQuery:",query);
    connection.query(query,
        function (err, recordset, fields) {
            if (err) {                                                                                      log.error("database executeQuery err=",err.message);
                callback(err);
                return;
            }
            callback(null, recordset.affectedRows);
        });
};
/**
 * for database query insert/update/delete
 * parameters = [ <value1>, <value2>, ...] - values for replace '?' in query
 * callback = function(err, updateCount)
 */
module.exports.executeParamsQuery= function(query, parameters, callback) {                                  log.debug("database executeParamsQuery:",query,parameters);
    connection.query(query, parameters,
        function (err, recordset, fields) {
            if (err) {                                                                                      log.error("database executeParamsQuery err=",err.message);
                callback(err);
                return;
            }
            callback(null, recordset.affectedRows);
        });
};
/**
 * for database query select
 * callback = function(err, recordset, count, fields)
 */
module.exports.selectQuery= function(query, callback) {                                                     log.debug("database selectQuery query:",query);
    connection.query(query,
        function (err, recordset, fields) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, recordset, recordset.affectedRows, fields);
        });
};
/**
 * for database query select
 * parameters = [ <value1>, <value2>, ...] - values for replace '?' in query
 * callback = function(err, recordset, count, fields)
 */
module.exports.selectParamsQuery= function(query, parameters, callback) {                                   log.debug("database selectParamsQuery query:",query," parameters:",parameters,{});
    connection.query(query, parameters,
        function (err, recordset, fields) {
            if (err) {
                callback(err);
                return;
            }                                                                                               //log.debug('database: selectParamsQuery:',recordset,{});//test
            callback(null, recordset, recordset.affectedRows, fields);
        });
};

/**
 * for database query select
 * callback = function(err, recordset, count, fields)
 */
module.exports.selectQueryFromBata1= function(query, callback) {                                            log.debug("database.selectQueryFromBata1 query:",query);
    if(!connectionBata1){
        callback("Failed select query from Bata1 database! Reason: no connection.");
        return;
    }
    connectionBata1.query(query,
        function (err, recordset, fields) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, recordset, recordset.affectedRows, fields);
        });
};

/**
 * callback = function(outData)
 */
function getDataItemsFromDatabase(dbQuery, outData, resultItemName, callback){
    exports.selectQuery(dbQuery,function(err, recordset){
        if (err) {                                                                                          log.error("database.getDataItemsFromDatabase err=",err.message);
            outData.error= err.message;
            callback(outData);
            return;
        }
        outData[resultItemName]= recordset;
        callback(outData);
    })
}
module.exports.getDataItemsFromDatabase=getDataItemsFromDatabase;

/**
 * callback = function(outData)
 */
function getDataItemFromDatabase(dbQuery, outData, resultItemName, callback){
    exports.selectQuery(dbQuery,function(err, recordset){
        if (err) {                                                                                          log.error("database.getDataItemFromDatabase err=",err.message);
            outData.error= err.message;
            callback(outData);
            return;
        }
        outData[resultItemName]= recordset[0];
        callback(outData);
    })
}
module.exports.getDataItemFromDatabase=getDataItemFromDatabase;

module.exports.getDatabasesForUser= function(user,pswd,callback) {
    var dbListForUserConfig = {
        host: getDBConfig().host,
        user: user,
        password:pswd
    };
    var dbListForUserConn = mysql.createConnection(dbListForUserConfig);
    dbListForUserConn.connect(function (err) {
        if (err) {                                                                                          log.error("database.getDatabasesForUser connect error:",err.message);
            callback(err.message);
            return;
        }
        dbListForUserConn.query("SHOW DATABASES",
            function (err,dbList) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null,dbList,user);
                dbListForUserConn.destroy();
            });
    });
};
